import { useState, useEffect, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Save, BookOpen, Clock, Users, Calendar,
  Hash, FileText, ChevronRight, Sparkles
} from 'lucide-react';
import type { ExamItem } from './types';

interface ExamFormModalProps {
  show: boolean;
  exam: ExamItem | null;
  onClose: () => void;
  onSave: (payload: any, isEdit: boolean) => Promise<void>;
  modules: { id: number; name: string }[];
  groups: { id: number; name: string }[];
}

interface FieldGroupProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  color?: string;
}

function FieldGroup({ icon, label, children, color = '#429EBD' }: FieldGroupProps) {
  return (
    <div
      style={{
        background: '#FAFCFF',
        border: '1.5px solid #EBF2F8',
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: '#6B9AB8',
          }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

interface LabeledFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function LabeledField({ label, required, children }: LabeledFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#053F5C',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {label}
        {required && (
          <span style={{ color: '#F7AD19', fontSize: 14, lineHeight: 1 }}>*</span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 10,
  border: '1.5px solid #DDE8F0',
  padding: '9px 13px',
  fontSize: 13.5,
  fontWeight: 500,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  outline: 'none',
  background: '#fff',
  color: '#053F5C',
  transition: 'border-color 0.18s, box-shadow 0.18s',
  height: 40,
  boxSizing: 'border-box',
};

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        ...(props.style ?? {}),
        borderColor: focused ? '#429EBD' : '#DDE8F0',
        boxShadow: focused ? '0 0 0 3px rgba(66,158,189,0.14)' : 'none',
        height: props.type === 'datetime-local' ? 40 : inputStyle.height,
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

function StyledTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      style={{
        ...inputStyle,
        height: 'auto',
        resize: 'vertical',
        lineHeight: 1.6,
        paddingTop: 10,
        paddingBottom: 10,
        borderColor: focused ? '#429EBD' : '#DDE8F0',
        boxShadow: focused ? '0 0 0 3px rgba(66,158,189,0.14)' : 'none',
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

function StyledSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...inputStyle,
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23429EBD' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: 36,
        borderColor: focused ? '#429EBD' : '#DDE8F0',
        boxShadow: focused ? '0 0 0 3px rgba(66,158,189,0.14)' : 'none',
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

export default function ExamFormModal({
  show,
  exam,
  onClose,
  onSave,
  modules,
  groups,
}: ExamFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [moduleId, setModuleId] = useState<number | ''>('');
  const [groupId, setGroupId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      if (exam) {
        setTitle(exam.title);
        setDescription(exam.description || '');
        setDurationMinutes(exam.durationMinutes);
        setAvailableFrom(exam.availableFrom?.slice(0, 16) ?? '');
        setAvailableUntil(exam.availableUntil?.slice(0, 16) ?? '');
        setScheduledStartTime(exam.scheduledStartTime?.slice(0, 16) ?? '');
        setMaxAttempts(exam.maxAttempts);
        setModuleId(exam.moduleId || '');
        setGroupId(exam.groupId || '');
      } else {
        setTitle('');
        setDescription('');
        setDurationMinutes(60);
        setAvailableFrom('');
        setAvailableUntil('');
        setScheduledStartTime('');
        setMaxAttempts(1);
        setModuleId('');
        setGroupId('');
      }
    }
  }, [show, exam]);

  if (!show) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!moduleId || !groupId) return;
    setSaving(true);
    try {
      await onSave(
        {
          title,
          description,
          durationMinutes,
          availableFrom,
          availableUntil,
          maxAttempts,
          moduleId: Number(moduleId),
          groupId: Number(groupId),
          scheduledStartTime: scheduledStartTime || availableFrom,
        },
        !!exam
      );
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!exam;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,63,92,0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.22s ease forwards',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(5,63,92,0.22), 0 8px 32px rgba(5,63,92,0.12)',
          width: '100%',
          maxWidth: 640,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.26s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #053F5C 0%, #0A6190 100%)',
            padding: '24px 28px 20px',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(66,158,189,0.15)' }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(247,173,25,0.2)',
                  border: '1.5px solid rgba(247,173,25,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F7AD19',
                  flexShrink: 0,
                }}
              >
                {isEdit ? <FileText size={22} /> : <Sparkles size={22} />}
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 900,
                    fontSize: 22,
                    color: '#fff',
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {isEdit ? "Modifier l'examen" : 'Créer un examen'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12.5, marginTop: 3, margin: '3px 0 0 0' }}>
                  {isEdit
                    ? 'Mettez à jour les informations de cet examen'
                    : 'Remplissez les détails pour configurer votre examen'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.75)',
                cursor: 'pointer',
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <form
          id="exam-form"
          onSubmit={handleSubmit}
          style={{ flex: 1, overflowY: 'auto', padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <FieldGroup icon={<BookOpen size={15} />} label="Identité de l'examen" color="#053F5C">
            <LabeledField label="Titre de l'examen" required>
              <StyledInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Algorithmique avancée — Semestre 2"
                required
                maxLength={120}
              />
            </LabeledField>
            <LabeledField label="Description">
              <StyledTextarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instructions ou informations complémentaires pour les étudiants..."
              />
            </LabeledField>
          </FieldGroup>

          <FieldGroup icon={<Users size={15} />} label="Affectation" color="#22C55E">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <LabeledField label="Module" required>
                <StyledSelect
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value ? Number(e.target.value) : '')}
                  required
                >
                  <option value="" disabled>Sélectionner un module</option>
                  {modules && modules.length > 0 ? (
                    modules.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>Aucun module disponible</option>
                  )}
                </StyledSelect>
              </LabeledField>
              <LabeledField label="Groupe" required>
                <StyledSelect
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : '')}
                  required
                >
                  <option value="" disabled>Sélectionner un groupe</option>
                  {groups && groups.length > 0 ? (
                    groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>Aucun groupe disponible</option>
                  )}
                </StyledSelect>
              </LabeledField>
            </div>
          </FieldGroup>

          <FieldGroup icon={<Clock size={15} />} label="Paramètres de l'examen" color="#429EBD">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <LabeledField label="Durée (minutes)" required>
                <div style={{ position: 'relative' }}>
                  <StyledInput
                    type="number"
                    min={5}
                    max={480}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(+e.target.value)}
                    required
                    style={{ paddingRight: 56 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#6B9AB8',
                      pointerEvents: 'none',
                    }}
                  >
                    min
                  </span>
                </div>
              </LabeledField>
              <LabeledField label="Tentatives max" required>
                <div style={{ position: 'relative' }}>
                  <StyledInput
                    type="number"
                    min={1}
                    max={10}
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(+e.target.value)}
                    required
                    style={{ paddingRight: 56 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#6B9AB8',
                      pointerEvents: 'none',
                    }}
                  >
                    <Hash size={12} />
                  </span>
                </div>
              </LabeledField>
            </div>
          </FieldGroup>

          <FieldGroup icon={<Calendar size={15} />} label="Planification" color="#F7AD19">
            <LabeledField label="Date et heure prévues de l'examen" required>
              <StyledInput
                type="datetime-local"
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
                required
              />
            </LabeledField>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <LabeledField label="Disponible à partir du" required>
                <StyledInput
                  type="datetime-local"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  required
                />
              </LabeledField>
              <LabeledField label="Disponible jusqu'au" required>
                <StyledInput
                  type="datetime-local"
                  value={availableUntil}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                  required
                />
              </LabeledField>
            </div>
          </FieldGroup>
        </form>

        <div
          style={{
            padding: '16px 28px',
            borderTop: '1.5px solid #EBF2F8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexShrink: 0,
            background: '#FAFCFF',
          }}
        >
          <div style={{ fontSize: 11.5, color: '#6B9AB8', fontWeight: 600 }}>
            * Champs obligatoires
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 10,
                border: '1.5px solid #DDE8F0',
                background: '#fff',
                color: '#053F5C',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#429EBD';
                e.currentTarget.style.background = '#EBF5FB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#DDE8F0';
                e.currentTarget.style.background = '#fff';
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              form="exam-form"
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 22px',
                borderRadius: 10,
                border: 'none',
                background: saving ? '#6B9AB8' : 'linear-gradient(135deg, #053F5C 0%, #0A6190 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: saving ? 'none' : '0 3px 12px rgba(5,63,92,0.28)',
                transition: 'opacity 0.15s, transform 0.15s',
                opacity: saving ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {saving ? (
                <>
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      border: '2.5px solid rgba(255,255,255,0.35)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save size={15} />
                  {isEdit ? 'Enregistrer' : 'Créer l\'examen'}
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
