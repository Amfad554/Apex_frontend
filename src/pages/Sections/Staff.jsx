import { useState, useEffect } from 'react';
import { UserPlus, Search, X, Mail, Phone, Trash2, Eye, Loader, AlertCircle } from 'lucide-react';
import { ACCENT, BLUE, BLUE2 } from '../theme.js';
import { staffAPI } from '../../Services/api.js';

const ROLE_COLORS = {
    doctor: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
    nurse: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
    pharmacist: { bg: 'rgba(236,72,153,0.15)', text: '#f472b6' },
    lab_staff: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
    receptionist: { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa' },
};
const DEPARTMENTS = ['Cardiology', 'Emergency', 'General', 'ICU', 'Laboratory', 'Maternity', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Pharmacy', 'Radiology', 'Surgery'];
const STATUS_COLORS = {
    active: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
    inactive: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
};
const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

function Toast({ message, type = 'success', onClose }) {
    useEffect(() => { const id = setTimeout(onClose, 5000); return () => clearTimeout(id); }, []);
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

export default function Staff({ isDark, t, hospital, isMobile }) {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterRole, setFilter] = useState('All');
    const [showAdd, setShowAdd] = useState(false);
    const [viewStaff, setViewStaff] = useState(null);
    const [submitting, setSubmit] = useState(false);
    const [formError, setFormError] = useState('');
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ fullName: '', email: '', role: 'doctor', department: '', specialty: '', phone: '' });

    const hospitalId = hospital?.id;
    const showToast = (message, type = 'success') => setToast({ message, type });

    const modalOverlay = {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300,
        overflowY: 'auto', padding: isMobile ? '12px' : '40px 20px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    };
    const modalBox = (maxW = 520) => ({
        background: t.card, borderRadius: 20, width: '100%', maxWidth: maxW,
        border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        flexShrink: 0, marginTop: isMobile ? 16 : 40,
    });

    const loadStaff = async () => {
        if (!hospitalId) return;
        try {
            setLoading(true); setError('');
            const params = {};
            if (search) params.search = search;
            if (filterRole !== 'All') params.role = filterRole.toLowerCase();
            const res = await staffAPI.list(hospitalId, params);
            setStaff(res.staff || []);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadStaff(); }, [hospitalId, filterRole]);
    useEffect(() => { const t = setTimeout(loadStaff, 400); return () => clearTimeout(t); }, [search]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.email || !form.role) { setFormError('Name, email and role are required.'); return; }
        try {
            setSubmit(true); setFormError('');
            const res = await staffAPI.create(form);
            showToast(`Staff added! Temp password: ${res.tempPassword}`);
            setShowAdd(false);
            setForm({ fullName: '', email: '', role: 'doctor', department: '', specialty: '', phone: '' });
            loadStaff();
        } catch (err) { setFormError(err.message); }
        finally { setSubmit(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this staff member?')) return;
        try {
            await staffAPI.delete(id);
            setStaff(prev => prev.filter(s => s.id !== id));
            showToast('Staff member removed.');
        } catch (err) { showToast(err.message, 'error'); }
    };

    const inputStyle = { width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 6 };

    return (
        <div>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Staff Management</h1>
                    <p style={{ color: t.textSub, fontSize: 13 }}>{staff.length} staff members</p>
                </div>
                <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '9px 14px' : '10px 20px', background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: isMobile ? 13 : 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(59,91,219,0.35)', flexShrink: 0 }}>
                    <UserPlus size={16} /> {isMobile ? 'Add' : 'Add Staff'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.card, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, flex: 1 }}>
                    <Search size={15} color={t.textMuted} />
                    <input placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['All', 'Doctor', 'Nurse', 'Pharmacist', 'Lab_staff', 'Receptionist'].map(r => (
                        <button key={r} onClick={() => setFilter(r)} style={{ padding: '7px 12px', borderRadius: 10, border: `1px solid ${filterRole === r ? BLUE : t.border}`, background: filterRole === r ? 'rgba(59,91,219,0.15)' : t.card, color: filterRole === r ? '#60a5fa' : t.textSub, fontWeight: filterRole === r ? 600 : 400, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>{r}</button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Loading...
                </div>
            ) : error ? (
                <div style={{ padding: 30, textAlign: 'center', color: ACCENT.red, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><AlertCircle size={18} />{error}</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {staff.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: t.textMuted, fontSize: 14, background: t.card, borderRadius: 18, border: `1px solid ${t.border}` }}>No staff found</div>
                    ) : staff.map((s, i) => {
                        const rc = ROLE_COLORS[s.role] || { bg: 'rgba(128,128,128,0.1)', text: t.textSub };
                        const sc = STATUS_COLORS[s.status] || STATUS_COLORS.active;
                        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                        const avatar = s.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        return (
                            <div key={s.id} style={{ background: t.card, borderRadius: 16, padding: 18, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '22', color, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{avatar}</div>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: 14 }}>{s.fullName}</p>
                                            <p style={{ fontSize: 11, color: t.textMuted }}>ID: {s.id}</p>
                                        </div>
                                    </div>
                                    <span style={{ background: sc.bg, color: sc.text, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, flexShrink: 0 }}>{s.status}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                                    <span style={{ background: rc.bg, color: rc.text, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, textTransform: 'capitalize' }}>{s.role}</span>
                                    {s.department && <span style={{ background: t.cardAlt, color: t.textSub, fontSize: 11, padding: '4px 10px', borderRadius: 8, border: `1px solid ${t.border}` }}>{s.department}</span>}
                                </div>
                                {s.specialty && <p style={{ fontSize: 12, color: t.textMuted, marginBottom: 10 }}>{s.specialty}</p>}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12, paddingTop: 10, borderTop: `1px solid ${t.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.textSub }}><Mail size={12} color={t.textMuted} />{s.email}</div>
                                    {s.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.textSub }}><Phone size={12} color={t.textMuted} />{s.phone}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => setViewStaff(s)} style={{ flex: 1, padding: '8px', background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 8, color: ACCENT.blue, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Eye size={13} /> View</button>
                                    <button onClick={() => handleDelete(s.id)} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 8, color: ACCENT.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Staff Modal */}
            {showAdd && (
                <div onClick={e => e.target === e.currentTarget && setShowAdd(false)} style={modalOverlay}>
                    <div style={modalBox(520)}>
                        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontWeight: 700, fontSize: 16 }}>Add Staff Member</h2>
                                <p style={{ fontSize: 12, color: t.textSub, marginTop: 2 }}>Credentials will be returned after registration</p>
                            </div>
                            <button onClick={() => setShowAdd(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleAdd} style={{ padding: '20px' }}>
                            {formError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
                            <div style={{ background: isDark ? 'rgba(59,91,219,0.1)' : 'rgba(59,91,219,0.05)', border: `1px solid rgba(59,91,219,0.2)`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: t.textSub }}>
                                🔐 A temporary password will be auto-generated and shown after registration.
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Full Name *</label><input required style={inputStyle} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Dr. Kelechi Amadi" /></div>
                                <div><label style={labelStyle}>Role *</label>
                                    <select required style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                        <option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="pharmacist">Pharmacist</option><option value="lab_staff">Lab Staff</option><option value="receptionist">Receptionist</option>
                                    </select>
                                </div>
                                <div><label style={labelStyle}>Department</label>
                                    <select style={inputStyle} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                                        <option value="">Select department</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Work Email *</label><input type="email" required style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="staff@hospital.com" /></div>
                                <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0801-234-5678" /></div>
                                <div><label style={labelStyle}>Specialty</label><input style={inputStyle} value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} placeholder="e.g. Cardiologist" /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '11px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.textSub, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '11px', background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, opacity: submitting ? 0.7 : 1 }}>
                                    {submitting ? 'Adding...' : 'Add & Get Credentials'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Staff Modal */}
            {viewStaff && (
                <div onClick={e => e.target === e.currentTarget && setViewStaff(null)} style={modalOverlay}>
                    <div style={modalBox(420)}>
                        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700, fontSize: 16 }}>{viewStaff.fullName}</h2>
                            <button onClick={() => setViewStaff(null)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={16} /></button>
                        </div>
                        <div style={{ padding: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {[
                                    { label: 'Role', value: viewStaff.role, cap: true },
                                    { label: 'Status', value: viewStaff.status, cap: true },
                                    { label: 'Department', value: viewStaff.department || '—' },
                                    { label: 'Specialty', value: viewStaff.specialty || '—' },
                                    { label: 'Phone', value: viewStaff.phone || '—' },
                                    { label: 'Joined', value: new Date(viewStaff.createdAt).toLocaleDateString() },
                                    { label: 'Email', value: viewStaff.email, full: true },
                                ].map(({ label, value, full, cap }) => (
                                    <div key={label} style={{ gridColumn: full ? '1/-1' : 'auto', background: t.cardAlt, borderRadius: 10, padding: '11px 13px', border: `1px solid ${t.border}` }}>
                                        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>{label}</p>
                                        <p style={{ fontSize: 13, fontWeight: 600, textTransform: cap ? 'capitalize' : 'none' }}>{value}</p>
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