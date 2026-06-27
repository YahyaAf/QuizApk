import { useState } from 'react';
import { Sparkles, Upload } from 'lucide-react';
import { QUESTION_TYPES } from './types';

interface AIGeneratorPanelProps {
  onGenerateText: (content: string, count: number, type: string, points: number) => Promise<void>;
  onGeneratePdf: (file: File, count: number, type: string, points: number) => Promise<void>;
  onCancel: () => void;
  aiLoading: boolean;
}

export default function AIGeneratorPanel({
  onGenerateText,
  onGeneratePdf,
  onCancel,
  aiLoading
}: AIGeneratorPanelProps) {
  const [aiMode, setAiMode] = useState<'text' | 'pdf'>('text');
  const [aiContent, setAiContent] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiCount, setAiCount] = useState(5);
  const [aiType, setAiType] = useState('SINGLE_CHOICE');
  const [aiPoints, setAiPoints] = useState(5);

  const handleGenerate = () => {
    if (aiMode === 'text' && aiContent) {
      onGenerateText(aiContent, aiCount, aiType, aiPoints);
    } else if (aiMode === 'pdf' && aiFile) {
      onGeneratePdf(aiFile, aiCount, aiType, aiPoints);
    }
  };

  const isFormValid = (aiMode === 'text' && aiContent.trim() !== '') || (aiMode === 'pdf' && aiFile !== null);

  return (
    <div className="card p-6 border-2 border-amber/40 bg-amber/5 relative overflow-hidden animate-fade-in">
      {/* Decorative background element */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-5 relative z-10">
        <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center">
          <Sparkles size={16} className="text-amber-dark" />
        </div>
        <span className="font-extrabold text-navy text-lg">Génération IA</span>
      </div>
      
      <div className="flex gap-2 mb-5 bg-white/50 p-1 rounded-xl w-max relative z-10 border border-amber/20">
        {(['text', 'pdf'] as const).map((m) => (
          <button 
            key={m} 
            onClick={() => setAiMode(m)} 
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              aiMode === m 
                ? 'bg-navy text-white shadow-md' 
                : 'text-muted hover:text-navy hover:bg-white/80'
            }`}
          >
            {m === 'text' ? '📝 Texte' : '📄 PDF'}
          </button>
        ))}
      </div>
      
      <div className="relative z-10">
        {aiMode === 'text' ? (
          <textarea 
            className="input-field min-h-[120px] bg-white mb-4" 
            value={aiContent} 
            onChange={(e) => setAiContent(e.target.value)}
            placeholder="Collez votre contenu de cours ici..." 
          />
        ) : (
          <div className="mb-4">
            <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-sky/30 rounded-xl bg-white/50 cursor-pointer hover:bg-white hover:border-sky/50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-sky/10 flex items-center justify-center group-hover:bg-sky/20 transition-colors">
                <Upload size={20} className="text-sky-dark" />
              </div>
              <span className="font-semibold text-navy">
                {aiFile ? aiFile.name : 'Cliquez pour choisir un fichier PDF'}
              </span>
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={(e) => setAiFile(e.target.files?.[0] ?? null)} 
              />
            </label>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wide">Nb de questions</label>
            <input 
              type="number" 
              className="input-field h-11 bg-white" 
              min={1} 
              max={20} 
              value={aiCount} 
              onChange={(e) => setAiCount(+e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wide">Type</label>
            <select 
              className="input-field h-11 bg-white cursor-pointer" 
              value={aiType} 
              onChange={(e) => setAiType(e.target.value)}
            >
              {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wide">Points/question</label>
            <input 
              type="number" 
              className="input-field h-11 bg-white" 
              min={1} 
              value={aiPoints} 
              onChange={(e) => setAiPoints(+e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn bg-white text-navy hover:bg-bg border border-border-soft flex-1 py-3">
            Annuler
          </button>
          <button 
            onClick={handleGenerate} 
            disabled={aiLoading || !isFormValid}
            className="btn btn-accent flex-[2] py-3 shadow-lg shadow-amber/20 hover:shadow-xl hover:shadow-amber/30 transition-all"
          >
            {aiLoading ? (
              <div className="spinner w-5 h-5 border-2 border-white/20 border-t-white" />
            ) : (
              <><Sparkles size={18} /> Générer {aiCount} question(s)</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
