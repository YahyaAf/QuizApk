import api from './api';

// ─── Users ──────────────────────────────────────────────────────────────────
export const adminUserService = {
  createUser: (data: {
    firstName: string; lastName: string; email: string;
    password: string; role: string; groupId?: number;
  }) => api.post('/api/admin/users', data).then((r) => r.data.data),

  updateUser: (id: number, data: {
    firstName?: string; lastName?: string; email?: string; groupId?: number;
  }) => api.put(`/api/admin/users/${id}`, data).then((r) => r.data.data),
};

// ─── Groups ──────────────────────────────────────────────────────────────────
export const adminGroupService = {
  getAll: () => api.get('/api/admin/groups').then((r) => r.data.data),

  create: (name: string, description?: string) =>
    api.post('/api/admin/groups', null, { params: { name, description } }).then((r) => r.data.data),

  update: (id: number, name: string, description?: string) =>
    api.put(`/api/admin/groups/${id}`, null, { params: { name, description } }).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete(`/api/admin/groups/${id}`).then((r) => r.data),
};

// ─── Modules ─────────────────────────────────────────────────────────────────
export const adminModuleService = {
  getAll: () => api.get('/api/admin/modules').then((r) => r.data.data),

  create: (name: string, description?: string) =>
    api.post('/api/admin/modules', null, { params: { name, description } }).then((r) => r.data.data),

  update: (id: number, name: string, description?: string) =>
    api.put(`/api/admin/modules/${id}`, null, { params: { name, description } }).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete(`/api/admin/modules/${id}`).then((r) => r.data),
};

// ─── Assignments ─────────────────────────────────────────────────────────────
export const adminAssignmentService = {
  getAll: () => api.get('/api/admin/assignments').then((r) => r.data.data),

  create: (teacherId: number, moduleId: number, groupId: number) =>
    api.post('/api/admin/assignments', null, { params: { teacherId, moduleId, groupId } }).then((r) => r.data.data),

  update: (id: number, teacherId: number, moduleId: number, groupId: number) =>
    api.put(`/api/admin/assignments/${id}`, null, { params: { teacherId, moduleId, groupId } }).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete(`/api/admin/assignments/${id}`).then((r) => r.data),
};


// ─── Audit Logs ──────────────────────────────────────────────────────────────
export const adminAuditService = {
  getLogs: () => api.get('/api/admin/audit-logs').then((r) => r.data.data),
};
