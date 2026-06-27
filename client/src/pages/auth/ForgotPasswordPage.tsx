import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
      toast.success('Email envoyé ! Vérifiez votre boîte de réception.');
    } catch {
      toast.error('Aucun compte trouvé avec cet email.');
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

      {/* ── Right Panel - Forgot Password Form ──────────── */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px] animate-slide-up">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-[#053F5C] flex items-center justify-center shadow-lg">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-display font-black text-2xl text-[#053F5C]">PlatformExpert</span>
          </div>

          {!sent ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-display font-bold text-[#053F5C]">
                  Mot de passe oublié ?
                </h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#053F5C] mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 px-4 pl-11 rounded-xl border border-gray-200 focus:border-[#053F5C] focus:ring-2 focus:ring-[#053F5C]/20 outline-none transition-all bg-gray-50"
                      placeholder="vous@exemple.com"
                      required
                    />
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
                    'Envoyer le lien de réinitialisation'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#053F5C] hover:text-[#429EBD] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-[#F0FDF4] border-4 border-[#86EFAC] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
              </div>
              <h2 className="text-2xl font-display font-black text-[#053F5C] mb-3">
                Email envoyé !
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Un lien de réinitialisation a été envoyé à{' '}
                <strong className="text-[#053F5C]">{email}</strong>.
                Vérifiez votre boîte de réception.
              </p>
              <p className="text-sm text-gray-400">
                Vous n'avez pas reçu l'email ?{' '}
                <button
                  onClick={() => setSent(false)}
                  className="font-semibold text-[#429EBD] hover:text-[#053F5C] transition-colors"
                >
                  Réessayer
                </button>
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#053F5C] hover:text-[#429EBD] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}