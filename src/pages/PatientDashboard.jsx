import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Calendar, FileText, Pill, LogOut, Sun, Moon,
  Activity, User, X, Clock, Droplets, Phone, Mail,
  MapPin, AlertCircle, ChevronRight, Shield, Bell,
  TrendingUp, Thermometer, Wind, Zap, Plus, ArrowRight,
  CheckCircle, Home, Menu, Search, RefreshCw, Eye,
  ChevronLeft, Star, MessageSquare, Download
} from 'lucide-react';

/* ─── Design Tokens ─────────────────────────────────────────────────────────── */
const TEAL = '#0d9488';
const TEAL2 = '#14b8a6';
const TEAL_LIGHT = '#5eead4';
const EMERALD = '#059669';
const AMBER = '#d97706';
const ROSE = '#e11d48';
const INDIGO = '#4f46e5';

const T = {
  dark: {
    bg: '#070d0f',
    bgAlt: '#0c1517',
    surface: '#111c1e',
    surfaceAlt: '#162023',
    surfaceHover: '#1c2a2d',
    glass: 'rgba(13,148,136,0.06)',
    border: 'rgba(255,255,255,0.05)',
    borderStrong: 'rgba(20,184,166,0.2)',
    text: '#ecfdf5',
    textSub: 'rgba(236,253,245,0.55)',
    textMuted: 'rgba(236,253,245,0.3)',
    shadow: '0 4px 24px rgba(0,0,0,0.5)',
    shadowLg: '0 16px 48px rgba(0,0,0,0.6)',
    card: '#0f1a1c',
    gradHero: 'linear-gradient(135deg, #0d2b2e 0%, #091a1c 50%, #070f10 100%)',
    accentBg: 'rgba(13,148,136,0.12)',
  },
  light: {
    bg: '#f0fdf9',
    bgAlt: '#e6fffa',
    surface: '#ffffff',
    surfaceAlt: '#f0fdf9',
    surfaceHover: '#e6fffa',
    glass: 'rgba(13,148,136,0.04)',
    border: 'rgba(0,0,0,0.06)',
    borderStrong: 'rgba(13,148,136,0.25)',
    text: '#042f2e',
    textSub: 'rgba(4,47,46,0.6)',
    textMuted: 'rgba(4,47,46,0.38)',
    shadow: '0 4px 24px rgba(13,148,136,0.08)',
    shadowLg: '0 16px 48px rgba(13,148,136,0.12)',
    card: '#ffffff',
    gradHero: 'linear-gradient(135deg, #ccfbf1 0%, #d1fae5 50%, #e0f2fe 100%)',
    accentBg: 'rgba(13,148,136,0.08)',
  },
};

const STATUS_MAP = {
  scheduled: { bg: 'rgba(217,119,6,0.12)', text: AMBER, dot: AMBER, label: 'Scheduled' },
  completed:  { bg: 'rgba(5,150,105,0.12)', text: EMERALD, dot: EMERALD, label: 'Completed' },
  cancelled:  { bg: 'rgba(225,29,72,0.12)', text: ROSE, dot: ROSE, label: 'Cancelled' },
  active:     { bg: 'rgba(5,150,105,0.12)', text: EMERALD, dot: EMERALD, label: 'Active' },
  pending:    { bg: 'rgba(217,119,6,0.12)', text: AMBER, dot: AMBER, label: 'Pending' },
};

function initials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function Badge({ status }) {
  const s = STATUS_MAP[status?.toLowerCase()] || STATUS_MAP.scheduled;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.text,
      fontSize: 11, fontWeight: 700,
      padding: '3px 10px 3px 7px', borderRadius: 20,
      textTransform: 'capitalize', whiteSpace: 'nowrap', letterSpacing: '0.02em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  );
}

function Spinner({ t }) {
  return (
    <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: t.textMuted }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 32, height: 32, border: `2.5px solid ${t.border}`, borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <span style={{ fontSize: 13, fontWeight: 500 }}>Loading...</span>
    </div>
  );
}

function Empty({ icon: Icon, label, t }) {
  return (
    <div style={{ padding: '52px 20px', textAlign: 'center', background: t.surface, borderRadius: 20, border: `1.5px dashed ${t.borderStrong}` }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: t.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <Icon size={22} color={TEAL} strokeWidth={1.5} />
      </div>
      <p style={{ fontSize: 14, color: t.textMuted, fontWeight: 600 }}>No {label} found</p>
      <p style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>Your {label} will appear here</p>
    </div>
  );
}

function Err({ msg }) {
  return (
    <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(225,29,72,0.07)', border: '1px solid rgba(225,29,72,0.18)', color: ROSE, display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 500 }}>
      <AlertCircle size={16} />{msg}
    </div>
  );
}

/* ─── Overview / Home ──────────────────────────────────────────────────────── */
function Overview({ t, patient, isDark, onNavigate }) {
  const av = initials(patient?.fullName);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const vitals = [
    { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: ROSE, trend: '+2%', good: true },
    { label: 'Blood Pressure', value: '118/76', unit: 'mmHg', icon: Activity, color: TEAL, trend: 'Normal', good: true },
    { label: 'Temperature', value: '36.6', unit: '°C', icon: Thermometer, color: AMBER, trend: 'Normal', good: true },
    { label: 'O₂ Saturation', value: '98', unit: '%', icon: Wind, color: INDIGO, trend: '+1%', good: true },
  ];

  const quickActions = [
    { label: 'Book Appointment', icon: Calendar, color: TEAL, section: 'appointments' },
    { label: 'View Records', icon: FileText, color: INDIGO, section: 'records' },
    { label: 'My Prescriptions', icon: Pill, color: EMERALD, section: 'prescriptions' },
    { label: 'My Profile', icon: User, color: AMBER, section: 'profile' },
  ];

  return (
    <div>
      {/* Hero greeting card */}
      <div style={{
        background: isDark
          ? `linear-gradient(135deg, ${TEAL}22 0%, ${EMERALD}11 50%, transparent 100%)`
          : `linear-gradient(135deg, ${TEAL}15 0%, ${EMERALD}08 50%, transparent 100%)`,
        borderRadius: 28, padding: '36px 32px',
        border: `1px solid ${t.borderStrong}`,
        marginBottom: 28, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${TEAL}18, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 120, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${EMERALD}12, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: TEAL, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              {greeting} 👋
            </p>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: t.text, letterSpacing: '-0.5px', marginBottom: 10, lineHeight: 1.2 }}>
              {patient?.fullName?.split(' ')[0] || 'Patient'}
            </h1>
            <p style={{ fontSize: 14, color: t.textSub, marginBottom: 18, lineHeight: 1.6 }}>
              Welcome to your health dashboard. Everything you need, in one place.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {patient?.patientNumber && (
                <span style={{ background: t.accentBg, border: `1px solid ${t.borderStrong}`, color: TEAL, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.05em' }}>
                  ID: {patient.patientNumber}
                </span>
              )}
              {patient?.bloodGroup && (
                <span style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.18)', color: ROSE, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                  {patient.bloodGroup} Blood Type
                </span>
              )}
              <span style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.18)', color: EMERALD, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle size={10} />Active Patient
              </span>
            </div>
          </div>
          {/* Avatar */}
          <div style={{
            width: 88, height: 88, borderRadius: 24, flexShrink: 0,
            background: `linear-gradient(135deg, ${TEAL}, ${TEAL2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 26, color: '#fff',
            boxShadow: `0 8px 32px ${TEAL}44`,
            border: `3px solid ${TEAL}33`,
          }}>{av}</div>
        </div>
      </div>

      {/* Vitals strip */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: t.text, letterSpacing: '-0.3px' }}>Health Vitals</h2>
          <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, background: t.surfaceAlt, padding: '4px 10px', borderRadius: 20, border: `1px solid ${t.border}` }}>Last updated today</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {vitals.map(({ label, value, unit, icon: Icon, color, trend, good }, i) => (
            <div key={label} style={{
              background: t.surface, borderRadius: 20, padding: '18px 16px',
              border: `1px solid ${t.border}`, boxShadow: t.shadow,
              position: 'relative', overflow: 'hidden',
              animation: `fadeUp 0.35s ease ${i * 0.06}s both`,
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 70, height: 70, borderRadius: '50%', background: color + '10' }} />
              <div style={{ width: 36, height: 36, borderRadius: 11, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={16} color={color} strokeWidth={2} />
              </div>
              <p style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: '-0.5px', fontFamily: 'monospace' }}>{value}</span>
                <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 600 }}>{unit}</span>
              </div>
              <span style={{ fontSize: 11, color: good ? EMERALD : ROSE, fontWeight: 700, background: good ? 'rgba(5,150,105,0.08)' : 'rgba(225,29,72,0.08)', padding: '2px 8px', borderRadius: 20 }}>{trend}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: t.text, letterSpacing: '-0.3px', marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {quickActions.map(({ label, icon: Icon, color, section }) => (
            <button key={section} onClick={() => onNavigate(section)}
              style={{
                background: t.surface, borderRadius: 18, padding: '20px 16px',
                border: `1px solid ${t.border}`, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
                transition: 'all 0.2s', fontFamily: 'inherit',
                boxShadow: t.shadow,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = t.shadow; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} strokeWidth={2} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.text, lineHeight: 1.3, textAlign: 'left' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Health tip banner */}
      <div style={{
        background: isDark ? `linear-gradient(135deg, ${TEAL}18, ${EMERALD}10)` : `linear-gradient(135deg, ${TEAL}10, ${EMERALD}06)`,
        border: `1px solid ${t.borderStrong}`,
        borderRadius: 20, padding: '20px 22px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${TEAL}, ${TEAL2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Zap size={20} color="#fff" strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 3 }}>Daily Health Tip</p>
          <p style={{ fontSize: 13, color: t.textSub, lineHeight: 1.5 }}>Drink at least 8 glasses of water today. Staying hydrated improves energy levels and cognitive function.</p>
        </div>
        <RefreshCw size={16} color={t.textMuted} style={{ flexShrink: 0, cursor: 'pointer' }} />
      </div>
    </div>
  );
}

/* ─── Appointments ───────────────────────────────────────────────────────────── */
function MyAppointments({ t, patient }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!patient?.id) return;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/appointments/${patient.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        if (!res.ok) throw new Error('Failed to load appointments');
        const d = await res.json();
        setItems(d.appointments || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [patient?.id]);

  const filters = ['all', 'scheduled', 'completed', 'cancelled'];
  const filtered = filter === 'all' ? items : items.filter(a => a.status?.toLowerCase() === filter);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: '-0.4px', marginBottom: 3 }}>Appointments</h1>
          <p style={{ fontSize: 13, color: t.textMuted }}>{items.length} total appointments</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg, ${TEAL}, ${TEAL2})`, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 18px', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: `0 4px 16px ${TEAL}44` }}>
          <Plus size={15} /> Book New
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${filter === f ? TEAL : t.border}`,
            background: filter === f ? t.accentBg : t.surface,
            color: filter === f ? TEAL : t.textMuted,
            fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
          }}>{f === 'all' ? `All (${items.length})` : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {loading ? <Spinner t={t} /> : error ? <Err msg={error} /> : filtered.length === 0 ? <Empty icon={Calendar} label="appointments" t={t} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((a, i) => (
            <div key={a.id} style={{
              background: t.surface, borderRadius: 20, padding: '20px 22px',
              border: `1px solid ${t.border}`, boxShadow: t.shadow,
              display: 'flex', gap: 18, alignItems: 'flex-start',
              animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
            }}>
              {/* Date box */}
              <div style={{ width: 54, height: 60, borderRadius: 16, background: t.accentBg, border: `1.5px solid ${t.borderStrong}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {new Date(a.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span style={{ fontSize: 22, fontWeight: 800, color: t.text, lineHeight: 1, fontFamily: 'monospace' }}>
                  {new Date(a.appointmentDate).getDate()}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 800, fontSize: 15, color: t.text }}>{a.reason || 'Appointment'}</p>
                  <Badge status={a.status} />
                </div>
                <p style={{ fontSize: 13, color: t.textSub, marginBottom: 10, fontWeight: 500 }}>
                  Dr. {a.doctor?.fullName || '—'}
                  {(a.doctor?.specialty || a.doctor?.department) && (
                    <span style={{ color: t.textMuted }}> · {a.doctor?.specialty || a.doctor?.department}</span>
                  )}
                </p>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: t.textMuted, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                    <Clock size={12} color={TEAL} />
                    {new Date(a.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                  {a.appointmentTime && (
                    <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 500 }}>{a.appointmentTime}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Medical Records ─────────────────────────────────────────────────────────── */
const RECORD_TYPES = {
  lab_results:  { label: 'Lab', color: '#06b6d4' },
  consultation: { label: 'Consult', color: TEAL },
  imaging:      { label: 'Imaging', color: INDIGO },
  other:        { label: 'Other', color: '#6b7280' },
};

function MyRecords({ t, patient }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!patient?.id) return;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/medical-records/patient/${patient.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        if (!res.ok) throw new Error('Failed to load records');
        const d = await res.json();
        setItems(d.records || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [patient?.id]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: '-0.4px', marginBottom: 3 }}>Medical Records</h1>
          <p style={{ fontSize: 13, color: t.textMuted }}>{items.length} records on file</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.surface, color: TEAL, border: `1.5px solid ${t.borderStrong}`, borderRadius: 12, padding: '10px 18px', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <Download size={15} /> Export All
        </button>
      </div>

      {loading ? <Spinner t={t} /> : error ? <Err msg={error} /> : items.length === 0 ? <Empty icon={FileText} label="records" t={t} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {items.map((r, i) => {
            const rt = RECORD_TYPES[r.recordType] || RECORD_TYPES.other;
            return (
              <div key={r.id} onClick={() => setSelected(r)}
                style={{
                  background: t.surface, borderRadius: 22, padding: '22px', border: `1px solid ${t.border}`,
                  boxShadow: t.shadow, cursor: 'pointer', transition: 'all 0.2s',
                  animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = rt.color + '44'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${rt.color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = t.shadow; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: rt.color, background: rt.color + '14', padding: '4px 11px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{rt.label}</span>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: t.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Eye size={13} color={t.textMuted} />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 15, color: t.text, marginBottom: 5, lineHeight: 1.3 }}>{r.title}</h3>
                  {r.diagnosis && <p style={{ fontSize: 12, color: t.textSub, fontWeight: 500 }}>Dx: {r.diagnosis}</p>}
                </div>
                {r.notes && <p style={{ fontSize: 12, color: t.textMuted, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.6 }}>{r.notes}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${t.border}`, paddingTop: 12, marginTop: 'auto' }}>
                  <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 600 }}>Dr. {r.doctor?.fullName || '—'}</span>
                  <span style={{ fontSize: 11, color: t.textMuted }}>{new Date(r.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Detail Modal */}
      {selected && (
        <div onClick={e => e.target === e.currentTarget && setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: t.surface, borderRadius: 26, width: '100%', maxWidth: 480, maxHeight: '88vh', overflowY: 'auto', border: `1px solid ${t.borderStrong}`, boxShadow: '0 32px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.22s ease' }}>
            <div style={{ padding: '22px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: t.surface, borderRadius: '26px 26px 0 0' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Medical Record</p>
                <h2 style={{ fontWeight: 800, fontSize: 17, color: t.text }}>{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.15)', cursor: 'pointer', color: ROSE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Attending Doctor', selected.doctor?.fullName || '—'],
                ['Record Date', new Date(selected.recordDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })],
                ['Diagnosis', selected.diagnosis || '—'],
                ['Clinical Findings', selected.findings || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ background: t.surfaceAlt, borderRadius: 14, padding: '14px 16px', border: `1px solid ${t.border}` }}>
                  <p style={{ fontSize: 11, color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: t.text, lineHeight: 1.5 }}>{val}</p>
                </div>
              ))}
              {selected.notes && (
                <div style={{ background: t.accentBg, borderRadius: 14, padding: '14px 16px', border: `1px solid ${t.borderStrong}` }}>
                  <p style={{ fontSize: 11, color: TEAL, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Notes</p>
                  <p style={{ fontSize: 14, color: t.text, lineHeight: 1.7 }}>{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Prescriptions ──────────────────────────────────────────────────────────── */
function MyPrescriptions({ t, patient }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patient?.id) return;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/prescriptions/patient/${patient.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        if (!res.ok) throw new Error('Failed to load prescriptions');
        const d = await res.json();
        setItems(d.prescriptions || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [patient?.id]);

  const activeRx  = items.filter(r => r.status?.toLowerCase() === 'active' || !r.status);
  const otherRx   = items.filter(r => r.status?.toLowerCase() !== 'active' && r.status);

  const RxCard = ({ rx, i }) => (
    <div key={rx.id} style={{
      background: t.surface, borderRadius: 20, padding: '20px 22px',
      border: `1px solid ${t.border}`, boxShadow: t.shadow,
      animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: `${EMERALD}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Pill size={20} color={EMERALD} strokeWidth={1.8} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: t.text, marginBottom: 3 }}>{rx.medication}</p>
            <p style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>{rx.dosage}</p>
          </div>
        </div>
        <Badge status={rx.status || 'active'} />
      </div>
      {rx.instructions && (
        <div style={{ background: t.surfaceAlt, borderRadius: 10, padding: '10px 13px', marginBottom: 12, border: `1px solid ${t.border}` }}>
          <p style={{ fontSize: 12, color: t.textSub, lineHeight: 1.6, fontStyle: 'italic' }}>"{rx.instructions}"</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: `1px solid ${t.border}`, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 600 }}>Dr. {rx.doctor?.fullName || '—'}</span>
        {rx.duration && <span style={{ fontSize: 12, color: t.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{rx.duration}</span>}
        <span style={{ fontSize: 12, color: t.textMuted, marginLeft: 'auto' }}>
          {new Date(rx.prescribedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: '-0.4px', marginBottom: 3 }}>Prescriptions</h1>
        <p style={{ fontSize: 13, color: t.textMuted }}>{items.length} total · {activeRx.length} active</p>
      </div>

      {loading ? <Spinner t={t} /> : error ? <Err msg={error} /> : items.length === 0 ? <Empty icon={Pill} label="prescriptions" t={t} /> : (
        <>
          {activeRx.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: EMERALD }} />
                <h2 style={{ fontSize: 14, fontWeight: 800, color: t.text }}>Active Prescriptions</h2>
                <span style={{ fontSize: 11, color: EMERALD, fontWeight: 700, background: 'rgba(5,150,105,0.1)', padding: '2px 8px', borderRadius: 20 }}>{activeRx.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeRx.map((rx, i) => <RxCard key={rx.id} rx={rx} i={i} />)}
              </div>
            </div>
          )}
          {otherRx.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.textMuted }} />
                <h2 style={{ fontSize: 14, fontWeight: 800, color: t.text }}>Past Prescriptions</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {otherRx.map((rx, i) => <RxCard key={rx.id} rx={rx} i={activeRx.length + i} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Profile ────────────────────────────────────────────────────────────────── */
function MyProfile({ t, patient, isDark }) {
  const av = initials(patient?.fullName);
  const info = [
    { label: 'Full Name', value: patient?.fullName || '—', icon: User, color: TEAL },
    { label: 'Patient ID', value: patient?.patientNumber || '—', icon: Shield, color: INDIGO },
    { label: 'Blood Group', value: patient?.bloodGroup || '—', icon: Droplets, color: ROSE },
    { label: 'Gender', value: patient?.gender || '—', icon: User, color: TEAL2 },
    { label: 'Phone', value: patient?.phone || '—', icon: Phone, color: EMERALD },
    { label: 'Email', value: patient?.email || '—', icon: Mail, color: INDIGO },
    { label: 'Address', value: patient?.address || '—', icon: MapPin, color: AMBER },
    { label: 'Conditions', value: patient?.medicalConditions || 'None listed', icon: Activity, color: ROSE },
    { label: 'Next of Kin', value: patient?.nextOfKinName || '—', icon: User, color: '#06b6d4' },
    { label: 'Kin Phone', value: patient?.nextOfKinPhone || '—', icon: Phone, color: '#06b6d4' },
  ];

  return (
    <div>
      {/* Profile hero */}
      <div style={{
        background: isDark
          ? `linear-gradient(135deg, ${TEAL}20, ${INDIGO}10, transparent)`
          : `linear-gradient(135deg, ${TEAL}12, ${INDIGO}06, transparent)`,
        borderRadius: 28, padding: '36px 32px', marginBottom: 28,
        border: `1px solid ${t.borderStrong}`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${TEAL}18, transparent 70%)` }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{
            width: 96, height: 96, borderRadius: 28, flexShrink: 0,
            background: `linear-gradient(135deg, ${TEAL}, ${TEAL2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 32, color: '#fff',
            boxShadow: `0 12px 36px ${TEAL}44`,
            border: `4px solid ${TEAL}33`,
          }}>{av}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: TEAL, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Patient Profile</p>
            <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: t.text, letterSpacing: '-0.5px', marginBottom: 10 }}>{patient?.fullName || '—'}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {patient?.patientNumber && <span style={{ background: t.accentBg, border: `1px solid ${t.borderStrong}`, color: TEAL, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{patient.patientNumber}</span>}
              {patient?.bloodGroup && <span style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.18)', color: ROSE, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{patient.bloodGroup}</span>}
              {patient?.gender && <span style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.textSub, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, textTransform: 'capitalize' }}>{patient.gender}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <h2 style={{ fontSize: 17, fontWeight: 800, color: t.text, letterSpacing: '-0.3px', marginBottom: 16 }}>Personal Information</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {info.map(({ label, value, icon: Icon, color }, i) => (
          <div key={label} style={{
            background: t.surface, borderRadius: 18, padding: '18px 20px',
            border: `1px solid ${t.border}`, boxShadow: t.shadow,
            display: 'flex', alignItems: 'flex-start', gap: 14,
            animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
          }}>
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

/* ─── Navigation ─────────────────────────────────────────────────────────────── */
const NAV = [
  { id: 'overview',      label: 'Home',          icon: Home },
  { id: 'appointments',  label: 'Appointments',  icon: Calendar },
  { id: 'records',       label: 'Records',       icon: FileText },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'profile',       label: 'Profile',       icon: User },
];

/* ─── Main Export ────────────────────────────────────────────────────────────── */
export default function PatientDashboard() {
  const navigate = useNavigate();
  const [isDark, setIsDark]     = useState(() => localStorage.getItem('patientTheme') === 'dark');
  const [patient, setPatient]   = useState(null);
  const [section, setSection]   = useState('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const t = isDark ? T.dark : T.light;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return navigate('/patientlogin');
      const user = JSON.parse(raw);
      if (user.role !== 'patient') return navigate('/patientlogin');
      setPatient(user);
    } catch { navigate('/patientlogin'); }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('patientTheme', next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    ['token', 'user', 'userRole'].forEach(k => localStorage.removeItem(k));
    navigate('/patientlogin');
  };

  const goTo = (id) => { setSection(id); setMobileMenu(false); };

  const av    = initials(patient?.fullName);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const sectionProps = { t, patient, isDark };

  const renderSection = () => {
    switch (section) {
      case 'overview':      return <Overview      {...sectionProps} onNavigate={goTo} />;
      case 'appointments':  return <MyAppointments {...sectionProps} />;
      case 'records':       return <MyRecords      {...sectionProps} />;
      case 'prescriptions': return <MyPrescriptions {...sectionProps} />;
      case 'profile':       return <MyProfile      {...sectionProps} />;
      default:              return <Overview       {...sectionProps} onNavigate={goTo} />;
    }
  };

  return (
    <div style={{
      display: 'flex', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden',
      background: t.bg, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      color: t.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${TEAL}33; border-radius: 8px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>

      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      {!isMobile && (
        <aside style={{
          width: 260, height: '100dvh', background: t.surface,
          borderRight: `1px solid ${t.border}`,
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          boxShadow: isDark ? '4px 0 32px rgba(0,0,0,0.4)' : '4px 0 24px rgba(13,148,136,0.06)',
          zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ padding: '28px 24px 22px', borderBottom: `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 14,
                background: `linear-gradient(135deg, ${TEAL}, ${TEAL2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 16px ${TEAL}40`,
              }}>
                <Heart size={20} color="#fff" strokeWidth={2.2} />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px', color: t.text }}>
                  HMS<span style={{ color: TEAL }}>Care</span>
                </p>
                <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Patient Portal</p>
              </div>
            </div>
          </div>

          {/* Date strip */}
          <div style={{ padding: '14px 24px 8px' }}>
            <p style={{ fontSize: 12, color: t.textMuted, fontWeight: 600 }}>{today}</p>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '8px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {NAV.map(({ id, label, icon: Icon }) => {
              const active = section === id;
              return (
                <button key={id} onClick={() => goTo(id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 14, border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                    background: active ? t.accentBg : 'transparent',
                    color: active ? TEAL : t.textSub,
                    fontWeight: active ? 700 : 500, fontSize: 14,
                    textAlign: 'left', transition: 'all 0.15s',
                    borderLeft: `3px solid ${active ? TEAL : 'transparent'}`,
                    minHeight: 46,
                  }}
                  onMouseEnter={e => !active && (e.currentTarget.style.background = t.surfaceAlt)}
                  onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                  {label}
                  {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: TEAL }} />}
                </button>
              );
            })}
          </nav>

          {/* User card + controls */}
          <div style={{ padding: '14px 14px 22px', borderTop: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderRadius: 16, background: t.accentBg, border: `1px solid ${t.borderStrong}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${TEAL}, ${TEAL2})`, color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{av}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient?.fullName || 'Patient'}</p>
                <p style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>{patient?.patientNumber || '—'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={toggleTheme} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px', borderRadius: 12, border: `1px solid ${t.border}`,
                cursor: 'pointer', fontFamily: 'inherit', background: t.surfaceAlt,
                color: t.textSub, fontWeight: 600, fontSize: 12, transition: 'all 0.15s',
              }}>
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                {isDark ? 'Light' : 'Dark'}
              </button>
              <button onClick={handleLogout} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px', borderRadius: 12, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                background: 'rgba(225,29,72,0.07)', color: ROSE,
                fontWeight: 600, fontSize: 12,
              }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── Mobile Sidebar Overlay ─────────────────────────────────────────── */}
      {isMobile && mobileMenu && (
        <>
          <div onClick={() => setMobileMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease' }} />
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
            background: t.surface, zIndex: 201,
            display: 'flex', flexDirection: 'column',
            boxShadow: `6px 0 40px rgba(0,0,0,0.35)`,
            animation: 'slideLeft 0.25s ease',
          }}>
            <div style={{ padding: '22px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg, ${TEAL}, ${TEAL2})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={16} color="#fff" strokeWidth={2.2} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: t.text }}>HMS<span style={{ color: TEAL }}>Care</span></span>
              </div>
              <button onClick={() => setMobileMenu(false)} style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 9, width: 32, height: 32, cursor: 'pointer', color: t.textSub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>
            <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
              {NAV.map(({ id, label, icon: Icon }) => {
                const active = section === id;
                return (
                  <button key={id} onClick={() => goTo(id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 16px', borderRadius: 14, border: 'none',
                      cursor: 'pointer', fontFamily: 'inherit',
                      background: active ? t.accentBg : 'transparent',
                      color: active ? TEAL : t.textSub,
                      fontWeight: active ? 700 : 500, fontSize: 15,
                      textAlign: 'left', transition: 'all 0.15s',
                      borderLeft: `3px solid ${active ? TEAL : 'transparent'}`,
                      minHeight: 50,
                    }}
                  >
                    <Icon size={19} />
                    {label}
                  </button>
                );
              })}
            </nav>
            <div style={{ padding: '14px 12px 32px', borderTop: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: t.accentBg, border: `1px solid ${t.borderStrong}`, marginBottom: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${TEAL}, ${TEAL2})`, color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{av}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{patient?.fullName || 'Patient'}</p>
                  <p style={{ fontSize: 11, color: t.textMuted }}>{patient?.patientNumber || '—'}</p>
                </div>
              </div>
              <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: `1px solid ${t.border}`, cursor: 'pointer', fontFamily: 'inherit', background: t.surfaceAlt, color: t.textSub, fontWeight: 600, fontSize: 14, width: '100%' }}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                {isDark ? 'Switch to Light' : 'Switch to Dark'}
              </button>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(225,29,72,0.07)', color: ROSE, fontWeight: 600, fontSize: 14, width: '100%' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── Content area ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <header style={{
          height: isMobile ? 56 : 66, flexShrink: 0,
          background: t.surface, borderBottom: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 28px', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <button onClick={() => setMobileMenu(true)} style={{ width: 36, height: 36, borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub }}>
                <Menu size={18} />
              </button>
            )}
            {isMobile ? (
              <span style={{ fontWeight: 800, fontSize: 16, color: t.text }}>HMS<span style={{ color: TEAL }}>Care</span></span>
            ) : (
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: t.text, letterSpacing: '-0.3px' }}>
                  {NAV.find(n => n.id === section)?.label || 'Dashboard'}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isMobile && (
              <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub }}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
            <div style={{ position: 'relative' }}>
              <button style={{ width: 36, height: 36, borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub }}>
                <Bell size={16} />
              </button>
              <div style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: ROSE, border: `2px solid ${t.surface}` }} />
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${TEAL}, ${TEAL2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13, cursor: 'pointer', flexShrink: 0, boxShadow: `0 2px 12px ${TEAL}44` }}>
              {av}
            </div>
          </div>
        </header>

        {/* ── Scrollable main content ───────────────────────────────────────── */}
        <main style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: isMobile ? '20px 16px 100px' : '32px 32px 48px',
          height: 0,
        }}>
          <div style={{ maxWidth: 920, width: '100%', animation: 'fadeUp 0.3s ease' }} key={section}>
            {renderSection()}
          </div>
        </main>

        {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
        {isMobile && (
          <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: t.surface, borderTop: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-around',
            paddingTop: 8, paddingBottom: `max(12px, env(safe-area-inset-bottom))`,
            zIndex: 150, boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          }}>
            {NAV.map(({ id, label, icon: Icon }) => {
              const active = section === id;
              return (
                <button key={id} onClick={() => goTo(id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    padding: '6px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: active ? t.accentBg : 'transparent',
                    color: active ? TEAL : t.textMuted,
                    fontFamily: 'inherit', flex: 1, transition: 'all 0.15s',
                    minHeight: 48,
                  }}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.01em' }}>{label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}