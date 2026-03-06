import { useState, useEffect, useRef } from 'react';
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

const BOTTOM_NAV_ITEMS = NAV_ITEMS.slice(0, 4);
const MORE_NAV_ITEMS   = NAV_ITEMS.slice(4);

/* ─── Animated nav item indicator ─────────────────────────────────────────── */
function ActivePill({ isDark }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 6, height: 6,
      borderRadius: '50%',
      background: BLUE,
      flexShrink: 0,
      animation: 'pulsePip 2s ease-in-out infinite',
    }} />
  );
}

export default function HospitalDashboard() {
  const navigate    = useNavigate();
  const [isDark, setIsDark]         = useState(() => localStorage.getItem('theme') === 'dark');
  const [activeSection, setActive]  = useState('dashboard');
  const [prevSection, setPrev]      = useState(null);
  const [transitioning, setTrans]   = useState(false);
  const [sidebarOpen, setSidebar]   = useState(true);
  const [mobileSidebar, setMobile]  = useState(false);
  const [moreDrawer, setMoreDrawer] = useState(false);
  const [hospital, setHospital]     = useState(null);
  const [searchQuery, setSearch]    = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications]             = useState(3);
  const [isMobile, setIsMobile]     = useState(false);
  const [isTablet, setIsTablet]     = useState(false);
  const [headerIn, setHeaderIn]     = useState(false);
  const [navMounted, setNavMounted] = useState(false);

  const t = isDark ? themes.dark : themes.light;

  // ── Mount entrance ───────────────────────────────────────────────────────────
  useEffect(() => {
    requestAnimationFrame(() => {
      setTimeout(() => setHeaderIn(true), 50);
      setTimeout(() => setNavMounted(true), 150);
    });
  }, []);

  // ── Responsive breakpoints ───────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const mobile = w < 768;
      const tablet = w >= 768 && w < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (mobile) setSidebar(false);
      else if (tablet) setSidebar(false);
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

  // ── Animated section navigation ─────────────────────────────────────────────
  const navigate_to = (id) => {
    if (id === activeSection) return;
    setTrans(true);
    setPrev(activeSection);
    setTimeout(() => {
      setActive(id);
      setTrans(false);
    }, 180);
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

  // ── Sidebar content ──────────────────────────────────────────────────────────
  const SidebarContent = ({ forceFull = false }) => {
    const showLabels = forceFull || sidebarOpen;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo */}
        <div style={{
          padding: '18px 14px',
          display: 'flex', alignItems: 'center',
          justifyContent: showLabels ? 'space-between' : 'center',
          borderBottom: `1px solid ${t.border}`,
          gap: 10, flexShrink: 0,
          opacity: headerIn ? 1 : 0,
          transform: headerIn ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'logoSpin 0.6s cubic-bezier(0.34,1.56,0.64,1) both 0.2s',
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
            <button onClick={() => setMobile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSub, padding: 4, display: 'flex', borderRadius: 8, transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'rotate(90deg)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav items — staggered entrance */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ id, icon: Icon, label }, idx) => {
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
                  fontWeight: isActive ? 600 : 400, fontSize: 14,
                  width: '100%', textAlign: 'left', fontFamily: 'inherit',
                  minHeight: 44,
                  // staggered slide-in
                  opacity: navMounted ? 1 : 0,
                  transform: navMounted ? 'translateX(0)' : 'translateX(-14px)',
                  transition: `opacity 0.35s ease ${idx * 0.045}s, transform 0.35s cubic-bezier(0.34,1.2,0.64,1) ${idx * 0.045}s, background 0.15s, color 0.15s`,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = t.hover;
                    e.currentTarget.style.paddingLeft = showLabels ? '16px' : undefined;
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = showLabels ? '12px' : undefined;
                  }
                }}
              >
                <Icon size={18} style={{
                  flexShrink: 0,
                  transition: 'transform 0.2s ease',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }} />
                {showLabels && <span style={{ flex: 1 }}>{label}</span>}
                {showLabels && isActive && <ActivePill isDark={isDark} />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{
          padding: '10px 8px', borderTop: `1px solid ${t.border}`, flexShrink: 0,
          opacity: navMounted ? 1 : 0,
          transition: 'opacity 0.4s ease 0.4s',
        }}>
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
              transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {showLabels && <span>Logout</span>}
          </button>
        </div>
      </div>
    );
  };

  // ── More bottom-sheet ────────────────────────────────────────────────────────
  const MoreDrawer = () => (
    <>
      <div onClick={() => setMoreDrawer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease' }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        background: t.sidebar, zIndex: 301,
        borderRadius: '20px 20px 0 0',
        padding: '8px 16px 40px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.22s ease',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: t.border, margin: '8px auto 16px' }} />
        <p style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>More</p>
        {MORE_NAV_ITEMS.map(({ id, icon: Icon, label }, idx) => {
          const isActive = activeSection === id;
          return (
            <button key={id} onClick={() => navigate_to(id)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 12px', borderRadius: 12,
              border: 'none', cursor: 'pointer', width: '100%',
              background: isActive ? (isDark ? 'rgba(59,91,219,0.2)' : 'rgba(59,91,219,0.1)') : 'transparent',
              color: isActive ? '#60a5fa' : t.text,
              fontFamily: 'inherit', fontSize: 15, fontWeight: isActive ? 600 : 400,
              textAlign: 'left', minHeight: 52,
              opacity: 0,
              animation: `slideInRow 0.25s ease forwards ${idx * 0.06}s`,
            }}>
              <Icon size={20} />
              <span>{label}</span>
              {isActive && <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: BLUE, animation: 'pulsePip 2s ease-in-out infinite' }} />}
            </button>
          );
        })}
        <div style={{ marginTop: 8, borderTop: `1px solid ${t.border}`, paddingTop: 8 }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 12px', borderRadius: 12,
            border: 'none', cursor: 'pointer', width: '100%',
            background: 'transparent', color: ACCENT.red,
            fontFamily: 'inherit', fontSize: 15, fontWeight: 500,
            textAlign: 'left', minHeight: 52,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
    <div style={{ display: 'flex', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden', background: t.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: t.text, transition: 'background 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 10px; }

        @keyframes slideUp   { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes slideInRow { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

        /* logo spin on mount */
        @keyframes logoSpin {
          from { transform: rotate(-180deg) scale(0.5); opacity: 0; }
          to   { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        /* active pip pulse */
        @keyframes pulsePip {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,91,219,0.5); transform: scale(1); }
          50%       { box-shadow: 0 0 0 4px rgba(59,91,219,0); transform: scale(1.3); }
        }
        /* section transitions */
        @keyframes sectionIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sectionOut { from { opacity: 1; transform: translateY(0);    } to { opacity: 0; transform: translateY(-6px); } }

        /* bottom nav tap ripple */
        @keyframes tapScale {
          0%   { transform: scale(1); }
          40%  { transform: scale(0.88); }
          100% { transform: scale(1); }
        }

        /* header slide down */
        @keyframes headerSlide {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .bottom-nav { padding-bottom: max(12px, env(safe-area-inset-bottom)) !important; }

        /* notification badge pulse */
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.4); }
        }
      `}</style>

      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
      {!isMobile && (
        <aside style={{
          width: sidebarOpen ? 240 : 66,
          height: '100dvh',
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

      {/* ── Mobile Sidebar Overlay ───────────────────────────────────────────── */}
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
            <SidebarContent forceFull />
          </aside>
        </>
      )}

      {/* ── More Drawer ─────────────────────────────────────────────────────── */}
      {isMobile && moreDrawer && <MoreDrawer />}

      {/* ── Search Overlay ──────────────────────────────────────────────────── */}
      {isMobile && searchOpen && <SearchOverlay />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, height: '100%' }}>

        {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
        <header style={{
          height: isMobile ? 56 : 64,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 12px' : '0 20px',
          background: t.sidebar,
          borderBottom: `1px solid ${t.border}`,
          position: 'sticky', top: 0, zIndex: 50,
          gap: 8, flexShrink: 0,
          animation: 'headerSlide 0.35s cubic-bezier(0.34,1.2,0.64,1) both 0.05s',
        }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, minWidth: 0 }}>
            <button
              onClick={() => isMobile ? setMobile(true) : setSidebar(!sidebarOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: t.textSub,
                display: 'flex', padding: 6, borderRadius: 8, flexShrink: 0,
                minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = t.hover; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>

            {isMobile && (
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px', color: t.text, whiteSpace: 'nowrap' }}>
                HMS<span style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Care</span>
              </span>
            )}

            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.input, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}`, transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(59,91,219,0.15)`; }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = 'none'; }}
              >
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

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, flexShrink: 0 }}>
            {isMobile && (
              <button onClick={() => setSearchOpen(true)} style={{ width: 36, height: 36, borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub, transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            )}

            <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub, transition: 'transform 0.3s, background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'rotate(20deg) scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
              aria-label="Toggle theme"
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
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 8, height: 8, borderRadius: '50%',
                  background: ACCENT.red, border: `2px solid ${t.sidebar}`,
                  animation: 'badgePulse 2s ease-in-out infinite',
                }} />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 4px', borderRadius: 10, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = t.hover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: `linear-gradient(135deg, ${BLUE}, #8b5cf6)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#fff', fontSize: 13, flexShrink: 0,
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12) rotate(-6deg)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
              >
                {hospital?.name?.charAt(0)?.toUpperCase() || 'H'}
              </div>
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

        {/* ── Main Content ───────────────────────────────────────────────────── */}
        <main style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: isMobile ? '14px 12px 80px' : '24px',
          height: 0,
        }}>
          <div style={{
            animation: transitioning ? 'sectionOut 0.18s ease forwards' : 'sectionIn 0.3s ease both',
          }}>
            {renderSection()}
          </div>
        </main>

        {/* ── Mobile Bottom Navigation ───────────────────────────────────────── */}
        {isMobile && (
          <nav
            className="bottom-nav"
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: t.sidebar,
              borderTop: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-around',
              paddingTop: 8, zIndex: 100,
              boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
              animation: 'slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1) both 0.2s',
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
                    transition: 'color 0.2s, background 0.2s',
                  }}
                  onMouseDown={e => { e.currentTarget.style.animation = 'tapScale 0.25s ease'; }}
                  onAnimationEnd={e => { e.currentTarget.style.animation = ''; }}
                >
                  <Icon size={21} style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', transform: isActive ? 'scale(1.2)' : 'scale(1)' }} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: '0.01em' }}>{label}</span>
                </button>
              );
            })}
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
                transition: 'color 0.2s',
              }}
              onMouseDown={e => { e.currentTarget.style.animation = 'tapScale 0.25s ease'; }}
              onAnimationEnd={e => { e.currentTarget.style.animation = ''; }}
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