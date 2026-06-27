import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN';
  blocked?: boolean;
  badges?: { id: number; name: string; description: string; iconUrl?: string }[];
  // Legacy compat
  name?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string, refreshToken?: string) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken = '') =>
        set({
          user: { ...user, name: `${user.firstName} ${user.lastName}` },
          token,
          refreshToken,
          isAuthenticated: true,
        }),
      updateUser: (partial) => {
        const current = get().user;
        if (current) {
          const updated = { ...current, ...partial };
          set({ user: { ...updated, name: `${updated.firstName} ${updated.lastName}` } });
        }
      },
      logout: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'exam-auth' }
  )
);

// Role helpers
export const isStudent  = (user: AuthUser | null) => user?.role === 'ROLE_STUDENT';
export const isTeacher  = (user: AuthUser | null) => user?.role === 'ROLE_TEACHER';
export const isAdmin    = (user: AuthUser | null) => user?.role === 'ROLE_ADMIN';
export const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'ROLE_ADMIN':   return 'Administrateur';
    case 'ROLE_TEACHER': return 'Enseignant';
    case 'ROLE_STUDENT': return 'Étudiant';
    default: return role ?? 'Utilisateur';
  }
};
