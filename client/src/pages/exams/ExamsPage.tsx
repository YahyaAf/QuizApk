import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Search, PlayCircle, Trophy, ChevronRight, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { examService } from '../../services/examService';
import { resultService } from '../../services/resultService';
import toast from 'react-hot-toast';

type F = 'all' | 'upcoming' | 'completed';

const statusLabel: Record<string, { label: string; bg: string; color: string }> = {
  upcoming: { label: 'Planifié', bg: '#EBF5FB', color: '#053F5C' },
  active: { label: 'Démarré', bg: '#FEF9EC', color: '#8C5D07' },
  completed: { label: 'Déjà passé', bg: '#DDF1F9', color: '#1A6882' },
};

function ExamRow({ exam, results, onStart, isTeacher }: { exam: any; results: any[]; onStart: (id: number) => void; isTeacher: boolean }) {
  const d = new Date(exam.date || new Date());
  const cfg = statusLabel[exam.status] || statusLabel['upcoming'];

  const attemptsTaken = results.filter((r) => r.examId === exam.id).length;
  const maxAttempts = exam.maxAttempts || 1;
  const remainingAttempts = Math.max(0, maxAttempts - attemptsTaken);

  const isStarted = d <= new Date();

  return (
    <div className="card-interactive" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
        {/* Date box */}
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: '#EBF5FB',
          border: '1px solid #C3D9E8', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#6B9AB8', textTransform: 'uppercase' }}>{d.toLocaleString('fr-FR', { month: 'short' })}</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#053F5C', lineHeight: 1 }}>{d.getDate()}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#053F5C', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.title}</span>
            <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
              {cfg.label}
            </span>
          </div>
          <div style={{ color: '#6B9AB8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{exam.subject} · {exam.teacher}</div>
          <div style={{ display: 'flex', gap: 14, color: '#429EBD', fontSize: 12, fontWeight: 600 }}>
            {exam.duration > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {exam.duration} min</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={12} /> {exam.questions} {exam.questions > 1 ? 'questions' : 'Pts'}</span>
            {!isTeacher && exam.maxAttempts && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RotateCcw size={12} /> {remainingAttempts} tentative{remainingAttempts > 1 ? 's' : ''} rest.</span>}
            <span>{d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Action */}
      {exam.status === 'completed' && exam.score !== undefined ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '7px 14px' }}>
            <Trophy size={15} color="#16A34A" />
            <span style={{ fontWeight: 900, color: '#16A34A', fontSize: 17 }}>{Math.round(exam.score)}%</span>
          </div>
          <button onClick={() => window.location.href = '/results'} className="btn btn-ghost" style={{ padding: '9px 14px', fontSize: 13 }}>Détails <ChevronRight size={14} /></button>
        </div>
      ) : isTeacher ? (
        <button onClick={() => window.location.href = '/teacher'} className="btn btn-primary" style={{ flexShrink: 0, minWidth: 120 }}>
          Gérer <ChevronRight size={15} />
        </button>
      ) : (
        <button
          onClick={() => onStart(exam.id)}
          disabled={exam.status !== 'active'}
          className="btn btn-primary"
          style={{
            flexShrink: 0,
            minWidth: 120,
            opacity: exam.status !== 'active' ? 0.6 : 1,
            cursor: exam.status !== 'active' ? 'not-allowed' : 'pointer'
          }}
        >
          <PlayCircle size={15} />
          {exam.status === 'active' ? 'Démarrer' : (exam.status === 'upcoming' ? 'Planifié' : 'Déjà passé')}
        </button>
      )}
    </div>
  );
}

export default function ExamsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [filter, setFilter] = useState<F>('all');
  const [search, setSearch] = useState('');

  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        if (user?.role === 'ROLE_STUDENT') {
          const [avExams, myRes] = await Promise.all([
            examService.getAvailableExams(),
            resultService.getMyResults()
          ]);

          const rList = myRes?.content || myRes || [];
          setResults(rList);

          const eList = avExams?.content || avExams || [];

          const mappedUpcoming = eList.map((e: any) => {
            const attempts = rList.filter((r: any) => r.examId === e.id).length;
            const maxAttempts = e.maxAttempts || 1;
            const now = new Date();
            const start = new Date(e.availableFrom);
            const end = new Date(e.availableUntil);

            let status = 'active';
            if (attempts >= maxAttempts || now > end) {
              status = 'completed';
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
              questions: e.totalMarks || 0,
              status: status,
              maxAttempts: e.maxAttempts,
              availableFrom: e.availableFrom,
              availableUntil: e.availableUntil
            };
          });

          // Completed exams
          const mappedCompleted = rList.map((r: any) => ({
            id: r.examId,
            title: r.examTitle,
            subject: r.courseName,
            teacher: r.studentName, // Display context
            date: r.createdAt,
            duration: 0,
            questions: r.totalQuestions || 0,
            status: 'completed',
            score: r.percentage || 0
          }));

          setExams([...mappedUpcoming, ...mappedCompleted]);

        } else if (user?.role === 'ROLE_TEACHER') {
          const [myExams] = await Promise.all([
            examService.getMyExams()
          ]);
          const eList = myExams?.content || myExams || [];
          const mapped = eList.map((e: any) => ({
            id: e.id,
            title: e.title,
            subject: e.moduleName,
            teacher: 'Vous',
            date: e.availableFrom,
            duration: e.durationMinutes,
            questions: e.totalMarks || 0,
            status: e.status?.toLowerCase() || 'upcoming'
          }));
          setExams(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch exams', err);
        toast.error("Erreur lors du chargement des examens");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [user?.role]);

  const tabs: { key: F; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'upcoming', label: 'À venir / Démarré' },
    { key: 'completed', label: 'Déjà passé' },
  ];

  const filtered = exams.filter((e) => {
    const ms = filter === 'all'
      || (filter === 'upcoming' && ['upcoming', 'active'].includes(e.status))
      || e.status === filter;
    const mq = e.title.toLowerCase().includes(search.toLowerCase()) || e.subject.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Chargement des examens...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
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
            const cnt = t.key === 'all'
              ? exams.length
              : t.key === 'upcoming'
                ? exams.filter(e => ['upcoming', 'active'].includes(e.status)).length
                : exams.filter(e => e.status === t.key).length;
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
                  transition: 'all 0.15s'
                }}
              >
                {t.label}
                <span style={{
                  background: isA ? '#EBF5FB' : '#E2EAF0',
                  color: isA ? '#429EBD' : '#8BA8BC',
                  fontWeight: 900, fontSize: 11,
                  borderRadius: 999, padding: '1px 7px'
                }}>{cnt}</span>
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

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <BookOpen size={48} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, color: '#053F5C', fontSize: 15 }}>Aucun examen trouvé</p>
            <p style={{ color: '#6B9AB8', fontSize: 13, marginTop: 4 }}>Essayez de modifier vos filtres ou revenez plus tard.</p>
          </div>
        ) : (
          filtered.map((e, idx) => <ExamRow key={`${e.id}-${idx}`} exam={e} results={results} isTeacher={user?.role === 'ROLE_TEACHER'} onStart={(id) => navigate(`/exam/${id}`)} />)
        )}
      </div>
    </div>
  );
}
