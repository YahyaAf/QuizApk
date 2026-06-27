import { useState, useEffect } from 'react';
import { PenSquare, CheckCircle2, Clock, User, ChevronRight, ChevronLeft, AlertCircle, Star } from 'lucide-react';
import { FaMagic } from 'react-icons/fa';
import { manualGradingService } from '../../services/manualGradingService';
import type { PendingGradingDto, TextAnswerDto } from '../../services/manualGradingService';
import toast from 'react-hot-toast';

export default function ManualGradingPage() {
  const [pending, setPending] = useState<PendingGradingDto[]>([]);
  const [selected, setSelected] = useState<PendingGradingDto | null>(null);
  const [answers, setAnswers] = useState<TextAnswerDto[]>([]);
  const [scores, setScores] = useState<Record<number, { points: number; feedback: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  useEffect(() => {
    manualGradingService.getPendingGrading()
      .then(setPending)
      .catch(() => toast.error('Erreur chargement des soumissions'))
      .finally(() => setLoading(false));
  }, []);

  const openSubmission = async (sub: PendingGradingDto) => {
    setSelected(sub);
    setLoadingAnswers(true);
    setAnswers([]);
    setScores({});
    try {
      const data = await manualGradingService.getTextAnswers(sub.submissionId);
      setAnswers(data);
      const init: Record<number, { points: number; feedback: string }> = {};
      data.forEach((a) => {
        init[a.answerId] = { points: a.pointsAwarded ?? 0, feedback: a.teacherFeedback ?? '' };
      });
      setScores(init);
    } catch {
      toast.error('Erreur chargement des réponses');
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleGrade = async (answerId: number) => {
    if (!selected) return;
    const s = scores[answerId];
    if (s == null) return;
    setSubmitting(answerId);
    try {
      const updated = await manualGradingService.gradeTextAnswer(selected.submissionId, {
        answerId,
        pointsAwarded: s.points,
        teacherFeedback: s.feedback,
      });
      // Update local answers
      setAnswers((prev) =>
        prev.map((a) =>
          a.answerId === answerId
            ? { ...a, pointsAwarded: s.points, teacherFeedback: s.feedback, graded: true }
            : a
        )
      );
      // Update pending list
      setPending((prev) =>
        prev.map((p) =>
          p.submissionId === selected.submissionId ? { ...p, ...updated } : p
        )
      );
      setSelected((prev) => (prev ? { ...prev, ...updated } : prev));
      toast.success('Note sauvegardée !');
    } catch {
      toast.error('Erreur lors de la notation');
    }
    setSubmitting(null);
  };

  const gradedCount = answers.filter((a) => a.graded).length;
  const totalCount = answers.length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 className="page-title font-display">Correction manuelle</h1>
        <p className="page-sub">Notez les réponses ouvertes de vos étudiants.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '340px 1fr' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* List Panel */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', gap: 10 }}>
            <PenSquare size={16} color="#053F5C" />
            <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 14 }}>Soumissions en attente</span>
            {!loading && (
              <span className="badge badge-navy" style={{ marginLeft: 'auto' }}>{pending.length}</span>
            )}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 28, height: 28, margin: '0 auto' }} />
            </div>
          ) : pending.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <CheckCircle2 size={40} color="#86EFAC" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#16A34A', fontWeight: 700, fontSize: 13 }}>Tout est corrigé ! <FaMagic style={{ display: 'inline', marginLeft: '4px' }} /></p>
            </div>
          ) : (
            <div>
              {pending.map((sub) => (
                <button
                  key={sub.submissionId}
                  onClick={() => openSubmission(sub)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px 20px',
                    background: selected?.submissionId === sub.submissionId ? '#EBF5FB' : 'none',
                    border: 'none', borderBottom: '1px solid #F0F4F8',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#053F5C', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sub.studentName}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B9AB8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sub.examTitle}
                    </div>
                    <div style={{ fontSize: 11, color: '#D97706', fontWeight: 600, marginTop: 4 }}>
                      {sub.pendingCount} réponse(s) à noter
                    </div>
                  </div>
                  <ChevronRight size={14} color="#429EBD" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grading Panel */}
        {selected && (
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Panel Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #EBF2F8', background: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B9AB8', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}
              >
                <ChevronLeft size={16} /> Retour
              </button>
              <div style={{ width: 1, height: 20, background: '#DDE8F0' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#053F5C', fontSize: 15 }}>{selected.studentName}</div>
                <div style={{ fontSize: 12, color: '#6B9AB8' }}>{selected.examTitle} · {selected.studentEmail}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 100, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${totalCount > 0 ? (gradedCount / totalCount) * 100 : 0}%`, height: '100%', background: '#16A34A', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>{gradedCount}/{totalCount}</span>
                </div>
              </div>
            </div>

            {/* Answers */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {loadingAnswers ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 28, height: 28, margin: '0 auto' }} />
                </div>
              ) : answers.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <AlertCircle size={36} color="#C3D9E8" style={{ margin: '0 auto 10px' }} />
                  <p style={{ color: '#6B9AB8', fontWeight: 600, fontSize: 13 }}>Aucune réponse textuelle trouvée.</p>
                </div>
              ) : (
                answers.map((answer, idx) => (
                  <div
                    key={answer.answerId}
                    style={{
                      border: `1.5px solid ${answer.graded ? '#86EFAC' : '#DDE8F0'}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Question */}
                    <div style={{ padding: '14px 20px', background: answer.graded ? '#F0FDF4' : '#F8FAFC', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#053F5C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#053F5C', fontSize: 13.5, lineHeight: '1.5' }}>{answer.questionText}</div>
                        <div style={{ fontSize: 11, color: '#6B9AB8', marginTop: 4 }}>Max: {answer.maxPoints} pt(s)</div>
                      </div>
                      {answer.graded && (
                        <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0 }} />
                      )}
                    </div>

                    {/* Student Answer */}
                    <div style={{ padding: '12px 20px', background: '#FFFBF0', borderTop: '1px solid #FDE68A' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        <User size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Réponse de l'étudiant
                      </div>
                      <p style={{ fontSize: 13.5, color: '#053F5C', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {answer.studentAnswer || <em style={{ color: '#6B9AB8' }}>Aucune réponse saisie</em>}
                      </p>
                    </div>

                    {/* Grading Form */}
                    <div style={{ padding: '14px 20px', display: 'flex', gap: 14, alignItems: 'flex-end', borderTop: '1px solid #EBF2F8' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#053F5C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                          Commentaire (feedback)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Feedback pour l'étudiant..."
                          value={scores[answer.answerId]?.feedback ?? ''}
                          onChange={(e) =>
                            setScores((prev) => ({ ...prev, [answer.answerId]: { ...prev[answer.answerId], feedback: e.target.value } }))
                          }
                          style={{
                            width: '100%', padding: '8px 12px', borderRadius: 8,
                            border: '1.5px solid #DDE8F0', fontFamily: 'inherit',
                            fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#053F5C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          <Star size={11} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                          Note / {answer.maxPoints}
                        </label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="number"
                            min={0}
                            max={answer.maxPoints}
                            value={scores[answer.answerId]?.points ?? 0}
                            onChange={(e) =>
                              setScores((prev) => ({
                                ...prev,
                                [answer.answerId]: { ...prev[answer.answerId], points: Math.min(answer.maxPoints, Math.max(0, Number(e.target.value))) },
                              }))
                            }
                            style={{
                              width: 70, padding: '8px 10px', borderRadius: 8,
                              border: '1.5px solid #DDE8F0', fontFamily: 'inherit',
                              fontSize: 15, fontWeight: 800, textAlign: 'center', outline: 'none',
                            }}
                          />
                          <button
                            onClick={() => handleGrade(answer.answerId)}
                            disabled={submitting === answer.answerId}
                            className="btn btn-primary"
                            style={{ padding: '8px 18px', fontSize: 13 }}
                          >
                            {submitting === answer.answerId ? '...' : 'Sauver'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
