import { useState, useEffect } from 'react';
import { X, Sparkles, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { questionService, aiService } from '../../../services/examService';
import type { ExamItem, QuestionItem } from './types';
import { QUESTION_TYPES } from './types';
import QuestionForm from './QuestionForm';
import AIGeneratorPanel from './AIGeneratorPanel';

interface QuestionManagerPanelProps {
  exam: ExamItem | null;
  onClose: () => void;
}

const DEFAULT_Q_FORM: QuestionItem = {
  text: '', type: 'SINGLE_CHOICE', points: 5,
  choices: [
    { text: '', correct: true }, 
    { text: '', correct: false }, 
    { text: '', correct: false }, 
    { text: '', correct: false }
  ]
};

export default function QuestionManagerPanel({ exam, onClose }: QuestionManagerPanelProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [qForm, setQForm] = useState<QuestionItem>(DEFAULT_Q_FORM);
  const [editingQIdx, setEditingQIdx] = useState<number | null>(null);
  const [savingQ, setSavingQ] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (exam) {
      setLoading(true);
      questionService.getQuestions(exam.id)
        .then(qs => setQuestions(qs ?? []))
        .catch(() => setQuestions([]))
        .finally(() => setLoading(false));
    }
  }, [exam]);

  if (!exam) return null;

  const handleSaveQuestion = async () => {
    setSavingQ(true);
    try {
      if (editingQIdx !== null && questions[editingQIdx]?.id) {
        const updated = await questionService.updateQuestion(questions[editingQIdx].id!, qForm);
        setQuestions((prev) => prev.map((q, i) => i === editingQIdx ? updated : q));
        toast.success('Question mise à jour !');
      } else {
        const created = await questionService.addQuestion(exam.id, qForm);
        setQuestions((prev) => [...prev, created]);
        toast.success('Question ajoutée !');
      }
      resetQForm();
    } catch { 
      toast.error('Erreur lors de la sauvegarde'); 
    }
    setSavingQ(false);
  };

  const handleDeleteQuestion = async (idx: number) => {
    const q = questions[idx];
    if (q.id) {
      try {
        await questionService.deleteQuestion(q.id);
        setQuestions((prev) => prev.filter((_, i) => i !== idx));
        toast.success('Question supprimée');
      } catch { toast.error('Erreur'); }
    } else {
      setQuestions((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const resetQForm = () => {
    setQForm(DEFAULT_Q_FORM);
    setEditingQIdx(null);
  };

  const handleGenerateText = async (content: string, count: number, type: string, points: number) => {
    setAiLoading(true);
    try {
      const generated = await aiService.generateFromText(exam.id, content, count, type, points);
      if (generated?.length) {
        setQuestions((prev) => [...prev, ...generated]);
        toast.success(`${generated.length} question(s) générée(s) par l'IA !`);
        setShowAI(false);
      }
    } catch {
      toast.error('Erreur de génération IA');
    }
    setAiLoading(false);
  };

  const handleGeneratePdf = async (file: File, count: number, type: string, points: number) => {
    setAiLoading(true);
    try {
      const generated = await aiService.generateFromPdf(exam.id, file, count, type, points);
      if (generated?.length) {
        setQuestions((prev) => [...prev, ...generated]);
        toast.success(`${generated.length} question(s) générée(s) par l'IA !`);
        setShowAI(false);
      }
    } catch {
      toast.error('Erreur de génération IA par PDF');
    }
    setAiLoading(false);
  };

  const handleClose = () => {
    resetQForm();
    setShowAI(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="animate-slide-up w-full max-w-3xl bg-bg h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-white px-8 py-5 border-b border-border-soft flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="font-display font-black text-navy text-xl flex items-center gap-2">
              Questions <span className="text-muted font-normal mx-2">—</span> <span className="text-sky">{exam.title}</span>
            </h2>
            <p className="text-muted text-xs font-bold mt-1 uppercase tracking-wide">
              {questions.length} question(s) au total
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAI(true)} 
              className={`btn btn-accent px-4 py-2 ${showAI ? 'hidden' : 'flex'}`}
            >
              <Sparkles size={16} /> Générer avec IA
            </button>
            <button 
              onClick={handleClose} 
              className="w-10 h-10 rounded-full bg-bg flex items-center justify-center text-muted hover:text-navy hover:bg-border-soft transition-colors border-none cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" id="questions-container">
          
          {showAI && (
            <AIGeneratorPanel 
              onGenerateText={handleGenerateText}
              onGeneratePdf={handleGeneratePdf}
              onCancel={() => setShowAI(false)}
              aiLoading={aiLoading}
            />
          )}

          <QuestionForm 
            qForm={qForm}
            setQForm={setQForm}
            editingQIdx={editingQIdx}
            savingQ={savingQ}
            onSave={handleSaveQuestion}
            onCancel={resetQForm}
          />

          {/* Questions list */}
          {loading ? (
             <div className="flex justify-center p-10">
               <div className="spinner w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
             </div>
          ) : questions.length > 0 ? (
            <div className="card overflow-hidden border border-border-soft shadow-sm">
              <div className="px-6 py-4 bg-white border-b border-border-soft font-extrabold text-navy text-sm uppercase tracking-wider">
                Liste des questions ({questions.length})
              </div>
              <div className="divide-y divide-border-soft">
                {questions.map((q, idx) => {
                  const typeLabel = QUESTION_TYPES.find((t) => t.value === q.type);
                  return (
                    <div key={idx} className="p-5 flex items-start gap-4 bg-white hover:bg-bg/50 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-sky/10 flex items-center justify-center font-black text-navy text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="font-bold text-navy text-sm mb-3 text-wrap">{q.text}</p>
                        <div className="flex gap-2">
                          <span className="badge badge-sky border border-sky/20">{typeLabel?.icon} {typeLabel?.label}</span>
                          <span className="badge badge-amber border border-amber/20">{q.points} pts</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { 
                            setEditingQIdx(idx); 
                            setQForm(q); 
                            document.getElementById('questions-container')?.scrollTo({top: 0, behavior: 'smooth'}); 
                          }} 
                          className="w-8 h-8 rounded-md border-2 border-border-soft bg-white hover:border-sky flex items-center justify-center text-sky transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(idx)} 
                          className="w-8 h-8 rounded-md border-2 border-rose-100 bg-white hover:border-rose-400 flex items-center justify-center text-rose-500 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted text-sm font-semibold bg-white rounded-xl border border-dashed border-border">
              Aucune question pour cet examen.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
