import api from './api';

export const resultService = {
  // Student
  getMyResults: () =>
    api.get('/api/results/my-results').then((r) => r.data.data),

  getResultById: (id: number) =>
    api.get(`/api/results/${id}`).then((r) => r.data.data),

  getResultAnswers: (id: number) =>
    api.get(`/api/results/${id}/answers`).then((r) => r.data.data),

  downloadPdf: async (id: number) => {
    const response = await api.get(`/api/results/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resultat-examen-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadCertificate: async (id: number) => {
    const response = await api.get(`/api/results/${id}/certificate`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `certificat-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Teacher/Admin
  getTeacherResults: () =>
    api.get('/api/results/teacher').then((r) => r.data.data),

  getAllResults: (page = 0, size = 10) =>
    api.get('/api/results', { params: { page, size } }).then((r) => r.data.data),

  exportExamResultsPdf: async (examId: number) => {
    const response = await api.get(`/api/results/exam/${examId}/export/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resultats-examen-${examId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
