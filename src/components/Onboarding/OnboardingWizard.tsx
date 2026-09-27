import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  User,
  Target,
  Clock,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user, profile, createTeam, joinTeamWithCode } = useAuth();
  
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'solo' | 'team_new' | 'team_join'>('team_new');
  const [teamName, setTeamName] = useState('Nossa Equipe');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [nickname, setNickname] = useState(profile?.full_name?.split(' ')[0] || '');

  // Metas e cotação
  const [weeklyGoalBrl, setWeeklyGoalBrl] = useState<string>('600');
  const [dailyGoalHours, setDailyGoalHours] = useState<string>('3');
  const [weeklyGoalHours, setWeeklyGoalHours] = useState<string>('18');
  const [usdRate, setUsdRate] = useState<string>('5.15');
  const [fetchingRate, setFetchingRate] = useState(false);

  // Atividades frequentes
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    'Lavar Louça / Cozinha',
    'Dobrar Roupas / Lavanderia'
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const defaultActivitiesList = [
    'Lavar Louça / Cozinha',
    'Dobrar Roupas / Lavanderia',
    'Organização de Armários / Quarto',
    'Limpeza de Chão / Aspirador',
    'Preparar Refeição / Alimentos',
    'Tarefas de Trabalho / Comercial'
  ];

  const toggleActivity = (act: string) => {
    if (selectedActivities.includes(act)) {
      setSelectedActivities(selectedActivities.filter((a) => a !== act));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const fetchLiveExchangeRate = async () => {
    try {
      setFetchingRate(true);
      const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
      const data = await res.json();
      if (data?.USDBRL?.bid) {
        setUsdRate(parseFloat(data.USDBRL.bid).toFixed(2));
      }
    } catch (err) {
      console.error('Erro ao buscar cotação:', err);
    } finally {
      setFetchingRate(false);
    }
  };

  const handleFinish = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'team_join') {
        if (!inviteCodeInput.trim()) {
          throw new Error('Por favor, informe o código de convite da equipe.');
        }
        await joinTeamWithCode(
          inviteCodeInput.trim(),
          nickname.trim() || user?.email?.split('@')[0] || 'Parceiro(a)'
        );
      } else {
        const finalName = mode === 'solo' ? 'Individual' : (teamName.trim() || 'Nossa Equipe');
        const finalWeeklyBrl = parseFloat(weeklyGoalBrl) || 600;
        const finalWeeklyHours = parseFloat(weeklyGoalHours) || 18;
        const finalDailyHours = parseFloat(dailyGoalHours) || 3;
        const finalUsdRate = parseFloat(usdRate) || 5.15;

        await createTeam(finalName, finalWeeklyBrl, finalWeeklyHours, finalDailyHours, finalUsdRate);
      }
      onComplete();
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Erro no onboarding:', error);
      setErrorMsg(error.message || 'Erro ao configurar equipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">
              Passo {step} de 3
            </span>
            <span className="text-xs text-slate-500">
              {step === 1 ? 'Modalidade' : step === 2 ? 'Metas Financeiras' : 'Atividades Frequentes'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Modalidade */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Como você irá realizar as gravações?
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Você pode registrar suas atividades sozinho ou somar esforços com outra pessoa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMode('team_new')}
                className={`p-5 rounded-2xl border text-left transition-all relative ${
                  mode === 'team_new'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-base">Em Dupla / Equipe</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ideal para casal ou parceiros. Cada um grava suas tarefas e acompanham os ganhos juntos.
                </p>
                {mode === 'team_new' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute top-4 right-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode('solo')}
                className={`p-5 rounded-2xl border text-left transition-all relative ${
                  mode === 'solo'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl w-fit mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-base">Individual (Solo)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Somente você registrando suas atividades e gerenciando seus próprios ganhos.
                </p>
                {mode === 'solo' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute top-4 right-4" />
                )}
              </button>
            </div>

            {mode === 'team_new' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Nome da Equipe ou Casal
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Ex: Pedro & Esposa"
                    className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Um código exclusivo de convite será gerado para sua esposa/parceiro(a) entrar no app.
                  </p>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('team_join')}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Já tem um código de convite gerado por outra pessoa? Clique aqui para entrar.
                  </button>
                </div>
              </div>
            )}

            {mode === 'team_join' && (
              <div className="space-y-4 pt-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Código de Convite da Equipe (6 dígitos)
                  </label>
                  <input
                    type="text"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ex: AB12CD"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono tracking-widest text-lg uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Como você quer ser chamado(a) no painel?
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ex: Esposa, Pedro, etc."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('team_new')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← Voltar para criar uma nova equipe
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (mode === 'team_join') {
                  handleFinish();
                } else {
                  setStep(2);
                }
              }}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'team_join' ? (
                'Entrar na Equipe'
              ) : (
                <>
                  Continuar para Metas <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: Metas e Cotação */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Defina sua meta semanal e câmbio
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Ter uma meta clara ajuda a saber exatamente quantas horas vocês precisam gravar na semana.
              </p>
            </div>

            <div className="space-y-4">
              {/* Meta Semanal em R$ */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" /> Meta de Ganhos Semanal (R$)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    ~ R$ {((parseFloat(weeklyGoalBrl) || 0) / 6).toFixed(2)} / dia
                  </span>
                </div>
                <div className="relative mb-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={weeklyGoalBrl}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setWeeklyGoalBrl(val.replace(/^0+(?=\d)/, ''));
                    }}
                    placeholder="600"
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-lg font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                {/* Atalhos Rápidos */}
                <div className="flex items-center gap-2">
                  {['300', '500', '800', '1000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setWeeklyGoalBrl(val)}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        weeklyGoalBrl === val
                          ? 'bg-slate-800 text-emerald-400 border-emerald-500/50'
                          : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meta de Horas por Dia */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" /> Meta de Horas por Dia
                  </label>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {(parseFloat(dailyGoalHours) || 0) * 6}h / semana (6 dias)
                  </span>
                </div>
                <div className="relative mb-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={dailyGoalHours}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      const clean = val.replace(/^0+(?=\d)/, '');
                      setDailyGoalHours(clean);
                      if (clean && !isNaN(Number(clean))) {
                        setWeeklyGoalHours(String(Math.round(Number(clean) * 6)));
                      }
                    }}
                    placeholder="3"
                    className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-lg font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">horas/dia</span>
                </div>
                {/* Atalhos Rápidos Diários */}
                <div className="flex items-center gap-2">
                  {['2', '3', '4', '5'].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        setDailyGoalHours(h);
                        setWeeklyGoalHours(String(Number(h) * 6));
                      }}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        dailyGoalHours === h
                          ? 'bg-slate-800 text-emerald-400 border-emerald-500/50'
                          : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {h}h / dia
                    </button>
                  ))}
                </div>
              </div>

              {/* Meta de Horas por Semana */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" /> Meta Total de Horas por Semana
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={weeklyGoalHours}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                      setWeeklyGoalHours(val);
                    }}
                    placeholder="18"
                    className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-lg font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">horas/semana</span>
                </div>
              </div>

              {/* Cotação do Dólar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" /> Cotação Estimada do Dólar (R$/USD)
                  </label>
                  <button
                    type="button"
                    onClick={fetchLiveExchangeRate}
                    disabled={fetchingRate}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${fetchingRate ? 'animate-spin' : ''}`} />
                    Cotação em Tempo Real
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={usdRate}
                    onChange={(e) => setUsdRate(e.target.value)}
                    placeholder="5.15"
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-lg font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-all cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Atividades Frequentes */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Quais atividades são mais frequentes?
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Selecione as que você e sua parceira mais pretendem gravar para ficarem no topo do registro rápido.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {defaultActivitiesList.map((activity) => {
                const isSelected = selectedActivities.includes(activity);
                return (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => toggleActivity(activity)}
                    className={`p-3.5 rounded-xl border text-left text-sm transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-medium'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{activity}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">Dica Minute Data:</span> O intermediário KGeN já está configurado no seu catálogo com taxa padrão de <strong className="text-white">US$ 3.50 - US$ 4.00/h</strong>. Você poderá cadastrar ou alternar para outros a qualquer momento.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-all cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Concluir e Acessar Painel
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
