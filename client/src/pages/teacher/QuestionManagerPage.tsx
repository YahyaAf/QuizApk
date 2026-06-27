import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { questionService, aiService, examService } from '../../services/examService';
import type { ExamItem, QuestionItem } from './components/types';
import { QUESTION_TYPES } from './components/types';
import QuestionForm from './components/QuestionForm';
import AIGeneratorPanel from './components/AIGeneratorPanel';

const DEFAULT_Q_FORM: QuestionItem = {
  statement: '', type: 'SINGLE_CHOICE', points: 5,
  choices: [
    { label: '', isCorrect: true }, 
    { label: '', isCorrect: false }, 
    { label: '', isCorrect: false }, 
    { label: '', isCorrect: false }
  ]
};

export default function QuestionManagerPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamItem | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAI, setShowAI] = useState(false);
  const [qForm, setQForm] = useState<QuestionItem>(DEFAULT_Q_FORM);
  const [editingQIdx, setEditingQIdx] = useState<number | null>(null);
  const [savingQ, setSavingQ] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (examId) {
      setLoading(true);
      Promise.all([
        examService.getExamById(Number(examId)),
        questionService.getQuestions(Number(examId))
      ])
        .then(([examData, qsData]) => {
          setExam(examData);
          setQuestions(qsData ?? []);
        })
        .catch(() => {
          toast.error('Erreur lors du chargement des données');
          navigate('/teacher/exams');
        })
        .finally(() => setLoading(false));
    }
  }, [examId, navigate]);

  const handleSaveQuestion = async () => {
    if (!exam) return;
    setSavingQ(true);
    try {
      if (editingQIdx !== null && questions[editingQIdx]?.id) {
        const updated = await questionService.updateQuestion(questions[editingQIdx].id!, qForm);
        setQuestions((prev) => prev.map((q, i) => i === editingQIdx ? updated : q));
        toast.success('Question mise à jour avec succès !');
      } else {
        const created = await questionService.addQuestion(exam.id, qForm);
        setQuestions((prev) => [...prev, created]);
        toast.success('Question ajoutée à l\'examen !');
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
      } catch { toast.error('Erreur lors de la suppression'); }
    } else {
      setQuestions((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const resetQForm = () => {
    setQForm(DEFAULT_Q_FORM);
    setEditingQIdx(null);
  };

  const handleGenerateText = async (content: string, count: number, type: string, points: number) => {
    if (!exam) return;
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
    if (!exam) return;
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="spinner w-12 h-12 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="animate-fade-in flex flex-col gap-8 w-full mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <button 
            onClick={() => navigate('/teacher/exams')} 
            className="flex items-center gap-2 text-slate-500 hover:text-navy font-bold text-sm mb-5 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
              <ArrowLeft size={16} className="text-slate-500 group-hover:text-sky-600" />
            </div>
            Retour à la liste des examens
          </button>
          <h1 className="page-title font-display flex flex-wrap items-center gap-x-4 gap-y-2 text-navy text-3xl">
            Gestion des questions 
            <span className="text-slate-300 font-normal hidden sm:inline">|</span> 
            <span className="text-sky-600">{exam.title}</span>
          </h1>
          <p className="text-slate-500 mt-3 font-medium text-base">
            Gérez le contenu de votre examen. Actuellement <span className="font-bold text-navy">{questions.length} question{questions.length > 1 ? 's' : ''}</span> configurée{questions.length > 1 ? 's' : ''}.
          </p>
        </div>
        <button 
          onClick={() => setShowAI(!showAI)} 
          className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${showAI ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600'}`}
        >
          <Sparkles size={20} className={showAI ? "text-slate-400" : "text-amber-100"} /> 
          {showAI ? 'Masquer le générateur IA' : 'Générer avec l\'IA'}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 items-start" id="questions-container">
        
        {/* Left Column (Forms) */}
        <div className="w-full xl:w-5/12 flex flex-col gap-6 sticky top-24">
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
        </div>

        {/* Right Column (List) */}
        <div className="w-full xl:w-7/12 flex flex-col gap-4">
          {questions.length > 0 ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-extrabold text-navy text-sm uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-200" />
                  Liste des questions ({questions.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {questions.map((q, idx) => {
                  const typeLabel = QUESTION_TYPES.find((t) => t.value === q.type);
                  const isBeingEdited = editingQIdx === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`p-6 flex flex-col sm:flex-row sm:items-start gap-5 bg-white rounded-2xl transition-all duration-300 group ${isBeingEdited ? 'border-2 border-sky-400 shadow-lg shadow-sky-100 scale-[1.01]' : 'border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 transition-all duration-300 ${isBeingEdited ? 'bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md' : 'bg-slate-100 text-navy group-hover:bg-sky-100 group-hover:text-sky-700'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="font-bold text-navy text-lg mb-4 leading-relaxed text-wrap">{q.statement}</p>
                        <div className="flex flex-wrap gap-2.5 items-center">
                          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                            {typeLabel?.icon} {typeLabel?.label}
                          </span>
                          <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                            {q.points} points
                          </span>
                          {q.choices && q.choices.length > 0 && (
                            <span className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                              {q.choices.length} options
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 sm:opacity-0 sm:-translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mt-4 sm:mt-0">
                        <button 
                          onClick={() => { 
                            setEditingQIdx(idx); 
                            setQForm(q); 
                            window.scrollTo({top: 0, behavior: 'smooth'}); 
                          }} 
                          className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${isBeingEdited ? 'border-sky-500 bg-sky-500 text-white shadow-md' : 'border-slate-200 bg-white hover:border-sky-400 text-sky-600 hover:bg-sky-50 hover:shadow-sm'}`}
                          title="Modifier cette question"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(idx)} 
                          className="w-11 h-11 rounded-xl border-2 border-slate-200 bg-white hover:border-rose-400 hover:bg-rose-50 flex items-center justify-center text-rose-500 transition-all cursor-pointer hover:shadow-sm"
                          title="Supprimer cette question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                <Sparkles size={32} className="text-sky-400" />
              </div>
              <h3 className="font-display font-black text-navy text-xl mb-2">Aucune question pour le moment</h3>
              <p className="text-base font-medium max-w-sm">
                Utilisez le formulaire à gauche pour ajouter votre première question, ou laissez l'IA le faire pour vous.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
