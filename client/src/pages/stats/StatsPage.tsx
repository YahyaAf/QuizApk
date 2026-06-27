import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { TrendingUp, Target, Award, Flame, Users, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/dashboardService';
import { resultService } from '../../services/resultService';
import toast from 'react-hot-toast';

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) return (
    <div className="card" style={{ padding: '8px 14px', fontSize: 12, border: '1px solid #DDE8F0' }}>
      <div style={{ fontWeight: 700, color: '#053F5C', marginBottom: 4 }}>{label || payload[0]?.payload?.name || ''}</div>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ color: entry.color || '#429EBD' }}>
          {entry.name === 'Score' || entry.dataKey === 'score' ? 'Score' : 'Temps'} : <strong style={{ color: '#053F5C' }}>{entry.value}{entry.name === 'Score' || entry.dataKey === 'score' ? '%' : ' min'}</strong>
        </div>
      ))}
    </div>
  );
  return null;
}

export default function StatsPage() {
  const user = useAuthStore((s) => s.user);

  const [dashboard, setDashboard] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'ROLE_STUDENT') {
          const [dash, res] = await Promise.all([
            dashboardService.getStudentDashboard(),
            resultService.getMyResults()
          ]);
          setDashboard(dash);
          setResults(res?.content || res || []);
        } else if (user?.role === 'ROLE_TEACHER') {
          const dash = await dashboardService.getTeacherDashboard();
          setDashboard(dash);
        }
      } catch (err) {
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.role]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Chargement des statistiques...</div>;
  }

  // Derive SCORE_HISTORY from results (for student)
  const monthlyScores: Record<string, { total: number, count: number, timestamp: number }> = {};
  results.forEach(r => {
    const month = new Date(r.createdAt).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    if (!monthlyScores[month]) {
      monthlyScores[month] = { total: 0, count: 0, timestamp: new Date(r.createdAt).getTime() };
    }
    monthlyScores[month].total += (r.percentage || 0);
    monthlyScores[month].count += 1;
  });

  const scoreHistory = Object.entries(monthlyScores)
    .map(([month, data]) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      score: data.count > 0 ? (data.total / data.count) : 0,
      timestamp: data.timestamp
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const chartData = scoreHistory.length > 0 ? scoreHistory : [];

  // Derive Score vs Time data
  const scatterData = results
    .filter(r => r.durationSeconds != null && r.durationSeconds > 0)
    .map(r => ({
      name: r.examTitle,
      duration: Math.round(r.durationSeconds / 60),
      score: r.percentage || 0
    }));

  let trend = 0;
  let kpis: any[] = [];

  if (user?.role === 'ROLE_STUDENT') {
    const avg = dashboard?.averageScore ? Math.round(dashboard.averageScore) : 0;
    trend = scoreHistory.length > 1 ? Math.round(scoreHistory[scoreHistory.length - 1].score - scoreHistory[0].score) : 0;
    const maxScore = scoreHistory.length > 0 ? Math.max(...scoreHistory.map(s => s.score)) : 0;
    const passed = dashboard?.examsTaken || 0;

    kpis = [
      { icon: Target, label: 'Score moyen', value: `${avg}%`, color: '#429EBD', bg: '#EBF5FB', border: '#C3D9E8' },
      { icon: TrendingUp, label: 'Progression', value: `${trend > 0 ? '+' : ''}${trend}%`, color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
      { icon: Award, label: 'Examens passés', value: `${passed}`, color: '#D9930F', bg: '#FEF9EC', border: '#FBD98A' },
      { icon: Flame, label: 'Meilleur score', value: `${Math.round(maxScore)}%`, color: '#053F5C', bg: '#EBF5FB', border: '#C3D9E8' },
    ];
  } else if (user?.role === 'ROLE_TEACHER') {
    const examsCreated = dashboard?.examsCreated || 0;
    const participants = dashboard?.totalParticipants || 0;

    let globalAvg = 0;
    if (dashboard?.averageScoreByExam?.length > 0) {
      globalAvg = Math.round(dashboard.averageScoreByExam.reduce((sum: number, exam: any) => sum + exam.averagePercentage, 0) / dashboard.averageScoreByExam.length);
    }

    kpis = [
      { icon: BookOpen, label: 'Examens créés', value: String(examsCreated), color: '#429EBD', bg: '#EBF5FB', border: '#C3D9E8' },
      { icon: Users, label: 'Participants totaux', value: String(participants), color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
      { icon: Target, label: 'Moyenne globale', value: `${globalAvg}%`, color: '#D9930F', bg: '#FEF9EC', border: '#FBD98A' }
    ];
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <div>
        <h1 className="page-title font-display">Statistiques</h1>
        <p className="page-sub">Analysez votre progression et identifiez vos points forts.</p>
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
              <div className="stat-value" style={{ color }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {user?.role === 'ROLE_STUDENT' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Area Chart */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, color: '#053F5C', fontSize: 15 }}>Évolution des scores</h2>
              {trend > 0 && (
                <span style={{ background: '#F0FDF4', color: '#16A34A', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  En progression
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#053F5C" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#053F5C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBF2F8" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B9AB8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B9AB8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#053F5C" strokeWidth={2.5} fill="url(#grad)"
                  dot={{ r: 4, fill: '#053F5C', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#F7AD19', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Scatter Chart */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, color: '#053F5C', fontSize: 15, marginBottom: 20 }}>Score vs Temps de passage (min)</h2>
            <ResponsiveContainer width="100%" height={230}>
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBF2F8" />
                <XAxis type="number" dataKey="duration" name="Temps" unit=" min" tick={{ fontSize: 11, fill: '#6B9AB8' }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="score" name="Score" unit="%" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B9AB8' }} axisLine={false} tickLine={false} />
                <ZAxis type="category" dataKey="name" name="Examen" />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Scores" data={scatterData} fill="#F7AD19" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
