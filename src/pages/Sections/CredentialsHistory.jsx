import { useState, useEffect } from 'react';
import { Copy, CopyCheck, KeyRound, Search, X, Trash2, ChevronDown, Clock, Share2, RefreshCw } from 'lucide-react';

/* ─── Palette ──────────────────────────────────────────────────────────────── */
const PALETTE = {
    navy:       '#0A1A3F',
    softNavy:   '#1F2A44',
    orange:     '#FF5A1F',
    orangeHov:  '#FF7A45',
    lightGray:  '#F5F7FA',
    white:      '#FFFFFF',
    navyBorder: 'rgba(255,255,255,0.08)',
    navySub:    'rgba(255,255,255,0.55)',
    navyMuted:  'rgba(255,255,255,0.30)',
    navyHover:  'rgba(255,255,255,0.04)',
    cardAlt:    'rgba(255,255,255,0.03)',
    shadow:     '0 4px 24px rgba(0,0,0,0.35)',
};

/* t-object so internal refs stay tidy */
const t = {
    card:    PALETTE.softNavy,
    cardAlt: PALETTE.cardAlt,
    border:  PALETTE.navyBorder,
    shadow:  PALETTE.shadow,
    text:    PALETTE.white,
    textSub: PALETTE.navySub,
    textMuted: PALETTE.navyMuted,
    input:   'rgba(255,255,255,0.05)',
};

const STORAGE_KEY = 'hmscare_credentials_log';

/* ── helpers ───────────────────────────────────────────────────────────────── */
export function saveCredential(entry) {
    try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const record = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            createdAt: new Date().toISOString(),
            ...entry,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]));
        return record;
    } catch { return null; }
}

export function loadCredentials() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function deleteCredential(id) {
    const existing = loadCredentials();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter(c => c.id !== id)));
}

function clearAll() { localStorage.removeItem(STORAGE_KEY); }

/* ── WhatsApp formatter ────────────────────────────────────────────────────── */
function formatWhatsApp(c) {
    if (c.type === 'patient') {
        return [
            `🏥 *HMSCare – Patient Login Credentials*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            `👤 *Name:* ${c.fullName}`,
            `🔢 *Patient Number:* ${c.patientNumber}`,
            c.email ? `📧 *Email:* ${c.email}` : null,
            `🔑 *Temporary Password:* ${c.tempPassword}`,
            `━━━━━━━━━━━━━━━━━━━━`,
            `📱 *How to log in:*`,
            `🔗 ${window.location.origin}/patientlogin`,
            ``,
            `⚠️ Please change your password after first login.`,
        ].filter(Boolean).join('\n');
    }
    return [
        `🏥 *HMSCare – Staff Login Credentials*`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `👤 *Name:* ${c.fullName}`,
        `🏷️ *Role:* ${c.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        c.employeeId ? `🔢 *Employee ID:* ${c.employeeId}` : null,
        `📧 *Email:* ${c.email}`,
        `🔑 *Temporary Password:* ${c.tempPassword}`,
        c.hospitalName ? `🏨 *Hospital:* ${c.hospitalName}` : null,
        `━━━━━━━━━━━━━━━━━━━━`,
        `📱 *How to log in:*`,
        `🔗 ${window.location.origin}/stafflogin`,
        ``,
        `⚠️ Please change your password after first login.`,
    ].filter(Boolean).join('\n');
}

const TYPE_STYLE = {
    patient: { bg: 'rgba(255,90,31,0.12)',  text: PALETTE.orange,  label: 'Patient' },
    staff:   { bg: 'rgba(24,168,181,0.12)', text: '#18A8B5',       label: 'Staff'   },
};

const ROLE_COLOR = {
    doctor:       '#18A8B5',
    nurse:        '#34d399',
    pharmacist:   '#a78bfa',
    lab_staff:    '#fbbf24',
    receptionist: '#f472b6',
    patient:      PALETTE.orange,
};

/* ── Main Component ────────────────────────────────────────────────────────── */
export default function CredentialsHistory({ isMobile }) {
    const [records,      setRecords]      = useState([]);
    const [search,       setSearch]       = useState('');
    const [filterType,   setFilterType]   = useState('all');
    const [copiedId,     setCopiedId]     = useState(null);
    const [expandedId,   setExpandedId]   = useState(null);
    const [confirmClear, setConfirmClear] = useState(false);

    const reload = () => setRecords(loadCredentials());
    useEffect(() => { reload(); }, []);

    const filtered = records.filter(r => {
        const matchType = filterType === 'all' || r.type === filterType;
        const q = search.toLowerCase();
        const matchSearch = !q ||
            r.fullName?.toLowerCase().includes(q) ||
            r.email?.toLowerCase().includes(q) ||
            r.patientNumber?.toLowerCase().includes(q) ||
            r.employeeId?.toLowerCase().includes(q) ||
            r.role?.toLowerCase().includes(q);
        return matchType && matchSearch;
    });

    const fallbackCopy = (text, id) => {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(el);
        el.focus(); el.select();
        try {
            document.execCommand('copy');
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2500);
        } catch { alert('Copy failed. Please copy manually:\n\n' + text); }
        document.body.removeChild(el);
    };

    const copyWhatsApp = (c) => {
        const text = formatWhatsApp(c);
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .then(() => { setCopiedId(c.id); setTimeout(() => setCopiedId(null), 2500); })
                .catch(() => fallbackCopy(text, c.id));
        } else { fallbackCopy(text, c.id); }
    };

    const remove = (id) => { deleteCredential(id); reload(); };

    const handleClearAll = () => {
        if (confirmClear) { clearAll(); reload(); setConfirmClear(false); }
        else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); }
    };

    const timeAgo = (iso) => {
        const diff = Date.now() - new Date(iso).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    /* ── shared button base ── */
    const ghostBtn = (extra = {}) => ({
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '9px 14px',
        background: t.input,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        color: t.textSub,
        fontWeight: 600, fontSize: 13,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.15s',
        ...extra,
    });

    return (
        <div style={{
            background: PALETTE.navy,
            minHeight: '100vh',
            padding: isMobile ? 16 : 32,
            color: PALETTE.white,
            fontFamily: "'DM Sans','Segoe UI',sans-serif",
        }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: PALETTE.orange, marginBottom: 10 }} />
                    <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4, color: PALETTE.white }}>
                        Credentials Log
                    </h1>
                    <p style={{ color: t.textSub, fontSize: 13 }}>
                        {records.length} records saved · Copy &amp; send via WhatsApp anytime
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={reload} style={ghostBtn()}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    {records.length > 0 && (
                        <button onClick={handleClearAll} style={ghostBtn({
                            background: confirmClear ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
                            border: `1px solid ${confirmClear ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.2)'}`,
                            color: '#ef4444',
                        })}>
                            <Trash2 size={14} /> {confirmClear ? 'Confirm Clear All' : 'Clear All'}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filters ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexDirection: isMobile ? 'column' : 'row' }}>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.input, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, flex: 1 }}>
                    <Search size={14} color={t.textMuted} />
                    <input
                        placeholder="Search by name, email, ID…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ background: 'none', border: 'none', outline: 'none', color: PALETTE.white, fontSize: 13, width: '100%', fontFamily: 'inherit' }}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, display: 'flex' }}>
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Type pills */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {['all', 'patient', 'staff'].map(f => {
                        const active = filterType === f;
                        return (
                            <button key={f} onClick={() => setFilterType(f)} style={{
                                padding: '8px 14px', borderRadius: 10,
                                border: `1px solid ${active ? PALETTE.orange : t.border}`,
                                background: active ? 'rgba(255,90,31,0.15)' : t.card,
                                color: active ? PALETTE.orange : t.textSub,
                                fontWeight: active ? 700 : 400,
                                cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                                textTransform: 'capitalize', transition: 'all 0.15s',
                            }}>
                                {f === 'all'
                                    ? `All (${records.length})`
                                    : `${f.charAt(0).toUpperCase() + f.slice(1)}s (${records.filter(r => r.type === f).length})`}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Empty state ── */}
            {filtered.length === 0 && (
                <div style={{ padding: '60px 20px', textAlign: 'center', background: t.card, borderRadius: 20, border: `1.5px dashed ${t.border}` }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,90,31,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <KeyRound size={22} color={PALETTE.orange} strokeWidth={1.5} />
                    </div>
                    <p style={{ fontSize: 14, color: t.textMuted, fontWeight: 600 }}>
                        {search ? 'No matching records' : 'No credentials saved yet'}
                    </p>
                    <p style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
                        Credentials will appear here after registering patients or staff
                    </p>
                </div>
            )}

            {/* ── Records ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map((c) => {
                    const ts         = TYPE_STYLE[c.type] || TYPE_STYLE.staff;
                    const roleColor  = ROLE_COLOR[c.role] || ROLE_COLOR[c.type] || '#18A8B5';
                    const isExpanded = expandedId === c.id;
                    const isCopied   = copiedId   === c.id;

                    return (
                        <div key={c.id} style={{
                            background: t.card, borderRadius: 16,
                            border: `1px solid ${t.border}`,
                            overflow: 'hidden', transition: 'border-color 0.2s',
                            boxShadow: t.shadow,
                        }}>
                            {/* ── Collapsed row ── */}
                            <div
                                style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                            >
                                {/* Avatar */}
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: roleColor + '1A', color: roleColor, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {c.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                                        <p style={{ fontWeight: 700, fontSize: 14, color: PALETTE.white }}>{c.fullName}</p>
                                        <span style={{ background: ts.bg, color: ts.text, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{ts.label}</span>
                                        {c.role && c.type === 'staff' && (
                                            <span style={{ background: roleColor + '18', color: roleColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>
                                                {c.role.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, color: t.textMuted }}>{c.email || c.patientNumber}</span>
                                        <span style={{ fontSize: 11, color: t.textMuted, display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Clock size={10} />{timeAgo(c.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                                    <button
                                        onClick={e => { e.stopPropagation(); copyWhatsApp(c); }}
                                        title="Copy WhatsApp message"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            padding: '7px 12px', borderRadius: 9,
                                            border: `1px solid ${isCopied ? 'rgba(16,185,129,0.4)' : 'rgba(255,90,31,0.35)'}`,
                                            background: isCopied ? 'rgba(16,185,129,0.1)' : 'rgba(255,90,31,0.1)',
                                            color: isCopied ? '#10b981' : PALETTE.orange,
                                            fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                            fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {isCopied ? <><CopyCheck size={13} /> Copied!</> : <><Share2 size={13} /> WhatsApp</>}
                                    </button>
                                    <button
                                        onClick={e => { e.stopPropagation(); remove(c.id); }}
                                        style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                    <ChevronDown size={15} color={t.textMuted} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                                </div>
                            </div>

                            {/* ── Expanded detail ── */}
                            {isExpanded && (
                                <div style={{ borderTop: `1px solid ${t.border}`, padding: '14px 16px', background: 'rgba(255,255,255,0.02)' }}>
                                    {/* Credential fields */}
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 12 }}>
                                        {[
                                            c.type === 'patient' && { label: 'Patient Number', value: c.patientNumber, mono: true, color: '#18A8B5' },
                                            c.type === 'staff' && c.employeeId && { label: 'Employee ID', value: c.employeeId, mono: true, color: '#18A8B5' },
                                            { label: 'Email', value: c.email || '—' },
                                            { label: 'Password', value: c.tempPassword, mono: true, color: PALETTE.orange, sensitive: true },
                                            c.hospitalName && { label: 'Hospital', value: c.hospitalName },
                                            { label: 'Registered', value: new Date(c.createdAt).toLocaleString() },
                                        ].filter(Boolean).map(({ label, value, mono, color, sensitive }) => (
                                            <div key={label} style={{
                                                background: sensitive ? 'rgba(255,90,31,0.07)' : t.cardAlt,
                                                borderRadius: 10, padding: '10px 13px',
                                                border: `1px solid ${sensitive ? 'rgba(255,90,31,0.22)' : t.border}`,
                                            }}>
                                                <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                                                <p style={{ fontSize: mono ? 15 : 13, fontWeight: 700, color: color || PALETTE.white, fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? '0.08em' : 'normal' }}>{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* WhatsApp preview */}
                                    <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.18)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                                        <p style={{ fontSize: 11, color: '#25d366', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp Message Preview</p>
                                        <pre style={{ fontSize: 12, color: t.textSub, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{formatWhatsApp(c)}</pre>
                                    </div>

                                    <button onClick={() => copyWhatsApp(c)} style={{
                                        width: '100%', padding: '10px',
                                        background: isCopied ? 'rgba(16,185,129,0.15)' : `linear-gradient(135deg, ${PALETTE.orange} 0%, #FF8C55 100%)`,
                                        border: isCopied ? '1px solid rgba(16,185,129,0.3)' : 'none',
                                        borderRadius: 10,
                                        color: isCopied ? '#10b981' : '#fff',
                                        fontWeight: 700, fontSize: 13,
                                        cursor: 'pointer', fontFamily: 'inherit',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                        transition: 'all 0.2s',
                                    }}>
                                        {isCopied
                                            ? <><CopyCheck size={15} /> Copied to clipboard!</>
                                            : <><Share2 size={15} /> Copy WhatsApp Message</>}
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