import { useState, useEffect, FormEvent } from 'react';
import { X, Save } from 'lucide-react';
import type { ExamItem } from './types';

interface ExamFormModalProps {
  show: boolean;
  exam: ExamItem | null;
  onClose: () => void;
  onSave: (payload: any, isEdit: boolean) => Promise<void>;
  modules: {id: number, name: string}[];
  groups: {id: number, name: string}[];
}

export default function ExamFormModal({ show, exam, onClose, onSave, modules, groups }: ExamFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [moduleId, setModuleId] = useState(0);
  const [groupId, setGroupId] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      if (exam) {
        setTitle(exam.title);
        setDescription(exam.description || '');
        setDurationMinutes(exam.durationMinutes);
        setAvailableFrom(exam.availableFrom?.slice(0, 16) ?? '');
        setAvailableUntil(exam.availableUntil?.slice(0, 16) ?? '');
        setScheduledStartTime(exam.scheduledStartTime?.slice(0, 16) ?? '');
        setMaxAttempts(exam.maxAttempts);
        setModuleId(exam.moduleId || (modules[0]?.id ?? 0));
        setGroupId(exam.groupId || (groups[0]?.id ?? 0));
      } else {
        setTitle('');
        setDescription('');
        setDurationMinutes(60);
        setAvailableFrom('');
        setAvailableUntil('');
        setScheduledStartTime('');
        setMaxAttempts(1);
        setModuleId(modules[0]?.id ?? 0);
        setGroupId(groups[0]?.id ?? 0);
      }
    }
  }, [show, exam]);

  if (!show) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!moduleId || !groupId) return;
    setSaving(true);
    try {
      await onSave({
        title,
        description,
        durationMinutes,
        availableFrom,
        availableUntil,
        maxAttempts,
        moduleId,
        groupId,
        scheduledStartTime: scheduledStartTime || availableFrom, // fallback if empty
      }, !!exam);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="card p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-black text-navy text-2xl">
            {exam ? 'Modifier l\'examen' : 'Nouvel examen'}
          </h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-navy transition-colors bg-transparent border-none cursor-pointer">
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-navy mb-1.5">Titre de l'examen *</label>
            <input 
              className="input-field h-11" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Ex: Algorithmique avancée" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-1.5">Description</label>
            <textarea 
              className="input-field min-h-[80px]" 
              rows={3} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Description de l'examen..." 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-navy mb-1.5">Durée (minutes) *</label>
              <input 
                type="number" 
                className="input-field h-11" 
                min={5} 
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(+e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy mb-1.5">Tentatives max *</label>
              <input 
                type="number" 
                className="input-field h-11" 
                min={1} 
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(+e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-navy mb-1.5">Disponible à partir du *</label>
              <input 
                type="datetime-local" 
                className="input-field h-11" 
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy mb-1.5">Disponible jusqu'au *</label>
              <input 
                type="datetime-local" 
                className="input-field h-11" 
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-navy mb-1.5">Module *</label>
              <select 
                className="input-field h-11" 
                value={moduleId}
                onChange={(e) => setModuleId(+e.target.value)} 
                required
              >
                <option value={0}>Sélectionner un module</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-navy mb-1.5">Groupe *</label>
              <select 
                className="input-field h-11" 
                value={groupId}
                onChange={(e) => setGroupId(+e.target.value)} 
                required
              >
                <option value={0}>Sélectionner un groupe</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-1.5">Date de l'examen prévue *</label>
            <input 
              type="datetime-local" 
              className="input-field h-11 w-full" 
              value={scheduledStartTime}
              onChange={(e) => setScheduledStartTime(e.target.value)} 
              required 
            />
          </div>
          <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-border-soft">
            <button type="button" onClick={onClose} className="btn btn-ghost px-5">Annuler</button>
            <button type="submit" disabled={saving} className="btn btn-primary px-6">
              {saving ? <div className="spinner w-4 h-4 border-2 border-white/20 border-t-white" /> : <><Save size={16} /> {exam ? 'Enregistrer' : 'Créer l\'examen'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
