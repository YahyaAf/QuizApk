import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Sparkles, Edit3, Trash2, Plus, BookOpen, Clock,
  Brain, PenLine, ChevronRight, CheckCircle2, Hash, List, Type,
  Save, AlertCircle, AlignLeft, FileText, Upload, AlertTriangle, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { questionService, aiService, examService } from '../../services/examService';
import type { ExamItem, QuestionItem } from './components/types';
import { QUESTION_TYPES } from './components/types';

/* ─── Default form state ─────────────────────────────────────────── */
const DEFAULT_Q_FORM: QuestionItem = {
  statement: '',
  type: 'SINGLE_CHOICE',
  points: 5,
  choices: [
    { label: '', isCorrect: true },
    { label: '', isCorrect: false },
    { label: '', isCorrect: false },
    { label: '', isCorrect: false },
  ],
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/* ─── Shared input style helpers ─────────────────────────────────── */
const baseInput: React.CSSProperties = {
  width: '100%',
  borderRadius: 10,
  border: '1.5px solid #DDE8F0',
  padding: '9px 13px',
  fontSize: 13.5,
  fontWeight: 500,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  outline: 'none',
  background: '#F8FBFD',
  color: '#053F5C',
  transition: 'border-color 0.18s, box-shadow 0.18s',
  height: 40,
};

function focusStyle(el: HTMLElement, color = '#429EBD') {
  el.style.borderColor = color;
  el.style.boxShadow = `0 0 0 3px ${color}26`;
  el.style.background = '#fff';
}
function blurStyle(el: HTMLElement) {
  el.style.borderColor = '#DDE8F0';
  el.style.boxShadow = 'none';
  el.style.background = '#F8FBFD';
}

/* ─── Section label ──────────────────────────────────────────────── */
function SLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 800, color: '#053F5C', marginBottom: 6 }}>
      {icon} {children}
    </label>
  );
}

/* ══════════════════════════════════════════════════════════════════
   QUESTION FORM TAB
══════════════════════════════════════════════════════════════════ */
function QuestionFormTab({
  qForm, setQForm, editingQIdx, savingQ, onSave, onCancel,
}: {
  qForm: QuestionItem;
  setQForm: React.Dispatch<React.SetStateAction<QuestionItem>>;
  editingQIdx: number | null;
  savingQ: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isEditing = editingQIdx !== null;
  const canSave = (qForm.statement || '').trim().length > 0;

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
    if (choices.length > 2) { choices.splice(idx, 1); setQForm((p) => ({ ...p, choices })); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Énoncé ── */}
      <div>
        <SLabel icon={<Type size={14} color="#429EBD" />}>
          Énoncé de la question <span style={{ color: '#E11D48', marginLeft: 3 }}>*</span>
        </SLabel>
        <textarea
          rows={4}
          value={qForm.statement || ''}
          onChange={(e) => setQForm((p) => ({ ...p, statement: e.target.value }))}
          placeholder="Rédigez l'énoncé de la question de façon claire et concise…"
          style={{ ...baseInput, height: 'auto', resize: 'vertical', minHeight: 100, lineHeight: 1.6, paddingTop: 10, paddingBottom: 10 }}
          onFocus={(e) => focusStyle(e.currentTarget)}
          onBlur={(e) => blurStyle(e.currentTarget)}
        />
      </div>

      {/* ── Type + Points ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14 }}>
        <div>
          <SLabel icon={<List size={14} color="#429EBD" />}>Type de question</SLabel>
          <div style={{ position: 'relative' }}>
            <select
              value={qForm.type}
              onChange={(e) => {
                const newType = e.target.value as QuestionItem['type'];
                let choices = qForm.choices;
                if (newType === 'TRUE_FALSE') choices = [{ label: 'Vrai', isCorrect: true }, { label: 'Faux', isCorrect: false }];
                else if (newType === 'TEXT') choices = [];
                else if (!choices || choices.length < 2) choices = [{ label: '', isCorrect: true }, { label: '', isCorrect: false }, { label: '', isCorrect: false }, { label: '', isCorrect: false }];
                setQForm((p) => ({ ...p, type: newType, choices }));
              }}
              style={{ ...baseInput, appearance: 'none', paddingRight: 32, cursor: 'pointer' }}
              onFocus={(e) => focusStyle(e.currentTarget)}
              onBlur={(e) => blurStyle(e.currentTarget)}
            >
              {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B9AB8' }}>
              <svg width="11" height="7" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
        <div style={{ minWidth: 80 }}>
          <SLabel icon={<Hash size={14} color="#429EBD" />}>Points</SLabel>
          <input
            type="number" min={1} value={qForm.points || 1}
            onChange={(e) => setQForm((p) => ({ ...p, points: +e.target.value }))}
            style={{ ...baseInput, textAlign: 'center', fontWeight: 900, fontSize: 16 }}
            onFocus={(e) => focusStyle(e.currentTarget)}
            onBlur={(e) => blurStyle(e.currentTarget)}
          />
        </div>
      </div>

      {/* ── Choices (QCM) ── */}
      {(qForm.type === 'SINGLE_CHOICE' || qForm.type === 'MULTIPLE_CHOICE') && (
        <div style={{ background: '#F8FBFD', borderRadius: 14, border: '1.5px solid #DDE8F0', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={15} color="#429EBD" />
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#053F5C' }}>Choix de réponses</span>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, background: qForm.type === 'MULTIPLE_CHOICE' ? '#EBF5FB' : '#F0FDF4', color: qForm.type === 'MULTIPLE_CHOICE' ? '#429EBD' : '#16A34A', border: `1px solid ${qForm.type === 'MULTIPLE_CHOICE' ? '#C3D9E8' : '#86EFAC'}`, padding: '2px 9px', borderRadius: 999 }}>
              {qForm.type === 'MULTIPLE_CHOICE' ? '☑ Plusieurs réponses' : '◉ Une seule réponse'}
            </span>
          </div>
          {(qForm.choices ?? []).map((choice, idx) => {
            const isCorrect = choice.isCorrect;
            const letter = LETTERS[idx] || String(idx + 1);
            const handleToggle = () => {
              if (qForm.type === 'SINGLE_CHOICE') {
                const choices = qForm.choices!.map((c, i) => ({ ...c, isCorrect: i === idx }));
                setQForm((p) => ({ ...p, choices }));
              } else setChoice(idx, 'isCorrect', !choice.isCorrect);
            };
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 11, background: isCorrect ? '#F0FDF4' : '#fff', border: `2px solid ${isCorrect ? '#86EFAC' : '#DDE8F0'}`, transition: 'all 0.18s' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, background: isCorrect ? '#16A34A' : '#EBF2F8', color: isCorrect ? '#fff' : '#6B9AB8', transition: 'all 0.18s' }}>{letter}</div>
                <input value={choice.label || ''} onChange={(e) => setChoice(idx, 'label', e.target.value)} placeholder={`Option ${letter}…`} style={{ flex: 1, height: 34, padding: '0 8px', border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, fontFamily: 'inherit', fontWeight: isCorrect ? 700 : 500, color: isCorrect ? '#166534' : '#053F5C' }} />
                <button type="button" onClick={handleToggle} style={{ width: 32, height: 32, borderRadius: qForm.type === 'MULTIPLE_CHOICE' ? 8 : '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2.5px solid ${isCorrect ? '#16A34A' : '#C3D9E8'}`, background: isCorrect ? '#16A34A' : '#fff', cursor: 'pointer', transition: 'all 0.18s' }}>
                  {isCorrect && <svg width="14" height="10" viewBox="0 0 16 12" fill="none"><path d="M1.5 6L5.5 10L14.5 1.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
                {(qForm.choices ?? []).length > 2 && (
                  <button type="button" onClick={() => removeChoice(idx)} style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #FECDD3', background: '#FFF1F2', color: '#E11D48', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
          <button type="button" onClick={addChoice} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '9px', borderRadius: 9, border: '2px dashed #C3D9E8', background: '#fff', color: '#6B9AB8', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#429EBD'; e.currentTarget.style.color = '#429EBD'; e.currentTarget.style.background = '#EBF5FB'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#C3D9E8'; e.currentTarget.style.color = '#6B9AB8'; e.currentTarget.style.background = '#fff'; }}>
            <Plus size={14} /> Ajouter une option
          </button>
        </div>
      )}

      {/* ── Vrai / Faux ── */}
      {qForm.type === 'TRUE_FALSE' && (
        <div style={{ background: '#F8FBFD', borderRadius: 14, border: '1.5px solid #DDE8F0', padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CheckCircle2 size={15} color="#429EBD" />
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#053F5C' }}>Quelle est l'affirmation correcte ?</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {(['Vrai', 'Faux'] as const).map((opt) => {
              const isCorrect = (opt === 'Vrai' && qForm.choices?.[0]?.isCorrect) || (opt === 'Faux' && qForm.choices?.[1]?.isCorrect);
              return (
                <button key={opt} type="button" onClick={() => setQForm((p) => ({ ...p, choices: [{ label: 'Vrai', isCorrect: opt === 'Vrai' }, { label: 'Faux', isCorrect: opt === 'Faux' }] }))} style={{ flex: 1, padding: '14px 12px', borderRadius: 12, border: `2.5px solid ${isCorrect ? (opt === 'Vrai' ? '#16A34A' : '#E11D48') : '#DDE8F0'}`, background: isCorrect ? (opt === 'Vrai' ? '#F0FDF4' : '#FFF1F2') : '#fff', color: isCorrect ? (opt === 'Vrai' ? '#16A34A' : '#E11D48') : '#6B9AB8', fontWeight: 900, fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, transition: 'all 0.2s', fontFamily: 'inherit' }}>
                  {opt === 'Vrai'
                    ? <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="10" fill={isCorrect ? '#16A34A' : '#DDE8F0'} /><path d="M6 11.5L9.5 15L16 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="10" fill={isCorrect ? '#E11D48' : '#DDE8F0'} /><path d="M7.5 7.5L14.5 14.5M14.5 7.5L7.5 14.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></svg>}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TEXT info ── */}
      {qForm.type === 'TEXT' && (
        <div style={{ background: '#FEF9EC', borderRadius: 12, border: '1.5px solid #FBD98A', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <AlignLeft size={17} color="#D9930F" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: '#8C5D07', marginBottom: 3 }}>Question à réponse libre</div>
            <p style={{ fontSize: 12, color: '#A0620A', margin: 0, lineHeight: 1.5 }}>L'étudiant saisira sa réponse en texte libre. La correction sera effectuée manuellement par le professeur.</p>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        {isEditing && (
          <button type="button" onClick={onCancel} style={{ padding: '11px 18px', borderRadius: 10, border: '1.5px solid #DDE8F0', background: '#fff', color: '#6B9AB8', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>
            Annuler
          </button>
        )}
        <button type="button" onClick={onSave} disabled={savingQ || !canSave} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none', background: !canSave ? '#C3D9E8' : isEditing ? 'linear-gradient(135deg, #F7AD19, #D9930F)' : 'linear-gradient(135deg, #429EBD, #053F5C)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: !canSave ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', boxShadow: canSave ? '0 4px 14px rgba(5,63,92,0.2)' : 'none', opacity: savingQ ? 0.75 : 1 }}>
          {savingQ
            ? <div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            : <><Save size={16} /> {isEditing ? 'Enregistrer les modifications' : 'Ajouter cette question'}</>}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   AI GENERATOR TAB
══════════════════════════════════════════════════════════════════ */
function AIGeneratorTab({
  onGenerateText, onGeneratePdf, aiLoading,
}: {
  onGenerateText: (content: string, count: number, type: string, points: number) => Promise<void>;
  onGeneratePdf: (file: File, count: number, type: string, points: number) => Promise<void>;
  aiLoading: boolean;
}) {
  const [aiMode, setAiMode] = useState<'text' | 'pdf'>('text');
  const [aiContent, setAiContent] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiCount, setAiCount] = useState(5);
  const [aiType, setAiType] = useState('SINGLE_CHOICE');
  const [aiPoints, setAiPoints] = useState(5);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormValid = (aiMode === 'text' && aiContent.trim() !== '') || (aiMode === 'pdf' && aiFile !== null);

  const handleGenerate = () => {
    if (aiMode === 'text' && aiContent.trim()) onGenerateText(aiContent, aiCount, aiType, aiPoints);
    else if (aiMode === 'pdf' && aiFile) onGeneratePdf(aiFile, aiCount, aiType, aiPoints);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') setAiFile(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Mode selector */}
      <div style={{ display: 'flex', background: '#FEF9EC', borderRadius: 12, padding: 4, border: '1px solid #FBD98A', gap: 4 }}>
        {(['text', 'pdf'] as const).map((m) => {
          const active = aiMode === m;
          return (
            <button key={m} onClick={() => setAiMode(m)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, background: active ? '#F7AD19' : 'transparent', color: active ? '#fff' : '#8C5D07', boxShadow: active ? '0 2px 8px rgba(247,173,25,0.4)' : 'none', transition: 'all 0.2s' }}>
              {m === 'text' ? <Type size={15} /> : <FileText size={15} />}
              {m === 'text' ? 'Depuis un texte' : 'Depuis un PDF'}
            </button>
          );
        })}
      </div>

      {/* Text input */}
      {aiMode === 'text' && (
        <div>
          <SLabel icon={<Type size={14} color="#D9930F" />}>Contenu source <span style={{ color: '#E11D48' }}>*</span></SLabel>
          <textarea rows={7} value={aiContent} onChange={(e) => setAiContent(e.target.value)} placeholder={"Collez votre cours, résumé, ou notions clés ici…\n\nPlus le texte est détaillé, meilleures seront les questions générées."} style={{ ...baseInput, height: 'auto', resize: 'vertical', minHeight: 160, lineHeight: 1.6, paddingTop: 10, paddingBottom: 10, borderColor: aiContent.trim() ? '#FBD98A' : '#DDE8F0', background: '#FEFDF8' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#F7AD19'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(247,173,25,0.15)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = aiContent.trim() ? '#FBD98A' : '#DDE8F0'; e.currentTarget.style.boxShadow = 'none'; }} />
          {aiContent.trim() && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#16A34A', fontWeight: 600, marginTop: 6 }}>
              <CheckCircle2 size={12} /> {aiContent.trim().split(/\s+/).length} mots · prêt à générer
            </div>
          )}
        </div>
      )}

      {/* PDF upload */}
      {aiMode === 'pdf' && (
        <div>
          <SLabel icon={<FileText size={14} color="#D9930F" />}>Document PDF <span style={{ color: '#E11D48' }}>*</span></SLabel>
          {aiFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, border: '2px solid #86EFAC', background: '#F0FDF4' }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileText size={20} color="#fff" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#166534', fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aiFile.name}</div>
                <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>{(aiFile.size / 1024 / 1024).toFixed(2)} MB · PDF</div>
              </div>
              <button onClick={() => setAiFile(null)} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #86EFAC', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48', flexShrink: 0 }}><X size={14} /></button>
            </div>
          ) : (
            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '32px 20px', borderRadius: 14, cursor: 'pointer', border: `2px dashed ${dragOver ? '#F7AD19' : '#FBD98A'}`, background: dragOver ? '#FEF9EC' : '#FEFDF8', transition: 'all 0.2s', minHeight: 160 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: dragOver ? '#F7AD19' : '#FEF9EC', border: `1.5px solid ${dragOver ? '#D9930F' : '#FBD98A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}><Upload size={24} color={dragOver ? '#fff' : '#D9930F'} /></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, color: '#053F5C', fontSize: 14, marginBottom: 4 }}>{dragOver ? 'Déposez le fichier ici' : 'Importer un PDF'}</div>
                <div style={{ fontSize: 12, color: '#8C5D07', fontWeight: 600 }}>Cliquez ou glissez-déposez · Max 10 MB</div>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setAiFile(e.target.files?.[0] ?? null)} />
            </div>
          )}
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 14, alignItems: 'end' }}>
        <div>
          <SLabel icon={<Hash size={13} color="#D9930F" />}>Nombre de questions</SLabel>
          <input type="number" min={1} max={20} value={aiCount} onChange={(e) => setAiCount(Math.min(20, Math.max(1, +e.target.value)))} style={{ ...baseInput, textAlign: 'center', fontWeight: 900, fontSize: 15, borderColor: '#FBD98A', background: '#FEFDF8' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#F7AD19'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#FBD98A'; }} />
        </div>
        <div>
          <SLabel icon={<List size={13} color="#D9930F" />}>Type</SLabel>
          <div style={{ position: 'relative' }}>
            <select value={aiType} onChange={(e) => setAiType(e.target.value)} style={{ ...baseInput, appearance: 'none', paddingRight: 28, cursor: 'pointer', borderColor: '#FBD98A', background: '#FEFDF8' }}>
              {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#8C5D07' }}><svg width="10" height="7" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></div>
          </div>
        </div>
        <div style={{ minWidth: 72 }}>
          <SLabel icon={<Sparkles size={13} color="#D9930F" />}>Pts / Q</SLabel>
          <input type="number" min={1} value={aiPoints} onChange={(e) => setAiPoints(Math.max(1, +e.target.value))} style={{ ...baseInput, textAlign: 'center', fontWeight: 900, fontSize: 15, borderColor: '#FBD98A', background: '#FEFDF8' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#F7AD19'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#FBD98A'; }} />
        </div>
      </div>

      {/* Info banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#EBF5FB', border: '1px solid #C3D9E8', borderRadius: 10, padding: '10px 14px' }}>
        <AlertTriangle size={14} color="#429EBD" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: '#053F5C', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
          Pour activer la génération IA réelle, ajoutez votre clé dans{' '}
          <code style={{ background: '#fff', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>application.yml</code>
          {' '}→{' '}
          <code style={{ background: '#fff', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>GEMINI_API_KEY</code>.{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#429EBD', fontWeight: 700 }}>Obtenir une clé →</a>
        </p>
      </div>

      {/* Generate button */}
      <button onClick={handleGenerate} disabled={aiLoading || !isFormValid} style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none', background: !isFormValid ? '#E2EAF0' : 'linear-gradient(135deg, #F7AD19, #D9930F)', color: !isFormValid ? '#8BA8BC' : '#fff', fontWeight: 800, fontSize: 15, cursor: !isFormValid ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit', boxShadow: isFormValid ? '0 4px 16px rgba(247,173,25,0.35)' : 'none', opacity: aiLoading ? 0.8 : 1 }}>
        {aiLoading
          ? <><div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Génération en cours…</>
          : <><Brain size={19} /> Générer {aiCount} question{aiCount > 1 ? 's' : ''} avec l'IA</>}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function QuestionManagerPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamItem | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [qForm, setQForm] = useState<QuestionItem>(DEFAULT_Q_FORM);
  const [editingQIdx, setEditingQIdx] = useState<number | null>(null);
  const [savingQ, setSavingQ] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (examId) {
      setLoading(true);
      Promise.all([examService.getExamById(Number(examId)), questionService.getQuestions(Number(examId))])
        .then(([examData, qsData]) => { setExam(examData); setQuestions(qsData ?? []); })
        .catch(() => { toast.error('Erreur lors du chargement'); navigate('/teacher/exams'); })
        .finally(() => setLoading(false));
    }
  }, [examId, navigate]);

  const handleSaveQuestion = async () => {
    if (!exam) return;
    setSavingQ(true);
    try {
      if (editingQIdx !== null && questions[editingQIdx]?.id) {
        const updated = await questionService.updateQuestion(questions[editingQIdx].id!, qForm);
        setQuestions((prev) => prev.map((q, i) => i === editingQIdx ? updated : q));
        toast.success('Question mise à jour !');
      } else {
        const created = await questionService.addQuestion(exam.id, qForm);
        setQuestions((prev) => [...prev, created]);
        toast.success('Question ajoutée !');
      }
      resetQForm();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    setSavingQ(false);
  };

  const handleDeleteQuestion = async (idx: number) => {
    const q = questions[idx];
    if (q.id) {
      try { await questionService.deleteQuestion(q.id); setQuestions((prev) => prev.filter((_, i) => i !== idx)); toast.success('Question supprimée'); }
      catch { toast.error('Erreur lors de la suppression'); }
    } else setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetQForm = () => { setQForm(DEFAULT_Q_FORM); setEditingQIdx(null); };

  const handleGenerateText = async (content: string, count: number, type: string, points: number) => {
    if (!exam) return;
    setAiLoading(true);
    try {
      const generated = await aiService.generateFromText(exam.id, content, count, type, points);
      if (generated?.length) { setQuestions((prev) => [...prev, ...generated]); toast.success(`${generated.length} question(s) générée(s) !`); setActiveTab('manual'); }
    } catch { toast.error('Erreur de génération IA'); }
    setAiLoading(false);
  };

  const handleGeneratePdf = async (file: File, count: number, type: string, points: number) => {
    if (!exam) return;
    setAiLoading(true);
    try {
      const generated = await aiService.generateFromPdf(exam.id, file, count, type, points);
      if (generated?.length) { setQuestions((prev) => [...prev, ...generated]); toast.success(`${generated.length} question(s) générée(s) !`); setActiveTab('manual'); }
    } catch { toast.error('Erreur de génération IA par PDF'); }
    setAiLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ width: 44, height: 44, border: '4px solid #DDE8F0', borderTopColor: '#429EBD', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }
  if (!exam) return null;

  const totalPoints = questions.reduce((s, q) => s + (q.points || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%', animation: 'fadeIn 0.3s ease' }}>

      {/* ══ HERO HEADER ══ */}
      <div style={{ background: 'linear-gradient(135deg, #053F5C 0%, #0A6190 60%, #0E7BB0 100%)', borderRadius: 18, padding: '24px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 80, width: 90, height: 90, borderRadius: '50%', background: 'rgba(66,158,189,0.15)', pointerEvents: 'none' }} />

        {/* Back button */}
        <button onClick={() => navigate('/teacher/exams')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16, transition: 'background 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
          <ArrowLeft size={14} /> Retour aux examens
        </button>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(247,173,25,0.2)', border: '1.5px solid rgba(247,173,25,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F7AD19' }}><BookOpen size={20} /></div>
              <div>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 22, color: '#fff', margin: 0, lineHeight: 1.2 }}>Gestion des questions</h1>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12.5, margin: 0, marginTop: 2 }}>{exam.title}</p>
              </div>
            </div>
          </div>
          {/* Stats chips */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { icon: <BookOpen size={13} />, label: `${questions.length} question${questions.length > 1 ? 's' : ''}`, color: '#9FE7F5' },
              { icon: <Clock size={13} />, label: `${exam.durationMinutes} min`, color: '#FCD34D' },
              { icon: <Hash size={13} />, label: `${totalPoints} pts`, color: '#86EFAC' },
            ].map((s) => (
              <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: s.color, padding: '5px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                {s.icon} {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ TABS PANEL (full width) ══ */}
      <div style={{ background: '#fff', border: '1.5px solid #EBF2F8', borderRadius: 18, overflow: 'hidden', marginBottom: 20, boxShadow: '0 2px 12px rgba(5,63,92,0.06)' }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid #EBF2F8', background: '#FAFCFF' }}>
          {[
            { key: 'manual', icon: <PenLine size={16} />, label: 'Créer une question', sub: 'Manuellement', accent: '#429EBD' },
            { key: 'ai', icon: <Brain size={16} />, label: 'Générer avec l\'IA', sub: 'Google Gemini', accent: '#F7AD19' },
          ].map((tab) => {
            const isActive = activeTab === tab.key as any;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); if (tab.key === 'manual') resetQForm(); }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '18px 24px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: isActive ? '#fff' : 'transparent',
                  borderBottom: isActive ? `3px solid ${tab.accent}` : '3px solid transparent',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <span style={{ width: 36, height: 36, borderRadius: 10, background: isActive ? `${tab.accent}18` : '#F0F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? tab.accent : '#6B9AB8', transition: 'all 0.2s', flexShrink: 0 }}>
                  {tab.icon}
                </span>
                <span style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: isActive ? '#053F5C' : '#6B9AB8', transition: 'color 0.2s' }}>{tab.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? tab.accent : '#C3D9E8', transition: 'color 0.2s' }}>{tab.sub}</div>
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab body */}
        <div style={{ padding: '28px 32px' }}>
          {activeTab === 'manual' && (
            <QuestionFormTab
              qForm={qForm}
              setQForm={setQForm}
              editingQIdx={editingQIdx}
              savingQ={savingQ}
              onSave={handleSaveQuestion}
              onCancel={resetQForm}
            />
          )}
          {activeTab === 'ai' && (
            <AIGeneratorTab
              onGenerateText={handleGenerateText}
              onGeneratePdf={handleGeneratePdf}
              aiLoading={aiLoading}
            />
          )}
        </div>
      </div>

      {/* ══ QUESTION LIST (full width, below) ══ */}
      <div>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#429EBD', boxShadow: '0 0 0 3px rgba(66,158,189,0.2)' }} />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 16, color: '#053F5C' }}>
              Liste des questions
            </span>
            {questions.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 800, background: '#EBF5FB', color: '#429EBD', border: '1px solid #C3D9E8', padding: '2px 10px', borderRadius: 999 }}>
                {questions.length}
              </span>
            )}
          </div>
          {questions.length > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6B9AB8' }}>
              Total : <span style={{ color: '#053F5C', fontWeight: 900 }}>{totalPoints} pts</span>
            </span>
          )}
        </div>

        {questions.length === 0 ? (
          <div style={{ background: '#fff', border: '1.5px dashed #C3D9E8', borderRadius: 18, padding: '52px 32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #EBF5FB, #DDF1F9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#429EBD' }}>
              <Sparkles size={28} />
            </div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 18, color: '#053F5C', margin: 0 }}>Aucune question pour le moment</p>
            <p style={{ color: '#6B9AB8', fontSize: 13, marginTop: 6, fontWeight: 500 }}>
              Utilisez l'onglet <strong>Créer une question</strong> ou <strong>Générer avec l'IA</strong> ci-dessus.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questions.map((q, idx) => {
              const typeLabel = QUESTION_TYPES.find((t) => t.value === q.type);
              const isBeingEdited = editingQIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${isBeingEdited ? '#429EBD' : '#EBF2F8'}`,
                    borderRadius: 14,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    boxShadow: isBeingEdited ? '0 0 0 3px rgba(66,158,189,0.12), 0 4px 16px rgba(5,63,92,0.08)' : '0 1px 4px rgba(5,63,92,0.05)',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Number badge */}
                  <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 15, background: isBeingEdited ? 'linear-gradient(135deg, #429EBD, #053F5C)' : '#EBF5FB', color: isBeingEdited ? '#fff' : '#053F5C', transition: 'all 0.2s' }}>
                    {idx + 1}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: '#053F5C', fontSize: 14, margin: '0 0 10px', lineHeight: 1.5 }}>{q.statement}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, background: '#F0F6FA', color: '#053F5C', border: '1px solid #DDE8F0', padding: '3px 10px', borderRadius: 8 }}>
                        {typeLabel?.icon} {typeLabel?.label}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', padding: '3px 10px', borderRadius: 8 }}>
                        {q.points} pts
                      </span>
                      {q.choices && q.choices.length > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, background: '#EBF5FB', color: '#1A6882', border: '1px solid #C3D9E8', padding: '3px 10px', borderRadius: 8 }}>
                          {q.choices.length} options
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        setEditingQIdx(idx);
                        setQForm(q);
                        setActiveTab('manual');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      title="Modifier"
                      style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${isBeingEdited ? '#429EBD' : '#DDE8F0'}`, background: isBeingEdited ? '#429EBD' : '#fff', color: isBeingEdited ? '#fff' : '#429EBD', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.18s' }}
                      onMouseEnter={(e) => { if (!isBeingEdited) { e.currentTarget.style.borderColor = '#429EBD'; e.currentTarget.style.background = '#EBF5FB'; } }}
                      onMouseLeave={(e) => { if (!isBeingEdited) { e.currentTarget.style.borderColor = '#DDE8F0'; e.currentTarget.style.background = '#fff'; } }}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(idx)}
                      title="Supprimer"
                      style={{ width: 36, height: 36, borderRadius: 9, border: '1.5px solid #FECDD3', background: '#FFF1F2', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.18s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#E11D48'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#E11D48'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF1F2'; e.currentTarget.style.color = '#E11D48'; e.currentTarget.style.borderColor = '#FECDD3'; }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
