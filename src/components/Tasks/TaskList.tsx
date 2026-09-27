import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Task, TaskStatus } from '../../types/database';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Banknote,
  Trash2,
  XCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  selectedMemberId: string | null;
  onRefresh: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedMemberId,
  onRefresh,
}) => {
  const [rejectingTaskId, setRejectingTaskId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filtrar por membro selecionado
  const filteredTasks = selectedMemberId
    ? tasks.filter((t) => t.member_id === selectedMemberId)
    : tasks;

  const updateStatus = async (taskId: string, newStatus: TaskStatus, reason?: string) => {
    try {
      setProcessingId(taskId);
      const updates: { status: TaskStatus; rejection_reason?: string | null } = {
        status: newStatus,
      };
      if (newStatus === 'rejected') {
        updates.rejection_reason = reason || 'Não atendeu aos critérios de enquadramento/iluminação';
      } else {
        updates.rejection_reason = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    } finally {
      setProcessingId(null);
      setRejectingTaskId(null);
      setRejectionReason('');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Deseja realmente excluir este registro de gravação?')) return;
    try {
      setProcessingId(taskId);
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'analyzing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> Em Análise
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> Aprovado
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Banknote className="w-3.5 h-3.5" /> Pago
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" /> Rejeitado
          </span>
        );
    }
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-slate-800/80 text-slate-400 mb-3">
          <Sparkles className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-base font-semibold text-white">Nenhuma gravação registrada</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          Clique no botão "Nova Gravação" para registrar sua primeira tarefa do Minute Data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Histórico de Gravações ({filteredTasks.length})
        </h3>
        <span className="text-xs text-slate-500">Ordene ou mude o status</span>
      </div>

      <div className="space-y-2.5">
        {filteredTasks.map((task) => {
          const isProcessing = processingId === task.id;

          return (
            <div
              key={task.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Info Principal */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(task.status)}
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-semibold text-slate-300">
                      {task.member?.nickname || 'Membro'}
                    </span>
                    {task.intermediary && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[11px] text-slate-400">
                        {task.intermediary.name}
                      </span>
                    )}
                    {task.external_task_code && (
                      <span className="text-[11px] font-mono text-slate-500">
                        #{task.external_task_code}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white tracking-tight">
                    {task.category_name}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {task.duration_minutes} min ({(task.duration_minutes / 60).toFixed(1)}h)
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(task.task_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Valores e Ações Rápidas */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-black text-white leading-tight">
                      R$ {Number(task.calculated_brl).toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      US$ {Number(task.calculated_usd).toFixed(2)}
                    </p>
                  </div>

                  {/* Botões de Ação de 1 Toque */}
                  <div className="flex items-center gap-1.5">
                    {task.status === 'analyzing' && (
                      <>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => updateStatus(task.id, 'approved')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                          title="Aprovar gravação"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => setRejectingTaskId(task.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                          title="Rejeitar gravação com motivo"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rejeitar
                        </button>
                      </>
                    )}

                    {task.status === 'approved' && (
                      <>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => updateStatus(task.id, 'paid')}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                          title="Marcar como valor pago no PIX/banco"
                        >
                          <Banknote className="w-3.5 h-3.5" /> Marcar Pago
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => updateStatus(task.id, 'analyzing')}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                          title="Voltar para em análise"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {task.status === 'paid' && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => updateStatus(task.id, 'approved')}
                        className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs transition-all cursor-pointer flex items-center gap-1"
                        title="Desfazer marcação de pago"
                      >
                        <RotateCcw className="w-3 h-3" /> Desfazer
                      </button>
                    )}

                    {task.status === 'rejected' && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => updateStatus(task.id, 'analyzing')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reenviar / Reavaliar
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer ml-1"
                      title="Excluir gravação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Exibição de motivo de rejeição se houver */}
              {task.status === 'rejected' && task.rejection_reason && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>
                    <strong>Motivo da recusa:</strong> {task.rejection_reason}
                  </span>
                </div>
              )}

              {/* Modal inline de rejeição */}
              {rejectingTaskId === task.id && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-rose-400">
                    Qual foi o motivo da rejeição pelo intermediário?
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ex: Mão saiu do campo de visão, luz baixa, celular inclinado..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectingTaskId(null)}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(task.id, 'rejected', rejectionReason)}
                      className="px-3 py-1 rounded-lg bg-rose-500 text-white font-semibold text-xs hover:bg-rose-400"
                    >
                      Confirmar Rejeição
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
