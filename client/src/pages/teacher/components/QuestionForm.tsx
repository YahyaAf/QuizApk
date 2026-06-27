import React from 'react';
import { Save } from 'lucide-react';
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
  const setChoice = (idx: number, field: 'text' | 'correct', value: string | boolean) => {
    const choices = [...(qForm.choices ?? [])];
    choices[idx] = { ...choices[idx], [field]: value };
    setQForm((p) => ({ ...p, choices }));
  };

  return (
    <div className="card p-6 border border-border-soft">
      <h3 className="font-bold text-navy text-lg mb-5 flex items-center gap-2">
        {editingQIdx !== null ? '✏️ Modifier la question' : '➕ Ajouter une question'}
      </h3>
      
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-navy mb-2">Texte de la question</label>
          <textarea 
            className="input-field min-h-[100px]" 
            rows={3} 
            value={qForm.text}
            onChange={(e) => setQForm((p) => ({ ...p, text: e.target.value }))}
            placeholder="Saisissez votre question..." 
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-bold text-navy mb-2">Type</label>
            <select 
              className="input-field h-11 bg-white cursor-pointer" 
              value={qForm.type}
              onChange={(e) => setQForm((p) => ({ ...p, type: e.target.value as QuestionItem['type'] }))}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-2">Points</label>
            <input 
              type="number" 
              className="input-field h-11" 
              min={1} 
              value={qForm.points}
              onChange={(e) => setQForm((p) => ({ ...p, points: +e.target.value }))} 
            />
          </div>
        </div>

        {/* Choices for MCQ / True-False */}
        {(qForm.type === 'SINGLE_CHOICE' || qForm.type === 'MULTIPLE_CHOICE') && (
          <div className="bg-bg/50 p-4 rounded-xl border border-border-soft">
            <label className="block text-sm font-bold text-navy mb-4">Choix de réponses</label>
            <div className="flex flex-col gap-3">
              {(qForm.choices ?? []).map((choice, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-border shrink-0">
                    <input 
                      type={qForm.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                      checked={choice.correct} 
                      onChange={() => {
                        if (qForm.type === 'SINGLE_CHOICE') {
                          const choices = qForm.choices!.map((c, i) => ({ ...c, correct: i === idx }));
                          setQForm((p) => ({ ...p, choices }));
                        } else {
                          setChoice(idx, 'correct', !choice.correct);
                        }
                      }}
                      className="w-4 h-4 accent-navy cursor-pointer" 
                    />
                  </div>
                  <input 
                    className="input-field h-10 bg-white" 
                    value={choice.text}
                    onChange={(e) => setChoice(idx, 'text', e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {qForm.type === 'TRUE_FALSE' && (
          <div className="bg-bg/50 p-4 rounded-xl border border-border-soft">
            <label className="block text-sm font-bold text-navy mb-4">Réponse correcte</label>
            <div className="flex gap-4">
              {['Vrai', 'Faux'].map((opt) => {
                const isCorrect = (opt === 'Vrai' && qForm.choices?.[0]?.correct) || (opt === 'Faux' && qForm.choices?.[1]?.correct);
                return (
                  <button 
                    key={opt} 
                    type="button" 
                    onClick={() => setQForm((p) => ({ 
                      ...p, 
                      choices: [{ text: 'Vrai', correct: opt === 'Vrai' }, { text: 'Faux', correct: opt === 'Faux' }] 
                    }))}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                      isCorrect 
                        ? 'border-navy bg-navy/5 text-navy shadow-sm' 
                        : 'border-border bg-white text-muted hover:border-sky/50'
                    }`}
                  >
                    {opt === 'Vrai' ? '✅ Vrai' : '❌ Faux'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {editingQIdx !== null && (
            <button type="button" onClick={onCancel} className="btn btn-ghost flex-1 py-3">Annuler</button>
          )}
          <button 
            type="button" 
            onClick={onSave} 
            disabled={savingQ || !qForm.text.trim()}
            className="btn btn-primary flex-2 py-3 w-full"
          >
            {savingQ ? (
              <div className="spinner w-4 h-4 border-2 border-white/20 border-t-white" />
            ) : (
              <><Save size={18} /> {editingQIdx !== null ? 'Mettre à jour' : 'Ajouter'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
