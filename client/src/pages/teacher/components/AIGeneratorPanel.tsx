import { useState, useRef } from 'react';
import { Sparkles, Upload, FileText, Type, Hash, List, X, CheckCircle2, AlertTriangle, Brain } from 'lucide-react';
import { QUESTION_TYPES } from './types';

interface AIGeneratorPanelProps {
  onGenerateText: (content: string, count: number, type: string, points: number) => Promise<void>;
  onGeneratePdf: (file: File, count: number, type: string, points: number) => Promise<void>;
  onCancel: () => void;
  aiLoading: boolean;
}

export default function AIGeneratorPanel({
  onGenerateText,
  onGeneratePdf,
  onCancel,
  aiLoading,
}: AIGeneratorPanelProps) {
  const [aiMode, setAiMode] = useState<'text' | 'pdf'>('text');
  const [aiContent, setAiContent] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiCount, setAiCount] = useState(5);
  const [aiType, setAiType] = useState('SINGLE_CHOICE');
  const [aiPoints, setAiPoints] = useState(5);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    if (aiMode === 'text' && aiContent.trim()) {
      onGenerateText(aiContent, aiCount, aiType, aiPoints);
    } else if (aiMode === 'pdf' && aiFile) {
      onGeneratePdf(aiFile, aiCount, aiType, aiPoints);
    }
  };

  const isFormValid =
    (aiMode === 'text' && aiContent.trim() !== '') ||
    (aiMode === 'pdf' && aiFile !== null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') setAiFile(file);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFFBEF 0%, #fff 60%)',
      border: '1.5px solid #FBD98A',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(247,173,25,0.12)',
    }}>
      {/* Top accent */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, #F7AD19, #D9930F, #053F5C)' }} />

      {/* Header */}
      <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #FBD98A', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, #F7AD19, #D9930F)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(247,173,25,0.35)',
          flexShrink: 0,
        }}>
          <Brain size={22} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 900, color: '#053F5C', fontSize: 17, fontFamily: 'inherit', marginBottom: 2 }}>
            Génération par IA ✦
          </h3>
          <p style={{ fontSize: 12, color: '#8C5D07', fontWeight: 600 }}>
            Powered by Google Gemini · Création automatique de questions
          </p>
        </div>
        <button
          onClick={onCancel}
          style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #FBD98A',
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#8C5D07', flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Mode tabs */}
        <div style={{ display: 'flex', background: '#FEF9EC', borderRadius: 12, padding: 4, border: '1px solid #FBD98A', gap: 4 }}>
          {(['text', 'pdf'] as const).map((m) => {
            const isActive = aiMode === m;
            return (
              <button
                key={m}
                onClick={() => setAiMode(m)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '9px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  background: isActive ? '#F7AD19' : 'transparent',
                  color: isActive ? '#fff' : '#8C5D07',
                  boxShadow: isActive ? '0 2px 8px rgba(247,173,25,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {m === 'text' ? <Type size={15} /> : <FileText size={15} />}
                {m === 'text' ? 'Depuis un texte' : 'Depuis un PDF'}
              </button>
            );
          })}
        </div>

        {/* Text input */}
        {aiMode === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: '#053F5C' }}>
              <Type size={14} color="#D9930F" />
              Contenu source <span style={{ color: '#E11D48' }}>*</span>
            </label>
            <textarea
              rows={6}
              value={aiContent}
              onChange={(e) => setAiContent(e.target.value)}
              placeholder="Collez votre cours, résumé, ou notions clés ici...&#10;&#10;Plus le texte est détaillé, meilleures seront les questions générées."
              style={{
                width: '100%', resize: 'vertical', minHeight: 140,
                padding: '12px 14px', borderRadius: 12, outline: 'none',
                border: `2px solid ${aiContent.trim() ? '#FBD98A' : '#DDE8F0'}`,
                background: '#FEFDF8', fontSize: 13.5, fontFamily: 'inherit',
                color: '#053F5C', fontWeight: 500, lineHeight: 1.6,
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#F7AD19'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = aiContent.trim() ? '#FBD98A' : '#DDE8F0'; }}
            />
            {aiContent.trim() && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#16A34A', fontWeight: 600 }}>
                <CheckCircle2 size={13} />
                {aiContent.trim().split(/\s+/).length} mots · prêt à générer
              </div>
            )}
          </div>
        )}

        {/* PDF upload */}
        {aiMode === 'pdf' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: '#053F5C' }}>
              <FileText size={14} color="#D9930F" />
              Document PDF <span style={{ color: '#E11D48' }}>*</span>
            </label>

            {aiFile ? (
              /* File selected */
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderRadius: 12, border: '2px solid #86EFAC', background: '#F0FDF4',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 9, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={20} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#166534', fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aiFile.name}</div>
                  <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>{(aiFile.size / 1024 / 1024).toFixed(2)} MB · PDF</div>
                </div>
                <button
                  onClick={() => setAiFile(null)}
                  style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #86EFAC', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48', flexShrink: 0 }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              /* Drop zone */
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 12, padding: '28px 20px', borderRadius: 14, cursor: 'pointer',
                  border: `2px dashed ${dragOver ? '#F7AD19' : '#FBD98A'}`,
                  background: dragOver ? '#FEF9EC' : '#FEFDF8',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: dragOver ? '#F7AD19' : '#FEF9EC',
                  border: `1.5px solid ${dragOver ? '#D9930F' : '#FBD98A'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  <Upload size={24} color={dragOver ? '#fff' : '#D9930F'} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#053F5C', fontSize: 14, marginBottom: 4 }}>
                    {dragOver ? 'Déposez le fichier ici' : 'Importer un PDF'}
                  </div>
                  <div style={{ fontSize: 12, color: '#8C5D07', fontWeight: 600 }}>
                    Cliquez ou glissez-déposez · Max 10 MB
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => setAiFile(e.target.files?.[0] ?? null)}
                />
              </div>
            )}
          </div>
        )}

        {/* Options row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12 }}>
          {/* Nombre */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#053F5C' }}>
              <Hash size={13} color="#D9930F" /> Nombre
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={aiCount}
              onChange={(e) => setAiCount(Math.min(20, Math.max(1, +e.target.value)))}
              style={{
                width: '100%', height: 40, textAlign: 'center',
                borderRadius: 9, border: '1.5px solid #FBD98A',
                background: '#FEFDF8', fontSize: 15, fontWeight: 900,
                color: '#053F5C', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#053F5C' }}>
              <List size={13} color="#D9930F" /> Type
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={aiType}
                onChange={(e) => setAiType(e.target.value)}
                style={{
                  width: '100%', height: 40, paddingLeft: 10, paddingRight: 28,
                  borderRadius: 9, border: '1.5px solid #FBD98A',
                  background: '#FEFDF8', fontSize: 12, fontFamily: 'inherit',
                  fontWeight: 700, color: '#053F5C', outline: 'none',
                  appearance: 'none', cursor: 'pointer',
                }}
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#8C5D07' }}>
                <svg width="10" height="7" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
            </div>
          </div>

          {/* Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#053F5C' }}>
              <Sparkles size={13} color="#D9930F" /> Pts
            </label>
            <input
              type="number"
              min={1}
              value={aiPoints}
              onChange={(e) => setAiPoints(Math.max(1, +e.target.value))}
              style={{
                width: 60, height: 40, textAlign: 'center',
                borderRadius: 9, border: '1.5px solid #FBD98A',
                background: '#FEFDF8', fontSize: 14, fontWeight: 900,
                color: '#053F5C', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>



        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={aiLoading || !isFormValid}
          style={{
            width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
            background: !isFormValid
              ? '#E2EAF0'
              : 'linear-gradient(135deg, #F7AD19, #D9930F)',
            color: !isFormValid ? '#8BA8BC' : '#fff',
            fontWeight: 800, fontSize: 15, cursor: !isFormValid ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontFamily: 'inherit', transition: 'all 0.2s',
            boxShadow: isFormValid ? '0 4px 16px rgba(247,173,25,0.35)' : 'none',
            opacity: aiLoading ? 0.8 : 1,
          }}
        >
          {aiLoading ? (
            <>
              <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Génération en cours...
            </>
          ) : (
            <>
              <Brain size={19} />
              Générer {aiCount} question{aiCount > 1 ? 's' : ''} avec l'IA
            </>
          )}
        </button>
      </div>
    </div>
  );
}
