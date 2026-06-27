import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, AlertTriangle, X, ShieldAlert, Eye } from 'lucide-react';
import { FaBan, FaHourglassHalf, FaCheck } from 'react-icons/fa';
import { submissionService } from '../../services/submissionService';
import { examService, questionService } from '../../services/examService';
import toast from 'react-hot-toast';

const EXAM_DURATION = 90 * 60;
const MAX_VIOLATIONS = 3;

export default function ExamInterface() {
  const { examId: _examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [examInfo, setExamInfo] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [submissionId, setSubmissionId] = useState<number | null>(null);

  const [currentIdx,    setCurrentIdx]    = useState(0);
  const [answers,       setAnswers]       = useState<Record<number, any>>({});
  const [timeLeft,      setTimeLeft]      = useState(0);
  const [submitted,     setSubmitted]     = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [violations,    setViolations]    = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMsg,    setWarningMsg]    = useState('');
  const [isFullscreen,  setIsFullscreen]  = useState(false);
  const lastViolationTime = useRef<number>(0);

  useEffect(() => {
    const initExam = async () => {
      try {
        const examIdNum = Number(_examId);
        // Start exam
        const submission = await submissionService.startExam(examIdNum);
        setSubmissionId(submission.id);
        
        // Get exam details for timer
        const examData = await examService.getExamById(examIdNum);
        setExamInfo(examData);
        
        // Calculate remaining time
        const durationSeconds = (examData.durationMinutes || 90) * 60;
        const key = `exam_start_time_sub_${submission.id}`;
        let startTime = localStorage.getItem(key);
        if (!startTime) {
          startTime = Date.now().toString();
          localStorage.setItem(key, startTime);
        }
        const elapsed = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
        setTimeLeft(Math.max(0, durationSeconds - elapsed));

        // Get questions
        const qData = await questionService.getQuestions(examIdNum);
        setQuestions(qData);
        
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Erreur lors de l'initialisation de l'examen");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (_examId) initExam();
  }, [_examId, navigate]);

  const addViolation = useCallback((type: string, message: string) => {
    if (!submissionId) return;
    const now = Date.now();
    // Prevent multiple violations within 2 seconds (e.g., blur + visibilitychange firing together)
    if (now - lastViolationTime.current < 2000) return;
    lastViolationTime.current = now;

    submissionService.logCheatEvent(submissionId, type, message);

    setViolations((prev) => prev + 1);
    setWarningMsg(message);
  }, [submissionId]);

  const doSubmit = useCallback(async () => { 
    if (!submissionId) return;
    
    // Format answers for API
    // The answers state stores: { [questionId]: { selectedChoiceIds: [...], textAnswer: "..." } }
    const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
      questionId: Number(qId),
      selectedChoiceIds: ans.selectedChoiceIds || [],
      textAnswer: ans.textAnswer || null
    }));

    try {
      await submissionService.submitExam(submissionId, formattedAnswers);
      setSubmitted(true); 
      setShowConfirm(false); 
      toast.success('Examen soumis avec succès !'); 
      localStorage.removeItem(`exam_start_time_sub_${submissionId}`); // Clear timer
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la soumission de l\'examen');
    }
  }, [submissionId, answers, _examId]);

  // Handle side-effects of violations state update outside the render loop
  useEffect(() => {
    if (violations === 0) return;
    if (violations >= MAX_VIOLATIONS) {
      toast.error(<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaBan /> Trop de violations détectées ! Examen soumis automatiquement.</span>, { duration: 6000 });
      doSubmit();
      setShowWarningModal(false);
    } else {
      setShowWarningModal(true);
    }
  }, [violations, doSubmit]);

  // Anti-cheat: tab visibility & window focus loss
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !submitted) {
        toast.error('Vous avez quitté la page ! L\'examen a été soumis automatiquement.', { duration: 5000 });
        doSubmit();
      }
    };
    const handleBlur = () => {
      if (!submitted) {
        addViolation('WINDOW_BLUR', 'Vous avez cliqué hors de la fenêtre de l\'examen !');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [submitted, addViolation]);

  // Anti-cheat: copy/paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!submitted) {
        e.preventDefault();
        addViolation('PASTE', 'Collage (Ctrl+V) détecté et bloqué !');
      }
    };
    const handleCopy = (e: ClipboardEvent) => {
      if (!submitted) {
        e.preventDefault();
        addViolation('COPY', 'Copie (Ctrl+C) détectée et bloquée !');
      }
    };
    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy', handleCopy);
    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy', handleCopy);
    };
  }, [submitted, addViolation]);

  // Anti-cheat: right click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (!submitted) {
        e.preventDefault();
        addViolation('CONTEXT_MENU', 'Clic droit désactivé pendant l\'examen');
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [submitted, addViolation]);

  // Timer
  useEffect(() => {
    if (loading) return;

    if (timeLeft <= 0 && !submitted) {
      toast.error('Temps écoulé ! Examen soumis automatiquement.', { duration: 5000 });
      doSubmit();
      return;
    }
    if (submitted) return;
    if (timeLeft === 300) toast('Plus que 5 minutes !', { icon: <FaHourglassHalf color="orange" /> });
    
    if (!submissionId) return;
    const key = `exam_start_time_sub_${submissionId}`;
    const durationSeconds = (examInfo?.durationMinutes || 90) * 60;
    const t = setInterval(() => {
      const startTime = localStorage.getItem(key);
      if (startTime) {
        const elapsed = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
        setTimeLeft(Math.max(0, durationSeconds - elapsed));
      } else {
        setTimeLeft((p) => p - 1);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft, submitted, _examId, loading, examInfo, doSubmit, submissionId]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const total      = questions.length;
  const answered   = Object.keys(answers).length;
  const current    = questions[currentIdx];
  const isLast     = currentIdx === total - 1;
  const pct        = total > 0 ? ((currentIdx + 1) / total) * 100 : 0;
  const isLowTime  = timeLeft < 300;

  // Fullscreen helper
  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
  };

  /* ── Submitted Screen ─────────────────────────────── */
  if (submitted) {
    const score = Math.round((answered / total) * 100);
    return (
      <div className="animate-scale-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, background: '#F4F7FB' }}>
        <div className="card" style={{ padding: 40, maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '4px solid #86EFAC' }}>
            <CheckCircle2 size={40} color="#22C55E" />
          </div>
          <h2 className="font-display" style={{ fontSize: 28, fontWeight: 900, color: '#053F5C', marginBottom: 8 }}>Examen soumis !</h2>
          <p style={{ color: '#6B9AB8', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Vos réponses ont été enregistrées. Les résultats seront disponibles dans votre tableau de bord.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
            <div style={{ background: '#EBF5FB', borderRadius: 14, padding: 14, border: '1px solid #C3D9E8' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Répondues</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#429EBD', marginTop: 4 }}>{answered}/{total}</div>
            </div>
            <div style={{ background: '#FEF9EC', borderRadius: 14, padding: 14, border: '1px solid #FBD98A' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#8C5D07', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complété</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#D9930F', marginTop: 4 }}>{score}%</div>
            </div>
            <div style={{ background: violations > 0 ? '#FFF1F2' : '#F0FDF4', borderRadius: 14, padding: 14, border: `1px solid ${violations > 0 ? '#FECDD3' : '#86EFAC'}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: violations > 0 ? '#BE123C' : '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Violations</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: violations > 0 ? '#E11D48' : '#16A34A', marginTop: 4 }}>{violations}/{MAX_VIOLATIONS}</div>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15, justifyContent: 'center' }}>
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 24, width: '100%', userSelect: 'none' }}>

      {/* Anti-cheat warning modal */}
      {showWarningModal && !submitted && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(225,29,72,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card animate-scale-in" style={{ padding: 40, maxWidth: 480, width: '100%', textAlign: 'center', background: '#fff' }}>
            <ShieldAlert size={64} color="#E11D48" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#BE123C', marginBottom: 12 }}>Avertissement de triche !</h2>
            <p style={{ fontSize: 16, color: '#053F5C', marginBottom: 24, fontWeight: 600 }}>{warningMsg}</p>
            <div style={{ background: '#FFF1F2', padding: '12px', borderRadius: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#E11D48' }}>Violation {violations}/{MAX_VIOLATIONS}</span>
              <p style={{ fontSize: 13, color: '#BE123C', marginTop: 4 }}>À {MAX_VIOLATIONS} violations, votre examen sera définitivement annulé.</p>
            </div>
            <button onClick={() => setShowWarningModal(false)} className="btn btn-danger" style={{ width: '100%', padding: '14px', fontSize: 16, justifyContent: 'center' }}>
              J'ai compris, retourner à l'examen
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="animate-scale-in" style={{ position: 'fixed', inset: 0, background: 'rgba(5,63,92,0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ padding: 28, maxWidth: 400, width: '100%', border: '1px solid #DDE8F0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEF9EC', border: '1px solid #FBD98A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={24} color="#D9930F" />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, color: '#053F5C', fontSize: 18, marginBottom: 4 }}>Soumettre l'examen ?</h3>
                <p style={{ fontSize: 13.5, color: '#6B9AB8', lineHeight: 1.5 }}>
                  Vous avez répondu à <strong style={{ color: '#053F5C' }}>{answered}/{total}</strong> questions. Cette action est définitive.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowConfirm(false)} className="btn btn-ghost" style={{ flex: 1, padding: '10px', justifyContent: 'center' }}>Annuler</button>
              <button onClick={doSubmit} className="btn btn-accent" style={{ flex: 1, padding: '10px', justifyContent: 'center' }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="card" style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => {
            if (!submitted) {
              toast.error('Examen quitté. Soumission automatique.', { duration: 3000 });
              doSubmit();
              setTimeout(() => navigate('/exams'), 1500);
            } else {
              navigate('/exams');
            }
          }} style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #DDE8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B9AB8', background: '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
            <X size={18} />
          </button>
          <div>
            <h1 className="font-display" style={{ fontWeight: 800, color: '#053F5C', fontSize: 18, lineHeight: 1 }}>{examInfo?.title || 'Examen'}</h1>
            <p style={{ fontSize: 11, color: '#6B9AB8', fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question {currentIdx + 1} sur {total}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Anti-cheat indicator */}
          {violations > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: '#FFF1F2', border: '1.5px solid #FECDD3' }}>
              <ShieldAlert size={14} color="#E11D48" />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#E11D48' }}>{violations} violation{violations > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Fullscreen button */}
          {!isFullscreen && (
            <button onClick={enterFullscreen} style={{ padding: '6px 12px', borderRadius: 10, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6B9AB8', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
              <Eye size={14} /> Plein écran
            </button>
          )}

          {/* Timer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 11,
            fontFamily: '"JetBrains Mono", monospace', fontWeight: 900, fontSize: 18,
            background: isLowTime ? '#FFF1F2' : '#EBF5FB',
            color: isLowTime ? '#E11D48' : '#429EBD',
            border: `1.5px solid ${isLowTime ? '#FECDD3' : '#C3D9E8'}`,
            transition: 'all 0.3s',
            animation: isLowTime ? 'pulse 1s ease-in-out infinite' : 'none',
          }}>
            <Clock size={18} />
            {fmt(timeLeft)}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>

        {/* Left: Navigator */}
        <div className="card" style={{ width: 280, padding: 20, display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#053F5C', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Navigateur</span>
            <span style={{ fontSize: 10, color: '#6B9AB8', background: '#F0F4F8', padding: '2px 8px', borderRadius: 999 }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ height: 5, background: '#EBF2F8', borderRadius: 999, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #429EBD, #053F5C)', width: `${pct}%`, transition: 'width 0.4s ease-out' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {questions.map((q, i) => {
              const isCur = i === currentIdx;
              const isAns = !!answers[q.id];
              let bg = '#F0F4F8', color = '#6B9AB8', border = '1.5px solid transparent';
              if (isCur)     { bg = '#053F5C'; color = '#fff'; border = '1.5px solid #053F5C'; }
              else if (isAns){ bg = '#F0FDF4'; color = '#16A34A'; border = '1.5px solid #86EFAC'; }
              return (
                <button key={i} onClick={() => setCurrentIdx(i)} style={{ aspectRatio: '1/1', borderRadius: 9, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color, border, cursor: 'pointer', transition: 'all 0.2s', transform: isCur ? 'scale(1.08)' : 'none', boxShadow: isCur ? '0 4px 12px rgba(5,63,92,0.2)' : 'none' }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#6B9AB8' }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: '#F0FDF4', border: '1px solid #86EFAC' }} /> Répondu
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#6B9AB8' }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: '#F0F4F8' }} /> À faire
            </div>
          </div>
        </div>

        {/* Right: Question Card */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {current && (
            <div className="card animate-slide-up" key={current.id} style={{ padding: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 32 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: '#EBF5FB', border: '1.5px solid #C3D9E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#053F5C', fontWeight: 900, fontSize: 15, flexShrink: 0 }}>
                  {currentIdx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#053F5C', lineHeight: 1.5 }}>{current.statement}</h2>
                  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: '#429EBD', display: 'inline-flex', alignItems: 'center', background: '#EBF5FB', padding: '4px 10px', borderRadius: 8 }}>
                    {current.points} Points
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {current.type === 'TEXT' ? (
                  <textarea
                    value={answers[current.id]?.textAnswer || ''}
                    onChange={(e) => setAnswers({ ...answers, [current.id]: { textAnswer: e.target.value } })}
                    placeholder="Saisissez votre réponse ici..."
                    style={{ width: '100%', minHeight: 150, padding: 16, borderRadius: 12, border: '2px solid #DDE8F0', fontSize: 15, fontFamily: 'inherit', resize: 'vertical' }}
                  />
                ) : (
                  current.choices?.map((choice: any, idx: number) => {
                    const isSelected = answers[current.id]?.selectedChoiceIds?.includes(choice.id);
                    const letter = String.fromCharCode(65 + idx);
                    
                    const handleChoiceClick = () => {
                      if (current.type === 'SINGLE_CHOICE' || current.type === 'TRUE_FALSE') {
                        setAnswers({ ...answers, [current.id]: { selectedChoiceIds: [choice.id] } });
                      } else {
                        const currentIds = answers[current.id]?.selectedChoiceIds || [];
                        const newIds = currentIds.includes(choice.id)
                          ? currentIds.filter((id: number) => id !== choice.id)
                          : [...currentIds, choice.id];
                        
                        if (newIds.length === 0) {
                           const newAnswers = { ...answers };
                           delete newAnswers[current.id];
                           setAnswers(newAnswers);
                        } else {
                           setAnswers({ ...answers, [current.id]: { selectedChoiceIds: newIds } });
                        }
                      }
                    };

                    return (
                      <button key={choice.id} onClick={handleChoiceClick} style={{ width: '100%', textAlign: 'left', padding: '14px 18px', borderRadius: 13, background: isSelected ? '#EBF5FB' : '#fff', border: `2px solid ${isSelected ? '#053F5C' : '#DDE8F0'}`, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit' }}
                        onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = '#429EBD'; }}
                        onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = '#DDE8F0'; }}>
                        <span style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, transition: 'all 0.15s', background: isSelected ? '#053F5C' : '#F0F4F8', color: isSelected ? '#fff' : '#6B9AB8' }}>
                          {letter}
                        </span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#053F5C' : '#429EBD' }}>{choice.label}</span>
                        {isSelected && <CheckCircle2 size={20} color="#053F5C" style={{ flexShrink: 0 }} />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
            <button onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))} disabled={currentIdx === 0} className="btn btn-ghost" style={{ padding: '11px 22px' }}>
              <ChevronLeft size={16} /> Précédent
            </button>
            {isLast ? (
              <button onClick={() => setShowConfirm(true)} className="btn btn-accent" style={{ padding: '11px 28px' }}>
                Soumettre l'examen <FaCheck style={{ display: 'inline', marginLeft: '4px' }} />
              </button>
            ) : (
              <button onClick={() => setCurrentIdx((p) => Math.min(total - 1, p + 1))} className="btn btn-primary" style={{ padding: '11px 22px' }}>
                Suivant <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
