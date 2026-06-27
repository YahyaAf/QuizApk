import { useState, useEffect } from 'react';
import { FileText, Search, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { examService } from '../../services/examService';
import toast from 'react-hot-toast';

interface ExamItem {
  id: number;
  title: string;
  status: string;
  durationMinutes: number;
  createdBy?: string;
  questionCount?: number;
  submissionCount?: number;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Brouillon', color: '#6B9AB8', bg: '#EBF5FB' },
  PUBLISHED: { label: 'Publié', color: '#16A34A', bg: '#F0FDF4' },
  SCHEDULED: { label: 'Planifié', color: '#D97706', bg: '#FFFBEB' },
  IN_PROGRESS: { label: 'En cours', color: '#7C3AED', bg: '#F5F3FF' },
  WAITING_ROOM_OPEN: { label: 'Salle ouverte', color: '#0891B2', bg: '#ECFEFF' },
  COMPLETED: { label: 'Terminé', color: '#374151', bg: '#F9FAFB' },
};

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 20;

  const load = (p: number) => {
    setLoading(true);
    examService.getAllExams(p, PAGE_SIZE)
      .then((data) => {
        setExams(data?.content ?? (Array.isArray(data) ? data : []));
        setTotalPages(data?.totalPages ?? 1);
      })
      .catch(() => toast.error('Erreur chargement des examens'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  const filtered = exams.filter((e) =>
    `${e.title} ${e.status} ${e.createdBy ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title font-display">Tous les examens</h1>
        <p className="page-sub">Vue globale de tous les examens créés sur la plateforme.</p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} color="#053F5C" />
            <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 14 }}>Examens</span>
            <span className="badge badge-navy">{filtered.length}</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8' }} />
              <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '7px 12px 7px 28px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, width: 220, outline: 'none' }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 32, height: 32, margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <AlertCircle size={40} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#053F5C', fontWeight: 700 }}>Aucun examen trouvé</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '10px 24px', background: '#F8FAFC', borderBottom: '1px solid #EBF2F8', display: 'grid', gridTemplateColumns: '2fr 1fr 120px 100px 80px', gap: 12 }}>
              {['Titre', 'Créé par', 'Durée', 'Statut', 'Soumissions'].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B9AB8' }}>{h}</span>
              ))}
            </div>
            {filtered.map((exam) => {
              const s = STATUS_MAP[exam.status] ?? { label: exam.status, color: '#6B9AB8', bg: '#EBF5FB' };
              return (
                <div key={exam.id} className="table-row" style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr 120px 100px 80px', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#053F5C', fontSize: 13 }}>{exam.title}</div>
                    <div style={{ fontSize: 11, color: '#6B9AB8' }}>#{exam.id} · {exam.questionCount ?? '?'} questions</div>
                  </div>
                  <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 600 }}>{exam.createdBy ?? '—'}</span>
                  <span style={{ fontSize: 13, color: '#374151' }}>{exam.durationMinutes} min</span>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, width: 'fit-content' }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#053F5C' }}>{exam.submissionCount ?? 0}</span>
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
