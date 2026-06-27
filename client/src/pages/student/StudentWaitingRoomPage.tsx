import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, BookOpen, ChevronLeft, Radio, AlertCircle } from 'lucide-react';
import { examService } from '../../services/examService';
import toast from 'react-hot-toast';

interface ExamInfo {
  id: number;
  title: string;
  durationMinutes: number;
  questionCount?: number;
  status: string;
}

export default function StudentWaitingRoomPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'waiting' | 'starting' | 'locked'>('waiting');
  const [dots, setDots] = useState('.');

  useEffect(() => {
    if (!examId) return;
    examService.getExamById(Number(examId))
      .then(setExam)
      .catch(() => toast.error('Examen introuvable'))
      .finally(() => setLoading(false));
  }, [examId]);

  // Animated dots
  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '.' : d + '.'));
    }, 600);
    return () => clearInterval(t);
  }, []);

  // Poll exam status every 5s (replace with WebSocket in production)
  useEffect(() => {
    if (!examId) return;
    const interval = setInterval(async () => {
      try {
        const data = await examService.getExamById(Number(examId));
        if (data?.status === 'IN_PROGRESS') {
          setStatus('starting');
          clearInterval(interval);
          toast.success('L\'examen démarre !');
          setTimeout(() => navigate(`/exam/${examId}`), 1500);
        }
      } catch {
        // silent
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [examId, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4F8' }}>
        <div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #EBF5FB 0%, #F0F4F8 100%)',
      padding: 24,
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        {/* Back */}
        <button
          onClick={() => navigate('/exams')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6B9AB8', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, marginBottom: 20 }}
        >
          <ChevronLeft size={16} /> Retour aux examens
        </button>

        {/* Main Card */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Header gradient */}
          <div style={{ padding: '32px 32px 24px', background: 'linear-gradient(135deg, #053F5C, #429EBD)', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <BookOpen size={36} color="#fff" />
            </div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 22, margin: 0 }}>{exam?.title ?? `Examen #${examId}`}</h2>
          </div>

          {/* Body */}
          <div style={{ padding: '28px 32px', textAlign: 'center' }}>
            {status === 'starting' ? (
              <>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Radio size={28} color="#16A34A" />
                </div>
                <h3 style={{ color: '#16A34A', fontWeight: 900, fontSize: 20, margin: '0 0 8px' }}>L'examen démarre !</h3>
                <p style={{ color: '#6B9AB8', fontSize: 14 }}>Redirection en cours...</p>
                <div className="spinner" style={{ borderColor: 'rgba(22,163,74,0.2)', borderTopColor: '#16A34A', width: 32, height: 32, margin: '20px auto 0' }} />
              </>
            ) : (
              <>
                {/* Animated waiting indicator */}
                <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 20px' }}>
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '3px solid #EBF5FB',
                    animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 8, borderRadius: '50%',
                    border: '2px solid #C3D9E8',
                    animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
                    animationDelay: '0.5s',
                  }} />
                  <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', background: '#EBF5FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} color="#429EBD" />
                  </div>
                </div>

                <h3 style={{ color: '#053F5C', fontWeight: 900, fontSize: 20, margin: '0 0 8px' }}>
                  Salle d'attente{dots}
                </h3>
                <p style={{ color: '#6B9AB8', fontSize: 14, lineHeight: '1.6', margin: '0 0 24px' }}>
                  L'enseignant n'a pas encore démarré l'examen.<br />
                  Restez sur cette page — vous serez redirigé automatiquement.
                </p>

                {/* Exam Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  <div style={{ padding: '14px 16px', background: '#F0F4F8', borderRadius: 12 }}>
                    <Clock size={18} color="#429EBD" style={{ marginBottom: 6 }} />
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#053F5C' }}>{exam?.durationMinutes ?? '?'}</div>
                    <div style={{ fontSize: 12, color: '#6B9AB8', fontWeight: 600 }}>minutes</div>
                  </div>
                  <div style={{ padding: '14px 16px', background: '#F0F4F8', borderRadius: 12 }}>
                    <BookOpen size={18} color="#429EBD" style={{ marginBottom: 6 }} />
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#053F5C' }}>{exam?.questionCount ?? '?'}</div>
                    <div style={{ fontSize: 12, color: '#6B9AB8', fontWeight: 600 }}>questions</div>
                  </div>
                </div>

                {/* Tips */}
                <div style={{ padding: 16, background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <AlertCircle size={14} color="#D97706" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conseils</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#92400E', lineHeight: '1.8' }}>
                    <li>Assurez-vous d'avoir une connexion stable</li>
                    <li>Ne fermez pas cet onglet</li>
                    <li>Préparez votre brouillon si nécessaire</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
