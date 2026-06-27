import api from './api';

export const dashboardService = {
  getStudentDashboard: () =>
    api.get('/api/dashboard/student').then((r) => r.data.data),

  getTeacherDashboard: () =>
    api.get('/api/dashboard/teacher').then((r) => r.data.data),

  getAdminDashboard: () =>
    api.get('/api/dashboard/admin').then((r) => r.data.data),

  getLeaderboard: (limit = 10) =>
    api.get('/api/dashboard/leaderboard', { params: { limit } }).then((r) => r.data.data),
};

export const userService = {
  getProfile: () =>
    api.get('/api/users/profile').then((r) => r.data.data),

  updateProfile: (data: { firstName: string; lastName: string }) =>
    api.put('/api/users/profile', data).then((r) => r.data.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/api/users/change-password', data).then((r) => r.data),

  // Admin
  getAllUsers: (page = 0, size = 20) =>
    api.get('/api/users', { params: { page, size } }).then((r) => r.data.data),

  blockUser: (id: number) =>
    api.put(`/api/users/${id}/block`).then((r) => r.data.data),

  unblockUser: (id: number) =>
    api.put(`/api/users/${id}/unblock`).then((r) => r.data.data),

  deleteUser: (id: number) =>
    api.delete(`/api/users/${id}`).then((r) => r.data),

  changeRole: (id: number, role: string) =>
    api.put(`/api/users/${id}/role`, null, { params: { role } }).then((r) => r.data.data),
};

export const analyticsService = {
  getQuestionStats: (examId: number) =>
    api.get(`/api/analytics/exam/${examId}/question-stats`).then((r) => r.data.data),
};
