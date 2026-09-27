import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Intermediary, Category, Task } from '../../types/database';
import {
  X,
  Plus,
  Clock,
  DollarSign,
  AlertCircle,
  Loader2,
  Sparkles,
  Flame
} from 'lucide-react';

export interface InitialTaskData {
  categoryName?: string;
  durationMinutes?: number;
  notes?: string;
}

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  intermediaries: Intermediary[];
  categories: Category[];
  tasks: Task[];
  initialTaskData?: InitialTaskData | null;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  intermediaries,
  categories,
  tasks,
  initialTaskData,
}) => {
  const { currentTeam, members, user } = useAuth();

  // Membro que realizou
  const [memberId, setMemberId] = useState('');
  
  // Intermediário selecionado (KGeN por padrão se existir)
  const [intermediaryId, setIntermediaryId] = useState('');
  
  // Categoria
  const [categoryName, setCategoryName] = useState('Lavar Louça / Cozinha');
  
  // Duração em minutos
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  
  // Taxa horária e cotação
  const [rateUsd, setRateUsd] = useState<number>(3.50);
  const [externalCode, setExternalCode] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Função para verificar se a meta do bônus foi atingida para o intermediário
  const getIntermediaryStatus = (inter: Intermediary) => {
    const recordedMinutes = tasks
      .filter((t) => t.intermediary_id === inter.id && t.status !== 'rejected')
      .reduce((acc, t) => acc + (Number(t.duration_minutes) || 0), 0);
    const recordedHours = recordedMinutes / 60;
    const requiredHours = Number(inter.bonus_required_hours) || 5.0;
    const isUnlocked = Boolean(inter.promo_rate_usd && recordedHours >= requiredHours);
    const effectiveRate = isUnlocked ? Number(inter.promo_rate_usd) : Number(inter.current_rate_usd);
    const hoursLeft = Math.max(0, requiredHours - recordedHours);

    return {
      effectiveRate,
      isUnlocked,
      recordedHours,
      requiredHours,
      hoursLeft,
    };
  };

  // Inicializar membro e intermediário padrão
  useEffect(() => {
    if (members.length > 0 && !memberId) {
      const currentMember = members.find((m) => m.user_id === user?.id);
      setMemberId(currentMember ? currentMember.id : members[0].id);
    }

    if (intermediaries.length > 0 && !intermediaryId) {
      const kgen = intermediaries.find((i) => i.slug === 'kgen') || intermediaries[0];
      setIntermediaryId(kgen.id);
      const status = getIntermediaryStatus(kgen);
      setRateUsd(status.effectiveRate);
    }
  }, [members, intermediaries, user, tasks]);

  // Aplicar dados pré-selecionados ao abrir a partir do assistente
  useEffect(() => {
    if (isOpen && initialTaskData) {
      if (initialTaskData.categoryName) setCategoryName(initialTaskData.categoryName);
      if (initialTaskData.durationMinutes) setDurationMinutes(initialTaskData.durationMinutes);
      if (initialTaskData.notes) setNotes(initialTaskData.notes);
    }
  }, [isOpen, initialTaskData]);

  const handleIntermediaryChange = (id: string) => {
    setIntermediaryId(id);
    const selected = intermediaries.find((i) => i.id === id);
    if (selected) {
      const status = getIntermediaryStatus(selected);
      setRateUsd(status.effectiveRate);
    }
  };

  const selectedIntermediary = intermediaries.find((i) => i.id === intermediaryId);
  const usdToBrlRate = currentTeam?.usd_to_brl_rate || 5.50;

  // Cálculos em tempo real
  const calculatedUsd = ((durationMinutes / 60) * rateUsd).toFixed(2);
  const calculatedBrl = ((durationMinutes / 60) * rateUsd * usdToBrlRate).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !memberId) return;

    if (durationMinutes <= 0) {
      setErrorMsg('A duração da gravação deve ser maior que zero minutos.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await supabase.from('tasks').insert({
        team_id: currentTeam.id,
        member_id: memberId,
        intermediary_id: intermediaryId || null,
        category_name: categoryName.trim(),
        duration_minutes: durationMinutes,
        rate_usd: rateUsd,
        usd_to_brl_rate: usdToBrlRate,
        status: 'analyzing', // inicial como "Em Análise"
        external_task_code: externalCode.trim() || null,
        task_date: taskDate,
        notes: notes.trim() || null,
      });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Erro ao salvar gravação:', error);
      setErrorMsg(error.message || 'Erro ao registrar gravação.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Nova Gravação</h2>
              <p className="text-xs text-slate-400">Minute Data / POV Video</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="my-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Quem gravou */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Quem gravou?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMemberId(m.id)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    memberId === m.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {m.nickname}
                </button>
              ))}
            </div>
          </div>

          {/* Intermediário */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Para qual intermediário?</span>
              {selectedIntermediary && (
                <span className="text-[11px] text-slate-400">
                  Taxa aplicada: <strong className="text-white">US$ {rateUsd.toFixed(2)}/h</strong>
                </span>
              )}
            </label>
            <select
              value={intermediaryId}
              onChange={(e) => handleIntermediaryChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {intermediaries.map((item) => {
                const status = getIntermediaryStatus(item);
                return (
                  <option key={item.id} value={item.id}>
                    {item.name} — US$ {Number(item.current_rate_usd).toFixed(2)}/h (Padrão)
                    {item.promo_rate_usd
                      ? status.isUnlocked
                        ? ` → US$ ${Number(item.promo_rate_usd).toFixed(2)}/h (BÔNUS DESBLOQUEADO 🎉)`
                        : ` (Bônus: US$ ${Number(item.promo_rate_usd).toFixed(2)}/h após ${status.requiredHours}h)`
                      : ''}
                  </option>
                );
              })}
            </select>

            {selectedIntermediary && (
              <div className="mt-2 text-xs">
                {(() => {
                  const status = getIntermediaryStatus(selectedIntermediary);
                  if (status.isUnlocked) {
                    return (
                      <p className="text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        Meta de {status.requiredHours}h atingida! Bônus de US$ {Number(selectedIntermediary.promo_rate_usd).toFixed(2)}/h aplicado nesta gravação.
                      </p>
                    );
                  } else if (selectedIntermediary.promo_rate_usd) {
                    return (
                      <p className="text-amber-400/90 flex items-center gap-1.5 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                        <Flame className="w-3.5 h-3.5 shrink-0" />
                        Taxa padrão ativa (US$ {Number(selectedIntermediary.current_rate_usd).toFixed(2)}/h). Faltam <strong>{status.hoursLeft.toFixed(1)}h</strong> de gravação para liberar o bônus de US$ {Number(selectedIntermediary.promo_rate_usd).toFixed(2)}/h.
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>

          {/* Categoria da Tarefa */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Atividade Realizada
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryName(cat.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    categoryName === cat.name
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ou digite o nome da atividade..."
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Duração em minutos */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Duração da Gravação</span>
              <span className="text-slate-400 font-normal">
                {(durationMinutes / 60).toFixed(1)} horas
              </span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    durationMinutes === mins
                      ? 'bg-slate-800 text-white border-slate-600'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                step="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                className="w-full pl-11 pr-16 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-lg font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                minutos
              </span>
            </div>
          </div>

          {/* Banner de Previsão de Ganho */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-medium">Previsão desta gravação:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-white">R$ {calculatedBrl}</span>
                  <span className="text-xs text-slate-400">(US$ {calculatedUsd})</span>
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400">
              Taxa: US$ {rateUsd.toFixed(2)}/h
            </span>
          </div>

          {/* Código Minute Data (opcional) & Data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Cód. Gravação (Opcional)
              </label>
              <input
                type="text"
                value={externalCode}
                onChange={(e) => setExternalCode(e.target.value)}
                placeholder="Ex: T-9421"
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Data da Gravação
              </label>
              <input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Observações (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Gravação feita na cozinha com suporte de cabeça..."
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 mt-4"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Registrar como "Em Análise"
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
