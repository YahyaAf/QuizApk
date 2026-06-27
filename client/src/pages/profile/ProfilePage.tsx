import { useState } from 'react';
import { User, Lock, Award, Camera, CheckCircle2, Shield } from 'lucide-react';
import { FaBullseye, FaStar, FaFire, FaTrophy, FaBolt, FaMedal } from 'react-icons/fa';
import { useAuthStore, getRoleLabel } from '../../store/authStore';
import { userService } from '../../services/dashboardService';
import toast from 'react-hot-toast';

const BADGE_ICONS: Record<string, React.ReactNode> = {
  'first_exam': <FaBullseye color="#E53E3E" />,
  'perfect_score': <FaStar color="#D69E2E" />,
  'streak_7': <FaFire color="#DD6B20" />,
  'top_student': <FaTrophy color="#D69E2E" />,
  'fast_solver': <FaBolt color="#3182CE" />,
};

export default function ProfilePage() {
  const user       = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [tab, setTab] = useState<'profile' | 'password' | 'badges'>('profile');

  // Profile form
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName,  setLastName]  = useState(user?.lastName  ?? '');
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loadingPwd, setLoadingPwd] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const updated = await userService.updateProfile({ firstName, lastName });
      updateUser({ firstName: updated.firstName, lastName: updated.lastName });
      toast.success('Profil mis à jour avec succès !');
    } catch {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { toast.error('Les mots de passe ne correspondent pas'); return; }
    if (newPwd.length < 6)    { toast.error('Minimum 6 caractères'); return; }
    setLoadingPwd(true);
    try {
      await userService.changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      toast.success('Mot de passe modifié avec succès !');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch {
      toast.error('Mot de passe actuel incorrect');
    } finally {
      setLoadingPwd(false);
    }
  };

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  type TabKey = 'profile' | 'password' | 'badges';
  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'profile',  label: 'Mon profil',         icon: User },
    { key: 'password', label: 'Mot de passe',       icon: Lock },
  ];

  if (user?.role === 'ROLE_STUDENT') {
    tabs.push({ key: 'badges', label: `Badges (${user?.badges?.length ?? 0})`, icon: Award });
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <div>
        <h1 className="page-title font-display">Mon Profil</h1>
        <p className="page-sub">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{ padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #053F5C, #429EBD)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900, color: '#fff',
          }}>
            {initials}
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 24, height: 24, borderRadius: '50%',
            background: '#F7AD19', border: '2px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <Camera size={12} color="#053F5C" />
          </div>
        </div>
        <div>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, color: '#053F5C' }}>
            {user?.firstName} {user?.lastName}
          </h2>
          <p style={{ color: '#6B9AB8', fontSize: 13, marginTop: 2 }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <span className="badge badge-navy">
              <Shield size={10} /> {getRoleLabel(user?.role)}
            </span>
            {user?.role === 'ROLE_STUDENT' && (user?.badges?.length ?? 0) > 0 && (
              <span className="badge badge-amber">
                <Award size={10} /> {user?.badges?.length} badges
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: 24 }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, background: '#F0F4F8', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content' }}>
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = tab === key;
            return (
              <button key={key} onClick={() => setTab(key)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                background: isActive ? '#fff' : 'none',
                color: isActive ? '#053F5C' : '#6B9AB8',
                boxShadow: isActive ? '0 1px 4px rgba(5,63,92,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>
                <Icon size={15} /> {label}
              </button>
            );
          })}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <form onSubmit={handleProfileSave} style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="block text-sm font-bold" style={{ color: '#053F5C', marginBottom: 6 }}>Prénom</label>
                <input className="input-field h-11" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" required />
              </div>
              <div>
                <label className="block text-sm font-bold" style={{ color: '#053F5C', marginBottom: 6 }}>Nom</label>
                <input className="input-field h-11" value={lastName}
                  onChange={(e) => setLastName(e.target.value)} placeholder="Nom" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold" style={{ color: '#053F5C', marginBottom: 6 }}>Email</label>
              <input className="input-field h-11" value={user?.email ?? ''} disabled
                style={{ background: '#F4F7FB', color: '#6B9AB8', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label className="block text-sm font-bold" style={{ color: '#053F5C', marginBottom: 6 }}>Rôle</label>
              <input className="input-field h-11" value={getRoleLabel(user?.role)} disabled
                style={{ background: '#F4F7FB', color: '#6B9AB8', cursor: 'not-allowed' }} />
            </div>
            <button type="submit" disabled={loadingProfile} className="btn btn-primary" style={{ width: 'fit-content', padding: '10px 28px' }}>
              {loadingProfile ? <div className="spinner" /> : <><CheckCircle2 size={16} /> Sauvegarder</>}
            </button>
          </form>
        )}

        {/* Password tab */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordChange} style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="block text-sm font-bold" style={{ color: '#053F5C', marginBottom: 6 }}>Mot de passe actuel</label>
              <input type="password" className="input-field h-11" value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)} placeholder="••••••••" required />
            </div>
            <div>
              <label className="block text-sm font-bold" style={{ color: '#053F5C', marginBottom: 6 }}>Nouveau mot de passe</label>
              <input type="password" className="input-field h-11" value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)} placeholder="Min. 6 caractères" required />
            </div>
            <div>
              <label className="block text-sm font-bold" style={{ color: '#053F5C', marginBottom: 6 }}>Confirmer le nouveau mot de passe</label>
              <input type="password" className="input-field h-11" value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loadingPwd} className="btn btn-primary" style={{ width: 'fit-content', padding: '10px 28px' }}>
              {loadingPwd ? <div className="spinner" /> : <><Lock size={16} /> Modifier le mot de passe</>}
            </button>
          </form>
        )}

        {/* Badges tab */}
        {tab === 'badges' && (
          <div>
            {(user?.badges?.length ?? 0) === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Award size={48} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 700, color: '#053F5C', fontSize: 15 }}>Aucun badge pour le moment</p>
                <p style={{ color: '#6B9AB8', fontSize: 13, marginTop: 4 }}>
                  Passez des examens et obtenez de bons résultats pour débloquer des badges !
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {user?.badges?.map((badge) => (
                  <div key={badge.id} className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>
                      {BADGE_ICONS[badge.name] ?? <FaMedal color="#718096" />}
                    </div>
                    <div style={{ fontWeight: 800, color: '#053F5C', fontSize: 14, marginBottom: 4 }}>{badge.name}</div>
                    <div style={{ color: '#6B9AB8', fontSize: 12 }}>{badge.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
