import { useState, useEffect, useRef } from 'react';
import { Calendar, Users, DollarSign, Zap, UserPlus, Pill, FileText, ArrowUpRight, Loader } from 'lucide-react';
import { hospitalsAPI, patientsAPI, appointmentsAPI } from '../../Services/api.js';

/* ─── Brand Tokens ─────────────────────────────────────────────────────────────
   Light surface — dark navy text on white/F5F7FA so everything is visible.
───────────────────────────────────────────────────────────────────────────── */
const ORANGE  = '#FF5A1F';
const ORANGE2 = '#e64d15';

const C = {
    pageBg:    '#F5F7FA',
    card:      '#ffffff',
    cardAlt:   '#F5F7FA',
    border:    'rgba(10,26,63,0.08)',
    shadow:    '0 2px 12px rgba(10,26,63,0.06)',
    shadowLg:  '0 6px 24px rgba(10,26,63,0.1)',
    text:      '#0A1A3F',
    textSub:   '#374151',
    textMuted: '#6B7280',
    hover:     'rgba(255,90,31,0.04)',
};

/* ─── Gradients for stat cards (coloured, not light) ──────────────────────── */
const GRADIENTS = {
    orange: `linear-gradient(135deg, ${ORANGE} 0%, #FF8C55 100%)`,
    navy:   'linear-gradient(135deg, #1F2A44 0%, #2E3D5F 100%)',
    teal:   'linear-gradient(135deg, #0E6E77 0%, #18A8B5 100%)',
    violet: 'linear-gradient(135deg, #3B2A6E 0%, #6847C2 100%)',
    amber:  'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)',
};

const ACCENT = {
    orange: ORANGE,
    teal:   '#18A8B5',
    violet: '#6847C2',
    amber:  '#F59E0B',
    green:  '#10B981',
};

const AVATAR_COLORS = [ORANGE, ACCENT.teal, ACCENT.violet, ACCENT.amber, ACCENT.green, '#3B82F6'];

/* ─── useCountUp ───────────────────────────────────────────────────────────── */
function useCountUp(target, duration = 900, enabled = true) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!enabled || target === 0) { setVal(target); return; }
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            setVal(Math.floor(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, enabled]);
    return val;
}

/* ─── Sparkline ────────────────────────────────────────────────────────────── */
function Sparkline({ data, color, width = 80, height = 30, animate = false }) {
    const pathRef = useRef(null);
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
    useEffect(() => {
        if (!animate || !pathRef.current) return;
        const len = pathRef.current.getTotalLength?.() ?? 200;
        pathRef.current.style.strokeDasharray = len;
        pathRef.current.style.strokeDashoffset = len;
        setTimeout(() => {
            pathRef.current.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)';
            pathRef.current.style.strokeDashoffset = '0';
        }, 300);
    }, [animate]);
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <polyline ref={pathRef} points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ─── LineGraph ────────────────────────────────────────────────────────────── */
function LineGraph({ datasets, labels, height = 160, animate = false }) {
    const W = 400, pad = { t: 10, r: 10, b: 28, l: 28 };
    const gw = W - pad.l - pad.r, gh = height - pad.t - pad.b;
    const max = Math.max(...datasets.flatMap(d => d.data)) || 1;
    const pts = (data) => data.map((v, i) => [pad.l + (i / (data.length - 1)) * gw, pad.t + gh - (v / max) * gh]);
    const lineRefs = useRef([]);
    useEffect(() => {
        if (!animate) return;
        lineRefs.current.forEach((el, i) => {
            if (!el) return;
            const len = el.getTotalLength?.() ?? 300;
            el.style.strokeDasharray = len; el.style.strokeDashoffset = len;
            setTimeout(() => {
                el.style.transition = `stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1) ${i * 0.2}s`;
                el.style.strokeDashoffset = '0';
            }, 100);
        });
    }, [animate]);
    return (
        <svg viewBox={`0 0 ${W} ${height}`} style={{ width: '100%', height, animation: animate ? 'fadeInUp 0.5s ease both' : 'none' }}>
            <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
            {[0, .25, .5, .75, 1].map((f, i) => (
                <line key={i} x1={pad.l} x2={W - pad.r} y1={pad.t + gh * (1 - f)} y2={pad.t + gh * (1 - f)} stroke={C.border} strokeWidth="1" />
            ))}
            {datasets.map((ds, di) => {
                const p = pts(ds.data);
                return (
                    <g key={di}>
                        <path ref={el => lineRefs.current[di] = el}
                            d={p.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')}
                            fill="none" stroke={ds.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {p.map(([x, y], i) => (
                            <circle key={i} cx={x} cy={y} r={3} fill={ds.color}
                                style={{ animation: animate ? `popIn 0.3s ease both ${0.8 + i * 0.06 + di * 0.2}s` : 'none', opacity: animate ? 0 : 1 }} />
                        ))}
                    </g>
                );
            })}
            {labels.map((l, i) => (
                <text key={i} x={pad.l + (i / (labels.length - 1)) * gw} y={height - 4} textAnchor="middle" fill={C.textMuted} fontSize="10">{l}</text>
            ))}
        </svg>
    );
}

/* ─── DonutChart ───────────────────────────────────────────────────────────── */
function DonutChart({ value, total, color, size = 86, animate = false }) {
    const r = (size - 12) / 2, circ = 2 * Math.PI * r, dash = (value / total) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={10} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
                strokeDasharray={animate ? `0 ${circ}` : `${dash} ${circ - dash}`} strokeLinecap="round"
                style={animate ? { animation: `donutFill 1s cubic-bezier(0.4,0,0.2,1) 0.4s forwards` } : {}} />
            <style>{`@keyframes donutFill{from{stroke-dasharray:0 ${circ}}to{stroke-dasharray:${dash} ${circ - dash}}}`}</style>
        </svg>
    );
}

/* ─── StatCard — keeps its gradient background, white text inside ─────────── */
function StatCard({ label, value, gradient, icon: Icon, spark, delay, isMobile }) {
    const [visible, setVisible] = useState(false);
    const displayVal = useCountUp(value, 900, visible);
    useEffect(() => { const tm = setTimeout(() => setVisible(true), delay); return () => clearTimeout(tm); }, [delay]);
    return (
        <div
            style={{ background: gradient, borderRadius: 18, padding: isMobile ? '18px 16px' : '24px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 28px rgba(0,0,0,0.15)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)', transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'default', display: isMobile ? 'flex' : 'block', alignItems: isMobile ? 'center' : undefined, gap: isMobile ? 16 : undefined }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 28px rgba(0,0,0,0.15)'; }}
        >
            <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ width: isMobile ? 40 : 44, height: isMobile ? 40 : 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: isMobile ? 0 : 16 }}>
                <Icon size={isMobile ? 18 : 22} color="#fff" />
            </div>
            <div style={{ flex: isMobile ? 1 : undefined }}>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 2 }}>{label}</p>
                <p style={{ color: '#fff', fontSize: isMobile ? 26 : 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: isMobile ? 0 : 12, lineHeight: 1.1 }}>{displayVal}</p>
                {!isMobile && <Sparkline data={spark} color="rgba(255,255,255,0.65)" animate={visible} />}
            </div>
        </div>
    );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function DashboardHome({ hospital, onNavigate, isMobile }) {
    const [stats, setStats]        = useState(null);
    const [patients, setPatients]  = useState([]);
    const [appointments, setAppts] = useState([]);
    const [loading, setLoading]    = useState(true);
    const [error, setError]        = useState('');
    const [chartsReady, setCharts] = useState(false);
    const [bottomReady, setBottom] = useState(false);
    const hospitalId = hospital?.id;

    useEffect(() => {
        if (!hospitalId) return;
        (async () => {
            try {
                setLoading(true);
                const [sR, pR, aR] = await Promise.all([
                    hospitalsAPI.stats(),
                    patientsAPI.list(hospitalId, { limit: 5 }),
                    appointmentsAPI.list(hospitalId, { status: 'scheduled', limit: 10 }),
                ]);
                setStats(sR.stats); setPatients(pR.patients || []); setAppts(aR.appointments || []);
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        })();
    }, [hospitalId]);

    useEffect(() => {
        if (loading) return;
        const t1 = setTimeout(() => setCharts(true), 600);
        const t2 = setTimeout(() => setBottom(true), 900);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [loading]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: C.textMuted }}>
            <Loader size={20} style={{ animation: 'spin 1s linear infinite', color: ORANGE }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <span style={{ color: C.textSub }}>Loading dashboard…</span>
        </div>
    );

    if (error) return (
        <div style={{ background: 'rgba(255,90,31,0.08)', border: `1px solid rgba(255,90,31,0.25)`, borderRadius: 12, padding: 20, color: ORANGE }}>
            Failed to load dashboard: {error}
        </div>
    );

    const todayAppts = stats?.todayAppointments   || 0;
    const totalPts   = stats?.totalPatients       || 0;
    const totalStaff = stats?.totalStaff          || 0;
    const activeRx   = stats?.activePrescriptions || 0;

    return (
        <div style={{ color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
            <style>{`
                @keyframes popIn    { from{opacity:0;transform:scale(0)}   to{opacity:1;transform:scale(1)} }
                @keyframes greetingPop { 0%{opacity:0;transform:translateY(-12px)} 60%{transform:translateY(3px)} 100%{opacity:1;transform:translateY(0)} }
                @keyframes rowFadeIn   { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
                @keyframes spin        { to{transform:rotate(360deg)} }
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
            `}</style>

            {/* ── Greeting ── */}
            <div style={{ marginBottom: isMobile ? 20 : 32, animation: 'greetingPop 0.5s ease both' }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: ORANGE, marginBottom: 12 }} />
                <h1 style={{ fontSize: isMobile ? 22 : 27, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4, color: C.text }}>
                    Hello, {hospital?.adminName || hospital?.hospitalName || 'Admin'} 👋
                </h1>
                <p style={{ color: C.textSub, fontSize: 14 }}>Here's what's happening at your hospital today.</p>
            </div>

            {/* ── Stat Cards — gradient, keep white text ── */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit,minmax(220px,1fr))', gap: isMobile ? 10 : 20, marginBottom: isMobile ? 20 : 28 }}>
                {[
                    { label: 'Appointments Today',  value: todayAppts, gradient: GRADIENTS.orange, icon: Calendar,   spark: [4,5,4,7,6,8,todayAppts] },
                    { label: 'Total Patients',       value: totalPts,   gradient: GRADIENTS.navy,   icon: Users,      spark: [4,5,5,6,6,7,totalPts]   },
                    { label: 'Active Staff',         value: totalStaff, gradient: GRADIENTS.teal,   icon: Zap,        spark: [2,3,2,3,3,4,totalStaff] },
                    { label: 'Active Prescriptions', value: activeRx,   gradient: GRADIENTS.violet, icon: DollarSign, spark: [3,4,5,4,6,5,activeRx]   },
                ].map(({ label, value, gradient, icon, spark }, i) => (
                    <StatCard key={label} label={label} value={value} gradient={gradient} icon={icon} spark={spark} delay={i * 100} isMobile={isMobile} />
                ))}
            </div>

            {/* ── Charts Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr', gap: isMobile ? 10 : 20, marginBottom: isMobile ? 20 : 28, opacity: chartsReady ? 1 : 0, transform: chartsReady ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease,transform 0.5s ease' }}>

                {/* Patient Trends */}
                <div style={{ background: C.card, borderRadius: 18, padding: isMobile ? 16 : 24, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: C.text }}>Patient Trends</h3>
                        <div style={{ display: 'flex', gap: 16 }}>
                            {[{ label: 'New Patients', color: ORANGE }, { label: 'Appointments', color: ACCENT.teal }].map(({ label, color }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textSub }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />{label}
                                </div>
                            ))}
                        </div>
                    </div>
                    <LineGraph
                        datasets={[
                            { data: [120, 180, 140, 200, 160, 220, totalPts],     color: ORANGE       },
                            { data: [20, 26, 30, 24, 35, 31, todayAppts * 10],    color: ACCENT.teal  },
                        ]}
                        labels={['Sun','Mon','Tue','Wed','Thu','Fri','Sat']}
                        height={isMobile ? 130 : 160}
                        animate={chartsReady}
                    />
                </div>

                {/* Staff & Patients donut */}
                <div style={{ background: C.card, borderRadius: 18, padding: isMobile ? 16 : 24, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: C.text }}>Staff & Patients</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <DonutChart value={totalPts} total={Math.max(totalPts + 10, 1)} color={ORANGE} size={86} animate={chartsReady} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{totalPts}</span>
                                <span style={{ fontSize: 9, color: C.textMuted }}>Patients</span>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            {[
                                { label: 'Total Patients',       value: totalPts,   color: ORANGE        },
                                { label: 'Active Staff',         value: totalStaff, color: ACCENT.teal   },
                                { label: "Today's Appointments", value: todayAppts, color: ACCENT.violet  },
                                { label: 'Active Prescriptions', value: activeRx,   color: ACCENT.amber  },
                            ].map(({ label, value, color }, i) => (
                                <div key={label} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: chartsReady ? 1 : 0, transform: chartsReady ? 'translateX(0)' : 'translateX(12px)', transition: `opacity 0.4s ease ${0.1 + i * 0.08}s,transform 0.4s ease ${0.1 + i * 0.08}s` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, color: C.textSub }}>{label}</span>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: isMobile ? 10 : 20, opacity: bottomReady ? 1 : 0, transform: bottomReady ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease,transform 0.5s ease' }}>

                {/* Recent Patients */}
                <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: 'hidden' }}>
                    <div style={{ padding: isMobile ? '14px 16px' : '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
                        <h3 style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Recent Patients</h3>
                        <button onClick={() => onNavigate('patients')}
                            style={{ fontSize: 12, color: ORANGE, background: 'rgba(255,90,31,0.08)', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, transition: 'background 0.2s,transform 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,90,31,0.16)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,90,31,0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >View All <ArrowUpRight size={13} /></button>
                    </div>
                    {patients.length === 0 ? (
                        <div style={{ padding: 30, textAlign: 'center', color: C.textMuted, fontSize: 14 }}>No patients yet</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: C.cardAlt }}>
                                    {['Patient', 'Gender', !isMobile && 'Blood Group'].filter(Boolean).map(h => (
                                        <th key={h} style={{ padding: isMobile ? '9px 12px' : '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {patients.slice(0, 5).map((p, i) => {
                                    const color  = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                    const avatar = p.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                    return (
                                        <tr key={p.id}
                                            style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s', animation: bottomReady ? `rowFadeIn 0.35s ease both ${i * 0.07}s` : 'none' }}
                                            onMouseEnter={e => e.currentTarget.style.background = C.hover}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: isMobile ? '10px 12px' : '12px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: color + '20', color, fontWeight: 700, fontSize: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{avatar}</div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <p style={{ fontWeight: 600, fontSize: 13, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.fullName}</p>
                                                        <p style={{ fontSize: 11, color: C.textMuted }}>{p.patientNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: isMobile ? '10px 12px' : '12px 20px', fontSize: 13, color: C.textSub, textTransform: 'capitalize' }}>{p.gender}</td>
                                            {!isMobile && <td style={{ padding: '12px 20px', fontSize: 13, color: C.textSub }}>{p.bloodGroup || '—'}</td>}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Quick Actions */}
                <div style={{ background: C.card, borderRadius: 18, padding: isMobile ? 16 : 24, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: C.text }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                            { label: 'Register Patient', icon: UserPlus, gradient: GRADIENTS.orange, section: 'patients'     },
                            { label: 'Book Appointment', icon: Calendar, gradient: GRADIENTS.teal,   section: 'appointments' },
                            { label: 'Prescription',     icon: Pill,     gradient: GRADIENTS.violet, section: 'pharmacy'     },
                            { label: 'Medical Record',   icon: FileText, gradient: GRADIENTS.amber,  section: 'records'      },
                        ].map(({ label, icon: Icon, gradient, section }, i) => (
                            <button key={label} onClick={() => onNavigate(section)}
                                style={{ background: gradient, border: 'none', borderRadius: 12, padding: isMobile ? '14px 8px' : '16px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'transform 0.2s,box-shadow 0.2s', opacity: bottomReady ? 1 : 0, animation: bottomReady ? `popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both ${i * 0.07}s` : 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1.06) translateY(-2px)'}
                            >
                                <Icon size={20} color="#fff" />
                                <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Today's Appointments */}
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Today's Appointments</p>
                        {appointments.length === 0 ? (
                            <p style={{ fontSize: 13, color: C.textMuted }}>No appointments today</p>
                        ) : appointments.slice(0, 3).map((a, i) => {
                            const color  = AVATAR_COLORS[i % AVATAR_COLORS.length];
                            const avatar = a.patient?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                            return (
                                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, opacity: bottomReady ? 1 : 0, transform: bottomReady ? 'translateX(0)' : 'translateX(10px)', transition: `opacity 0.35s ease ${0.1 + i * 0.1}s,transform 0.35s ease ${0.1 + i * 0.1}s` }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '20', color, fontWeight: 700, fontSize: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{avatar}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.patient?.fullName}</p>
                                        <p style={{ fontSize: 11, color: C.textMuted }}>{a.doctor?.fullName} · {a.doctor?.department}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}