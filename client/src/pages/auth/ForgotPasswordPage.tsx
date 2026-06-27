import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F4F7FB' }}>
      <div className="w-full max-w-[420px] animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[#053F5C] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#F7AD19]" />
          </div>
          <span className="font-display font-black text-xl text-[#053F5C]">PlatformExpert</span>
        </div>

        <div className="card p-8">
          {!sent ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-display font-black text-[#053F5C]">Mot de passe oublié ?</h1>
                <p className="text-[#7BA8BF] mt-2 text-sm leading-relaxed">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#053F5C] mb-2">Adresse email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7BA8BF]" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field h-11 pl-10"
                      placeholder="vous@PlatformExpert.ma"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="btn btn-primary w-full h-11 justify-center">
                  {loading ? <div className="spinner" /> : 'Envoyer le lien de réinitialisation'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border-4 border-[#86EFAC] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} color="#16A34A" />
              </div>
              <h2 className="text-xl font-display font-black text-[#053F5C] mb-2">Email envoyé !</h2>
              <p className="text-[#6B9AB8] text-sm leading-relaxed mb-6">
                Un lien de réinitialisation a été envoyé à <strong className="text-[#053F5C]">{email}</strong>.
                Vérifiez votre boîte de réception.
              </p>
              <p className="text-xs text-[#7BA8BF]">
                Vous n'avez pas reçu l'email ?{' '}
                <button onClick={() => setSent(false)} className="font-bold text-[#429EBD] hover:underline">
                  Réessayer
                </button>
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-[#6B9AB8] hover:text-[#053F5C] transition-colors">
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
