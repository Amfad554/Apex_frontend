import { useState, useEffect } from 'react';
import { UserPlus, Search, X, Eye, Trash2, Droplets, Loader, AlertCircle, Copy, CopyCheck, KeyRound, Phone, Mail, User, Heart, MapPin, Users } from 'lucide-react';
import { patientsAPI } from '../../Services/api.js';
import { saveCredential } from './CredentialsHistory.jsx';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const T = {
    navy:      '#0A1A3F',
    softNavy:  '#1F2A44',
    orange:    '#FF5A1F',
    lightGray: '#F5F7FA',
};

const AVATAR_COLORS = [T.orange, '#10b981', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#7c3aed', '#059669'];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
    useEffect(() => { const id = setTimeout(onClose, 4000); return () => clearTimeout(id); }, []);
    const isSuccess = type === 'success';
    return (
        <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 99999,
            background: isSuccess ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${isSuccess ? '#86efac' : '#fca5a5'}`,
            color: isSuccess ? '#166534' : '#991b1b',
            borderRadius: 12, padding: '14px 18px',
            minWidth: 280, maxWidth: 'calc(100vw - 40px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
            animation: 'toastIn 0.3s cubic-bezier(0.21,1.02,0.73,1) forwards',
        }}>
            <style>{`
                @keyframes toastIn { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
                @keyframes spin     { to{transform:rotate(360deg)} }
            `}</style>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{message}</span>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', opacity:0.6, padding:0, display:'flex' }}><X size={15} /></button>
        </div>
    );
}

// ─── Credentials Modal ────────────────────────────────────────────────────────
function CredentialsModal({ credentials, t, isMobile, onClose }) {
    const [copiedField, setCopiedField] = useState(null);

    const copy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const CopyBtn = ({ text, field, accent }) => (
        <button onClick={() => copy(text, field)}
            style={{ background: copiedField === field ? 'rgba(16,185,129,0.15)' : `${accent}18`, border: `1px solid ${copiedField === field ? 'rgba(16,185,129,0.3)' : `${accent}44`}`, borderRadius: 8, cursor: 'pointer', color: copiedField === field ? '#10b981' : accent, display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', fontSize: 12, fontWeight: 600, transition: 'all .18s', whiteSpace: 'nowrap' }}>
            {copiedField === field ? <><CopyCheck size={13} />Copied</> : <><Copy size={13} />Copy</>}
        </button>
    );

    const Row = ({ label, children, accent }) => (
        <div style={{ marginBottom: 10, background: accent ? `${accent}0d` : (t.cardAlt || 'rgba(0,0,0,0.04)'), borderRadius: 12, padding: '12px 16px', border: `1px solid ${accent ? `${accent}33` : t.border}` }}>
            <p style={{ fontSize: 11, color: accent || t.textMuted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{label}</p>
            {children}
        </div>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 16 : 24 }}>
            <div style={{ background: t.card, borderRadius: 20, width: '100%', maxWidth: 440, border: `1.5px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                <div style={{ background: T.navy, borderBottom: `3px solid ${T.orange}`, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${T.orange}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <KeyRound size={18} color={T.orange} />
                        </div>
                        <div>
                            <p style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Patient Registered!</p>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>Share these credentials with the patient</p>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '20px 24px' }}>
                    <p style={{ fontSize: 12, color: t.textSub, marginBottom: 14, lineHeight: 1.7, background: `${T.orange}0d`, border: `1px solid ${T.orange}33`, borderRadius: 8, padding: '9px 12px' }}>
                        ⚠️ Copy and share these credentials manually — they <strong>won't be shown again</strong>.
                    </p>
                    <Row label="Patient Name">
                        <p style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{credentials.fullName}</p>
                    </Row>
                    <Row label="Patient Number (Login ID)" accent={T.orange}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <p style={{ fontSize: 20, fontWeight: 900, color: T.orange, letterSpacing: '0.06em', fontFamily: 'monospace' }}>{credentials.patientNumber}</p>
                            <CopyBtn text={credentials.patientNumber} field="patientNumber" accent={T.orange} />
                        </div>
                    </Row>
                    <Row label="Temporary Password" accent="#f59e0b">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <p style={{ fontSize: 20, fontWeight: 900, color: '#f59e0b', letterSpacing: '0.1em', fontFamily: 'monospace' }}>{credentials.tempPassword}</p>
                            <CopyBtn text={credentials.tempPassword} field="tempPassword" accent="#f59e0b" />
                        </div>
                    </Row>
                    {credentials.email && (
                        <Row label="Email">
                            <p style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{credentials.email}</p>
                        </Row>
                    )}
                    <div style={{ background: `${T.navy}14`, border: `1px solid ${T.navy}28`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: t.textSub, lineHeight: 1.8 }}>
                        <strong style={{ color: t.text }}>How to log in:</strong><br />
                        Go to <strong>/patientlogin</strong> → use <strong>email</strong> + password, or <strong>patient number</strong> as identifier.
                    </div>
                    <button onClick={onClose}
                        style={{ width: '100%', padding: '12px', background: T.orange, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 16px ${T.orange}44` }}
                        onMouseEnter={e => { e.currentTarget.style.opacity='.88'; e.currentTarget.style.transform='translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform=''; }}
                    >Done</button>
                </div>
            </div>
        </div>
    );
}

// ─── Shared close button ──────────────────────────────────────────────────────
function CloseBtn({ onClick }) {
    return (
        <button onClick={onClick}
            style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, cursor:'pointer', color:'#ef4444', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.2)'; e.currentTarget.style.transform='rotate(90deg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.transform=''; }}
        ><X size={16} /></button>
    );
}

// ─── View Patient Modal (MODIFIED FOR CENTRALIZATION) ─────────────────────────
function ViewPatientModal({ patient: p, t, isMobile, onClose }) {
    if (!p) return null;

    const avatar = p.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const InfoRow = ({ icon: Icon, label, value, accent, mono }) => (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            background: accent ? `${accent}0d` : 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            border: `1px solid ${accent ? `${accent}28` : t.border}`,
        }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: accent ? `${accent}18` : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={14} color={accent || 'rgba(255,255,255,0.4)'} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: accent || t.text, fontFamily: mono ? 'monospace' : 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</p>
            </div>
        </div>
    );

    return (
        <div
            onClick={e => e.target === e.currentTarget && onClose()}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.72)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center', // Centralized vertically
                justifyContent: 'center', // Centralized horizontally
                padding: isMobile ? 16 : 24,
            }}
        >
            <div style={{
                background: t.card,
                borderRadius: 20, // Rounded on all sides for centralization
                width: '100%',
                maxWidth: 480,
                border: `1.5px solid ${t.border}`,
                boxShadow: '0 12px 60px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                animation: 'modalFadeIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <style>{`@keyframes modalFadeIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

                <div style={{ background: T.navy, borderBottom: `3px solid ${T.orange}`, padding: isMobile ? '18px 20px' : '22px 24px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56, borderRadius: 15, background: `${T.orange}28`, color: T.orange, fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${T.orange}44` }}>
                                {avatar}
                            </div>
                            <div>
                                <h2 style={{ fontWeight: 800, fontSize: isMobile ? 15 : 18, color: '#fff', marginBottom: 3 }}>{p.fullName}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 11, color: T.orange, fontFamily: 'monospace', fontWeight: 700 }}>{p.patientNumber}</span>
                                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{p.gender}</span>
                                </div>
                            </div>
                        </div>
                        <CloseBtn onClick={onClose} />
                    </div>
                </div>

                <div style={{ padding: isMobile ? '16px' : '20px 24px', overflowY: 'auto', flex: 1 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Contact</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        <InfoRow icon={Phone} label="Phone"  value={p.phone} />
                        <InfoRow icon={Mail}  label="Email"  value={p.email || '—'} />
                        <InfoRow icon={MapPin} label="Address" value={p.address} />
                    </div>

                    <p style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Personal</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        <InfoRow icon={User}   label="Date of Birth" value={p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : '—'} />
                        <InfoRow icon={Heart}  label="Medical Conditions" value={p.medicalConditions || 'None recorded'} accent={p.medicalConditions ? '#f59e0b' : undefined} />
                    </div>

                    <button onClick={onClose} style={{ width: '100%', padding: '12px', background: T.orange, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 16px ${T.orange}44`, marginTop: 4 }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Patients({ isDark, t, hospital, isMobile }) {
    const [patients,     setPatients]   = useState([]);
    const [loading,      setLoading]    = useState(true);
    const [error,        setError]      = useState('');
    const [search,       setSearch]     = useState('');
    const [showRegister, setShowReg]    = useState(false);
    const [viewPatient,  setViewPatient] = useState(null);
    const [submitting,   setSubmitting] = useState(false);
    const [formError,    setFormError]  = useState('');
    const [toast,        setToast]      = useState(null);
    const [credentials,  setCredentials] = useState(null);
    const [focused,      setFocused]    = useState(null);
    const [form, setForm] = useState({
        fullName: '', dateOfBirth: '', gender: 'male', phone: '', email: '',
        address: '', bloodGroup: 'O+', medicalConditions: '',
        nextOfKinName: '', nextOfKinPhone: '',
    });

    const hospitalId = hospital?.id;
    const showToast  = (message, type = 'success') => setToast({ message, type });

    const inputStyle = (name) => ({
        width: '100%', background: t.input,
        border: `1.5px solid ${focused === name ? T.orange : t.border}`,
        borderRadius: 10, padding: '10px 14px', color: t.text, fontSize: 13,
        outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
        boxShadow: focused === name ? `0 0 0 3px ${T.orange}18` : 'none',
        transition: 'border-color .18s, box-shadow .18s',
    });

    const labelStyle = {
        display: 'block', fontSize: 11, fontWeight: 700,
        color: t.textMuted, marginBottom: 6,
        letterSpacing: '0.07em', textTransform: 'uppercase',
    };

    const modalOverlay = {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999,
        overflowY: 'auto', padding: isMobile ? '16px' : '40px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
    };

    const modalBox = (maxW = 560) => ({
        background: t.card, borderRadius: 20, width: '100%', maxWidth: maxW,
        border: `1.5px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        flexShrink: 0,
    });

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
    useEffect(() => { const id = setTimeout(() => loadPatients(search), 400); return () => clearTimeout(id); }, [search]);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.phone || !form.address || !form.dateOfBirth) {
            setFormError('Please fill all required fields.'); return;
        }
        try {
            setSubmitting(true); setFormError('');
            const res = await patientsAPI.create({ ...form });
            setShowReg(false);
            setForm({ fullName:'', dateOfBirth:'', gender:'male', phone:'', email:'', address:'', bloodGroup:'O+', medicalConditions:'', nextOfKinName:'', nextOfKinPhone:'' });
            loadPatients();
            const credEntry = {
                type: 'patient',
                fullName:      res.patient.fullName,
                patientNumber: res.patient.patientNumber,
                tempPassword:  res.tempPassword,
                email:         res.patient.email || null,
            };
            saveCredential(credEntry);
            setCredentials(credEntry);
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

    const ViewBtn = ({ onClick, size = 30 }) => (
        <button onClick={onClick}
            style={{ width:size, height:size, borderRadius:8, background:`${T.orange}12`, border:'none', cursor:'pointer', color:T.orange, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
        ><Eye size={14} /></button>
    );

    const DelBtn = ({ onClick, size = 30 }) => (
        <button onClick={onClick}
            style={{ width:size, height:size, borderRadius:8, background:'rgba(239,68,68,0.1)', border:'none', cursor:'pointer', color:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
        ><Trash2 size={14} /></button>
    );

    return (
        <div>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            {credentials && (
                <CredentialsModal credentials={credentials} t={t} isMobile={isMobile}
                    onClose={() => { setCredentials(null); showToast('Patient registered successfully!'); }} />
            )}

            {viewPatient && (
                <ViewPatientModal patient={viewPatient} t={t} isMobile={isMobile} onClose={() => setViewPatient(null)} />
            )}

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, gap:12 }}>
                <div>
                    <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight:900, letterSpacing:'-0.03em', color:t.text, marginBottom:3 }}>Patients</h1>
                    <p style={{ color:t.textSub, fontSize:13 }}>{patients.length} patients registered</p>
                </div>
                <button onClick={() => setShowReg(true)}
                    style={{ display:'flex', alignItems:'center', gap:7, padding: isMobile ? '9px 14px' : '10px 20px', background:T.orange, color:'#fff', border:'none', borderRadius:12, fontWeight:800, fontSize: isMobile ? 13 : 14, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 4px 16px ${T.orange}44`, flexShrink:0 }}
                >
                    <UserPlus size={16} /> {isMobile ? 'Add' : 'Register Patient'}
                </button>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:8, background:t.card, borderRadius:10, padding:'8px 14px', border:`1.5px solid ${focused === 'search' ? T.orange : t.border}`, marginBottom:20 }}>
                <Search size={15} color={t.textMuted} />
                <input
                    placeholder="Search by name or patient number…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onFocus={() => setFocused('search')}
                    onBlur={() => setFocused(null)}
                    style={{ background:'none', border:'none', outline:'none', color:t.text, fontSize:13, width:'100%', fontFamily:'inherit' }}
                />
            </div>

            {isMobile ? (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {loading ? (
                        <div style={{ padding:40, textAlign:'center', color:t.textMuted }}><Loader size={18} style={{ animation:'spin 1s linear infinite' }} /></div>
                    ) : patients.map((p, i) => {
                        const color  = AVATAR_COLORS[i % AVATAR_COLORS.length];
                        const avatar = p.fullName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                        return (
                            <div key={p.id} style={{ background:t.card, borderRadius:14, padding:'14px 16px', border:`1.5px solid ${t.border}`, display:'flex', alignItems:'center', gap:12 }}>
                                <div style={{ width:40, height:40, borderRadius:11, background:color+'22', color, fontWeight:800, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>{avatar}</div>
                                <div style={{ flex:1, minWidth:0 }}>
                                    <p style={{ fontWeight:700, fontSize:14, color:t.text }}>{p.fullName}</p>
                                    <p style={{ fontSize:11, color:t.textMuted }}>{p.patientNumber} · <span style={{ color:T.orange }}>{p.bloodGroup || '—'}</span></p>
                                </div>
                                <div style={{ display:'flex', gap:6 }}>
                                    <ViewBtn onClick={() => setViewPatient(p)} size={32} />
                                    <DelBtn  onClick={() => handleDelete(p.id)} size={32} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ background:t.card, borderRadius:18, border:`1.5px solid ${t.border}`, overflow:'hidden' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead>
                            <tr style={{ background:t.cardAlt, borderBottom:`2px solid ${T.orange}33` }}>
                                {['Patient','Patient No.','Gender','Blood','Actions'].map(h => (
                                    <th key={h} style={{ padding:'12px 18px', textAlign:'left', fontSize:10.5, fontWeight:700, color:t.textMuted, textTransform:'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((p, i) => {
                                const color  = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                const avatar = p.fullName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                                return (
                                    <tr key={p.id} style={{ borderBottom:`1px solid ${t.border}` }}>
                                        <td style={{ padding:'14px 18px' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                <div style={{ width:34, height:34, borderRadius:10, background:color+'22', color, fontWeight:800, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>{avatar}</div>
                                                <span style={{ fontWeight:700, fontSize:13, color:t.text }}>{p.fullName}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding:'14px 18px', fontSize: 12, color: T.orange, fontFamily: 'monospace' }}>{p.patientNumber}</td>
                                        <td style={{ padding:'14px 18px', fontSize: 13, color: t.textSub }}>{p.gender}</td>
                                        <td style={{ padding:'14px 18px', fontSize: 13, color: T.orange }}>{p.bloodGroup || '—'}</td>
                                        <td style={{ padding:'14px 18px' }}>
                                            <div style={{ display:'flex', gap:8 }}><ViewBtn onClick={() => setViewPatient(p)} /><DelBtn onClick={() => handleDelete(p.id)} /></div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showRegister && (
                <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setShowReg(false)}>
                    <div style={modalBox(600)}>
                        <div style={{ background: T.navy, padding: '24px', borderBottom: `3px solid ${T.orange}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>Register Patient</h2>
                            <CloseBtn onClick={() => setShowReg(false)} />
                        </div>
                        <form onSubmit={handleRegister} style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
                                <div><label style={labelStyle}>Full Name *</label><input style={inputStyle('fullName')} value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} /></div>
                                <div><label style={labelStyle}>DOB *</label><input type="date" style={inputStyle('dob')} value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} /></div>
                            </div>
                            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', background: T.orange, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800 }}>
                                {submitting ? 'Registering...' : 'Register Patient'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}