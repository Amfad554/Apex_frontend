import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Users, Calendar, Stethoscope, Pill, FileText,
  Settings, LogOut, Activity, Bell, Search, Sun, Moon,
  Menu, ChevronDown, X
} from 'lucide-react';
import { themes, BLUE, BLUE2, ACCENT } from './theme.js';

import Patients from './sections/Patients.jsx';
import Appointments from './sections/Appointments.jsx';
import Staff from './sections/Staff.jsx';
import Pharmacy from './sections/Pharmacy.jsx';
import RecordsSection from './sections/RecordsSection.jsx';
import DashSettings from './sections/Settings.jsx';
import DashboardHome from './sections/DashboardHome.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'patients', icon: Users, label: 'Patients' },
  { id: 'appointments', icon: Calendar, label: 'Appointments' },
  { id: 'staff', icon: Stethoscope, label: 'Staff' },
  { id: 'pharmacy', icon: Pill, label: 'Pharmacy' },
  { id: 'records', icon: FileText, label: 'Records' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [activeSection, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebar] = useState(true);
  const [mobileSidebar, setMobile] = useState(false);
  const [hospital, setHospital] = useState(null);
  const [searchQuery, setSearch] = useState('');
  const [notifications] = useState(3);
  const [isMobile, setIsMobile] = useState(false);

  const t = isDark ? themes.dark : themes.light;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebar(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Load hospital info from localStorage (set at login)
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) { navigate('/hospital/auth'); return; }
    setHospital(user);
  }, []);

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

  const navigate_to = (id) => { setActive(id); setMobile(false); };

  const sectionProps = { isDark, t, hospital, isMobile };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardHome  {...sectionProps} onNavigate={navigate_to} />;
      case 'patients': return <Patients       {...sectionProps} />;
      case 'appointments': return <Appointments   {...sectionProps} />;
      case 'staff': return <Staff          {...sectionProps} />;
      case 'pharmacy': return <Pharmacy       {...sectionProps} />;
      case 'records': return <RecordsSection {...sectionProps} />;
      case 'settings': return <DashSettings   {...sectionProps} />;
      default: return <DashboardHome  {...sectionProps} onNavigate={navigate_to} />;
    }
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Activity size={20} color="#fff" />
          </div>
          {(sidebarOpen || mobileSidebar) && (
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px', color: t.text }}>
              HMS<span style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Care</span>
            </span>
          )}
        </div>
        {mobileSidebar && <button onClick={() => setMobile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSub }}><X size={18} /></button>}
      </div>

      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeSection === id;
          return (
            <button key={id} onClick={() => navigate_to(id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 10, cursor: 'pointer', border: 'none',
              background: isActive ? (isDark ? 'rgba(59,91,219,0.2)' : 'rgba(59,91,219,0.1)') : 'transparent',
              color: isActive ? '#60a5fa' : t.textSub,
              transition: 'all 0.15s', fontWeight: isActive ? 600 : 400, fontSize: 14,
              width: '100%', textAlign: 'left', fontFamily: 'inherit',
            }}
              onMouseEnter={e => !isActive && (e.currentTarget.style.background = t.hover)}
              onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {(sidebarOpen || mobileSidebar) && <span>{label}</span>}
              {(sidebarOpen || mobileSidebar) && isActive && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: BLUE }} />}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: `1px solid ${t.border}` }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
          borderRadius: 10, cursor: 'pointer', color: ACCENT.red, fontSize: 14,
          fontWeight: 500, background: 'none', border: 'none', width: '100%', fontFamily: 'inherit',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} />
          {(sidebarOpen || mobileSidebar) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: t.text, transition: 'background 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 10px; }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
          .bottom-nav { display: flex !important; }
          .header-search { display: none !important; }
          .main-content { padding-bottom: 80px !important; }
        }
        @media (min-width: 768px) { .bottom-nav { display: none !important; } }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{ width: sidebarOpen ? 240 : 70, minHeight: '100vh', background: t.sidebar, borderRight: `1px solid ${t.border}`, transition: 'width 0.25s', overflow: 'hidden', position: 'sticky', top: 0, flexShrink: 0, zIndex: 100, boxShadow: isDark ? '2px 0 20px rgba(0,0,0,0.3)' : '2px 0 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebar && (
        <>
          <div onClick={() => setMobile(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
          <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, background: t.sidebar, zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}>
            <SidebarContent />
          </aside>
        </>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: t.sidebar, borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, zIndex: 50, gap: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => isMobile ? setMobile(true) : setSidebar(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSub, display: 'flex', padding: 4 }}>
              <Menu size={20} />
            </button>
            {isMobile && (
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px', color: t.text }}>
                HMS<span style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Care</span>
              </span>
            )}
            <div className="header-search" style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.input, borderRadius: 10, padding: '8px 14px', border: `1px solid ${t.border}` }}>
              <Search size={15} color={t.textMuted} />
              <input placeholder="Search patients, staff..." value={searchQuery} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13, width: 180, fontFamily: 'inherit' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub }}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div style={{ position: 'relative' }}>
              <button style={{ width: 36, height: 36, borderRadius: 10, background: t.input, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub }}>
                <Bell size={16} />
              </button>
              {notifications > 0 && <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: ACCENT.red, border: `2px solid ${t.sidebar}` }} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 6px', borderRadius: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${BLUE}, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13, flexShrink: 0 }}>
                {hospital?.name?.charAt(0)?.toUpperCase() || 'H'}
              </div>
              {!isMobile && (
                <>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: t.text, display: 'block' }}>{hospital?.name || 'Admin'}</span>
                    <span style={{ fontSize: 11, color: t.textMuted }}>Administrator</span>
                  </div>
                  <ChevronDown size={14} color={t.textMuted} />
                </>
              )}
            </div>
          </div>
        </header>

        <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 16 : 24 }}>
          {renderSection()}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: t.sidebar, borderTop: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 4px 12px', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}>
          {NAV_ITEMS.slice(0, 5).map(({ id, icon: Icon, label }) => {
            const isActive = activeSection === id;
            return (
              <button key={id} onClick={() => navigate_to(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: isActive ? (isDark ? 'rgba(59,91,219,0.2)' : 'rgba(59,91,219,0.1)') : 'transparent', color: isActive ? '#60a5fa' : t.textMuted, fontFamily: 'inherit', minWidth: 52 }}>
                <Icon size={20} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</span>
              </button>
            );
          })}
          <button onClick={() => setMobile(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: t.textMuted, fontFamily: 'inherit', minWidth: 52 }}>
            <Menu size={20} />
            <span style={{ fontSize: 10 }}>More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}