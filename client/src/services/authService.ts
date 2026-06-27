import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ROLE_STUDENT' | 'ROLE_TEACHER';
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export const authService = {
  login: (data: LoginPayload) =>
    api.post('/api/auth/login', data).then((r) => r.data.data),

  register: (data: RegisterPayload) =>
    api.post('/api/auth/register', data).then((r) => r.data.data),

  forgotPassword: (data: ForgotPasswordPayload) =>
    api.post('/api/auth/forgot-password', data).then((r) => r.data),

  resetPassword: (data: ResetPasswordPayload) =>
    api.post('/api/auth/reset-password', data).then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    api.post('/api/auth/refresh-token', { refreshToken }).then((r) => r.data.data),
};
