import { useState, useEffect } from 'react';
import { UserPlus, Search, X, Eye, Trash2, Phone, Mail, MapPin, Droplets, Loader, AlertCircle } from 'lucide-react';
import { ACCENT, BLUE, BLUE2 } from '../theme.js';
import { patientsAPI } from '../../Services/api.js';

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#7c3aed', '#059669'];

// ── Inline Toast ──────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const id = setTimeout(onClose, 4000); return () => clearTimeout(id); }, []);
  const colors = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
  };
  const c = colors[type] || colors.success;
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 12, padding: '14px 18px', minWidth: 280, maxWidth: 420, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'flex-start', gap: 10, animation: 'toastIn 0.3s cubic-bezier(0.21,1.02,0.73,1) forwards' }}>
      <style>{`@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.6, padding: 0, display: 'flex' }}><X size={15} /></button>
    </div>
  );
}

export default function Patients({ isDark, t, hospital }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [showRegister, setShowReg] = useState(false);
    const [viewPatient, setViewPatient] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({
        fullName: '', dateOfBirth: '', gender: 'male', phone: '', email: '',
        address: '', bloodGroup: 'O+', medicalConditions: '',
        nextOfKinName: '', nextOfKinPhone: '',
    });

    const hospitalId = hospital?.id;
    const showToast = (message, type = 'success') => setToast({ message, type });

    const loadPatients = async (q = '') => {
        if (!hospitalId) return;
        try {
            setLoading(true); setError('');
            const params = q ? { search: q } : {};
            const res = await patientsAPI.list(hospitalId, params);
            setPatients(res.patients || []);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadPatients(); }, [hospitalId]);
    useEffect(() => { const t = setTimeout(() => loadPatients(search), 400); return () => clearTimeout(t); }, [search]);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.phone || !form.address || !form.dateOfBirth) {
            setFormError('Please fill all required fields.'); return;
        }
        try {
            setSubmitting(true); setFormError('');
            await patientsAPI.create(form);
            setShowReg(false);
            setForm({ fullName: '', dateOfBirth: '', gender: 'male', phone: '', email: '', address: '', bloodGroup: 'O+', medicalConditions: '', nextOfKinName: '', nextOfKinPhone: '' });
            showToast('Patient registered successfully!');
            loadPatients();
        } catch (err) { setFormError(err.message); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this patient? This cannot be undone.')) return;
        try {
            await patientsAPI.delete(id);
            setPatients(prev => prev.filter(p => p.id !== id));
            showToast('Patient deleted.');
        } catch (err) { showToast(err.message, 'error'); }
    };

    const inputStyle = { width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit' };
    const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 6 };

    return (
        <div>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Patients</h1>
                    <p style={{ color: t.textSub, fontSize: 14 }}>{patients.length} patients registered</p>
                </div>
                <button onClick={() => setShowReg(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(59,91,219,0.35)' }}>
                    <UserPlus size={17} /> Register Patient
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.card, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, marginBottom: 20 }}>
                <Search size={15} color={t.textMuted} />
                <input placeholder="Search by name or patient number..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted }}><X size={14} /></button>}
            </div>

            <div style={{ background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, boxShadow: t.shadow, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        Loading patients...
                    </div>
                ) : error ? (
                    <div style={{ padding: 30, textAlign: 'center', color: ACCENT.red, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: t.cardAlt }}>
                                {['Patient', 'Patient No.', 'Gender', 'Blood', 'Phone', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: t.textMuted, fontSize: 14 }}>No patients found</td></tr>
                            ) : patients.map((p, i) => {
                                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                const avatar = p.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                return (
                                    <tr key={p.id} style={{ borderBottom: `1px solid ${t.border}`, transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = t.hover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: 10, background: color + '22', color, fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{avatar}</div>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: 13 }}>{p.fullName}</p>
                                                    <p style={{ fontSize: 11, color: t.textMuted, textTransform: 'capitalize' }}>{p.gender}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 18px', fontSize: 13, color: t.textSub }}>{p.patientNumber}</td>
                                        <td style={{ padding: '14px 18px', fontSize: 13, color: t.textSub, textTransform: 'capitalize' }}>{p.gender}</td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: ACCENT.red }}>
                                                <Droplets size={13} />{p.bloodGroup || '—'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 18px', fontSize: 13, color: t.textSub }}>{p.phone}</td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => setViewPatient(p)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: 'none', cursor: 'pointer', color: ACCENT.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={14} /></button>
                                                <button onClick={() => handleDelete(p.id)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: ACCENT.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Register Modal */}
            {showRegister && (
                <div onClick={e => e.target === e.currentTarget && setShowReg(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, overflowY: 'auto', padding: '20px' }}>
                    <div style={{ background: t.card, borderRadius: 20, width: '100%', maxWidth: 560, margin: '0 auto', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontWeight: 700, fontSize: 17 }}>Register New Patient</h2>
                                <p style={{ fontSize: 12, color: t.textSub, marginTop: 2 }}>Fill in the patient details below</p>
                            </div>
                            <button onClick={() => setShowReg(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleRegister} style={{ padding: '24px' }}>
                            {formError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Full Name *</label><input required style={inputStyle} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Amara Okafor" /></div>
                                <div><label style={labelStyle}>Date of Birth *</label><input type="date" required style={inputStyle} value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
                                <div><label style={labelStyle}>Gender *</label>
                                    <select style={inputStyle} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                        <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                                    </select>
                                </div>
                                <div><label style={labelStyle}>Phone *</label><input required style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0801-234-5678" /></div>
                                <div><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="patient@email.com" /></div>
                                <div><label style={labelStyle}>Blood Group</label>
                                    <select style={inputStyle} value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                                        
                                    </select>
                                </div>
                                <div><label style={labelStyle}>Medical Conditions</label><input style={inputStyle} value={form.medicalConditions} onChange={e => setForm({ ...form, medicalConditions: e.target.value })} placeholder="e.g. Hypertension, Diabetes" /></div>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Address *</label><input required style={inputStyle} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Patient's home address" /></div>
                                <div><label style={labelStyle}>Next of Kin Name</label><input style={inputStyle} value={form.nextOfKinName} onChange={e => setForm({ ...form, nextOfKinName: e.target.value })} /></div>
                                <div><label style={labelStyle}>Next of Kin Phone</label><input style={inputStyle} value={form.nextOfKinPhone} onChange={e => setForm({ ...form, nextOfKinPhone: e.target.value })} /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                <button type="button" onClick={() => setShowReg(false)} style={{ flex: 1, padding: '11px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.textSub, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '11px', background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, opacity: submitting ? 0.7 : 1 }}>
                                    {submitting ? 'Registering...' : 'Register Patient'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Patient Modal */}
            {viewPatient && (
                <div onClick={e => e.target === e.currentTarget && setViewPatient(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, overflowY: 'auto', padding: '20px' }}>
                    <div style={{ background: t.card, borderRadius: 20, width: '100%', maxWidth: 480, margin: '0 auto', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                        <div style={{ padding: 24, background: ACCENT.blue + '18', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 56, height: 56, borderRadius: 16, background: ACCENT.blue + '33', color: ACCENT.blue, fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {viewPatient.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 style={{ fontWeight: 700, fontSize: 18 }}>{viewPatient.fullName}</h2>
                                    <p style={{ fontSize: 13, color: t.textSub }}>{viewPatient.patientNumber}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewPatient(null)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    { label: 'Phone', value: viewPatient.phone },
                                    { label: 'Email', value: viewPatient.email || '—' },
                                    { label: 'Gender', value: viewPatient.gender },
                                    { label: 'Blood Group', value: viewPatient.bloodGroup || '—' },
                                    { label: 'Date of Birth', value: new Date(viewPatient.dateOfBirth).toLocaleDateString() },
                                    { label: 'Next of Kin', value: viewPatient.nextOfKinName || '—' },
                                    { label: 'Kin Phone', value: viewPatient.nextOfKinPhone || '—' },
                                    { label: 'Conditions', value: viewPatient.medicalConditions || '—' },
                                    { label: 'Address', value: viewPatient.address, full: true },
                                ].map(({ label, value, full }) => (
                                    <div key={label} style={{ gridColumn: full ? '1/-1' : 'auto', background: t.cardAlt, borderRadius: 10, padding: '12px 14px', border: `1px solid ${t.border}` }}>
                                        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>{label}</p>
                                        <p style={{ fontSize: 13, fontWeight: 600, textTransform: label === 'Gender' ? 'capitalize' : 'none' }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}