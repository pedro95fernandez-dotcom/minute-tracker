import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Intermediary } from '../../types/database';
import {
  X,
  TrendingUp,
  Flame,
  Calendar,
  CreditCard,
  AlertCircle,
  Send,
  Loader2,
  CheckCircle2,
  Flag
} from 'lucide-react';

interface IntermediaryListModalProps {
  isOpen: boolean;
  onClose: () => void;
  intermediaries: Intermediary[];
  onRefresh: () => void;
}

export const IntermediaryListModal: React.FC<IntermediaryListModalProps> = ({
  isOpen,
  onClose,
  intermediaries,
  onRefresh,
}) => {
  const { currentTeam, user } = useAuth();
  const usdToBrl = currentTeam?.usd_to_brl_rate || 5.50;

  // Estado para formulário de reporte de divergência
  const [reportingIntermediary, setReportingIntermediary] = useState<Intermediary | null>(null);
  const [reportedRateUsd, setReportedRateUsd] = useState<number>(4.00);
  const [promoDetails, setPromoDetails] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenReport = (item: Intermediary) => {
    setReportingIntermediary(item);
    setReportedRateUsd(Number(item.promo_rate_usd || item.current_rate_usd));
    setPromoDetails(item.active_promotion || '');
    setProofNotes('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingIntermediary) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.from('rate_reports').insert({
        intermediary_id: reportingIntermediary.id,
        reported_by: user?.id || null,
        reported_rate_usd: reportedRateUsd,
        promo_details: promoDetails.trim() || null,
        proof_notes: proofNotes.trim() || null,
        status: 'pending',
      });

      if (error) throw error;

      setSuccessMsg('Obrigado! Seu reporte de valor/promoção foi registrado para verificação.');
      setTimeout(() => {
        setReportingIntermediary(null);
        setSuccessMsg('');
        onRefresh();
      }, 2000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Erro ao reportar divergência:', error);
      setErrorMsg(error.message || 'Erro ao enviar reporte.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Cotações dos Intermediários
              </h2>
              <p className="text-xs text-slate-400">
                Taxas atualizadas, bônus ativos e regras de pagamento do Minute Data
              </p>
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

        {/* Formulário de Reporte de Divergência */}
        {reportingIntermediary ? (
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <Flag className="w-4 h-4" />
                <h3 className="font-bold text-sm">
                  Reportar Valor / Promoção: {reportingIntermediary.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReportingIntermediary(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Voltar à lista
              </button>
            </div>

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Qual é o valor atual pago por hora? (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">US$</span>
                  <input
                    type="number"
                    step="0.05"
                    min="1"
                    required
                    value={reportedRateUsd}
                    onChange={(e) => setReportedRateUsd(Number(e.target.value))}
                    className="w-full pl-14 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Equivalente a cerca de R$ {(reportedRateUsd * usdToBrl).toFixed(2)} por hora aprovada.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Há algum bônus ou promoção ativa no momento?
                </label>
                <input
                  type="text"
                  value={promoDetails}
                  onChange={(e) => setPromoDetails(e.target.value)}
                  placeholder="Ex: Bônus de US$ 10 ao completar 5h até domingo"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Observações ou Prova (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="Ex: Anunciado no grupo oficial da KGeN hoje pela manhã..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingIntermediary(null)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Enviar Reporte de Divergência
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Lista de Intermediários */
          <div className="space-y-4 pt-4">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Cotação base atual: <strong className="text-white">1 USD = R$ {usdToBrl.toFixed(2)}</strong></span>
              <span className="text-[11px] text-emerald-400 font-medium">Verificado diariamente</span>
            </div>

            <div className="space-y-3">
              {intermediaries.map((item) => {
                const effectiveRate = Number(item.promo_rate_usd || item.current_rate_usd);
                const rateBrl = (effectiveRate * usdToBrl).toFixed(2);

                return (
                  <div
                    key={item.id}
                    className="bg-slate-950/50 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">{item.name}</h4>
                          {item.promo_rate_usd && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                              <Flame className="w-3 h-3" /> COM BÔNUS
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                        )}
                      </div>

                      {/* Taxa em Destaque */}
                      <div className="text-left sm:text-right">
                        <div className="flex items-baseline gap-1 sm:justify-end">
                          <span className="text-xl font-black text-white">
                            US$ {effectiveRate.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400">/ hora</span>
                        </div>
                        <p className="text-xs text-emerald-400 font-semibold">
                          ~ R$ {rateBrl} / hora
                        </p>
                      </div>
                    </div>

                    {/* Detalhes de Pagamento e Promoção */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Fechamento: <strong>{item.cutoff_day}</strong> ({item.payout_frequency})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Pagamento: <strong>{item.payout_methods}</strong></span>
                      </div>
                    </div>

                    {item.active_promotion && (
                      <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>Promoção:</strong> {item.active_promotion}</span>
                      </div>
                    )}

                    {/* Botão de Reportar Divergência */}
                    <div className="mt-3 pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleOpenReport(item)}
                        className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-all cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-900"
                      >
                        <Flag className="w-3 h-3" />
                        <span>O valor está diferente? Reportar divergência</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
