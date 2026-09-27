import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  X,
  Settings,
  Users,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Clock,
  Target
} from 'lucide-react';

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamSettingsModal: React.FC<TeamSettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentTeam, members, updateTeamSettings, joinTeamWithCode } = useAuth();

  const [teamName, setTeamName] = useState(currentTeam?.name || '');
  const [weeklyGoalBrl, setWeeklyGoalBrl] = useState<number>(currentTeam?.weekly_goal_brl || 500);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState<number>(currentTeam?.weekly_goal_hours || 20);
  const [dailyGoalHours, setDailyGoalHours] = useState<number>(currentTeam?.daily_goal_hours || 3);
  const [usdRate, setUsdRate] = useState<number>(currentTeam?.usd_to_brl_rate || 5.15);

  // Estados para entrar em outra equipe com código
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinSuccessMsg, setJoinSuccessMsg] = useState('');
  const [joinErrorMsg, setJoinErrorMsg] = useState('');

  const [fetchingRate, setFetchingRate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentTeam) {
      setTeamName(currentTeam.name);
      setWeeklyGoalBrl(Number(currentTeam.weekly_goal_brl) || 500);
      setWeeklyGoalHours(Number(currentTeam.weekly_goal_hours) || 20);
      setDailyGoalHours(Number(currentTeam.daily_goal_hours) || 3);
      setUsdRate(Number(currentTeam.usd_to_brl_rate) || 5.15);
    }
  }, [currentTeam]);

  const handleCopyCode = () => {
    if (currentTeam?.invite_code) {
      navigator.clipboard.writeText(currentTeam.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsapp = () => {
    if (!currentTeam) return;
    const text = encodeURIComponent(
      `Oi! Criei nosso painel de gerenciamento de gravações do Minute Data. Entre no app e use o código de convite: *${currentTeam.invite_code}* para entrarmos na mesma equipe!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const fetchLiveExchangeRate = async () => {
    try {
      setFetchingRate(true);
      const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
      const data = await res.json();
      if (data?.USDBRL?.bid) {
        setUsdRate(Number(parseFloat(data.USDBRL.bid).toFixed(2)));
      }
    } catch (err) {
      console.error('Erro ao buscar cotação:', err);
    } finally {
      setFetchingRate(false);
    }
  };

  const handleJoinOtherTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setJoining(true);
    setJoinErrorMsg('');
    setJoinSuccessMsg('');

    try {
      const joinedTeam = await joinTeamWithCode(joinCodeInput.trim());
      setJoinSuccessMsg(`Sucesso! Você agora faz parte da equipe "${joinedTeam.name}".`);
      setJoinCodeInput('');
      setTimeout(() => {
        setJoinSuccessMsg('');
        onClose();
      }, 1800);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setJoinErrorMsg(error.message || 'Código de convite inválido ou erro ao entrar na equipe.');
    } finally {
      setJoining(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;

    setSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      await updateTeamSettings({
        name: teamName.trim(),
        weekly_goal_brl: weeklyGoalBrl,
        weekly_goal_hours: weeklyGoalHours,
        daily_goal_hours: dailyGoalHours,
        usd_to_brl_rate: usdRate,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Erro ao atualizar configurações:', error);
      setErrorMsg(error.message || 'Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Configurações</h2>
              <p className="text-xs text-slate-400">Equipe, metas financeiras e membros</p>
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

        {savedSuccess && (
          <div className="my-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}

        {errorMsg && (
          <div className="my-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Bloco 1: Convidar Parceiro(a) com este código */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" /> Código da Sua Equipe Atual
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Compartilhar</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 py-2.5 px-4 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-center font-bold tracking-widest text-lg">
              {currentTeam?.invite_code}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              title="Copiar código"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsapp}
              className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-500/20"
              title="Enviar no WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Envie este código para outra pessoa entrar nesta mesma equipe.
          </p>
        </div>

        {/* Bloco 2: Entrar na Equipe de Outra Pessoa com Código */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" /> Entrar na Equipe de Outra Pessoa
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Código de 6 dígitos</span>
          </div>

          <p className="text-xs text-slate-300">
            Sua esposa ou parceiro já criou uma equipe? Digite o código de convite dele(a) abaixo para juntar suas contas no mesmo painel:
          </p>

          <form onSubmit={handleJoinOtherTeam} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="Ex: AB12CD"
                maxLength={6}
                className="flex-1 py-2.5 px-4 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-center font-bold tracking-widest text-base uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={joining || !joinCodeInput.trim()}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Entrar na Equipe</span>
              </button>
            </div>

            {joinSuccessMsg && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{joinSuccessMsg}</span>
              </p>
            )}

            {joinErrorMsg && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{joinErrorMsg}</span>
              </p>
            )}
          </form>
        </div>

        {/* Membros Atuais da Equipe Conectada */}
        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Membros Conectados ({members.length})
          </label>
          <div className="space-y-1.5">
            {members.map((m) => (
              <div
                key={m.id}
                className="px-3.5 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                    {m.nickname.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-white">{m.nickname}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 font-medium">
                  {m.role === 'owner' ? 'Criador(a)' : 'Parceiro(a)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário de Configurações da Equipe */}
        <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-slate-800 mt-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Nome da Equipe
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" /> Meta Semanal (R$)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={weeklyGoalBrl}
                onChange={(e) => setWeeklyGoalBrl(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Horas / Dia
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={dailyGoalHours}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDailyGoalHours(val);
                  setWeeklyGoalHours(Math.round(val * 6));
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Horas / Semana
              </label>
              <input
                type="number"
                min="1"
                value={weeklyGoalHours}
                onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cotação do Dólar (R$/USD)
              </label>
              <button
                type="button"
                onClick={fetchLiveExchangeRate}
                disabled={fetchingRate}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${fetchingRate ? 'animate-spin' : ''}`} />
                Atualizar cotação agora
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              value={usdRate}
              onChange={(e) => setUsdRate(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 mt-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
};
