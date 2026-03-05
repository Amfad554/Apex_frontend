import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Users, Calendar, Stethoscope, Pill, FileText,
  Settings, LogOut, Activity, Bell, Search, Sun, Moon,
  Menu, ChevronDown, X, MoreHorizontal
} from 'lucide-react';
import { themes, BLUE, BLUE2, ACCENT } from './theme.js';

import Patients from './Sections/Patients.jsx';
import Appointments from './Sections/Appointments.jsx';
import Staff from './Sections/Staff.jsx';
import Pharmacy from './Sections/Pharmacy.jsx';
import RecordsSection from './Sections/Recordssection.jsx';
import DashSettings from './Sections/Settings.jsx';
import DashboardHome from './Sections/Dashboardhome.jsx';

const NAV_ITEMS = [
  { id: 'dashboard',    icon: Home,        label: 'Dashboard' },
  { id: 'patients',     icon: Users,       label: 'Patients' },
  { id: 'appointments', icon: Calendar,    label: 'Appointments' },
  { id: 'staff',        icon: Stethoscope, label: 'Staff' },
  { id: 'pharmacy',     icon: Pill,        label: 'Pharmacy' },
  { id: 'records',      icon: FileText,    label: 'Records' },
  { id: 'settings',     icon: Settings,    label: 'Settings' },
];

// Bottom nav shows first 4 items + "More" drawer
const BOTTOM_NAV_ITEMS = NAV_ITEMS.slice(0, 4);
const MORE_NAV_ITEMS   = NAV_ITEMS.slice(4);

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [isDark, setIsDark]           = useState(() => localStorage.getItem('theme') === 'dark');
  const [activeSection, setActive]    = useState('dashboard');
  const [sidebarOpen, setSidebar]     = useState(true);
  const [mobileSidebar, setMobile]    = useState(false);
  const [moreDrawer, setMoreDrawer]   = useState(false);
  const [hospital, setHospital]       = useState(null);
  const [searchQuery, setSearch]      = useState('');
  const [searchOpen, setSearchOpen]   = useState(false);
  const [notifications]               = useState(3);
  const [isMobile, setIsMobile]       = useState(false);
  const [isTablet, setIsTablet]       = useState(false);

  const t = isDark ? themes.dark : themes.light;

  // ── Responsive breakpoints ──────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const mobile = w < 768;
      const tablet = w >= 768 && w < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (mobile) setSidebar(false);
      else if (tablet) setSidebar(false); // collapsed icon-only sidebar on tablet
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Auth guard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) { navigate('/hospital/auth'); return; }
    setHospital(user);
  }, []);

  // ── Close drawers on section change ─────────────────────────────────────────
  const navigate_to = (id) => {
    setActive(id);
    setMobile(false);
    setMoreDrawer(false);
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    window.dispatchEvent(new Event('themeChange'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.dispatchEvent(new Event('authChange'));
    navigate('/hospital/auth');
  };

  const sectionProps = { isDark, t, hospital, isMobile };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':    return <DashboardHome  {...sectionProps} onNavigate={navigate_to} />;
      case 'patients':     return <Patients       {...sectionProps} />;
      case 'appointments': return <Appointments   {...sectionProps} />;
      case 'staff':        return <Staff          {...sectionProps} />;
      case 'pharmacy':     return <Pharmacy       {...sectionProps} />;
      case 'records':      return <RecordsSection {...sectionProps} />;
      case 'settings':     return <DashSettings   {...sectionProps} />;
      default:             return <DashboardHome  {...sectionProps} onNavigate={navigate_to} />;
    }
  };

  // ── Sidebar (shared between desktop collapsed/expanded + mobile overlay) ────
  const SidebarContent = ({ forceFull = false }) => {
    const showLabels = forceFull || sidebarOpen;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo row */}
        <div style={{
          padding: '18px 14px',
          display: 'flex', alignItems: 'center',
          justifyContent: showLabels ? 'space-between' : 'center',
          borderBottom: `1px solid ${t.border}`,
          gap: 10, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={18} color="#fff" />
            </div>
            {showLabels && (
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px', color: t.text, whiteSpace: 'nowrap' }}>
                HMS<span style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Care</span>
              </span>
            )}
          </div>
          {forceFull && (
            <button onClick={() => setMobile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSub, padding: 4, display: 'flex', borderRadius: 8 }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => navigate_to(id)}
                title={!showLabels ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: showLabels ? 12 : 0,
                  justifyContent: showLabels ? 'flex-start' : 'center',
                  padding: showLabels ? '10px 12px' : '11px 0',
                  borderRadius: 10, cursor: 'pointer', border: 'none',
                  background: isActive
                    ? (isDark ? 'rgba(59,91,219,0.22)' : 'rgba(59,91,219,0.11)')
                    : 'transparent',
                  color: isActive ? '#60a5fa' : t.textSub,
                  transition: 'all 0.15s',
                  fontWeight: isActive ? 600 : 400, fontSize: 14,
                  width: '100%', textAlign: 'left', fontFamily: 'inherit',
                  minHeight: 44,
                }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background = t.hover)}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {showLabels && <span style={{ flex: 1 }}>{label}</span>}
                {showLabels && isActive && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px 8px', borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
          <button
            onClick={handleLogout}
            title={!showLabels ? 'Logout' : undefined}
            style={{
              display: 'flex', alignItems: 'center',
              gap: showLabels ? 12 : 0,
              justifyContent: showLabels ? 'flex-start' : 'center',
              padding: showLabels ? '10px 12px' : '11px 0',
              borderRadius: 10, cursor: 'pointer', color: ACCENT.red,
              fontSize: 14, fontWeight: 500, background: 'none',
              border: 'none', width: '100%', fontFamily: 'inherit', minHeight: 44,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {showLabels && <span>Logout</span>}
          </button>
        </div>
      </div>
    );
  };

  // ── "More" bottom-sheet (mobile) ─────────────────────────────────────────────
  const MoreDrawer = () => (
    <>
      <div
        onClick={() => setMoreDrawer(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(2px)' }}
      />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        background: t.sidebar, zIndex: 301,
        borderRadius: '20px 20px 0 0',
        padding: '8px 16px 40px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.22s ease',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: t.border, margin: '8px auto 16px' }} />
        <p style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>More</p>
        {MORE_NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => navigate_to(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 12px', borderRadius: 12,
                border: 'none', cursor: 'pointer', width: '100%',
                background: isActive ? (isDark ? 'rgba(59,91,219,0.2)' : 'rgba(59,91,219,0.1)') : 'transparent',
                color: isActive ? '#60a5fa' : t.text,
                fontFamily: 'inherit', fontSize: 15, fontWeight: isActive ? 600 : 400,
                textAlign: 'left', minHeight: 52,
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
              {isActive && <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: BLUE }} />}
            </button>
          );
        })}

        {/* Logout in more drawer */}
        <div style={{ marginTop: 8, borderTop: `1px solid ${t.border}`, paddingTop: 8 }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 12px', borderRadius: 12,
              border: 'none', cursor: 'pointer', width: '100%',
              background: 'transparent', color: ACCENT.red,
              fontFamily: 'inherit', fontSize: 15, fontWeight: 500,
              textAlign: 'left', minHeight: 52,
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );

  // ── Mobile search overlay ────────────────────────────────────────────────────
  const SearchOverlay = () => (
    <>
      <div onClick={() => setSearchOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 400, backdropFilter: 'blur(2px)' }} />
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: t.sidebar, zIndex: 401,
        padding: '12px 16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        animation: 'slideDown 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: t.input, borderRadius: 12, padding: '10px 14px', border: `1px solid ${t.border}` }}>
            <Search size={16} color={t.textMuted} />
            <input
              autoFocus
              placeholder="Search patients, staff..."
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 15, flex: 1, fontFamily: 'inherit' }}
            />
          </div>
          <button onClick={() => setSearchOpen(false)} style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: t.textSub, fontFamily: 'inherit', fontSize: 14, whiteSpace: 'nowrap' }}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: t.text, transition: 'background 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 10px; }
        @keyframes slideUp   { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        /* iOS safe-area for bottom nav */
        .bottom-nav { padding-bottom: max(12px, env(safe-area-inset-bottom)) !important; }
      `}</style>

      {/* ── Desktop Sidebar ───────────────────────────────────────────────── */}
      {!isMobile && (
        <aside style={{
          width: sidebarOpen ? 240 : 66,
          minHeight: '100vh',
          background: t.sidebar,
          borderRight: `1px solid ${t.border}`,
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          position: 'sticky', top: 0,
          flexShrink: 0, zIndex: 100,
          boxShadow: isDark ? '2px 0 20px rgba(0,0,0,0.3)' : '2px 0 12px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column',
        }}>
          <SidebarContent />
        </aside>
      )}

      {/* ── Mobile Sidebar Overlay ────────────────────────────────────────── */}
      {isMobile && mobileSidebar && (
        <>
          <div onClick={() => setMobile(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease' }} />
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: 270,
            background: t.sidebar, zIndex: 201,
            display: 'flex', flexDirection: 'column',
            boxShadow: '6px 0 32px rgba(0,0,0,0.3)',
            animation: 'slideRight 0.24s ease',
          }}>
            <style>{`@keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
            <SidebarContent forceFull />
          </aside>
        </>
      )}

      {/* ── More Drawer (mobile) ──────────────────────────────────────────── */}
      {isMobile && moreDrawer && <MoreDrawer />}

      {/* ── Search Overlay (mobile) ───────────────────────────────────────── */}
      {isMobile && searchOpen && <SearchOverlay />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <header style={{
          height: isMobile ? 56 : 64,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 12px' : '0 20px',
          background: t.sidebar,
          borderBottom: `1px solid ${t.border}`,
          position: 'sticky', top: 0, zIndex: 50,
          gap: 8, flexShrink: 0,
        }}>
          {/* Left side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, minWidth: 0 }}>
            <button
              onClick={() => isMobile ? setMobile(true) : setSidebar(!sidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSub, display: 'flex', padding: 6, borderRadius: 8, flexShrink: 0, minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>

            {/* Mobile: show brand */}
            {isMobile && (
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px', color: t.text, whiteSpace: 'nowrap' }}>
                HMS<span style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Care</span>
              </span>
            )}

            {/* Desktop: inline search */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.input, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}` }}>
                <Search size={14} color={t.textMuted} />
                <input
                  placeholder="Search patients, staff..."
                  value={searchQuery}
                  onChange={e => setSearch(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: isTablet ? 140 : 200, fontFamily: 'inherit' }}
                />
              </div>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, flexShrink: 0 }}>
            {/* Mobile search icon */}
            {isMobile && (
              <button
                onClick={() => setSearchOpen(true)}
                style={{ width: 36, height: 36, borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub }}
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{ width: 36, height: 36, borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button style={{ width: 36, height: 36, borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub }}>
                <Bell size={16} />
              </button>
              {notifications > 0 && (
                <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: ACCENT.red, border: `2px solid ${t.sidebar}` }} />
              )}
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 4px', borderRadius: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${BLUE}, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13, flexShrink: 0 }}>
                {hospital?.name?.charAt(0)?.toUpperCase() || 'H'}
              </div>
              {/* Show name only on desktop */}
              {!isMobile && (
                <>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: t.text, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isTablet ? 90 : 130 }}>
                      {hospital?.name || 'Admin'}
                    </span>
                    <span style={{ fontSize: 11, color: t.textMuted }}>Administrator</span>
                  </div>
                  <ChevronDown size={14} color={t.textMuted} />
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main style={{
          flex: 1, overflowY: 'auto',
          padding: isMobile ? '14px 12px 80px' : '24px',
          // Extra bottom padding on mobile accounts for the bottom nav
        }}>
          {renderSection()}
        </main>

        {/* ── Mobile Bottom Navigation ──────────────────────────────────────── */}
        {isMobile && (
          <nav
            className="bottom-nav"
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: t.sidebar,
              borderTop: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-around',
              paddingTop: 8,
              zIndex: 100,
              boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
            }}
          >
            {BOTTOM_NAV_ITEMS.map(({ id, icon: Icon, label }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => navigate_to(id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    padding: '6px 10px', borderRadius: 12,
                    border: 'none', cursor: 'pointer',
                    background: isActive ? (isDark ? 'rgba(59,91,219,0.2)' : 'rgba(59,91,219,0.1)') : 'transparent',
                    color: isActive ? '#60a5fa' : t.textMuted,
                    fontFamily: 'inherit', minWidth: 56, flex: 1,
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={21} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: '0.01em' }}>{label}</span>
                </button>
              );
            })}
            {/* "More" button opens bottom sheet */}
            <button
              onClick={() => setMoreDrawer(true)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 10px', borderRadius: 12,
                border: 'none', cursor: 'pointer',
                background: MORE_NAV_ITEMS.some(i => i.id === activeSection)
                  ? (isDark ? 'rgba(59,91,219,0.2)' : 'rgba(59,91,219,0.1)')
                  : 'transparent',
                color: MORE_NAV_ITEMS.some(i => i.id === activeSection) ? '#60a5fa' : t.textMuted,
                fontFamily: 'inherit', minWidth: 56, flex: 1,
              }}
            >
              <MoreHorizontal size={21} />
              <span style={{ fontSize: 10, fontWeight: 400 }}>More</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}