import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Calendar, FileText, Pill, LogOut, Sun, Moon,
  Activity, User, X, Clock, Droplets, Phone, Mail,
  MapPin, Loader, AlertCircle, Home, ChevronRight,
  Stethoscope, Shield,
} from 'lucide-react';

const BLUE = '#1d6ff4';
const BLUE_MID = '#4d8ef7';

const T = {
  dark: {
    bg: '#0c0f1a',
    surface: '#111827',
    surfaceAlt: '#1a2235',
    border: 'rgba(255,255,255,0.07)',
    borderStrong: 'rgba(255,255,255,0.12)',
    text: '#f1f5ff',
    textSub: 'rgba(241,245,255,0.55)',
    textMuted: 'rgba(241,245,255,0.3)',
    shadow: '0 2px 16px rgba(0,0,0,0.5)',
    shadowLg: '0 8px 40px rgba(0,0,0,0.6)',
    sidebar: '#0e1424',
    accentBg: 'rgba(29,111,244,0.12)',
  },
  light: {
    bg: '#f4f7ff',
    surface: '#ffffff',
    surfaceAlt: '#f8faff',
    border: 'rgba(0,0,0,0.07)',
    borderStrong: 'rgba(0,0,0,0.12)',
    text: '#0d1526',
    textSub: 'rgba(13,21,38,0.55)',
    textMuted: 'rgba(13,21,38,0.35)',
    shadow: '0 2px 16px rgba(29,111,244,0.06)',
    shadowLg: '0 8px 40px rgba(29,111,244,0.1)',
    sidebar: '#ffffff',
    accentBg: '#e8f0fe',
  },
};

const STATUS = {
  scheduled: { bg: 'rgba(251,191,36,0.12)', text: '#f59e0b', dot: '#f59e0b' },
  completed:  { bg: 'rgba(16,185,129,0.12)', text: '#10b981', dot: '#10b981' },
  cancelled:  { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', dot: '#ef4444' },
  active:     { bg: 'rgba(16,185,129,0.12)', text: '#10b981', dot: '#10b981' },
  pending:    { bg: 'rgba(251,191,36,0.12)', text: '#f59e0b', dot: '#f59e0b' },
};

const RECORD_TYPES = {
  lab_results:  { label: 'Lab',     color: '#06b6d4' },
  consultation: { label: 'Consult', color: BLUE },
  imaging:      { label: 'Imaging', color: '#8b5cf6' },
  other:        { label: 'Other',   color: '#6b7280' },
};

function initials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function Spinner({ t }) {
  return (
    <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: t.textMuted }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, border: `3px solid ${t.border}`, borderTopColor: BLUE, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 13 }}>Loading...</span>
    </div>
  );
}

function Empty({ icon: Icon, label, t }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', background: t.surface, borderRadius: 20, border: `1px dashed ${t.borderStrong}` }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: t.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <Icon size={24} color={BLUE} strokeWidth={1.5} />
      </div>
      <p style={{ fontSize: 14, color: t.textMuted, fontWeight: 500 }}>No {label} found</p>
    </div>
  );
}

function Badge({ status }) {
  const s = STATUS[status] || STATUS.scheduled;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.text, fontSize: 11, fontWeight: 600, padding: '3px 10px 3px 8px', borderRadius: 20, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function SectionHeader({ title, sub, t }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: '-0.4px', marginBottom: 3 }}>{title}</h1>
      <p style={{ fontSize: 13, color: t.textMuted }}>{sub}</p>
    </div>
  );
}

function Err({ msg }) {
  return (
    <div style={{ padding: 20, borderRadius: 14, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      <AlertCircle size={16} />{msg}
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────
function Overview({ t, patient }) {
  const av = initials(patient?.fullName);
  const info = [
    { label: 'Patient ID',  value: patient?.patientNumber || '—',        icon: Shield,   color: BLUE },
    { label: 'Blood Group', value: patient?.bloodGroup || '—',            icon: Droplets, color: '#ef4444' },
    { label: 'Phone',       value: patient?.phone || '—',                 icon: Phone,    color: '#10b981' },
    { label: 'Email',       value: patient?.email || '—',                 icon: Mail,     color: '#8b5cf6' },
    { label: 'Address',     value: patient?.address || '—',               icon: MapPin,   color: '#f59e0b' },
    { label: 'Conditions',  value: patient?.medicalConditions || 'None',  icon: Activity, color: '#ef4444' },
    { label: 'Next of Kin', value: patient?.nextOfKinName || '—',         icon: User,     color: '#06b6d4' },
    { label: 'Kin Phone',   value: patient?.nextOfKinPhone || '—',        icon: Phone,    color: '#06b6d4' },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 60%, #6ea8fb 100%)`,
        borderRadius: 24, padding: '32px 28px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(29,111,244,0.35)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 80, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255,255,255,0.3)', color: '#fff',
            fontWeight: 800, fontSize: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{av}</div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Patient Profile</p>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 24, letterSpacing: '-0.5px', marginBottom: 8 }}>{patient?.fullName || 'Loading...'}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {patient?.patientNumber && <span style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{patient.patientNumber}</span>}
              {patient?.gender && <span style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize' }}>{patient.gender}</span>}
              {patient?.bloodGroup && <span style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{patient.bloodGroup} Blood Type</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {info.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: t.surface, borderRadius: 16, padding: '16px 18px', border: `1px solid ${t.border}`, boxShadow: t.shadow, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <Icon size={16} color={color} strokeWidth={2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: t.text, lineHeight: 1.4, wordBreak: 'break-word' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Appointments ─────────────────────────────────────────────────────────────
function MyAppointments({ t, patient }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patient?.id) return;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments/patient/${patient.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        if (!res.ok) throw new Error('Failed to load');
        const d = await res.json();
        setItems(d.appointments || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [patient?.id]);

  return (
    <div>
      <SectionHeader title="My Appointments" sub={`${items.length} total`} t={t} />
      {loading ? <Spinner t={t} /> : error ? <Err msg={error} /> : items.length === 0 ? <Empty icon={Calendar} label="appointments" t={t} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(a => (
            <div key={a.id} style={{ background: t.surface, borderRadius: 18, padding: '18px 20px', border: `1px solid ${t.border}`, boxShadow: t.shadow, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: t.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar size={20} color={BLUE} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: t.text }}>{a.reason || 'Appointment'}</p>
                  <Badge status={a.status} />
                </div>
                <p style={{ fontSize: 13, color: t.textSub, marginBottom: 8 }}>
                  Dr. {a.doctor?.fullName || '—'}
                  {(a.doctor?.specialty || a.doctor?.department) && ` · ${a.doctor?.specialty || a.doctor?.department}`}
                </p>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span style={{ fontSize: 12, color: t.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />{new Date(a.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {a.appointmentTime && <span style={{ fontSize: 12, color: t.textMuted }}>{a.appointmentTime}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Medical Records ──────────────────────────────────────────────────────────
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
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/medical-records/patient/${patient.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        if (!res.ok) throw new Error('Failed to load');
        const d = await res.json();
        setItems(d.records || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [patient?.id]);

  return (
    <div>
      <SectionHeader title="Medical Records" sub={`${items.length} on file`} t={t} />
      {loading ? <Spinner t={t} /> : error ? <Err msg={error} /> : items.length === 0 ? <Empty icon={FileText} label="records" t={t} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
          {items.map(r => {
            const rt = RECORD_TYPES[r.recordType] || RECORD_TYPES.other;
            return (
              <div key={r.id} onClick={() => setSelected(r)}
                style={{ background: t.surface, borderRadius: 18, padding: 20, border: `1px solid ${t.border}`, boxShadow: t.shadow, cursor: 'pointer', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE + '55'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = t.shadowLg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = t.shadow; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: rt.color, background: rt.color + '14', padding: '3px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{rt.label}</span>
                  <ChevronRight size={14} color={t.textMuted} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 6 }}>{r.title}</h3>
                {r.diagnosis && <p style={{ fontSize: 12, color: t.textSub, marginBottom: 4 }}>Diagnosis: {r.diagnosis}</p>}
                {r.notes && <p style={{ fontSize: 12, color: t.textMuted, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 12 }}>{r.notes}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
                  <span style={{ fontSize: 11, color: t.textMuted }}>Dr. {r.doctor?.fullName || '—'}</span>
                  <span style={{ fontSize: 11, color: t.textMuted }}>{new Date(r.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div onClick={e => e.target === e.currentTarget && setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: t.surface, borderRadius: 24, width: '100%', maxWidth: 460, maxHeight: '85vh', overflowY: 'auto', border: `1px solid ${t.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '20px 22px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: t.surface }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: t.text }}>{selected.title}</h2>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
            </div>
            <div style={{ padding: 22 }}>
              {[['Doctor', selected.doctor?.fullName || '—'], ['Date', new Date(selected.recordDate).toLocaleDateString()], ['Diagnosis', selected.diagnosis || '—'], ['Findings', selected.findings || '—']].map(([label, val]) => (
                <div key={label} style={{ background: t.surfaceAlt, borderRadius: 12, padding: '12px 14px', border: `1px solid ${t.border}`, marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{val}</p>
                </div>
              ))}
              {selected.notes && (
                <div style={{ background: t.surfaceAlt, borderRadius: 12, padding: '12px 14px', border: `1px solid ${t.border}` }}>
                  <p style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Notes</p>
                  <p style={{ fontSize: 13, color: t.text, lineHeight: 1.7 }}>{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Prescriptions ────────────────────────────────────────────────────────────
function MyPrescriptions({ t, patient }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patient?.id) return;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions/patient/${patient.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        if (!res.ok) throw new Error('Failed to load');
        const d = await res.json();
        setItems(d.prescriptions || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [patient?.id]);

  return (
    <div>
      <SectionHeader title="My Prescriptions" sub={`${items.length} issued`} t={t} />
      {loading ? <Spinner t={t} /> : error ? <Err msg={error} /> : items.length === 0 ? <Empty icon={Pill} label="prescriptions" t={t} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(rx => (
            <div key={rx.id} style={{ background: t.surface, borderRadius: 18, padding: '18px 20px', border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: t.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Pill size={19} color={BLUE} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 3 }}>{rx.medication}</p>
                    <p style={{ fontSize: 12, color: t.textSub }}>{rx.dosage}</p>
                  </div>
                </div>
                <Badge status={rx.status || 'active'} />
              </div>
              <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: `1px solid ${t.border}`, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: t.textMuted }}>Dr. {rx.doctor?.fullName || '—'}</span>
                {rx.duration && <span style={{ fontSize: 12, color: t.textMuted }}>· {rx.duration}</span>}
                <span style={{ fontSize: 12, color: t.textMuted, marginLeft: 'auto' }}>{new Date(rx.prescribedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {rx.instructions && (
                <p style={{ fontSize: 12, color: t.textSub, marginTop: 10, padding: '8px 12px', background: t.surfaceAlt, borderRadius: 8, fontStyle: 'italic' }}>{rx.instructions}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',      label: 'Overview',        icon: Home },
  { id: 'appointments',  label: 'Appointments',    icon: Calendar },
  { id: 'records',       label: 'Medical Records', icon: FileText },
  { id: 'prescriptions', label: 'Prescriptions',   icon: Pill },
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('patientTheme') === 'dark');
  const [patient, setPatient] = useState(null);
  const [section, setSection] = useState('overview');

  const t = isDark ? T.dark : T.light;

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

  const av = initials(patient?.fullName);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: "'Outfit', 'DM Sans', 'Segoe UI', sans-serif", color: t.text, display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BLUE}33; border-radius: 8px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.28s ease forwards; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, background: t.sidebar,
        borderRight: `1px solid ${t.border}`,
        position: 'fixed', top: 0, left: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', zIndex: 100,
        boxShadow: isDark ? '4px 0 24px rgba(0,0,0,0.3)' : '4px 0 20px rgba(29,111,244,0.05)',
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 22px 20px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${BLUE}44` }}>
              <Heart size={19} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', color: t.text }}>HMS<span style={{ color: BLUE }}>Care</span></p>
              <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Patient Portal</p>
            </div>
          </div>
        </div>

        {/* Date */}
        <div style={{ padding: '14px 22px 8px' }}>
          <p style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>{today}</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '6px 12px', overflowY: 'auto' }}>
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button key={id} onClick={() => setSection(id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                  padding: '11px 14px', borderRadius: 12, border: 'none',
                  cursor: 'pointer', marginBottom: 3, fontFamily: 'inherit',
                  background: active ? t.accentBg : 'transparent',
                  color: active ? BLUE : t.textSub,
                  fontWeight: active ? 700 : 500, fontSize: 14,
                  textAlign: 'left', transition: 'all 0.15s',
                  borderLeft: `3px solid ${active ? BLUE : 'transparent'}`,
                }}>
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 12px 20px', borderTop: `1px solid ${t.border}` }}>
          {/* User card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: t.accentBg, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`, color: '#fff', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{av}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient?.fullName || 'Patient'}</p>
              <p style={{ fontSize: 11, color: t.textMuted }}>{patient?.patientNumber || '—'}</p>
            </div>
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 11, border: `1px solid ${t.border}`, cursor: 'pointer', fontFamily: 'inherit', background: t.surfaceAlt, color: t.textSub, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* Logout */}
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 11, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(239,68,68,0.07)', color: '#ef4444', fontWeight: 600, fontSize: 13 }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh', padding: '36px 36px 60px' }}>
        <div style={{ maxWidth: 900, width: '100%' }} className="fade-up" key={section}>
          {section === 'overview'      && <Overview        t={t} patient={patient} />}
          {section === 'appointments'  && <MyAppointments  t={t} patient={patient} />}
          {section === 'records'       && <MyRecords       t={t} patient={patient} />}
          {section === 'prescriptions' && <MyPrescriptions t={t} patient={patient} />}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          aside { display: none; }
          main  { margin-left: 0 !important; padding: 20px 16px 40px !important; }
        }
      `}</style>
    </div>
  );
}