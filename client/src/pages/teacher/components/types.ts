export interface ExamItem {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  availableFrom: string;
  availableUntil: string;
  maxAttempts: number;
  published: boolean;
  totalMarks: number;
  questions?: QuestionItem[];
}

export interface QuestionItem {
  id?: number;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'TEXT';
  points: number;
  choices?: { text: string; correct: boolean }[];
}

export const QUESTION_TYPES = [
  { value: 'SINGLE_CHOICE',   label: 'QCM (choix unique)',    icon: '🔘' },
  { value: 'MULTIPLE_CHOICE', label: 'QCM (choix multiples)', icon: '☑️' },
  { value: 'TRUE_FALSE',      label: 'Vrai / Faux',           icon: '✅' },
  { value: 'TEXT',            label: 'Question texte',        icon: '📝' },
] as const;
