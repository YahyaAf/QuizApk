import { Bell, Search, User, ChevronDown, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className="app-header">
      {/* Search */}
      <div style={{ position:'relative', width:260 }}>
        <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6B9AB8' }} />
        <input
          type="text"
          placeholder="Rechercher un examen..."
          style={{
            width:'100%', paddingLeft:36, paddingRight:14,
            paddingTop:8, paddingBottom:8,
            background:'#F0F4F8', border:'1.5px solid #DDE8F0',
            borderRadius:10, fontSize:13.5, fontWeight:500,
            fontFamily:'inherit', color:'#053F5C', outline:'none',
            transition:'border-color 0.15s'
          }}
          onFocus={e => { e.target.style.borderColor='#429EBD'; e.target.style.boxShadow='0 0 0 3px rgba(66,158,189,0.14)'; }}
          onBlur={e => { e.target.style.borderColor='#DDE8F0'; e.target.style.boxShadow='none'; }}
        />
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
        {/* Notifications */}
        <button style={{
          width:38, height:38, borderRadius:10, display:'flex', alignItems:'center',
          justifyContent:'center', background:'none', border:'none', cursor:'pointer',
          color:'#6B9AB8', position:'relative', transition:'all 0.15s'
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='#EBF5FB'; (e.currentTarget as HTMLButtonElement).style.color='#429EBD'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='none'; (e.currentTarget as HTMLButtonElement).style.color='#6B9AB8'; }}
        >
          <Bell size={18} />
          <span style={{
            position:'absolute', top:8, right:8, width:8, height:8,
            background:'#F7AD19', borderRadius:'50%', border:'2px solid #fff'
          }} />
        </button>

        {/* Divider */}
        <div style={{ width:1, height:28, background:'#DDE8F0', margin:'0 4px' }} />

        {/* Profile */}
        <div style={{ position:'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display:'flex', alignItems:'center', gap:10,
              background:'none', border:'none', cursor:'pointer',
              padding:'5px 8px', borderRadius:10, transition:'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='#F0F4F8'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='none'}
          >
            <div style={{
              width:34, height:34, borderRadius:9,
              background:'linear-gradient(135deg, #429EBD, #053F5C)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#fff', fontWeight:800, fontSize:14, boxShadow:'0 2px 6px rgba(5,63,92,0.25)'
            }}>
              {user?.name?.charAt(0) ?? 'U'}
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:13.5, fontWeight:700, color:'#053F5C', lineHeight:'1.2' }}>{user?.name ?? 'Étudiant'}</div>
              <div style={{ fontSize:11, color:'#6B9AB8', textTransform:'capitalize' }}>{user?.role ?? 'student'}</div>
            </div>
            <ChevronDown size={14} color="#6B9AB8" style={{ transform: showMenu ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }} />
          </button>

          {showMenu && (
            <div className="card animate-scale-in" style={{
              position:'absolute', right:0, top:'calc(100% + 8px)',
              width:210, padding:'8px 0', zIndex:50,
              boxShadow:'0 8px 32px rgba(5,63,92,0.12)'
            }}>
              <div style={{ padding:'10px 16px 10px', borderBottom:'1px solid #EBF2F8', marginBottom:4 }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#053F5C' }}>{user?.name}</div>
                <div style={{ fontSize:11, color:'#6B9AB8', marginTop:2, overflow:'hidden', textOverflow:'ellipsis' }}>{user?.email}</div>
              </div>
              <button style={{
                width:'100%', textAlign:'left', padding:'9px 16px',
                background:'none', border:'none', cursor:'pointer',
                fontSize:13.5, color:'#053F5C', display:'flex', alignItems:'center', gap:10,
                fontFamily:'inherit', fontWeight:500, transition:'background 0.12s'
              }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='#F0F4F8'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='none'}
              >
                <User size={14} color="#429EBD" /> Mon profil
              </button>
              <div style={{ borderTop:'1px solid #EBF2F8', margin:'4px 0' }} />
              <button
                onClick={() => { logout(); window.location.href = '/login'; }}
                style={{
                  width:'100%', textAlign:'left', padding:'9px 16px',
                  background:'none', border:'none', cursor:'pointer',
                  fontSize:13.5, color:'#E11D48', display:'flex', alignItems:'center', gap:10,
                  fontFamily:'inherit', fontWeight:600, transition:'background 0.12s'
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='#FFF1F2'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='none'}
              >
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
