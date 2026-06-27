import { useState } from 'react';
import { Sparkles, Upload, FileText, Type, Hash, List } from 'lucide-react';
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
  const [aiType, setAiType] = useState('TEXT');
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
    <div className="card p-8 border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-lg shadow-amber-100/50 relative overflow-hidden animate-fade-in rounded-2xl">
      {/* Decorative background element */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-200 rounded-full blur-[60px] pointer-events-none opacity-60" />
      
      <div className="flex items-center gap-4 mb-8 border-b border-amber-200 pb-5 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shadow-inner">
          <Sparkles size={24} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-display font-black text-navy text-2xl">Génération Intelligente (IA)</h3>
          <p className="text-slate-500 text-sm font-semibold mt-1">Créez automatiquement des questions à partir de votre cours</p>
        </div>
      </div>
      
      {/* Segmented Control */}
      <div className="flex bg-amber-100/50 p-1.5 rounded-xl w-full sm:w-max relative z-10 border border-amber-200 mb-8">
        {(['text', 'pdf'] as const).map((m) => (
          <button 
            key={m} 
            onClick={() => setAiMode(m)} 
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
              aiMode === m 
                ? 'bg-amber-500 text-white shadow-md transform scale-[1.02]' 
                : 'text-amber-800 hover:bg-amber-100'
            }`}
          >
            {m === 'text' ? <Type size={18} /> : <FileText size={18} />}
            {m === 'text' ? 'Texte' : 'Fichier PDF'}
          </button>
        ))}
      </div>
      
      <div className="relative z-10 space-y-8">
        {aiMode === 'text' ? (
          <div className="space-y-3">
            <label className="text-sm font-bold text-navy flex items-center gap-2">
              <Type size={18} className="text-amber-600" />
              Contenu source
            </label>
            <textarea 
              className="w-full min-h-[160px] resize-none outline-none transition-all text-base leading-relaxed p-5 rounded-xl border border-amber-200 bg-white hover:border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 shadow-sm text-navy font-medium"
              value={aiContent} 
              onChange={(e) => setAiContent(e.target.value)}
              placeholder="Collez le texte, un résumé, ou les notions clés de votre cours ici..." 
            />
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-sm font-bold text-navy flex items-center gap-2">
              <FileText size={18} className="text-amber-600" />
              Document source
            </label>
            <label className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed border-amber-300 rounded-2xl bg-white/60 cursor-pointer hover:bg-white hover:border-amber-500 hover:shadow-lg hover:shadow-amber-100 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors group-hover:scale-110 transform duration-300 shadow-inner group-hover:shadow-md">
                <Upload size={32} className="text-amber-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-navy text-lg block mb-1">
                  {aiFile ? aiFile.name : 'Importer un fichier PDF'}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  {aiFile ? `${(aiFile.size / 1024 / 1024).toFixed(2)} MB` : 'Cliquez ou glissez-déposez pour choisir un PDF (max 10MB)'}
                </span>
              </div>
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={(e) => setAiFile(e.target.files?.[0] ?? null)} 
              />
            </label>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-navy">
              <Hash size={18} className="text-amber-600" />
              Nombre
            </label>
            <input 
              type="number" 
              className="w-full h-12 px-4 rounded-xl border border-amber-200 bg-white hover:border-amber-300 focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all font-bold text-lg text-center text-navy outline-none shadow-sm"
              min={1} 
              max={20} 
              value={aiCount} 
              onChange={(e) => setAiCount(+e.target.value)} 
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-navy">
              <List size={18} className="text-amber-600" />
              Type de question
            </label>
            <div className="relative">
              <select 
                className="w-full h-12 px-4 rounded-xl border border-amber-200 bg-white hover:border-amber-300 cursor-pointer appearance-none pr-10 focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all font-semibold text-navy outline-none shadow-sm"
                value={aiType} 
                onChange={(e) => setAiType(e.target.value)}
              >
                {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="14" height="10" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-navy">
              <Sparkles size={18} className="text-amber-600" />
              Points unitaire
            </label>
            <input 
              type="number" 
              className="w-full h-12 px-4 rounded-xl border border-amber-200 bg-white hover:border-amber-300 focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all font-bold text-lg text-center text-navy outline-none shadow-sm"
              min={1} 
              value={aiPoints} 
              onChange={(e) => setAiPoints(+e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex gap-4 pt-6 border-t border-amber-200 mt-4">
          <button 
            onClick={onCancel} 
            className="px-6 py-4 rounded-xl border-2 border-amber-200 text-amber-700 font-bold hover:bg-amber-100 hover:border-amber-300 transition-all"
          >
            Fermer l'IA
          </button>
          <button 
            onClick={handleGenerate} 
            disabled={aiLoading || !isFormValid}
            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-base hover:from-amber-600 hover:to-amber-700 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {aiLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Sparkles size={22} /> Générer les {aiCount} questions</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
