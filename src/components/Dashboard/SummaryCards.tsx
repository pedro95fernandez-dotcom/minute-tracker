import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Task } from '../../types/database';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Banknote,
  Target,
  Users,
  ArrowUpRight,
  Hourglass,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  DollarSign
} from 'lucide-react';

interface SummaryCardsProps {
  tasks: Task[];
  selectedMemberId: string | null;
  onSelectMember: (memberId: string | null) => void;
}

interface DollarData {
  bid: number;
  pctChange: number;
  high: number;
  low: number;
  varBid: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  tasks,
  selectedMemberId,
  onSelectMember,
}) => {
  const { currentTeam, members } = useAuth();

  // Estado para cotação do Dólar Hoje
  const [dollarData, setDollarData] = useState<DollarData | null>(null);
  const [fetchingDollar, setFetchingDollar] = useState(false);

  const fetchDollarToday = () => {
    setFetchingDollar(true);
    fetch('https://economia.awesomeapi.com.br/last/USD-BRL')
      .then((res) => res.json())
      .then((data) => {
        if (data?.USDBRL) {
          setDollarData({
            bid: parseFloat(data.USDBRL.bid),
            pctChange: parseFloat(data.USDBRL.pctChange),
            high: parseFloat(data.USDBRL.high),
            low: parseFloat(data.USDBRL.low),
            varBid: parseFloat(data.USDBRL.varBid),
          });
        }
      })
      .catch((err) => console.error('Erro ao buscar dólar hoje:', err))
      .finally(() => setFetchingDollar(false));
  };

  useEffect(() => {
    fetchDollarToday();
  }, []);

  // Filtrar tarefas pelo membro selecionado (ou todas)
  const filteredTasks = selectedMemberId
    ? tasks.filter((t) => t.member_id === selectedMemberId)
    : tasks;

  // Cálculos por status
  const analyzingTasks = filteredTasks.filter((t) => t.status === 'analyzing');
  const approvedTasks = filteredTasks.filter((t) => t.status === 'approved');
  const paidTasks = filteredTasks.filter((t) => t.status === 'paid');
  const rejectedTasks = filteredTasks.filter((t) => t.status === 'rejected');

  const sumBrl = (arr: Task[]) => arr.reduce((acc, t) => acc + (Number(t.calculated_brl) || 0), 0);
  const sumUsd = (arr: Task[]) => arr.reduce((acc, t) => acc + (Number(t.calculated_usd) || 0), 0);
  const sumMinutes = (arr: Task[]) => arr.reduce((acc, t) => acc + (Number(t.duration_minutes) || 0), 0);

  const totalMinutesRecorded = sumMinutes(filteredTasks.filter((t) => t.status !== 'rejected'));
  const totalHoursRecorded = (totalMinutesRecorded / 60).toFixed(1);

  const analyzingBrl = sumBrl(analyzingTasks);
  const analyzingUsd = sumUsd(analyzingTasks);

  const approvedBrl = sumBrl(approvedTasks);
  const approvedUsd = sumUsd(approvedTasks);

  const paidBrl = sumBrl(paidTasks);
  const paidUsd = sumUsd(paidTasks);

  // Ganhos confirmados (aprovados + pagos)
  const confirmedBrl = approvedBrl + paidBrl;

  // Total a receber (confirmados que aguardam pagamento + o que está em análise)
  const totalToReceiveBrl = approvedBrl + analyzingBrl;
  const totalToReceiveUsd = approvedUsd + analyzingUsd;

  // Progresso em relação à meta semanal da equipe
  const weeklyGoalBrl = currentTeam?.weekly_goal_brl || 500;
  const weeklyGoalHours = currentTeam?.weekly_goal_hours || 20;

  // Quanto falta para a meta
  const remainingGoalBrl = Math.max(0, weeklyGoalBrl - confirmedBrl);
  const remainingGoalHours = Math.max(0, weeklyGoalHours - (totalMinutesRecorded / 60));
  const isGoalReached = confirmedBrl >= weeklyGoalBrl;

  const progressPercent = Math.min(Math.round((confirmedBrl / weeklyGoalBrl) * 100), 100);

  const currentDollarRate = dollarData ? dollarData.bid : (currentTeam?.usd_to_brl_rate || 5.15);
  const isDollarUp = dollarData ? dollarData.pctChange >= 0 : true;

  return (
    <div className="space-y-4">
      {/* Filtro de Membros (Todos vs Individual) */}
      {members.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectMember(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedMemberId === null
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Toda a Equipe ({members.length})
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMember(m.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedMemberId === m.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.nickname}
            </button>
          ))}
        </div>
      )}

      {/* SUPER DESTAQUES: 1. Valor a Receber | 2. Quanto Falta para a Meta | 3. Dólar Hoje */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* CARD 1: VALOR A RECEBER (PREVISTO) - 5 Colunas */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black tracking-widest uppercase text-emerald-400 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-400" /> Valor a Receber (Semana)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                Previsão Atual
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                R$ {totalToReceiveBrl.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                (~US$ {totalToReceiveUsd.toFixed(2)})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Soma das gravações aprovadas e em análise prontas para o ciclo.
            </p>
          </div>

          {/* Divisão: Aprovado vs Em Análise */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mb-0.5">
                <CheckCircle className="w-3.5 h-3.5" /> Aprovado (Garantido)
              </div>
              <p className="text-lg font-bold text-white leading-tight">
                R$ {approvedBrl.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-400">US$ {approvedUsd.toFixed(2)}</p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-2xl border border-amber-500/20">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 mb-0.5">
                <Hourglass className="w-3.5 h-3.5" /> Em Análise
              </div>
              <p className="text-lg font-bold text-white leading-tight">
                R$ {analyzingBrl.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-400">US$ {analyzingUsd.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* CARD 2: QUANTO FALTA PARA A META SEMANAL - 4 Colunas */}
        <div className={`md:col-span-4 border-2 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between ${
          isGoalReached
            ? 'bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 border-emerald-500/50'
            : 'bg-gradient-to-br from-blue-500/15 via-slate-900 to-slate-950 border-blue-500/40'
        }`}>
          <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-black tracking-widest uppercase flex items-center gap-1.5 ${
                isGoalReached ? 'text-emerald-400' : 'text-blue-400'
              }`}>
                <Target className="w-4 h-4" /> Meta Semanal
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                Meta: R$ {weeklyGoalBrl.toFixed(2)}
              </span>
            </div>

            {isGoalReached ? (
              <div className="space-y-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  Meta Atingida! 🎉
                </span>
                <p className="text-xs text-emerald-300 font-semibold">
                  +R$ {(confirmedBrl - weeklyGoalBrl).toFixed(2)} acima da meta planejada.
                </p>
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Faltam</span>
                  <span className="text-3xl sm:text-4xl font-black text-blue-300 tracking-tight">
                    R$ {remainingGoalBrl.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Equivale a cerca de <strong className="text-white font-bold">{remainingGoalHours.toFixed(1)} horas</strong> restantes.
                </p>
              </div>
            )}
          </div>

          {/* Barras e indicadores de progresso da meta */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Progresso da Semana:</span>
              <span className="font-extrabold text-white flex items-center gap-1">
                {progressPercent}% <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            </div>

            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Confirmado: <strong>R$ {confirmedBrl.toFixed(2)}</strong></span>
              <span>Horas: <strong>{totalHoursRecorded}h</strong> / {weeklyGoalHours}h</span>
            </div>
          </div>
        </div>

        {/* CARD 3: DÓLAR HOJE COM INDICADOR VERDE / VERMELHO - 3 Colunas */}
        <div className="md:col-span-3 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Dólar Hoje
              </span>
              <button
                type="button"
                onClick={fetchDollarToday}
                disabled={fetchingDollar}
                className="p-1 rounded-lg text-slate-500 hover:text-white transition-all cursor-pointer"
                title="Atualizar cotação"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetchingDollar ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="mt-1">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                R$ {currentDollarRate.toFixed(2)}
              </span>
            </div>

            {/* Variação com setinha verde se subiu ou vermelha se caiu */}
            <div className="mt-3">
              {dollarData ? (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                  isDollarUp
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                }`}>
                  {isDollarUp ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                      <span>+{dollarData.pctChange.toFixed(2)}% hoje</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-rose-400 stroke-[2.5]" />
                      <span>{dollarData.pctChange.toFixed(2)}% hoje</span>
                    </>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-500">Buscando cotação...</span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 space-y-0.5">
            {dollarData && (
              <div className="flex justify-between">
                <span>Mín: R$ {dollarData.low.toFixed(2)}</span>
                <span>Máx: R$ {dollarData.high.toFixed(2)}</span>
              </div>
            )}
            <p className="text-[10px] text-slate-500 text-center pt-1">
              Usado para converter seus ganhos
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Financeiras Secundárias por Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {/* Em Análise */}
        <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold">Em Análise</span>
            <Clock className="w-4 h-4 shrink-0" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-white">
            R$ {analyzingBrl.toFixed(2)}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>US$ {analyzingUsd.toFixed(2)}</span>
            <span>{analyzingTasks.length} tarefas</span>
          </div>
        </div>

        {/* Aprovado */}
        <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold">Aprovado</span>
            <CheckCircle className="w-4 h-4 shrink-0" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-white">
            R$ {approvedBrl.toFixed(2)}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>US$ {approvedUsd.toFixed(2)}</span>
            <span>{approvedTasks.length} tarefas</span>
          </div>
        </div>

        {/* Pago */}
        <div className="bg-slate-900/80 border border-blue-500/20 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <span className="text-xs font-semibold">Já Pago</span>
            <Banknote className="w-4 h-4 shrink-0" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-white">
            R$ {paidBrl.toFixed(2)}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>US$ {paidUsd.toFixed(2)}</span>
            <span>{paidTasks.length} pagas</span>
          </div>
        </div>

        {/* Rejeitadas */}
        <div className="bg-slate-900/80 border border-rose-500/20 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-semibold">Rejeitadas</span>
            <AlertTriangle className="w-4 h-4 shrink-0" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-white">
            {rejectedTasks.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {rejectedTasks.length === 0 ? 'Nenhum erro' : 'Ver motivos abaixo'}
          </p>
        </div>
      </div>
    </div>
  );
};
