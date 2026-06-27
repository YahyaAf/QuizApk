import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSmileWink } from 'react-icons/fa';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      login(data.user, data.accessToken, data.refreshToken);
      toast.success(<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Connexion réussie ! Bienvenue <FaSmileWink /></span>);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Erreur de connexion. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel - Logo Only ──────────────────────── */}
      <div
        className="hidden lg:flex w-1/2 bg-[#053F5C] items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #053F5C 0%, #0a5f8a 100%)' }}
      >
        <div className="flex flex-col items-center h-full w-full">
          <img src="/logo.svg" alt="PlatformExpert" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* ── Right Panel - Login Form ──────────────────── */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px] animate-slide-up">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-[#053F5C] flex items-center justify-center shadow-lg">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-display font-black text-2xl text-[#053F5C]">PlatformExpert</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-[#053F5C]">Connexion</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Connectez-vous à votre espace d'examen
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#053F5C] mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#053F5C] focus:ring-2 focus:ring-[#053F5C]/20 outline-none transition-all bg-gray-50"
                placeholder="vous@exemple.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-[#053F5C]">
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#429EBD] hover:text-[#053F5C] font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#053F5C] focus:ring-2 focus:ring-[#053F5C]/20 outline-none transition-all bg-gray-50 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#429EBD] transition-colors"
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#053F5C] hover:bg-[#0a5f8a] text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#053F5C] hover:text-[#429EBD] transition-colors"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}