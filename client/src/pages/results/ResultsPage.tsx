import { useState, useEffect } from 'react';
import { Trophy, Clock, CheckCircle2, XCircle, ChevronRight, Download, Award, FileText, Eye, X } from 'lucide-react';
import { resultService } from '../../services/resultService';
import toast from 'react-hot-toast';

function ScoreRing({ score }: { score: number }) {
  const r    = 32;
  const circ = 2 * Math.PI * r;
  const color = score >= 85 ? '#16A34A' : score >= 60 ? '#D9930F' : '#E11D48';
  return (
    <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
      <svg viewBox="0 0 76 76" style={{ width: 76, height: 76, transform: 'rotate(-90deg)' }}>
        <circle cx="38" cy="38" r={r} fill="none" stroke="#EBF2F8" strokeWidth="7" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${(score / 100) * circ} ${circ - (score / 100) * circ}`}
          strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontWeight: 900, fontSize: 14, color }}>{Math.round(score)}%</span>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const [detailsModal, setDetailsModal] = useState<any | null>(null);
  const [answers, setAnswers] = useState<any[] | null>(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await resultService.getMyResults();
        setResults(res?.content || res || []);
      } catch {
        toast.error('Erreur lors du chargement des résultats');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const total  = results.length;
  const avg    = total > 0 ? Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / total) : 0;
  const passed = results.filter((r) => r.passed).length;
  const fmt    = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  const handleDownload = async (id: number, type: 'pdf' | 'certificate') => {
    const key = `${type}-${id}`;
    setDownloading((p) => ({ ...p, [key]: true }));
    try {
      if (type === 'pdf') {
        await resultService.downloadPdf(id);
        toast.success('Résultat PDF téléchargé !');
      } else {
        await resultService.downloadCertificate(id);
        toast.success('Attestation téléchargée !');
      }
    } catch {
      toast.error('Erreur lors du téléchargement. Vérifiez que le serveur est lancé.');
    } finally {
      setDownloading((p) => ({ ...p, [key]: false }));
    }
  };

  const openDetails = async (result: any) => {
    setDetailsModal(result);
    setLoadingAnswers(true);
    setAnswers(null);
    try {
      const data = await resultService.getResultAnswers(result.id);
      setAnswers(data);
    } catch {
      toast.error('Erreur lors du chargement des détails');
    } finally {
      setLoadingAnswers(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Chargement des résultats...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <div>
        <h1 className="page-title font-display">Mes Résultats</h1>
        <p className="page-sub">Consultez vos performances et téléchargez vos attestations.</p>
      </div>

      {/* Summary */}
      <div className="grid-3">
        <div className="stat-card" style={{ borderColor: '#FBD98A' }}>
          <div className="stat-icon" style={{ background: '#FEF9EC' }}>
            <Trophy size={22} color="#D9930F" />
          </div>
          <div>
            <div className="stat-label">Score moyen</div>
            <div className="stat-value" style={{ color: '#D9930F' }}>{avg}%</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: '#86EFAC' }}>
          <div className="stat-icon" style={{ background: '#F0FDF4' }}>
            <CheckCircle2 size={22} color="#16A34A" />
          </div>
          <div>
            <div className="stat-label">Examens réussis</div>
            <div className="stat-value" style={{ color: '#16A34A' }}>{passed}/{total}</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: '#C3D9E8' }}>
          <div className="stat-icon" style={{ background: '#EBF5FB' }}>
            <Clock size={22} color="#429EBD" />
          </div>
          <div>
            <div className="stat-label">Taux de réussite</div>
            <div className="stat-value" style={{ color: '#429EBD' }}>{total > 0 ? Math.round((passed / total) * 100) : 0}%</div>
          </div>
        </div>
      </div>

      {/* Results list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 12, border: '1px solid #DDE8F0' }}>
            Aucun résultat disponible.
          </div>
        ) : results.map((result) => {
          const score = result.percentage || 0;
          return (
            <div key={result.id} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
              <ScoreRing score={score} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#053F5C', fontSize: 14 }}>{result.examTitle}</span>
                  {result.passed ? (
                    <span style={{ background: '#F0FDF4', color: '#16A34A', fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={10} /> Réussi
                    </span>
                  ) : (
                    <span style={{ background: '#FFF1F2', color: '#BE123C', fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <XCircle size={10} /> Échoué
                    </span>
                  )}
                  {result.pendingManualGrade && (
                    <span style={{ background: '#FEF9EC', color: '#D9930F', fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> En attente de correction
                    </span>
                  )}
                </div>
                <div style={{ color: '#6B9AB8', fontSize: 12, marginBottom: 6 }}>{result.courseName} · {new Date(result.createdAt).toLocaleDateString('fr-FR')}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 600, color: '#6B9AB8' }}>
                  <span>Questions : <strong style={{ color: '#053F5C' }}>{result.correctAnswers}/{result.totalQuestions} correctes</strong></span>
                  <span>Score : <strong style={{ color: '#053F5C' }}>{result.score} Pts</strong></span>
                </div>
              </div>

              {/* Download buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => handleDownload(result.id, 'pdf')}
                  disabled={downloading[`pdf-${result.id}`]}
                  className="btn btn-ghost"
                  style={{ padding: '7px 12px', fontSize: 12 }}
                  title="Télécharger le résultat PDF"
                >
                  {downloading[`pdf-${result.id}`]
                    ? <div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 14, height: 14 }} />
                    : <><FileText size={13} /> Résultat PDF</>}
                </button>
                <button
                  onClick={() => openDetails(result)}
                  className="btn btn-accent"
                  style={{ padding: '7px 12px', fontSize: 12 }}
                  title="Voir les détails"
                >
                  <Eye size={13} /> Détails
                </button>
              </div>

              <ChevronRight size={16} color="#C3D9E8" style={{ flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
      
      {/* Modal Détails */}
      {detailsModal && (
        <div className="animate-scale-in" style={{ position: 'fixed', inset: 0, background: 'rgba(5,63,92,0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ padding: 32, maxWidth: 600, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid #DDE8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#053F5C' }}>Détails : {detailsModal.examTitle}</h2>
              <button onClick={() => setDetailsModal(null)} className="btn btn-ghost" style={{ padding: 8 }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 8 }}>
              {loadingAnswers ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#6B9AB8' }}>Chargement des réponses...</div>
              ) : answers?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#6B9AB8' }}>Aucune réponse trouvée.</div>
              ) : answers?.map((ans, idx) => {
                const isCorrect = ans.teacherScore > 0;
                const userAnswer = ans.textAnswer || "Non répondu";
                
                return (
                  <div key={ans.answerId || idx} style={{ padding: 16, borderRadius: 12, border: `1px solid ${isCorrect ? '#86EFAC' : '#FECDD3'}`, background: isCorrect ? '#F0FDF4' : '#FFF1F2' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ marginTop: 2 }}>{isCorrect ? <CheckCircle2 size={18} color="#16A34A" /> : <XCircle size={18} color="#E11D48" />}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, color: '#053F5C', marginBottom: 12, fontSize: 14 }}>{idx + 1}. {ans.questionStatement}</p>
                        <div style={{ fontSize: 13, marginBottom: 8 }}>
                          <span style={{ color: '#6B9AB8', fontWeight: 600 }}>Votre réponse : </span>
                          <strong style={{ color: isCorrect ? '#16A34A' : '#E11D48' }}>{userAnswer}</strong>
                        </div>
                        {ans.teacherFeedback && (
                          <div style={{ marginTop: 8, fontSize: 12, color: '#A0620A', background: '#FEF9EC', padding: 8, borderRadius: 6, border: '1px solid #FBD98A' }}>
                            <strong>Feedback :</strong> {ans.teacherFeedback}
                          </div>
                        )}
                        <div style={{ marginTop: 4, fontSize: 11, color: '#6B9AB8' }}>
                          Points : {ans.teacherScore || 0} / {ans.questionPoints}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
