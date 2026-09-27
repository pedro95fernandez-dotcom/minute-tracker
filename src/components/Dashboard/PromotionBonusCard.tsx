import React, { useState } from 'react';
import type { Intermediary, Task } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface PromotionBonusCardProps {
  intermediaries: Intermediary[];
  tasks: Task[];
  onOpenNewTask: () => void;
}

export const PromotionBonusCard: React.FC<PromotionBonusCardProps> = ({
  intermediaries,
  tasks,
  onOpenNewTask,
}) => {
  const { currentTeam } = useAuth();
  const usdToBrl = currentTeam?.usd_to_brl_rate || 5.15;

  // Filtrar intermediários que possuem bônus / promoção ativa
  const promoIntermediaries = intermediaries.filter(
    (i) => i.promo_rate_usd && i.promo_rate_usd > i.current_rate_usd
  );

  const [selectedSlug, setSelectedSlug] = useState<string>(
    promoIntermediaries.find((i) => i.slug === 'kgen')?.slug || promoIntermediaries[0]?.slug || ''
  );

  if (promoIntermediaries.length === 0) return null;

  const currentIntermediary =
    promoIntermediaries.find((i) => i.slug === selectedSlug) || promoIntermediaries[0];

  // Calcular horas já gravadas para este intermediário na semana (excluindo rejeitadas)
  const recordedMinutes = tasks
    .filter((t) => t.intermediary_id === currentIntermediary.id && t.status !== 'rejected')
    .reduce((acc, t) => acc + (Number(t.duration_minutes) || 0), 0);

  const recordedHours = recordedMinutes / 60;
  const requiredHours = Number(currentIntermediary.bonus_required_hours) || 5.0;
  const hoursLeft = Math.max(0, requiredHours - recordedHours);
  const isBonusUnlocked = recordedHours >= requiredHours;
  const progressPercent = Math.min(Math.round((recordedHours / requiredHours) * 100), 100);

  const baseRateUsd = Number(currentIntermediary.current_rate_usd);
  const baseRateBrl = baseRateUsd * usdToBrl;
  const promoRateUsd = Number(currentIntermediary.promo_rate_usd);
  const promoRateBrl = promoRateUsd * usdToBrl;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tabs se houver mais de um intermediário com promoção */}
      {promoIntermediaries.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 mr-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> Promoções:
          </span>
          {promoIntermediaries.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedSlug(item.slug)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentIntermediary.id === item.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      {/* Cabeçalho da Promoção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Promoção Ativa • {currentIntermediary.name}
            </span>
            <span className="text-xs text-slate-400">
              Taxa Padrão: <strong>US$ {baseRateUsd.toFixed(2)}/h</strong> (~R$ {baseRateBrl.toFixed(2)})
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {currentIntermediary.active_promotion || 'Bônus Turbinado de Gravações'}
          </h3>
          <p className="text-xs text-slate-300">
            {currentIntermediary.bonus_condition_text ||
              `Grave pelo menos ${requiredHours}h na semana para desbloquear a taxa de US$ ${promoRateUsd.toFixed(2)}/h.`}
          </p>
        </div>

        {/* Badge de status do bônus */}
        <div className="shrink-0">
          {isBonusUnlocked ? (
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Status</p>
                <p className="text-sm font-extrabold text-white">Bônus Desbloqueado! 🎉</p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Taxa Turbinada</p>
                <p className="text-sm font-extrabold text-amber-400">
                  US$ {promoRateUsd.toFixed(2)}/h <span className="text-xs text-slate-400 font-normal">(~R$ {promoRateBrl.toFixed(2)})</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Caixa de Mensagem Dinâmica do Contador */}
      <div className={`p-4 rounded-2xl border transition-all mb-4 ${
        isBonusUnlocked
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-slate-950/80 border-amber-500/30'
      }`}>
        {isBonusUnlocked ? (
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Parabéns! Você completou a meta de {requiredHours}h da semana!
              </p>
              <p className="text-xs text-emerald-300 mt-0.5">
                O valor adicional do bônus está ativo e você já está ganhando <strong className="text-white">US$ {promoRateUsd.toFixed(2)} (~R$ {promoRateBrl.toFixed(2)})</strong> por hora de gravação.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-200 leading-snug">
                Faltam <strong className="text-amber-400 font-black text-base">{hoursLeft.toFixed(1)} horas</strong> de gravação para atingir o bônus e você ganhar <strong className="text-emerald-400 font-extrabold text-base">US$ {promoRateUsd.toFixed(2)} (~R$ {promoRateBrl.toFixed(2)})</strong> por hora de gravação.
              </p>
            </div>

            {/* Barra de Progresso do Bônus */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Progresso do bônus: <strong>{recordedHours.toFixed(1)}h</strong> de {requiredHours}h necessárias</span>
                <span className="font-bold text-amber-400">{progressPercent}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botão de Ação Rápida */}
      {!isBonusUnlocked && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenNewTask}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <span>Gravar tarefa para bater o bônus</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
