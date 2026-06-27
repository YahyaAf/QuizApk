import api from './api';

export interface PendingGradingDto {
  submissionId: number;
  studentName: string;
  studentEmail: string;
  examTitle: string;
  submittedAt: string;
  pendingCount: number;
  totalScore?: number;
  maxScore?: number;
}

export interface TextAnswerDto {
  answerId: number;
  questionText: string;
  studentAnswer: string;
  pointsAwarded?: number;
  maxPoints: number;
  teacherFeedback?: string;
  graded: boolean;
}

export interface ManualGradeRequest {
  answerId: number;
  pointsAwarded: number;
  teacherFeedback?: string;
}

export const manualGradingService = {
  getPendingGrading: () =>
    api.get('/api/submissions/pending-grading').then((r) => r.data.data as PendingGradingDto[]),

  getTextAnswers: (submissionId: number) =>
    api.get(`/api/submissions/${submissionId}/text-answers`).then((r) => r.data.data as TextAnswerDto[]),

  gradeTextAnswer: (submissionId: number, request: ManualGradeRequest) =>
    api.put(`/api/submissions/${submissionId}/grade-text-answer`, request).then((r) => r.data.data as PendingGradingDto),
};
