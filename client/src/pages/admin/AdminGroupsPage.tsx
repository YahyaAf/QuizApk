import { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, AlertCircle, X, Save, Users } from 'lucide-react';
import { adminGroupService } from '../../services/adminService';
import toast from 'react-hot-toast';

interface Group { id: number; name: string; description?: string; }
interface GroupForm { name: string; description: string; }

export default function AdminGroupsPage({ hideTitle }: { hideTitle?: boolean } = {}) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Group | null>(null);
  const [form, setForm] = useState<GroupForm>({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminGroupService.getAll()
      .then(setGroups)
      .catch(() => toast.error('Erreur chargement des groupes'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditItem(null); setForm({ name: '', description: '' }); setShowModal(true); };
  const openEdit = (g: Group) => { setEditItem(g); setForm({ name: g.name, description: g.description ?? '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Le nom est requis'); return; }
    setSaving(true);
    try {
      if (editItem) {
        const updated = await adminGroupService.update(editItem.id, form.name, form.description || undefined);
        setGroups((prev) => prev.map((g) => g.id === editItem.id ? updated : g));
        toast.success('Groupe mis à jour');
      } else {
        const created = await adminGroupService.create(form.name, form.description || undefined);
        setGroups((prev) => [...prev, created]);
        toast.success('Groupe créé');
      }
      setShowModal(false);
    } catch { toast.error('Erreur sauvegarde'); }
    setSaving(false);
  };

  const handleDelete = async (g: Group) => {
    if (!confirm(`Supprimer le groupe "${g.name}" ?`)) return;
    setActionId(g.id);
    try {
      await adminGroupService.delete(g.id);
      setGroups((prev) => prev.filter((x) => x.id !== g.id));
      toast.success('Groupe supprimé');
    } catch { toast.error('Erreur suppression'); }
    setActionId(null);
  };

  return (
    <div className={!hideTitle ? "animate-fade-in" : ""} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {!hideTitle ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title font-display">Groupes d'étudiants</h1>
            <p className="page-sub">Gérer les groupes et classes de la plateforme.</p>
          </div>
          <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Nouveau groupe
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -8 }}>
          <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Nouveau groupe
          </button>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', gap: 10 }}>
          <GraduationCap size={16} color="#053F5C" />
          <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 14 }}>Groupes</span>
          <span className="badge badge-navy">{groups.length}</span>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 32, height: 32, margin: '0 auto' }} /></div>
        ) : groups.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Users size={40} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#053F5C', fontWeight: 700 }}>Aucun groupe créé</p>
            <button onClick={openCreate} className="btn btn-primary" style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Plus size={14} /> Créer le premier groupe
            </button>
          </div>
        ) : (
          <>
            <div style={{ padding: '10px 24px', background: '#F8FAFC', borderBottom: '1px solid #EBF2F8', display: 'grid', gridTemplateColumns: '1fr 2fr 120px', gap: 12 }}>
              {['Nom', 'Description', 'Actions'].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B9AB8' }}>{h}</span>
              ))}
            </div>
            {groups.map((g) => (
              <div key={g.id} className="table-row" style={{ padding: '14px 24px', display: 'grid', gridTemplateColumns: '1fr 2fr 120px', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EBF5FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <GraduationCap size={18} color="#429EBD" />
                  </div>
                  <span style={{ fontWeight: 700, color: '#053F5C', fontSize: 13 }}>{g.name}</span>
                </div>
                <span style={{ color: '#6B9AB8', fontSize: 13 }}>{g.description || <em style={{ color: '#C3D9E8' }}>Sans description</em>}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(g)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#429EBD' }}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(g)} disabled={actionId === g.id} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #FECDD3', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,63,92,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: 420, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontWeight: 900, color: '#053F5C', fontSize: 17 }}>{editItem ? 'Modifier le groupe' : 'Nouveau groupe'}</span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B9AB8' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Nom *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Groupe A1..." style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description optionnelle..." style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, color: '#6B9AB8' }}>Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
