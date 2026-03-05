import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Stethoscope, Mail, Lock, Eye, EyeOff, Sun, Moon,
    Activity, ArrowLeft, BadgeCheck, Search, AlertCircle,
    Building2, X,
} from 'lucide-react';
import { authAPI, hospitalsAPI } from '../services/api.js';

const themes = {
    dark: {
        bg: '#0a0d14', card: '#0f1117', border: 'rgba(59,91,219,0.18)',
        text: '#f0f4ff', textSub: 'rgba(255,255,255,0.45)', textMuted: 'rgba(255,255,255,0.25)',
        input: '#0d1321', inputBorder: 'rgba(59,91,219,0.25)', hover: 'rgba(255,255,255,0.04)',
        shadow: '0 24px 60px rgba(0,0,0,0.6)', divider: 'rgba(255,255,255,0.07)',
    },
    light: {
        bg: '#f0f4fb', card: '#ffffff', border: 'rgba(0,0,0,0.08)',
        text: '#111827', textSub: 'rgba(0,0,0,0.5)', textMuted: 'rgba(0,0,0,0.3)',
        input: '#f1f5fd', inputBorder: 'rgba(0,0,0,0.12)', hover: 'rgba(0,0,0,0.03)',
        shadow: '0 24px 60px rgba(0,0,0,0.1)', divider: 'rgba(0,0,0,0.07)',
    },
};
const BLUE = '#3b5bdb', BLUE2 = '#228be6';

export default function StaffLogin() {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState('login');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [hospitalQuery, setHospitalQuery] = useState('');
    const [hospitalResults, setHospitalResults] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searching, setSearching] = useState(false);
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [forgotEmail, setForgotEmail] = useState('');

    const t = isDark ? themes.dark : themes.light;

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        window.dispatchEvent(new Event('themeChange'));
    };

    // Hospital search — uses hospitalsAPI.search from services/api.js
    useEffect(() => {
        if (hospitalQuery.trim().length < 2) { setHospitalResults([]); setShowDropdown(false); return; }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const data = await hospitalsAPI.search(hospitalQuery);
                setHospitalResults(data.hospitals || []);
                setShowDropdown(true);
            } catch {
                setHospitalResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [hospitalQuery]);

    const selectHospital = (h) => {
        setSelectedHospital(h);
        setHospitalQuery(h.hospitalName);
        setShowDropdown(false);
    };

    const clearHospital = () => {
        setSelectedHospital(null);
        setHospitalQuery('');
        setHospitalResults([]);
    };

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!selectedHospital) { setError('Please select your hospital first.'); return; }
        setIsLoading(true);
        setError('');
        try {
            // authAPI.staffLogin maps to POST /api/auth/staff/login
            const data = await authAPI.staffLogin({
                identifier: formData.identifier,
                password: formData.password,
                hospitalId: selectedHospital.id,
            });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ ...data.user, role: 'staff' }));
            localStorage.setItem('userRole', 'staff');
            window.dispatchEvent(new Event('authChange'));
            navigate('/staffdashboard');
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // TODO: implement forgot password endpoint
            // await authAPI.forgotPassword(forgotEmail);
            setSuccessMsg('If this email exists, a reset link has been sent. Check your inbox.');
        } catch (err) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`,
        borderRadius: 10, padding: '12px 14px', color: t.text, fontSize: 14,
        outline: 'none', transition: 'border 0.2s', fontFamily: 'inherit', boxSizing: 'border-box',
    };

    return (
        <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: t.text, transition: 'background 0.3s', padding: '24px 16px' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: ${t.textMuted}; }
        .input-field:focus { border-color: ${BLUE} !important; }
        .hospital-item:hover { background: ${t.hover} !important; }
      `}</style>

            <button onClick={toggleTheme} style={{ position: 'fixed', top: 20, right: 20, width: 38, height: 38, borderRadius: 10, background: t.card, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSub, zIndex: 100 }}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div style={{ width: '100%', maxWidth: 480 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 8px 32px rgba(59,91,219,0.4)` }}>
                        <Stethoscope size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px', marginBottom: 4 }}>
                        HMS<span style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Care</span>
                    </h1>
                    <p style={{ color: t.textSub, fontSize: 14 }}>{step === 'login' ? 'Staff & Doctor Portal' : 'Reset Your Password'}</p>
                </div>

                <div style={{ background: t.card, borderRadius: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 28px', borderBottom: `1px solid ${t.divider}`, background: isDark ? 'rgba(59,91,219,0.06)' : 'rgba(59,91,219,0.03)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,91,219,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={18} color={BLUE} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: 15 }}>{step === 'login' ? 'Staff Login' : 'Forgot Password'}</p>
                            <p style={{ fontSize: 12, color: t.textSub }}>{step === 'login' ? 'Use credentials provided by your hospital admin' : "We'll send a reset link to your email"}</p>
                        </div>
                    </div>

                    <div style={{ padding: '28px' }}>
                        {step === 'login' && (
                            <form onSubmit={handleLogin}>
                                {/* Hospital Search */}
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSub, marginBottom: 8 }}>Your Hospital</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.input, border: `1px solid ${selectedHospital ? BLUE : t.inputBorder}`, borderRadius: 10, padding: '10px 14px' }}>
                                            <Building2 size={16} color={selectedHospital ? BLUE : t.textMuted} style={{ flexShrink: 0 }} />
                                            <input
                                                type="text"
                                                placeholder="Search your hospital name..."
                                                value={hospitalQuery}
                                                onChange={e => { setHospitalQuery(e.target.value); setSelectedHospital(null); }}
                                                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 14, fontFamily: 'inherit' }}
                                            />
                                            {searching && <span style={{ fontSize: 11, color: t.textMuted }}>…</span>}
                                            {selectedHospital && <button type="button" onClick={clearHospital} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, display: 'flex' }}><X size={14} /></button>}
                                            {!selectedHospital && !searching && <Search size={14} color={t.textMuted} />}
                                        </div>
                                        {showDropdown && hospitalResults.length > 0 && (
                                            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50, background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, boxShadow: t.shadow, overflow: 'hidden' }}>
                                                {hospitalResults.map(h => (
                                                    <div key={h.id} className="hospital-item" onClick={() => selectHospital(h)}
                                                        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,91,219,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <Building2 size={15} color={BLUE} />
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: 600, fontSize: 13 }}>{h.hospitalName}</p>
                                                            <p style={{ fontSize: 11, color: t.textMuted }}>{h.address}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {showDropdown && hospitalResults.length === 0 && !searching && hospitalQuery.length >= 2 && (
                                            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50, background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: '14px 16px', fontSize: 13, color: t.textMuted }}>
                                                No hospitals found matching "{hospitalQuery}"
                                            </div>
                                        )}
                                    </div>
                                    {selectedHospital && (
                                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(59,91,219,0.1)', borderRadius: 8, padding: '6px 10px' }}>
                                            <BadgeCheck size={14} color={BLUE} />
                                            <span style={{ fontSize: 12, color: BLUE, fontWeight: 600 }}>{selectedHospital.hospitalName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Email / Staff ID */}
                                <div style={{ marginBottom: 18 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSub, marginBottom: 8 }}>Email or Staff ID</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={15} color={t.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                        <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} required placeholder="e.g. john@hospital.com" className="input-field" style={{ ...inputStyle, paddingLeft: 42 }} />
                                    </div>
                                </div>

                                {/* Password */}
                                <div style={{ marginBottom: 10 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSub, marginBottom: 8 }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={15} color={t.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="input-field" style={{ ...inputStyle, paddingLeft: 42, paddingRight: 44 }} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, display: 'flex' }}>
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', marginBottom: 20 }}>
                                    <button type="button" onClick={() => { setStep('forgot'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: BLUE, fontSize: 13, fontWeight: 600 }}>Forgot password?</button>
                                </div>

                                {error && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, marginBottom: 18 }}>
                                        <AlertCircle size={15} color="#ef4444" />
                                        <span style={{ fontSize: 13, color: '#ef4444' }}>{error}</span>
                                    </div>
                                )}

                                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '13px', background: isLoading ? 'rgba(59,91,219,0.5)' : `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: isLoading ? 'none' : `0 4px 20px rgba(59,91,219,0.4)` }}>
                                    {isLoading ? 'Signing in…' : 'Sign In to Portal'}
                                </button>
                            </form>
                        )}

                        {step === 'forgot' && (
                            <form onSubmit={handleForgotPassword}>
                                <button type="button" onClick={() => { setStep('login'); setError(''); setSuccessMsg(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: t.textSub, fontSize: 13, marginBottom: 20, fontFamily: 'inherit' }}>
                                    <ArrowLeft size={14} /> Back to login
                                </button>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSub, marginBottom: 8 }}>Your Work Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={15} color={t.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                        <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required placeholder="your.email@hospital.com" className="input-field" style={{ ...inputStyle, paddingLeft: 42 }} />
                                    </div>
                                </div>
                                {error && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, marginBottom: 18 }}><AlertCircle size={15} color="#ef4444" /><span style={{ fontSize: 13, color: '#ef4444' }}>{error}</span></div>}
                                {successMsg && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, marginBottom: 18 }}><BadgeCheck size={15} color="#10b981" /><span style={{ fontSize: 13, color: '#10b981' }}>{successMsg}</span></div>}
                                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '13px', background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: isLoading ? 0.6 : 1 }}>
                                    {isLoading ? 'Sending…' : 'Send Reset Link'}
                                </button>
                            </form>
                        )}
                    </div>

                    <div style={{ padding: '16px 28px', borderTop: `1px solid ${t.divider}`, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textAlign: 'center' }}>
                        <p style={{ fontSize: 12, color: t.textMuted }}>Don't have credentials? <span style={{ color: t.textSub, fontWeight: 600 }}>Contact your hospital administrator</span></p>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
                    <Link to="/" style={{ fontSize: 13, color: t.textMuted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={13} /> Back to Home</Link>
                    <Link to="/patientlogin" style={{ fontSize: 13, color: t.textMuted, textDecoration: 'none' }}>Patient Portal →</Link>
                    <Link to="/hospital/auth" style={{ fontSize: 13, color: t.textMuted, textDecoration: 'none' }}>Hospital Login →</Link>
                </div>
            </div>
        </div>
    );
}