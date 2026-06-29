import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, BookOpen, Search, PlayCircle, Trophy, ChevronRight,
  RotateCcw, ShieldAlert, AlertTriangle, X, CheckCircle2,
  HourglassIcon, CalendarDays, Eye, Ban
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { examService } from '../../services/examService';
import { resultService } from '../../services/resultService';
import toast from 'react-hot-toast';

type F = 'all' | 'upcoming' | 'completed';

/* ─── Types ─────────────────────────────────────────────── */
interface MappedExam {
  id: number;
  title: string;
  subject: string;
  teacher: string;
  date: string;
  duration: number;
  questions: number;
  status: 'active' | 'upcoming' | 'completed' | 'expired';
  maxAttempts?: number;
  score?: number;
  pendingManualGrade?: boolean;
  availableFrom?: string;
  availableUntil?: string;
}

/* ─── Status badges ─────────────────────────────────────── */
const statusCfg: Record<string, { label: string; bg: string; color: string; border: string }> = {
  upcoming:  { label: 'Planifié',    bg: '#EBF5FB', color: '#053F5C',  border: '#C3D9E8' },
  active:    { label: 'Disponible',  bg: '#FEF9EC', color: '#8C5D07',  border: '#FBD98A' },
  completed: { label: 'Terminé',     bg: '#F0FDF4', color: '#166534',  border: '#86EFAC' },
  expired:   { label: 'Expiré',      bg: '#FFF1F2', color: '#BE123C',  border: '#FECDD3' },
};

/* ─── Modal de démarrage ────────────────────────────────── */
function StartExamModal({
  exam,
  onConfirm,
  onClose,
}: {
  exam: MappedExam;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const rules = [
    { icon: <Eye size={16} />,       text: 'Restez sur cet onglet pendant toute la durée de l\'examen' },
    { icon: <Ban size={16} />,       text: 'Les copies (Ctrl+C) et colles (Ctrl+V) sont bloquées' },
    { icon: <ShieldAlert size={16} />, text: 'Tout changement de fenêtre ou d\'onglet enregistre une violation' },
    { icon: <AlertTriangle size={16}/>, text: '3 violations = soumission automatique de l\'examen' },
    { icon: <Clock size={16} />,     text: 'Le chrono démarre dès que vous cliquez "Commencer"' },
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5,63,92,0.55)',
        backdropFilter: 'blur(8px)',
        zIndex: 9000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card animate-scale-in"
        style={{ maxWidth: 520, width: '100%', padding: 0, overflow: 'hidden' }}
      >
        {/* Header gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #053F5C 0%, #0B6598 100%)',
          padding: '28px 32px', position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 34, height: 34, borderRadius: 9,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          >
            <X size={18} />
          </button>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(159,231,245,0.85)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Prêt à commencer ?
          </div>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, lineHeight: 1.3, marginBottom: 16 }}>
            {exam.title}
          </h2>
          {/* Info pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {exam.duration > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} /> {exam.duration} min
              </span>
            )}
            <span style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={13} /> {exam.questions} question{exam.questions > 1 ? 's' : ''}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
              {exam.subject}
            </span>
          </div>
        </div>

        {/* Rules */}
        <div style={{ padding: '24px 32px' }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Règles de l'examen
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {rules.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', borderRadius: 10, background: '#F4F7FB', border: '1px solid #EBF2F8' }}>
                <span style={{ color: '#429EBD', flexShrink: 0, marginTop: 1 }}>{r.icon}</span>
                <span style={{ fontSize: 13.5, color: '#053F5C', fontWeight: 600, lineHeight: 1.4 }}>{r.text}</span>
              </div>
            ))}
          </div>

          {/* Warning box */}
          <div style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTriangle size={18} color="#E11D48" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#BE123C', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
              En cliquant "Commencer", le chrono démarre immédiatement et l'examen sera soumis automatiquement à la fin du temps imparti.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-accent"
              style={{ flex: 2, padding: '12px', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}
            >
              <PlayCircle size={18} /> Commencer l'examen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ExamRow ───────────────────────────────────────────── */
function ExamRow({
  exam,
  results,
  onStart,
  isTeacher,
}: {
  exam: MappedExam;
  results: any[];
  onStart: (exam: MappedExam) => void;
  isTeacher: boolean;
}) {
  const d = new Date(exam.date || new Date());
  const cfg = statusCfg[exam.status] || statusCfg['upcoming'];

  const attemptsTaken = results.filter((r) => r.examId === exam.id).length;
  const maxAttempts = exam.maxAttempts || 1;
  const remainingAttempts = Math.max(0, maxAttempts - attemptsTaken);

  /* ── Action à droite ── */
  let action: React.ReactNode;

  if (isTeacher) {
    action = (
      <button
        onClick={() => (window.location.href = '/teacher')}
        className="btn btn-primary"
        style={{ flexShrink: 0, minWidth: 120 }}
      >
        Gérer <ChevronRight size={15} />
      </button>
    );
  } else if (exam.status === 'completed') {
    if (exam.pendingManualGrade) {
      /* Résultat en attente de correction manuelle */
      action = (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF9EC', border: '1.5px solid #FBD98A', borderRadius: 12, padding: '8px 16px' }}>
            <HourglassIcon size={15} color="#D9930F" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#8C5D07', textTransform: 'uppercase', letterSpacing: '0.05em' }}>En attente</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#D9930F' }}>Correction prof.</div>
            </div>
          </div>
        </div>
      );
    } else if (exam.score !== undefined) {
      /* Résultat disponible */
      const scoreColor = exam.score >= 85 ? '#16A34A' : exam.score >= 50 ? '#D9930F' : '#E11D48';
      const scoreBg    = exam.score >= 85 ? '#F0FDF4' : exam.score >= 50 ? '#FEF9EC' : '#FFF1F2';
      const scoreBorder= exam.score >= 85 ? '#86EFAC' : exam.score >= 50 ? '#FBD98A' : '#FECDD3';
      action = (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: scoreBg, border: `1.5px solid ${scoreBorder}`, borderRadius: 12, padding: '8px 16px' }}>
            <Trophy size={15} color={scoreColor} />
            <span style={{ fontWeight: 900, color: scoreColor, fontSize: 19 }}>{Math.round(exam.score)}%</span>
          </div>
          <button
            onClick={() => (window.location.href = '/results')}
            className="btn btn-ghost"
            style={{ padding: '9px 14px', fontSize: 13 }}
          >
            Détails <ChevronRight size={14} />
          </button>
        </div>
      );
    } else {
      /* Complété mais sans score (edge-case) */
      action = (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 12, padding: '8px 16px', flexShrink: 0 }}>
          <CheckCircle2 size={15} color="#16A34A" />
          <span style={{ fontWeight: 700, color: '#166534', fontSize: 13 }}>Terminé</span>
        </div>
      );
    }
  } else if (exam.status === 'active') {
    /* Bouton Démarrer */
    action = (
      <button
        onClick={() => onStart(exam)}
        className="btn btn-accent"
        style={{ flexShrink: 0, minWidth: 140, padding: '10px 20px' }}
      >
        <PlayCircle size={16} /> Démarrer
      </button>
    );
  } else if (exam.status === 'expired') {
    action = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 12, padding: '8px 16px', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, color: '#BE123C', fontSize: 13 }}>Expiré</span>
      </div>
    );
  } else {
    /* Planifié */
    action = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EBF5FB', border: '1.5px solid #C3D9E8', borderRadius: 12, padding: '8px 16px', flexShrink: 0 }}>
        <CalendarDays size={14} color="#429EBD" />
        <span style={{ fontWeight: 700, color: '#053F5C', fontSize: 13 }}>Planifié</span>
      </div>
    );
  }

  return (
    <div
      className="card-interactive"
      style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'space-between' }}
    >
      {/* Left info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
        {/* Date box */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: exam.status === 'active' ? '#FEF9EC' : '#EBF5FB',
          border: `1px solid ${exam.status === 'active' ? '#FBD98A' : '#C3D9E8'}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: exam.status === 'active' ? '#D9930F' : '#6B9AB8', textTransform: 'uppercase' }}>
            {d.toLocaleString('fr-FR', { month: 'short' })}
          </span>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#053F5C', lineHeight: 1 }}>{d.getDate()}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#053F5C', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {exam.title}
            </span>
            <span style={{
              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
              fontSize: 10, fontWeight: 800, padding: '2px 9px',
              borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
            }}>
              {cfg.label}
            </span>
          </div>
          <div style={{ color: '#6B9AB8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            {exam.subject} · {exam.teacher}
          </div>
          <div style={{ display: 'flex', gap: 14, color: '#429EBD', fontSize: 12, fontWeight: 600, flexWrap: 'wrap' }}>
            {exam.duration > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> {exam.duration} min
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <BookOpen size={12} /> {exam.questions} {exam.questions > 1 ? 'questions' : 'question'}
            </span>
            {!isTeacher && exam.maxAttempts && exam.status !== 'completed' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <RotateCcw size={12} /> {remainingAttempts} tentative{remainingAttempts > 1 ? 's' : ''} rest.
              </span>
            )}
            <span>{d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Action */}
      {action}
    </div>
  );
}

/* ─── ExamsPage ─────────────────────────────────────────── */
export default function ExamsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [filter, setFilter] = useState<F>('all');
  const [search, setSearch] = useState('');
  const [exams, setExams] = useState<MappedExam[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startModal, setStartModal] = useState<MappedExam | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        if (user?.role === 'ROLE_STUDENT') {
          const [avExams, myRes] = await Promise.all([
            examService.getAvailableExams(),
            resultService.getMyResults(),
          ]);

          const rList: any[] = myRes?.content || myRes || [];
          setResults(rList);
          const eList: any[] = avExams?.content || avExams || [];

          /* ── Examens disponibles / planifiés ── */
          const mappedUpcoming: MappedExam[] = eList.map((e: any) => {
            const attempts = rList.filter((r: any) => r.examId === e.id).length;
            const maxAttempts = e.maxAttempts || 1;
            const now = new Date();
            const start = new Date(e.availableFrom);
            const end = new Date(e.availableUntil);

            let status: MappedExam['status'] = 'active';
            if (attempts >= maxAttempts || now > end) {
              status = now > end ? 'expired' : 'completed';
            } else if (now < start) {
              status = 'upcoming';
            }

            return {
              id: e.id,
              title: e.title,
              subject: e.moduleName,
              teacher: e.createdByTeacherName,
              date: e.availableFrom,
              duration: e.durationMinutes,
              questions: e.questionCount || 0,
              status,
              maxAttempts: e.maxAttempts,
              availableFrom: e.availableFrom,
              availableUntil: e.availableUntil,
            };
          });

          /* ── Examens avec résultats ── */
          const mappedCompleted: MappedExam[] = rList.map((r: any) => ({
            id: r.examId,
            title: r.examTitle,
            subject: r.courseName,
            teacher: r.studentName,
            date: r.createdAt,
            duration: 0,
            questions: r.totalQuestions || 0,
            status: 'completed' as const,
            score: r.percentage ?? 0,
            pendingManualGrade: r.pendingManualGrade === true,
          }));

          /* Fusionner : les examens dans les résultats prévalent sur ceux "upcoming" pour afficher le bon état */
          const completedIds = new Set(mappedCompleted.map((e) => e.id));
          const filteredUpcoming = mappedUpcoming.filter((e) => !completedIds.has(e.id));

          setExams([...filteredUpcoming, ...mappedCompleted]);

        } else if (user?.role === 'ROLE_TEACHER') {
          const myExams = await examService.getMyExams();
          const eList: any[] = myExams?.content || myExams || [];
          const mapped: MappedExam[] = eList.map((e: any) => ({
            id: e.id,
            title: e.title,
            subject: e.moduleName,
            teacher: 'Vous',
            date: e.availableFrom,
            duration: e.durationMinutes,
            questions: e.questionCount || e.totalMarks || 0,
            status: (e.status?.toLowerCase() || 'upcoming') as MappedExam['status'],
          }));
          setExams(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch exams', err);
        toast.error('Erreur lors du chargement des examens');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [user?.role]);

  const tabs: { key: F; label: string }[] = [
    { key: 'all',       label: 'Tous' },
    { key: 'upcoming',  label: 'À venir / Disponible' },
    { key: 'completed', label: 'Terminés' },
  ];

  const filtered = exams.filter((e) => {
    const ms =
      filter === 'all' ||
      (filter === 'upcoming' && ['upcoming', 'active'].includes(e.status)) ||
      (filter === 'completed' && ['completed', 'expired'].includes(e.status));
    const mq =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  const handleStartExam = (exam: MappedExam) => {
    setStartModal(exam);
  };

  const handleConfirmStart = () => {
    if (startModal) {
      navigate(`/exam/${startModal.id}`);
      setStartModal(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6B9AB8', fontSize: 15 }}>
        Chargement des examens...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Modal de démarrage */}
      {startModal && (
        <StartExamModal
          exam={startModal}
          onConfirm={handleConfirmStart}
          onClose={() => setStartModal(null)}
        />
      )}

      {/* Title */}
      <div>
        <h1 className="page-title font-display">Mes Examens</h1>
        <p className="page-sub">Retrouvez tous vos examens planifiés et passés.</p>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#F0F4F8', borderRadius: 10, padding: 4 }}>
          {tabs.map((t) => {
            const cnt =
              t.key === 'all'
                ? exams.length
                : t.key === 'upcoming'
                ? exams.filter((e) => ['upcoming', 'active'].includes(e.status)).length
                : exams.filter((e) => ['completed', 'expired'].includes(e.status)).length;
            const isA = filter === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  background: isA ? '#fff' : 'none',
                  color: isA ? '#053F5C' : '#6B9AB8',
                  boxShadow: isA ? '0 1px 4px rgba(5,63,92,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
                <span style={{
                  background: isA ? '#EBF5FB' : '#E2EAF0',
                  color: isA ? '#429EBD' : '#8BA8BC',
                  fontWeight: 900, fontSize: 11,
                  borderRadius: 999, padding: '1px 7px',
                }}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8' }} />
          <input
            type="text"
            placeholder="Rechercher un examen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 34, height: 40, fontSize: 13.5 }}
          />
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, fontWeight: 600, color: '#6B9AB8' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#FEF9EC', border: '1px solid #FBD98A', display: 'inline-block' }} /> Disponible</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#EBF5FB', border: '1px solid #C3D9E8', display: 'inline-block' }} /> Planifié</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#F0FDF4', border: '1px solid #86EFAC', display: 'inline-block' }} /> Résultat disponible</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#FEF9EC', border: '1px solid #FBD98A', display: 'inline-block' }} /> En attente de correction</span>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <BookOpen size={48} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, color: '#053F5C', fontSize: 15 }}>Aucun examen trouvé</p>
            <p style={{ color: '#6B9AB8', fontSize: 13, marginTop: 4 }}>Essayez de modifier vos filtres ou revenez plus tard.</p>
          </div>
        ) : (
          filtered.map((e, idx) => (
            <ExamRow
              key={`${e.id}-${idx}`}
              exam={e}
              results={results}
              isTeacher={user?.role === 'ROLE_TEACHER'}
              onStart={handleStartExam}
            />
          ))
        )}
      </div>
    </div>
  );
}
