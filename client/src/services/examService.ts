import api from './api';

export const examService = {
  // Student
  getAvailableExams: (page = 0, size = 20) =>
    api.get('/api/exams/available', { params: { page, size } }).then((r) => r.data.data),

  getExamById: (id: number) =>
    api.get(`/api/exams/${id}`).then((r) => r.data.data),

  // Teacher
  getTeacherAssignments: () =>
    api.get('/api/teacher/assignments').then((r) => r.data.data),

  getMyExams: (page = 0, size = 20) =>
    api.get('/api/exams/my-exams', { params: { page, size } }).then((r) => r.data.data),

  createExam: (data: { title: string; description?: string; durationMinutes: number; availableFrom: string; availableUntil: string; maxAttempts: number; moduleId: number; groupId: number; scheduledStartTime: string; }) =>
    api.post('/api/exams', data).then((r) => r.data.data),

  updateExam: (id: number, data: { title: string; description?: string; durationMinutes: number; availableFrom: string; availableUntil: string; maxAttempts: number; moduleId: number; groupId: number; scheduledStartTime: string; }) =>
    api.put(`/api/exams/${id}`, data).then((r) => r.data.data),

  deleteExam: (id: number) =>
    api.delete(`/api/exams/${id}`).then((r) => r.data),

  publishExam: (id: number, publish: boolean) =>
    api.put(`/api/exams/${id}/publish`, null, { params: { publish } }).then((r) => r.data.data),

  // Admin
  getAllExams: (page = 0, size = 20) =>
    api.get('/api/exams/all', { params: { page, size } }).then((r) => r.data.data),
};

export const questionService = {
  getQuestions: (examId: number) =>
    api.get(`/api/questions/exam/${examId}`).then((r) => r.data.data),

  addQuestion: (examId: number, data: Record<string, unknown>) =>
    api.post(`/api/questions/exam/${examId}`, data).then((r) => r.data.data),

  updateQuestion: (questionId: number, data: Record<string, unknown>) =>
    api.put(`/api/questions/${questionId}`, data).then((r) => r.data.data),

  deleteQuestion: (questionId: number) =>
    api.delete(`/api/questions/${questionId}`).then((r) => r.data),
};

export const aiService = {
  generateFromText: (examId: number, content: string, questionCount: number, questionType: string, pointsPerQuestion: number) =>
    api.post('/api/ai/generate-quiz', { examId, content, questionCount, questionType, pointsPerQuestion })
      .then((r) => r.data.data),

  generateFromPdf: (examId: number, file: File, questionCount: number, questionType: string, pointsPerQuestion: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('examId', String(examId));
    formData.append('questionCount', String(questionCount));
    formData.append('questionType', questionType);
    formData.append('pointsPerQuestion', String(pointsPerQuestion));
    return api.post('/api/ai/generate-quiz-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data);
  },
};
