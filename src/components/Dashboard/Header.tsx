import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Copy,
  Check,
  LogOut,
  Plus,
  TrendingUp,
  Settings,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

interface HeaderProps {
  onOpenNewTask: () => void;
  onOpenIntermediaries: () => void;
  onOpenSettings: () => void;
  activeTab: 'dashboard' | 'assistant';
  onChangeTab: (tab: 'dashboard' | 'assistant') => void;
  pendingTasksCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTask,
  onOpenIntermediaries,
  onOpenSettings,
  activeTab,
  onChangeTab,
  pendingTasksCount,
}) => {
  const { user, profile, currentTeam, signOut } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = () => {
    if (currentTeam?.invite_code) {
      navigator.clipboard.writeText(currentTeam.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Team */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                {currentTeam?.name || 'Minute Tracker'}
              </h1>
              {currentTeam?.invite_code && (
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  title="Código de convite da equipe (clique para copiar)"
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-xs font-mono font-semibold transition-all cursor-pointer"
                >
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>{currentTeam.invite_code}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile?.full_name || user?.email?.split('@')[0]}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Painel vs Assistente) */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onChangeTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Painel</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('assistant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'assistant'
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Assistente</span>
            {pendingTasksCount !== undefined && pendingTasksCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-violet-500 text-slate-950 text-[10px] font-black">
                {pendingTasksCount}
              </span>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenIntermediaries}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Ver catálogo de taxas e cotações"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Cotações & Bônus</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Configurações da Equipe"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenNewTask}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Gravação</span>
          </button>

          <button
            type="button"
            onClick={signOut}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer ml-1"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
