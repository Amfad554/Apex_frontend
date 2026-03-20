import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Building2,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Eye,
  Trash2,
  Ban,
  Search,
  RefreshCw
} from 'lucide-react';

/* ─── Brand tokens ─────────────────────────────────────────────────────────── */
const T = {
  navy:      '#0A1A3F',
  softNavy:  '#1F2A44',
  orange:    '#FF5A1F',
  lightGray: '#F5F7FA',
};

/* ─── Inline style helpers ──────────────────────────────────────────────────── */
const css = {
  page: {
    minHeight: '100vh',
    background: T.lightGray,
    fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
  },
  header: {
    background: T.navy,
    borderBottom: `3px solid ${T.orange}`,
    position: 'sticky',
    top: 0,
    zIndex: 50,
    padding: '0 2rem',
  },
  headerInner: {
    maxWidth: 1280,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 68,
  },
  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: T.orange,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoTitle: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 17,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  logoSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  btnRefresh: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 18px',
    background: T.softNavy,
    color: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all .18s',
  },
  btnLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 18px',
    background: T.orange,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all .18s',
  },
  main: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '2.5rem 2rem',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: T.navy,
    letterSpacing: '-0.03em',
    marginBottom: 4,
  },
  pageSub: {
    color: '#6b7a99',
    fontSize: 14,
    marginBottom: '2.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    marginBottom: '2rem',
  },
  statCard: (highlight) => ({
    background: '#fff',
    borderRadius: 14,
    padding: '1.25rem 1.5rem',
    border: `1.5px solid ${highlight ? T.orange : '#e4e9f2'}`,
    boxShadow: highlight
      ? `0 0 0 3px ${T.orange}22`
      : '0 1px 4px rgba(10,26,63,0.06)',
    transition: 'transform .18s, box-shadow .18s',
    cursor: 'default',
  }),
  statIconBox: (bg, fg) => ({
    width: 40,
    height: 40,
    borderRadius: 10,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: fg,
    marginBottom: 14,
  }),
  statValue: {
    fontSize: 26,
    fontWeight: 800,
    color: T.navy,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11.5,
    color: '#8694b2',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  filterBar: {
    background: '#fff',
    borderRadius: 14,
    border: '1.5px solid #e4e9f2',
    padding: '1.1rem 1.5rem',
    marginBottom: '1.5rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchWrap: {
    position: 'relative',
    flex: '1 1 260px',
    maxWidth: 360,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#8694b2',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 14px 9px 40px',
    border: '1.5px solid #e4e9f2',
    borderRadius: 9,
    fontSize: 13.5,
    color: T.navy,
    background: T.lightGray,
    outline: 'none',
    transition: 'border-color .18s',
    boxSizing: 'border-box',
  },
  filterBtns: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterBtn: (active, color) => ({
    padding: '7px 16px',
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all .15s',
    border: 'none',
    background: active ? (color || T.navy) : '#f0f3f9',
    color: active ? '#fff' : '#5a6a8a',
    letterSpacing: '0.02em',
  }),
  card: {
    background: '#fff',
    borderRadius: 16,
    border: '1.5px solid #e4e9f2',
    padding: '1.5rem',
    marginBottom: 14,
    boxShadow: '0 1px 4px rgba(10,26,63,0.05)',
    transition: 'box-shadow .18s, transform .18s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  cardIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    background: `${T.navy}12`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: T.navy,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: T.navy,
    letterSpacing: '-0.02em',
    marginBottom: 2,
  },
  cardType: {
    fontSize: 12,
    color: '#8694b2',
    marginBottom: 6,
    textTransform: 'capitalize',
    fontWeight: 500,
  },
  cardMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    fontSize: 12,
    color: '#6b7a99',
  },
  statusBadge: (status) => {
    const map = {
      pending:   { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
      approved:  { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
      suspended: { bg: '#fff1f2', color: '#9f1239', border: '#fecdd3' },
    };
    const s = map[status] || map.pending;
    return {
      padding: '4px 12px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      flexShrink: 0,
    };
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 12,
    padding: '1rem',
    background: T.lightGray,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 10.5,
    color: '#8694b2',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: 700,
    color: T.navy,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  btnApprove: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 12.5,
    cursor: 'pointer',
    transition: 'all .15s',
  },
  btnReject: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 12.5,
    cursor: 'pointer',
    transition: 'all .15s',
  },
  btnSuspend: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    background: T.orange,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 12.5,
    cursor: 'pointer',
    transition: 'all .15s',
  },
  btnReactivate: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 12.5,
    cursor: 'pointer',
    transition: 'all .15s',
  },
  btnView: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    background: 'transparent',
    color: T.navy,
    border: `1.5px solid #c8d3e8`,
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 12.5,
    cursor: 'pointer',
    transition: 'all .15s',
  },
  btnDelete: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    background: 'transparent',
    color: '#dc2626',
    border: `1.5px solid #fecaca`,
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 12.5,
    cursor: 'pointer',
    transition: 'all .15s',
  },
  cardFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: '1px solid #f0f3f9',
    fontSize: 11,
    color: '#a0aec0',
  },
  emptyState: {
    background: '#fff',
    borderRadius: 16,
    border: '1.5px solid #e4e9f2',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  spinner: {
    width: 44,
    height: 44,
    border: `4px solid ${T.orange}33`,
    borderTop: `4px solid ${T.orange}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '3rem auto 1rem',
  },
};

/* ─── Stat palette ──────────────────────────────────────────────────────────── */
const statColors = {
  blue:   { bg: '#eff6ff', fg: '#1d4ed8' },
  yellow: { bg: '#fffbeb', fg: '#b45309' },
  green:  { bg: '#f0fdf4', fg: '#15803d' },
  red:    { bg: '#fff1f2', fg: '#be123c' },
  purple: { bg: '#faf5ff', fg: '#7e22ce' },
  indigo: { bg: '#eef2ff', fg: '#4338ca' },
};

/* ─── Components ────────────────────────────────────────────────────────────── */

function StatCard({ icon, label, value, color, highlight }) {
  const { bg, fg } = statColors[color] || statColors.blue;
  return (
    <div style={css.statCard(highlight)}>
      <div style={css.statIconBox(bg, fg)}>{icon}</div>
      <div style={css.statValue}>{value}</div>
      <div style={css.statLabel}>{label}</div>
    </div>
  );
}

function FilterButton({ active, onClick, label, count, colorOverride }) {
  return (
    <button style={css.filterBtn(active, colorOverride)} onClick={onClick}>
      {label} <span style={{ opacity: 0.7 }}>({count})</span>
    </button>
  );
}

function HospitalCard({ hospital, onApprove, onReject, onSuspend, onReactivate }) {
  return (
    <div style={css.card}>
      {/* Header row */}
      <div style={css.cardHeader}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={css.cardIconBox}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={css.cardTitle}>{hospital.name}</div>
            <div style={css.cardType}>{hospital.type} Hospital</div>
            <div style={css.cardMeta}>
              <span>📍 {hospital.address}</span>
              <span>📞 {hospital.phone}</span>
              <span>📧 {hospital.email}</span>
            </div>
          </div>
        </div>
        <span style={css.statusBadge(hospital.status)}>{hospital.status}</span>
      </div>

      {/* Info grid */}
      <div style={css.infoGrid}>
        {[
          { label: 'Administrator', value: hospital.admin },
          { label: 'License No.', value: hospital.license },
          { label: 'Patients', value: (hospital.patientCount || 0).toLocaleString() },
          { label: 'Staff', value: hospital.staffCount || 0 },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={css.infoLabel}>{label}</div>
            <div style={css.infoValue}>{value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={css.actions}>
        {hospital.status === 'pending' && (
          <>
            <button style={css.btnApprove} onClick={() => onApprove(hospital.id)}>
              <CheckCircle2 size={14} /> Approve
            </button>
            <button style={css.btnReject} onClick={() => onReject(hospital.id)}>
              <XCircle size={14} /> Reject
            </button>
          </>
        )}
        {hospital.status === 'approved' && (
          <button style={css.btnSuspend} onClick={() => onSuspend(hospital.id)}>
            <Ban size={14} /> Suspend
          </button>
        )}
        {hospital.status === 'suspended' && (
          <button style={css.btnReactivate} onClick={() => onReactivate(hospital.id)}>
            <CheckCircle2 size={14} /> Reactivate
          </button>
        )}
        <button style={css.btnView}>
          <Eye size={14} /> View Details
        </button>
        {hospital.status === 'pending' && (
          <button style={css.btnDelete} onClick={() => onReject(hospital.id)}>
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={css.cardFooter}>
        Registered:{' '}
        {new Date(hospital.createdAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────────────────────── */
export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0, pending: 0, approved: 0, suspended: 0,
    totalPatients: 0, totalStaff: 0,
  });

  useEffect(() => { fetchHospitals(); }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/admin/login'); return; }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setHospitals(data.hospitals);
        setStats({
          total:         data.hospitals.length,
          pending:       data.hospitals.filter(h => h.status === 'pending').length,
          approved:      data.hospitals.filter(h => h.status === 'approved').length,
          suspended:     data.hospitals.filter(h => h.status === 'suspended').length,
          totalPatients: data.hospitals.reduce((s, h) => s + (h.patientCount || 0), 0),
          totalStaff:    data.hospitals.reduce((s, h) => s + (h.staffCount || 0), 0),
        });
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const apiAction = async (url, method, successMsg) => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) { alert(successMsg(data)); fetchHospitals(); }
      else alert(`Error: ${data.error}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove    = id => apiAction(`/api/admin/hospitals/${id}/approve`,    'PUT',    d => `✅ ${d.hospital.name} approved!`);
  const handleReject     = id => window.confirm('Delete this registration? This cannot be undone.') && apiAction(`/api/admin/hospitals/${id}`, 'DELETE', d => `🗑️ ${d.hospital.name} deleted`);
  const handleSuspend    = id => window.confirm('Suspend this hospital?') && apiAction(`/api/admin/hospitals/${id}/suspend`,    'PUT', d => `⛔ ${d.hospital.name} suspended`);
  const handleReactivate = id => apiAction(`/api/admin/hospitals/${id}/reactivate`, 'PUT',    d => `✅ ${d.hospital.name} reactivated`);
  const handleLogout     = () => { ['token','user','userRole'].forEach(k => localStorage.removeItem(k)); navigate('/admin/login'); };

  const filtered = hospitals.filter(h => {
    const matchFilter = filter === 'all' || h.status === filter;
    const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        h.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={css.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        button:hover { opacity: 0.88; transform: translateY(-1px); }
      `}</style>

      {/* ── Header ── */}
      <header style={css.header}>
        <div style={css.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={css.logoIcon}><Shield size={22} color="#fff" /></div>
            <div>
              <div style={css.logoTitle}>Super Admin Panel</div>
              <div style={css.logoSub}>Platform Management</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={css.btnRefresh} onClick={fetchHospitals}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button style={css.btnLogout} onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={css.main}>
        <h2 style={css.pageTitle}>Hospital Management</h2>
        <p style={css.pageSub}>Review and manage all registered hospitals on the platform</p>

        {/* Stats */}
        <div style={css.statsGrid}>
          <StatCard icon={<Building2 size={20}/>} label="Total Hospitals"   value={stats.total}                       color="blue"   />
          <StatCard icon={<Clock size={20}/>}      label="Pending Approval" value={stats.pending}                     color="yellow" highlight={stats.pending > 0} />
          <StatCard icon={<CheckCircle2 size={20}/>} label="Approved"       value={stats.approved}                    color="green"  />
          <StatCard icon={<Ban size={20}/>}         label="Suspended"       value={stats.suspended}                   color="red"    />
          <StatCard icon={<Users size={20}/>}       label="Total Patients"  value={stats.totalPatients.toLocaleString()} color="purple" />
          <StatCard icon={<Activity size={20}/>}    label="Healthcare Staff" value={stats.totalStaff}                 color="indigo" />
        </div>

        {/* Filter bar */}
        <div style={css.filterBar}>
          <div style={css.searchWrap}>
            <Search size={16} style={css.searchIcon} />
            <input
              style={css.searchInput}
              type="text"
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={css.filterBtns}>
            <FilterButton active={filter==='all'}       onClick={()=>setFilter('all')}       label="All"       count={stats.total}     colorOverride={T.navy}   />
            <FilterButton active={filter==='pending'}   onClick={()=>setFilter('pending')}   label="Pending"   count={stats.pending}   colorOverride="#b45309"  />
            <FilterButton active={filter==='approved'}  onClick={()=>setFilter('approved')}  label="Approved"  count={stats.approved}  colorOverride="#15803d"  />
            <FilterButton active={filter==='suspended'} onClick={()=>setFilter('suspended')} label="Suspended" count={stats.suspended} colorOverride="#be123c"  />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', paddingBottom: '3rem' }}>
            <div style={css.spinner} />
            <p style={{ color: '#8694b2', fontSize: 14 }}>Loading hospitals…</p>
          </div>
        )}

        {/* Hospital list */}
        {!loading && (
          filtered.length === 0 ? (
            <div style={css.emptyState}>
              <Building2 size={52} color="#c8d3e8" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: T.navy, fontWeight: 800, fontSize: 20, marginBottom: 6 }}>No hospitals found</h3>
              <p style={{ color: '#8694b2', fontSize: 14 }}>
                {hospitals.length === 0 ? 'No hospitals have registered yet.' : 'Try adjusting your search or filter.'}
              </p>
            </div>
          ) : (
            filtered.map(h => (
              <HospitalCard
                key={h.id}
                hospital={h}
                onApprove={handleApprove}
                onReject={handleReject}
                onSuspend={handleSuspend}
                onReactivate={handleReactivate}
              />
            ))
          )
        )}
      </main>
    </div>
  );
}