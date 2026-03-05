import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Zap, UserPlus, Pill, FileText, ArrowUpRight, Loader } from 'lucide-react';
import { ACCENT, GRADIENTS } from '../theme.js';
import { hospitalsAPI, patientsAPI, appointmentsAPI } from '../../services/api.js';

function Sparkline({ data, color, width = 80, height = 30 }) {
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function LineGraph({ datasets, labels, height = 160, isDark }) {
    const W = 400, pad = { t: 10, r: 10, b: 28, l: 28 };
    const gw = W - pad.l - pad.r, gh = height - pad.t - pad.b;
    const max = Math.max(...datasets.flatMap(d => d.data)) || 1;
    const pts = (data) => data.map((v, i) => [pad.l + (i / (data.length - 1)) * gw, pad.t + gh - (v / max) * gh]);
    return (
        <svg viewBox={`0 0 ${W} ${height}`} style={{ width: '100%', height }}>
            {[0, .25, .5, .75, 1].map((f, i) => (
                <line key={i} x1={pad.l} x2={W - pad.r} y1={pad.t + gh * (1 - f)} y2={pad.t + gh * (1 - f)}
                    stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'} strokeWidth="1" />
            ))}
            {datasets.map((ds, di) => {
                const p = pts(ds.data);
                return (
                    <g key={di}>
                        <path d={p.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')} fill="none" stroke={ds.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {p.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill={ds.color} />)}
                    </g>
                );
            })}
            {labels.map((l, i) => (
                <text key={i} x={pad.l + (i / (labels.length - 1)) * gw} y={height - 4} textAnchor="middle"
                    fill={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'} fontSize="10">{l}</text>
            ))}
        </svg>
    );
}

function DonutChart({ value, total, color, size = 86 }) {
    const r = (size - 12) / 2, circ = 2 * Math.PI * r, dash = (value / total) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth={10} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
                strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
        </svg>
    );
}

const getStatusStyle = (status, isDark) => ({
    admitted: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
    outpatient: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
    discharged: { bg: 'rgba(156,163,175,0.15)', text: isDark ? '#9ca3af' : '#6b7280' },
})[status?.toLowerCase()] || { bg: 'rgba(16,185,129,0.15)', text: '#34d399' };

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export default function DashboardHome({ isDark, t, hospital, onNavigate }) {
    const [stats, setStats] = useState(null);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const hospitalId = hospital?.id;

    useEffect(() => {
        if (!hospitalId) return;
        const load = async () => {
            try {
                setLoading(true);
                const [statsRes, patientsRes, apptsRes] = await Promise.all([
                    hospitalsAPI.stats(),
                    patientsAPI.list(hospitalId, { limit: 5 }),
                    appointmentsAPI.list(hospitalId, { status: 'scheduled', limit: 10 }),
                ]);
                setStats(statsRes.stats);
                setPatients(patientsRes.patients || []);
                setAppts(apptsRes.appointments || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [hospitalId]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: t.textSub }}>
            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading dashboard...
        </div>
    );

    if (error) return (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 20, color: '#ef4444' }}>
            Failed to load dashboard: {error}
        </div>
    );

    const todayAppts = stats?.todayAppointments || 0;
    const totalPts = stats?.totalPatients || 0;
    const totalStaff = stats?.totalStaff || 0;
    const activeRx = stats?.activePrescriptions || 0;

    return (
        <div>
            {/* Greeting */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
                    Hello {hospital?.adminName || hospital?.hospitalName || 'Admin'} 👋
                </h1>
                <p style={{ color: t.textSub, fontSize: 14 }}>Here's what's happening at your hospital today.</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
                {[
                    { label: 'Appointments Today', value: todayAppts, gradient: GRADIENTS.blue, icon: Calendar, spark: [4, 5, 4, 7, 6, 8, todayAppts] },
                    { label: 'Total Patients', value: totalPts, gradient: GRADIENTS.violet, icon: Users, spark: [4, 5, 5, 6, 6, 7, totalPts] },
                    { label: 'Active Staff', value: totalStaff, gradient: GRADIENTS.cyan, icon: Zap, spark: [2, 3, 2, 3, 3, 4, totalStaff] },
                    { label: 'Active Prescriptions', value: activeRx, gradient: GRADIENTS.green, icon: DollarSign, spark: [3, 4, 5, 4, 6, 5, activeRx] },
                ].map(({ label, value, gradient, icon: Icon, spark }) => (
                    <div key={label} style={{ background: gradient, borderRadius: 18, padding: '24px 22px', position: 'relative', overflow: 'hidden', boxShadow: t.shadow }}>
                        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={22} color="#fff" />
                            </div>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 4 }}>{label}</p>
                        <p style={{ color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>{value}</p>
                        <Sparkline data={spark} color="rgba(255,255,255,0.7)" />
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 28 }}>
                <div style={{ background: t.card, borderRadius: 18, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Patient Trends</h3>
                        <div style={{ display: 'flex', gap: 16 }}>
                            {[{ label: 'New', color: '#06b6d4' }, { label: 'Appointments', color: '#3b5bdb' }].map(({ label, color }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.textSub }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />{label}
                                </div>
                            ))}
                        </div>
                    </div>
                    <LineGraph
                        datasets={[
                            { data: [120, 180, 140, 200, 160, 220, totalPts], color: '#06b6d4' },
                            { data: [20, 26, 30, 24, 35, 31, todayAppts * 10], color: '#3b5bdb' },
                        ]}
                        labels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                        height={160} isDark={isDark}
                    />
                </div>

                <div style={{ background: t.card, borderRadius: 18, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Staff & Patients</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <DonutChart value={totalPts} total={Math.max(totalPts + 10, 1)} color={ACCENT.blue} size={86} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontWeight: 800, fontSize: 16 }}>{totalPts}</span>
                                <span style={{ fontSize: 9, color: t.textMuted }}>Patients</span>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            {[
                                { label: 'Total Patients', value: totalPts, color: ACCENT.blue },
                                { label: 'Active Staff', value: totalStaff, color: ACCENT.green },
                                { label: 'Today\'s Appts', value: todayAppts, color: ACCENT.violet },
                                { label: 'Active Prescriptions', value: activeRx, color: ACCENT.orange },
                            ].map(({ label, value, color }) => (
                                <div key={label} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, color: t.textSub }}>{label}</span>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
                {/* Recent Patients */}
                <div style={{ background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, boxShadow: t.shadow, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${t.border}` }}>
                        <h3 style={{ fontWeight: 700, fontSize: 16 }}>Recent Patients</h3>
                        <button onClick={() => onNavigate('patients')} style={{ fontSize: 12, color: ACCENT.blue, background: 'rgba(59,130,246,0.1)', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                            View All <ArrowUpRight size={13} />
                        </button>
                    </div>
                    {patients.length === 0 ? (
                        <div style={{ padding: 30, textAlign: 'center', color: t.textMuted, fontSize: 14 }}>No patients yet</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: t.cardAlt }}>
                                    {['Patient', 'Gender', 'Blood Group'].map(h => (
                                        <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {patients.slice(0, 5).map((p, i) => {
                                    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                    const avatar = p.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                    return (
                                        <tr key={p.id} style={{ borderBottom: `1px solid ${t.border}` }}
                                            onMouseEnter={e => e.currentTarget.style.background = t.hover}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: color + '22', color, fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{avatar}</div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, fontSize: 13 }}>{p.fullName}</p>
                                                        <p style={{ fontSize: 11, color: t.textMuted }}>{p.patientNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 20px', fontSize: 13, color: t.textSub, textTransform: 'capitalize' }}>{p.gender}</td>
                                            <td style={{ padding: '12px 20px', fontSize: 13, color: t.textSub }}>{p.bloodGroup || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Quick Actions + Today's Appointments */}
                <div style={{ background: t.card, borderRadius: 18, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                            { label: 'Register Patient', icon: UserPlus, gradient: GRADIENTS.blue, section: 'patients' },
                            { label: 'Book Appointment', icon: Calendar, gradient: GRADIENTS.cyan, section: 'appointments' },
                            { label: 'Prescription', icon: Pill, gradient: GRADIENTS.violet, section: 'pharmacy' },
                            { label: 'Medical Record', icon: FileText, gradient: GRADIENTS.green, section: 'records' },
                        ].map(({ label, icon: Icon, gradient, section }) => (
                            <button key={label} onClick={() => onNavigate(section)} style={{
                                background: gradient, border: 'none', borderRadius: 12, padding: '16px 12px',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                transition: 'opacity 0.15s, transform 0.15s', fontFamily: 'inherit',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(0.97)'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}>
                                <Icon size={20} color="#fff" />
                                <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{label}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Appointments</p>
                        {appointments.length === 0 ? (
                            <p style={{ fontSize: 13, color: t.textMuted }}>No appointments today</p>
                        ) : appointments.slice(0, 3).map((a, i) => {
                            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                            const avatar = a.patient?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                            return (
                                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '22', color, fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{avatar}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.patient?.fullName}</p>
                                        <p style={{ fontSize: 11, color: t.textMuted }}>{a.doctor?.fullName} · {a.doctor?.department}</p>
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