import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle2, ChevronRight, ChevronLeft, AlertTriangle, X,
  ShieldAlert, Eye, BookOpen, Trophy, HourglassIcon, Ban,
} from 'lucide-react';
import { FaBan, FaHourglassHalf, FaCheck, FaShieldAlt } from 'react-icons/fa';
import { submissionService } from '../../services/submissionService';
import { examService, questionService } from '../../services/examService';
import toast from 'react-hot-toast';

const MAX_VIOLATIONS = 3;

/* ─── Types ─────────────────────────────────────────────── */
interface ExamResult {
  percentage?: number;
  score?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  totalQuestions?: number;
  pendingManualGrade?: boolean;
  passed?: boolean;
}

/* ─── Splash screen avant de commencer ─────────────────── */
function ExamSplash({
  examInfo,
  questions,
  timeLeft,
  onStart,
}: {
  examInfo: any;
  questions: any[];
  timeLeft: number;
  onStart: () => void;
}) {
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const rules = [
    { icon: <Eye size={15} />,         text: 'Restez sur cet onglet pendant toute la durée de l\'examen' },
    { icon: <Ban size={15} />,         text: 'Les copies (Ctrl+C) et colles (Ctrl+V) sont bloquées' },
    { icon: <ShieldAlert size={15} />, text: 'Tout changement de fenêtre/onglet = 1 violation' },
    { icon: <AlertTriangle size={15}/>, text: '3 violations = soumission automatique immédiate' },
    { icon: <Clock size={15} />,       text: 'Le chrono démarre dès que vous cliquez "Commencer"' },
  ];

  const hasText = questions.some((q) => q.type === 'TEXT');
  const hasAuto = questions.some((q) => q.type !== 'TEXT');

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: 24, background: '#F4F7FB',
      }}
    >
      <div style={{ maxWidth: 620, width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header card */}
        <div style={{
          background: 'linear-gradient(135deg, #053F5C 0%, #0B6598 100%)',
          borderRadius: 20, padding: '32px 36px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(247,173,25,0.12)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: '60%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(159,231,245,0.08)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(159,231,245,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Examen prêt
            </div>
            <h1 className="font-display" style={{ color: '#fff', fontSize: 26, fontWeight: 900, lineHeight: 1.3, marginBottom: 20 }}>
              {examInfo?.title || 'Examen'}
            </h1>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {examInfo?.durationMinutes > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} color="#fff" />
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Durée</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{examInfo.durationMinutes} min</div>
                  </div>
                </div>
              )}
              <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} color="#fff" />
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Questions</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{questions.length}</div>
                </div>
              </div>
              {examInfo?.moduleName && (
                <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{examInfo.moduleName}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Correction mode info */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Mode de correction
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {hasAuto && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 10, padding: '8px 14px' }}>
                <CheckCircle2 size={16} color="#16A34A" />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#166534' }}>Correction automatique</div>
                  <div style={{ fontSize: 11, color: '#4ADE80' }}>QCM / Vrai-Faux → résultat immédiat</div>
                </div>
              </div>
            )}
            {hasText && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF9EC', border: '1.5px solid #FBD98A', borderRadius: 10, padding: '8px 14px' }}>
                <HourglassIcon size={16} color="#D9930F" />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#8C5D07' }}>Correction manuelle</div>
                  <div style={{ fontSize: 11, color: '#D9930F' }}>Questions texte → correction par prof</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rules */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            <FaShieldAlt style={{ display: 'inline', marginRight: 6, color: '#429EBD' }} />
            Règles anti-triche
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rules.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, background: '#F4F7FB', border: '1px solid #EBF2F8' }}>
                <span style={{ color: '#429EBD', flexShrink: 0 }}>{r.icon}</span>
                <span style={{ fontSize: 13, color: '#053F5C', fontWeight: 600 }}>{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timer preview + start button */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          <div style={{ background: '#EBF5FB', border: '1.5px solid #C3D9E8', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <Clock size={20} color="#429EBD" />
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#6B9AB8', textTransform: 'uppercase' }}>Temps restant</div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, fontWeight: 900, color: '#053F5C' }}>{fmt(timeLeft)}</div>
            </div>
          </div>
          <button
            onClick={onStart}
            className="btn btn-accent"
            style={{ flex: 1, padding: '16px 28px', fontSize: 16, fontWeight: 900, justifyContent: 'center', borderRadius: 14 }}
          >
            <CheckCircle2 size={20} /> Commencer l'examen
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Écran de résultat post-soumission ─────────────────── */
function ResultScreen({
  result,
  answered,
  total,
  violations,
  navigate,
}: {
  result: ExamResult | null;
  answered: number;
  total: number;
  violations: number;
  navigate: (path: string) => void;
}) {
  const isPending = result?.pendingManualGrade === true;
  const score = result?.percentage ?? Math.round((answered / total) * 100);
  const passed = result?.passed ?? score >= 50;

  const scoreColor  = passed ? '#16A34A' : '#E11D48';
  const scoreBg     = passed ? '#F0FDF4' : '#FFF1F2';
  const scoreBorder = passed ? '#86EFAC' : '#FECDD3';

  return (
    <div
      className="animate-scale-in"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, background: '#F4F7FB' }}
    >
      <div className="card" style={{ padding: 40, maxWidth: 520, width: '100%', textAlign: 'center' }}>
        {/* Icon */}
        {isPending ? (
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FEF9EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '4px solid #FBD98A' }}>
            <HourglassIcon size={40} color="#D9930F" />
          </div>
        ) : (
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: scoreBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: `4px solid ${scoreBorder}` }}>
            {passed ? <Trophy size={40} color={scoreColor} /> : <CheckCircle2 size={40} color={scoreColor} />}
          </div>
        )}

        <h2 className="font-display" style={{ fontSize: 26, fontWeight: 900, color: '#053F5C', marginBottom: 8 }}>
          {isPending ? 'Examen soumis !' : (passed ? 'Félicitations !' : 'Examen terminé')}
        </h2>

        {isPending ? (
          <>
            <p style={{ color: '#6B9AB8', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Vos réponses ont été enregistrées. Cet examen contient des <strong style={{ color: '#D9930F' }}>questions à réponse libre</strong> qui nécessitent une correction manuelle par votre enseignant.
            </p>
            <div style={{ background: '#FEF9EC', border: '1.5px solid #FBD98A', borderRadius: 14, padding: '16px 20px', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                <HourglassIcon size={18} color="#D9930F" />
                <span style={{ fontWeight: 800, color: '#8C5D07', fontSize: 15 }}>En attente de correction</span>
              </div>
              <p style={{ fontSize: 13, color: '#A0620A', margin: 0 }}>
                Votre résultat sera disponible dans votre tableau de bord dès que votre professeur aura effectué la correction.
              </p>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: '#6B9AB8', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              {passed ? 'Bravo ! Vous avez réussi cet examen.' : 'Ne vous découragez pas, continuez à pratiquer !'}
            </p>
            {/* Score big display */}
            <div style={{ background: scoreBg, border: `2px solid ${scoreBorder}`, borderRadius: 16, padding: '20px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Score final
              </div>
              <div style={{ fontSize: 52, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                {Math.round(score)}%
              </div>
              {result?.score !== undefined && (
                <div style={{ fontSize: 13, color: '#6B9AB8', marginTop: 6, fontWeight: 600 }}>
                  {result.correctAnswers}/{result.totalQuestions} bonnes réponses
                </div>
              )}
            </div>
          </>
        )}

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
          <div style={{ background: '#EBF5FB', borderRadius: 14, padding: 14, border: '1px solid #C3D9E8' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Répondues</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#429EBD', marginTop: 4 }}>{answered}/{total}</div>
          </div>
          {!isPending && result?.correctAnswers !== undefined ? (
            <div style={{ background: '#F0FDF4', borderRadius: 14, padding: 14, border: '1px solid #86EFAC' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correctes</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#16A34A', marginTop: 4 }}>{result.correctAnswers}</div>
            </div>
          ) : (
            <div style={{ background: '#FEF9EC', borderRadius: 14, padding: 14, border: '1px solid #FBD98A' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#8C5D07', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#D9930F', marginTop: 4 }}>En attente</div>
            </div>
          )}
          <div style={{ background: violations > 0 ? '#FFF1F2' : '#F0FDF4', borderRadius: 14, padding: 14, border: `1px solid ${violations > 0 ? '#FECDD3' : '#86EFAC'}` }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: violations > 0 ? '#BE123C' : '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Violations</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: violations > 0 ? '#E11D48' : '#16A34A', marginTop: 4 }}>{violations}/{MAX_VIOLATIONS}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/results')}
            className="btn btn-ghost"
            style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
          >
            Mes résultats
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
            style={{ flex: 1, padding: '12px', justifyContent: 'center', fontSize: 14 }}
          >
            Tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── ExamInterface ─────────────────────────────────────── */
export default function ExamInterface() {
  const { examId: _examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]       = useState(true);
  const [examInfo, setExamInfo]     = useState<any>(null);
  const [questions, setQuestions]   = useState<any[]>([]);
  const [submissionId, setSubmissionId] = useState<number | null>(null);

  /* Exam flow states */
  const [examStarted, setExamStarted] = useState(false);   // splash or real exam
  const [submitted, setSubmitted]     = useState(false);
  const [examResult, setExamResult]   = useState<ExamResult | null>(null);

  /* Answers & navigation */
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers]       = useState<Record<number, any>>({});

  /* Timer */
  const [timeLeft, setTimeLeft]     = useState(0);

  /* Anti-cheat */
  const [violations, setViolations]       = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMsg, setWarningMsg]       = useState('');
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const lastViolationTime = useRef<number>(0);

  /* Confirm submit modal */
  const [showConfirm, setShowConfirm] = useState(false);

  /* Submission lock to prevent double-submit */
  const isSubmitting = useRef(false);

  /* ── Init exam ── */
  useEffect(() => {
    const initExam = async () => {
      try {
        const examIdNum = Number(_examId);

        // Start submission on backend
        const submission = await submissionService.startExam(examIdNum);
        setSubmissionId(submission.id);

        // Get exam details
        const examData = await examService.getExamById(examIdNum);
        setExamInfo(examData);

        // Calculate remaining time from server start time
        const durationSeconds = (examData.durationMinutes || 90) * 60;
        const key = `exam_start_time_sub_${submission.id}`;
        let startTime = localStorage.getItem(key);
        if (!startTime) {
          startTime = Date.now().toString();
          localStorage.setItem(key, startTime);
        }
        const elapsed = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
        const remaining = Math.max(0, durationSeconds - elapsed);
        setTimeLeft(remaining);

        // Get questions
        const qData = await questionService.getQuestions(examIdNum);
        setQuestions(qData);

      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Erreur lors de l'initialisation de l'examen");
        navigate('/exams');
      } finally {
        setLoading(false);
      }
    };

    if (_examId) initExam();
  }, [_examId, navigate]);

  /* ── Submit ── */
  const doSubmit = useCallback(async () => {
    if (!submissionId || isSubmitting.current) return;
    isSubmitting.current = true;

    const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
      questionId: Number(qId),
      selectedChoiceIds: ans.selectedChoiceIds || [],
      textAnswer: ans.textAnswer || null,
    }));

    try {
      const result = await submissionService.submitExam(submissionId, formattedAnswers);
      setExamResult(result as ExamResult);
      setSubmitted(true);
      setShowConfirm(false);
      localStorage.removeItem(`exam_start_time_sub_${submissionId}`);
      toast.success('Examen soumis avec succès !');

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur lors de la soumission de l'examen");
      isSubmitting.current = false;
    }
  }, [submissionId, answers]);

  /* ── Violations handler ── */
  const addViolation = useCallback((type: string, message: string) => {
    if (!submissionId || submitted) return;
    const now = Date.now();
    if (now - lastViolationTime.current < 2000) return;
    lastViolationTime.current = now;

    submissionService.logCheatEvent(submissionId, type, message);
    setViolations((prev) => prev + 1);
    setWarningMsg(message);
  }, [submissionId, submitted]);

  /* ── Violation effects ── */
  useEffect(() => {
    if (violations === 0) return;
    if (violations >= MAX_VIOLATIONS) {
      toast.error(
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FaBan /> Trop de violations ! Examen soumis automatiquement.
        </span>,
        { duration: 6000 }
      );
      doSubmit();
      setShowWarningModal(false);
    } else {
      setShowWarningModal(true);
    }
  }, [violations, doSubmit]);

  /* ── Anti-cheat: tab visibility (soumission immédiate) ── */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !submitted && examStarted) {
        toast.error("Changement d'onglet détecté ! Soumission automatique.", { duration: 5000 });
        doSubmit();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [submitted, examStarted, doSubmit]);

  /* ── Anti-cheat: window blur (violation) ── */
  useEffect(() => {
    const handleBlur = () => {
      if (!submitted && examStarted) {
        addViolation('WINDOW_BLUR', "Vous avez cliqué hors de la fenêtre de l'examen !");
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [submitted, examStarted, addViolation]);

  /* ── Anti-cheat: copy/paste/cut ── */
  useEffect(() => {
    const block = (e: ClipboardEvent, type: string, msg: string) => {
      if (!submitted && examStarted) {
        e.preventDefault();
        addViolation(type, msg);
      }
    };
    const handlePaste = (e: ClipboardEvent) => block(e, 'PASTE', 'Collage (Ctrl+V) détecté et bloqué !');
    const handleCopy  = (e: ClipboardEvent) => block(e, 'COPY',  'Copie (Ctrl+C) détectée et bloquée !');
    const handleCut   = (e: ClipboardEvent) => block(e, 'CUT',   'Couper (Ctrl+X) détecté et bloqué !');

    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy',  handleCopy);
    document.addEventListener('cut',   handleCut);
    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy',  handleCopy);
      document.removeEventListener('cut',   handleCut);
    };
  }, [submitted, examStarted, addViolation]);

  /* ── Anti-cheat: right-click ── */
  useEffect(() => {
    const handleCtx = (e: MouseEvent) => {
      if (!submitted && examStarted) {
        e.preventDefault();
        addViolation('CONTEXT_MENU', 'Clic droit désactivé pendant l\'examen');
      }
    };
    document.addEventListener('contextmenu', handleCtx);
    return () => document.removeEventListener('contextmenu', handleCtx);
  }, [submitted, examStarted, addViolation]);

  /* ── Anti-cheat: DevTools shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!submitted && examStarted) {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
          (e.ctrlKey && e.key.toUpperCase() === 'U')
        ) {
          e.preventDefault();
          addViolation('DEVTOOLS', 'Tentative d\'ouverture des outils de développement détectée !');
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [submitted, examStarted, addViolation]);

  /* ── Anti-cheat: beforeunload ── */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitted && examStarted) {
        e.preventDefault();
        e.returnValue = 'Votre examen est en cours. Si vous quittez, il sera soumis automatiquement.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitted, examStarted]);

  /* ── Timer (runs only when exam started) ── */
  useEffect(() => {
    if (!examStarted || submitted || loading || !submissionId) return;

    if (timeLeft <= 0) {
      toast.error('Temps écoulé ! Examen soumis automatiquement.', { duration: 5000 });
      doSubmit();
      return;
    }

    if (timeLeft === 300) toast('Plus que 5 minutes !', { icon: <FaHourglassHalf color="orange" /> });

    const key = `exam_start_time_sub_${submissionId}`;
    const durationSeconds = (examInfo?.durationMinutes || 90) * 60;

    const t = setInterval(() => {
      const startTime = localStorage.getItem(key);
      if (startTime) {
        const elapsed = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
        setTimeLeft(Math.max(0, durationSeconds - elapsed));
      } else {
        setTimeLeft((p) => Math.max(0, p - 1));
      }
    }, 1000);

    return () => clearInterval(t);
  }, [timeLeft, submitted, examStarted, loading, examInfo, doSubmit, submissionId]);

  /* ── Helpers ── */
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
  };

  const total    = questions.length;
  const answered = Object.keys(answers).length;
  const current  = questions[currentIdx];
  const isLast   = currentIdx === total - 1;
  const pct      = total > 0 ? ((currentIdx + 1) / total) * 100 : 0;
  const isLowTime = timeLeft < 300;

  /* ── LOADING ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F4F7FB' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #C3D9E8', borderTopColor: '#429EBD', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6B9AB8', fontWeight: 700 }}>Chargement de l'examen...</p>
        </div>
      </div>
    );
  }

  /* ── SPLASH SCREEN ── */
  if (!examStarted && !submitted) {
    return (
      <ExamSplash
        examInfo={examInfo}
        questions={questions}
        timeLeft={timeLeft}
        onStart={() => setExamStarted(true)}
      />
    );
  }

  /* ── RESULT SCREEN ── */
  if (submitted) {
    return (
      <ResultScreen
        result={examResult}
        answered={answered}
        total={total}
        violations={violations}
        navigate={navigate}
      />
    );
  }

  /* ── EXAM INTERFACE ── */
  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 24, width: '100%', userSelect: 'none' }}
    >

      {/* ── Anti-cheat warning modal ── */}
      {showWarningModal && !submitted && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(225,29,72,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card animate-scale-in" style={{ padding: 40, maxWidth: 480, width: '100%', textAlign: 'center', background: '#fff' }}>
            <ShieldAlert size={64} color="#E11D48" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#BE123C', marginBottom: 12 }}>Avertissement de triche !</h2>
            <p style={{ fontSize: 15, color: '#053F5C', marginBottom: 24, fontWeight: 600 }}>{warningMsg}</p>
            <div style={{ background: '#FFF1F2', padding: '14px 18px', borderRadius: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#E11D48' }}>Violation {violations}/{MAX_VIOLATIONS}</span>
              <p style={{ fontSize: 13, color: '#BE123C', marginTop: 6, marginBottom: 0 }}>
                À {MAX_VIOLATIONS} violations, votre examen sera définitivement soumis automatiquement.
              </p>
            </div>
            <button
              onClick={() => setShowWarningModal(false)}
              className="btn btn-danger"
              style={{ width: '100%', padding: '14px', fontSize: 16, justifyContent: 'center' }}
            >
              J'ai compris, retourner à l'examen
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm submit modal ── */}
      {showConfirm && (
        <div className="animate-scale-in" style={{ position: 'fixed', inset: 0, background: 'rgba(5,63,92,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ padding: 28, maxWidth: 400, width: '100%', border: '1px solid #DDE8F0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEF9EC', border: '1px solid #FBD98A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={24} color="#D9930F" />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, color: '#053F5C', fontSize: 18, marginBottom: 4 }}>Soumettre l'examen ?</h3>
                <p style={{ fontSize: 13.5, color: '#6B9AB8', lineHeight: 1.5 }}>
                  Vous avez répondu à <strong style={{ color: '#053F5C' }}>{answered}/{total}</strong> questions. Cette action est <strong>définitive</strong>.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowConfirm(false)} className="btn btn-ghost" style={{ flex: 1, padding: '10px', justifyContent: 'center' }}>
                Annuler
              </button>
              <button onClick={doSubmit} className="btn btn-accent" style={{ flex: 1, padding: '10px', justifyContent: 'center' }}>
                Confirmer <FaCheck style={{ display: 'inline', marginLeft: 4 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="card" style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => {
              toast.error('Quitter = soumission automatique.', { duration: 3000 });
              doSubmit();
              setTimeout(() => navigate('/exams'), 1500);
            }}
            style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #DDE8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B9AB8', background: '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <X size={18} />
          </button>
          <div>
            <h1 className="font-display" style={{ fontWeight: 800, color: '#053F5C', fontSize: 18, lineHeight: 1 }}>{examInfo?.title || 'Examen'}</h1>
            <p style={{ fontSize: 11, color: '#6B9AB8', fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question {currentIdx + 1} sur {total}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Violations badge */}
          {violations > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: '#FFF1F2', border: '1.5px solid #FECDD3' }}>
              <ShieldAlert size={14} color="#E11D48" />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#E11D48' }}>{violations} violation{violations > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Fullscreen button */}
          {!isFullscreen && (
            <button
              onClick={enterFullscreen}
              style={{ padding: '6px 12px', borderRadius: 10, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6B9AB8', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}
            >
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

      {/* ── Content ── */}
      <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>

        {/* Navigator */}
        <div className="card" style={{ width: 280, padding: 20, display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#053F5C', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Navigateur</span>
            <span style={{ fontSize: 10, color: '#6B9AB8', background: '#F0F4F8', padding: '2px 8px', borderRadius: 999 }}>{answered}/{total}</span>
          </div>
          <div style={{ height: 5, background: '#EBF2F8', borderRadius: 999, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #429EBD, #053F5C)', width: `${pct}%`, transition: 'width 0.4s ease-out' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {questions.map((q, i) => {
              const isCur = i === currentIdx;
              const isAns = !!answers[q.id];
              let bg = '#F0F4F8', color = '#6B9AB8', border = '1.5px solid transparent';
              if (isCur)      { bg = '#053F5C'; color = '#fff'; border = '1.5px solid #053F5C'; }
              else if (isAns) { bg = '#F0FDF4'; color = '#16A34A'; border = '1.5px solid #86EFAC'; }
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  style={{ aspectRatio: '1/1', borderRadius: 9, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color, border, cursor: 'pointer', transition: 'all 0.2s', transform: isCur ? 'scale(1.08)' : 'none', boxShadow: isCur ? '0 4px 12px rgba(5,63,92,0.2)' : 'none' }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#6B9AB8' }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: '#F0FDF4', border: '1px solid #86EFAC' }} /> Répondu
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#6B9AB8' }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: '#F0F4F8' }} /> À faire
            </div>
          </div>
        </div>

        {/* Question card */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {current && (
            <div className="card animate-slide-up" key={current.id} style={{ padding: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 32 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: '#EBF5FB', border: '1.5px solid #C3D9E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#053F5C', fontWeight: 900, fontSize: 15, flexShrink: 0 }}>
                  {currentIdx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#053F5C', lineHeight: 1.5 }}>{current.statement}</h2>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#429EBD', display: 'inline-flex', alignItems: 'center', background: '#EBF5FB', padding: '4px 10px', borderRadius: 8 }}>
                      {current.points} point{current.points > 1 ? 's' : ''}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6B9AB8', display: 'inline-flex', alignItems: 'center', background: '#F4F7FB', padding: '4px 10px', borderRadius: 8 }}>
                      {current.type === 'TEXT' ? 'Réponse libre' : current.type === 'TRUE_FALSE' ? 'Vrai / Faux' : current.type === 'MULTIPLE_CHOICE' ? 'Choix multiple' : 'Choix unique'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {current.type === 'TEXT' ? (
                  <textarea
                    value={answers[current.id]?.textAnswer || ''}
                    onChange={(e) => setAnswers({ ...answers, [current.id]: { textAnswer: e.target.value } })}
                    placeholder="Saisissez votre réponse ici..."
                    style={{ width: '100%', minHeight: 160, padding: 16, borderRadius: 12, border: '2px solid #DDE8F0', fontSize: 15, fontFamily: 'inherit', resize: 'vertical', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#429EBD'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#DDE8F0'; }}
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
                          const na = { ...answers };
                          delete na[current.id];
                          setAnswers(na);
                        } else {
                          setAnswers({ ...answers, [current.id]: { selectedChoiceIds: newIds } });
                        }
                      }
                    };

                    return (
                      <button
                        key={choice.id}
                        onClick={handleChoiceClick}
                        style={{
                          width: '100%', textAlign: 'left', padding: '14px 18px', borderRadius: 13,
                          background: isSelected ? '#EBF5FB' : '#fff',
                          border: `2px solid ${isSelected ? '#053F5C' : '#DDE8F0'}`,
                          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                          transition: 'all 0.15s ease', fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = '#429EBD'; }}
                        onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = '#DDE8F0'; }}
                      >
                        <span style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, transition: 'all 0.15s', background: isSelected ? '#053F5C' : '#F0F4F8', color: isSelected ? '#fff' : '#6B9AB8', flexShrink: 0 }}>
                          {letter}
                        </span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#053F5C' : '#429EBD' }}>
                          {choice.label}
                        </span>
                        {isSelected && <CheckCircle2 size={20} color="#053F5C" style={{ flexShrink: 0 }} />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Footer navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
            <button
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
              className="btn btn-ghost"
              style={{ padding: '11px 22px' }}
            >
              <ChevronLeft size={16} /> Précédent
            </button>
            {isLast ? (
              <button onClick={() => setShowConfirm(true)} className="btn btn-accent" style={{ padding: '11px 28px' }}>
                Soumettre l'examen <FaCheck style={{ display: 'inline', marginLeft: 4 }} />
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
