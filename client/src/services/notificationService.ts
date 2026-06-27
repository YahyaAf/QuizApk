import api from './api';

export const notificationService = {
  getAll: () =>
    api.get('/api/notifications').then((r) => r.data.data as Notification[]),

  markAsRead: (id: number) =>
    api.patch(`/api/notifications/${id}/read`).then((r) => r.data),
};

export interface NotificationItem {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
}
