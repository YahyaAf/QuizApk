import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2, ChevronLeft, TrendingUp, Target, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { analyticsService } from '../../services/dashboardService';
import toast from 'react-hot-toast';

interface QuestionStat {
  questionId: number;
  statement: string;
  questionType: string;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number;
  points: number;
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
    ? Math.round(stats.reduce((s, q) => s + q.successRate, 0) / stats.length)
    : 0;
  const hardest = stats.length > 0 ? stats.reduce((prev, cur) => (cur.successRate < prev.successRate ? cur : prev), stats[0]) : null;
  const easiest = stats.length > 0 ? stats.reduce((prev, cur) => (cur.successRate > prev.successRate ? cur : prev), stats[0]) : null;

  const barColor = (rate: number) => {
    if (rate >= 70) return '#16A34A'; // emerald
    if (rate >= 40) return '#D97706'; // amber
    return '#E11D48'; // rose
  };

  const chartData = stats.map((q, idx) => ({
    name: `Q${idx + 1}`,
    rate: Math.round(q.successRate),
    total: q.totalAttempts,
    correct: q.correctAttempts,
    text: q.statement,
  }));

  return (
    <div className="animate-fade-in flex flex-col gap-8 w-full  mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-muted hover:text-navy font-bold text-sm mb-4 transition-colors"
          >
            <ChevronLeft size={16} /> Retour aux résultats
          </button>
          <h1 className="page-title font-display flex flex-wrap items-center gap-x-3 gap-y-1">
            Analytics par question
            <span className="text-muted font-normal hidden sm:inline">—</span> 
            <span className="text-sky text-2xl">Examen #{examId}</span>
          </h1>
          <p className="page-sub mt-2 font-semibold">
            Analyse détaillée des performances et du taux de réussite par question.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="spinner w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
        </div>
      ) : stats.length === 0 ? (
        <div className="p-10 flex flex-col items-center justify-center text-center text-muted bg-white rounded-2xl border-2 border-dashed border-border-soft">
          <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center mb-4">
            <AlertCircle size={24} className="text-sky/60" />
          </div>
          <h3 className="font-bold text-navy text-lg mb-1">Aucune donnée disponible</h3>
          <p className="text-sm font-medium">Les statistiques apparaîtront après les premières soumissions.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: BarChart2, label: 'Questions analysées', value: stats.length, color: 'text-sky', bg: 'bg-sky/10', border: 'border-sky/20' },
              { icon: TrendingUp, label: 'Taux moyen', value: `${avgCorrectRate}%`, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200' },
              { icon: CheckCircle2, label: 'Question la + facile', value: easiest ? `Q${stats.indexOf(easiest) + 1} (${Math.round(easiest.successRate)}%)` : '—', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
              { icon: XCircle, label: 'Question la + difficile', value: hardest ? `Q${stats.indexOf(hardest) + 1} (${Math.round(hardest.successRate)}%)` : '—', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
            ].map(({ icon: Icon, label, value, color, bg, border }) => (
              <div key={label} className={`card p-5 border ${border} bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${bg.replace('bg-', 'bg-').replace('/10', '').replace('-50', '-400')}`} />
                <div className="flex items-center gap-4 relative z-10 pl-2">
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={24} className={color} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">{label}</div>
                    <div className={`font-black ${String(value).length > 8 ? 'text-xl' : 'text-2xl'} text-navy`}>{String(value)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="card p-6 border border-border-soft bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-soft">
              <div className="w-10 h-10 rounded-xl bg-sky/10 flex items-center justify-center text-sky">
                <BarChart2 size={20} />
              </div>
              <div>
                <h3 className="font-display font-black text-navy text-lg">Taux de réussite par question</h3>
                <p className="text-muted text-xs font-semibold mt-1">Comparaison visuelle des performances globales</p>
              </div>
            </div>
            
            <div className="w-full" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBF2F8" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#6B9AB8', fontSize: 12, fontWeight: 700 }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#6B9AB8', fontSize: 12, fontWeight: 600 }} 
                    unit="%" 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(5, 63, 92, 0.04)' }}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontSize: 13, fontWeight: 600, padding: 12 }}
                    formatter={(value: number) => [`${value}%`, 'Taux de réussite']}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item ? (
                        <span className="flex flex-col gap-1 pb-2 mb-2 border-b border-slate-100">
                          <span className="text-navy font-bold">{label}</span>
                          <span className="text-slate-500 text-xs font-normal max-w-[200px] truncate" title={item.text}>{item.text}</span>
                          <span className="text-sky font-bold text-xs mt-1">{item.correct} bonnes réponses / {item.total}</span>
                        </span>
                      ) : label;
                    }}
                  />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColor(entry.rate)} className="transition-all duration-300 hover:opacity-80" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="card border border-border-soft bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-border-soft">
              <div className="w-10 h-10 rounded-xl bg-sky/10 flex items-center justify-center text-sky">
                <Target size={20} />
              </div>
              <div>
                <h3 className="font-display font-black text-navy text-lg">Détail analytique par question</h3>
                <p className="text-muted text-xs font-semibold mt-1">Données complètes pour identifier les lacunes des apprenants</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-bg/50 border-b border-border-soft text-xs font-black text-muted uppercase tracking-wider">
                    <th className="py-4 px-6 w-16">#</th>
                    <th className="py-4 px-6">Énoncé de la question</th>
                    <th className="py-4 px-6 text-center w-32">Réponses</th>
                    <th className="py-4 px-6 text-center w-32">Correctes</th>
                    <th className="py-4 px-6 w-48">Taux de réussite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {stats.map((q, idx) => {
                    const rate = Math.round(q.successRate);
                    const color = barColor(rate);
                    return (
                      <tr key={q.questionId} className="hover:bg-bg/30 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="w-8 h-8 rounded-full bg-bg flex items-center justify-center font-black text-xs text-navy group-hover:bg-sky/10 group-hover:text-sky transition-colors">
                            {idx + 1}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-navy font-semibold line-clamp-2" title={q.statement}>
                            {q.statement}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-sm font-bold text-navy bg-bg px-3 py-1 rounded-full">{q.totalAttempts}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{q.correctAttempts}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${rate}%`, backgroundColor: color }} />
                            </div>
                            <span className="text-sm font-black w-10 text-right" style={{ color }}>{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
