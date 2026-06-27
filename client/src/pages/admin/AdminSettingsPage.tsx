import { useState } from 'react';
import { Settings, BookMarked, Users, ClipboardList } from 'lucide-react';
import AdminModulesPage from './AdminModulesPage';
import AdminGroupsPage from './AdminGroupsPage';
import AdminAssignmentsPage from './AdminAssignmentsPage';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'modules' | 'groups' | 'assignments'>('modules');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <div>
        <h1 className="page-title font-display">Paramétrage du système</h1>
        <p className="page-sub">Configuration globale : modules, groupes et affectations.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F0F4F8', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('modules')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 9,
            background: activeTab === 'modules' ? '#fff' : 'transparent',
            border: activeTab === 'modules' ? '1px solid #DDE8F0' : 'none',
            boxShadow: activeTab === 'modules' ? '0 1px 4px rgba(5,63,92,0.08)' : 'none',
            color: activeTab === 'modules' ? '#053F5C' : '#6B9AB8',
            fontWeight: activeTab === 'modules' ? 800 : 600,
            fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          <BookMarked size={15} /> Modules
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 9,
            background: activeTab === 'groups' ? '#fff' : 'transparent',
            border: activeTab === 'groups' ? '1px solid #DDE8F0' : 'none',
            boxShadow: activeTab === 'groups' ? '0 1px 4px rgba(5,63,92,0.08)' : 'none',
            color: activeTab === 'groups' ? '#053F5C' : '#6B9AB8',
            fontWeight: activeTab === 'groups' ? 800 : 600,
            fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          <Users size={15} /> Groupes
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 9,
            background: activeTab === 'assignments' ? '#fff' : 'transparent',
            border: activeTab === 'assignments' ? '1px solid #DDE8F0' : 'none',
            boxShadow: activeTab === 'assignments' ? '0 1px 4px rgba(5,63,92,0.08)' : 'none',
            color: activeTab === 'assignments' ? '#053F5C' : '#6B9AB8',
            fontWeight: activeTab === 'assignments' ? 800 : 600,
            fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          <ClipboardList size={15} /> Affectations
        </button>
      </div>

      <div style={{ marginTop: -8 }}>
        {activeTab === 'modules' && <AdminModulesPage hideTitle />}
        {activeTab === 'groups' && <AdminGroupsPage hideTitle />}
        {activeTab === 'assignments' && <AdminAssignmentsPage hideTitle />}
      </div>
    </div>
  );
}
