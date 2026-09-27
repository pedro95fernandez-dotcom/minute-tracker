import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import type { Task, Intermediary, Category, HouseholdAnswers } from './types/database';
import { AuthModal } from './components/Auth/AuthModal';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
import { Header } from './components/Dashboard/Header';
import { SummaryCards } from './components/Dashboard/SummaryCards';
import { PromotionBonusCard } from './components/Dashboard/PromotionBonusCard';
import { TaskList } from './components/Tasks/TaskList';
import { NewTaskModal, type InitialTaskData } from './components/Tasks/NewTaskModal';
import { IntermediaryListModal } from './components/Intermediaries/IntermediaryListModal';
import { TeamSettingsModal } from './components/Settings/TeamSettingsModal';
import { TaskAssistantView } from './components/TaskAssistant/TaskAssistantView';
import { HouseholdQuestionnaireModal } from './components/TaskAssistant/HouseholdQuestionnaireModal';
import { getFilteredRoutineTasks } from './utils/routineTaskCatalog';
import { Loader2, Plus, Sparkles, ArrowRight } from 'lucide-react';

export function AppContent() {
  const { user, currentTeam, loading, refreshTeamData } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [intermediaries, setIntermediaries] = useState<Intermediary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Navegação por Abas: 'dashboard' | 'assistant'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assistant'>('dashboard');

  // Perfil Residencial & Questionário
  const [householdAnswers, setHouseholdAnswers] = useState<HouseholdAnswers | null>(() => {
    try {
      const saved = localStorage.getItem('minute_household_answers');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const [completedTodayIds, setCompletedTodayIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`minute_completed_tasks_${todayStr}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modais
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isIntermediariesOpen, setIsIntermediariesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [initialTaskData, setInitialTaskData] = useState<InitialTaskData | null>(null);

  // Carregar dados das tarefas
  const fetchTasks = useCallback(async () => {
    if (!currentTeam) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          member:team_members(id, nickname),
          intermediary:intermediary_catalog(id, name, slug)
        `)
        .eq('team_id', currentTeam.id)
        .order('task_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
    }
  }, [currentTeam]);

  // Carregar catálogo de intermediários e categorias
  const fetchCatalogData = useCallback(async () => {
    try {
      const [interRes, catRes] = await Promise.all([
        supabase
          .from('intermediary_catalog')
          .select('*')
          .eq('is_active', true)
          .order('current_rate_usd', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('is_favorite', { ascending: false }),
      ]);

      if (interRes.data) setIntermediaries(interRes.data);
      if (catRes.data) setCategories(catRes.data);
    } catch (err) {
      console.error('Erro ao buscar catálogo:', err);
    }
  }, []);

  // Carregar perfil residencial do Supabase
  const fetchHouseholdProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('household_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        if (data.answers) {
          setHouseholdAnswers(data.answers);
          localStorage.setItem('minute_household_answers', JSON.stringify(data.answers));
        }
        if (data.completed_tasks && data.completed_tasks[todayStr]) {
          setCompletedTodayIds(data.completed_tasks[todayStr]);
          localStorage.setItem(`minute_completed_tasks_${todayStr}`, JSON.stringify(data.completed_tasks[todayStr]));
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil residencial:', err);
    }
  }, [user, todayStr]);

  // Salvar respostas do questionário
  const saveHouseholdAnswers = async (newAnswers: HouseholdAnswers) => {
    setHouseholdAnswers(newAnswers);
    localStorage.setItem('minute_household_answers', JSON.stringify(newAnswers));

    if (user) {
      try {
        await supabase
          .from('household_profiles')
          .upsert({
            user_id: user.id,
            team_id: currentTeam?.id || null,
            answers: newAnswers,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } catch (err) {
        console.error('Erro ao salvar respostas no Supabase:', err);
      }
    }
  };

  // Alternar tarefa feita hoje
  const handleToggleTaskToday = async (taskId: string) => {
    const updated = completedTodayIds.includes(taskId)
      ? completedTodayIds.filter((id) => id !== taskId)
      : [...completedTodayIds, taskId];

    setCompletedTodayIds(updated);
    localStorage.setItem(`minute_completed_tasks_${todayStr}`, JSON.stringify(updated));

    if (user) {
      try {
        const { data } = await supabase
          .from('household_profiles')
          .select('completed_tasks')
          .eq('user_id', user.id)
          .maybeSingle();

        const currentMap = data?.completed_tasks || {};
        currentMap[todayStr] = updated;

        await supabase
          .from('household_profiles')
          .upsert({
            user_id: user.id,
            team_id: currentTeam?.id || null,
            completed_tasks: currentMap,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } catch (err) {
        console.error('Erro ao salvar tarefa concluída no Supabase:', err);
      }
    }
  };

  // Abrir modal de gravação pré-preenchido
  const handleOpenNewTaskWithData = (data: {
    categoryName: string;
    durationMinutes: number;
    notes: string;
  }) => {
    setInitialTaskData(data);
    setIsNewTaskOpen(true);
  };

  useEffect(() => {
    if (currentTeam) {
      fetchTasks();
      fetchCatalogData();
      fetchHouseholdProfile();

      // Inscrição em Tempo Real (Supabase Realtime)
      const channel = supabase
        .channel(`team-tasks-${currentTeam.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `team_id=eq.${currentTeam.id}`,
          },
          () => {
            fetchTasks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentTeam, fetchTasks, fetchCatalogData, fetchHouseholdProfile]);

  // Cálculos para o header e banner
  const stats = householdAnswers ? getFilteredRoutineTasks(householdAnswers) : null;
  const pendingDailyCount = stats
    ? stats.dailyTasks.filter((t) => !completedTodayIds.includes(t.id)).length
    : undefined;

  const hourlyRateUsd = intermediaries[0]?.current_rate_usd || 3.50;
  const usdToBrlRate = currentTeam?.usd_to_brl_rate || 5.60;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-3" />
        <p className="text-sm font-medium text-slate-400">Carregando Minute Tracker...</p>
      </div>
    );
  }

  // 1. Não autenticado -> Tela de Login / Cadastro
  if (!user) {
    return <AuthModal />;
  }

  // 2. Autenticado mas sem equipe -> Onboarding
  if (!currentTeam) {
    return <OnboardingWizard onComplete={refreshTeamData} />;
  }

  // 3. Painel Principal
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Header
        onOpenNewTask={() => {
          setInitialTaskData(null);
          setIsNewTaskOpen(true);
        }}
        onOpenIntermediaries={() => setIsIntermediariesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingTasksCount={pendingDailyCount}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Banner de atalho para o assistente quando estiver na aba de Painel */}
        {activeTab === 'dashboard' && (
          <div className="bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-900 border border-violet-500/20 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  Assistente de Tarefas Minute
                  {householdAnswers ? (
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Casa Configurada
                    </span>
                  ) : (
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Configuração Pendente
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {householdAnswers
                    ? `Você tem ${stats?.dailyTasks.length || 0} tarefas diárias no seu checklist (${pendingDailyCount} pendentes hoje).`
                    : 'Responda o questionário da sua residência para descobrir todas as atividades que você pode gravar!'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!householdAnswers) {
                  setIsQuestionnaireOpen(true);
                } else {
                  setActiveTab('assistant');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 self-end sm:self-auto"
            >
              <span>{householdAnswers ? 'Abrir Checklist Diário' : 'Configurar Residência'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Visão Alternada: Painel vs Assistente */}
        {activeTab === 'dashboard' ? (
          <>
            <SummaryCards
              tasks={tasks}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
            />

            <TaskList
              tasks={tasks}
              selectedMemberId={selectedMemberId}
              onRefresh={fetchTasks}
            />

            {/* Card de Promoções e Bônus posicionado na parte inferior da página */}
            <PromotionBonusCard
              intermediaries={intermediaries}
              tasks={tasks}
              onOpenNewTask={() => {
                setInitialTaskData(null);
                setIsNewTaskOpen(true);
              }}
            />
          </>
        ) : (
          <TaskAssistantView
            answers={householdAnswers}
            onOpenQuestionnaire={() => setIsQuestionnaireOpen(true)}
            completedTodayIds={completedTodayIds}
            onToggleTaskToday={handleToggleTaskToday}
            onOpenNewTaskWithData={handleOpenNewTaskWithData}
            hourlyRateUsd={hourlyRateUsd}
            usdToBrlRate={usdToBrlRate}
          />
        )}
      </main>

      {/* Botão flutuante para mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <button
          type="button"
          onClick={() => {
            setInitialTaskData(null);
            setIsNewTaskOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
          title="Nova Gravação"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

      {/* Modais */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => {
          setIsNewTaskOpen(false);
          setInitialTaskData(null);
        }}
        onSuccess={() => {
          fetchTasks();
          setInitialTaskData(null);
        }}
        intermediaries={intermediaries}
        categories={categories}
        tasks={tasks}
        initialTaskData={initialTaskData}
      />

      <IntermediaryListModal
        isOpen={isIntermediariesOpen}
        onClose={() => setIsIntermediariesOpen(false)}
        intermediaries={intermediaries}
        onRefresh={fetchCatalogData}
      />

      <TeamSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <HouseholdQuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        currentAnswers={householdAnswers}
        onSave={saveHouseholdAnswers}
      />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
