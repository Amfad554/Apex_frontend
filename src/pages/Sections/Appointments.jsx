import { useState, useEffect } from 'react';
import { Plus, Search, X, CheckCircle2, XCircle, AlertCircle, Loader } from 'lucide-react';
import { appointmentsAPI, staffAPI, patientsAPI } from '../../Services/api.js';

const PALETTE = {
    navy: '#0A1A3F',
    softNavy: '#1F2A44',
    orange: '#FF5A1F',
    white: '#FFFFFF',
    navyBorder: 'rgba(255,255,255,0.08)',
    navySub: 'rgba(255,255,255,0.55)',
    navyMuted: 'rgba(255,255,255,0.30)',
    navyHover: 'rgba(255,255,255,0.06)',
    cardAlt: 'rgba(255,255,255,0.03)',
    shadow: '0 4px 24px rgba(0,0,0,0.35)',
};

const ACCENT = {
    orange: '#FF5A1F',
    teal: '#18A8B5',
    green: '#10B981',
    red: '#EF4444',
    amber: '#F59E0B',
};

const t = {
    card: PALETTE.softNavy,
    cardAlt: PALETTE.cardAlt,
    border: PALETTE.navyBorder,
    shadow: PALETTE.shadow,
    text: PALETTE.white,
    textSub: PALETTE.navySub,
    textMuted: PALETTE.navyMuted,
    input: 'rgba(255,255,255,0.05)',
    hover: PALETTE.navyHover,
};

const STATUS_COLORS = {
    scheduled: { bg: 'rgba(255,90,31,0.15)', text: PALETTE.orange },
    completed: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
    no_show: { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af' },
};

const AVATAR_COLORS = [
    PALETTE.orange, '#18A8B5', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981',
];

function Toast({ message, type = 'success', onClose }) {
    useEffect(() => { const id = setTimeout(onClose, 4000); return () => clearTimeout(id); }, []);
    const colors = {
        success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', text: '#34d399' },
        error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)', text: '#f87171' },
        info: { bg: 'rgba(24,168,181,0.15)', border: 'rgba(24,168,181,0.35)', text: '#18A8B5' },
    };
    const c = colors[type] || colors.info;
    return (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 12, padding: '14px 18px', minWidth: 280, maxWidth: 'calc(100vw - 40px)', boxShadow: '0 8px 30px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-start', gap: 10, animation: 'toastIn 0.3s cubic-bezier(0.21,1.02,0.73,1) forwards' }}>
            <style>{`@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.6, padding: 0, display: 'flex' }}><X size={15} /></button>
        </div>
    );
}

export function Appointments({ hospital, isMobile }) {
    const [appointments, setAppts] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showBook, setShowBook] = useState(false);
    const [submitting, setSubmit] = useState(false);
    const [formError, setFormError] = useState('');
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ patientId: '', doctorId: '', appointmentDate: '', appointmentTime: '', reason: '', notes: '' });

    const hospitalId = hospital?.id;
    const showToast = (message, type = 'success') => setToast({ message, type });

    const load = async () => {
        if (!hospitalId) return;
        try {
            setLoading(true); setError('');
            const params = {};
            if (filter !== 'All') params.status = filter.toLowerCase();
            const [apptsRes, staffRes, patientsRes] = await Promise.all([
                appointmentsAPI.list(hospitalId, params),
                staffAPI.list(hospitalId, { role: 'doctor' }),
                patientsAPI.list(hospitalId),
            ]);
            setAppts(apptsRes.appointments || []);
            setDoctors(staffRes.staff || []);
            setPatients(patientsRes.patients || []);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [hospitalId, filter]);

    const handleBook = async (e) => {
        e.preventDefault();
        if (!form.patientId || !form.doctorId || !form.appointmentDate || !form.appointmentTime || !form.reason) {
            setFormError('All fields except notes are required.'); return;
        }
        try {
            setSubmit(true); setFormError('');
            await appointmentsAPI.create(form);
            setShowBook(false);
            setForm({ patientId: '', doctorId: '', appointmentDate: '', appointmentTime: '', reason: '', notes: '' });
            showToast('Appointment booked successfully!');
            load();
        } catch (err) { setFormError(err.message); }
        finally { setSubmit(false); }
    };

    const updateStatus = async (id, status) => {
        try {
            await appointmentsAPI.updateStatus(id, status);
            setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            showToast(`Appointment marked as ${status}`);
        } catch (err) { showToast(err.message, 'error'); }
    };

    const filtered = appointments.filter(a =>
        a.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        a.doctor?.fullName?.toLowerCase().includes(search.toLowerCase())
    );

    const counts = { scheduled: 0, completed: 0, cancelled: 0 };
    appointments.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

    const inputStyle = {
        width: '100%', background: t.input, border: `1px solid ${t.border}`,
        borderRadius: 10, padding: '10px 14px', color: t.text, fontSize: 13,
        outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
    };
    const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 6 };

    return (
        /* ── No background/minHeight/padding here — shell owns that ── */
        <div style={{ color: PALETTE.white, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 12 }}>
                <div>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: PALETTE.orange, marginBottom: 10 }} />
                    <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4, color: PALETTE.white }}>
                        Appointments
                    </h1>
                    <p style={{ color: t.textSub, fontSize: 13 }}>{appointments.length} total</p>
                </div>
                <button onClick={() => setShowBook(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '9px 14px' : '10px 20px', background: `linear-gradient(135deg,${PALETTE.orange} 0%,#FF8C55 100%)`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: isMobile ? 13 : 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(255,90,31,0.35)', flexShrink: 0, transition: 'transform 0.15s ease,box-shadow 0.15s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,90,31,0.55)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,90,31,0.35)'; }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; }}
                >
                    <Plus size={16} /> {isMobile ? 'Book' : 'Book Appointment'}
                </button>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: isMobile ? 10 : 16, marginBottom: 24 }}>
                {[
                    { label: 'Scheduled', count: counts.scheduled, icon: AlertCircle, color: ACCENT.orange },
                    { label: 'Completed', count: counts.completed, icon: CheckCircle2, color: ACCENT.green },
                    { label: 'Cancelled', count: counts.cancelled, icon: XCircle, color: ACCENT.red },
                ].map(({ label, count, icon: Icon, color }) => (
                    <div key={label} style={{ background: t.card, borderRadius: 14, padding: isMobile ? '14px 12px' : '18px 20px', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14 }}>
                        <div style={{ width: isMobile ? 34 : 42, height: isMobile ? 34 : 42, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={isMobile ? 16 : 20} color={color} />
                        </div>
                        <div>
                            <p style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, lineHeight: 1, color: PALETTE.white }}>{count}</p>
                            <p style={{ fontSize: isMobile ? 10 : 12, color: t.textSub, marginTop: 3 }}>{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.input, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, flex: 1 }}>
                    <Search size={15} color={t.textMuted} />
                    <input placeholder="Search by patient or doctor…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: PALETTE.white, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: isMobile ? 2 : 0 }}>
                    {['All', 'Scheduled', 'Completed', 'Cancelled'].map(s => {
                        const active = filter === s;
                        return (
                            <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${active ? PALETTE.orange : t.border}`, background: active ? 'rgba(255,90,31,0.15)' : t.card, color: active ? PALETTE.orange : t.textSub, fontWeight: active ? 700 : 400, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.15s ease' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={e => e.currentTarget.style.transform = ''}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            >{s}</button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
                </div>
            ) : error ? (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 20, color: '#ef4444' }}>{error}</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
                    {filtered.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: t.textMuted, background: t.card, borderRadius: 18, border: `1px solid ${t.border}` }}>No appointments found</div>
                    ) : filtered.map((a, i) => {
                        const sc = STATUS_COLORS[a.status] || STATUS_COLORS.scheduled;
                        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                        const avatar = a.patient?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        return (
                            <div key={a.id} style={{ background: t.card, borderRadius: 16, padding: 18, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '22', color, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{avatar}</div>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: 14, color: PALETTE.white }}>{a.patient?.fullName}</p>
                                            <p style={{ fontSize: 11, color: t.textMuted }}>{a.patient?.patientNumber}</p>
                                        </div>
                                    </div>
                                    <span style={{ background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, textTransform: 'capitalize', flexShrink: 0 }}>{a.status}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                                    {[
                                        { label: 'Doctor', value: a.doctor?.fullName },
                                        { label: 'Reason', value: a.reason },
                                        { label: 'Department', value: a.doctor?.department || '—' },
                                        { label: 'Date', value: new Date(a.appointmentDate).toLocaleDateString() },
                                    ].map(({ label, value }) => (
                                        <div key={label} style={{ background: t.cardAlt, borderRadius: 8, padding: '8px 10px', border: `1px solid ${t.border}` }}>
                                            <p style={{ fontSize: 10, color: t.textMuted, marginBottom: 2 }}>{label}</p>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: PALETTE.white }}>{value || '—'}</p>
                                        </div>
                                    ))}
                                </div>
                                {a.status === 'scheduled' && (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => updateStatus(a.id, 'completed')} style={{ flex: 1, padding: '7px', background: 'rgba(16,185,129,0.15)', border: 'none', borderRadius: 8, color: ACCENT.green, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.28)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; e.currentTarget.style.transform = ''; }}
                                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                        >Complete</button>
                                        <button onClick={() => updateStatus(a.id, 'cancelled')} style={{ flex: 1, padding: '7px', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, color: ACCENT.red, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = ''; }}
                                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                        >Cancel</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Book Modal */}
            {showBook && (
                <div onClick={e => e.target === e.currentTarget && setShowBook(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, overflowY: 'auto', padding: isMobile ? '16px' : '40px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100vh' }}>
                    <div style={{ background: t.card, borderRadius: 20, width: '100%', maxWidth: 520, border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', flexShrink: 0, marginTop: isMobile ? 16 : 40, marginBottom: 40 }}>
                        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ width: 24, height: 3, borderRadius: 2, background: PALETTE.orange, marginBottom: 6 }} />
                                <h2 style={{ fontWeight: 700, fontSize: 16, color: PALETTE.white }}>Book Appointment</h2>
                            </div>
                            <button onClick={() => setShowBook(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', color: '#ef4444', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.15s ease,background 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = ''; }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'}
                            ><X size={16} /></button>
                        </div>
                        <form onSubmit={handleBook} style={{ padding: '20px' }}>
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
                                    <label style={labelStyle}>Doctor *</label>
                                    <select required style={inputStyle} value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
                                        <option value="">Select doctor</option>
                                        {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}{d.specialty ? ` — ${d.specialty}` : ''}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Date *</label>
                                    <input type="date" required style={inputStyle} value={form.appointmentDate} onChange={e => setForm({ ...form, appointmentDate: e.target.value })} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Time *</label>
                                    <input type="time" required style={inputStyle} value={form.appointmentTime} onChange={e => setForm({ ...form, appointmentTime: e.target.value })} />
                                </div>
                                <div style={{ gridColumn: '1/-1' }}>
                                    <label style={labelStyle}>Reason *</label>
                                    <input required style={inputStyle} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Follow-up consultation" />
                                </div>
                                <div style={{ gridColumn: '1/-1' }}>
                                    <label style={labelStyle}>Notes</label>
                                    <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes…" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button type="button" onClick={() => setShowBook(false)} style={{ flex: 1, padding: '11px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.textSub, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, transition: 'all 0.15s ease' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = t.hover; e.currentTarget.style.transform = 'scale(1.02)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                >Cancel</button>
                                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '11px', background: `linear-gradient(135deg,${PALETTE.orange} 0%,#FF8C55 100%)`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, opacity: submitting ? 0.7 : 1, transition: 'transform 0.15s ease,box-shadow 0.15s ease' }}
                                    onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,90,31,0.45)'; } }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                    onMouseUp={e => e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'}
                                >{submitting ? 'Booking…' : 'Book Appointment'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Appointments;