import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Download, BarChart2, Search,
  AlertCircle, TrendingUp, Users, FileText, Filter
} from 'lucide-react';
import { resultService } from '../../services/resultService';
import toast from 'react-hot-toast';

interface ResultItem {
  id: number;
  submissionId: number;
  examId: number;
  examTitle: string;
  courseName: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  passed: boolean;
  createdAt: string;
  pendingManualGrade: boolean;
  manuallyGraded: boolean;
  textAnswerCount: number;
}

export default function TeacherResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterExam, setFilterExam] = useState('ALL');
  const [exporting, setExporting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    resultService.getTeacherResults()
      .then((data) => {
        setResults(data || []);
      })
      .catch(() => toast.error('Erreur chargement des résultats'))
      .finally(() => setLoading(false));
  }, []);

  const examTitles = [...new Set(results.map((r) => r.examTitle))];
  const filtered = results.filter((r) => {
    const matchSearch = `${r.studentName} ${r.courseName} ${r.examTitle}`.toLowerCase().includes(search.toLowerCase());
    const matchExam = filterExam === 'ALL' || r.examTitle === filterExam;
    return matchSearch && matchExam;
  });

  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((sum, r) => sum + (r.percentage ?? 0), 0) / filtered.length)
    : 0;
  const passRate = filtered.length > 0
    ? Math.round((filtered.filter((r) => r.passed).length / filtered.length) * 100)
    : 0;

  const handleExportPdf = async (examId: number) => {
    setExporting(examId);
    try {
      await resultService.exportExamResultsPdf(examId);
      toast.success('Export PDF téléchargé !');
    } catch {
      toast.error('Erreur export PDF');
    }
    setExporting(null);
  };

  const scoreColor = (pct: number) => {
    if (pct >= 70) return '#16A34A';
    if (pct >= 50) return '#D97706';
    return '#E11D48';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 className="page-title font-display">Résultats de mes examens</h1>
        <p className="page-sub">Consultez et exportez les résultats de tous vos examens.</p>
      </div>

      {/* Stats rapides */}
      {!loading && filtered.length > 0 && (
        <div className="grid-4">
          {[
            { icon: Users, label: 'Soumissions', value: filtered.length, color: '#053F5C', bg: '#EBF5FB', border: '#C3D9E8' },
            { icon: TrendingUp, label: 'Score moyen', value: `${avgScore}%`, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
            { icon: CheckCircle2, label: 'Taux de réussite', value: `${passRate}%`, color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
            { icon: FileText, label: 'Examens', value: examTitles.length, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
          ].map(({ icon: Icon, label, value, color, bg, border }) => (
            <div className="stat-card" key={label} style={{ borderColor: border }}>
              <div className="stat-icon" style={{ background: bg }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ color }}>{String(value)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} color="#053F5C" />
            <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 14 }}>Résultats</span>
            <span className="badge badge-navy">{filtered.length}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            {/* Exam filter */}
            <div style={{ position: 'relative' }}>
              <Filter size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8' }} />
              <select
                value={filterExam}
                onChange={(e) => setFilterExam(e.target.value)}
                style={{ padding: '7px 12px 7px 28px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#053F5C', background: '#fff', cursor: 'pointer', appearance: 'none' }}
              >
                <option value="ALL">Tous les examens</option>
                {examTitles.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8' }} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '7px 12px 7px 28px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, width: 200, outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 32, height: 32, margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <AlertCircle size={40} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#053F5C', fontWeight: 700 }}>Aucun résultat trouvé</p>
          </div>
        ) : (
          <>
            {/* Header row */}
            <div style={{ padding: '10px 24px', background: '#F8FAFC', borderBottom: '1px solid #EBF2F8', display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 120px 100px 80px 100px', gap: 12 }}>
              {['Étudiant', 'Examen', 'Score', '%', 'Statut', 'Actions'].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B9AB8' }}>{h}</span>
              ))}
            </div>
            {filtered.map((r) => {
              const pct = r.percentage ?? 0;
              const color = scoreColor(pct);
              return (
                <div key={r.id} className="table-row" style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 120px 100px 80px 100px', gap: 12, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EBF5FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#053F5C', flexShrink: 0 }}>
                      {r.studentName?.[0]?.toUpperCase() || 'E'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#053F5C', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.studentName ?? '—'}</div>
                      <div style={{ fontSize: 11, color: '#6B9AB8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#374151', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.examTitle ?? '—'}</div>
                    {r.courseName && <div style={{ fontSize: 11, color: '#6B9AB8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.courseName}</div>}
                  </div>
                  <div style={{ fontWeight: 800, color, fontSize: 14 }}>{r.score} pts</div>
                  <div>
                    <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color }} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 3 }}>{pct.toFixed(0)}%</div>
                  </div>
                  <span className={`badge ${r.passed ? 'badge-green' : 'badge-red'}`} style={{ justifySelf: 'start' }}>{r.passed ? 'Réussi' : 'Échoué'}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => navigate(`/teacher/analytics/${r.examId}`)}
                      title="Analytics"
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#429EBD' }}
                    >
                      <BarChart2 size={14} />
                    </button>
                    <button
                      onClick={() => handleExportPdf(r.examId)}
                      disabled={exporting === r.examId}
                      title="Exporter PDF"
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}
                    >
                      {exporting === r.examId ? <div className="spinner" style={{ borderColor: 'rgba(22,163,74,0.2)', borderTopColor: '#16A34A', width: 14, height: 14 }} /> : <Download size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
