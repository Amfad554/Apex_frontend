import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Users, Calendar, Stethoscope, Pill, FileText, ArrowUpRight, Loader } from 'lucide-react';

const ORANGE = '#FF5A1F';

const TYPES = {
    patient:      { label: 'Patients',     icon: Users,       section: 'patients',     color: ORANGE    },
    staff:        { label: 'Staff',        icon: Stethoscope, section: 'staff',        color: '#8b5cf6' },
    appointment:  { label: 'Appointments', icon: Calendar,    section: 'appointments', color: '#0E6E77' },
    prescription: { label: 'Pharmacy',     icon: Pill,        section: 'pharmacy',     color: '#10b981' },
    record:       { label: 'Records',      icon: FileText,    section: 'records',      color: '#f59e0b' },
};

function useDebounce(value, delay) {
    const [d, setD] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setD(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return d;
}

function Highlight({ text = '', query = '', color }) {
    if (!query.trim()) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <mark style={{ background: color + '28', color, fontWeight: 700, borderRadius: 3, padding: '0 2px' }}>
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </span>
    );
}

async function fetchAll(hospitalId, q, signal, limits = [4, 3, 3, 3, 3]) {
    const qs = encodeURIComponent(q);
    const [lP, lS, lA, lR, lRc] = limits;
    const settled = await Promise.allSettled([
        fetch(`/api/hospitals/${hospitalId}/patients?search=${qs}&limit=${lP}`, { signal }).then(r => r.json()),
        fetch(`/api/hospitals/${hospitalId}/staff?search=${qs}&limit=${lS}`, { signal }).then(r => r.json()),
        fetch(`/api/hospitals/${hospitalId}/appointments?search=${qs}&limit=${lA}`, { signal }).then(r => r.json()),
        fetch(`/api/hospitals/${hospitalId}/prescriptions?search=${qs}&limit=${lR}`, { signal }).then(r => r.json()),
        fetch(`/api/hospitals/${hospitalId}/records?search=${qs}&limit=${lRc}`, { signal }).then(r => r.json()),
    ]);
    const [pR, sR, aR, rxR, recR] = settled;
    const flat = [];

    (pR.value?.patients || []).forEach(p => flat.push({
        type: 'patient', id: p.id,
        primary: p.fullName,
        secondary: [p.patientNumber, p.gender, p.bloodGroup].filter(Boolean).join(' · '),
        avatar: p.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    }));
    (sR.value?.staff || []).forEach(s => flat.push({
        type: 'staff', id: s.id,
        primary: s.fullName,
        secondary: [(s.role || '').replace('_', ' '), s.department].filter(Boolean).join(' · '),
        avatar: s.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    }));
    (aR.value?.appointments || []).forEach(a => flat.push({
        type: 'appointment', id: a.id,
        primary: a.patient?.fullName || 'Unknown patient',
        secondary: [a.doctor?.fullName, new Date(a.appointmentDate).toLocaleDateString(), a.status].filter(Boolean).join(' · '),
        avatar: (a.patient?.fullName || 'A').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    }));
    (rxR.value?.prescriptions || []).forEach(r => flat.push({
        type: 'prescription', id: r.id,
        primary: r.medication,
        secondary: [r.patient?.fullName, r.dosage].filter(Boolean).join(' · '),
        avatar: (r.medication || 'R')[0].toUpperCase(),
    }));
    (recR.value?.records || []).forEach(r => flat.push({
        type: 'record', id: r.id,
        primary: r.title,
        secondary: [r.patient?.fullName, (r.recordType || '').replace('_', ' ')].filter(Boolean).join(' · '),
        avatar: (r.title || 'R')[0].toUpperCase(),
    }));

    return flat;
}

function Skeleton({ count = 3, mobile = false, t }) {
    return (
        <div style={{ padding: mobile ? '14px 16px' : '12px 14px' }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: mobile ? 12 : 10, marginBottom: mobile ? 14 : 10, opacity: 1 - i * 0.2 }}>
                    <div style={{ width: mobile ? 36 : 30, height: mobile ? 36 : 30, borderRadius: mobile ? 10 : 8, background: t.cardAlt, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ height: mobile ? 11 : 10, borderRadius: 4, background: t.cardAlt, width: '60%', marginBottom: mobile ? 6 : 5 }} />
                        <div style={{ height: mobile ? 9 : 8, borderRadius: 4, background: t.cardAlt, width: '40%' }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function SuggestionList({ results, grouped, query, activeIdx, setActiveIdx, onSelect, onViewAll, t, isDark, mobile = false }) {
    const pad    = mobile ? '11px 16px' : '7px 14px';
    const avSize = mobile ? 36 : 30;
    const avR    = mobile ? 10 : 8;
    const pSize  = mobile ? 14 : 13;
    const sSize  = mobile ? 12 : 11;

    return (
        <>
            {Object.entries(grouped).map(([type, items]) => {
                const cfg = TYPES[type];
                if (!cfg) return null;
                const Icon = cfg.icon;
                return (
                    <div key={type}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: mobile ? '10px 16px 4px' : '6px 14px 4px',
                            borderTop: mobile ? `1px solid ${t.border}` : 'none',
                        }}>
                            <Icon size={11} color={cfg.color} />
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: cfg.color }}>
                                {cfg.label}
                            </span>
                        </div>

                        {items.map((item) => {
                            const gi = results.indexOf(item);
                            const isActive = gi === activeIdx;
                            return (
                                <button key={item.id}
                                    onMouseEnter={() => setActiveIdx(gi)}
                                    onMouseLeave={() => setActiveIdx(-1)}
                                    onClick={() => onSelect(item)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: mobile ? 12 : 10,
                                        width: '100%', padding: pad,
                                        border: 'none', cursor: 'pointer', textAlign: 'left',
                                        background: isActive
                                            ? (isDark ? 'rgba(255,90,31,0.1)' : 'rgba(255,90,31,0.06)')
                                            : 'transparent',
                                        transition: 'background .1s',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    <div style={{
                                        width: avSize, height: avSize, borderRadius: avR, flexShrink: 0,
                                        background: cfg.color + '18', color: cfg.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: mobile ? 12 : 10,
                                    }}>{item.avatar}</div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: pSize, fontWeight: 600, color: t.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <Highlight text={item.primary} query={query} color={cfg.color} />
                                        </p>
                                        <p style={{ fontSize: sSize, color: t.textMuted, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <Highlight text={item.secondary} query={query} color={cfg.color} />
                                        </p>
                                    </div>

                                    <ArrowUpRight
                                        size={mobile ? 15 : 13} color={cfg.color}
                                        style={{ flexShrink: 0, opacity: isActive ? 1 : mobile ? 0.2 : 0, transition: 'opacity .15s' }}
                                    />
                                </button>
                            );
                        })}
                    </div>
                );
            })}

            {results.length > 0 && (
                <button onClick={onViewAll} style={{
                    width: '100%', padding: mobile ? '14px 16px' : '10px 14px',
                    background: isDark ? 'rgba(255,90,31,0.06)' : 'rgba(255,90,31,0.04)',
                    border: 'none', borderTop: `1px solid ${t.border}`,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'background .15s',
                }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,90,31,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,90,31,0.06)' : 'rgba(255,90,31,0.04)'}
                >
                    <span style={{ fontSize: mobile ? 13 : 12, fontWeight: 600, color: ORANGE }}>
                        See all results for "{query}"
                    </span>
                    <ArrowUpRight size={mobile ? 15 : 13} color={ORANGE} />
                </button>
            )}
        </>
    );
}

// ─── Desktop dropdown search bar ──────────────────────────────────────────────
export function SmartSearchBar({ hospital, t, isDark, isTablet, onNavigate }) {
    const [query, setQuery]         = useState('');
    const [results, setResults]     = useState([]);
    const [loading, setLoading]     = useState(false);
    const [open, setOpen]           = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const inputRef = useRef(null);
    const panelRef = useRef(null);
    const abortRef = useRef(null);
    const dq = useDebounce(query, 280);

    const doFetch = useCallback(async (q) => {
        if (!q.trim() || !hospital?.id) { setResults([]); setLoading(false); return; }
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        try {
            const flat = await fetchAll(hospital.id, q, abortRef.current.signal);
            if (!abortRef.current.signal.aborted) setResults(flat.slice(0, 14));
        } catch {
            if (!abortRef.current.signal.aborted) setResults([]);
        } finally {
            if (!abortRef.current.signal.aborted) setLoading(false);
        }
    }, [hospital?.id]);

    useEffect(() => { doFetch(dq); }, [dq, doFetch]);

    useEffect(() => {
        if (results.length > 0 && query.trim()) setOpen(true);
        else if (!query.trim()) { setOpen(false); setResults([]); }
    }, [results, query]);

    useEffect(() => {
        const h = (e) => {
            if (!panelRef.current?.contains(e.target) && !inputRef.current?.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const clear   = () => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus(); };
    const select  = (item) => { setQuery(item.primary); setOpen(false); onNavigate(TYPES[item.type]?.section || 'patients', item.primary); };
    const viewAll = () => { if (query.trim()) { setOpen(false); onNavigate('patients', query); } };
    const grouped = results.reduce((a, r) => { (a[r.type] = a[r.type] || []).push(r); return a; }, {});

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
        else if (e.key === 'Enter') { e.preventDefault(); activeIdx >= 0 ? select(results[activeIdx]) : viewAll(); }
        else if (e.key === 'Escape') { setOpen(false); setQuery(''); inputRef.current?.blur(); }
    };

    return (
        <div style={{ position: 'relative' }}>
            <style>{`
                @keyframes searchDrop{from{opacity:0;transform:translateY(-6px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
                @keyframes spin{to{transform:rotate(360deg)}}
            `}</style>

            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: t.input, borderRadius: 10, padding: '8px 14px',
                border: `1.5px solid ${open || query ? ORANGE : t.border}`,
                boxShadow: open || query ? `0 0 0 3px rgba(255,90,31,0.1)` : 'none',
                transition: 'border-color .2s, box-shadow .2s',
            }}>
                {loading
                    ? <Loader size={14} color={ORANGE} style={{ animation: 'spin .8s linear infinite', flexShrink: 0 }} />
                    : <Search size={14} color={query ? ORANGE : t.textMuted} style={{ flexShrink: 0 }} />
                }
                <input
                    ref={inputRef}
                    placeholder="Search patients, staff, appointments…"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setOpen(true); setActiveIdx(-1); }}
                    onFocus={() => { if (query.trim() && results.length) setOpen(true); }}
                    onKeyDown={handleKeyDown}
                    autoComplete="off" spellCheck={false}
                    style={{
                        background: 'none', border: 'none', outline: 'none',
                        color: t.text, fontSize: 13, fontFamily: 'inherit',
                        width: isTablet ? 140 : 220,
                    }}
                />
                {query && (
                    <button onClick={clear}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, display: 'flex', padding: 0, flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = t.text}
                        onMouseLeave={e => e.currentTarget.style.color = t.textMuted}
                    ><X size={13} /></button>
                )}
            </div>

            {open && (
                <div ref={panelRef} style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                    width: 340, zIndex: 9999,
                    background: t.card, border: `1.5px solid ${t.border}`, borderRadius: 14,
                    boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 16px 48px rgba(10,26,63,0.14)',
                    overflow: 'hidden',
                    animation: 'searchDrop .18s cubic-bezier(0.34,1.2,0.64,1)',
                }}>
                    {loading && !results.length && <Skeleton count={3} t={t} />}
                    {!loading && !results.length && query.trim() && (
                        <div style={{ padding: '20px 16px', textAlign: 'center', color: t.textMuted, fontSize: 13 }}>
                            No results for <strong style={{ color: t.text }}>"{query}"</strong>
                        </div>
                    )}
                    {results.length > 0 && (
                        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                            <SuggestionList
                                results={results} grouped={grouped} query={query}
                                activeIdx={activeIdx} setActiveIdx={setActiveIdx}
                                onSelect={select} onViewAll={viewAll}
                                t={t} isDark={isDark}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Mobile full-screen search overlay ───────────────────────────────────────
export function MobileSearchOverlay({ hospital, t, isDark, onNavigate, onClose }) {
    const [query, setQuery]         = useState('');
    const [results, setResults]     = useState([]);
    const [loading, setLoading]     = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const inputRef = useRef(null);
    const abortRef = useRef(null);
    const dq = useDebounce(query, 280);

    useEffect(() => { setTimeout(() => inputRef.current?.focus(), 60); }, []);

    const doFetch = useCallback(async (q) => {
        if (!q.trim() || !hospital?.id) { setResults([]); setLoading(false); return; }
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        try {
            const flat = await fetchAll(hospital.id, q, abortRef.current.signal, [5, 4, 4, 3, 3]);
            if (!abortRef.current.signal.aborted) setResults(flat.slice(0, 20));
        } catch {
            if (!abortRef.current.signal.aborted) setResults([]);
        } finally {
            if (!abortRef.current.signal.aborted) setLoading(false);
        }
    }, [hospital?.id]);

    useEffect(() => { doFetch(dq); }, [dq, doFetch]);

    const select  = (item) => { onNavigate(TYPES[item.type]?.section || 'patients', item.primary); onClose(); };
    const viewAll = () => { if (query.trim()) { onNavigate('patients', query); onClose(); } };
    const grouped = results.reduce((a, r) => { (a[r.type] = a[r.type] || []).push(r); return a; }, {});

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
        else if (e.key === 'Enter') { e.preventDefault(); activeIdx >= 0 ? select(results[activeIdx]) : viewAll(); }
        else if (e.key === 'Escape') onClose();
    };

    return (
        <>
            <style>{`
                @keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
                @keyframes spin{to{transform:rotate(360deg)}}
            `}</style>

            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 400, backdropFilter: 'blur(2px)' }} />

            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                background: t.sidebar, zIndex: 401,
                borderBottom: `1px solid ${t.border}`,
                boxShadow: '0 8px 32px rgba(10,26,63,0.12)',
                animation: 'slideDown .2s ease',
                maxHeight: '85dvh',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Input row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${t.border}` }}>
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                        background: t.input, borderRadius: 12, padding: '10px 14px',
                        border: `1.5px solid ${query ? ORANGE : t.border}`,
                        boxShadow: query ? `0 0 0 3px rgba(255,90,31,0.1)` : 'none',
                        transition: 'border-color .18s, box-shadow .18s',
                    }}>
                        {loading
                            ? <Loader size={16} color={ORANGE} style={{ animation: 'spin .8s linear infinite', flexShrink: 0 }} />
                            : <Search size={16} color={query ? ORANGE : t.textMuted} style={{ flexShrink: 0 }} />
                        }
                        <input
                            ref={inputRef}
                            placeholder="Search patients, staff, appointments…"
                            value={query}
                            onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
                            onKeyDown={handleKeyDown}
                            autoComplete="off" spellCheck={false}
                            style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 15, flex: 1, fontFamily: 'inherit' }}
                        />
                        {query && (
                            <button
                                onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, display: 'flex', padding: 0, flexShrink: 0 }}
                            ><X size={16} /></button>
                        )}
                    </div>

                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: ORANGE, fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
                        padding: '8px 4px', whiteSpace: 'nowrap', flexShrink: 0,
                    }}>Cancel</button>
                </div>

                {/* Results areaa */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {!query.trim() && (
                        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                            <Search size={28} color={t.textMuted} style={{ margin: '0 auto 10px', display: 'block' }} />
                            <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>
                                Search across patients, staff, appointments and more
                            </p>
                        </div>
                    )}
                    {loading && !results.length && query.trim() && <Skeleton count={4} mobile t={t} />}
                    {!loading && query.trim() && !results.length && (
                        <div style={{ padding: '32px 16px', textAlign: 'center', color: t.textMuted, fontSize: 14 }}>
                            No results for <strong style={{ color: t.text }}>"{query}"</strong>
                        </div>
                    )}
                    {results.length > 0 && (
                        <SuggestionList
                            results={results} grouped={grouped} query={query}
                            activeIdx={activeIdx} setActiveIdx={setActiveIdx}
                            onSelect={select} onViewAll={viewAll}
                            t={t} isDark={isDark} mobile
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default SmartSearchBar;