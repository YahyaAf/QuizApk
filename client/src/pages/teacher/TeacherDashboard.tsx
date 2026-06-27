import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CheckCircle2, PenSquare,
  Users, Clock, TrendingUp, AlertCircle, ChevronRight,
  BarChart2, Calendar, FileText
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import toast from 'react-hot-toast';

interface TeacherDashboardData {
  totalExams: number;
  totalSubmissions: number;
  averageScore: number;
  pendingGrading: number;
  activeExams?: number;
  recentExams?: { id: number; title: string; status: string; submissionCount: number }[];
  moduleCount?: number;
  groupCount?: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Brouillon', color: '#6B9AB8', bg: '#EBF5FB' },
  PUBLISHED: { label: 'Publié', color: '#16A34A', bg: '#F0FDF4' },
  SCHEDULED: { label: 'Planifié', color: '#D97706', bg: '#FFFBEB' },
  IN_PROGRESS: { label: 'En cours', color: '#7C3AED', bg: '#F5F3FF' },
  WAITING_ROOM_OPEN: { label: 'Salle ouverte', color: '#0891B2', bg: '#ECFEFF' },
  COMPLETED: { label: 'Terminé', color: '#374151', bg: '#F9FAFB' },
};

export default function TeacherDashboard() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardService.getTeacherDashboard()
      .then(setData)
      .catch(() => toast.error('Erreur chargement tableau de bord'))
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { icon: BookOpen,     label: 'Mes examens',       value: data?.totalExams       ?? '—', color: '#053F5C', bg: '#EBF5FB', border: '#C3D9E8' },
    { icon: CheckCircle2, label: 'Soumissions',        value: data?.totalSubmissions  ?? '—', color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
    { icon: TrendingUp,   label: 'Score moyen',        value: data?.averageScore != null ? `${data.averageScore.toFixed(1)}%` : '—', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { icon: PenSquare,    label: 'En attente correction', value: data?.pendingGrading ?? '—', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title font-display">Tableau de bord Enseignant</h1>
          <p className="page-sub">Vue d'ensemble de vos examens et étudiants.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/teacher/exams')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <BookOpen size={16} /> Gérer mes examens
          </button>
          {(data?.pendingGrading ?? 0) > 0 && (
            <button
              onClick={() => navigate('/teacher/grading')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 18px', borderRadius: 10,
                background: '#FFFBEB', border: '1.5px solid #FDE68A',
                color: '#D97706', fontWeight: 700, fontSize: 13.5,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <PenSquare size={16} />
              {data?.pendingGrading} à corriger
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4">
        {kpis.map(({ icon: Icon, label, value, color, bg, border }) => (
          <div className="stat-card" key={label} style={{ borderColor: border }}>
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ color }}>
                {loading ? '...' : String(value)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Exams */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={18} color="#053F5C" />
              <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 15 }}>Examens récents</span>
            </div>
            <button
              onClick={() => navigate('/teacher/exams')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#429EBD', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
            >
              Voir tout <ChevronRight size={14} />
            </button>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 28, height: 28, margin: '0 auto' }} />
            </div>
          ) : !data?.recentExams?.length ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <FileText size={36} color="#C3D9E8" style={{ margin: '0 auto 10px' }} />
              <p style={{ color: '#6B9AB8', fontWeight: 600, fontSize: 13 }}>Aucun examen créé</p>
            </div>
          ) : (
            <div>
              {data.recentExams.map((exam) => {
                const s = STATUS_LABELS[exam.status] ?? { label: exam.status, color: '#6B9AB8', bg: '#EBF5FB' };
                return (
                  <div key={exam.id} className="table-row" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#053F5C', fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.title}</div>
                      <div style={{ fontSize: 12, color: '#6B9AB8', marginTop: 2 }}>{exam.submissionCount} soumission(s)</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>
                      <button
                        onClick={() => navigate(`/teacher/analytics/${exam.id}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#429EBD', padding: 4 }}
                        title="Voir analytics"
                      >
                        <BarChart2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <LayoutDashboard size={18} color="#053F5C" />
              <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 15 }}>Actions rapides</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Créer un examen', icon: BookOpen, path: '/teacher/exams', color: '#053F5C', bg: '#EBF5FB' },
                { label: 'Corriger des réponses', icon: PenSquare, path: '/teacher/grading', color: '#D97706', bg: '#FFFBEB', badge: data?.pendingGrading },
                { label: 'Voir les résultats', icon: CheckCircle2, path: '/teacher/results', color: '#16A34A', bg: '#F0FDF4' },
              ].map(({ label, icon: Icon, path, color, bg, badge }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 12,
                    background: bg, border: `1.5px solid ${color}20`,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={16} color={color} />
                    <span style={{ fontWeight: 600, color, fontSize: 13.5 }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {badge != null && badge > 0 && (
                      <span style={{ background: color, color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 800 }}>{badge}</span>
                    )}
                    <ChevronRight size={14} color={color} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Context Info */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Users size={18} color="#053F5C" />
              <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 15 }}>Mes affectations</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: '14px 10px', background: '#F0F4F8', borderRadius: 12 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#053F5C' }}>{data?.moduleCount ?? '—'}</div>
                <div style={{ fontSize: 12, color: '#6B9AB8', fontWeight: 600, marginTop: 2 }}>Modules</div>
              </div>
              <div style={{ textAlign: 'center', padding: '14px 10px', background: '#F0F4F8', borderRadius: 12 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#053F5C' }}>{data?.groupCount ?? '—'}</div>
                <div style={{ fontSize: 12, color: '#6B9AB8', fontWeight: 600, marginTop: 2 }}>Groupes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
