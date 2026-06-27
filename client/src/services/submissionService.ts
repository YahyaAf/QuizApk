import api from './api';

export const submissionService = {
  startExam: (examId: number) =>
    api.post(`/api/submissions/start/${examId}`).then((r) => r.data.data),

  saveAnswers: (submissionId: number, answers: Record<string, unknown>[]) =>
    api.put(`/api/submissions/${submissionId}/save`, { answers }).then((r) => r.data.data),

  submitExam: (submissionId: number, answers: Record<string, unknown>[]) =>
    api.put(`/api/submissions/${submissionId}/submit`, { answers }).then((r) => r.data.data),

  logCheatEvent: (submissionId: number, eventType: string, details?: string) =>
    api.post(`/api/submissions/${submissionId}/events`, { eventType, details }).catch(() => null),
};
