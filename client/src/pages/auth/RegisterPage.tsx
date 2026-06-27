import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, UserPlus, BookOpen, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_STUDENT' as 'ROLE_STUDENT' | 'ROLE_TEACHER',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const set = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      login(data.user, data.accessToken, data.refreshToken);
      toast.success('Compte créé avec succès ! Bienvenue 🎉');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'ROLE_STUDENT', label: 'Étudiant', icon: BookOpen, desc: 'Passer des examens en ligne' },
    { value: 'ROLE_TEACHER', label: 'Enseignant', icon: Users, desc: 'Créer et gérer des examens' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#F4F7FB' }}>
      {/* Left branding */}
      <div
        className="hidden lg:flex w-[480px] shrink-0 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #053F5C 0%, #0a5f8a 100%)' }}
      >
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-10" style={{ background: '#F7AD19' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-8" style={{ background: '#9FE7F5', transform: 'translate(30%, 30%)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 rounded-2xl bg-[#F7AD19] flex items-center justify-center shadow-xl">
              <GraduationCap className="w-6 h-6 text-[#053F5C]" />
            </div>
            <div>
              <span className="font-display font-black text-2xl text-white tracking-tight">PlatformExpert</span>
              <p className="text-[10px] text-white/45 uppercase tracking-widest font-medium">Plateforme d'examen</p>
            </div>
          </div>

          <h1 className="text-4xl font-display font-black text-white leading-tight mb-4">
            Rejoignez<br />
            des milliers<br />
            <span className="text-[#F7AD19]">d'apprenants.</span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Créez votre compte en quelques secondes et accédez à des examens interactifs, des résultats instantanés et bien plus.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { value: '500+', label: 'Examens' },
            { value: '2K+',  label: 'Étudiants' },
            { value: '98%',  label: 'Satisfaction' },
            { value: '24/7', label: 'Disponible' },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-2xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-white/50 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[440px] animate-slide-up">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#053F5C] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#F7AD19]" />
            </div>
            <span className="font-display font-black text-xl text-[#053F5C]">PlatformExpert</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-black text-[#053F5C]">Créer un compte</h2>
            <p className="text-[#7BA8BF] mt-2 text-sm">Rejoignez la plateforme d'examen nouvelle génération.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-bold text-[#053F5C] mb-2">Je suis</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map(({ value, label, icon: Icon, desc }) => {
                  const isSelected = form.role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('role', value)}
                      className="text-left p-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: isSelected ? '#053F5C' : '#DDE8F0',
                        background: isSelected ? '#EBF5FB' : '#fff',
                      }}
                    >
                      <Icon size={18} color={isSelected ? '#053F5C' : '#6B9AB8'} />
                      <div className="font-bold text-sm mt-1" style={{ color: isSelected ? '#053F5C' : '#6B9AB8' }}>{label}</div>
                      <div className="text-xs text-[#6B9AB8] mt-0.5">{desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-[#053F5C] mb-1.5">Prénom</label>
                <input id="firstName" type="text" value={form.firstName} onChange={(e) => set('firstName', e.target.value)}
                  className="input-field h-11" placeholder="Prénom" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#053F5C] mb-1.5">Nom</label>
                <input id="lastName" type="text" value={form.lastName} onChange={(e) => set('lastName', e.target.value)}
                  className="input-field h-11" placeholder="Nom" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#053F5C] mb-1.5">Adresse email</label>
              <input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                className="input-field h-11" placeholder="vous@PlatformExpert.ma" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#053F5C] mb-1.5">Mot de passe</label>
              <div className="relative">
                <input id="password" type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  className="input-field h-11 pr-12" placeholder="Min. 6 caractères" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7BA8BF] hover:text-[#429EBD] transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#053F5C] mb-1.5">Confirmer le mot de passe</label>
              <input id="confirmPassword" type="password" value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
                className="input-field h-11" placeholder="••••••••" required />
            </div>

            <button type="submit" disabled={loading}
              className="btn btn-primary w-full h-12 text-sm mt-2 justify-center">
              {loading ? <div className="spinner" /> : <><UserPlus className="w-4 h-4" /> Créer mon compte</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#7BA8BF]">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-bold text-[#053F5C] hover:text-[#429EBD] transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
