import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      toast.error('Minimum 6 caractères');
      return;
    }
    if (!token) {
      toast.error('Token manquant. Utilisez le lien reçu par email.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword: password });
      setSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      toast.error('Token invalide ou expiré. Demandez un nouveau lien.');
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

      {/* ── Right Panel - Reset Password Form ──────────── */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px] animate-slide-up">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-[#053F5C] flex items-center justify-center shadow-lg">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-display font-black text-2xl text-[#053F5C]">PlatformExpert</span>
          </div>

          {!success ? (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#EBF5FB] flex items-center justify-center mb-4">
                  <Lock size={28} color="#053F5C" />
                </div>
                <h2 className="text-3xl font-display font-bold text-[#053F5C]">
                  Nouveau mot de passe
                </h2>
                <p className="text-gray-500 mt-2 text-sm">
                  Choisissez un mot de passe sécurisé d'au moins 6 caractères.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#053F5C] mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    id="confirm-password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#053F5C] focus:ring-2 focus:ring-[#053F5C]/20 outline-none transition-all bg-gray-50"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#053F5C] hover:bg-[#0a5f8a] text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Réinitialiser le mot de passe'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                <Link
                  to="/login"
                  className="font-semibold text-[#053F5C] hover:text-[#429EBD] transition-colors"
                >
                  Retour à la connexion
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-[#F0FDF4] border-4 border-[#86EFAC] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} color="#16A34A" />
              </div>
              <h2 className="text-2xl font-display font-black text-[#053F5C] mb-3">
                Mot de passe mis à jour !
              </h2>
              <p className="text-gray-500 text-sm">
                Redirection vers la connexion...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}