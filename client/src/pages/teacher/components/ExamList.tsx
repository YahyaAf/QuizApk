import { Plus, Edit3, Trash2, Eye, EyeOff, BookOpen, Clock, Users, ChevronRight, FileText } from 'lucide-react';
import { FaCheckCircle, FaPen } from 'react-icons/fa';
import type { ExamItem } from './types';

interface ExamListProps {
  exams: ExamItem[];
  loading: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (exam: ExamItem) => void;
  onOpenQuestions: (exam: ExamItem) => void;
  onPublish: (exam: ExamItem) => void;
  onDelete: (id: number) => void;
  onExportPdf: (id: number) => void;
}

export default function ExamList({
  exams,
  loading,
  onOpenCreate,
  onOpenEdit,
  onOpenQuestions,
  onPublish,
  onDelete,
  onExportPdf
}: ExamListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="card p-16 text-center animate-fade-in">
        <BookOpen size={48} className="mx-auto mb-4 text-[#C3D9E8]" />
        <p className="font-bold text-navy text-lg">Aucun examen créé</p>
        <p className="text-muted text-sm mt-1 mb-6">Commencez par créer votre premier examen.</p>
        <button onClick={onOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Créer un examen
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      {exams.map((exam) => (
        <div key={exam.id} className="card p-5 flex items-center gap-4 justify-between hover:shadow-md transition-all duration-200 group border border-transparent hover:border-sky/20">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-extrabold text-navy text-base">{exam.title}</span>
              <span className={`badge ${exam.published ? 'badge-green' : 'badge-amber'}`}>
                {exam.published ? <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}><FaCheckCircle /> Publié</span> : <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}><FaPen /> Brouillon</span>}
              </span>
            </div>
            <div className="flex gap-5 text-muted text-xs font-semibold">
              <span className="flex items-center gap-1.5"><Clock size={14} /> {exam.durationMinutes} min</span>
              <span className="flex items-center gap-1.5"><BookOpen size={14} /> {exam.totalMarks} pts</span>
              <span className="flex items-center gap-1.5"><Users size={14} /> {exam.maxAttempts} tentative(s)</span>
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onOpenQuestions(exam)} className="btn btn-ghost px-3 py-2 text-xs h-9 font-bold bg-sky/5 hover:bg-sky/10">
              Questions <ChevronRight size={14} className="ml-1" />
            </button>
            <button onClick={() => onExportPdf(exam.id)} className="btn btn-ghost p-2 h-9" title="Exporter résultats PDF">
              <FileText size={16} />
            </button>
            <button onClick={() => onPublish(exam)} className="btn btn-ghost p-2 h-9" title={exam.published ? 'Dépublier' : 'Publier'}>
              {exam.published ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button onClick={() => onOpenEdit(exam)} className="btn btn-ghost p-2 h-9" title="Modifier">
              <Edit3 size={16} />
            </button>
            <button onClick={() => onDelete(exam.id)} className="btn btn-danger p-2 h-9" title="Supprimer">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
