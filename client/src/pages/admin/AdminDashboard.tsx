import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle2, Activity, Ban, Trash2, Shield, Search, ChevronDown, AlertCircle } from 'lucide-react';
import { userService } from '../../services/dashboardService';
import { dashboardService } from '../../services/dashboardService';
import toast from 'react-hot-toast';

interface UserItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  blocked: boolean;
}

interface AdminStats {
  totalUsers: number;
  totalExams: number;
  totalSubmissions: number;
  activeStudents: number;
}

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: 'Admin',
  ROLE_TEACHER: 'Enseignant',
  ROLE_STUDENT: 'Étudiant',
};

export default function AdminDashboard() {
  const [stats, setStats]       = useState<AdminStats | null>(null);
  const [users, setUsers]       = useState<UserItem[]>([]);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      dashboardService.getAdminDashboard().catch(() => null),
      userService.getAllUsers(0, 50).catch(() => null),
    ]).then(([dashData, usersData]) => {
      if (dashData) setStats(dashData);
      if (usersData?.content) setUsers(usersData.content);
      else if (Array.isArray(usersData)) setUsers(usersData);
    }).finally(() => setLoading(false));
  }, []);

  const handleBlock = async (user: UserItem) => {
    setActionId(user.id);
    try {
      if (user.blocked) {
        await userService.unblockUser(user.id);
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, blocked: false } : u));
        toast.success(`${user.firstName} débloqué`);
      } else {
        await userService.blockUser(user.id);
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, blocked: true } : u));
        toast.success(`${user.firstName} bloqué`);
      }
    } catch { toast.error('Erreur'); }
    setActionId(null);
  };

  const handleDelete = async (user: UserItem) => {
    if (!confirm(`Supprimer définitivement ${user.firstName} ${user.lastName} ?`)) return;
    setActionId(user.id);
    try {
      await userService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success('Utilisateur supprimé');
    } catch { toast.error('Erreur'); }
    setActionId(null);
  };

  const handleRoleChange = async (user: UserItem, newRole: string) => {
    setActionId(user.id);
    try {
      await userService.changeRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success('Rôle mis à jour');
    } catch { toast.error('Erreur'); }
    setActionId(null);
  };

  const filtered = users.filter((u) => {
    const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const kpis = [
    { icon: Users,        label: 'Utilisateurs',  value: stats?.totalUsers       ?? '—', color: '#053F5C', bg: '#EBF5FB', border: '#C3D9E8' },
    { icon: FileText,     label: 'Examens',        value: stats?.totalExams       ?? '—', color: '#D9930F', bg: '#FEF9EC', border: '#FBD98A' },
    { icon: CheckCircle2, label: 'Soumissions',    value: stats?.totalSubmissions ?? '—', color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
    { icon: Activity,     label: 'Actifs / 30j',  value: stats?.activeStudents   ?? '—', color: '#429EBD', bg: '#EBF5FB', border: '#C3D9E8' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <div>
        <h1 className="page-title font-display">Administration</h1>
        <p className="page-sub">Gestion globale de la plateforme PlatformExpert.</p>
      </div>

      {/* KPIs */}
      <div className="grid-4">
        {kpis.map(({ icon: Icon, label, value, color, bg, border }) => (
          <div className="stat-card" key={label} style={{ borderColor: border }}>
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ color }}>{loading ? '...' : String(value)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* User management */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={18} color="#053F5C" />
            <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 15 }}>Gestion des utilisateurs</span>
            <span className="badge badge-navy">{filtered.length} utilisateurs</span>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Role filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: '7px 32px 7px 12px', borderRadius: 8, border: '1.5px solid #DDE8F0',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#053F5C',
                  background: '#fff', cursor: 'pointer', appearance: 'none',
                }}
              >
                <option value="ALL">Tous les rôles</option>
                <option value="ROLE_STUDENT">Étudiants</option>
                <option value="ROLE_TEACHER">Enseignants</option>
                <option value="ROLE_ADMIN">Admins</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8', pointerEvents: 'none' }} />
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8' }} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '7px 14px 7px 32px', borderRadius: 8, border: '1.5px solid #DDE8F0',
                  fontFamily: 'inherit', fontSize: 13, width: 200, outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 32, height: 32, margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <AlertCircle size={40} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#053F5C', fontWeight: 700 }}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ padding: '10px 24px', background: '#F8FAFC', borderBottom: '1px solid #EBF2F8', display: 'grid', gridTemplateColumns: '1fr 1fr 140px 140px 120px', gap: 12 }}>
              {['Nom', 'Email', 'Rôle', 'Statut', 'Actions'].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B9AB8' }}>{h}</span>
              ))}
            </div>

            {filtered.map((user) => {
              const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
              const isLoading = actionId === user.id;
              return (
                <div key={user.id} className="table-row" style={{
                  padding: '12px 24px', display: 'grid',
                  gridTemplateColumns: '1fr 1fr 140px 140px 120px', gap: 12, alignItems: 'center',
                }}>
                  {/* Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: '#EBF5FB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 12, color: '#053F5C', flexShrink: 0,
                    }}>{initials}</div>
                    <span style={{ fontWeight: 700, color: '#053F5C', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.firstName} {user.lastName}
                    </span>
                  </div>

                  {/* Email */}
                  <span style={{ color: '#6B9AB8', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>

                  {/* Role selector */}
                  <div style={{ position: 'relative' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      disabled={isLoading}
                      style={{
                        width: '100%', padding: '5px 28px 5px 10px', borderRadius: 7,
                        border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 12,
                        fontWeight: 600, color: '#053F5C', background: '#fff', cursor: 'pointer', appearance: 'none',
                      }}
                    >
                      <option value="ROLE_STUDENT">Étudiant</option>
                      <option value="ROLE_TEACHER">Enseignant</option>
                      <option value="ROLE_ADMIN">Admin</option>
                    </select>
                    <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8', pointerEvents: 'none' }} />
                  </div>

                  {/* Status */}
                  <span className={`badge ${user.blocked ? 'badge-red' : 'badge-green'}`}>
                    {user.blocked ? '🔒 Bloqué' : '✅ Actif'}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleBlock(user)}
                      disabled={isLoading}
                      title={user.blocked ? 'Débloquer' : 'Bloquer'}
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: '1.5px solid #DDE8F0',
                        background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: user.blocked ? '#16A34A' : '#D9930F', transition: 'all 0.15s',
                      }}
                    >
                      <Ban size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={isLoading}
                      title="Supprimer"
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: '1.5px solid #FECDD3',
                        background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#E11D48', transition: 'all 0.15s',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
