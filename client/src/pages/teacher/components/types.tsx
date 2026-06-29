export interface ExamItem {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  availableFrom: string;
  availableUntil: string;
  scheduledStartTime?: string;
  maxAttempts: number;
  published: boolean;
  totalMarks: number;
  moduleId?: number;
  groupId?: number;
  questions?: QuestionItem[];
}

import { FaDotCircle, FaCheckSquare, FaCheckCircle, FaFileAlt } from 'react-icons/fa';

export interface QuestionItem {
  [key: string]: any;
  id?: number;
  statement: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'TEXT';
  points: number;
  choices?: { label: string; isCorrect: boolean }[];
}

export const QUESTION_TYPES = [
  { value: 'SINGLE_CHOICE',   label: 'QCM (choix unique)',    icon: <FaDotCircle /> },
  { value: 'MULTIPLE_CHOICE', label: 'QCM (choix multiples)', icon: <FaCheckSquare /> },
  { value: 'TRUE_FALSE',      label: 'Vrai / Faux',           icon: <FaCheckCircle /> },
  { value: 'TEXT',            label: 'Question texte',        icon: <FaFileAlt /> },
] as const;
