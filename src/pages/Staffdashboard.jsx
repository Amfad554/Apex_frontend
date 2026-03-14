import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, AlertCircle, Bell, Calendar, ChevronDown,
    ClipboardList, Clock, Download, Eye, FileText, Heart,
    Home, LogOut, Menu, Moon, MoreHorizontal, Pill,
    Search, Settings, Stethoscope, Sun, Thermometer,
    User, Users, X, Plus, CheckCircle, AlertTriangle,
    Syringe, FlaskConical, Microscope, BedDouble,
    PhoneCall, Shield, TrendingUp, RefreshCw, Zap,
    ChevronRight, ArrowRight, Star, MessageSquare,
    BarChart2, Package, Clipboard, UserCheck, Wind,
    Droplets, MapPin, Phone, Mail, Filter
} from 'lucide-react';

/* ─── Design Tokens (matches Hospital Dashboard) ────────────────────────────── */
const BLUE = '#3b5bdb';
const BLUE2 = '#4c6ef5';
const EMERALD = '#059669';
const AMBER = '#d97706';
const ROSE = '#e11d48';
const INDIGO = '#4f46e5';
const CYAN = '#0891b2';
const VIOLET = '#7c3aed';

/* Role accent colors — each role gets its own identity within the blue system */
const ROLE_META = {
    doctor: {
        label: 'Doctor', accent: BLUE, accent2: BLUE2,
        icon: Stethoscope,
        gradient: `linear-gradient(135deg, #3b5bdb, #4c6ef5)`,
        tag: 'MD',
    },
    nurse: {
        label: 'Nurse', accent: EMERALD, accent2: '#10b981',
        icon: Heart,
        gradient: `linear-gradient(135deg, #059669, #10b981)`,
        tag: 'RN',
    },
    pharmacist: {
        label: 'Pharmacist', accent: VIOLET, accent2: '#8b5cf6',
        icon: Pill,
        gradient: `linear-gradient(135deg, #7c3aed, #8b5cf6)`,
        tag: 'RPh',
    },
    lab_technician: {
        label: 'Lab Technician', accent: CYAN, accent2: '#06b6d4',
        icon: Microscope,
        gradient: `linear-gradient(135deg, #0891b2, #06b6d4)`,
        tag: 'MLT',
    },
    receptionist: {
        label: 'Receptionist', accent: AMBER, accent2: '#f59e0b',
        icon: PhoneCall,
        gradient: `linear-gradient(135deg, #d97706, #f59e0b)`,
        tag: 'RCP',
    },
    admin: {
        label: 'Administrator', accent: ROSE, accent2: '#f43f5e',
        icon: Shield,
        gradient: `linear-gradient(135deg, #e11d48, #f43f5e)`,
        tag: 'ADM',
    },
};

const DEFAULT_ROLE = 'doctor';

const themes = {
    dark: {
        bg: '#0d1117',
        surface: '#161b22',
        surfaceAlt: '#1c2432',
        surfaceHover: '#21293a',
        border: 'rgba(255,255,255,0.06)',
        text: '#e6edf3',
        textSub: 'rgba(230,237,243,0.55)',
        textMuted: 'rgba(230,237,243,0.3)',
        shadow: '0 4px 24px rgba(0,0,0,0.5)',
        shadowLg: '0 16px 48px rgba(0,0,0,0.6)',
        sidebar: '#0d1117',
        hover: 'rgba(59,91,219,0.1)',
        input: 'rgba(255,255,255,0.05)',
    },
    light: {
        bg: '#f5f7ff',
        surface: '#ffffff',
        surfaceAlt: '#f5f7ff',
        surfaceHover: '#eef1ff',
        border: 'rgba(0,0,0,0.07)',
        text: '#111827',
        textSub: 'rgba(17,24,39,0.6)',
        textMuted: 'rgba(17,24,39,0.38)',
        shadow: '0 4px 24px rgba(59,91,219,0.08)',
        shadowLg: '0 16px 48px rgba(59,91,219,0.12)',
        sidebar: '#ffffff',
        hover: 'rgba(59,91,219,0.06)',
        input: 'rgba(0,0,0,0.04)',
    },
};

const STATUS = {
    scheduled: { bg: 'rgba(217,119,6,0.12)', color: AMBER, dot: AMBER, label: 'Scheduled' },
    completed: { bg: 'rgba(5,150,105,0.12)', color: EMERALD, dot: EMERALD, label: 'Completed' },
    cancelled: { bg: 'rgba(225,29,72,0.12)', color: ROSE, dot: ROSE, label: 'Cancelled' },
    active: { bg: 'rgba(5,150,105,0.12)', color: EMERALD, dot: EMERALD, label: 'Active' },
    pending: { bg: 'rgba(217,119,6,0.12)', color: AMBER, dot: AMBER, label: 'Pending' },
    critical: { bg: 'rgba(225,29,72,0.12)', color: ROSE, dot: ROSE, label: 'Critical' },
    admitted: { bg: 'rgba(59,91,219,0.12)', color: BLUE, dot: BLUE, label: 'Admitted' },
    discharged: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', dot: '#6b7280', label: 'Discharged' },
    processing: { bg: 'rgba(8,145,178,0.12)', color: CYAN, dot: CYAN, label: 'Processing' },
    ready: { bg: 'rgba(5,150,105,0.12)', color: EMERALD, dot: EMERALD, label: 'Ready' },
    dispensed: { bg: 'rgba(124,58,237,0.12)', color: VIOLET, dot: VIOLET, label: 'Dispensed' },
};

/* ─── Shared Utilities ──────────────────────────────────────────────────────── */
function initials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function Badge({ status }) {
    const s = STATUS[status?.toLowerCase()] || STATUS.pending;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: s.bg, color: s.color,
            fontSize: 11, fontWeight: 700,
            padding: '3px 10px 3px 7px', borderRadius: 20,
            whiteSpace: 'nowrap', letterSpacing: '0.02em',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
            {s.label}
        </span>
    );
}

function Spinner({ accent }) {
    return (
        <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 32, height: 32, border: `2.5px solid rgba(255,255,255,0.1)`, borderTopColor: accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
    );
}

function Empty({ icon: Icon, label, accent, t }) {
    return (
        <div style={{ padding: '52px 20px', textAlign: 'center', background: t.surface, borderRadius: 20, border: `1.5px dashed ${accent}33` }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Icon size={22} color={accent} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 14, color: t.textMuted, fontWeight: 600 }}>No {label} found</p>
            <p style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>Your {label} will appear here</p>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, sub, t, i = 0 }) {
    return (
        <div style={{
            background: t.surface, borderRadius: 20, padding: '20px',
            border: `1px solid ${t.border}`, boxShadow: t.shadow,
            position: 'relative', overflow: 'hidden',
            animation: `fadeUp 0.35s ease ${i * 0.07}s both`,
        }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color + '10', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={color} strokeWidth={2} />
                </div>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: '-0.5px', fontFamily: 'monospace', marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
            {sub && <p style={{ fontSize: 11, color, fontWeight: 700, marginTop: 6, background: color + '12', padding: '2px 8px', borderRadius: 20, display: 'inline-block' }}>{sub}</p>}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ROLE-SPECIFIC SECTIONS
══════════════════════════════════════════════════════════════════════════════ */

/* ─── Doctor Home ────────────────────────────────────────────────────────────── */
function DoctorHome({ t, staff, isDark, accent, onNavigate }) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const stats = [
        { label: "Today's Patients", value: '12', icon: Users, color: BLUE, sub: '3 pending' },
        { label: 'Appointments', value: '8', icon: Calendar, color: EMERALD, sub: 'Next in 20m' },
        { label: 'Pending Reports', value: '5', icon: FileText, color: AMBER, sub: 'Review needed' },
        { label: 'Admitted Patients', value: '3', icon: BedDouble, color: VIOLET, sub: 'Under care' },
    ];

    const patients = [
        { name: 'James Okafor', age: 45, condition: 'Hypertension', status: 'admitted', time: '09:00 AM', room: 'Ward 3A' },
        { name: 'Amaka Eze', age: 32, condition: 'Diabetes Type 2', status: 'scheduled', time: '10:30 AM', room: 'OPD 2' },
        { name: 'Chukwudi Nwosu', age: 67, condition: 'Cardiac Arrest', status: 'critical', time: 'Ongoing', room: 'ICU 1' },
        { name: 'Ngozi Adeyemi', age: 28, condition: 'Prenatal Care', status: 'completed', time: '08:15 AM', room: 'OPD 5' },
    ];

    const quickActions = [
        { label: 'My Patients', icon: Users, section: 'patients' },
        { label: 'Appointments', icon: Calendar, section: 'appointments' },
        { label: 'Write Rx', icon: Pill, section: 'prescriptions' },
        { label: 'Medical Records', icon: FileText, section: 'records' },
    ];

    return (
        <div>
            {/* Hero */}
            <div style={{
                background: isDark
                    ? `linear-gradient(135deg, ${BLUE}22, ${BLUE2}11, transparent)`
                    : `linear-gradient(135deg, ${BLUE}12, ${BLUE2}07, transparent)`,
                borderRadius: 28, padding: '32px', marginBottom: 28,
                border: `1px solid ${BLUE}33`, position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${BLUE}18, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{greeting} 👋</p>
                        <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 800, color: t.text, letterSpacing: '-0.5px', marginBottom: 8, lineHeight: 1.2 }}>
                            Dr. {staff?.fullName || staff?.name || 'Doctor'}
                        </h1>
                        <p style={{ fontSize: 13, color: t.textSub, marginBottom: 14 }}>{staff?.specialty || staff?.department || 'General Practice'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: `${BLUE}18`, border: `1px solid ${BLUE}33`, color: '#60a5fa', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                                {staff?.employeeId || 'DR-0001'}
                            </span>
                            <span style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', color: EMERALD, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <CheckCircle size={10} />On Duty
                            </span>
                        </div>
                    </div>
                    <div style={{ width: 80, height: 80, borderRadius: 22, background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#fff', boxShadow: `0 8px 28px ${BLUE}44`, flexShrink: 0 }}>
                        {initials(staff?.fullName || staff?.name)}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
                {stats.map((s, i) => <StatCard key={s.label} {...s} t={t} i={i} />)}
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text, letterSpacing: '-0.3px', marginBottom: 14 }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                    {quickActions.map(({ label, icon: Icon, section }) => (
                        <button key={section} onClick={() => onNavigate(section)}
                            style={{ background: t.surface, borderRadius: 16, padding: '18px 14px', border: `1px solid ${t.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: t.shadow }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE + '55'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'none'; }}
                        >
                            <div style={{ width: 38, height: 38, borderRadius: 11, background: BLUE + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={BLUE} strokeWidth={2} /></div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: t.text, lineHeight: 1.3 }}>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Today's patient list */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text }}>Today's Patients</h2>
                    <button onClick={() => onNavigate('patients')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#60a5fa', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>View all <ChevronRight size={14} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {patients.map((p, i) => (
                        <div key={p.name} style={{
                            background: t.surface, borderRadius: 16, padding: '16px 18px',
                            border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14,
                            animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
                        }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: BLUE + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#60a5fa', flexShrink: 0 }}>{initials(p.name)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                    <p style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{p.name} <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 400 }}>· {p.age}y</span></p>
                                    <Badge status={p.status} />
                                </div>
                                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, color: t.textMuted }}>{p.condition}</span>
                                    <span style={{ fontSize: 12, color: t.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} color={BLUE} />{p.time}</span>
                                    <span style={{ fontSize: 12, color: t.textMuted }}>{p.room}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Nurse Home ─────────────────────────────────────────────────────────────── */
function NurseHome({ t, staff, isDark, accent, onNavigate }) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const rm = ROLE_META.nurse;

    const stats = [
        { label: 'Assigned Patients', value: '14', icon: Users, color: rm.accent, sub: '2 critical' },
        { label: 'Vitals Due', value: '6', icon: Activity, color: AMBER, sub: 'Check now' },
        { label: 'Medications Due', value: '9', icon: Pill, color: VIOLET, sub: 'Next in 15m' },
        { label: 'Completed Today', value: '21', icon: CheckCircle, color: EMERALD, sub: 'Tasks done' },
    ];

    const tasks = [
        { patient: 'Emeka Obi', task: 'Administer IV Drip', ward: 'Ward 2B', time: '10:00 AM', priority: 'high' },
        { patient: 'Fatima Bello', task: 'Blood Pressure Check', ward: 'Ward 1A', time: '10:15 AM', priority: 'medium' },
        { patient: 'Olu Adewale', task: 'Post-op wound dressing', ward: 'Ward 4C', time: '11:00 AM', priority: 'high' },
        { patient: 'Chisom Nwachukwu', task: 'Oral medication', ward: 'OPD 3', time: '11:30 AM', priority: 'low' },
    ];

    const priorityColor = { high: ROSE, medium: AMBER, low: EMERALD };

    const quickActions = [
        { label: 'Patient Vitals', icon: Activity, section: 'vitals' },
        { label: 'Medication Log', icon: Pill, section: 'medications' },
        { label: 'Ward Overview', icon: BedDouble, section: 'ward' },
        { label: 'Incident Report', icon: AlertCircle, section: 'reports' },
    ];

    return (
        <div>
            <div style={{
                background: isDark ? `linear-gradient(135deg, ${rm.accent}22, ${rm.accent2}11, transparent)` : `linear-gradient(135deg, ${rm.accent}12, ${rm.accent2}07, transparent)`,
                borderRadius: 28, padding: '32px', marginBottom: 28,
                border: `1px solid ${rm.accent}33`, position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${rm.accent}18, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: rm.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{greeting} 👋</p>
                        <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 800, color: t.text, letterSpacing: '-0.5px', marginBottom: 8 }}>
                            {staff?.fullName || staff?.name || 'Nurse'}
                        </h1>
                        <p style={{ fontSize: 13, color: t.textSub, marginBottom: 14 }}>{staff?.department || 'General Ward'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: `${rm.accent}18`, border: `1px solid ${rm.accent}33`, color: rm.accent, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{staff?.employeeId || 'RN-0001'}</span>
                            <span style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', color: EMERALD, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle size={10} />On Shift</span>
                        </div>
                    </div>
                    <div style={{ width: 80, height: 80, borderRadius: 22, background: rm.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#fff', boxShadow: `0 8px 28px ${rm.accent}44`, flexShrink: 0 }}>
                        {initials(staff?.fullName || staff?.name)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
                {stats.map((s, i) => <StatCard key={s.label} {...s} t={t} i={i} />)}
            </div>

            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 14 }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                    {quickActions.map(({ label, icon: Icon, section }) => (
                        <button key={section} onClick={() => onNavigate(section)}
                            style={{ background: t.surface, borderRadius: 16, padding: '18px 14px', border: `1px solid ${t.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: t.shadow }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = rm.accent + '55'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'none'; }}
                        >
                            <div style={{ width: 38, height: 38, borderRadius: 11, background: rm.accent + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={rm.accent} strokeWidth={2} /></div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text }}>Pending Tasks</h2>
                    <span style={{ fontSize: 11, color: rm.accent, fontWeight: 700, background: rm.accent + '14', padding: '3px 10px', borderRadius: 20 }}>{tasks.length} remaining</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tasks.map((task, i) => (
                        <div key={i} style={{
                            background: t.surface, borderRadius: 16, padding: '16px 18px',
                            border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14,
                            animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
                        }}>
                            <div style={{ width: 4, height: 40, borderRadius: 4, background: priorityColor[task.priority], flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                    <p style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{task.task}</p>
                                    <span style={{ fontSize: 11, color: priorityColor[task.priority], fontWeight: 700, background: priorityColor[task.priority] + '14', padding: '2px 9px', borderRadius: 20, textTransform: 'capitalize' }}>{task.priority}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, color: t.textMuted }}>{task.patient}</span>
                                    <span style={{ fontSize: 12, color: t.textMuted }}>{task.ward}</span>
                                    <span style={{ fontSize: 12, color: t.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} color={rm.accent} />{task.time}</span>
                                </div>
                            </div>
                            <button style={{ width: 32, height: 32, borderRadius: 9, background: rm.accent + '14', border: 'none', cursor: 'pointer', color: rm.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <CheckCircle size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Pharmacist Home ────────────────────────────────────────────────────────── */
function PharmacistHome({ t, staff, isDark, accent, onNavigate }) {
    const rm = ROLE_META.pharmacist;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const stats = [
        { label: 'Prescriptions', value: '34', icon: ClipboardList, color: rm.accent, sub: '8 pending' },
        { label: 'Dispensed Today', value: '26', icon: Pill, color: EMERALD, sub: 'Completed' },
        { label: 'Low Stock Alerts', value: '4', icon: AlertTriangle, color: ROSE, sub: 'Reorder now' },
        { label: 'Drug Interactions', value: '2', icon: AlertCircle, color: AMBER, sub: 'Review' },
    ];

    const prescriptions = [
        { patient: 'James Okafor', drug: 'Metformin 500mg', doctor: 'Dr. Adebayo', status: 'pending', qty: '30 tabs' },
        { patient: 'Ngozi Iheoma', drug: 'Amoxicillin 250mg', doctor: 'Dr. Okonkwo', status: 'processing', qty: '21 caps' },
        { patient: 'Bola Akintunde', drug: 'Lisinopril 10mg', doctor: 'Dr. Chukwu', status: 'ready', qty: '30 tabs' },
        { patient: 'Tunde Fasanya', drug: 'Paracetamol 500mg', doctor: 'Dr. Eze', status: 'dispensed', qty: '20 tabs' },
    ];

    const quickActions = [
        { label: 'Prescriptions', icon: ClipboardList, section: 'prescriptions' },
        { label: 'Inventory', icon: Package, section: 'inventory' },
        { label: 'Drug Database', icon: FlaskConical, section: 'drugs' },
        { label: 'Reports', icon: BarChart2, section: 'reports' },
    ];

    return (
        <div>
            <div style={{
                background: isDark ? `linear-gradient(135deg, ${rm.accent}22, ${rm.accent2}11, transparent)` : `linear-gradient(135deg, ${rm.accent}12, ${rm.accent2}07, transparent)`,
                borderRadius: 28, padding: '32px', marginBottom: 28,
                border: `1px solid ${rm.accent}33`, position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${rm.accent}18, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: rm.accent2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{greeting} 👋</p>
                        <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 800, color: t.text, letterSpacing: '-0.5px', marginBottom: 8 }}>{staff?.fullName || staff?.name || 'Pharmacist'}</h1>
                        <p style={{ fontSize: 13, color: t.textSub, marginBottom: 14 }}>Pharmacy Dept · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: `${rm.accent}18`, border: `1px solid ${rm.accent}33`, color: rm.accent2, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{staff?.employeeId || 'RPh-0001'}</span>
                            <span style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', color: EMERALD, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle size={10} />On Duty</span>
                        </div>
                    </div>
                    <div style={{ width: 80, height: 80, borderRadius: 22, background: rm.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#fff', boxShadow: `0 8px 28px ${rm.accent}44`, flexShrink: 0 }}>
                        {initials(staff?.fullName || staff?.name)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
                {stats.map((s, i) => <StatCard key={s.label} {...s} t={t} i={i} />)}
            </div>

            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 14 }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                    {quickActions.map(({ label, icon: Icon, section }) => (
                        <button key={section} onClick={() => onNavigate(section)}
                            style={{ background: t.surface, borderRadius: 16, padding: '18px 14px', border: `1px solid ${t.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: t.shadow }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = rm.accent + '55'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'none'; }}
                        >
                            <div style={{ width: 38, height: 38, borderRadius: 11, background: rm.accent + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={rm.accent} strokeWidth={2} /></div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text }}>Prescription Queue</h2>
                    <span style={{ fontSize: 11, color: rm.accent, fontWeight: 700, background: rm.accent + '14', padding: '3px 10px', borderRadius: 20 }}>{prescriptions.filter(p => p.status !== 'dispensed').length} active</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {prescriptions.map((rx, i) => (
                        <div key={i} style={{ background: t.surface, borderRadius: 16, padding: '16px 18px', border: `1px solid ${t.border}`, display: 'flex', gap: 14, alignItems: 'center', animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: rm.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Pill size={18} color={rm.accent} strokeWidth={1.8} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                    <p style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{rx.drug}</p>
                                    <Badge status={rx.status} />
                                </div>
                                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, color: t.textMuted }}>{rx.patient}</span>
                                    <span style={{ fontSize: 12, color: t.textMuted }}>{rx.doctor}</span>
                                    <span style={{ fontSize: 12, color: rm.accent, fontWeight: 600 }}>{rx.qty}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Lab Technician Home ────────────────────────────────────────────────────── */
function LabHome({ t, staff, isDark, accent, onNavigate }) {
    const rm = ROLE_META.lab_technician;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const stats = [
        { label: 'Pending Tests', value: '18', icon: FlaskConical, color: rm.accent, sub: '5 urgent' },
        { label: 'In Progress', value: '7', icon: Microscope, color: AMBER, sub: 'Processing' },
        { label: 'Results Ready', value: '11', icon: CheckCircle, color: EMERALD, sub: 'To dispatch' },
        { label: 'Completed Today', value: '29', icon: BarChart2, color: BLUE, sub: 'All tests' },
    ];

    const tests = [
        { patient: 'Adaeze Obi', test: 'Full Blood Count', priority: 'urgent', status: 'processing', time: '09:30 AM' },
        { patient: 'Kelechi Eze', test: 'Liver Function Test', priority: 'high', status: 'pending', time: '10:00 AM' },
        { patient: 'Musa Ibrahim', test: 'Malaria Parasite', priority: 'medium', status: 'ready', time: '08:45 AM' },
        { patient: 'Sola Abiodun', test: 'Urinalysis', priority: 'low', status: 'completed', time: '08:00 AM' },
    ];

    const priorityColor = { urgent: ROSE, high: AMBER, medium: CYAN, low: EMERALD };

    const quickActions = [
        { label: 'Test Queue', icon: FlaskConical, section: 'tests' },
        { label: 'Results', icon: FileText, section: 'results' },
        { label: 'Equipment', icon: Microscope, section: 'equipment' },
        { label: 'Reports', icon: BarChart2, section: 'reports' },
    ];

    return (
        <div>
            <div style={{
                background: isDark ? `linear-gradient(135deg, ${rm.accent}22, ${rm.accent2}11, transparent)` : `linear-gradient(135deg, ${rm.accent}12, ${rm.accent2}07, transparent)`,
                borderRadius: 28, padding: '32px', marginBottom: 28,
                border: `1px solid ${rm.accent}33`, position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${rm.accent}18, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: rm.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{greeting} 👋</p>
                        <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 800, color: t.text, letterSpacing: '-0.5px', marginBottom: 8 }}>{staff?.fullName || staff?.name || 'Lab Technician'}</h1>
                        <p style={{ fontSize: 13, color: t.textSub, marginBottom: 14 }}>Laboratory Dept · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: `${rm.accent}18`, border: `1px solid ${rm.accent}33`, color: rm.accent, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{staff?.employeeId || 'MLT-0001'}</span>
                            <span style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', color: EMERALD, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle size={10} />On Duty</span>
                        </div>
                    </div>
                    <div style={{ width: 80, height: 80, borderRadius: 22, background: rm.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#fff', boxShadow: `0 8px 28px ${rm.accent}44`, flexShrink: 0 }}>
                        {initials(staff?.fullName || staff?.name)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
                {stats.map((s, i) => <StatCard key={s.label} {...s} t={t} i={i} />)}
            </div>

            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 14 }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                    {quickActions.map(({ label, icon: Icon, section }) => (
                        <button key={section} onClick={() => onNavigate(section)}
                            style={{ background: t.surface, borderRadius: 16, padding: '18px 14px', border: `1px solid ${t.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: t.shadow }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = rm.accent + '55'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'none'; }}
                        >
                            <div style={{ width: 38, height: 38, borderRadius: 11, background: rm.accent + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={rm.accent} strokeWidth={2} /></div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text }}>Test Queue</h2>
                    <span style={{ fontSize: 11, color: rm.accent, fontWeight: 700, background: rm.accent + '14', padding: '3px 10px', borderRadius: 20 }}>{tests.filter(t => t.status !== 'completed').length} pending</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tests.map((test, i) => (
                        <div key={i} style={{ background: t.surface, borderRadius: 16, padding: '16px 18px', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14, animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                            <div style={{ width: 4, height: 40, borderRadius: 4, background: priorityColor[test.priority], flexShrink: 0 }} />
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: rm.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FlaskConical size={17} color={rm.accent} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                    <p style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{test.test}</p>
                                    <Badge status={test.status} />
                                </div>
                                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, color: t.textMuted }}>{test.patient}</span>
                                    <span style={{ fontSize: 12, color: priorityColor[test.priority], fontWeight: 600, background: priorityColor[test.priority] + '12', padding: '1px 8px', borderRadius: 20, textTransform: 'capitalize' }}>{test.priority}</span>
                                    <span style={{ fontSize: 12, color: t.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} color={rm.accent} />{test.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Receptionist Home ──────────────────────────────────────────────────────── */
function ReceptionistHome({ t, staff, isDark, accent, onNavigate }) {
    const rm = ROLE_META.receptionist;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const stats = [
        { label: "Today's Appointments", value: '24', icon: Calendar, color: rm.accent, sub: '6 remaining' },
        { label: 'Walk-ins', value: '8', icon: Users, color: BLUE, sub: 'Registered' },
        { label: 'Checked In', value: '16', icon: UserCheck, color: EMERALD, sub: 'This morning' },
        { label: 'Avg. Wait Time', value: '18m', icon: Clock, color: AMBER, sub: 'Current' },
    ];

    const appointments = [
        { patient: 'Adaobi Nwosu', doctor: 'Dr. Adebayo', time: '10:00 AM', dept: 'Cardiology', status: 'scheduled' },
        { patient: 'Emeka Chukwu', doctor: 'Dr. Okonkwo', time: '10:30 AM', dept: 'Orthopedics', status: 'completed' },
        { patient: 'Halima Abubakar', doctor: 'Dr. Eze', time: '11:00 AM', dept: 'Pediatrics', status: 'scheduled' },
        { patient: 'Tayo Olawale', doctor: 'Dr. Chukwu', time: '11:30 AM', dept: 'Dermatology', status: 'pending' },
    ];

    const quickActions = [
        { label: 'Register Patient', icon: UserCheck, section: 'register' },
        { label: 'Appointments', icon: Calendar, section: 'appointments' },
        { label: 'Patient Search', icon: Search, section: 'patients' },
        { label: 'Today\'s Queue', icon: ClipboardList, section: 'queue' },
    ];

    return (
        <div>
            <div style={{
                background: isDark ? `linear-gradient(135deg, ${rm.accent}22, ${rm.accent2}11, transparent)` : `linear-gradient(135deg, ${rm.accent}12, ${rm.accent2}07, transparent)`,
                borderRadius: 28, padding: '32px', marginBottom: 28,
                border: `1px solid ${rm.accent}33`, position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${rm.accent}18, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: rm.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{greeting} 👋</p>
                        <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 800, color: t.text, letterSpacing: '-0.5px', marginBottom: 8 }}>{staff?.fullName || staff?.name || 'Receptionist'}</h1>
                        <p style={{ fontSize: 13, color: t.textSub, marginBottom: 14 }}>Front Desk · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: `${rm.accent}18`, border: `1px solid ${rm.accent}33`, color: rm.accent, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{staff?.employeeId || 'RCP-0001'}</span>
                            <span style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', color: EMERALD, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle size={10} />On Duty</span>
                        </div>
                    </div>
                    <div style={{ width: 80, height: 80, borderRadius: 22, background: rm.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#fff', boxShadow: `0 8px 28px ${rm.accent}44`, flexShrink: 0 }}>
                        {initials(staff?.fullName || staff?.name)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
                {stats.map((s, i) => <StatCard key={s.label} {...s} t={t} i={i} />)}
            </div>

            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 14 }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                    {quickActions.map(({ label, icon: Icon, section }) => (
                        <button key={section} onClick={() => onNavigate(section)}
                            style={{ background: t.surface, borderRadius: 16, padding: '18px 14px', border: `1px solid ${t.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: t.shadow }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = rm.accent + '55'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'none'; }}
                        >
                            <div style={{ width: 38, height: 38, borderRadius: 11, background: rm.accent + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={rm.accent} strokeWidth={2} /></div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text }}>Today's Appointments</h2>
                    <button onClick={() => onNavigate('appointments')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: rm.accent, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>View all <ChevronRight size={14} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {appointments.map((apt, i) => (
                        <div key={i} style={{ background: t.surface, borderRadius: 16, padding: '16px 18px', border: `1px solid ${t.border}`, display: 'flex', gap: 14, alignItems: 'center', animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                            <div style={{ width: 54, height: 54, borderRadius: 14, background: rm.accent + '14', border: `1.5px solid ${rm.accent}33`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: 14, fontWeight: 800, color: t.text, fontFamily: 'monospace' }}>{apt.time.split(':')[0]}</span>
                                <span style={{ fontSize: 9, fontWeight: 700, color: rm.accent }}>{apt.time.split(' ')[1]}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                    <p style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{apt.patient}</p>
                                    <Badge status={apt.status} />
                                </div>
                                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, color: t.textMuted }}>{apt.doctor}</span>
                                    <span style={{ fontSize: 12, color: t.textMuted }}>{apt.dept}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Generic Admin/Other Home ───────────────────────────────────────────────── */
function GenericHome({ t, staff, isDark, roleMeta, onNavigate }) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const stats = [
        { label: 'Tasks Today', value: '12', icon: ClipboardList, color: roleMeta.accent, sub: '4 pending' },
        { label: 'Messages', value: '7', icon: MessageSquare, color: BLUE, sub: 'Unread' },
        { label: 'Completed', value: '8', icon: CheckCircle, color: EMERALD, sub: 'This week' },
        { label: 'Alerts', value: '2', icon: Bell, color: ROSE, sub: 'Attention' },
    ];

    return (
        <div>
            <div style={{
                background: isDark ? `linear-gradient(135deg, ${roleMeta.accent}22, ${roleMeta.accent2}11, transparent)` : `linear-gradient(135deg, ${roleMeta.accent}12, ${roleMeta.accent2}07, transparent)`,
                borderRadius: 28, padding: '32px', marginBottom: 28,
                border: `1px solid ${roleMeta.accent}33`, position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: roleMeta.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{greeting} 👋</p>
                        <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 800, color: t.text, letterSpacing: '-0.5px', marginBottom: 8 }}>{staff?.fullName || staff?.name || roleMeta.label}</h1>
                        <p style={{ fontSize: 13, color: t.textSub, marginBottom: 14 }}>{roleMeta.label} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: `${roleMeta.accent}18`, border: `1px solid ${roleMeta.accent}33`, color: roleMeta.accent, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{staff?.employeeId || `${roleMeta.tag}-0001`}</span>
                            <span style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', color: EMERALD, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle size={10} />On Duty</span>
                        </div>
                    </div>
                    <div style={{ width: 80, height: 80, borderRadius: 22, background: roleMeta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#fff', boxShadow: `0 8px 28px ${roleMeta.accent}44`, flexShrink: 0 }}>
                        {initials(staff?.fullName || staff?.name)}
                    </div>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
                {stats.map((s, i) => <StatCard key={s.label} {...s} t={t} i={i} />)}
            </div>
            <div style={{ background: t.surface, borderRadius: 20, padding: '28px', border: `1px solid ${t.border}`, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: roleMeta.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <roleMeta.icon size={24} color={roleMeta.accent} strokeWidth={1.8} />
                </div>
                <p style={{ fontWeight: 800, fontSize: 16, color: t.text, marginBottom: 6 }}>Welcome, {roleMeta.label}</p>
                <p style={{ fontSize: 13, color: t.textMuted }}>Your personalised tools and tasks are being configured for your role.</p>
            </div>
        </div>
    );
}

/* ─── Shared Sections ────────────────────────────────────────────────────────── */
function MyProfile({ t, staff, isDark, roleMeta }) {
    const info = [
        { label: 'Full Name', value: staff?.fullName || staff?.name || '—', icon: User, color: BLUE },
        { label: 'Employee ID', value: staff?.employeeId || '—', icon: Shield, color: INDIGO },
        { label: 'Role', value: roleMeta.label, icon: Stethoscope, color: roleMeta.accent },
        { label: 'Department', value: staff?.department || '—', icon: BedDouble, color: VIOLET },
        { label: 'Specialty', value: staff?.specialty || '—', icon: Activity, color: CYAN },
        { label: 'Phone', value: staff?.phone || '—', icon: Phone, color: EMERALD },
        { label: 'Email', value: staff?.email || '—', icon: Mail, color: BLUE2 },
        { label: 'Shift', value: staff?.shift || 'Morning', icon: Clock, color: AMBER },
    ];

    return (
        <div>
            <div style={{
                background: isDark ? `linear-gradient(135deg, ${roleMeta.accent}20, ${INDIGO}10, transparent)` : `linear-gradient(135deg, ${roleMeta.accent}12, ${INDIGO}06, transparent)`,
                borderRadius: 28, padding: '36px 32px', marginBottom: 28,
                border: `1px solid ${roleMeta.accent}33`, position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ width: 96, height: 96, borderRadius: 28, flexShrink: 0, background: roleMeta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 32, color: '#fff', boxShadow: `0 12px 36px ${roleMeta.accent}44`, border: `4px solid ${roleMeta.accent}33` }}>
                        {initials(staff?.fullName || staff?.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: roleMeta.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Staff Profile · {roleMeta.label}</p>
                        <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: t.text, letterSpacing: '-0.5px', marginBottom: 10 }}>{staff?.fullName || staff?.name || '—'}</h1>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {staff?.employeeId && <span style={{ background: roleMeta.accent + '18', border: `1px solid ${roleMeta.accent}33`, color: roleMeta.accent, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{staff.employeeId}</span>}
                            <span style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.textSub, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{staff?.department || 'General'}</span>
                            <span style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.18)', color: EMERALD, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>Active Staff</span>
                        </div>
                    </div>
                </div>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: t.text, marginBottom: 16 }}>Staff Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {info.map(({ label, value, icon: Icon, color }, i) => (
                    <div key={label} style={{ background: t.surface, borderRadius: 18, padding: '18px 20px', border: `1px solid ${t.border}`, boxShadow: t.shadow, display: 'flex', alignItems: 'flex-start', gap: 14, animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}>
                        <div style={{ width: 38, height: 38, borderRadius: 11, background: color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                            <Icon size={16} color={color} strokeWidth={2} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{label}</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: t.text, lineHeight: 1.4, wordBreak: 'break-word' }}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Placeholder({ icon: Icon, title, desc, accent, t }) {
    return (
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <Icon size={28} color={accent} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 8 }}>{title}</h2>
            <p style={{ fontSize: 14, color: t.textMuted }}>{desc}</p>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   NAV CONFIG — per role
══════════════════════════════════════════════════════════════════════════════ */
const NAV_BY_ROLE = {
    doctor: [
        { id: 'home', label: 'Dashboard', icon: Home },
        { id: 'patients', label: 'My Patients', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'records', label: 'Records', icon: FileText },
        { id: 'profile', label: 'Profile', icon: User },
    ],
    nurse: [
        { id: 'home', label: 'Dashboard', icon: Home },
        { id: 'vitals', label: 'Vitals', icon: Activity },
        { id: 'medications', label: 'Medications', icon: Pill },
        { id: 'ward', label: 'Ward', icon: BedDouble },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'profile', label: 'Profile', icon: User },
    ],
    pharmacist: [
        { id: 'home', label: 'Dashboard', icon: Home },
        { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'drugs', label: 'Drug DB', icon: FlaskConical },
        { id: 'reports', label: 'Reports', icon: BarChart2 },
        { id: 'profile', label: 'Profile', icon: User },
    ],
    lab_technician: [
        { id: 'home', label: 'Dashboard', icon: Home },
        { id: 'tests', label: 'Test Queue', icon: FlaskConical },
        { id: 'results', label: 'Results', icon: FileText },
        { id: 'equipment', label: 'Equipment', icon: Microscope },
        { id: 'reports', label: 'Reports', icon: BarChart2 },
        { id: 'profile', label: 'Profile', icon: User },
    ],
    receptionist: [
        { id: 'home', label: 'Dashboard', icon: Home },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'queue', label: 'Queue', icon: ClipboardList },
        { id: 'register', label: 'Register', icon: UserCheck },
        { id: 'profile', label: 'Profile', icon: User },
    ],
};

// Fallback nav for unknown roles
const DEFAULT_NAV = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
];

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
    const [notifications] = useState(3);

    // Derive role
    const rawRole = (staff?.role || staff?.staffRole || DEFAULT_ROLE).toLowerCase().replace(/\s+/g, '_');
    const roleMeta = ROLE_META[rawRole] || ROLE_META.doctor;
    const navItems = NAV_BY_ROLE[rawRole] || DEFAULT_NAV;
    const BOTTOM_NAV = navItems.slice(0, 4);
    const MORE_NAV = navItems.slice(4);

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        requestAnimationFrame(() => {
            setTimeout(() => setHeaderIn(true), 50);
            setTimeout(() => setNavMounted(true), 150);
        });
    }, []);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Sync theme with hospital dashboard
    useEffect(() => {
        const onThemeChange = () => setIsDark(localStorage.getItem('theme') === 'dark');
        window.addEventListener('themeChange', onThemeChange);
        return () => window.removeEventListener('themeChange', onThemeChange);
    }, []);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('user');
            if (!raw) { navigate('/stafflogin'); return; }
            const user = JSON.parse(raw);
            setStaff(user);
        } catch { navigate('/stafflogin'); }
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        window.dispatchEvent(new Event('themeChange'));
    };

    const handleLogout = () => {
        ['token', 'user', 'userRole'].forEach(k => localStorage.removeItem(k));
        window.dispatchEvent(new Event('authChange'));
        navigate('/stafflogin');
    };

    const goTo = (id) => { setSection(id); setMobileMenu(false); };

    const sharedProps = { t, staff, isDark, accent: roleMeta.accent, roleMeta };

    const renderSection = () => {
        if (section === 'profile') return <MyProfile {...sharedProps} />;

        switch (rawRole) {
            case 'doctor':
                switch (section) {
                    case 'home': return <DoctorHome         {...sharedProps} onNavigate={goTo} />;
                    case 'patients': return <Placeholder icon={Users} title="My Patients" desc="View and manage your assigned patients." accent={roleMeta.accent} t={t} />;
                    case 'appointments': return <Placeholder icon={Calendar} title="Appointments" desc="Your upcoming and past appointments." accent={roleMeta.accent} t={t} />;
                    case 'prescriptions': return <Placeholder icon={Pill} title="Prescriptions" desc="Write and manage patient prescriptions." accent={roleMeta.accent} t={t} />;
                    case 'records': return <Placeholder icon={FileText} title="Medical Records" desc="Access and update patient medical records." accent={roleMeta.accent} t={t} />;
                    default: return <DoctorHome         {...sharedProps} onNavigate={goTo} />;
                }

            case 'nurse':
                switch (section) {
                    case 'home': return <NurseHome           {...sharedProps} onNavigate={goTo} />;
                    case 'vitals': return <Placeholder icon={Activity} title="Patient Vitals" desc="Record and monitor patient vital signs." accent={roleMeta.accent} t={t} />;
                    case 'medications': return <Placeholder icon={Pill} title="Medication Log" desc="Track and administer medications." accent={roleMeta.accent} t={t} />;
                    case 'ward': return <Placeholder icon={BedDouble} title="Ward Overview" desc="Overview of all patients in your ward." accent={roleMeta.accent} t={t} />;
                    case 'reports': return <Placeholder icon={FileText} title="Incident Reports" desc="Log and review incident reports." accent={roleMeta.accent} t={t} />;
                    default: return <NurseHome           {...sharedProps} onNavigate={goTo} />;
                }

            case 'pharmacist':
                switch (section) {
                    case 'home': return <PharmacistHome     {...sharedProps} onNavigate={goTo} />;
                    case 'prescriptions': return <Placeholder icon={ClipboardList} title="Prescriptions" desc="Review and process incoming prescriptions." accent={roleMeta.accent} t={t} />;
                    case 'inventory': return <Placeholder icon={Package} title="Drug Inventory" desc="Manage drug stock levels and expiry dates." accent={roleMeta.accent} t={t} />;
                    case 'drugs': return <Placeholder icon={FlaskConical} title="Drug Database" desc="Look up drug information and interactions." accent={roleMeta.accent} t={t} />;
                    case 'reports': return <Placeholder icon={BarChart2} title="Reports" desc="Dispensing reports and analytics." accent={roleMeta.accent} t={t} />;
                    default: return <PharmacistHome     {...sharedProps} onNavigate={goTo} />;
                }

            case 'lab_technician':
                switch (section) {
                    case 'home': return <LabHome              {...sharedProps} onNavigate={goTo} />;
                    case 'tests': return <Placeholder icon={FlaskConical} title="Test Queue" desc="Manage and process pending lab tests." accent={roleMeta.accent} t={t} />;
                    case 'results': return <Placeholder icon={FileText} title="Test Results" desc="View and dispatch completed test results." accent={roleMeta.accent} t={t} />;
                    case 'equipment': return <Placeholder icon={Microscope} title="Equipment" desc="Track lab equipment and maintenance." accent={roleMeta.accent} t={t} />;
                    case 'reports': return <Placeholder icon={BarChart2} title="Reports" desc="Test volume and turnaround reports." accent={roleMeta.accent} t={t} />;
                    default: return <LabHome              {...sharedProps} onNavigate={goTo} />;
                }

            case 'receptionist':
                switch (section) {
                    case 'home': return <ReceptionistHome  {...sharedProps} onNavigate={goTo} />;
                    case 'appointments': return <Placeholder icon={Calendar} title="Appointments" desc="Schedule and manage patient appointments." accent={roleMeta.accent} t={t} />;
                    case 'patients': return <Placeholder icon={Users} title="Patient Search" desc="Find and view patient records." accent={roleMeta.accent} t={t} />;
                    case 'queue': return <Placeholder icon={ClipboardList} title="Today's Queue" desc="Real-time patient waiting queue." accent={roleMeta.accent} t={t} />;
                    case 'register': return <Placeholder icon={UserCheck} title="Register Patient" desc="Register new and returning patients." accent={roleMeta.accent} t={t} />;
                    default: return <ReceptionistHome  {...sharedProps} onNavigate={goTo} />;
                }

            default:
                return section === 'home'
                    ? <GenericHome {...sharedProps} onNavigate={goTo} />
                    : <Placeholder icon={roleMeta.icon} title={section.charAt(0).toUpperCase() + section.slice(1)} desc="This section is available for your role." accent={roleMeta.accent} t={t} />;
        }
    };

    /* ── Sidebar ──────────────────────────────────────────────────────────────── */
    const SidebarContent = ({ forceFull = false }) => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <div style={{
                padding: '18px 14px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', borderBottom: `1px solid ${t.border}`,
                gap: 10, flexShrink: 0,
                opacity: headerIn ? 1 : 0,
                transform: headerIn ? 'translateY(0)' : 'translateY(-8px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: roleMeta.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 14px ${roleMeta.accent}44`,
                    }}>
                        <Activity size={18} color="#fff" />
                    </div>
                    <div>
                        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px', color: t.text, display: 'block' }}>
                            HMS<span style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Care</span>
                        </span>
                        <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{roleMeta.label}</span>
                    </div>
                </div>
                {forceFull && (
                    <button onClick={() => setMobileMenu(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSub, padding: 4, display: 'flex', borderRadius: 8, transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'rotate(90deg)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Role badge strip */}
            <div style={{ padding: '10px 14px 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: roleMeta.accent + '12', border: `1px solid ${roleMeta.accent}22` }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: roleMeta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <roleMeta.icon size={14} color="#fff" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{staff?.fullName || staff?.name || roleMeta.label}</p>
                        <p style={{ fontSize: 10, color: roleMeta.accent, fontWeight: 700 }}>{staff?.employeeId || `${roleMeta.tag}-0001`}</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                {navItems.map(({ id, icon: Icon, label }, idx) => {
                    const isActive = section === id;
                    return (
                        <button key={id} onClick={() => goTo(id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                                border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit',
                                background: isActive ? (isDark ? `${roleMeta.accent}22` : `${roleMeta.accent}11`) : 'transparent',
                                color: isActive ? roleMeta.accent : t.textSub,
                                fontWeight: isActive ? 600 : 400, fontSize: 14, minHeight: 44,
                                opacity: navMounted ? 1 : 0,
                                transform: navMounted ? 'translateX(0)' : 'translateX(-14px)',
                                transition: `opacity 0.35s ease ${idx * 0.04}s, transform 0.35s cubic-bezier(0.34,1.2,0.64,1) ${idx * 0.04}s, background 0.15s, color 0.15s`,
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.hover; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <Icon size={18} style={{ flexShrink: 0, transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }} />
                            <span style={{ flex: 1 }}>{label}</span>
                            {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: roleMeta.accent, flexShrink: 0, animation: 'pulsePip 2s ease-in-out infinite' }} />}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div style={{ padding: '10px 8px', borderTop: `1px solid ${t.border}`, flexShrink: 0, opacity: navMounted ? 1 : 0, transition: 'opacity 0.4s ease 0.4s' }}>
                <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', color: ROSE, fontSize: 14, fontWeight: 500, background: 'none', border: 'none', width: '100%', fontFamily: 'inherit', minHeight: 44, transition: 'background 0.15s, transform 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(225,29,72,0.08)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                    <LogOut size={18} style={{ flexShrink: 0 }} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    /* ── Render ───────────────────────────────────────────────────────────────── */
    return (
        <div style={{
            display: 'flex', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden',
            background: t.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            color: t.text, transition: 'background 0.3s',
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 10px; }
        @keyframes fadeUp    { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes headerSlide { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulsePip {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,91,219,0.5); transform: scale(1); }
          50%       { box-shadow: 0 0 0 4px rgba(59,91,219,0); transform: scale(1.3); }
        }
        @keyframes badgePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.4); } }
        .bottom-nav { padding-bottom: max(12px, env(safe-area-inset-bottom)) !important; }
      `}</style>

            {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
            {!isMobile && (
                <aside style={{
                    width: 240, height: '100dvh',
                    background: t.sidebar, borderRight: `1px solid ${t.border}`,
                    position: 'sticky', top: 0, flexShrink: 0, zIndex: 100,
                    boxShadow: isDark ? '2px 0 20px rgba(0,0,0,0.3)' : '2px 0 12px rgba(0,0,0,0.06)',
                    display: 'flex', flexDirection: 'column',
                    transition: 'background 0.3s',
                }}>
                    <SidebarContent />
                </aside>
            )}

            {/* ── Mobile Sidebar Overlay ─────────────────────────────────────────── */}
            {isMobile && mobileMenu && (
                <>
                    <div onClick={() => setMobileMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease' }} />
                    <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 270, background: t.sidebar, zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '6px 0 32px rgba(0,0,0,0.3)', animation: 'slideRight 0.24s ease' }}>
                        <SidebarContent forceFull />
                    </aside>
                </>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, height: '100%' }}>

                {/* ── Top Bar ──────────────────────────────────────────────────────── */}
                <header style={{
                    height: isMobile ? 56 : 64,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: isMobile ? '0 12px' : '0 20px',
                    background: t.sidebar, borderBottom: `1px solid ${t.border}`,
                    position: 'sticky', top: 0, zIndex: 50, gap: 8, flexShrink: 0,
                    animation: 'headerSlide 0.35s cubic-bezier(0.34,1.2,0.64,1) both 0.05s',
                }}>
                    {/* Left */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, minWidth: 0 }}>
                        <button onClick={() => isMobile ? setMobileMenu(true) : null}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSub, display: 'flex', padding: 6, borderRadius: 8, flexShrink: 0, minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s, transform 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = t.hover; e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <Menu size={20} />
                        </button>

                        {isMobile && (
                            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px', color: t.text }}>
                                HMS<span style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Care</span>
                            </span>
                        )}

                        {!isMobile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.input, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, transition: 'border-color 0.2s, box-shadow 0.2s' }}
                                onFocusCapture={e => { e.currentTarget.style.borderColor = roleMeta.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${roleMeta.accent}20`; }}
                                onBlurCapture={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <Search size={14} color={t.textMuted} />
                                <input placeholder="Search patients, records..."
                                    style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: 200, fontFamily: 'inherit' }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, flexShrink: 0 }}>
                        <button onClick={toggleTheme}
                            style={{ width: 36, height: 36, borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub, transition: 'transform 0.3s, background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(20deg) scale(1.08)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
                        >
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        <div style={{ position: 'relative' }}>
                            <button style={{ width: 36, height: 36, borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub, transition: 'transform 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Bell size={16} />
                            </button>
                            {notifications > 0 && (
                                <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: ROSE, border: `2px solid ${t.sidebar}`, animation: 'badgePulse 2s ease-in-out infinite' }} />
                            )}
                        </div>

                        {/* Role badge + name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 4px', borderRadius: 10, transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = t.hover}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{
                                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                                background: roleMeta.gradient,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, color: '#fff', fontSize: 13,
                                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12) rotate(-6deg)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
                            >
                                {initials(staff?.fullName || staff?.name)}
                            </div>
                            {!isMobile && (
                                <>
                                    <div style={{ minWidth: 0 }}>
                                        <span style={{ fontWeight: 600, fontSize: 13, color: t.text, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{staff?.fullName || staff?.name || roleMeta.label}</span>
                                        <span style={{ fontSize: 11, color: roleMeta.accent, fontWeight: 700 }}>{roleMeta.label}</span>
                                    </div>
                                    <ChevronDown size={14} color={t.textMuted} />
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Main Content ─────────────────────────────────────────────────── */}
                <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isMobile ? '14px 12px 80px' : '24px', height: 0 }}>
                    <div style={{ maxWidth: 960, width: '100%', animation: 'fadeUp 0.3s ease' }} key={section}>
                        {renderSection()}
                    </div>
                </main>

                {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
                {isMobile && (
                    <nav className="bottom-nav" style={{
                        position: 'fixed', bottom: 0, left: 0, right: 0,
                        background: t.sidebar, borderTop: `1px solid ${t.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
                        paddingTop: 8, zIndex: 100,
                        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
                    }}>
                        {BOTTOM_NAV.map(({ id, icon: Icon, label }) => {
                            const isActive = section === id;
                            return (
                                <button key={id} onClick={() => goTo(id)}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                                        padding: '6px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                        background: isActive ? (isDark ? `${roleMeta.accent}20` : `${roleMeta.accent}10`) : 'transparent',
                                        color: isActive ? roleMeta.accent : t.textMuted,
                                        fontFamily: 'inherit', flex: 1, transition: 'color 0.2s, background 0.2s', minHeight: 48,
                                    }}
                                >
                                    <Icon size={21} style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', transform: isActive ? 'scale(1.2)' : 'scale(1)' }} />
                                    <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</span>
                                </button>
                            );
                        })}
                        {MORE_NAV.length > 0 && (
                            <button onClick={() => setMobileMenu(true)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 8px', borderRadius: 12, border: 'none', cursor: 'pointer', background: MORE_NAV.some(i => i.id === section) ? `${roleMeta.accent}20` : 'transparent', color: MORE_NAV.some(i => i.id === section) ? roleMeta.accent : t.textMuted, fontFamily: 'inherit', flex: 1, transition: 'color 0.2s', minHeight: 48 }}
                            >
                                <MoreHorizontal size={21} />
                                <span style={{ fontSize: 10, fontWeight: 400 }}>More</span>
                            </button>
                        )}
                    </nav>
                )}
            </div>
        </div>
    );
}