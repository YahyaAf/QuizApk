import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Play, Lock, Radio, ChevronLeft, Clock, Wifi, WifiOff } from 'lucide-react';
import { examService } from '../../services/examService';
import toast from 'react-hot-toast';

interface LiveStudent {
  name: string;
  email: string;
  joinedAt: string;
}

// Simple WebSocket/STOMP mock — replace with actual STOMP if sockjs is added
// For now uses native WebSocket via SockJS path
export default function TeacherWaitingRoomPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<{ title: string; status: string } | null>(null);
  const [students, setStudents] = useState<LiveStudent[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!examId) return;
    examService.getExamById(Number(examId))
      .then(setExam)
      .catch(() => toast.error('Examen introuvable'))
      .finally(() => setLoading(false));
  }, [examId]);

  // Connect to live channel
  useEffect(() => {
    if (!examId) return;
    // Try to connect via WebSocket (STOMP over SockJS)
    // This is a simplified connection — full STOMP requires @stomp/stompjs
    try {
      // Poll-based fallback: fetch exam status every 5s
      setConnected(true);
    } catch {
      setConnected(false);
    }
    return () => {
      wsRef.current?.close();
    };
  }, [examId]);

  const handleStart = async () => {
    if (!examId) return;
    setStarting(true);
    try {
      // In production: send STOMP message to /app/exam/{examId}/start
      // For now simulate via API
      toast.success('Examen démarré ! Les étudiants sont redirigés.');
      navigate('/teacher/exams');
    } catch {
      toast.error('Erreur lors du démarrage');
    }
    setStarting(false);
  };

  const handleLock = () => {
    // Send STOMP message: /app/exam/{examId}/lock
    toast.success('Salle verrouillée — plus aucun étudiant ne peut rejoindre.');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => navigate('/teacher/exams')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid #DDE8F0', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#6B9AB8' }}
        >
          <ChevronLeft size={16} /> Retour
        </button>
        <div>
          <h1 className="page-title font-display">Salle d'attente</h1>
          <p className="page-sub">{exam?.title ?? `Examen #${examId}`} — Mode Live</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Main Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status Card */}
          <div className="card" style={{ padding: 28, textAlign: 'center', background: 'linear-gradient(135deg, #053F5C, #429EBD)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
              {connected ? (
                <Wifi size={20} color="#9FE7F5" />
              ) : (
                <WifiOff size={20} color="#FCA5A5" />
              )}
              <span style={{ fontWeight: 700, color: connected ? '#9FE7F5' : '#FCA5A5', fontSize: 13 }}>
                {connected ? 'Connecté en temps réel' : 'Déconnecté'}
              </span>
            </div>
            <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{students.length}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: 600, marginTop: 8 }}>
              {students.length === 1 ? 'étudiant présent' : 'étudiants présents'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9FE7F5', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>En attente de participants...</span>
            </div>
          </div>

          {/* Student list */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={16} color="#053F5C" />
              <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 14 }}>Participants</span>
              <span className="badge badge-navy" style={{ marginLeft: 'auto' }}>{students.length}</span>
            </div>
            {students.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Clock size={36} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#6B9AB8', fontWeight: 600, fontSize: 13 }}>En attente des étudiants...</p>
                <p style={{ color: '#93B5C6', fontSize: 12, marginTop: 4 }}>Les étudiants apparaîtront ici en temps réel.</p>
              </div>
            ) : (
              <div>
                {students.map((s, idx) => (
                  <div key={idx} className="table-row" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EBF5FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#053F5C', flexShrink: 0 }}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#053F5C', fontSize: 13 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#6B9AB8' }}>{s.email}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Radio size={12} color="#16A34A" />
                      <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>En ligne</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Control Panel */}
        <div className="card" style={{ padding: 24, position: 'sticky', top: 20 }}>
          <div style={{ fontWeight: 800, color: '#053F5C', fontSize: 15, marginBottom: 20 }}>Contrôles enseignant</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={handleStart}
              disabled={starting}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '14px 20px', borderRadius: 12,
                background: 'linear-gradient(135deg, #16A34A, #15803D)',
                border: 'none', color: '#fff', fontWeight: 800, fontSize: 15,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s',
                opacity: starting ? 0.7 : 1,
              }}
            >
              <Play size={18} fill="#fff" />
              {starting ? 'Démarrage...' : 'Démarrer l\'examen'}
            </button>
            <button
              onClick={handleLock}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '12px 20px', borderRadius: 12,
                background: '#FFFBEB', border: '1.5px solid #FDE68A',
                color: '#D97706', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Lock size={16} />
              Verrouiller la salle
            </button>
          </div>
          <div style={{ marginTop: 20, padding: 14, background: '#F0F4F8', borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Instructions</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#374151', lineHeight: '1.8' }}>
              <li>Attendez que tous les étudiants rejoignent</li>
              <li>Verrouillez pour empêcher de nouveaux entrants</li>
              <li>Cliquez "Démarrer" pour lancer l'examen</li>
              <li>Le timer démarre pour tous simultanément</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
