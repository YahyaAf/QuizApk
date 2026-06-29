import { useState, useEffect } from 'react';
import { Plus, BookOpen, TrendingUp, FileCheck2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { examService } from '../../services/examService';
import { resultService } from '../../services/resultService';

import type { ExamItem } from './components/types';
import ExamList from './components/ExamList';
import ExamFormModal from './components/ExamFormModal';

export default function ExamManagementPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editExam, setEditExam] = useState<ExamItem | null>(null);
  const [modules, setModules] = useState<{ id: number; name: string }[]>([]);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = () => {
    setLoading(true);
    Promise.all([examService.getMyExams(), examService.getTeacherAssignments()])
      .then(([examsData, assignmentsData]) => {
        const items = examsData?.content ?? examsData ?? [];
        setExams(items);
        if (assignmentsData) {
          setModules(assignmentsData.modules || []);
          setGroups(assignmentsData.groups || []);
        }
      })
      .catch(() => {
        toast.error('Erreur lors du chargement des données');
      })
      .finally(() => setLoading(false));
  };

  const handleOpenCreate = () => {
    setEditExam(null);
    setShowForm(true);
  };

  const handleOpenEdit = (exam: ExamItem) => {
    setEditExam(exam);
    setShowForm(true);
  };

  const handleSaveExam = async (payload: any, isEdit: boolean) => {
    try {
      const formattedPayload = {
        ...payload,
        availableFrom:
          payload.availableFrom.length === 16
            ? payload.availableFrom + ':00'
            : payload.availableFrom,
        availableUntil:
          payload.availableUntil.length === 16
            ? payload.availableUntil + ':00'
            : payload.availableUntil,
      };

      if (isEdit && editExam) {
        const updated = await examService.updateExam(editExam.id, formattedPayload);
        setExams((prev) => prev.map((ex) => (ex.id === editExam.id ? updated : ex)));
        toast.success('Examen mis à jour !');
      } else {
        const created = await examService.createExam(formattedPayload);
        setExams((prev) => [created, ...prev]);
        toast.success('Examen créé !');
      }
      setShowForm(false);
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet examen définitivement ?')) return;
    try {
      await examService.deleteExam(id);
      setExams((prev) => prev.filter((e) => e.id !== id));
      toast.success('Examen supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handlePublish = async (exam: ExamItem) => {
    try {
      const updated = await examService.publishExam(exam.id, !exam.published);
      setExams((prev) => prev.map((e) => (e.id === exam.id ? updated : e)));
      toast.success(exam.published ? 'Examen dépublié' : 'Examen publié !');
    } catch {
      toast.error('Erreur de publication');
    }
  };

  const handleExportPdf = async (id: number) => {
    try {
      await resultService.exportExamResultsPdf(id);
    } catch {
      toast.error("Erreur lors de l'export PDF");
    }
  };

  const published = exams.filter((e) => e.published).length;
  const totalDuration = exams.reduce((s, e) => s + e.durationMinutes, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* ── Hero Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #053F5C 0%, #0A6190 60%, #0E7BB0 100%)',
          borderRadius: 18,
          padding: '28px 32px',
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 100, width: 100, height: 100, borderRadius: '50%', background: 'rgba(66,158,189,0.18)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 20, right: 160, width: 60, height: 60, borderRadius: '50%', background: 'rgba(247,173,25,0.12)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: 'rgba(247,173,25,0.2)',
                  border: '1.5px solid rgba(247,173,25,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F7AD19',
                }}
              >
                <BookOpen size={20} />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 900,
                    fontSize: 24,
                    color: '#fff',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Mes Examens
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12.5, margin: 0, marginTop: 2 }}>
                  Créez, modifiez et gérez vos examens en toute simplicité.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              borderRadius: 12,
              border: '1.5px solid rgba(247,173,25,0.45)',
              background: 'rgba(247,173,25,0.18)',
              color: '#F7AD19',
              fontWeight: 800,
              fontSize: 13.5,
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backdropFilter: 'blur(4px)',
              transition: 'background 0.18s, transform 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(247,173,25,0.28)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(247,173,25,0.18)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={17} /> Nouvel examen
          </button>
        </div>

        {/* Mini stats row */}
        {!loading && exams.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 20,
              flexWrap: 'wrap',
            }}
          >
            {[
              { icon: <FileCheck2 size={13} />, label: `${exams.length} examen${exams.length > 1 ? 's' : ''}`, color: '#9FE7F5' },
              { icon: <TrendingUp size={13} />, label: `${published} publié${published > 1 ? 's' : ''}`, color: '#86EFAC' },
              { icon: <Clock size={13} />, label: `${totalDuration} min cumulées`, color: '#FCD34D' },
            ].map((stat) => (
              <span
                key={stat.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: stat.color,
                  padding: '5px 12px',
                  borderRadius: 9,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {stat.icon} {stat.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Exam List ── */}
      <ExamList
        exams={exams}
        loading={loading}
        onOpenCreate={handleOpenCreate}
        onOpenEdit={handleOpenEdit}
        onOpenQuestions={(exam) => navigate(`/teacher/exams/${exam.id}/questions`)}
        onPublish={handlePublish}
        onDelete={handleDelete}
        onExportPdf={handleExportPdf}
      />

      {/* ── Form Modal ── */}
      <ExamFormModal
        show={showForm}
        exam={editExam}
        onClose={() => setShowForm(false)}
        onSave={handleSaveExam}
        modules={modules}
        groups={groups}
      />
    </div>
  );
}
