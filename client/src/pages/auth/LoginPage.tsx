import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Zap, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email,    setEmail]    = useState('student@PlatformExpert.ma');
  const [password, setPassword] = useState('password123');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const login    = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleFillTest = (role: 'admin' | 'teacher' | 'student') => {
    setEmail(`${role}@PlatformExpert.ma`);
    setPassword('password123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      login(data.user, data.accessToken, data.refreshToken);
      toast.success('Connexion réussie ! Bienvenue 👋');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) {
        toast.error(msg);
      } else {
        // Fallback: mock login for demo if backend is offline
        login(
          { id: 1, firstName: 'John', lastName: 'Doe', email, role: 'ROLE_STUDENT' },
          'mock-token'
        );
        toast.success('Connexion réussie ! (mode démo)');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: ShieldCheck, title: 'Sécurisé',   desc: 'Examen surveillé avec système anti-triche.' },
    { icon: Zap,         title: 'Instantané',  desc: 'Résultats disponibles immédiatement après soumission.' },
    { icon: BookOpen,    title: 'Adaptatif',   desc: 'Interface optimisée pour tous les appareils.' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#F4F7FB' }}>
      {/* ── Left Branding Panel ──────────────────────── */}
      <div
        className="hidden lg:flex w-[480px] shrink-0 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #053F5C 0%, #0a5f8a 100%)' }}
      >
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-10" style={{ background: '#F7AD19' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-8" style={{ background: '#9FE7F5', transform: 'translate(30%, 30%)' }} />
        <div className="absolute top-1/2 -right-8 w-32 h-32 rounded-full opacity-5" style={{ background: '#fff' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl transform transition-transform hover:scale-105">
              <img src="/logo.svg" alt="PlatformExpert" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <span className="font-display font-black text-2xl text-white tracking-tight">PlatformExpert</span>
              <p className="text-[10px] text-white/45 uppercase tracking-widest font-medium">Plateforme d'examen</p>
            </div>
          </div>

          <h1 className="text-4xl font-display font-black text-white leading-tight mb-4">
            La plateforme<br />
            d'examen<br />
            <span className="text-[#F7AD19]">nouvelle génération.</span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Passez vos examens en ligne en toute sérénité. Résultats instantanés, interface intuitive et professionnelle.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 rounded-2xl p-4 border border-white/10 transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <div className="w-10 h-10 rounded-xl bg-[#F7AD19]/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#F7AD19]" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{title}</p>
                <p className="text-xs text-white/55 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Login Form ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] animate-slide-up">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#EBF5FB] flex items-center justify-center shadow-sm">
              <img src="/logo.svg" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-display font-black text-xl text-[#053F5C]">PlatformExpert</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-black text-[#053F5C]">Connexion</h2>
            <p className="text-[#7BA8BF] mt-2 text-sm">Accédez à votre espace d'examen personnel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#053F5C] mb-2">Adresse email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field h-12" placeholder="vous@PlatformExpert.ma" required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-[#053F5C]">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs text-[#429EBD] hover:text-[#053F5C] font-bold transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input id="password" type={showPwd ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field h-12 pr-12" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7BA8BF] hover:text-[#429EBD] transition-colors">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn btn-primary w-full h-12 text-sm mt-4 justify-center shadow-lg hover:shadow-xl transition-shadow"
              style={{ fontSize: '15px', fontWeight: 800 }}>
              {loading ? <div className="spinner" /> : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#7BA8BF]">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-bold text-[#053F5C] hover:text-[#429EBD] transition-colors">
              Créer un compte
            </Link>
          </p>

          <div className="mt-6">
            <p className="text-xs text-[#7BA8BF] text-center font-bold mb-3 uppercase tracking-wider">Connexion rapide (Mode Test)</p>
            <div className="flex gap-2">
              <button onClick={() => handleFillTest('admin')}
                className="flex-1 py-2 rounded-lg bg-[#EBF5FB] hover:bg-[#C3DFF0] text-[#053F5C] text-xs font-bold transition-colors">
                Admin
              </button>
              <button onClick={() => handleFillTest('teacher')}
                className="flex-1 py-2 rounded-lg bg-[#FEF9EC] hover:bg-[#FBD98A] text-[#D9930F] text-xs font-bold transition-colors">
                Enseignant
              </button>
              <button onClick={() => handleFillTest('student')}
                className="flex-1 py-2 rounded-lg bg-[#F0FDF4] hover:bg-[#86EFAC] text-[#16A34A] text-xs font-bold transition-colors">
                Étudiant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
