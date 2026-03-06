import { useState, useEffect } from 'react';
import { Plus, Search, X, Pill, CheckCircle2, Clock, Trash2, Loader, AlertCircle } from 'lucide-react';
import { ACCENT, BLUE, BLUE2 } from '../theme.js';
import { prescriptionsAPI, staffAPI, patientsAPI } from '../../Services/api.js';

const STATUS_COLORS = {
  active: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
  completed: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
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
      <style>{`@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.6, padding: 0, display: 'flex' }}><X size={15} /></button>
    </div>
  );
}

export default function Pharmacy({ isDark, t, hospital, isMobile }) {
  const [prescriptions, setRx] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ patientId: '', doctorId: '', medication: '', dosage: '', duration: '', instructions: '' });

  const hospitalId = hospital?.id;
  const showToast = (message, type = 'success') => setToast({ message, type });

  const load = async () => {
    if (!hospitalId) return;
    try {
      setLoading(true); setError('');
      const params = filter !== 'All' ? { status: filter.toLowerCase() } : {};
      const [rxRes, staffRes, patientsRes] = await Promise.all([
        prescriptionsAPI.list(hospitalId, params),
        staffAPI.list(hospitalId, { role: 'doctor' }),
        patientsAPI.list(hospitalId),
      ]);
      setRx(rxRes.prescriptions || []);
      setDoctors(staffRes.staff || []);
      setPatients(patientsRes.patients || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [hospitalId, filter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.medication || !form.dosage) {
      setFormError('Patient, doctor, medication and dosage are required.'); return;
    }
    try {
      setSubmitting(true); setFormError('');
      await prescriptionsAPI.create(form);
      setShowAdd(false);
      setForm({ patientId: '', doctorId: '', medication: '', dosage: '', duration: '', instructions: '' });
      showToast('Prescription issued!');
      load();
    } catch (err) { setFormError(err.message); }
    finally { setSubmitting(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await prescriptionsAPI.updateStatus(id, status);
      setRx(prev => prev.map(rx => rx.id === id ? { ...rx, status } : rx));
      showToast(`Prescription marked as ${status}.`);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this prescription?')) return;
    try {
      await prescriptionsAPI.delete(id);
      setRx(prev => prev.filter(rx => rx.id !== id));
      showToast('Prescription deleted.');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const filtered = prescriptions.filter(rx => {
    const matchSearch =
      rx.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      rx.medication?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'All' || rx.status === filter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const counts = { active: 0, completed: 0, cancelled: 0 };
  prescriptions.forEach(rx => { if (counts[rx.status] !== undefined) counts[rx.status]++; });

  const inputStyle = { width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 6 };
  const modalOverlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300,
    overflowY: 'auto', padding: isMobile ? '12px' : '40px 20px',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Pharmacy</h1>
          <p style={{ color: t.textSub, fontSize: 13 }}>Manage prescriptions and medication dispensing</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '9px 14px' : '10px 20px', background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: isMobile ? 13 : 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(59,91,219,0.35)', flexShrink: 0 }}>
          <Plus size={16} /> {isMobile ? 'Add' : 'Add Prescription'}
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 10 : 16, marginBottom: 24 }}>
        {[
          { label: 'Active', count: counts.active, color: ACCENT.green, icon: Pill },
          { label: 'Completed', count: counts.completed, color: ACCENT.blue, icon: CheckCircle2 },
          { label: 'Cancelled', count: counts.cancelled, color: ACCENT.red, icon: Clock },
        ].map(({ label, count, color, icon: Icon }) => (
          <div key={label} style={{ background: t.card, borderRadius: 14, padding: isMobile ? '12px 10px' : '18px 20px', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14 }}>
            <div style={{ width: isMobile ? 32 : 42, height: isMobile ? 32 : 42, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={isMobile ? 15 : 20} color={color} />
            </div>
            <div>
              <p style={{ fontSize: isMobile ? 18 : 26, fontWeight: 800, lineHeight: 1 }}>{count}</p>
              <p style={{ fontSize: isMobile ? 10 : 12, color: t.textSub, marginTop: 3 }}>{isMobile ? label : `${label} Prescriptions`}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.card, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, flex: 1 }}>
          <Search size={15} color={t.textMuted} />
          <input placeholder="Search by patient or drug..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: isMobile ? 2 : 0 }}>
          {['All', 'Active', 'Completed', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${filter === s ? BLUE : t.border}`, background: filter === s ? 'rgba(59,91,219,0.15)' : t.card, color: filter === s ? '#60a5fa' : t.textSub, fontWeight: filter === s ? 600 : 400, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', flexShrink: 0 }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Mobile: cards; Desktop: table */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              Loading...
            </div>
          ) : error ? (
            <div style={{ padding: 20, textAlign: 'center', color: ACCENT.red, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: t.card, borderRadius: 14, border: `1px solid ${t.border}` }}>
              <AlertCircle size={18} />{error}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, background: t.card, borderRadius: 14, border: `1px solid ${t.border}` }}>No prescriptions found</div>
          ) : filtered.map((rx, i) => {
            const sc = STATUS_COLORS[rx.status] || STATUS_COLORS.active;
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const avatar = rx.patient?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={rx.id} style={{ background: t.card, borderRadius: 14, padding: '14px 16px', border: `1px solid ${t.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: color + '22', color, fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{avatar}</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{rx.patient?.fullName}</p>
                      <p style={{ fontSize: 11, color: t.textMuted }}>{rx.doctor?.fullName}</p>
                    </div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.text, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, textTransform: 'capitalize', flexShrink: 0 }}>{rx.status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Pill size={13} color={ACCENT.violet} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{rx.medication}</span>
                </div>
                <p style={{ fontSize: 12, color: t.textSub, marginBottom: 10 }}>{rx.dosage}{rx.duration ? ` · ${rx.duration}` : ''}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {rx.status === 'active' && (
                    <button onClick={() => updateStatus(rx.id, 'completed')} style={{ flex: 1, padding: '7px', background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 8, color: ACCENT.blue, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Dispense</button>
                  )}
                  <button onClick={() => handleDelete(rx.id)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', color: ACCENT.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, boxShadow: t.shadow, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              Loading...
            </div>
          ) : error ? (
            <div style={{ padding: 30, textAlign: 'center', color: ACCENT.red, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <AlertCircle size={18} />{error}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: t.cardAlt }}>
                  {['Patient', 'Drug', 'Dosage', 'Duration', 'Doctor', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: t.textMuted, fontSize: 14 }}>No prescriptions found</td></tr>
                ) : filtered.map((rx, i) => {
                  const sc = STATUS_COLORS[rx.status] || STATUS_COLORS.active;
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const avatar = rx.patient?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={rx.id} style={{ borderBottom: `1px solid ${t.border}`, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = t.hover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: color + '22', color, fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{avatar}</div>
                          <p style={{ fontWeight: 600, fontSize: 13 }}>{rx.patient?.fullName}</p>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Pill size={13} color={ACCENT.violet} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{rx.medication}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 12, color: t.textSub }}>{rx.dosage}</td>
                      <td style={{ padding: '14px 18px', fontSize: 12, color: t.textSub, whiteSpace: 'nowrap' }}>{rx.duration || '—'}</td>
                      <td style={{ padding: '14px 18px', fontSize: 12, color: t.textSub }}>{rx.doctor?.fullName}</td>
                      <td style={{ padding: '14px 18px', fontSize: 12, color: t.textMuted, whiteSpace: 'nowrap' }}>{new Date(rx.prescribedDate).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, textTransform: 'capitalize' }}>{rx.status}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {rx.status === 'active' && (
                            <button onClick={() => updateStatus(rx.id, 'completed')} style={{ padding: '4px 10px', background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 7, color: ACCENT.blue, fontWeight: 600, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Dispense</button>
                          )}
                          <button onClick={() => handleDelete(rx.id)} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', color: ACCENT.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Prescription Modal */}
      {showAdd && (
        <div onClick={e => e.target === e.currentTarget && setShowAdd(false)} style={modalOverlay}>
          <div style={{
            background: t.card, borderRadius: 20, width: '100%', maxWidth: 500,
            border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            flexShrink: 0, marginTop: isMobile ? 16 : 40,
          }}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 16 }}>Add Prescription</h2>
                <p style={{ fontSize: 12, color: t.textSub, marginTop: 2 }}>Issue a new prescription for a patient</p>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ padding: '20px' }}>
              {formError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Patient *</label>
                  <select required style={inputStyle} value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                    <option value="">Select patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} — {p.patientNumber}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Prescribing Doctor *</label>
                  <select required style={inputStyle} value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
                    <option value="">Select doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}{d.specialty ? ` — ${d.specialty}` : ''}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Drug Name & Strength *</label>
                  <input required style={inputStyle} value={form.medication} onChange={e => setForm({ ...form, medication: e.target.value })} placeholder="e.g. Amoxicillin 500mg" />
                </div>
                <div>
                  <label style={labelStyle}>Dosage Instructions *</label>
                  <input required style={inputStyle} value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} placeholder="e.g. 1 tablet 3x daily" />
                </div>
                <div>
                  <label style={labelStyle}>Duration</label>
                  <input style={inputStyle} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 7 days" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Instructions / Notes</label>
                  <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} placeholder="Take after meals..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '11px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.textSub, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '11px', background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Issuing...' : 'Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}