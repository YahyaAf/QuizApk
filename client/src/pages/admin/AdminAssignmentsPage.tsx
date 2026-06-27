import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Edit2, Trash2, X, Save, ChevronDown, AlertCircle } from 'lucide-react';
import { adminAssignmentService, adminGroupService, adminModuleService } from '../../services/adminService';
import { userService } from '../../services/dashboardService';
import toast from 'react-hot-toast';

interface Assignment { id: number; teacher?: { id: number; firstName: string; lastName: string }; module?: { id: number; name: string }; studentGroup?: { id: number; name: string }; }
interface Option { id: number; label: string; }
interface AssignForm { teacherId: number; moduleId: number; groupId: number; }

export default function AdminAssignmentsPage({ hideTitle }: { hideTitle?: boolean } = {}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [modules, setModules] = useState<Option[]>([]);
  const [groups, setGroups] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Assignment | null>(null);
  const [form, setForm] = useState<AssignForm>({ teacherId: 0, moduleId: 0, groupId: 0 });
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      adminAssignmentService.getAll(),
      userService.getAllUsers(0, 200),
      adminModuleService.getAll(),
      adminGroupService.getAll(),
    ]).then(([a, u, m, g]) => {
      setAssignments(a ?? []);
      const userList = u?.content ?? (Array.isArray(u) ? u : []);
      setTeachers(
        userList
          .filter((x: { role: string }) => x.role === 'ROLE_TEACHER')
          .map((x: { id: number; firstName: string; lastName: string }) => ({ id: x.id, label: `${x.firstName} ${x.lastName}` }))
      );
      setModules((m ?? []).map((x: { id: number; name: string }) => ({ id: x.id, label: x.name })));
      setGroups((g ?? []).map((x: { id: number; name: string }) => ({ id: x.id, label: x.name })));
    }).catch(() => toast.error('Erreur chargement des données'))
      .finally(() => setLoading(false));
  }, []);

  const defaultForm = (): AssignForm => ({
    teacherId: teachers[0]?.id ?? 0,
    moduleId: modules[0]?.id ?? 0,
    groupId: groups[0]?.id ?? 0,
  });

  const openCreate = () => { setEditItem(null); setForm(defaultForm()); setShowModal(true); };
  const openEdit = (a: Assignment) => {
    setEditItem(a);
    setForm({ teacherId: a.teacher?.id ?? 0, moduleId: a.module?.id ?? 0, groupId: a.studentGroup?.id ?? 0 });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.teacherId || !form.moduleId || !form.groupId) { toast.error('Tous les champs sont requis'); return; }
    setSaving(true);
    try {
      if (editItem) {
        const updated = await adminAssignmentService.update(editItem.id, form.teacherId, form.moduleId, form.groupId);
        setAssignments((prev) => prev.map((a) => a.id === editItem.id ? updated : a));
        toast.success('Affectation mise à jour');
      } else {
        const created = await adminAssignmentService.create(form.teacherId, form.moduleId, form.groupId);
        setAssignments((prev) => [...prev, created]);
        toast.success('Affectation créée');
      }
      setShowModal(false);
    } catch { toast.error('Erreur sauvegarde'); }
    setSaving(false);
  };

  const handleDelete = async (a: Assignment) => {
    if (!confirm('Supprimer cette affectation ?')) return;
    setActionId(a.id);
    try {
      await adminAssignmentService.delete(a.id);
      setAssignments((prev) => prev.filter((x) => x.id !== a.id));
      toast.success('Affectation supprimée');
    } catch { toast.error('Erreur suppression'); }
    setActionId(null);
  };

  const SelectField = ({ label, value, onChange, options }: { label: string; value: number; onChange: (v: number) => void; options: Option[] }) => (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B9AB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label} *</label>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: '100%', padding: '9px 28px 9px 12px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#053F5C', background: '#fff', cursor: 'pointer', appearance: 'none', boxSizing: 'border-box' }}>
          <option value={0}>Sélectionner...</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <ChevronDown size={13} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: '#6B9AB8', pointerEvents: 'none' }} />
      </div>
    </div>
  );

  return (
    <div className={!hideTitle ? "animate-fade-in" : ""} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {!hideTitle ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title font-display">Affectations</h1>
            <p className="page-sub">Affecter les enseignants aux modules et groupes.</p>
          </div>
          <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={16} /> Nouvelle affectation</button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -8 }}>
          <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={16} /> Nouvelle affectation</button>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #EBF2F8', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClipboardList size={16} color="#053F5C" />
          <span style={{ fontWeight: 800, color: '#053F5C', fontSize: 14 }}>Affectations</span>
          <span className="badge badge-navy">{assignments.length}</span>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ borderColor: 'rgba(5,63,92,0.2)', borderTopColor: '#053F5C', width: 32, height: 32, margin: '0 auto' }} /></div>
        ) : assignments.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <AlertCircle size={40} color="#C3D9E8" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#053F5C', fontWeight: 700 }}>Aucune affectation</p>
            <button onClick={openCreate} className="btn btn-primary" style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}><Plus size={14} /> Créer une affectation</button>
          </div>
        ) : (
          <>
            <div style={{ padding: '10px 24px', background: '#F8FAFC', borderBottom: '1px solid #EBF2F8', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', gap: 12 }}>
              {['Enseignant', 'Module', 'Groupe', 'Actions'].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B9AB8' }}>{h}</span>
              ))}
            </div>
            {assignments.map((a) => (
              <div key={a.id} className="table-row" style={{ padding: '14px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', gap: 12, alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#053F5C', fontSize: 13 }}>{a.teacher ? `${a.teacher.firstName} ${a.teacher.lastName}` : `#${a.id}`}</span>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{a.module?.name ?? '—'}</span>
                <span style={{ fontSize: 13, color: '#374151' }}>{a.studentGroup?.name ?? '—'}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(a)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#429EBD' }}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(a)} disabled={actionId === a.id} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #FECDD3', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,63,92,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: 440, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontWeight: 900, color: '#053F5C', fontSize: 17 }}>{editItem ? 'Modifier l\'affectation' : 'Nouvelle affectation'}</span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B9AB8' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SelectField label="Enseignant" value={form.teacherId} onChange={(v) => setForm((f) => ({ ...f, teacherId: v }))} options={teachers} />
              <SelectField label="Module" value={form.moduleId} onChange={(v) => setForm((f) => ({ ...f, moduleId: v }))} options={modules} />
              <SelectField label="Groupe" value={form.groupId} onChange={(v) => setForm((f) => ({ ...f, groupId: v }))} options={groups} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid #DDE8F0', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, color: '#6B9AB8' }}>Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Save size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
