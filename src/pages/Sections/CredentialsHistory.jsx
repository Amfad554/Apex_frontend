import { useState, useEffect } from 'react';
import { KeyRound, Search, X, Trash2, ChevronDown, Clock, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';

/* ─── Brand Tokens ───────────────────────────────────────────────────────────── */
const ORANGE = '#FF5A1F';

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

/* ─── Storage helpers ────────────────────────────────────────────────────────── */
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

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function CredentialsHistory({ isDark, t, isMobile }) {
    const [records,      setRecords]  = useState([]);
    const [search,       setSearch]   = useState('');
    const [filterType,   setFilter]   = useState('all');
    const [expandedId,   setExpanded] = useState(null);
    const [confirmClear, setConfirm]  = useState(false);

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
        background: t.card, border: `1px solid ${t.border}`, borderRadius: 10,
        color: t.textSub, fontWeight: 600, fontSize: 13,
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', ...extra,
    });

    return (
        <div style={{ color: t.text, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: ORANGE, marginBottom: 10 }} />
                    <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4, color: t.text }}>Credentials Log</h1>
                    <p style={{ color: t.textSub, fontSize: 13 }}>{records.length} records saved · Credentials emailed automatically on registration</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={reload} style={ghostBtn()}
                        onMouseEnter={e => e.currentTarget.style.borderColor = ORANGE}
                        onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    {records.length > 0 && (
                        <button onClick={handleClearAll} style={ghostBtn({
                            background: confirmClear ? 'rgba(239,68,68,0.08)' : t.card,
                            border: `1px solid ${confirmClear ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`,
                            color: '#ef4444',
                        })}>
                            <Trash2 size={14} /> {confirmClear ? 'Confirm Clear All' : 'Clear All'}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filters ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.input, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, flex: 1 }}>
                    <Search size={14} color={t.textMuted} />
                    <input placeholder="Search by name, email, ID…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, display: 'flex' }}><X size={13} /></button>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {['all', 'patient', 'staff'].map(f => {
                        const active = filterType === f;
                        return (
                            <button key={f} onClick={() => setFilter(f)}
                                style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${active ? ORANGE : t.border}`, background: active ? 'rgba(255,90,31,0.08)' : t.card, color: active ? ORANGE : t.textSub, fontWeight: active ? 700 : 500, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                                {f === 'all' ? `All (${records.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)}s (${records.filter(r => r.type === f).length})`}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Empty state ── */}
            {filtered.length === 0 && (
                <div style={{ padding: '60px 20px', textAlign: 'center', background: t.card, borderRadius: 20, border: `1.5px dashed ${t.border}` }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,90,31,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <KeyRound size={22} color={ORANGE} strokeWidth={1.5} />
                    </div>
                    <p style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>{search ? 'No matching records' : 'No credentials saved yet'}</p>
                    <p style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>Credentials will appear here after registering patients or staff</p>
                </div>
            )}

            {/* ── Records list ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(c => {
                    const ts         = TYPE_STYLE[c.type] || TYPE_STYLE.staff;
                    const roleColor  = ROLE_COLOR[c.role] || ROLE_COLOR[c.type] || '#0E6E77';
                    const isExpanded = expandedId === c.id;
                    const hasEmail   = !!c.email;

                    return (
                        <div key={c.id}
                            style={{ background: t.card, borderRadius: 16, border: `1px solid ${t.border}`, overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: '0 2px 12px rgba(10,26,63,0.06)' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,90,31,0.3)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(10,26,63,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = '0 2px 12px rgba(10,26,63,0.06)'; }}
                        >
                            {/* Row */}
                            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : c.id)}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: roleColor + '15', color: roleColor, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {c.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                                        <p style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{c.fullName}</p>
                                        <span style={{ background: ts.bg, color: ts.text, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{ts.label}</span>
                                        {c.role && c.type === 'staff' && (
                                            <span style={{ background: roleColor + '12', color: roleColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>
                                                {c.role.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, color: t.textMuted }}>{c.email || c.patientNumber}</span>
                                        <span style={{ fontSize: 11, color: t.textMuted, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{timeAgo(c.createdAt)}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                                    {/* Email sent badge */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        padding: '6px 11px', borderRadius: 9,
                                        border: `1px solid ${hasEmail ? 'rgba(16,185,129,0.3)' : t.border}`,
                                        background: hasEmail ? 'rgba(16,185,129,0.08)' : t.cardAlt,
                                        color: hasEmail ? '#10b981' : t.textMuted,
                                        fontSize: 12, fontWeight: 600,
                                    }}>
                                        {hasEmail
                                            ? <><CheckCircle2 size={13} /> Email sent</>
                                            : <><Mail size={13} /> No email</>
                                        }
                                    </div>

                                    <button onClick={e => { e.stopPropagation(); remove(c.id); }}
                                        style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}>
                                        <Trash2 size={13} />
                                    </button>
                                    <ChevronDown size={15} color={t.textMuted} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {isExpanded && (
                                <div style={{ borderTop: `1px solid ${t.border}`, padding: '14px 16px', background: t.cardAlt }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 12 }}>
                                        {[
                                            c.type === 'patient' && { label: 'Patient Number', value: c.patientNumber, mono: true, color: '#0E6E77' },
                                            c.type === 'staff' && c.employeeId && { label: 'Employee ID', value: c.employeeId, mono: true, color: '#0E6E77' },
                                            { label: 'Email', value: c.email || '—' },
                                            c.phone && { label: 'Phone', value: c.phone },
                                            { label: 'Password', value: c.tempPassword, mono: true, color: ORANGE, sensitive: true },
                                            c.hospitalName && { label: 'Hospital', value: c.hospitalName },
                                            { label: 'Registered', value: new Date(c.createdAt).toLocaleString() },
                                        ].filter(Boolean).map(({ label, value, mono, color, sensitive }) => (
                                            <div key={label} style={{ background: sensitive ? 'rgba(255,90,31,0.06)' : t.card, borderRadius: 10, padding: '10px 13px', border: `1px solid ${sensitive ? 'rgba(255,90,31,0.2)' : t.border}` }}>
                                                <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                                                <p style={{ fontSize: mono ? 15 : 13, fontWeight: 700, color: color || t.text, fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? '0.08em' : 'normal', wordBreak: 'break-all' }}>{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Email delivery notice */}
                                    <div style={{ background: hasEmail ? 'rgba(16,185,129,0.06)' : 'rgba(255,90,31,0.06)', border: `1px solid ${hasEmail ? 'rgba(16,185,129,0.2)' : 'rgba(255,90,31,0.2)'}`, borderRadius: 12, padding: '12px 14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {hasEmail
                                                ? <CheckCircle2 size={15} color="#10b981" />
                                                : <Mail size={15} color={ORANGE} />
                                            }
                                            <p style={{ fontSize: 13, color: hasEmail ? '#10b981' : ORANGE, fontWeight: 600 }}>
                                                {hasEmail
                                                    ? `Credentials emailed to ${c.email}`
                                                    : 'No email address provided — credentials were not emailed'
                                                }
                                            </p>
                                        </div>
                                        {!hasEmail && (
                                            <p style={{ fontSize: 12, color: t.textMuted, marginTop: 6, marginLeft: 23 }}>
                                                Share the password shown above manually with this {c.type}.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}