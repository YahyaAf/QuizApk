import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CheckCircle2, BarChart3, LogOut,
  User, Trophy, BookOpen, Users, Shield, PenSquare, BarChart2,
  Building2, Calendar, ClipboardList, GraduationCap, BookMarked,
  Activity, ScrollText, Settings
} from 'lucide-react';
import { useAuthStore, isAdmin, isTeacher, getRoleLabel } from '../../store/authStore';

interface NavItem {
  name: string;
  path: string;
  icon: typeof LayoutDashboard;
  roles?: ('ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN')[];
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  // ── Student ─────────────────────────────────────────────
  { name: 'Tableau de bord',   path: '/dashboard',              icon: LayoutDashboard, roles: ['ROLE_STUDENT'], section: 'Étudiant' },
  { name: 'Mes Examens',       path: '/exams',                  icon: FileText,        roles: ['ROLE_STUDENT'] },
  { name: 'Mes Résultats',     path: '/results',                icon: CheckCircle2,    roles: ['ROLE_STUDENT'] },
  { name: 'Statistiques',      path: '/stats',                  icon: BarChart3,       roles: ['ROLE_STUDENT'] },
  { name: 'Classement',        path: '/leaderboard',            icon: Trophy,          roles: ['ROLE_STUDENT'] },

  // ── Teacher ─────────────────────────────────────────────
  { name: 'Tableau de bord',   path: '/teacher/dashboard',      icon: LayoutDashboard, roles: ['ROLE_TEACHER'], section: 'Enseignant' },
  { name: 'Mes Examens',       path: '/teacher/exams',          icon: BookOpen,        roles: ['ROLE_TEACHER'] },
  { name: 'Correction manuelle', path: '/teacher/grading',      icon: PenSquare,       roles: ['ROLE_TEACHER'] },
  { name: 'Résultats',         path: '/teacher/results',        icon: CheckCircle2,    roles: ['ROLE_TEACHER'] },

  // ── Admin ────────────────────────────────────────────────
  { name: 'Tableau de bord',   path: '/admin',                  icon: LayoutDashboard, roles: ['ROLE_ADMIN'], section: 'Administration' },
  { name: 'Utilisateurs',      path: '/admin/users',            icon: Users,           roles: ['ROLE_ADMIN'] },
  { name: 'Paramétrage',       path: '/admin/settings',         icon: Settings,        roles: ['ROLE_ADMIN'] },

  { name: 'Tous les examens',  path: '/admin/exams',            icon: FileText,        roles: ['ROLE_ADMIN'] },
  { name: 'Tous les résultats', path: '/admin/results',         icon: BarChart2,       roles: ['ROLE_ADMIN'] },
  // { name: 'Logs d\'audit',     path: '/admin/audit-logs',       icon: ScrollText,      roles: ['ROLE_ADMIN'] },

  // ── Commun ──────────────────────────────────────────────
  { name: 'Mon profil',        path: '/profile',                icon: User },
];

export default function Sidebar() {
  const logout      = useAuthStore((s) => s.logout);
  const user        = useAuthStore((s) => s.user);
  const navigate    = useNavigate();

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role as 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN');
  });

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : (user as { name?: string })?.name ?? 'Utilisateur';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo h-100 ">
          <img src="/logo.svg" alt="Logo" style={{ width: 100, height: 100, objectFit: 'contain' }} />
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {visibleNav.map(({ name, path, icon: Icon, section }, idx) => (
          <div key={`${path}-${name}`}>
            {section && (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: idx > 0 ? 16 : 0, marginBottom: 6, paddingLeft: 4 }}>
                {section}
              </div>
            )}
            <NavLink
              to={path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <div className="nav-icon">
                <Icon size={16} />
              </div>
              {name}
            </NavLink>
          </div>
        ))}
      </nav>


      {/* Footer */}
      <div className="sidebar-footer">
        {/* Role badge */}
        {(isAdmin(user) || isTeacher(user)) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8, marginBottom: 6,
            background: isAdmin(user) ? 'rgba(247,173,25,0.15)' : 'rgba(66,158,189,0.15)',
          }}>
            <Shield size={12} color={isAdmin(user) ? '#F7AD19' : '#9FE7F5'} />
            <span style={{ fontSize: 11, fontWeight: 700, color: isAdmin(user) ? '#F7AD19' : '#9FE7F5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {getRoleLabel(user?.role)}
            </span>
          </div>
        )}

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', marginBottom: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F7AD19', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#053F5C', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{user?.email}</div>
          </div>
        </div>

        {/* Logout */}
        <button onClick={() => { logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', width: '100%', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, transition: 'all 0.15s', fontFamily: 'inherit' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}>
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
