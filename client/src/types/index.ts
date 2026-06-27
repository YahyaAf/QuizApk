export interface Exam {
  id: number;
  title: string;
  subject: string;
  date: string;
  duration: number; // minutes
  questions: number;
  status: 'upcoming' | 'active' | 'completed' | 'missed';
  score?: number;
  maxScore?: number;
  maxAttempts?: number;
  teacher: string;
}

export interface Question {
  id: number;
  text: string;
  type: 'multiple_choice' | 'boolean' | 'short_answer';
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

export interface ExamResult {
  examId: number;
  examTitle: string;
  subject: string;
  score: number;
  maxScore: number;
  timeTaken: number; // seconds
  date: string;
  feedback?: string;
}
