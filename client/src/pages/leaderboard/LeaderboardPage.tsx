import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Star } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { useAuthStore } from '../../store/authStore';

interface LeaderEntry {
  rank: number;
  studentName: string;
  studentEmail: string;
  averageScore: number;
  examsTaken: number;
  totalScore: number;
}

const MEDAL: Record<number, { icon: typeof Trophy; color: string; bg: string }> = {
  1: { icon: Crown,  color: '#B8860B', bg: '#FFF8DC' },
  2: { icon: Medal,  color: '#6B7280', bg: '#F3F4F6' },
  3: { icon: Medal,  color: '#92400E', bg: '#FEF3C7' },
};

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number>(0);
  const [month, setMonth] = useState<number>(0);
  
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    setLoading(true);
    dashboardService.getLeaderboard(10, year || undefined, month || undefined)
      .then((data) => { setLeaders(data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month]);

  const top3 = leaders.slice(0, 3);
  const rest  = leaders.slice(3);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title font-display">Classement</h1>
          <p className="page-sub">Les meilleurs étudiants de la plateforme.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #DDE8F0', color: '#053F5C', outline: 'none', background: '#fff' }}
          >
            <option value={0}>Toutes les années</option>
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>

          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #DDE8F0', color: '#053F5C', outline: 'none', background: '#fff' }}
          >
            <option value={0}>Tous les mois</option>
            <option value={1}>Janvier</option>
            <option value={2}>Février</option>
            <option value={3}>Mars</option>
            <option value={4}>Avril</option>
            <option value={5}>Mai</option>
            <option value={6}>Juin</option>
            <option value={7}>Juillet</option>
            <option value={8}>Août</option>
            <option value={9}>Septembre</option>
            <option value={10}>Octobre</option>
            <option value={11}>Novembre</option>
            <option value={12}>Décembre</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 32, height: 32 }} />
        </div>
      ) : (
        <>
          {/* Podium top 3 */}
          <div className="card" style={{
            padding: '40px 32px',
            background: 'linear-gradient(135deg, #053F5C 0%, #0B6598 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(247,173,25,0.1)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: '40%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(159,231,245,0.07)' }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 24 }}>
              {[top3[1], top3[0], top3[2]].map((entry, i) => {
                if (!entry) return null;
                const podiumPos = i === 0 ? 2 : i === 1 ? 1 : 3;
                const heights = [120, 160, 100];
                const isFirst = podiumPos === 1;
                const initials = entry.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

                return (
                  <div key={entry.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    {isFirst && <Crown size={28} color="#F7AD19" style={{ filter: 'drop-shadow(0 2px 8px rgba(247,173,25,0.5))' }} />}
                    <div style={{
                      width: isFirst ? 72 : 60, height: isFirst ? 72 : 60,
                      borderRadius: '50%',
                      background: isFirst ? '#F7AD19' : 'rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: isFirst ? 24 : 18,
                      color: isFirst ? '#053F5C' : '#fff',
                      border: `3px solid ${isFirst ? '#F7AD19' : 'rgba(255,255,255,0.3)'}`,
                      boxShadow: isFirst ? '0 4px 20px rgba(247,173,25,0.4)' : 'none',
                    }}>
                      {initials}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontWeight: 800, fontSize: isFirst ? 15 : 13 }}>
                        {entry.studentName.split(' ')[0]}
                      </div>
                      <div style={{ color: '#F7AD19', fontWeight: 900, fontSize: isFirst ? 20 : 16 }}>
                        {((entry.averageScore ?? entry.averagePercentage ?? 0)).toFixed(1)}%
                      </div>
                    </div>
                    {/* Podium block */}
                    <div style={{
                      width: isFirst ? 100 : 80, height: heights[i],
                      background: isFirst ? '#F7AD19' : 'rgba(255,255,255,0.15)',
                      borderRadius: '10px 10px 0 0',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                      paddingTop: 12,
                    }}>
                      <span style={{ fontWeight: 900, fontSize: 22, color: isFirst ? '#053F5C' : '#fff' }}>
                        #{podiumPos}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rest of ranking */}
          {(!year || !month) && rest.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', gap: 10 }}>
                <TrendingUp size={18} color="#053F5C" />
                <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 15 }}>Classement complet</span>
              </div>
              {rest.map((entry) => {
              const isMe = entry.studentEmail === currentUser?.email;
              return (
                <div key={entry.rank} className="table-row" style={{
                  padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16,
                  background: isMe ? '#FFFBEF' : 'transparent',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: '#F0F4F8', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 900, color: '#053F5C', fontSize: 15, flexShrink: 0,
                  }}>
                    #{entry.rank}
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #053F5C, #429EBD)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 14, flexShrink: 0,
                  }}>
                    {entry.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#053F5C', fontSize: 14 }}>
                      {entry.studentName}
                      {isMe && <span className="badge badge-amber" style={{ marginLeft: 8 }}>Moi</span>}
                    </div>
                    <div style={{ color: '#6B9AB8', fontSize: 12, marginTop: 2 }}>
                      {entry.examsTaken} examens passés
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={14} color="#F7AD19" fill="#F7AD19" />
                    {(() => {
                      const score = entry.averageScore ?? entry.averagePercentage ?? 0;
                      const color = score >= 85 ? '#16A34A' : score >= 60 ? '#D9930F' : '#E11D48';
                      return (
                        <span style={{ fontWeight: 900, fontSize: 17, color }}>
                          {score.toFixed(1)}%
                        </span>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </>
      )}
    </div>
  );
}
