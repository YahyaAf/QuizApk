import { useState, useEffect, useRef } from 'react';
import { Users, Plus, Search, Ban, Trash2, Shield, ChevronDown, Edit2, AlertCircle, X, Save } from 'lucide-react';
import { userService } from '../../services/dashboardService';
import { adminUserService, adminGroupService } from '../../services/adminService';
import toast from 'react-hot-toast';

interface UserItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  blocked: boolean;
  groupId?: number;
}

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  groupId?: number;
}

const ROLES = [
  { value: 'ROLE_STUDENT', label: 'Étudiant' },
  { value: 'ROLE_TEACHER', label: 'Enseignant' },
  { value: 'ROLE_ADMIN', label: 'Administrateur' },
];

const EMPTY_FORM: UserForm = { firstName: '', lastName: '', email: '', password: '', role: 'ROLE_STUDENT' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [groups, setGroups] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionId, setActionId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      userService.getAllUsers(0, 100),
      adminGroupService.getAll()
    ])
      .then(([usersData, groupsData]) => {
        const list = usersData?.content ?? (Array.isArray(usersData) ? usersData : []);
        setUsers(list);
        setGroups(groupsData ?? []);
      })
      .catch(() => toast.error('Erreur chargement données'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditUser(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (u: UserItem) => {
    setEditUser(u);
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: '', role: u.role, groupId: u.groupId });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      if (editUser) {
        const payload: any = { firstName: form.firstName, lastName: form.lastName, email: form.email };
        if (form.role === 'ROLE_STUDENT' && form.groupId) payload.groupId = form.groupId;
        const updated = await adminUserService.updateUser(editUser.id, payload);
        setUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, ...updated } : u));
        toast.success('Utilisateur mis à jour');
      } else {
        if (!form.password) { toast.error('Mot de passe requis'); setSaving(false); return; }
        const payload: any = { ...form };
        if (form.role !== 'ROLE_STUDENT') delete payload.groupId;
        const created = await adminUserService.createUser(payload);
        setUsers((prev) => [...prev, created]);
        toast.success('Utilisateur créé');
      }
      setShowModal(false);
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  const handleBlock = async (user: UserItem) => {
    setActionId(user.id);
    try {
      if (user.blocked) { await userService.unblockUser(user.id); toast.success(`${user.firstName} débloqué`); }
      else { await userService.blockUser(user.id); toast.success(`${user.firstName} bloqué`); }
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, blocked: !u.blocked } : u));
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
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title font-display">Gestion des utilisateurs</h1>
          <p className="page-sub">Créer, modifier, bloquer et supprimer les comptes.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="#053F5C" />
            <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 14 }}>Utilisateurs</span>
            <span className="badge badge-navy">{filtered.length}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: '7px 28px 7px 12px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#053F5C', background: '#fff', cursor: 'pointer', appearance: 'none' }}>
                <option value="ALL">Tous les rôles</option>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8', pointerEvents: 'none' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8' }} />
              <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '7px 12px 7px 28px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, width: 200, outline: 'none' }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 32, height: 32, margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <AlertCircle size={40} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#053F5C', fontWeight: 700 }}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '10px 24px', background: '#F8FAFC', borderBottom: '1px solid #EBF2F8', display: 'grid', gridTemplateColumns: '1fr 1fr 150px 120px 130px', gap: 12 }}>
              {['Nom', 'Email', 'Rôle', 'Statut', 'Actions'].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B9AB8' }}>{h}</span>
              ))}
            </div>
            {filtered.map((user) => {
              const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
              const isLoading = actionId === user.id;
              return (
                <div key={user.id} className="table-row" style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 150px 120px 130px', gap: 12, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EBF5FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#053F5C', flexShrink: 0 }}>{initials}</div>
                    <span style={{ fontWeight: 700, color: '#053F5C', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.firstName} {user.lastName}</span>
                  </div>
                  <span style={{ color: '#6B9AB8', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                  <div style={{ position: 'relative' }}>
                    <select value={user.role} onChange={(e) => handleRoleChange(user, e.target.value)} disabled={isLoading}
                      style={{ width: '100%', padding: '5px 24px 5px 10px', borderRadius: 7, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#053F5C', background: '#fff', cursor: 'pointer', appearance: 'none' }}>
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <ChevronDown size={11} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8', pointerEvents: 'none' }} />
                  </div>
                  <span className={`badge ${user.blocked ? 'badge-red' : 'badge-green'}`}>{user.blocked ? '🔒 Bloqué' : '✅ Actif'}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(user)} disabled={isLoading} title="Modifier"
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#429EBD' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleBlock(user)} disabled={isLoading} title={user.blocked ? 'Débloquer' : 'Bloquer'}
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: user.blocked ? '#16A34A' : '#D97706' }}>
                      <Ban size={13} />
                    </button>
                    <button onClick={() => handleDelete(user)} disabled={isLoading} title="Supprimer"
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #FECDD3', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,63,92,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: 480, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontWeight: 900, color: '#053F5C', fontSize: 17 }}>
                {editUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B9AB8' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {(['firstName', 'lastName'] as const).map((field) => (
                  <div key={field}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      {field === 'firstName' ? 'Prénom *' : 'Nom *'}
                    </label>
                    <input value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {!editUser && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Mot de passe *</label>
                  <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}
              {!editUser && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Rôle</label>
                  <div style={{ position: 'relative' }}>
                    <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                      style={{ width: '100%', padding: '9px 28px 9px 12px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#053F5C', background: '#fff', cursor: 'pointer', appearance: 'none' }}>
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8', pointerEvents: 'none' }} />
                  </div>
                </div>
              )}
              {form.role === 'ROLE_STUDENT' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Groupe</label>
                  <div style={{ position: 'relative' }}>
                    <select value={form.groupId || ''} onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value ? Number(e.target.value) : undefined }))}
                      style={{ width: '100%', padding: '9px 28px 9px 12px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#053F5C', background: '#fff', cursor: 'pointer', appearance: 'none' }}>
                      <option value="">Sélectionner un groupe...</option>
                      {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8', pointerEvents: 'none' }} />
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, color: '#6B9AB8' }}>Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
