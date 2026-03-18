import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, AlertCircle, Bell, Calendar, ChevronDown,
    ClipboardList, Clock, Eye, FileText, Heart,
    Home, LogOut, Menu, Moon, Pill,
    Search, Stethoscope, Sun,
    User, Users, X, Plus, CheckCircle,
    FlaskConical, Microscope, BedDouble,
    PhoneCall, Shield, Loader,
    ChevronRight, MessageSquare,
    BarChart2, Package, UserCheck,
    Droplets, Phone, Mail, MoreHorizontal,
    Trash2, AlertTriangle
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getToken = () => localStorage.getItem('token');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });
const handle = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
};

const api = {
    patients: {
        list: (hospitalId, params = {}) => {
            const q = new URLSearchParams(params).toString();
            return fetch(`${BASE_URL}/api/patients/${hospitalId}${q ? '?' + q : ''}`, { headers: headers() }).then(handle);
        },
    },
    appointments: {
        list: (hospitalId, params = {}) => {
            const q = new URLSearchParams(params).toString();
            return fetch(`${BASE_URL}/api/appointments/${hospitalId}${q ? '?' + q : ''}`, { headers: headers() }).then(handle);
        },
        create: (body) => fetch(`${BASE_URL}/api/appointments`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
        updateStatus: (id, status) => fetch(`${BASE_URL}/api/appointments/${id}/status`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ status }) }).then(handle),
        delete: (id) => fetch(`${BASE_URL}/api/appointments/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
    },
    prescriptions: {
        list: (hospitalId, params = {}) => {
            const q = new URLSearchParams(params).toString();
            return fetch(`${BASE_URL}/api/prescriptions/${hospitalId}${q ? '?' + q : ''}`, { headers: headers() }).then(handle);
        },
        create: (body) => fetch(`${BASE_URL}/api/prescriptions`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
        updateStatus: (id, status) => fetch(`${BASE_URL}/api/prescriptions/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ status }) }).then(handle),
        delete: (id) => fetch(`${BASE_URL}/api/prescriptions/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
    },
    records: {
        list: (hospitalId, params = {}) => {
            const q = new URLSearchParams(params).toString();
            return fetch(`${BASE_URL}/api/medical-records/${hospitalId}${q ? '?' + q : ''}`, { headers: headers() }).then(handle);
        },
        create: (body) => fetch(`${BASE_URL}/api/medical-records`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
        delete: (id) => fetch(`${BASE_URL}/api/medical-records/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
    },
    staff: {
        list: (hospitalId, params = {}) => {
            const q = new URLSearchParams(params).toString();
            return fetch(`${BASE_URL}/api/staff/${hospitalId}${q ? '?' + q : ''}`, { headers: headers() }).then(handle);
        },
    },
};

/* ─── Design Tokens ─────────────────────────────────────────────────────────── */
const BLUE = '#3b5bdb', BLUE2 = '#4c6ef5', EMERALD = '#059669', AMBER = '#d97706',
    ROSE = '#e11d48', CYAN = '#0891b2', VIOLET = '#7c3aed';

const ROLE_META = {
    doctor: { label: 'Doctor', accent: BLUE, accent2: BLUE2, icon: Stethoscope, gradient: `linear-gradient(135deg,#3b5bdb,#4c6ef5)`, tag: 'DR' },
    nurse: { label: 'Nurse', accent: EMERALD, accent2: '#10b981', icon: Heart, gradient: `linear-gradient(135deg,#059669,#10b981)`, tag: 'RN' },
    pharmacist: { label: 'Pharmacist', accent: VIOLET, accent2: '#8b5cf6', icon: Pill, gradient: `linear-gradient(135deg,#7c3aed,#8b5cf6)`, tag: 'RPh' },
    lab_staff: { label: 'Lab Staff', accent: CYAN, accent2: '#06b6d4', icon: Microscope, gradient: `linear-gradient(135deg,#0891b2,#06b6d4)`, tag: 'MLT' },
    receptionist: { label: 'Receptionist', accent: AMBER, accent2: '#f59e0b', icon: PhoneCall, gradient: `linear-gradient(135deg,#d97706,#f59e0b)`, tag: 'RCP' },
};

const themes = {
    dark: { bg: '#0d1117', surface: '#161b22', surfaceAlt: '#1c2432', border: 'rgba(255,255,255,0.06)', text: '#e6edf3', textSub: 'rgba(230,237,243,0.55)', textMuted: 'rgba(230,237,243,0.3)', shadow: '0 4px 24px rgba(0,0,0,0.5)', sidebar: '#0d1117', hover: 'rgba(59,91,219,0.1)', input: 'rgba(255,255,255,0.05)', card: '#161b22', cardAlt: '#1c2432' },
    light: { bg: '#f5f7ff', surface: '#ffffff', surfaceAlt: '#f5f7ff', border: 'rgba(0,0,0,0.07)', text: '#111827', textSub: 'rgba(17,24,39,0.6)', textMuted: 'rgba(17,24,39,0.38)', shadow: '0 4px 24px rgba(59,91,219,0.08)', sidebar: '#ffffff', hover: 'rgba(59,91,219,0.06)', input: 'rgba(0,0,0,0.04)', card: '#ffffff', cardAlt: '#f5f7ff' },
};

const STATUS_COLORS = {
    scheduled: { bg: 'rgba(217,119,6,0.12)', color: AMBER, label: 'Scheduled' },
    completed: { bg: 'rgba(5,150,105,0.12)', color: EMERALD, label: 'Completed' },
    cancelled: { bg: 'rgba(225,29,72,0.12)', color: ROSE, label: 'Cancelled' },
    active: { bg: 'rgba(5,150,105,0.12)', color: EMERALD, label: 'Active' },
    no_show: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', label: 'No Show' },
};

const TYPE_COLORS = {
    lab_results: { bg: 'rgba(6,182,212,0.15)', text: '#22d3ee', label: 'Lab Results' },
    consultation: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', label: 'Consultation' },
    imaging: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Imaging' },
    other: { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa', label: 'Other' },
};

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#7c3aed', '#059669'];
const DEPARTMENTS = ['Cardiology', 'Emergency', 'General', 'ICU', 'Laboratory', 'Maternity', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Pharmacy', 'Radiology', 'Surgery'];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const initials = (name) => !name ? '??' : name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

function Badge({ status }) {
    const s = STATUS_COLORS[status?.toLowerCase()] || { bg: 'rgba(128,128,128,0.12)', color: '#9ca3af', label: status };
    return <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

function Toast({ message, type = 'success', onClose }) {
    useEffect(() => { const id = setTimeout(onClose, 4000); return () => clearTimeout(id); }, []);
    const c = type === 'error' ? { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' } : { bg: '#f0fdf4', border: '#86efac', text: '#166534' };
    return (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 12, padding: '14px 18px', minWidth: 280, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, animation: 'toastIn 0.3s ease forwards' }}>
            <style>{`@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.6 }}><X size={14} /></button>
        </div>
    );
}

function LoadingState({ t, accent }) {
    return (
        <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 32, height: 32, border: `2.5px solid ${accent}22`, borderTopColor: accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ fontSize: 13, color: t.textMuted }}>Loading...</p>
        </div>
    );
}

/* ─── Shared Section Components ─────────────────────────────────────────────── */

function PatientsSection({ t, hospitalId, isDark, accent, isMobile }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewPatient, setViewPatient] = useState(null);
    const [error, setError] = useState('');

    const load = useCallback(async (q = '') => {
        try {
            setLoading(true); setError('');
            const res = await api.patients.list(hospitalId, q ? { search: q } : {});
            setPatients(res.patients || []);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    }, [hospitalId]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { const id = setTimeout(() => load(search), 400); return () => clearTimeout(id); }, [search]);

    const inputStyle = { width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Patients</h1>
                    <p style={{ color: t.textSub, fontSize: 13 }}>{patients.length} patients in your hospital</p>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.surface, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, marginBottom: 20 }}>
                <Search size={15} color={t.textMuted} />
                <input placeholder="Search by name or patient number..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted }}><X size={14} /></button>}
            </div>
            {loading ? <LoadingState t={t} accent={accent} /> : error ? (
                <div style={{ padding: 30, textAlign: 'center', color: ROSE, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><AlertCircle size={18} />{error}</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {patients.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, background: t.surface, borderRadius: 16, border: `1px solid ${t.border}` }}>No patients found</div>
                    ) : patients.map((p, i) => {
                        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                        return (
                            <div key={p.id} style={{ background: t.surface, borderRadius: 14, padding: '14px 18px', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = accent + '55'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
                                onClick={() => setViewPatient(p)}>
                                <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '22', color, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials(p.fullName)}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: 14 }}>{p.fullName}</p>
                                    <p style={{ fontSize: 12, color: t.textMuted }}>{p.patientNumber} · {p.gender} · <span style={{ color: ROSE }}>{p.bloodGroup || '—'}</span></p>
                                </div>
                                <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                                    <div style={{ fontSize: 12, color: t.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} />{p.phone}</div>
                                    <Eye size={16} color={accent} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {viewPatient && (
                <div onClick={e => e.target === e.currentTarget && setViewPatient(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: t.surface, borderRadius: 20, width: '100%', maxWidth: 460, border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                        <div style={{ padding: '18px 20px', background: accent + '18', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 46, height: 46, borderRadius: 12, background: accent + '33', color: accent, fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(viewPatient.fullName)}</div>
                                <div>
                                    <h2 style={{ fontWeight: 800, fontSize: 16 }}>{viewPatient.fullName}</h2>
                                    <p style={{ fontSize: 12, color: t.textSub }}>{viewPatient.patientNumber}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewPatient(null)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
                        </div>
                        <div style={{ padding: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {[
                                    { label: 'Phone', value: viewPatient.phone },
                                    { label: 'Email', value: viewPatient.email || '—' },
                                    { label: 'Gender', value: viewPatient.gender },
                                    { label: 'Blood Group', value: viewPatient.bloodGroup || '—' },
                                    { label: 'Date of Birth', value: new Date(viewPatient.dateOfBirth).toLocaleDateString() },
                                    { label: 'Conditions', value: viewPatient.medicalConditions || '—' },
                                    { label: 'Next of Kin', value: viewPatient.nextOfKinName || '—' },
                                    { label: 'Kin Phone', value: viewPatient.nextOfKinPhone || '—' },
                                    { label: 'Address', value: viewPatient.address, full: true },
                                ].map(({ label, value, full }) => (
                                    <div key={label} style={{ gridColumn: full ? '1/-1' : 'auto', background: t.cardAlt, borderRadius: 10, padding: '10px 13px', border: `1px solid ${t.border}` }}>
                                        <p style={{ fontSize: 10, color: t.textMuted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                                        <p style={{ fontSize: 13, fontWeight: 600 }}>{value}</p>
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

function AppointmentsSection({ t, hospitalId, staffId, isDark, accent, isMobile, role }) {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ patientId: '', doctorId: '', appointmentDate: '', appointmentTime: '', reason: '', notes: '' });
    const canCreate = ['doctor', 'receptionist', 'nurse'].includes(role);

    const load = useCallback(async () => {
        if (!hospitalId) return;
        try {
            setLoading(true);
            const params = filter !== 'All' ? { status: filter.toLowerCase() } : {};
            const [aRes, sRes, pRes] = await Promise.all([
                api.appointments.list(hospitalId, params),
                api.staff.list(hospitalId, { role: 'doctor' }),
                api.patients.list(hospitalId),
            ]);
            setAppointments(aRes.appointments || []);
            setDoctors(sRes.staff || []);
            setPatients(pRes.patients || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [hospitalId, filter]);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.patientId || !form.doctorId || !form.appointmentDate || !form.appointmentTime || !form.reason) { setFormError('All fields except notes are required.'); return; }
        try {
            setSubmitting(true); setFormError('');
            await api.appointments.create(form);
            setShowAdd(false);
            setForm({ patientId: '', doctorId: '', appointmentDate: '', appointmentTime: '', reason: '', notes: '' });
            setToast({ message: 'Appointment booked!', type: 'success' });
            load();
        } catch (err) { setFormError(err.message); }
        finally { setSubmitting(false); }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.appointments.updateStatus(id, status);
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            setToast({ message: `Marked as ${status}`, type: 'success' });
        } catch (err) { setToast({ message: err.message, type: 'error' }); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this appointment?')) return;
        try {
            await api.appointments.delete(id);
            setAppointments(prev => prev.filter(a => a.id !== id));
            setToast({ message: 'Appointment deleted.', type: 'success' });
        } catch (err) { setToast({ message: err.message, type: 'error' }); }
    };

    const filtered = appointments.filter(a =>
        a.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        a.doctor?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        a.reason?.toLowerCase().includes(search.toLowerCase())
    );

    const counts = { scheduled: 0, completed: 0, cancelled: 0 };
    appointments.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

    const inputStyle = { width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 6 };

    return (
        <div>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Appointments</h1>
                    <p style={{ color: t.textSub, fontSize: 13 }}>{appointments.length} total appointments</p>
                </div>
                {canCreate && (
                    <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: `linear-gradient(135deg,${accent},${accent}cc)`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 16px ${accent}44` }}>
                        <Plus size={15} /> Book Appointment
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                {[{ label: 'Scheduled', count: counts.scheduled, color: AMBER }, { label: 'Completed', count: counts.completed, color: EMERALD }, { label: 'Cancelled', count: counts.cancelled, color: ROSE }].map(({ label, count, color }) => (
                    <div key={label} style={{ background: t.surface, borderRadius: 14, padding: '16px', border: `1px solid ${t.border}` }}>
                        <p style={{ fontSize: 26, fontWeight: 800, color: t.text }}>{count}</p>
                        <p style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{label}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.surface, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, flex: 1, minWidth: 200 }}>
                    <Search size={14} color={t.textMuted} />
                    <input placeholder="Search appointments..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {['All', 'Scheduled', 'Completed', 'Cancelled'].map(s => (
                        <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${filter === s ? accent : t.border}`, background: filter === s ? accent + '18' : t.surface, color: filter === s ? accent : t.textSub, fontWeight: filter === s ? 600 : 400, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', transition: 'all 0.15s' }}>{s}</button>
                    ))}
                </div>
            </div>

            {loading ? <LoadingState t={t} accent={accent} /> : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
                    {filtered.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: t.textMuted, background: t.surface, borderRadius: 16, border: `1px solid ${t.border}` }}>No appointments found</div>
                    ) : filtered.map((a, i) => {
                        const sc = STATUS_COLORS[a.status] || STATUS_COLORS.scheduled;
                        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                        return (
                            <div key={a.id} style={{ background: t.surface, borderRadius: 16, padding: 18, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '22', color, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials(a.patient?.fullName)}</div>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: 14 }}>{a.patient?.fullName}</p>
                                            <p style={{ fontSize: 11, color: t.textMuted }}>{a.patient?.patientNumber}</p>
                                        </div>
                                    </div>
                                    <Badge status={a.status} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                                    {[{ label: 'Doctor', value: a.doctor?.fullName }, { label: 'Reason', value: a.reason }, { label: 'Date', value: new Date(a.appointmentDate).toLocaleDateString() }, { label: 'Time', value: a.appointmentTime || '—' }].map(({ label, value }) => (
                                        <div key={label} style={{ background: t.cardAlt, borderRadius: 8, padding: '8px 10px', border: `1px solid ${t.border}` }}>
                                            <p style={{ fontSize: 10, color: t.textMuted, marginBottom: 2 }}>{label}</p>
                                            <p style={{ fontSize: 12, fontWeight: 600 }}>{value || '—'}</p>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {a.status === 'scheduled' && canCreate && (
                                        <>
                                            <button onClick={() => updateStatus(a.id, 'completed')} style={{ flex: 1, padding: '7px', background: 'rgba(5,150,105,0.12)', border: 'none', borderRadius: 8, color: EMERALD, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Complete</button>
                                            <button onClick={() => updateStatus(a.id, 'cancelled')} style={{ flex: 1, padding: '7px', background: 'rgba(225,29,72,0.1)', border: 'none', borderRadius: 8, color: ROSE, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                                        </>
                                    )}
                                    {canCreate && (
                                        <button onClick={() => handleDelete(a.id)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', color: ROSE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showAdd && (
                <div onClick={e => e.target === e.currentTarget && setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, overflowY: 'auto', padding: '40px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <div style={{ background: t.surface, borderRadius: 20, width: '100%', maxWidth: 520, border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', marginBottom: 40 }}>
                        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700, fontSize: 16 }}>Book Appointment</h2>
                            <button onClick={() => setShowAdd(false)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleAdd} style={{ padding: 20 }}>
                            {formError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Patient *</label><select required style={inputStyle} value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}><option value="">Select patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.fullName} — {p.patientNumber}</option>)}</select></div>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Doctor *</label><select required style={inputStyle} value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}><option value="">Select doctor</option>{doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}</select></div>
                                <div><label style={labelStyle}>Date *</label><input type="date" required style={inputStyle} value={form.appointmentDate} onChange={e => setForm({ ...form, appointmentDate: e.target.value })} /></div>
                                <div><label style={labelStyle}>Time *</label><input type="time" required style={inputStyle} value={form.appointmentTime} onChange={e => setForm({ ...form, appointmentTime: e.target.value })} /></div>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Reason *</label><input required style={inputStyle} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for visit" /></div>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '11px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.textSub, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '11px', background: `linear-gradient(135deg,${accent},${accent}cc)`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Booking...' : 'Book Appointment'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function PrescriptionsSection({ t, hospitalId, isDark, accent, isMobile, role }) {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ patientId: '', doctorId: '', medication: '', dosage: '', duration: '', instructions: '' });
    const canCreate = ['doctor', 'pharmacist'].includes(role);

    const load = useCallback(async () => {
        if (!hospitalId) return;
        try {
            setLoading(true);
            const params = filter !== 'All' ? { status: filter.toLowerCase() } : {};
            const [rRes, sRes, pRes] = await Promise.all([
                api.prescriptions.list(hospitalId, params),
                api.staff.list(hospitalId, { role: 'doctor' }),
                api.patients.list(hospitalId),
            ]);
            setPrescriptions(rRes.prescriptions || []);
            setDoctors(sRes.staff || []);
            setPatients(pRes.patients || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [hospitalId, filter]);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.patientId || !form.doctorId || !form.medication || !form.dosage) { setFormError('Patient, doctor, medication and dosage are required.'); return; }
        try {
            setSubmitting(true); setFormError('');
            await api.prescriptions.create(form);
            setShowAdd(false);
            setForm({ patientId: '', doctorId: '', medication: '', dosage: '', duration: '', instructions: '' });
            setToast({ message: 'Prescription issued!', type: 'success' });
            load();
        } catch (err) { setFormError(err.message); }
        finally { setSubmitting(false); }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.prescriptions.updateStatus(id, status);
            setPrescriptions(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            setToast({ message: `Prescription ${status}`, type: 'success' });
        } catch (err) { setToast({ message: err.message, type: 'error' }); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this prescription?')) return;
        try {
            await api.prescriptions.delete(id);
            setPrescriptions(prev => prev.filter(r => r.id !== id));
            setToast({ message: 'Deleted.', type: 'success' });
        } catch (err) { setToast({ message: err.message, type: 'error' }); }
    };

    const filtered = prescriptions.filter(rx =>
        rx.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        rx.medication?.toLowerCase().includes(search.toLowerCase())
    );

    const counts = { active: 0, completed: 0, cancelled: 0 };
    prescriptions.forEach(rx => { if (counts[rx.status] !== undefined) counts[rx.status]++; });

    const inputStyle = { width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 6 };

    return (
        <div>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Prescriptions</h1>
                    <p style={{ color: t.textSub, fontSize: 13 }}>{prescriptions.length} total prescriptions</p>
                </div>
                {canCreate && (
                    <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: `linear-gradient(135deg,${accent},${accent}cc)`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 16px ${accent}44` }}>
                        <Plus size={15} /> Issue Prescription
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                {[{ label: 'Active', count: counts.active, color: EMERALD }, { label: 'Completed', count: counts.completed, color: BLUE }, { label: 'Cancelled', count: counts.cancelled, color: ROSE }].map(({ label, count, color }) => (
                    <div key={label} style={{ background: t.surface, borderRadius: 14, padding: '16px', border: `1px solid ${t.border}` }}>
                        <p style={{ fontSize: 26, fontWeight: 800, color: t.text }}>{count}</p>
                        <p style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{label}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.surface, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, flex: 1, minWidth: 200 }}>
                    <Search size={14} color={t.textMuted} />
                    <input placeholder="Search prescriptions..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {['All', 'Active', 'Completed', 'Cancelled'].map(s => (
                        <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${filter === s ? accent : t.border}`, background: filter === s ? accent + '18' : t.surface, color: filter === s ? accent : t.textSub, fontWeight: filter === s ? 600 : 400, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>{s}</button>
                    ))}
                </div>
            </div>

            {loading ? <LoadingState t={t} accent={accent} /> : (
                <div style={{ background: t.surface, borderRadius: 18, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: t.cardAlt }}>{['Patient', 'Drug', 'Dosage', 'Doctor', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: t.textMuted }}>No prescriptions found</td></tr>
                            ) : filtered.map((rx, i) => {
                                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                return (
                                    <tr key={rx.id} style={{ borderBottom: `1px solid ${t.border}` }} onMouseEnter={e => e.currentTarget.style.background = t.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 30, height: 30, borderRadius: 8, background: color + '22', color, fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials(rx.patient?.fullName)}</div>
                                                <p style={{ fontWeight: 600, fontSize: 13 }}>{rx.patient?.fullName}</p>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Pill size={13} color={VIOLET} />
                                                <span style={{ fontSize: 13, fontWeight: 600 }}>{rx.medication}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: 12, color: t.textSub }}>{rx.dosage}</td>
                                        <td style={{ padding: '12px 16px', fontSize: 12, color: t.textSub }}>{rx.doctor?.fullName}</td>
                                        <td style={{ padding: '12px 16px' }}><Badge status={rx.status} /></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {rx.status === 'active' && canCreate && (
                                                    <button onClick={() => updateStatus(rx.id, 'completed')} style={{ padding: '4px 10px', background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 7, color: BLUE, fontWeight: 600, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Dispense</button>
                                                )}
                                                {canCreate && <button onClick={() => handleDelete(rx.id)} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', color: ROSE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={12} /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showAdd && (
                <div onClick={e => e.target === e.currentTarget && setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, overflowY: 'auto', padding: '40px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <div style={{ background: t.surface, borderRadius: 20, width: '100%', maxWidth: 500, border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', marginBottom: 40 }}>
                        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700, fontSize: 16 }}>Issue Prescription</h2>
                            <button onClick={() => setShowAdd(false)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleAdd} style={{ padding: 20 }}>
                            {formError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Patient *</label><select required style={inputStyle} value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}><option value="">Select patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.fullName} — {p.patientNumber}</option>)}</select></div>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Doctor *</label><select required style={inputStyle} value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}><option value="">Select doctor</option>{doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}</select></div>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Drug Name & Strength *</label><input required style={inputStyle} value={form.medication} onChange={e => setForm({ ...form, medication: e.target.value })} placeholder="e.g. Amoxicillin 500mg" /></div>
                                <div><label style={labelStyle}>Dosage *</label><input required style={inputStyle} value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} placeholder="e.g. 1 tablet 3x daily" /></div>
                                <div><label style={labelStyle}>Duration</label><input style={inputStyle} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 7 days" /></div>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Instructions</label><textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} placeholder="Take after meals..." /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '11px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.textSub, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '11px', background: `linear-gradient(135deg,${accent},${accent}cc)`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Issuing...' : 'Issue Prescription'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function RecordsSection({ t, hospitalId, isDark, accent, isMobile, role }) {
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [viewRec, setViewRec] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ patientId: '', doctorId: '', recordType: 'lab_results', title: '', diagnosis: '', findings: '', notes: '' });
    const canCreate = ['doctor', 'lab_staff', 'nurse'].includes(role);

    const load = useCallback(async () => {
        if (!hospitalId) return;
        try {
            setLoading(true);
            const params = filter !== 'All' ? { recordType: filter } : {};
            const [rRes, sRes, pRes] = await Promise.all([
                api.records.list(hospitalId, params),
                api.staff.list(hospitalId, { role: 'doctor' }),
                api.patients.list(hospitalId),
            ]);
            setRecords(rRes.records || []);
            setDoctors(sRes.staff || []);
            setPatients(pRes.patients || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [hospitalId, filter]);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.patientId || !form.doctorId || !form.title) { setFormError('Patient, doctor and title are required.'); return; }
        try {
            setSubmitting(true); setFormError('');
            await api.records.create(form);
            setShowAdd(false);
            setForm({ patientId: '', doctorId: '', recordType: 'lab_results', title: '', diagnosis: '', findings: '', notes: '' });
            setToast({ message: 'Record saved!', type: 'success' });
            load();
        } catch (err) { setFormError(err.message); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this record?')) return;
        try {
            await api.records.delete(id);
            setRecords(prev => prev.filter(r => r.id !== id));
            setToast({ message: 'Deleted.', type: 'success' });
        } catch (err) { setToast({ message: err.message, type: 'error' }); }
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
                    <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Medical Records</h1>
                    <p style={{ color: t.textSub, fontSize: 13 }}>{records.length} records on file</p>
                </div>
                {canCreate && (
                    <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: `linear-gradient(135deg,${accent},${accent}cc)`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 16px ${accent}44` }}>
                        <Plus size={15} /> Add Record
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.surface, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, flex: 1, minWidth: 200 }}>
                    <Search size={14} color={t.textMuted} />
                    <input placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['All', ...Object.keys(TYPE_COLORS)].map(s => (
                        <button key={s} onClick={() => setFilter(s)} style={{ padding: '7px 12px', borderRadius: 10, border: `1px solid ${filter === s ? accent : t.border}`, background: filter === s ? accent + '18' : t.surface, color: filter === s ? accent : t.textSub, fontWeight: filter === s ? 600 : 400, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                            {s === 'All' ? 'All' : TYPE_COLORS[s]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <LoadingState t={t} accent={accent} /> : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
                    {filtered.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: t.textMuted, background: t.surface, borderRadius: 16, border: `1px solid ${t.border}` }}>No records found</div>
                    ) : filtered.map((r, i) => {
                        const tc = TYPE_COLORS[r.recordType] || TYPE_COLORS.other;
                        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                        return (
                            <div key={r.id} style={{ background: t.surface, borderRadius: 16, padding: 16, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <span style={{ background: tc.bg, color: tc.text, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8 }}>{tc.label}</span>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => setViewRec(r)} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(59,130,246,0.1)', border: 'none', cursor: 'pointer', color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={13} /></button>
                                        {canCreate && <button onClick={() => handleDelete(r.id)} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', color: ROSE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></button>}
                                    </div>
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{r.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <div style={{ width: 26, height: 26, borderRadius: 7, background: color + '22', color, fontWeight: 700, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(r.patient?.fullName)}</div>
                                    <div><p style={{ fontSize: 12, fontWeight: 600 }}>{r.patient?.fullName}</p><p style={{ fontSize: 10, color: t.textMuted }}>{r.patient?.patientNumber}</p></div>
                                </div>
                                {r.notes && <p style={{ fontSize: 12, color: t.textSub, marginBottom: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.notes}</p>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${t.border}` }}>
                                    <span style={{ fontSize: 11, color: t.textMuted }}>{r.doctor?.fullName}</span>
                                    <span style={{ fontSize: 11, color: t.textMuted }}>{new Date(r.recordDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {viewRec && (
                <div onClick={e => e.target === e.currentTarget && setViewRec(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: t.surface, borderRadius: 20, width: '100%', maxWidth: 440, border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700, fontSize: 15 }}>{viewRec.title}</h2>
                            <button onClick={() => setViewRec(null)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
                        </div>
                        <div style={{ padding: 20 }}>
                            {(() => { const tc = TYPE_COLORS[viewRec.recordType] || TYPE_COLORS.other; return <span style={{ background: tc.bg, color: tc.text, fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8, display: 'inline-block', marginBottom: 14 }}>{tc.label}</span>; })()}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                                {[{ label: 'Patient', value: viewRec.patient?.fullName }, { label: 'Patient No', value: viewRec.patient?.patientNumber }, { label: 'Doctor', value: viewRec.doctor?.fullName }, { label: 'Date', value: new Date(viewRec.recordDate).toLocaleDateString() }, { label: 'Diagnosis', value: viewRec.diagnosis || '—' }, { label: 'Findings', value: viewRec.findings || '—' }].map(({ label, value }) => (
                                    <div key={label} style={{ background: t.cardAlt, borderRadius: 10, padding: '11px 13px', border: `1px solid ${t.border}` }}>
                                        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 3 }}>{label}</p>
                                        <p style={{ fontSize: 13, fontWeight: 600 }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                            {viewRec.notes && <div style={{ background: t.cardAlt, borderRadius: 10, padding: 14, border: `1px solid ${t.border}` }}><p style={{ fontSize: 11, color: t.textMuted, marginBottom: 6 }}>NOTES</p><p style={{ fontSize: 13, lineHeight: 1.6 }}>{viewRec.notes}</p></div>}
                        </div>
                    </div>
                </div>
            )}

            {showAdd && (
                <div onClick={e => e.target === e.currentTarget && setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, overflowY: 'auto', padding: '40px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <div style={{ background: t.surface, borderRadius: 20, width: '100%', maxWidth: 500, border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', marginBottom: 40 }}>
                        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700, fontSize: 16 }}>Add Medical Record</h2>
                            <button onClick={() => setShowAdd(false)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleAdd} style={{ padding: 20 }}>
                            {formError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Patient *</label><select required style={inputStyle} value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}><option value="">Select patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.fullName} — {p.patientNumber}</option>)}</select></div>
                                <div><label style={labelStyle}>Doctor *</label><select required style={inputStyle} value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}><option value="">Select doctor</option>{doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}</select></div>
                                <div><label style={labelStyle}>Record Type *</label><select required style={inputStyle} value={form.recordType} onChange={e => setForm({ ...form, recordType: e.target.value })}>{Object.entries(TYPE_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Title *</label><input required style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Full Blood Count" /></div>
                                <div><label style={labelStyle}>Diagnosis</label><input style={inputStyle} value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} placeholder="e.g. Malaria" /></div>
                                <div><label style={labelStyle}>Findings</label><input style={inputStyle} value={form.findings} onChange={e => setForm({ ...form, findings: e.target.value })} placeholder="Key findings" /></div>
                                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Clinical notes..." /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '11px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.textSub, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '11px', background: `linear-gradient(135deg,${accent},${accent}cc)`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Saving...' : 'Save Record'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Home Dashboard (role-aware, real counts) ───────────────────────────────── */
function HomeDashboard({ t, staff, isDark, roleMeta, hospitalId, onNavigate, isMobile }) {
    const [stats, setStats] = useState({ patients: 0, appointments: 0, prescriptions: 0, records: 0 });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    useEffect(() => {
        if (!hospitalId) return;
        Promise.all([
            api.patients.list(hospitalId),
            api.appointments.list(hospitalId, { limit: 5 }),
            api.prescriptions.list(hospitalId),
            api.records.list(hospitalId),
        ]).then(([pRes, aRes, rxRes, rRes]) => {
            setStats({
                patients: (pRes.patients || []).length,
                appointments: (aRes.appointments || []).length,
                prescriptions: (rxRes.prescriptions || []).length,
                records: (rRes.records || []).length,
            });
            setRecentAppointments((aRes.appointments || []).slice(0, 4));
        }).catch(console.error).finally(() => setLoading(false));
    }, [hospitalId]);

    const statCards = [
        { label: 'Patients', value: stats.patients, icon: Users, color: BLUE, section: 'patients' },
        { label: 'Appointments', value: stats.appointments, icon: Calendar, color: EMERALD, section: 'appointments' },
        { label: 'Prescriptions', value: stats.prescriptions, icon: Pill, color: VIOLET, section: 'prescriptions' },
        { label: 'Records', value: stats.records, icon: FileText, color: AMBER, section: 'records' },
    ];

    const quickActions = [
        { label: 'Patients', icon: Users, section: 'patients' },
        { label: 'Appointments', icon: Calendar, section: 'appointments' },
        { label: 'Prescriptions', icon: Pill, section: 'prescriptions' },
        { label: 'Records', icon: FileText, section: 'records' },
    ];

    return (
        <div>
            {/* Hero */}
            <div style={{ background: isDark ? `linear-gradient(135deg,${roleMeta.accent}22,${roleMeta.accent2}11,transparent)` : `linear-gradient(135deg,${roleMeta.accent}12,${roleMeta.accent2}07,transparent)`, borderRadius: 28, padding: '28px', marginBottom: 24, border: `1px solid ${roleMeta.accent}33`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle,${roleMeta.accent}18,transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: roleMeta.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{greeting} 👋</p>
                        <h1 style={{ fontSize: 'clamp(18px,3.5vw,26px)', fontWeight: 800, color: t.text, letterSpacing: '-0.5px', marginBottom: 6, lineHeight: 1.2 }}>{staff?.fullName || staff?.name || roleMeta.label}</h1>
                        <p style={{ fontSize: 13, color: t.textSub, marginBottom: 14 }}>{roleMeta.label} · {staff?.department || 'Hospital'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: `${roleMeta.accent}18`, border: `1px solid ${roleMeta.accent}33`, color: roleMeta.accent, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{staff?.employeeId || `${roleMeta.tag}-0001`}</span>
                            <span style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', color: EMERALD, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle size={10} />On Duty</span>
                        </div>
                    </div>
                    <div style={{ width: 76, height: 76, borderRadius: 22, background: roleMeta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: '#fff', boxShadow: `0 8px 28px ${roleMeta.accent}44`, flexShrink: 0 }}>{initials(staff?.fullName || staff?.name)}</div>
                </div>
            </div>

            {/* Real Stats */}
            {loading ? <LoadingState t={t} accent={roleMeta.accent} /> : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
                        {statCards.map(({ label, value, icon: Icon, color, section }) => (
                            <div key={label} onClick={() => onNavigate(section)} style={{ background: t.surface, borderRadius: 18, padding: '18px', border: `1px solid ${t.border}`, boxShadow: t.shadow, cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'none'; }}>
                                <div style={{ position: 'absolute', top: -16, right: -16, width: 60, height: 60, borderRadius: '50%', background: color + '10', pointerEvents: 'none' }} />
                                <div style={{ width: 38, height: 38, borderRadius: 11, background: color + '16', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon size={17} color={color} /></div>
                                <p style={{ fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: '-0.5px', fontFamily: 'monospace', marginBottom: 3 }}>{value}</p>
                                <p style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 14 }}>Quick Actions</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10 }}>
                            {quickActions.map(({ label, icon: Icon, section }) => (
                                <button key={section} onClick={() => onNavigate(section)} style={{ background: t.surface, borderRadius: 16, padding: '16px 12px', border: `1px solid ${t.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: t.shadow }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = roleMeta.accent + '55'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'none'; }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: roleMeta.accent + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color={roleMeta.accent} /></div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Appointments */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text }}>Recent Appointments</h2>
                            <button onClick={() => onNavigate('appointments')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: roleMeta.accent, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>View all <ChevronRight size={14} /></button>
                        </div>
                        {recentAppointments.length === 0 ? (
                            <div style={{ padding: 30, textAlign: 'center', color: t.textMuted, background: t.surface, borderRadius: 16, border: `1.5px dashed ${t.border}` }}>No appointments yet</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {recentAppointments.map((a, i) => (
                                    <div key={a.id} style={{ background: t.surface, borderRadius: 14, padding: '14px 16px', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 11, background: AVATAR_COLORS[i % AVATAR_COLORS.length] + '22', color: AVATAR_COLORS[i % AVATAR_COLORS.length], fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials(a.patient?.fullName)}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                                                <p style={{ fontWeight: 700, fontSize: 14 }}>{a.patient?.fullName}</p>
                                                <Badge status={a.status} />
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: 12, color: t.textMuted }}>{a.reason}</span>
                                                <span style={{ fontSize: 12, color: t.textMuted, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} color={roleMeta.accent} />{new Date(a.appointmentDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function MyProfile({ t, staff, isDark, roleMeta }) {
    const info = [
        { label: 'Full Name', value: staff?.fullName || staff?.name || '—', icon: User, color: BLUE },
        { label: 'Employee ID', value: staff?.employeeId || '—', icon: Shield, color: VIOLET },
        { label: 'Role', value: roleMeta.label, icon: Stethoscope, color: roleMeta.accent },
        { label: 'Department', value: staff?.department || '—', icon: BedDouble, color: CYAN },
        { label: 'Specialty', value: staff?.specialty || '—', icon: Activity, color: EMERALD },
        { label: 'Phone', value: staff?.phone || '—', icon: Phone, color: AMBER },
        { label: 'Email', value: staff?.email || '—', icon: Mail, color: BLUE2 },
        { label: 'Status', value: staff?.status || 'active', icon: CheckCircle, color: EMERALD },
    ];
    return (
        <div>
            <div style={{ background: isDark ? `linear-gradient(135deg,${roleMeta.accent}20,${BLUE}10,transparent)` : `linear-gradient(135deg,${roleMeta.accent}12,${BLUE}06,transparent)`, borderRadius: 28, padding: '32px', marginBottom: 24, border: `1px solid ${roleMeta.accent}33`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ width: 90, height: 90, borderRadius: 26, background: roleMeta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 30, color: '#fff', boxShadow: `0 12px 36px ${roleMeta.accent}44`, flexShrink: 0 }}>{initials(staff?.fullName || staff?.name)}</div>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: roleMeta.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Staff Profile · {roleMeta.label}</p>
                        <h1 style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 800, color: t.text, letterSpacing: '-0.5px', marginBottom: 10 }}>{staff?.fullName || staff?.name || '—'}</h1>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {staff?.employeeId && <span style={{ background: roleMeta.accent + '18', border: `1px solid ${roleMeta.accent}33`, color: roleMeta.accent, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{staff.employeeId}</span>}
                            <span style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.18)', color: EMERALD, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>Active Staff</span>
                        </div>
                    </div>
                </div>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: t.text, marginBottom: 16 }}>Staff Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
                {info.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} style={{ background: t.surface, borderRadius: 16, padding: '16px 18px', border: `1px solid ${t.border}`, boxShadow: t.shadow, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={15} color={color} /></div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: t.text, wordBreak: 'break-word', textTransform: label === 'Status' ? 'capitalize' : 'none' }}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Nav Config ─────────────────────────────────────────────────────────────── */
const NAV_BY_ROLE = {
    doctor: [{ id: 'home', label: 'Dashboard', icon: Home }, { id: 'patients', label: 'Patients', icon: Users }, { id: 'appointments', label: 'Appointments', icon: Calendar }, { id: 'prescriptions', label: 'Prescriptions', icon: Pill }, { id: 'records', label: 'Records', icon: FileText }, { id: 'profile', label: 'Profile', icon: User }],
    nurse: [{ id: 'home', label: 'Dashboard', icon: Home }, { id: 'patients', label: 'Patients', icon: Users }, { id: 'appointments', label: 'Appointments', icon: Calendar }, { id: 'records', label: 'Records', icon: FileText }, { id: 'profile', label: 'Profile', icon: User }],
    pharmacist: [{ id: 'home', label: 'Dashboard', icon: Home }, { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList }, { id: 'patients', label: 'Patients', icon: Users }, { id: 'profile', label: 'Profile', icon: User }],
    lab_staff: [{ id: 'home', label: 'Dashboard', icon: Home }, { id: 'records', label: 'Records', icon: FileText }, { id: 'patients', label: 'Patients', icon: Users }, { id: 'profile', label: 'Profile', icon: User }],
    receptionist: [{ id: 'home', label: 'Dashboard', icon: Home }, { id: 'appointments', label: 'Appointments', icon: Calendar }, { id: 'patients', label: 'Patients', icon: Users }, { id: 'profile', label: 'Profile', icon: User }],
};

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════════════════ */
export default function StaffDashboard() {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
    const [staff, setStaff] = useState(null);
    const [section, setSection] = useState('home');
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [headerIn, setHeaderIn] = useState(false);
    const [navMounted, setNavMounted] = useState(false);

    useEffect(() => { setTimeout(() => setHeaderIn(true), 50); setTimeout(() => setNavMounted(true), 150); }, []);
    useEffect(() => { const check = () => setIsMobile(window.innerWidth < 768); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check); }, []);
    useEffect(() => { const fn = () => setIsDark(localStorage.getItem('theme') === 'dark'); window.addEventListener('themeChange', fn); return () => window.removeEventListener('themeChange', fn); }, []);
    useEffect(() => {
        try {
            const raw = localStorage.getItem('user');
            if (!raw) { navigate('/stafflogin'); return; }
            setStaff(JSON.parse(raw));
        } catch { navigate('/stafflogin'); }
    }, []);

    const rawRole = (staff?.role || 'doctor').toLowerCase().replace(/\s+/g, '_');
    const roleMeta = ROLE_META[rawRole] || ROLE_META.doctor;
    const navItems = NAV_BY_ROLE[rawRole] || NAV_BY_ROLE.doctor;
    const BOTTOM_NAV = navItems.slice(0, 4);
    const MORE_NAV = navItems.slice(4);
    const t = isDark ? themes.dark : themes.light;
    const hospitalId = staff?.hospital_id;

    const toggleTheme = () => { const next = !isDark; setIsDark(next); localStorage.setItem('theme', next ? 'dark' : 'light'); window.dispatchEvent(new Event('themeChange')); };
    const handleLogout = () => { ['token', 'user', 'userRole'].forEach(k => localStorage.removeItem(k)); window.dispatchEvent(new Event('authChange')); navigate('/stafflogin'); };
    const goTo = (id) => { setSection(id); setMobileMenu(false); };

    const sharedProps = { t, isDark, accent: roleMeta.accent, roleMeta, hospitalId, isMobile, role: rawRole };

    const renderSection = () => {
        switch (section) {
            case 'home': return <HomeDashboard {...sharedProps} staff={staff} onNavigate={goTo} />;
            case 'patients': return <PatientsSection {...sharedProps} />;
            case 'appointments': return <AppointmentsSection {...sharedProps} />;
            case 'prescriptions': return <PrescriptionsSection {...sharedProps} />;
            case 'records': return <RecordsSection {...sharedProps} />;
            case 'profile': return <MyProfile t={t} staff={staff} isDark={isDark} roleMeta={roleMeta} />;
            default: return <HomeDashboard {...sharedProps} staff={staff} onNavigate={goTo} />;
        }
    };

    const SidebarContent = ({ forceFull = false }) => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.border}`, opacity: headerIn ? 1 : 0, transform: headerIn ? 'translateY(0)' : 'translateY(-8px)', transition: 'opacity 0.4s ease,transform 0.4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: roleMeta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${roleMeta.accent}44` }}><Activity size={18} color="#fff" /></div>
                    <div>
                        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px', color: t.text, display: 'block' }}>HMS<span style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Care</span></span>
                        <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{roleMeta.label}</span>
                    </div>
                </div>
                {forceFull && <button onClick={() => setMobileMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSub, padding: 4, display: 'flex', borderRadius: 8 }}><X size={18} /></button>}
            </div>
            <div style={{ padding: '10px 14px 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: roleMeta.accent + '12', border: `1px solid ${roleMeta.accent}22` }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: roleMeta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><roleMeta.icon size={14} color="#fff" /></div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{staff?.fullName || staff?.name || roleMeta.label}</p>
                        <p style={{ fontSize: 10, color: roleMeta.accent, fontWeight: 700 }}>{staff?.employeeId || `${roleMeta.tag}-0001`}</p>
                    </div>
                </div>
            </div>
            <nav style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                {navItems.map(({ id, icon: Icon, label }, idx) => {
                    const isActive = section === id;
                    return (
                        <button key={id} onClick={() => goTo(id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit', background: isActive ? (isDark ? `${roleMeta.accent}22` : `${roleMeta.accent}11`) : 'transparent', color: isActive ? roleMeta.accent : t.textSub, fontWeight: isActive ? 600 : 400, fontSize: 14, minHeight: 44, opacity: navMounted ? 1 : 0, transform: navMounted ? 'translateX(0)' : 'translateX(-14px)', transition: `opacity 0.35s ease ${idx * 0.04}s,transform 0.35s cubic-bezier(0.34,1.2,0.64,1) ${idx * 0.04}s,background 0.15s,color 0.15s` }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.hover; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                            <Icon size={18} style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>{label}</span>
                            {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: roleMeta.accent, flexShrink: 0 }} />}
                        </button>
                    );
                })}
            </nav>
            <div style={{ padding: '10px 8px', borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', color: ROSE, fontSize: 14, fontWeight: 500, background: 'none', border: 'none', width: '100%', fontFamily: 'inherit', minHeight: 44, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(225,29,72,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={18} style={{ flexShrink: 0 }} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden', background: t.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: t.text, transition: 'background 0.3s' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
                *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
                ::-webkit-scrollbar{width:4px;height:4px;}
                ::-webkit-scrollbar-track{background:transparent;}
                ::-webkit-scrollbar-thumb{background:rgba(128,128,128,0.2);border-radius:10px;}
                @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
                @keyframes fadeIn{from{opacity:0}to{opacity:1}}
                @keyframes slideRight{from{transform:translateX(-100%)}to{transform:translateX(0)}}
                @keyframes headerSlide{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}
                @keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
                select option{background:#1a1a2e;color:#e6edf3;}
            `}</style>

            {!isMobile && (
                <aside style={{ width: 240, height: '100dvh', background: t.sidebar, borderRight: `1px solid ${t.border}`, position: 'sticky', top: 0, flexShrink: 0, zIndex: 100, boxShadow: isDark ? '2px 0 20px rgba(0,0,0,0.3)' : '2px 0 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', transition: 'background 0.3s' }}>
                    <SidebarContent />
                </aside>
            )}

            {isMobile && mobileMenu && (
                <>
                    <div onClick={() => setMobileMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, animation: 'fadeIn 0.2s ease' }} />
                    <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 270, background: t.sidebar, zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '6px 0 32px rgba(0,0,0,0.3)', animation: 'slideRight 0.24s ease' }}>
                        <SidebarContent forceFull />
                    </aside>
                </>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, height: '100%' }}>
                <header style={{ height: isMobile ? 56 : 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 12px' : '0 20px', background: t.sidebar, borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, zIndex: 50, gap: 8, flexShrink: 0, animation: 'headerSlide 0.35s ease both 0.05s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <button onClick={() => isMobile && setMobileMenu(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSub, display: 'flex', padding: 6, borderRadius: 8, minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center' }}><Menu size={20} /></button>
                        {isMobile && <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px', color: t.text }}>HMS<span style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Care</span></span>}
                        {!isMobile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.input, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}` }}>
                                <Search size={14} color={t.textMuted} />
                                <input placeholder="Search patients, records..." style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: 200, fontFamily: 'inherit' }} />
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, flexShrink: 0 }}>
                        <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub }}>{isDark ? <Sun size={16} /> : <Moon size={16} />}</button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px', borderRadius: 10, transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = t.hover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: roleMeta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13 }}>{initials(staff?.fullName || staff?.name)}</div>
                            {!isMobile && <>
                                <div style={{ minWidth: 0 }}>
                                    <span style={{ fontWeight: 600, fontSize: 13, color: t.text, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{staff?.fullName || staff?.name || roleMeta.label}</span>
                                    <span style={{ fontSize: 11, color: roleMeta.accent, fontWeight: 700 }}>{roleMeta.label}</span>
                                </div>
                                <ChevronDown size={14} color={t.textMuted} />
                            </>}
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isMobile ? '14px 12px 80px' : '24px', height: 0 }}>
                    <div style={{ maxWidth: 960, width: '100%', animation: 'fadeUp 0.3s ease' }} key={section}>
                        {renderSection()}
                    </div>
                </main>

                {isMobile && (
                    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: t.sidebar, borderTop: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingTop: 8, paddingBottom: 12, zIndex: 100, boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' }}>
                        {BOTTOM_NAV.map(({ id, icon: Icon, label }) => {
                            const isActive = section === id;
                            return (
                                <button key={id} onClick={() => goTo(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 8px', borderRadius: 12, border: 'none', cursor: 'pointer', background: isActive ? (isDark ? `${roleMeta.accent}20` : `${roleMeta.accent}10`) : 'transparent', color: isActive ? roleMeta.accent : t.textMuted, fontFamily: 'inherit', flex: 1, transition: 'color 0.2s', minHeight: 48 }}>
                                    <Icon size={21} style={{ transform: isActive ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.2s' }} />
                                    <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</span>
                                </button>
                            );
                        })}
                        {MORE_NAV.length > 0 && (
                            <button onClick={() => setMobileMenu(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 8px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'transparent', color: t.textMuted, fontFamily: 'inherit', flex: 1, minHeight: 48 }}>
                                <MoreHorizontal size={21} />
                                <span style={{ fontSize: 10 }}>More</span>
                            </button>
                        )}
                    </nav>
                )}
            </div>
        </div>
    );
}