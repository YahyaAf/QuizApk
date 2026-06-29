import {
  Plus, Edit3, Trash2, Eye, EyeOff, BookOpen, Clock,
  Users, ChevronRight, FileText, Calendar, MoreVertical
} from 'lucide-react';
import { FaCheckCircle, FaPen } from 'react-icons/fa';
import { useState } from 'react';
import type { ExamItem } from './types';

interface ExamListProps {
  exams: ExamItem[];
  loading: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (exam: ExamItem) => void;
  onOpenQuestions: (exam: ExamItem) => void;
  onPublish: (exam: ExamItem) => void;
  onDelete: (id: number) => void;
  onExportPdf: (id: number) => void;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function ExamCard({
  exam,
  onOpenEdit,
  onOpenQuestions,
  onPublish,
  onDelete,
  onExportPdf,
}: {
  exam: ExamItem;
  onOpenEdit: (exam: ExamItem) => void;
  onOpenQuestions: (exam: ExamItem) => void;
  onPublish: (exam: ExamItem) => void;
  onDelete: (id: number) => void;
  onExportPdf: (id: number) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? '#9FCDE5' : '#EBF2F8'}`,
        borderRadius: 16,
        padding: '0',
        boxShadow: hovered
          ? '0 8px 28px rgba(5,63,92,0.10), 0 2px 8px rgba(5,63,92,0.06)'
          : '0 1px 3px rgba(5,63,92,0.04), 0 4px 16px rgba(5,63,92,0.05)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 3,
          background: exam.published
            ? 'linear-gradient(90deg, #22C55E, #4ADE80)'
            : 'linear-gradient(90deg, #F7AD19, #FCD34D)',
          transition: 'background 0.3s',
        }}
      />

      <div style={{ padding: '18px 20px' }}>
        {/* Row 1 — Title + Status + Menu */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: 15.5,
                  color: '#053F5C',
                  lineHeight: 1.3,
                }}
              >
                {exam.title}
              </span>
              {/* Published Badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  background: exam.published ? '#F0FDF4' : '#FEFCE8',
                  color: exam.published ? '#15803D' : '#92400E',
                  border: `1px solid ${exam.published ? '#BBF7D0' : '#FDE68A'}`,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {exam.published ? (
                  <><FaCheckCircle size={9} /> Publié</>
                ) : (
                  <><FaPen size={9} /> Brouillon</>
                )}
              </span>
            </div>

            {exam.description && (
              <p
                style={{
                  color: '#6B9AB8',
                  fontSize: 12.5,
                  marginTop: 5,
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {exam.description}
              </p>
            )}
          </div>

          {/* Overflow menu */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1.5px solid #DDE8F0',
                background: menuOpen ? '#EBF5FB' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6B9AB8',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#429EBD'; e.currentTarget.style.color = '#429EBD'; }}
              onMouseLeave={(e) => { if (!menuOpen) { e.currentTarget.style.borderColor = '#DDE8F0'; e.currentTarget.style.color = '#6B9AB8'; } }}
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: '#fff',
                  border: '1.5px solid #DDE8F0',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(5,63,92,0.14)',
                  zIndex: 100,
                  minWidth: 170,
                  padding: '6px',
                  animation: 'scaleIn 0.15s ease',
                }}
              >
                {[
                  { label: 'Modifier', icon: <Edit3 size={14} />, action: () => { onOpenEdit(exam); setMenuOpen(false); }, color: '#053F5C' },
                  { label: exam.published ? 'Dépublier' : 'Publier', icon: exam.published ? <EyeOff size={14} /> : <Eye size={14} />, action: () => { onPublish(exam); setMenuOpen(false); }, color: exam.published ? '#F59E0B' : '#16A34A' },
                  { label: 'Exporter PDF', icon: <FileText size={14} />, action: () => { onExportPdf(exam.id); setMenuOpen(false); }, color: '#6B9AB8' },
                  { label: 'Supprimer', icon: <Trash2 size={14} />, action: () => { onDelete(exam.id); setMenuOpen(false); }, color: '#E11D48', danger: true },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      color: item.color,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = (item as any).danger ? '#FFF1F2' : '#F0F7FC'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2 — Stats chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {[
            { icon: <Clock size={12} />, label: `${exam.durationMinutes} min`, color: '#429EBD', bg: '#EBF5FB' },
            { icon: <BookOpen size={12} />, label: `${exam.totalMarks} pts`, color: '#053F5C', bg: '#EBF5FB' },
            { icon: <Users size={12} />, label: `${exam.maxAttempts} tentative(s)`, color: '#F7AD19', bg: '#FFFBEB' },
          ].map((chip) => (
            <span
              key={chip.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 700,
                color: chip.color,
                background: chip.bg,
                border: `1px solid ${chip.bg}`,
              }}
            >
              {chip.icon} {chip.label}
            </span>
          ))}
        </div>

        {/* Row 3 — Dates */}
        {(exam.availableFrom || exam.availableUntil) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              padding: '8px 12px',
              background: '#F8FAFC',
              borderRadius: 9,
              border: '1px solid #EBF2F8',
              flexWrap: 'wrap',
            }}
          >
            <Calendar size={12} style={{ color: '#6B9AB8', flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: '#6B9AB8', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {formatDate(exam.availableFrom)}
            </span>
            <span style={{ fontSize: 11, color: '#C3D9E8', fontWeight: 700 }}>→</span>
            <span style={{ fontSize: 11.5, color: '#6B9AB8', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {formatDate(exam.availableUntil)}
            </span>
          </div>
        )}

        {/* Row 4 — Primary CTA */}
        <button
          onClick={() => onOpenQuestions(exam)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1.5px solid #DDE8F0',
            background: hovered ? '#F0F7FC' : '#FAFCFF',
            color: '#053F5C',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#429EBD'; e.currentTarget.style.background = '#EBF5FB'; e.currentTarget.style.color = '#429EBD'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#DDE8F0'; e.currentTarget.style.background = hovered ? '#F0F7FC' : '#FAFCFF'; e.currentTarget.style.color = '#053F5C'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <BookOpen size={14} /> Gérer les questions
          </span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function ExamList({
  exams,
  loading,
  onOpenCreate,
  onOpenEdit,
  onOpenQuestions,
  onPublish,
  onDelete,
  onExportPdf,
}: ExamListProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              border: '1.5px solid #EBF2F8',
              borderRadius: 16,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite alternate`,
            }}
          >
            <div style={{ height: 16, background: '#EBF2F8', borderRadius: 8, width: '55%' }} />
            <div style={{ height: 12, background: '#F0F6FA', borderRadius: 8, width: '80%' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              {[60, 50, 70].map((w, j) => (
                <div key={j} style={{ height: 24, background: '#F0F6FA', borderRadius: 8, width: w }} />
              ))}
            </div>
          </div>
        ))}
        <style>{`@keyframes pulse { from { opacity: 1 } to { opacity: 0.55 } }`}</style>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div
        style={{
          background: '#fff',
          border: '1.5px dashed #C3D9E8',
          borderRadius: 20,
          padding: '56px 32px',
          textAlign: 'center',
          animation: 'fadeIn 0.35s ease',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #EBF5FB, #DDF1F9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#429EBD',
          }}
        >
          <BookOpen size={32} />
        </div>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 20, color: '#053F5C', margin: 0 }}>
          Aucun examen créé
        </p>
        <p style={{ color: '#6B9AB8', fontSize: 13.5, marginTop: 6, marginBottom: 24 }}>
          Commencez par créer votre premier examen pour vos étudiants.
        </p>
        <button
          onClick={onOpenCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px',
            borderRadius: 11,
            border: 'none',
            background: 'linear-gradient(135deg, #053F5C, #0A6190)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: '0 3px 14px rgba(5,63,92,0.28)',
          }}
        >
          <Plus size={17} /> Créer un examen
        </button>
      </div>
    );
  }

  const published = exams.filter((e) => e.published).length;
  const drafts = exams.length - published;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.35s ease' }}>
      {/* Summary bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 18px',
          background: '#fff',
          border: '1.5px solid #EBF2F8',
          borderRadius: 12,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: '#6B9AB8', flex: 1, minWidth: 120 }}>
          {exams.length} examen{exams.length > 1 ? 's' : ''} au total
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#15803D', padding: '3px 10px', background: '#F0FDF4', borderRadius: 8 }}>
            <FaCheckCircle size={10} /> {published} publié{published > 1 ? 's' : ''}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#92400E', padding: '3px 10px', background: '#FEFCE8', borderRadius: 8 }}>
            <FaPen size={10} /> {drafts} brouillon{drafts > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
          gap: 14,
        }}
      >
        {exams.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            onOpenEdit={onOpenEdit}
            onOpenQuestions={onOpenQuestions}
            onPublish={onPublish}
            onDelete={onDelete}
            onExportPdf={onExportPdf}
          />
        ))}
      </div>
    </div>
  );
}
