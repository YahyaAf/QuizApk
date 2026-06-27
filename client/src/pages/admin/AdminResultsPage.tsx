import { useState, useEffect } from 'react';
import { BarChart2, Search, AlertCircle, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { resultService } from '../../services/resultService';
import toast from 'react-hot-toast';

interface ResultItem {
  id: number;
  studentName?: string;
  studentEmail?: string;
  examTitle?: string;
  courseName?: string;
  score: number;
  totalQuestions?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  percentage: number;
  passed: boolean;
  submittedAt?: string;
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 15;

  const load = (p: number) => {
    setLoading(true);
    resultService.getAllResults(p, PAGE_SIZE)
      .then((data) => {
        setResults(data?.content ?? (Array.isArray(data) ? data : []));
        setTotalPages(data?.totalPages ?? 1);
      })
      .catch(() => toast.error('Erreur chargement des résultats'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  const filtered = results.filter((r) =>
    `${r.studentName ?? ''} ${r.studentEmail ?? ''} ${r.examTitle ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const scoreColor = (total: number, max: number) => {
    const pct = max > 0 ? (total / max) * 100 : 0;
    if (pct >= 70) return '#16A34A';
    if (pct >= 50) return '#D97706';
    return '#E11D48';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title font-display">Tous les résultats</h1>
        <p className="page-sub">Vue globale de tous les résultats d'examens sur la plateforme.</p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="#053F5C" />
            <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 14 }}>Résultats</span>
            <span className="badge badge-navy">{results.length}</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8' }} />
              <input type="text" placeholder="Rechercher étudiant, examen..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '7px 12px 7px 28px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, width: 250, outline: 'none' }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 32, height: 32, margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <AlertCircle size={40} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#053F5C', fontWeight: 700 }}>Aucun résultat trouvé</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '10px 24px', background: '#F8FAFC', borderBottom: '1px solid #EBF2F8', display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 100px 100px 100px 80px', gap: 12 }}>
              {['Étudiant', 'Examen', 'Date', 'Score', '%', 'Statut'].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B9AB8' }}>{h}</span>
              ))}
            </div>
            {filtered.map((r) => {
              const pct = r.percentage || 0;
              const color = scoreColor(pct, 100);
              return (
                <div key={r.id} className="table-row" style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 100px 100px 100px 80px', gap: 12, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EBF5FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#053F5C', flexShrink: 0 }}>
                      {r.studentName?.[0]?.toUpperCase() || 'E'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#053F5C', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.studentName ?? '—'}</div>
                      {r.studentEmail && <div style={{ fontSize: 11, color: '#6B9AB8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.studentEmail}</div>}
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#374151', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.examTitle ?? '—'}</div>
                    {r.courseName && <div style={{ fontSize: 11, color: '#6B9AB8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.courseName}</div>}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B9AB8' }}>
                    {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('fr-FR') : '—'}
                  </div>
                  <div style={{ fontWeight: 800, color, fontSize: 13 }}>{r.score} pts</div>
                  <div>
                    <div style={{ width: '100%', height: 5, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden', marginBottom: 3 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct.toFixed(0)}%</span>
                  </div>
                  <span className={`badge ${r.passed ? 'badge-green' : 'badge-red'}`} style={{ justifySelf: 'start' }}>
                    {r.passed ? 'Réussi' : 'Échoué'}
                  </span>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '14px 24px', borderTop: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B9AB8', opacity: page === 0 ? 0.4 : 1 }}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#053F5C' }}>Page {page + 1} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B9AB8', opacity: page >= totalPages - 1 ? 0.4 : 1 }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
