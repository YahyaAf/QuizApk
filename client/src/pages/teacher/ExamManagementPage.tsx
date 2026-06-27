import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { examService } from '../../services/examService';
import { resultService } from '../../services/resultService';

import type { ExamItem } from './components/types';
import ExamList from './components/ExamList';
import ExamFormModal from './components/ExamFormModal';
import QuestionManagerPanel from './components/QuestionManagerPanel';

export default function ExamManagementPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editExam, setEditExam] = useState<ExamItem | null>(null);
  const [activeExam, setActiveExam] = useState<ExamItem | null>(null);
  const [modules, setModules] = useState<{id: number, name: string}[]>([]);
  const [groups, setGroups] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = () => {
    setLoading(true);
    Promise.all([
      examService.getMyExams(),
      examService.getTeacherAssignments()
    ])
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
        availableFrom: payload.availableFrom.length === 16 ? payload.availableFrom + ':00' : payload.availableFrom, 
        availableUntil: payload.availableUntil.length === 16 ? payload.availableUntil + ':00' : payload.availableUntil
      };
      
      if (isEdit && editExam) {
        const updated = await examService.updateExam(editExam.id, formattedPayload);
        setExams((prev) => prev.map((ex) => ex.id === editExam.id ? updated : ex));
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
      setExams((prev) => prev.map((e) => e.id === exam.id ? updated : e));
      toast.success(exam.published ? 'Examen dépublié' : 'Examen publié !');
    } catch { 
      toast.error('Erreur de publication'); 
    }
  };

  const handleExportPdf = async (id: number) => {
    try {
      await resultService.exportExamResultsPdf(id);
    } catch {
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title font-display">Mes Examens</h1>
          <p className="page-sub">Créez, modifiez et gérez vos examens en toute simplicité.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary shadow-md hover:shadow-lg transition-shadow">
          <Plus size={18} /> Nouvel examen
        </button>
      </div>

      <ExamList 
        exams={exams}
        loading={loading}
        onOpenCreate={handleOpenCreate}
        onOpenEdit={handleOpenEdit}
        onOpenQuestions={(exam) => setActiveExam(exam)}
        onPublish={handlePublish}
        onDelete={handleDelete}
        onExportPdf={handleExportPdf}
      />

      <ExamFormModal 
        show={showForm}
        exam={editExam}
        onClose={() => setShowForm(false)}
        onSave={handleSaveExam}
        modules={modules}
        groups={groups}
      />

      <QuestionManagerPanel 
        exam={activeExam}
        onClose={() => setActiveExam(null)}
      />
    </div>
  );
}
