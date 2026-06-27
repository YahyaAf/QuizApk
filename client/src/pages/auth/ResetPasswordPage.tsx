import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Les mots de passe ne correspondent pas'); return; }
    if (password.length < 6)  { toast.error('Minimum 6 caractères'); return; }
    if (!token)               { toast.error('Token manquant. Utilisez le lien reçu par email.'); return; }

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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F4F7FB' }}>
      <div className="w-full max-w-[420px] animate-slide-up">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[#053F5C] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#F7AD19]" />
          </div>
          <span className="font-display font-black text-xl text-[#053F5C]">PlatformExpert</span>
        </div>

        <div className="card p-8">
          {!success ? (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF5FB] flex items-center justify-center mb-4">
                  <Lock size={24} color="#053F5C" />
                </div>
                <h1 className="text-2xl font-display font-black text-[#053F5C]">Nouveau mot de passe</h1>
                <p className="text-[#7BA8BF] mt-2 text-sm">Choisissez un mot de passe sécurisé d'au moins 6 caractères.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#053F5C] mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <input id="new-password" type={showPwd ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field h-11 pr-12" placeholder="Min. 6 caractères" required />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7BA8BF] hover:text-[#429EBD]">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#053F5C] mb-2">Confirmer le mot de passe</label>
                  <input id="confirm-password" type="password" value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="input-field h-11" placeholder="••••••••" required />
                </div>

                <button type="submit" disabled={loading}
                  className="btn btn-primary w-full h-11 justify-center">
                  {loading ? <div className="spinner" /> : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border-4 border-[#86EFAC] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} color="#16A34A" />
              </div>
              <h2 className="text-xl font-display font-black text-[#053F5C] mb-2">Mot de passe mis à jour !</h2>
              <p className="text-[#6B9AB8] text-sm">Redirection vers la connexion...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
