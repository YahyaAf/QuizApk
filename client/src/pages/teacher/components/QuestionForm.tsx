import React from 'react';
import { Save, AlertCircle, CheckCircle2, Circle, CheckSquare, Square, Type, Hash, List, Plus, Trash2 } from 'lucide-react';
import type { QuestionItem } from './types';
import { QUESTION_TYPES } from './types';

interface QuestionFormProps {
  qForm: QuestionItem;
  setQForm: React.Dispatch<React.SetStateAction<QuestionItem>>;
  editingQIdx: number | null;
  savingQ: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export default function QuestionForm({
  qForm,
  setQForm,
  editingQIdx,
  savingQ,
  onSave,
  onCancel
}: QuestionFormProps) {
  const setChoice = (idx: number, field: 'label' | 'isCorrect', value: string | boolean) => {
    const choices = [...(qForm.choices ?? [])];
    choices[idx] = { ...choices[idx], [field]: value };
    setQForm((p) => ({ ...p, choices }));
  };

  const addChoice = () => {
    const choices = [...(qForm.choices ?? []), { label: '', isCorrect: false }];
    setQForm((p) => ({ ...p, choices }));
  };

  const removeChoice = (idx: number) => {
    const choices = [...(qForm.choices ?? [])];
    if (choices.length > 2) {
      choices.splice(idx, 1);
      setQForm((p) => ({ ...p, choices }));
    }
  };

  return (
    <div className="card p-8 border border-border-soft bg-white shadow-lg shadow-sky/5 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group rounded-2xl">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky via-blue-500 to-navy transform origin-left transition-transform duration-300" />
      
      <div className="flex items-center gap-4 mb-8 pb-5 border-b border-border-soft">
        <div className="w-12 h-12 rounded-xl bg-sky/10 flex items-center justify-center text-sky shadow-inner">
          {editingQIdx !== null ? <Save size={24} /> : <AlertCircle size={24} />}
        </div>
        <div>
          <h3 className="font-display font-black text-navy text-2xl">
            {editingQIdx !== null ? 'Modifier la question' : 'Nouvelle question'}
          </h3>
          <p className="text-muted text-sm font-semibold mt-1">
            {editingQIdx !== null ? 'Ajustez les détails de votre question' : 'Créez une nouvelle question pour cet examen'}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-8">
        {/* Question Text */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-navy">
            <Type size={18} className="text-sky" />
            Énoncé de la question
          </label>
          <textarea 
            className="w-full min-h-[140px] resize-none focus:ring-4 focus:ring-sky/20 focus:border-sky outline-none transition-all text-base leading-relaxed p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-navy font-medium shadow-sm"
            rows={5} 
            value={qForm.statement || ''}
            onChange={(e) => setQForm((p) => ({ ...p, statement: e.target.value }))}
            placeholder="Rédigez l'énoncé de la question de façon claire et concise..." 
          />
        </div>
        
        {/* Type & Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-navy">
              <List size={18} className="text-sky" />
              Type de question
            </label>
            <div className="relative">
              <select 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer appearance-none pr-10 focus:ring-4 focus:ring-sky/20 focus:border-sky transition-all font-semibold text-navy outline-none shadow-sm"
                value={qForm.type}
                onChange={(e) => setQForm((p) => ({ ...p, type: e.target.value as QuestionItem['type'] }))}
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="14" height="10" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-navy">
              <Hash size={18} className="text-sky" />
              Points attribués
            </label>
            <input 
              type="number" 
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:ring-4 focus:ring-sky/20 focus:border-sky transition-all font-bold text-lg text-center text-navy outline-none shadow-sm"
              min={1} 
              value={qForm.points || 1}
              onChange={(e) => setQForm((p) => ({ ...p, points: +e.target.value }))} 
            />
          </div>
        </div>

        {/* Choices for MCQ / True-False */}
        {(qForm.type === 'SINGLE_CHOICE' || qForm.type === 'MULTIPLE_CHOICE') && (
          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-base font-bold text-navy flex items-center gap-2">
                <CheckCircle2 size={20} className="text-sky" />
                Choix de réponses
              </label>
              <span className="text-xs text-sky-700 font-bold bg-sky-100 px-3 py-1.5 rounded-lg shadow-sm border border-sky-200">
                Cochez la ou les bonnes réponses
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {(qForm.choices ?? []).map((choice, idx) => {
                const isChecked = choice.isCorrect;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 border-2 ${isChecked ? 'bg-sky-50 border-sky-400 shadow-sm' : 'bg-white border-slate-200 hover:border-sky-200 shadow-sm'} group/choice`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (qForm.type === 'SINGLE_CHOICE') {
                          const choices = qForm.choices!.map((c, i) => ({ ...c, isCorrect: i === idx }));
                          setQForm((p) => ({ ...p, choices }));
                        } else {
                          setChoice(idx, 'isCorrect', !choice.isCorrect);
                        }
                      }}
                      className={`flex items-center justify-center w-12 h-12 rounded-lg shrink-0 transition-all duration-300 ${isChecked ? 'bg-sky text-white shadow-md scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-navy cursor-pointer'}`}
                      title={isChecked ? 'Marquer comme incorrecte' : 'Marquer comme correcte'}
                    >
                      {qForm.type === 'MULTIPLE_CHOICE' ? (
                        isChecked ? <CheckSquare size={24} /> : <Square size={24} />
                      ) : (
                        isChecked ? <CheckCircle2 size={24} /> : <Circle size={24} />
                      )}
                    </button>
                    
                    <input 
                      className={`flex-1 h-12 px-3 border-none shadow-none focus:ring-0 bg-transparent text-base outline-none transition-colors ${isChecked ? 'font-bold text-navy' : 'font-medium text-slate-700 focus:text-navy'}`}
                      value={choice.label || ''}
                      onChange={(e) => setChoice(idx, 'label', e.target.value)}
                      placeholder={`Texte de l'option ${String.fromCharCode(65 + idx)}`} 
                    />

                    {(qForm.choices ?? []).length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(idx)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg text-rose-400 bg-rose-50 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover/choice:opacity-100 focus:opacity-100 shrink-0 mr-1 shadow-sm"
                        title="Supprimer cette option"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
              
              <button
                type="button"
                onClick={addChoice}
                className="flex items-center justify-center gap-2 mt-3 py-3.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:text-sky-600 hover:border-sky-400 hover:bg-sky-50 transition-all font-bold text-sm bg-white"
              >
                <Plus size={18} /> Ajouter une option supplémentaire
              </button>
            </div>
          </div>
        )}

        {qForm.type === 'TRUE_FALSE' && (
          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 space-y-5">
            <label className="text-base font-bold text-navy flex items-center gap-2">
              <CheckCircle2 size={20} className="text-sky" />
              Quelle est l'affirmation correcte ?
            </label>
            <div className="flex gap-5">
              {['Vrai', 'Faux'].map((opt) => {
                const isCorrect = (opt === 'Vrai' && qForm.choices?.[0]?.isCorrect) || (opt === 'Faux' && qForm.choices?.[1]?.isCorrect);
                return (
                  <button 
                    key={opt} 
                    type="button" 
                    onClick={() => setQForm((p) => ({ 
                      ...p, 
                      choices: [{ label: 'Vrai', isCorrect: opt === 'Vrai' }, { label: 'Faux', isCorrect: opt === 'Faux' }] 
                    }))}
                    className={`flex-1 py-5 px-6 rounded-xl border-2 font-black text-xl transition-all flex items-center justify-center gap-3 ${
                      isCorrect 
                        ? 'border-sky bg-sky/10 text-sky shadow-lg scale-[1.02]' 
                        : 'border-slate-200 bg-white text-slate-400 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600'
                    }`}
                  >
                    {opt === 'Vrai' ? <CheckCircle2 size={28} className={isCorrect ? 'text-sky' : 'text-emerald-500 opacity-50'} /> : <AlertCircle size={28} className={isCorrect ? 'text-sky' : 'text-rose-500 opacity-50'} />}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-slate-200 mt-2">
          {editingQIdx !== null && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 hover:text-navy transition-all"
            >
              Annuler les modifications
            </button>
          )}
          <button 
            type="button" 
            onClick={onSave} 
            disabled={savingQ || !(qForm.statement || '').trim()}
            className="flex-1 py-4 px-6 rounded-xl bg-navy text-white font-bold text-base hover:bg-sky-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {savingQ ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save size={22} /> {editingQIdx !== null ? 'Enregistrer les modifications' : 'Ajouter cette question'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
