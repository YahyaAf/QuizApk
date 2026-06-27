import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2, ChevronLeft, TrendingUp, Target, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { analyticsService } from '../../services/dashboardService';
import toast from 'react-hot-toast';

interface QuestionStat {
  questionId: number;
  questionText: string;
  totalAnswers: number;
  correctAnswers: number;
  correctRate: number;
  averageScore?: number;
}

export default function ExamAnalyticsPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<QuestionStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) return;
    analyticsService.getQuestionStats(Number(examId))
      .then(setStats)
      .catch(() => toast.error('Erreur chargement des statistiques'))
      .finally(() => setLoading(false));
  }, [examId]);

  const avgCorrectRate = stats.length > 0
    ? Math.round(stats.reduce((s, q) => s + q.correctRate, 0) / stats.length)
    : 0;
  const hardest = stats.reduce((prev, cur) => (cur.correctRate < prev.correctRate ? cur : prev), stats[0]);
  const easiest = stats.reduce((prev, cur) => (cur.correctRate > prev.correctRate ? cur : prev), stats[0]);

  const barColor = (rate: number) => {
    if (rate >= 70) return '#16A34A';
    if (rate >= 40) return '#D97706';
    return '#E11D48';
  };

  const chartData = stats.map((q, idx) => ({
    name: `Q${idx + 1}`,
    rate: Math.round(q.correctRate),
    total: q.totalAnswers,
    correct: q.correctAnswers,
    text: q.questionText,
  }));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid #DDE8F0', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#6B9AB8' }}
        >
          <ChevronLeft size={16} /> Retour
        </button>
        <div>
          <h1 className="page-title font-display">Analytics par question</h1>
          <p className="page-sub">Examen #{examId} — Analyse détaillée des performances</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 80, textAlign: 'center' }}>
          <div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 36, height: 36, margin: '0 auto' }} />
        </div>
      ) : stats.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <AlertCircle size={48} color="#C3D9E8" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#053F5C', fontWeight: 700, fontSize: 15 }}>Aucune donnée disponible</p>
          <p style={{ color: '#6B9AB8', fontSize: 13, marginTop: 6 }}>Les statistiques apparaissent après les premières soumissions.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid-4">
            {[
              { icon: BarChart2, label: 'Questions analysées', value: stats.length, color: '#053F5C', bg: '#EBF5FB', border: '#C3D9E8' },
              { icon: TrendingUp, label: 'Taux moyen de réussite', value: `${avgCorrectRate}%`, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
              { icon: CheckCircle2, label: 'Question la + facile', value: easiest ? `Q${stats.indexOf(easiest) + 1} (${Math.round(easiest.correctRate)}%)` : '—', color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
              { icon: XCircle, label: 'Question la + difficile', value: hardest ? `Q${stats.indexOf(hardest) + 1} (${Math.round(hardest.correctRate)}%)` : '—', color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3' },
            ].map(({ icon: Icon, label, value, color, bg, border }) => (
              <div className="stat-card" key={label} style={{ borderColor: border }}>
                <div className="stat-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
                <div>
                  <div className="stat-label">{label}</div>
                  <div className="stat-value" style={{ color, fontSize: typeof value === 'string' && value.length > 8 ? 18 : 24 }}>{String(value)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <BarChart2 size={18} color="#053F5C" />
              <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 15 }}>Taux de réussite par question</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBF2F8" />
                <XAxis dataKey="name" tick={{ fill: '#6B9AB8', fontSize: 12, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6B9AB8', fontSize: 12 }} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #DDE8F0', fontSize: 13 }}
                  formatter={(value: number) => [`${value}%`, 'Taux de réussite']}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${label}: ${item.correct}/${item.total} correct` : label;
                  }}
                />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColor(entry.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #EBF2F8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Target size={16} color="#053F5C" />
                <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 14 }}>Détail par question</span>
              </div>
            </div>
            {/* Header */}
            <div style={{ padding: '10px 24px', background: '#F8FAFC', borderBottom: '1px solid #EBF2F8', display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 100px', gap: 12 }}>
              {['#', 'Question', 'Réponses', 'Correctes', 'Taux'].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B9AB8' }}>{h}</span>
              ))}
            </div>
            {stats.map((q, idx) => {
              const rate = Math.round(q.correctRate);
              const color = barColor(rate);
              return (
                <div key={q.questionId} className="table-row" style={{ padding: '14px 24px', display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 100px', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#053F5C' }}>
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: 13, color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={q.questionText}>
                    {q.questionText}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#053F5C' }}>{q.totalAnswers}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#16A34A' }}>{q.correctAnswers}</div>
                  <div>
                    <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ width: `${rate}%`, height: '100%', background: color }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color }}>{rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
