import { useState, useEffect } from 'react';
import { 
  Trophy, Star, Crown, Zap, Flame, Shield, Medal, Target, 
  Award, TrendingUp, Sparkles, CheckCircle2, Search, Brain, 
  Settings2, UserCheck, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { badgeService } from '../../services/badgeService';
import type { User } from '../../store/authStore';

const ICONS = [
  { name: 'Trophy', component: Trophy },
  { name: 'Star', component: Star },
  { name: 'Crown', component: Crown },
  { name: 'Zap', component: Zap },
  { name: 'Flame', component: Flame },
  { name: 'Shield', component: Shield },
  { name: 'Medal', component: Medal },
  { name: 'Target', component: Target },
  { name: 'Award', component: Award },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Brain', component: Brain },
];

const COLORS = [
  { name: 'Bleu (Défaut)', value: '#429EBD' },
  { name: 'Or', value: '#F7AD19' },
  { name: 'Vert', value: '#16A34A' },
  { name: 'Rouge', value: '#E11D48' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Argent', value: '#9CA3AF' },
];

export default function BadgeManagerPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState<number | ''>('');
  const [badgeName, setBadgeName] = useState('');
  const [badgeIcon, setBadgeIcon] = useState('Trophy');
  const [badgeColor, setBadgeColor] = useState('#429EBD');
  const [badgeDesc, setBadgeDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    badgeService.getStudents()
      .then(setStudents)
      .catch(() => toast.error('Erreur lors du chargement des étudiants'))
      .finally(() => setLoading(false));
  }, []);

  const handleAssignBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !badgeName.trim()) return;

    setSubmitting(true);
    try {
      await badgeService.assignBadge({
        studentId: Number(selectedStudent),
        name: badgeName,
        iconUrl: badgeIcon,
        color: badgeColor,
        description: badgeDesc || 'Badge attribué manuellement',
      });
      toast.success('Badge attribué avec succès !');
      // Reset
      setSelectedStudent('');
      setBadgeName('');
      setBadgeDesc('');
    } catch {
      toast.error('Erreur lors de l\'attribution du badge');
    }
    setSubmitting(false);
  };

  const handleTriggerRules = async () => {
    setTriggering(true);
    try {
      await badgeService.triggerAutomaticRules();
      toast.success('Calcul des badges automatiques terminé !');
    } catch {
      toast.error('Erreur lors du calcul des badges');
    }
    setTriggering(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* ══ HERO HEADER ══ */}
      <div style={{ background: 'linear-gradient(135deg, #053F5C 0%, #0A6190 60%, #0E7BB0 100%)', borderRadius: 18, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 80, width: 90, height: 90, borderRadius: '50%', background: 'rgba(247,173,25,0.1)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(247,173,25,0.2)', border: '1.5px solid rgba(247,173,25,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F7AD19' }}>
            <Award size={28} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 24, color: '#fff', margin: 0, lineHeight: 1.2 }}>Gestion des Badges</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0, marginTop: 4 }}>Récompensez les étudiants et gérez les règles d'attribution automatique.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* ══ LEFT: MANUAL ASSIGNMENT ══ */}
        <div className="card" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <UserCheck size={20} color="#429EBD" />
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: '#053F5C', margin: 0 }}>Attribution manuelle</h2>
          </div>

          <form onSubmit={handleAssignBadge} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Student Select */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#053F5C', marginBottom: 6 }}>
                Sélectionner un étudiant <span style={{ color: '#E11D48' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={loading}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #DDE8F0', background: '#F8FBFD', color: '#053F5C', fontSize: 14, fontWeight: 600, outline: 'none', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="" disabled>Choisir un étudiant...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.email})
                    </option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B9AB8' }}>
                  <Search size={16} />
                </div>
              </div>
            </div>

            {/* Badge Name */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#053F5C', marginBottom: 6 }}>
                Nom du badge <span style={{ color: '#E11D48' }}>*</span>
              </label>
              <input
                required
                type="text"
                placeholder="Ex: Participation Exceptionnelle"
                value={badgeName}
                onChange={(e) => setBadgeName(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #DDE8F0', background: '#F8FBFD', color: '#053F5C', fontSize: 14, fontWeight: 600, outline: 'none' }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#053F5C', marginBottom: 6 }}>
                Description (Optionnelle)
              </label>
              <input
                type="text"
                placeholder="Une brève explication du badge..."
                value={badgeDesc}
                onChange={(e) => setBadgeDesc(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #DDE8F0', background: '#F8FBFD', color: '#053F5C', fontSize: 14, fontWeight: 600, outline: 'none' }}
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#053F5C', marginBottom: 8 }}>
                Icône du badge
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {ICONS.map(({ name, component: IconComponent }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setBadgeIcon(name)}
                    style={{
                      aspectRatio: '1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                      background: badgeIcon === name ? `${badgeColor}15` : '#fff',
                      border: `2px solid ${badgeIcon === name ? badgeColor : '#EBF2F8'}`,
                      color: badgeIcon === name ? badgeColor : '#6B9AB8',
                    }}
                  >
                    <IconComponent size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#053F5C', marginBottom: 8 }}>
                Couleur du badge
              </label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setBadgeColor(c.value)}
                    title={c.name}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', background: c.value, cursor: 'pointer',
                      border: badgeColor === c.value ? '3px solid #053F5C' : '2px solid transparent',
                      boxShadow: badgeColor === c.value ? '0 0 0 2px #fff inset' : 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedStudent || !badgeName.trim()}
              style={{
                marginTop: 10, padding: '14px', borderRadius: 10, border: 'none',
                background: (!selectedStudent || !badgeName.trim()) ? '#C3D9E8' : 'linear-gradient(135deg, #429EBD, #053F5C)',
                color: '#fff', fontWeight: 800, fontSize: 15, cursor: (!selectedStudent || !badgeName.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
              }}
            >
              {submitting ? (
                <div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <><CheckCircle2 size={18} /> Attribuer le badge</>
              )}
            </button>
          </form>
        </div>

        {/* ══ RIGHT: AUTOMATIC RULES ══ */}
        <div className="card" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Settings2 size={20} color="#F7AD19" />
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: '#053F5C', margin: 0 }}>Règles Automatiques</h2>
          </div>

          <p style={{ fontSize: 13, color: '#6B9AB8', lineHeight: 1.5, marginBottom: 20 }}>
            Déclenchez l'évaluation des règles automatiques pour distribuer les badges de mérite aux étudiants éligibles sur toute la plateforme.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {[
              { icon: <Trophy size={16} />, title: "Top 1 / 2 / 3", desc: "Les 3 premiers du classement global", color: "#F7AD19" },
              { icon: <Star size={16} />, title: "Top 10 / 30 / 100", desc: "Les étudiants dans le peloton de tête", color: "#429EBD" },
              { icon: <Crown size={16} />, title: "Score Parfait (100%)", desc: "100% dans tous leurs examens", color: "#16A34A" },
              { icon: <TrendingUp size={16} />, title: "Moyenne > 60%", desc: "Moyenne générale supérieure à 60%", color: "#92400E" },
            ].map((rule, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: '#F8FBFD', border: '1.5px solid #EBF2F8', borderRadius: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${rule.color}15`, color: rule.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {rule.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#053F5C', fontSize: 14 }}>{rule.title}</div>
                  <div style={{ fontSize: 12, color: '#6B9AB8', fontWeight: 500, marginTop: 2 }}>{rule.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleTriggerRules}
            disabled={triggering}
            style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #F7AD19, #D9930F)',
              color: '#fff', fontWeight: 800, fontSize: 15, cursor: triggering ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
              boxShadow: triggering ? 'none' : '0 4px 14px rgba(247,173,25,0.3)'
            }}
          >
            {triggering ? (
              <div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <><ShieldCheck size={18} /> Calculer et attribuer les badges</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
