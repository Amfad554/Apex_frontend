import { useState, useEffect } from 'react';
import { CopyCheck, KeyRound, Search, X, Trash2, ChevronDown, Clock, Share2, RefreshCw } from 'lucide-react';

/* ─── Brand Tokens ──────────────────────────────────────────────────────────── */
const ORANGE  = '#FF5A1F';
const ORANGE2 = '#e64d15';

const C = {
    pageBg:    '#F5F7FA',
    card:      '#ffffff',
    cardAlt:   '#F5F7FA',
    border:    'rgba(10,26,63,0.08)',
    shadow:    '0 2px 12px rgba(10,26,63,0.06)',
    text:      '#0A1A3F',
    textSub:   '#374151',
    textMuted: '#6B7280',
    input:     '#F5F7FA',
    hover:     'rgba(255,90,31,0.04)',
};

const ROLE_COLOR = {
    doctor:       '#0E6E77',
    nurse:        '#059669',
    pharmacist:   '#6847C2',
    lab_staff:    '#B45309',
    receptionist: '#be185d',
    patient:      ORANGE,
};

const TYPE_STYLE = {
    patient: { bg: 'rgba(255,90,31,0.1)',  text: ORANGE,    label: 'Patient' },
    staff:   { bg: 'rgba(14,110,119,0.1)', text: '#0E6E77', label: 'Staff'   },
};

/* ─── Portal URLs ────────────────────────────────────────────────────────────
   Update these if your routes are different                                   */
const PATIENT_PORTAL = `${window.location.origin}/patientlogin`;
const STAFF_PORTAL   = `${window.location.origin}/stafflogin`;

/* ─── Storage helpers ────────────────────────────────────────────────────────*/
const STORAGE_KEY = 'hmscare_credentials_log';

export function saveCredential(entry) {
    try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const record   = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString(), ...entry };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]));
        return record;
    } catch { return null; }
}

export function loadCredentials() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function deleteCredential(id) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loadCredentials().filter(c => c.id !== id)));
}

function clearAll() { localStorage.removeItem(STORAGE_KEY); }

/* ─── WhatsApp message builder ───────────────────────────────────────────────*/
function formatWhatsApp(c) {
    const portal = c.type === 'patient' ? PATIENT_PORTAL : STAFF_PORTAL;
    const role   = c.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    if (c.type === 'patient') {
        return [
            `🏥 *HMSCare – Patient Login Credentials*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            `👤 *Name:* ${c.fullName}`,
            `🔢 *Patient Number:* ${c.patientNumber}`,
            ``,
            `📧 *Email (tap to copy):*`,
            c.email ? c.email : `_(no email provided)_`,
            ``,
            `🔑 *Password (tap to copy):*`,
            c.tempPassword,
            ``,
            `━━━━━━━━━━━━━━━━━━━━`,
            `📱 *Login portal:*`,
            portal,
            ``,
            `⚠️ Please change your password after your first login.`,
        ].filter(line => line !== null && line !== undefined).join('\n');
    }

    return [
        `🏥 *HMSCare – Staff Login Credentials*`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `👤 *Name:* ${c.fullName}`,
        role ? `🏷️ *Role:* ${role}` : null,
        c.employeeId ? `🔢 *Employee ID:* ${c.employeeId}` : null,
        c.hospitalName ? `🏨 *Hospital:* ${c.hospitalName}` : null,
        ``,
        `📧 *Email (tap to copy):*`,
        c.email || `_(no email provided)_`,
        ``,
        `🔑 *Password (tap to copy):*`,
        c.tempPassword,
        ``,
        `━━━━━━━━━━━━━━━━━━━━`,
        `📱 *Login portal:*`,
        portal,
        ``,
        `⚠️ Please change your password after your first login.`,
    ].filter(Boolean).join('\n');
}

/* ─── Open WhatsApp directly with pre-filled message ─────────────────────────
   If the patient/staff has a phone number saved, opens their chat directly.
   Otherwise opens WhatsApp with the message pre-filled (user picks contact).  */
function sendWhatsApp(c) {
    const text     = encodeURIComponent(formatWhatsApp(c));
    const rawPhone = (c.phone || '').replace(/\D/g, '');
    const url      = rawPhone
        ? `https://wa.me/${rawPhone}?text=${text}`
        : `https://wa.me/?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}


/* ─── Main Component ─────────────────────────────────────────────────────────*/
export default function CredentialsHistory({ isMobile }) {
    const [records,      setRecords]  = useState([]);
    const [search,       setSearch]   = useState('');
    const [filterType,   setFilter]   = useState('all');
    const [expandedId,   setExpanded] = useState(null);
    const [confirmClear, setConfirm]  = useState(false);
    const [sentId,       setSentId]   = useState(null);

    const reload = () => setRecords(loadCredentials());
    useEffect(() => { reload(); }, []);

    const filtered = records.filter(r => {
        const matchType = filterType === 'all' || r.type === filterType;
        const q = search.toLowerCase();
        return matchType && (!q ||
            r.fullName?.toLowerCase().includes(q) ||
            r.email?.toLowerCase().includes(q) ||
            r.patientNumber?.toLowerCase().includes(q) ||
            r.employeeId?.toLowerCase().includes(q) ||
            r.role?.toLowerCase().includes(q)
        );
    });

    const handleSend = (c) => {
        sendWhatsApp(c);
        setSentId(c.id);
        setTimeout(() => setSentId(null), 3000);
    };

    const remove = (id) => { deleteCredential(id); reload(); };

    const handleClearAll = () => {
        if (confirmClear) { clearAll(); reload(); setConfirm(false); }
        else { setConfirm(true); setTimeout(() => setConfirm(false), 3000); }
    };

    const timeAgo = (iso) => {
        const diff = Date.now() - new Date(iso).getTime(), m = Math.floor(diff / 60000);
        if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    const ghostBtn = (extra = {}) => ({
        display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
        color: C.textSub, fontWeight: 600, fontSize: 13,
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', ...extra,
    });

    return (
        <div style={{ color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: ORANGE, marginBottom: 10 }} />
                    <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4, color: C.text }}>Credentials Log</h1>
                    <p style={{ color: C.textSub, fontSize: 13 }}>{records.length} records saved · Send login details via WhatsApp</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={reload} style={ghostBtn()}
                        onMouseEnter={e => e.currentTarget.style.borderColor = ORANGE}
                        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    {records.length > 0 && (
                        <button onClick={handleClearAll} style={ghostBtn({
                            background: confirmClear ? 'rgba(239,68,68,0.08)' : C.card,
                            border: `1px solid ${confirmClear ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`,
                            color: '#ef4444'
                        })}>
                            <Trash2 size={14} /> {confirmClear ? 'Confirm Clear All' : 'Clear All'}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filters ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.input, borderRadius: 10, padding: '8px 14px', border: `1px solid ${C.border}`, flex: 1 }}>
                    <Search size={14} color={C.textMuted} />
                    <input placeholder="Search by name, email, ID…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ background: 'none', border: 'none', outline: 'none', color: C.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex' }}><X size={13} /></button>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {['all', 'patient', 'staff'].map(f => {
                        const active = filterType === f;
                        return (
                            <button key={f} onClick={() => setFilter(f)}
                                style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${active ? ORANGE : C.border}`, background: active ? 'rgba(255,90,31,0.08)' : C.card, color: active ? ORANGE : C.textSub, fontWeight: active ? 700 : 500, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                                {f === 'all' ? `All (${records.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)}s (${records.filter(r => r.type === f).length})`}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Empty state ── */}
            {filtered.length === 0 && (
                <div style={{ padding: '60px 20px', textAlign: 'center', background: C.card, borderRadius: 20, border: `1.5px dashed ${C.border}` }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,90,31,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <KeyRound size={22} color={ORANGE} strokeWidth={1.5} />
                    </div>
                    <p style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{search ? 'No matching records' : 'No credentials saved yet'}</p>
                    <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Credentials will appear here after registering patients or staff</p>
                </div>
            )}

            {/* ── Records list ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(c => {
                    const ts         = TYPE_STYLE[c.type] || TYPE_STYLE.staff;
                    const roleColor  = ROLE_COLOR[c.role] || ROLE_COLOR[c.type] || '#0E6E77';
                    const isExpanded = expandedId === c.id;
                    const isSent     = sentId === c.id;
                    const portalUrl  = c.type === 'patient' ? PATIENT_PORTAL : STAFF_PORTAL;

                    return (
                        <div key={c.id}
                            style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: C.shadow }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,90,31,0.3)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(10,26,63,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = C.shadow; }}
                        >
                            {/* Row */}
                            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : c.id)}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: roleColor + '15', color: roleColor, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {c.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                                        <p style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{c.fullName}</p>
                                        <span style={{ background: ts.bg, color: ts.text, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{ts.label}</span>
                                        {c.role && c.type === 'staff' && (
                                            <span style={{ background: roleColor + '12', color: roleColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>
                                                {c.role.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, color: C.textMuted }}>{c.email || c.patientNumber}</span>
                                        <span style={{ fontSize: 11, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{timeAgo(c.createdAt)}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                                    {/* ── WhatsApp Send Button ── */}
                                    <button onClick={e => { e.stopPropagation(); handleSend(c); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            padding: '7px 12px', borderRadius: 9,
                                            border: `1px solid ${isSent ? 'rgba(37,211,102,0.4)' : 'rgba(37,211,102,0.35)'}`,
                                            background: isSent ? 'rgba(37,211,102,0.12)' : 'rgba(37,211,102,0.08)',
                                            color: '#16a34a', fontWeight: 700, fontSize: 12,
                                            cursor: 'pointer', fontFamily: 'inherit',
                                            transition: 'all 0.2s', whiteSpace: 'nowrap'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.16)'}
                                        onMouseLeave={e => e.currentTarget.style.background = isSent ? 'rgba(37,211,102,0.12)' : 'rgba(37,211,102,0.08)'}
                                        title={c.phone ? `Send to ${c.phone}` : 'Open WhatsApp to send'}
                                    >
                                        {/* WhatsApp icon SVG */}
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        {isSent ? 'Opening…' : 'Send'}
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); remove(c.id); }}
                                        style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}>
                                        <Trash2 size={13} />
                                    </button>
                                    <ChevronDown size={15} color={C.textMuted} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                                </div>
                            </div>

                            {/* Expanded */}
                            {isExpanded && (
                                <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 16px', background: C.cardAlt }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 12 }}>
                                        {[
                                            c.type === 'patient' && { label: 'Patient Number', value: c.patientNumber, mono: true, color: '#0E6E77' },
                                            c.type === 'staff' && c.employeeId && { label: 'Employee ID', value: c.employeeId, mono: true, color: '#0E6E77' },
                                            { label: 'Email', value: c.email || '—' },
                                            c.phone && { label: 'Phone', value: c.phone },
                                            { label: 'Password', value: c.tempPassword, mono: true, color: ORANGE, sensitive: true },
                                            c.hospitalName && { label: 'Hospital', value: c.hospitalName },
                                            { label: 'Portal Link', value: portalUrl, mono: false, color: '#2563eb' },
                                            { label: 'Registered', value: new Date(c.createdAt).toLocaleString() },
                                        ].filter(Boolean).map(({ label, value, mono, color, sensitive }) => (
                                            <div key={label} style={{ background: sensitive ? 'rgba(255,90,31,0.06)' : C.card, borderRadius: 10, padding: '10px 13px', border: `1px solid ${sensitive ? 'rgba(255,90,31,0.2)' : C.border}` }}>
                                                <p style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                                                <p style={{ fontSize: mono ? 15 : 13, fontWeight: 700, color: color || C.text, fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? '0.08em' : 'normal', wordBreak: 'break-all' }}>{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* WhatsApp preview */}
                                    <div style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                                        <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp Message Preview</p>
                                        <pre style={{ fontSize: 12, color: C.textSub, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{formatWhatsApp(c)}</pre>
                                    </div>

                                    <button onClick={() => handleSend(c)}
                                        style={{ width: '100%', padding: 11, background: `linear-gradient(135deg,#25D366 0%,#128C7E 100%)`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        {c.phone ? `Send via WhatsApp to ${c.phone}` : 'Open WhatsApp to Send'}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}