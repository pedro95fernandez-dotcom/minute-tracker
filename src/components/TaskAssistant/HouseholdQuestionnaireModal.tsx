import React, { useState } from 'react';
import type { HouseholdAnswers } from '../../types/database';
import {
  X,
  Check,
  Sparkles,
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
  Users,
  HelpCircle
} from 'lucide-react';
import {
  QUESTIONNAIRE_QUESTIONS,
  DEFAULT_HOUSEHOLD_ANSWERS,
  getFilteredRoutineTasks
} from '../../utils/routineTaskCatalog';

interface HouseholdQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnswers: HouseholdAnswers | null;
  onSave: (answers: HouseholdAnswers) => Promise<void>;
}

export const HouseholdQuestionnaireModal: React.FC<HouseholdQuestionnaireModalProps> = ({
  isOpen,
  onClose,
  currentAnswers,
  onSave,
}) => {
  const [answers, setAnswers] = useState<HouseholdAnswers>(
    currentAnswers || DEFAULT_HOUSEHOLD_ANSWERS
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const currentStats = getFilteredRoutineTasks(answers);

  const handleToggle = (key: keyof HouseholdAnswers) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleHousingType = (type: 'casa' | 'apartamento') => {
    setAnswers((prev) => ({
      ...prev,
      housingType: type,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(answers);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar questionário:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'CookingPot':
        return <CookingPot className="w-5 h-5 text-orange-400" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-sky-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Home':
        return <Home className="w-5 h-5 text-emerald-400" />;
      case 'TreePine':
        return <TreePine className="w-5 h-5 text-emerald-500" />;
      case 'Brush':
        return <Brush className="w-5 h-5 text-teal-400" />;
      case 'Dog':
        return <Dog className="w-5 h-5 text-pink-400" />;
      case 'Flower2':
        return <Flower2 className="w-5 h-5 text-green-400" />;
      case 'Car':
        return <Car className="w-5 h-5 text-blue-400" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-violet-400" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-emerald-400" />;
      case 'Fuel':
        return <Fuel className="w-5 h-5 text-amber-500" />;
      case 'Hotel':
        return <Hotel className="w-5 h-5 text-sky-400" />;
      case 'Waves':
        return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-orange-400" />;
      case 'Smile':
        return <Smile className="w-5 h-5 text-yellow-400" />;
      case 'Dumbbell':
        return <Dumbbell className="w-5 h-5 text-rose-400" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-indigo-400" />;
      case 'Boxes':
        return <Boxes className="w-5 h-5 text-amber-600" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-violet-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Perfil Residencial & Tarefas Minute
              </h2>
              <p className="text-xs text-slate-400">
                Responda com o que você tem em casa para gerarmos seu checklist diário e semanal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo dinâmico no topo */}
        <div className="px-5 py-3 bg-gradient-to-r from-violet-950/40 via-slate-900 to-emerald-950/30 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <HelpCircle className="w-4 h-4 text-violet-400 shrink-0" />
            <span>Baseado nas suas respostas atuais:</span>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <span className="text-emerald-400">
              ✓ {currentStats.allEligible.length} atividades compatíveis
            </span>
            <span className="text-violet-300">
              ⚡ ~{currentStats.potentialHoursPerWeek}h / semana
            </span>
          </div>
        </div>

        {/* Formulário com perguntas */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {QUESTIONNAIRE_QUESTIONS.map((q) => {
            const isChoice = q.type === 'choice';
            const booleanVal = Boolean(answers[q.key]);

            return (
              <div
                key={q.key}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {renderIcon(q.icon)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {q.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-tight">
                      {q.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {q.description}
                    </p>
                  </div>
                </div>

                {/* Controles de resposta */}
                <div className="w-full sm:w-auto shrink-0 flex items-center justify-end pt-1 sm:pt-0">
                  {isChoice && q.options ? (
                    <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-between">
                      {q.options.map((opt) => {
                        const selected = answers[q.key] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleHousingType(opt.value as 'casa' | 'apartamento')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              selected
                                ? 'bg-violet-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {opt.label.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(q.key)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          booleanVal ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                        role="switch"
                        aria-checked={booleanVal}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            booleanVal ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span
                        className={`text-xs font-bold min-w-10 text-right ${
                          booleanVal ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {booleanVal ? 'SIM' : 'NÃO'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </form>

        {/* Rodapé de Ação */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span>Salvando...</span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Salvar Perfil & Gerar Checklist</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
