import React, { useState, useMemo } from 'react';
import type { HouseholdAnswers } from '../../types/database';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ShieldCheck,
  Calendar,
  Sun,
  PlusCircle,
  Info,
  Search,
  Utensils,
  CookingPot,
  Shirt,
  Zap,
  Home,
  TreePine,
  Brush,
  Dog,
  Flower2,
  Car,
  Briefcase,
  ShoppingBag,
  Fuel,
  Hotel,
  Waves,
  Wrench,
  Smile,
  Dumbbell,
  Laptop,
  Boxes,
  Coffee,
  Trash2,
  Bed,
  Scissors,
  Users,
  Brain
} from 'lucide-react';
import {
  getFilteredRoutineTasks,
  MINUTE_DATA_GOLDEN_RULES
} from '../../utils/routineTaskCatalog';

interface TaskAssistantViewProps {
  answers: HouseholdAnswers | null;
  onOpenQuestionnaire: () => void;
  completedTodayIds: string[];
  onToggleTaskToday: (taskId: string) => Promise<void>;
  onOpenNewTaskWithData: (data: {
    categoryName: string;
    durationMinutes: number;
    notes: string;
  }) => void;
  hourlyRateUsd: number;
  usdToBrlRate: number;
}

export const TaskAssistantView: React.FC<TaskAssistantViewProps> = ({
  answers,
  onOpenQuestionnaire,
  completedTodayIds,
  onToggleTaskToday,
  onOpenNewTaskWithData,
  hourlyRateUsd,
  usdToBrlRate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'weekly' | 'rules'>('daily');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Se o usuário ainda não respondeu ao questionário
  if (!answers) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-violet-950/40 border border-violet-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center mx-auto border border-violet-500/30 shadow-lg shadow-violet-500/10">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-xl font-bold text-white">
            Descubra as Melhores Tarefas Para Sua Casa
          </h2>
          <p className="text-sm text-slate-300">
            Responda o questionário rápido de 1 minuto sobre sua residência e equipamentos (máquina de lavar, pets, quintal, carro, etc.) para gerarmos seu checklist oficial inteligente igual ao Minute Data.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenQuestionnaire}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Iniciar Questionário da Residência</span>
        </button>
      </div>
    );
  }

  const {
    allEligible,
    dailyTasks,
    weeklyTasks,
    dailyMinutesPerDay,
    potentialHoursPerWeek,
  } = getFilteredRoutineTasks(answers);

  const effectiveHourlyBrl = hourlyRateUsd * usdToBrlRate;
  const potentialEarningsWeekBrl = potentialHoursPerWeek * effectiveHourlyBrl;
  const dailyHours = (dailyMinutesPerDay / 60).toFixed(1);
  const potentialDailyBrl = (parseFloat(dailyHours) * effectiveHourlyBrl).toFixed(2);

  // Progresso das diárias hoje
  const completedDailyCount = dailyTasks.filter((t) =>
    completedTodayIds.includes(t.id)
  ).length;
  const dailyProgressPercent = dailyTasks.length > 0
    ? Math.round((completedDailyCount / dailyTasks.length) * 100)
    : 0;

  // Lista de categorias com quantidade para as pílulas de filtro
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allEligible.forEach((t) => {
      counts[t.categoryName] = (counts[t.categoryName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [allEligible]);

  // Filtragem combinada
  const currentList = activeSubTab === 'daily' ? dailyTasks : weeklyTasks;
  const filteredTasks = useMemo(() => {
    return currentList.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        !selectedCategory || task.categoryName === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [currentList, searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedTaskId((prev) => (prev === id ? null : id));
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'CookingPot':
        return <CookingPot className="w-4 h-4 text-orange-400" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4 text-sky-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Home':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'TreePine':
        return <TreePine className="w-4 h-4 text-emerald-500" />;
      case 'Brush':
        return <Brush className="w-4 h-4 text-teal-400" />;
      case 'Dog':
        return <Dog className="w-4 h-4 text-pink-400" />;
      case 'Flower2':
        return <Flower2 className="w-4 h-4 text-green-400" />;
      case 'Car':
        return <Car className="w-4 h-4 text-blue-400" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 text-violet-400" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'Fuel':
        return <Fuel className="w-4 h-4 text-amber-500" />;
      case 'Hotel':
        return <Hotel className="w-4 h-4 text-sky-400" />;
      case 'Waves':
        return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4 text-orange-400" />;
      case 'Smile':
        return <Smile className="w-4 h-4 text-yellow-400" />;
      case 'Dumbbell':
        return <Dumbbell className="w-4 h-4 text-rose-400" />;
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-indigo-400" />;
      case 'Boxes':
        return <Boxes className="w-4 h-4 text-amber-600" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'Trash2':
        return <Trash2 className="w-4 h-4 text-slate-400" />;
      case 'Bed':
        return <Bed className="w-4 h-4 text-indigo-300" />;
      case 'Scissors':
        return <Scissors className="w-4 h-4 text-teal-300" />;
      case 'Users':
        return <Users className="w-4 h-4 text-violet-400" />;
      case 'Brain':
        return <Brain className="w-4 h-4 text-pink-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Banner Principal com Potencial e Progresso */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-violet-400" />
                Catálogo Oficial Minute Data
              </span>
              <span className="text-xs text-slate-400">
                {allEligible.length} tarefas compatíveis com seu perfil
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Potencial Semanal:{' '}
              <span className="text-emerald-400">
                R$ {potentialEarningsWeekBrl.toFixed(2)}
              </span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Com as suas tarefas diárias e periódicas ativas, você pode gravar{' '}
              <strong className="text-white">~{potentialHoursPerWeek} horas por semana</strong>. Fazendo as tarefas diárias de hoje você acumula até <strong className="text-emerald-400">R$ {potentialDailyBrl}</strong> no dia!
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-between md:justify-end">
            <button
              type="button"
              onClick={onOpenQuestionnaire}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Ajustar respostas do questionário"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
              <span>Ajustar Perfil Residencial</span>
            </button>
          </div>
        </div>

        {/* Barra de Progresso do Dia */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 w-full sm:max-w-md">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-300">
                Progresso Diário de Hoje ({completedDailyCount} de {dailyTasks.length} feitas)
              </span>
              <span className="text-emerald-400 font-bold">{dailyProgressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <strong>{dailyTasks.length}</strong> diárias (~{dailyHours}h/dia)
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <strong>{weeklyTasks.length}</strong> semanais
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa igual ao Minute Data ("Buscar tarefas...") */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarefas pelo nome ou descrição..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Pílulas de Categorias Oficiais do Minute Data */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === null
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Todas ({allEligible.length})
        </button>

        {categoriesWithCounts.map(({ name, count }) => {
          const isSelected = selectedCategory === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? null : name)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {name} ({count})
            </button>
          );
        })}
      </div>

      {/* Navegação entre Abas: Diárias, Semanais e Regras */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('daily')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'daily'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Tarefas Diárias (Checklist de Hoje)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">
            {dailyTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('weekly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'weekly'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>Tarefas Semanais (Planejamento)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">
            {weeklyTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'rules'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Guia Anti-Rejeição</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-mono">
            Regras de Ouro
          </span>
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeSubTab === 'rules' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {MINUTE_DATA_GOLDEN_RULES.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {rule.badge}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  #0{idx + 1}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{rule.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {rule.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Instrução rápida da aba */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <span>
              {activeSubTab === 'daily'
                ? `Tarefas diárias disponíveis (${filteredTasks.length}):`
                : `Tarefas periódicas da semana (${filteredTasks.length}):`}
            </span>
            <span className="text-[11px] text-slate-500 italic hidden sm:inline">
              Clique em &quot;Gravar Agora&quot; para registrar no app
            </span>
          </div>

          {/* Lista de Tarefas */}
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-slate-400">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm">Nenhuma tarefa encontrada para os filtros atuais.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="text-xs text-emerald-400 hover:underline"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const isCompletedToday = completedTodayIds.includes(task.id);
                const isExpanded = expandedTaskId === task.id;
                const taskRewardBrl = (
                  (task.recommendedMinutes / 60) *
                  effectiveHourlyBrl
                ).toFixed(2);

                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isCompletedToday
                        ? 'bg-slate-900/40 border-emerald-500/30'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      
                      {/* Lado Esquerdo: Checkbox + Título + Categoria */}
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleTaskToday(task.id)}
                          className="mt-0.5 sm:mt-0 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                          title={
                            isCompletedToday
                              ? 'Marcada como feita hoje (clique para desmarcar)'
                              : 'Marcar como realizada hoje'
                          }
                        >
                          {isCompletedToday ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>

                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                          {renderIcon(task.icon)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`text-sm font-bold truncate ${
                                isCompletedToday
                                  ? 'text-slate-400 line-through'
                                  : 'text-white'
                              }`}
                            >
                              {task.title}
                            </h4>
                            {task.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {task.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 flex-wrap">
                            <span className="text-slate-400 font-medium">
                              {task.categoryName}
                            </span>
                            <span className="flex items-center gap-1 text-slate-300">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {task.recommendedMinutes} min
                            </span>
                            {task.frequency === 'weekly' && (
                              <span className="text-sky-400 text-[11px]">
                                {task.timesPerWeek}x / semana
                              </span>
                            )}
                            <span className="text-emerald-400 font-mono font-semibold">
                              ~R$ {taskRewardBrl}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lado Direito: Ações (Expandir Dicas e Gravar Agora) */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <button
                          type="button"
                          onClick={() => toggleExpand(task.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Ver dicas anti-rejeição"
                        >
                          <Info className="w-3.5 h-3.5 text-violet-400" />
                          <span className="hidden sm:inline">Dicas</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onOpenNewTaskWithData({
                              categoryName: task.categoryName,
                              durationMinutes: task.recommendedMinutes,
                              notes: `Tarefa oficial: ${task.title}`,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Gravar Agora</span>
                        </button>
                      </div>

                    </div>

                    {/* Detalhes e Dicas Anti-Rejeição Expandidos */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 bg-slate-950/60 border-t border-slate-800/80 text-xs space-y-2.5 animate-in fade-in duration-150">
                        <p className="text-slate-300 font-normal leading-relaxed">
                          {task.description}
                        </p>

                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Regras de Aprovação no Minute Data:
                          </span>
                          <ul className="space-y-1 text-slate-300 pl-1">
                            {task.antiRejectionTips.map((tip, tipIdx) => (
                              <li key={tipIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
