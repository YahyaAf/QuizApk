import api from './api';
import type { User } from '../store/authStore';

export const badgeService = {
  getStudents: () =>
    api.get('/api/badges/students').then((r) => r.data.data as User[]),

  assignBadge: (data: { studentId: number; name: string; iconUrl: string; color: string; description?: string }) =>
    api.post('/api/badges/assign', null, { params: data }).then((r) => r.data),

  triggerAutomaticRules: () =>
    api.post('/api/badges/trigger-rules').then((r) => r.data),
};
