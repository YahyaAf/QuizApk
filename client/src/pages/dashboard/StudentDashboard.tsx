import { useEffect, useState } from 'react';
import { Clock, ArrowRight, PlayCircle, BookOpen, Target, Flame, ChevronRight, Calendar as CalendarIcon, CheckCircle2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { examService } from '../../services/examService';
import { resultService } from '../../services/resultService';
import { dashboardService } from '../../services/dashboardService';

export default function StudentDashboard() {
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);
  
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsData, resultsData, dashData] = await Promise.all([
          examService.getAvailableExams(),
          resultService.getMyResults(),
          dashboardService.getStudentDashboard()
        ]);
        
        setDashboardData(dashData);
        const examsList = examsData?.content || examsData || [];
        setUpcoming(examsList.slice(0, 3));
        
        const resList = resultsData?.content || resultsData || [];
        setResultsList(resList);
        setRecent(resList.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const avg = Math.round(resultsList.reduce((s, r) => s + (r.percentage || 0), 0) / Math.max(resultsList.length, 1));
  
  const stats = [
    { icon: CalendarIcon, label: 'À venir', value: String(upcoming.length), color:'#053F5C', bg:'#EBF5FB', border:'#C3D9E8' },
    { icon: Target,       label: 'Moyenne générale',      value: `${avg}%`,               color:'#D9930F', bg:'#FEF9EC', border:'#FBD98A' },
    { icon: BookOpen,     label: 'Examens terminés',      value: String(resultsList.length), color:'#429EBD', bg:'#EBF5FB', border:'#C3D9E8' },
    { icon: Flame,        label: 'Série (jours consécutifs)', value: String(dashboardData?.currentStreak || 0), color:'#16A34A', bg:'#F0FDF4', border:'#86EFAC' },
  ];

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Chargement du tableau de bord...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:24, width:'100%' }}>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div style={{
        background:'linear-gradient(135deg, #053F5C 0%, #0B6598 65%, #1880B8 100%)',
        borderRadius:16, padding:'32px 36px', position:'relative', overflow:'hidden',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:20,
      }}>
        {/* Blobs */}
        <div style={{ position:'absolute', top:-40, right:-40, width:220, height:220, borderRadius:'50%', background:'rgba(247,173,25,0.12)' }} />
        <div style={{ position:'absolute', bottom:-60, left:'55%', width:180, height:180, borderRadius:'50%', background:'rgba(159,231,245,0.08)' }} />
        
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ color:'rgba(159,231,245,0.8)', fontSize:13, fontWeight:600, marginBottom:6 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </div>
          <h1 className="font-display" style={{ color:'#fff', fontSize:28, fontWeight:900, marginBottom:8, lineHeight:1.2 }}>
            Bonjour, {user?.name?.split(' ')[0] ?? 'Étudiant'} ! 👋
          </h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:14 }}>
            Prêt à relever de nouveaux défis ? Vous avez <strong style={{ color:'#fff' }}>{upcoming.length} examen{upcoming.length > 1 ? 's' : ''}</strong> prévus.
          </p>
        </div>
        
        <button
          onClick={() => navigate('/exams')}
          style={{
            display:'flex', alignItems:'center', gap:8,
            background:'#F7AD19', color:'#053F5C', fontWeight:700,
            padding:'12px 24px', borderRadius:12, border:'none', cursor:'pointer',
            fontSize:14, flexShrink:0, position:'relative', zIndex:1,
            boxShadow:'0 4px 14px rgba(247,173,25,0.35)', transition:'all 0.15s',
            fontFamily:'inherit'
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='#D9930F'; (e.currentTarget as HTMLButtonElement).style.color='#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='#F7AD19'; (e.currentTarget as HTMLButtonElement).style.color='#053F5C'; }}
        >
          Ouvrir le calendrier <ArrowRight size={16} />
        </button>
      </div>

      {/* ── Actionable KPIs ────────────────────────────────────── */}
      <div className="grid-4">
        {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
          <div className="stat-card" key={label} style={{ borderColor: border }}>
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ color }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ─────────────────────────────────────────── */}
      <div className="grid-main">
        {/* Left col: Upcoming Exams (Priority Action) */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="card" style={{ padding:24, flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <h2 className="font-display" style={{ fontSize:18, fontWeight:800, color:'#053F5C' }}>Examens à venir</h2>
                <p style={{ fontSize:13, color:'#6B9AB8', marginTop:2 }}>Vos prochains devoirs et évaluations</p>
              </div>
              <button onClick={() => navigate('/exams')} style={{
                display:'flex', alignItems:'center', gap:4,
                color:'#429EBD', fontWeight:700, fontSize:13,
                background:'none', border:'none', cursor:'pointer', fontFamily:'inherit'
              }}>
                Voir tout <ChevronRight size={14} />
              </button>
            </div>
            
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {upcoming.map((exam) => {
                const d = new Date(exam.availableFrom || new Date());
                const attemptsTaken = resultsList.filter((r) => r.examId === exam.id).length;
                const maxAttempts = exam.maxAttempts || 1;
                const remainingAttempts = Math.max(0, maxAttempts - attemptsTaken);
                
                const now = new Date();
                const start = new Date(exam.availableFrom);
                const end = new Date(exam.availableUntil);
                
                const isDevalidated = attemptsTaken >= maxAttempts;
                const isDisabled = now < start || now > end;

                return (
                  <div key={exam.id} style={{ 
                    padding:'16px', borderRadius:12, border:'1px solid #EBF2F8', 
                    display:'flex', alignItems:'center', gap:16, justifyContent:'space-between',
                    background:'#F4F7FB'
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14, flex:1, minWidth:0 }}>
                      <div style={{
                        width:56, height:56, borderRadius:12, background:'#fff',
                        border:'1px solid #DDE8F0', display:'flex', flexDirection:'column',
                        alignItems:'center', justifyContent:'center', flexShrink:0,
                        boxShadow:'0 2px 8px rgba(5,63,92,0.04)'
                      }}>
                        <span style={{ fontSize:10, fontWeight:800, color:'#429EBD', textTransform:'uppercase' }}>{d.toLocaleString('fr-FR',{month:'short'})}</span>
                        <span style={{ fontSize:22, fontWeight:900, color:'#053F5C', lineHeight:1 }}>{d.getDate()}</span>
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontWeight:800, color:'#053F5C', fontSize:15, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:8 }}>
                          {exam.title}
                          {isDevalidated && <span style={{ background:'#FEE2E2', color:'#991B1B', fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:999, textTransform:'uppercase' }}>Dévalidé</span>}
                          {!isDevalidated && isDisabled && <span style={{ background:'#F3F4F6', color:'#4B5563', fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:999, textTransform:'uppercase' }}>Désactivé</span>}
                        </div>
                        <div style={{ color:'#6B9AB8', fontSize:13, fontWeight:600, marginBottom:8 }}>{exam.moduleName} · {exam.createdByTeacherName}</div>
                        <div style={{ display:'flex', gap:16, color:'#053F5C', fontSize:12, fontWeight:700 }}>
                          <span style={{ display:'flex', alignItems:'center', gap:4, background:'#EBF5FB', padding:'4px 10px', borderRadius:8 }}>
                            <Clock size={12} color="#429EBD" />{exam.durationMinutes} min
                          </span>
                          <span style={{ display:'flex', alignItems:'center', gap:4, background:'#EBF5FB', padding:'4px 10px', borderRadius:8 }}>
                            <BookOpen size={12} color="#429EBD" />{exam.totalMarks || 0} Pts
                          </span>
                          {exam.maxAttempts && (
                            <span style={{ display:'flex', alignItems:'center', gap:4, background:'#EBF5FB', padding:'4px 10px', borderRadius:8 }}>
                              <RotateCcw size={12} color="#429EBD" />{remainingAttempts} tentative{remainingAttempts > 1 ? 's' : ''} rest.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/exam/${exam.id}`)}
                      disabled={isDevalidated || isDisabled}
                      className="btn btn-primary"
                      style={{ 
                        flexShrink:0, 
                        padding:'10px 20px', 
                        opacity: (isDevalidated || isDisabled) ? 0.6 : 1, 
                        cursor: (isDevalidated || isDisabled) ? 'not-allowed' : 'pointer',
                        background: isDevalidated ? '#EF4444' : (isDisabled ? '#9CA3AF' : '#F7AD19'),
                        borderColor: isDevalidated ? '#EF4444' : (isDisabled ? '#9CA3AF' : '#F7AD19'),
                        color: (isDevalidated || isDisabled) ? '#fff' : '#053F5C'
                      }}
                    >
                      <PlayCircle size={16} /> {isDevalidated ? 'Dévalidé' : (isDisabled ? 'Désactivé' : 'Démarrer')}
                    </button>
                  </div>
                );
              })}
              {upcoming.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6B9AB8', fontSize: 14 }}>
                  Aucun examen à venir pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right col: Recent Activity & Tips */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          
          {/* Tip Card */}
          <div style={{ background:'#FFFBEF', border:'1px solid #FBD98A', borderRadius:14, padding:20, boxShadow:'0 4px 12px rgba(247,173,25,0.1)' }}>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ 
                width:40, height:40, borderRadius:10, background:'#F7AD19', 
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 
              }}>
                <span style={{ fontSize:20 }}>💡</span>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:900, color:'#8C5D07', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>
                  Conseil du jour
                </div>
                <p style={{ fontSize:13, color:'#A0620A', fontWeight:600, lineHeight:1.5 }}>
                  {dashboardData?.dailyTip || "Pratiquez régulièrement avec de petits tests pour améliorer votre rétention d'information !"}
                </p>
              </div>
            </div>
          </div>

          {/* Recent results (Activity) */}
          <div className="card" style={{ padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h2 className="font-display" style={{ fontSize:16, fontWeight:800, color:'#053F5C' }}>Activité récente</h2>
              <button onClick={() => navigate('/results')} style={{
                color:'#429EBD', fontWeight:700, fontSize:12,
                background:'none', border:'none', cursor:'pointer', fontFamily:'inherit'
              }}>
                Historique
              </button>
            </div>
            
            <div style={{ display:'flex', flexDirection:'column' }}>
              {recent.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6B9AB8', fontSize: 13 }}>
                  Aucune activité récente.
                </div>
              ) : recent.map((r, index) => {
                const score = r.percentage || 0;
                const col = score >= 85 ? '#16A34A' : score >= 60 ? '#D9930F' : '#E11D48';
                const bg  = score >= 85 ? '#F0FDF4' : score >= 60 ? '#FEF9EC' : '#FFF1F2';
                return (
                  <div key={r.id} style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'12px 0', borderBottom: index < recent.length - 1 ? '1px solid #EBF2F8' : 'none',
                  }}>
                    <div style={{ 
                      width:42, height:42, borderRadius:10, background:bg, 
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 
                    }}>
                      {score >= 50 ? <CheckCircle2 size={20} color={col} /> : <Target size={20} color={col} />}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, color:'#053F5C', fontSize:13.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.examTitle}</div>
                      <div style={{ color:'#6B9AB8', fontSize:11.5, marginTop:2, fontWeight:600 }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div style={{ fontWeight:900, fontSize:16, color:col }}>
                      {Math.round(score)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

