import React from 'react';
import {
  Save, AlertCircle, CheckCircle2, Circle, Type, Hash, List,
  Plus, Trash2, AlignLeft,
} from 'lucide-react';
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

/* ── Lettre de l'option ── */
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function QuestionForm({
  qForm,
  setQForm,
  editingQIdx,
  savingQ,
  onSave,
  onCancel,
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

  const isEditing = editingQIdx !== null;
  const canSave   = (qForm.statement || '').trim().length > 0;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #DDE8F0',
      borderRadius: 20,
      boxShadow: '0 4px 24px rgba(5,63,92,0.07)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Top accent bar ── */}
      <div style={{
        height: 4,
        background: isEditing
          ? 'linear-gradient(90deg, #F7AD19, #D9930F)'
          : 'linear-gradient(90deg, #429EBD, #053F5C)',
      }} />

      {/* ── Header ── */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid #EBF2F8',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: isEditing ? '#FEF9EC' : '#EBF5FB',
          border: `1.5px solid ${isEditing ? '#FBD98A' : '#C3D9E8'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isEditing
            ? <Save size={22} color="#D9930F" />
            : <AlertCircle size={22} color="#429EBD" />}
        </div>
        <div>
          <h3 style={{ fontWeight: 900, color: '#053F5C', fontSize: 18, fontFamily: 'inherit' }}>
            {isEditing ? 'Modifier la question' : 'Nouvelle question'}
          </h3>
          <p style={{ fontSize: 13, color: '#6B9AB8', fontWeight: 600, marginTop: 2 }}>
            {isEditing ? 'Ajustez les détails de votre question' : 'Créez une nouvelle question pour cet examen'}
          </p>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', flex: 1 }}>

        {/* Énoncé */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: '#053F5C' }}>
            <Type size={15} color="#429EBD" />
            Énoncé de la question <span style={{ color: '#E11D48', marginLeft: 2 }}>*</span>
          </label>
          <textarea
            rows={4}
            value={qForm.statement || ''}
            onChange={(e) => setQForm((p) => ({ ...p, statement: e.target.value }))}
            placeholder="Rédigez l'énoncé de la question de façon claire et concise..."
            style={{
              width: '100%', resize: 'vertical', minHeight: 110,
              padding: '12px 14px', borderRadius: 12, outline: 'none',
              border: '2px solid #DDE8F0',
              background: '#F8FBFD', fontSize: 14, fontFamily: 'inherit',
              color: '#053F5C', fontWeight: 500, lineHeight: 1.6,
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#429EBD'; e.currentTarget.style.background = '#fff'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#DDE8F0'; e.currentTarget.style.background = '#F8FBFD'; }}
          />
        </div>

        {/* Type + Points */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14 }}>
          {/* Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: '#053F5C' }}>
              <List size={15} color="#429EBD" />
              Type de question
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={qForm.type}
                onChange={(e) => {
                  const newType = e.target.value as QuestionItem['type'];
                  // Reset choices when switching type
                  let choices = qForm.choices;
                  if (newType === 'TRUE_FALSE') {
                    choices = [{ label: 'Vrai', isCorrect: true }, { label: 'Faux', isCorrect: false }];
                  } else if (newType === 'TEXT') {
                    choices = [];
                  } else if (!choices || choices.length < 2) {
                    choices = [
                      { label: '', isCorrect: true },
                      { label: '', isCorrect: false },
                      { label: '', isCorrect: false },
                      { label: '', isCorrect: false },
                    ];
                  }
                  setQForm((p) => ({ ...p, type: newType, choices }));
                }}
                style={{
                  width: '100%', height: 44, paddingLeft: 12, paddingRight: 36,
                  borderRadius: 10, border: '2px solid #DDE8F0',
                  background: '#F8FBFD', fontSize: 13.5, fontFamily: 'inherit',
                  fontWeight: 700, color: '#053F5C', outline: 'none',
                  appearance: 'none', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#429EBD'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#DDE8F0'; }}
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B9AB8' }}>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          {/* Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: '#053F5C' }}>
              <Hash size={15} color="#429EBD" />
              Points
            </label>
            <input
              type="number"
              min={1}
              value={qForm.points || 1}
              onChange={(e) => setQForm((p) => ({ ...p, points: +e.target.value }))}
              style={{
                width: 80, height: 44, textAlign: 'center',
                borderRadius: 10, border: '2px solid #DDE8F0',
                background: '#F8FBFD', fontSize: 16,
                fontWeight: 900, color: '#053F5C', outline: 'none',
                transition: 'border-color 0.2s', fontFamily: 'inherit',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#429EBD'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#DDE8F0'; }}
            />
          </div>
        </div>

        {/* ── QCM choix unique ou multiple ── */}
        {(qForm.type === 'SINGLE_CHOICE' || qForm.type === 'MULTIPLE_CHOICE') && (
          <div style={{
            background: '#F8FBFD', borderRadius: 14,
            border: '1.5px solid #DDE8F0', padding: '16px 18px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {/* Header de la section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="#429EBD" />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#053F5C' }}>Choix de réponses</span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: qForm.type === 'MULTIPLE_CHOICE' ? '#EBF5FB' : '#F0FDF4',
                color: qForm.type === 'MULTIPLE_CHOICE' ? '#429EBD' : '#16A34A',
                border: `1px solid ${qForm.type === 'MULTIPLE_CHOICE' ? '#C3D9E8' : '#86EFAC'}`,
                padding: '3px 10px', borderRadius: 999,
              }}>
                {qForm.type === 'MULTIPLE_CHOICE' ? '☑ Plusieurs bonnes réponses possibles' : '◉ Une seule bonne réponse'}
              </span>
            </div>

            {/* Liste des options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(qForm.choices ?? []).map((choice, idx) => {
                const isCorrect = choice.isCorrect;
                const letter = LETTERS[idx] || String(idx + 1);

                const handleToggle = () => {
                  if (qForm.type === 'SINGLE_CHOICE') {
                    const choices = qForm.choices!.map((c, i) => ({ ...c, isCorrect: i === idx }));
                    setQForm((p) => ({ ...p, choices }));
                  } else {
                    setChoice(idx, 'isCorrect', !choice.isCorrect);
                  }
                };

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 12,
                      background: isCorrect ? '#F0FDF4' : '#fff',
                      border: `2px solid ${isCorrect ? '#86EFAC' : '#DDE8F0'}`,
                      transition: 'all 0.18s',
                      boxShadow: isCorrect ? '0 2px 8px rgba(22,163,74,0.08)' : '0 1px 3px rgba(5,63,92,0.04)',
                    }}
                  >
                    {/* Lettre */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 900,
                      background: isCorrect ? '#16A34A' : '#EBF2F8',
                      color: isCorrect ? '#fff' : '#6B9AB8',
                      transition: 'all 0.18s',
                    }}>
                      {letter}
                    </div>

                    {/* Input texte */}
                    <input
                      value={choice.label || ''}
                      onChange={(e) => setChoice(idx, 'label', e.target.value)}
                      placeholder={`Option ${letter}...`}
                      style={{
                        flex: 1, height: 36, padding: '0 10px',
                        border: 'none', background: 'transparent', outline: 'none',
                        fontSize: 14, fontFamily: 'inherit',
                        fontWeight: isCorrect ? 700 : 500,
                        color: isCorrect ? '#166534' : '#053F5C',
                      }}
                    />

                    {/* Checkbox / Radio cliquable */}
                    <button
                      type="button"
                      onClick={handleToggle}
                      title={isCorrect ? 'Marquer comme incorrecte' : 'Marquer comme correcte'}
                      style={{
                        width: 36, height: 36, borderRadius: qForm.type === 'MULTIPLE_CHOICE' ? 8 : '50%',
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2.5px solid ${isCorrect ? '#16A34A' : '#C3D9E8'}`,
                        background: isCorrect ? '#16A34A' : '#fff',
                        cursor: 'pointer', transition: 'all 0.18s',
                        boxShadow: isCorrect ? '0 2px 8px rgba(22,163,74,0.3)' : 'none',
                      }}
                    >
                      {isCorrect && (
                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                          <path d="M1.5 6L5.5 10L14.5 1.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>

                    {/* Supprimer */}
                    {(qForm.choices ?? []).length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(idx)}
                        title="Supprimer cette option"
                        style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid #FECDD3', background: '#FFF1F2',
                          color: '#E11D48', cursor: 'pointer', transition: 'all 0.18s',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#E11D48'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFF1F2'; (e.currentTarget as HTMLButtonElement).style.color = '#E11D48'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ajouter option */}
            <button
              type="button"
              onClick={addChoice}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '10px', borderRadius: 10,
                border: '2px dashed #C3D9E8', background: '#fff',
                color: '#6B9AB8', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit',
                marginTop: 2,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#429EBD';
                (e.currentTarget as HTMLButtonElement).style.color = '#429EBD';
                (e.currentTarget as HTMLButtonElement).style.background = '#EBF5FB';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#C3D9E8';
                (e.currentTarget as HTMLButtonElement).style.color = '#6B9AB8';
                (e.currentTarget as HTMLButtonElement).style.background = '#fff';
              }}
            >
              <Plus size={16} /> Ajouter une option
            </button>
          </div>
        )}

        {/* ── Vrai / Faux ── */}
        {qForm.type === 'TRUE_FALSE' && (
          <div style={{
            background: '#F8FBFD', borderRadius: 14,
            border: '1.5px solid #DDE8F0', padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <CheckCircle2 size={16} color="#429EBD" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#053F5C' }}>Quelle est l'affirmation correcte ?</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['Vrai', 'Faux'] as const).map((opt) => {
                const isCorrect = (opt === 'Vrai' && qForm.choices?.[0]?.isCorrect) || (opt === 'Faux' && qForm.choices?.[1]?.isCorrect);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setQForm((p) => ({
                      ...p,
                      choices: [{ label: 'Vrai', isCorrect: opt === 'Vrai' }, { label: 'Faux', isCorrect: opt === 'Faux' }],
                    }))}
                    style={{
                      flex: 1, padding: '16px 12px', borderRadius: 12,
                      border: `2.5px solid ${isCorrect ? (opt === 'Vrai' ? '#16A34A' : '#E11D48') : '#DDE8F0'}`,
                      background: isCorrect ? (opt === 'Vrai' ? '#F0FDF4' : '#FFF1F2') : '#fff',
                      color: isCorrect ? (opt === 'Vrai' ? '#16A34A' : '#E11D48') : '#6B9AB8',
                      fontWeight: 900, fontSize: 18, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      transition: 'all 0.2s', fontFamily: 'inherit',
                      boxShadow: isCorrect ? `0 4px 14px ${opt === 'Vrai' ? 'rgba(22,163,74,0.18)' : 'rgba(225,29,72,0.18)'}` : '0 1px 3px rgba(5,63,92,0.05)',
                      transform: isCorrect ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    {opt === 'Vrai' ? (
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <circle cx="11" cy="11" r="10" fill={isCorrect ? '#16A34A' : '#DDE8F0'} />
                        <path d="M6 11.5L9.5 15L16 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <circle cx="11" cy="11" r="10" fill={isCorrect ? '#E11D48' : '#DDE8F0'} />
                        <path d="M7.5 7.5L14.5 14.5M14.5 7.5L7.5 14.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    )}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Question texte (info) ── */}
        {qForm.type === 'TEXT' && (
          <div style={{
            background: '#FEF9EC', borderRadius: 14,
            border: '1.5px solid #FBD98A', padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <AlignLeft size={18} color="#D9930F" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#8C5D07', marginBottom: 4 }}>Question à réponse libre</div>
              <p style={{ fontSize: 12.5, color: '#A0620A', margin: 0, lineHeight: 1.5 }}>
                L'étudiant saisira sa réponse en texte libre. La correction sera effectuée manuellement par le professeur.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer fixe — Bouton toujours visible ── */}
      <div style={{
        padding: '14px 24px',
        borderTop: '1.5px solid #EBF2F8',
        background: '#FAFCFE',
        display: 'flex', gap: 10,
        flexShrink: 0,
      }}>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '11px 18px', borderRadius: 10,
              border: '2px solid #DDE8F0', background: '#fff',
              color: '#6B9AB8', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#429EBD'; (e.currentTarget as HTMLButtonElement).style.color = '#053F5C'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#DDE8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#6B9AB8'; }}
          >
            Annuler
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={savingQ || !canSave}
          style={{
            flex: 1, padding: '12px 20px', borderRadius: 10,
            border: 'none',
            background: !canSave
              ? '#C3D9E8'
              : isEditing
              ? 'linear-gradient(135deg, #F7AD19, #D9930F)'
              : 'linear-gradient(135deg, #429EBD, #053F5C)',
            color: '#fff',
            fontWeight: 800, fontSize: 14.5,
            cursor: !canSave ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'inherit', transition: 'all 0.2s',
            boxShadow: canSave ? '0 4px 14px rgba(5,63,92,0.2)' : 'none',
            opacity: savingQ ? 0.75 : 1,
          }}
        >
          {savingQ ? (
            <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <>
              <Save size={18} />
              {isEditing ? 'Enregistrer les modifications' : 'Ajouter cette question'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
