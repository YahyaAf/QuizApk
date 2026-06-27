import { useState, useEffect } from 'react';
import { ScrollText, Search, Filter, AlertCircle, Clock, User, Activity } from 'lucide-react';
import { adminAuditService } from '../../services/adminService';
import toast from 'react-hot-toast';

interface AuditLog {
  id: number;
  action: string;
  performedBy?: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

const ACTION_COLORS: Record<string, { color: string; bg: string }> = {
  CREATE: { color: '#16A34A', bg: '#F0FDF4' },
  UPDATE: { color: '#D97706', bg: '#FFFBEB' },
  DELETE: { color: '#E11D48', bg: '#FFF1F2' },
  LOGIN:  { color: '#7C3AED', bg: '#F5F3FF' },
  BLOCK:  { color: '#D97706', bg: '#FFFBEB' },
  UNBLOCK: { color: '#16A34A', bg: '#F0FDF4' },
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    adminAuditService.getLogs()
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Erreur chargement des logs'))
      .finally(() => setLoading(false));
  }, []);

  const allActions = [...new Set(logs.map((l) => l.action))].sort();
  const filtered = logs.filter((l) => {
    const matchSearch = `${l.action} ${l.ipAddress ?? ''} ${l.performedBy ?? ''} ${l.details ?? ''}`.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const formatDate = (ts: string) => {
    try {
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
    } catch { return ts; }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title font-display">Logs d'audit</h1>
        <p className="page-sub">Historique complet des actions réalisées sur la plateforme.</p>
      </div>

      {/* Stats */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total actions', value: logs.length, color: '#053F5C', bg: '#EBF5FB' },
            { label: 'Créations', value: logs.filter((l) => l.action === 'CREATE').length, color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Suppressions', value: logs.filter((l) => l.action === 'DELETE').length, color: '#E11D48', bg: '#FFF1F2' },
            { label: 'Modifications', value: logs.filter((l) => l.action === 'UPDATE').length, color: '#D97706', bg: '#FFFBEB' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ padding: 16, borderRadius: 12, background: bg, border: `1.5px solid ${color}20` }}>
              <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B9AB8', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="#053F5C" />
            <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 14 }}>Journaux</span>
            <span className="badge badge-navy">{filtered.length}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Filter size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8' }} />
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
                style={{ padding: '7px 12px 7px 28px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#053F5C', background: '#fff', cursor: 'pointer', appearance: 'none' }}>
                <option value="ALL">Toutes les actions</option>
                {allActions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8' }} />
              <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '7px 12px 7px 28px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, width: 200, outline: 'none' }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 32, height: 32, margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <ScrollText size={40} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#053F5C', fontWeight: 700 }}>Aucun log trouvé</p>
          </div>
        ) : (
          <div>
            {filtered.map((log) => {
              const style = ACTION_COLORS[log.action] ?? { color: '#6B9AB8', bg: '#F0F4F8' };
              return (
                <div key={log.id} className="table-row" style={{ padding: '14px 24px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Icon */}
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Activity size={16} color={style.color} />
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: style.bg, color: style.color }}>
                        {log.action}
                      </span>
                      {log.ipAddress && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>IP: {log.ipAddress}</span>
                      )}
                    </div>
                    {log.details && (
                      <div style={{ fontSize: 12.5, color: '#6B9AB8', marginTop: 6, lineHeight: '1.5' }}>{log.details}</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6 }}>
                      {log.performedBy && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={11} color="#93B5C6" />
                          <span style={{ fontSize: 11, color: '#6B9AB8' }}>{log.performedBy}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} color="#93B5C6" />
                        <span style={{ fontSize: 11, color: '#93B5C6' }}>{formatDate(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
