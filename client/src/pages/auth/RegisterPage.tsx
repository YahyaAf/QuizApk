import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSmileWink } from 'react-icons/fa';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
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
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

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
        role: 'ROLE_STUDENT', // Par défaut, l'utilisateur s'inscrit comme étudiant
      });
      login(data.user, data.accessToken, data.refreshToken);
      toast.success(<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Compte créé avec succès ! Bienvenue <FaSmileWink /></span>);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
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

      {/* ── Right Panel - Register Form ──────────────────── */}
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
            <h2 className="text-3xl font-display font-bold text-[#053F5C]">Inscription</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Créez votre compte et commencez à apprendre
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[#053F5C] mb-2">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#053F5C] focus:ring-2 focus:ring-[#053F5C]/20 outline-none transition-all bg-gray-50"
                  placeholder="Jean"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#053F5C] mb-2">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#053F5C] focus:ring-2 focus:ring-[#053F5C]/20 outline-none transition-all bg-gray-50"
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#053F5C] mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#053F5C] focus:ring-2 focus:ring-[#053F5C]/20 outline-none transition-all bg-gray-50"
                placeholder="vous@exemple.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#053F5C] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#053F5C] focus:ring-2 focus:ring-[#053F5C]/20 outline-none transition-all bg-gray-50 pr-12"
                  placeholder="Min. 6 caractères"
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

            <div>
              <label className="block text-sm font-semibold text-[#053F5C] mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#053F5C] focus:ring-2 focus:ring-[#053F5C]/20 outline-none transition-all bg-gray-50"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#053F5C] hover:bg-[#0a5f8a] text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  S'inscrire
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#053F5C] hover:text-[#429EBD] transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}