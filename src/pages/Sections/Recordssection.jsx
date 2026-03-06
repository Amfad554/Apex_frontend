import { useState, useEffect } from 'react';
import { Plus, Search, X, Trash2, Eye, Loader, AlertCircle } from 'lucide-react';
import { ACCENT, BLUE, BLUE2 } from '../theme.js';
import { recordsAPI, staffAPI, patientsAPI } from '../../Services/api.js';

const TYPE_COLORS = {
  lab_results: { bg: 'rgba(6,182,212,0.15)', text: '#22d3ee', label: 'Lab Results' },
  consultation: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', label: 'Consultation' },
  imaging: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Imaging' },
  other: { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa', label: 'Other' },
};
const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const id = setTimeout(onClose, 4000); return () => clearTimeout(id); }, []);
  const colors = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
  };
  const c = colors[type] || colors.success;
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 12, padding: '14px 18px', minWidth: 280, maxWidth: 'calc(100vw - 40px)', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'flex-start', gap: 10, animation: 'toastIn 0.3s cubic-bezier(0.21,1.02,0.73,1) forwards' }}>
      <style>{`@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes btnPress { 0% { transform: scale(1); } 50% { transform: scale(0.94); } 100% { transform: scale(1); } }`}</style>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.6, padding: 0, display: 'flex' }}><X size={15} /></button>
    </div>
  );
}

export default function RecordsSection({ isDark, t, hospital, isMobile }) {
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [viewRec, setViewRec] = useState(null);
  const [submitting, setSubmit] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    patientId: '', doctorId: '', recordType: 'lab_results',
    title: '', diagnosis: '', findings: '', notes: '',
  });

  const hospitalId = hospital?.id;
  const showToast = (message, type = 'success') => setToast({ message, type });

  const modalOverlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300,
    overflowY: 'auto', padding: isMobile ? '12px' : '40px 20px',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  };
  const modalBox = (maxW = 500) => ({
    background: t.card, borderRadius: 20, width: '100%', maxWidth: maxW,
    border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
    flexShrink: 0, marginTop: isMobile ? 16 : 40,
  });

  const load = async () => {
    if (!hospitalId) return;
    try {
      setLoading(true); setError('');
      const params = filter !== 'All' ? { recordType: filter } : {};
      const [recRes, staffRes, patientsRes] = await Promise.all([
        recordsAPI.list(hospitalId, params),
        staffAPI.list(hospitalId, { role: 'doctor' }),
        patientsAPI.list(hospitalId),
      ]);
      setRecords(recRes.records || []);
      setDoctors(staffRes.staff || []);
      setPatients(patientsRes.patients || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [hospitalId, filter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.title) {
      setFormError('Patient, doctor and title are required.'); return;
    }
    try {
      setSubmit(true); setFormError('');
      await recordsAPI.create(form);
      setShowAdd(false);
      setForm({ patientId: '', doctorId: '', recordType: 'lab_results', title: '', diagnosis: '', findings: '', notes: '' });
      showToast('Medical record saved!');
      load();
    } catch (err) { setFormError(err.message); }
    finally { setSubmit(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    try {
      await recordsAPI.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      showToast('Record deleted.');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const filtered = records.filter(r =>
    r.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.title?.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = { width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 6 };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Medical Records</h1>
          <p style={{ color: t.textSub, fontSize: 13 }}>{records.length} records on file</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '9px 14px' : '10px 20px', background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: isMobile ? 13 : 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(59,91,219,0.35)', flexShrink: 0, transition: 'transform 0.15s ease, box-shadow 0.15s ease' }} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.03)';e.currentTarget.style.boxShadow='0 8px 24px rgba(59,91,219,0.55)';}} onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 16px rgba(59,91,219,0.35)';}} onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.03)';}}>
          <Plus size={16} /> {isMobile ? 'Add' : 'Add Record'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.card, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}` }}>
          <Search size={15} color={t.textMuted} />
          <input placeholder="Search by patient or title..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted }}><X size={14} /></button>}
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {['All', ...Object.keys(TYPE_COLORS)].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: '7px 12px', borderRadius: 10, border: `1px solid ${filter === s ? BLUE : t.border}`, background: filter === s ? 'rgba(59,91,219,0.15)' : t.card, color: filter === s ? '#60a5fa' : t.textSub, fontWeight: filter === s ? 600 : 400, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s ease' }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=>e.currentTarget.style.transform=''} onMouseDown={e=>e.currentTarget.style.transform='scale(0.93)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1.05)'}>
              {s === 'All' ? 'All' : TYPE_COLORS[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading records...
        </div>
      ) : error ? (
        <div style={{ padding: 30, textAlign: 'center', color: ACCENT.red, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <AlertCircle size={18} />{error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: t.textMuted, fontSize: 14, background: t.card, borderRadius: 18, border: `1px solid ${t.border}` }}>No records found</div>
          ) : filtered.map((r, i) => {
            const tc = TYPE_COLORS[r.recordType] || TYPE_COLORS.other;
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const avatar = r.patient?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={r.id} style={{ background: t.card, borderRadius: 16, padding: 16, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ background: tc.bg, color: tc.text, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8 }}>{tc.label}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setViewRec(r)} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(59,130,246,0.1)', border: 'none', cursor: 'pointer', color: ACCENT.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s ease, background 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(59,130,246,0.22)';e.currentTarget.style.transform='scale(1.12)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(59,130,246,0.1)';e.currentTarget.style.transform='';}} onMouseDown={e=>e.currentTarget.style.transform='scale(0.9)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1.12)'}><Eye size={13} /></button>
                    <button onClick={() => handleDelete(r.id)} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', color: ACCENT.red, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s ease, background 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.2)';e.currentTarget.style.transform='scale(1.12)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.08)';e.currentTarget.style.transform='';}} onMouseDown={e=>e.currentTarget.style.transform='scale(0.9)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1.12)'}><Trash2 size={13} /></button>
                  </div>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{r.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: color + '22', color, fontWeight: 700, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{avatar}</div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600 }}>{r.patient?.fullName}</p>
                    <p style={{ fontSize: 10, color: t.textMuted }}>{r.patient?.patientNumber}</p>
                  </div>
                </div>
                {r.notes && <p style={{ fontSize: 12, color: t.textSub, marginBottom: 10, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.notes}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: 11, color: t.textMuted }}>{r.doctor?.fullName}</span>
                  <span style={{ fontSize: 11, color: t.textMuted }}>{new Date(r.recordDate).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Record Modal */}
      {showAdd && (
        <div onClick={e => e.target === e.currentTarget && setShowAdd(false)} style={modalOverlay}>
          <div style={modalBox(500)}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 16 }}>Add Medical Record</h2>
                <p style={{ fontSize: 12, color: t.textSub, marginTop: 2 }}>Create a new patient medical record</p>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.15s ease, background 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.2)';e.currentTarget.style.transform='scale(1.1) rotate(90deg)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.1)';e.currentTarget.style.transform='';}} onMouseDown={e=>e.currentTarget.style.transform='scale(0.9)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1.1) rotate(90deg)'}><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ padding: '20px' }}>
              {formError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 13 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Patient *</label>
                  <select required style={inputStyle} value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                    <option value="">Select patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} — {p.patientNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Doctor *</label>
                  <select required style={inputStyle} value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
                    <option value="">Select doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}{d.specialty ? ` — ${d.specialty}` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Record Type *</label>
                  <select required style={inputStyle} value={form.recordType} onChange={e => setForm({ ...form, recordType: e.target.value })}>
                    {Object.entries(TYPE_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Title *</label>
                  <input required style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Full Blood Count" />
                </div>
                <div>
                  <label style={labelStyle}>Diagnosis</label>
                  <input style={inputStyle} value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} placeholder="e.g. Malaria" />
                </div>
                <div>
                  <label style={labelStyle}>Findings</label>
                  <input style={inputStyle} value={form.findings} onChange={e => setForm({ ...form, findings: e.target.value })} placeholder="Key findings" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Notes / Additional Info</label>
                  <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Clinical notes..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '11px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.textSub, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, transition: 'all 0.15s ease' }} onMouseEnter={e=>{e.currentTarget.style.background=t.hover;e.currentTarget.style.transform='scale(1.02)';}} onMouseLeave={e=>{e.currentTarget.style.transform='';}} onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1.02)'}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '11px', background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, opacity: submitting ? 0.7 : 1, transition: 'transform 0.15s ease, box-shadow 0.15s ease' }} onMouseEnter={e=>{ if(!e.currentTarget.disabled){e.currentTarget.style.transform='translateY(-1px) scale(1.02)';e.currentTarget.style.boxShadow='0 6px 20px rgba(59,91,219,0.45)';} }} onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}} onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'} onMouseUp={e=>e.currentTarget.style.transform='translateY(-1px) scale(1.02)'}>
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Record Modal */}
      {viewRec && (
        <div onClick={e => e.target === e.currentTarget && setViewRec(null)} style={modalOverlay}>
          <div style={modalBox(440)}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 700, fontSize: 15 }}>{viewRec.title}</h2>
              <button onClick={() => setViewRec(null)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.15s ease, background 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.2)';e.currentTarget.style.transform='scale(1.1) rotate(90deg)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.1)';e.currentTarget.style.transform='';}} onMouseDown={e=>e.currentTarget.style.transform='scale(0.9)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1.1) rotate(90deg)'}><X size={16} /></button>
            </div>
            <div style={{ padding: 20 }}>
              {(() => { const tc = TYPE_COLORS[viewRec.recordType] || TYPE_COLORS.other; return <span style={{ background: tc.bg, color: tc.text, fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8, display: 'inline-block', marginBottom: 14 }}>{tc.label}</span>; })()}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Patient', value: viewRec.patient?.fullName },
                  { label: 'Patient No', value: viewRec.patient?.patientNumber },
                  { label: 'Doctor', value: viewRec.doctor?.fullName },
                  { label: 'Date', value: new Date(viewRec.recordDate).toLocaleDateString() },
                  { label: 'Diagnosis', value: viewRec.diagnosis || '—' },
                  { label: 'Findings', value: viewRec.findings || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: t.cardAlt, borderRadius: 10, padding: '11px 13px', border: `1px solid ${t.border}` }}>
                    <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 3 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{value}</p>
                  </div>
                ))}
              </div>
              {viewRec.notes && (
                <div style={{ background: t.cardAlt, borderRadius: 10, padding: 14, border: `1px solid ${t.border}` }}>
                  <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 6 }}>NOTES</p>
                  <p style={{ fontSize: 13, lineHeight: 1.6 }}>{viewRec.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}