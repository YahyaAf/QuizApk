import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CheckCircle2, BarChart3, LogOut,
  User, Trophy, BookOpen, Users, Shield, PenSquare, BarChart2,
  Settings
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
  { name: 'Examens',           path: '/admin/exams',            icon: FileText,        roles: ['ROLE_ADMIN'] },
  { name: 'Résultats',         path: '/admin/results',          icon: BarChart2,       roles: ['ROLE_ADMIN'] },
  { name: 'Paramètres',        path: '/admin/settings',         icon: Settings,        roles: ['ROLE_ADMIN'] },

  // ── Commun ──────────────────────────────────────────────
  { name: 'Mon profil',        path: '/profile',                icon: User },
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role as 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN');
  });

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : (user as { name?: string })?.name ?? 'Utilisateur';

  const userRole = user?.role as 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN' | undefined;

  const roleColors = {
    ROLE_ADMIN: { bg: 'rgba(247,173,25,0.15)', text: '#F7AD19', icon: '#F7AD19' },
    ROLE_TEACHER: { bg: 'rgba(66,158,189,0.15)', text: '#9FE7F5', icon: '#9FE7F5' },
    ROLE_STUDENT: { bg: 'rgba(159,231,245,0.08)', text: 'rgba(255,255,255,0.6)', icon: 'rgba(255,255,255,0.4)' },
  };

  const roleColor = userRole ? roleColors[userRole] : roleColors.ROLE_STUDENT;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '280px',
      background: '#053F5C',
      color: '#fff',
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
      flexShrink: 0
    }}>
      {/* ── Logo ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px 14px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0
      }}>
        <img 
          src="/logo.svg" 
          alt="PlatformExpert" 
          style={{
            width: 200,
            height: 'auto',
            objectFit: 'contain'
          }} 
        />
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px 12px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent'
      }}>
        {visibleNav.map(({ name, path, icon: Icon, section }, idx) => (
          <div key={`${path}-${name}`}>
            {section && (
              <div style={{
                color: 'rgba(255,255,255,0.25)',
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginTop: idx > 0 ? 20 : 0,
                marginBottom: 8,
                paddingLeft: 12,
                paddingRight: 12
              }}>
                {section}
              </div>
            )}
            <NavLink
              to={path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(247,173,25,0.15)' : 'transparent',
                transition: 'all 0.15s ease',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 500,
                marginBottom: 2,
                position: 'relative',
                cursor: 'pointer'
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 24,
                      borderRadius: '0 4px 4px 0',
                      background: '#F7AD19'
                    }} />
                  )}
                  <div style={{
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: isActive ? '#F7AD19' : 'rgba(255,255,255,0.4)',
                    transition: 'color 0.15s ease'
                  }}>
                    <Icon size={18} />
                  </div>
                  <span>{name}</span>
                </>
              )}
            </NavLink>
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0
      }}>
        {/* Role badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 8,
          marginBottom: 10,
          background: roleColor.bg,
        }}>
          <Shield size={12} color={roleColor.icon} />
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: roleColor.text,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            {getRoleLabel(userRole)}
          </span>
        </div>

        {/* User info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 14px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.05)',
          marginBottom: 10,
          transition: 'background 0.15s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        }}
        onClick={() => navigate('/profile')}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: '#F7AD19',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#053F5C',
            fontWeight: 900,
            fontSize: 14,
            flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              lineHeight: '1.2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {displayName}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: 11,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            width: '100%',
            borderRadius: 10,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.15s ease',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FCA5A5';
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}