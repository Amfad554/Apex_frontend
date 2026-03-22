import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Stethoscope, Mail, Lock, Eye, EyeOff, Sun, Moon,
    Activity, ArrowLeft, BadgeCheck, Search, AlertCircle,
    Building2, X, KeyRound,
} from 'lucide-react';
import { authAPI, hospitalsAPI } from '../Services/api.js';

/* ─── Brand Tokens ───────────────────────────────────────────────────────────── */
const ORANGE = '#FF5A1F';
const ORANGE2 = '#e64d15';

/* ─── Theme (matches PatientLogin exactly) ───────────────────────────────────── */
const themes = {
    dark: {
        bg: '#0A1A3F',
        card: '#1F2A44',
        cardInner: '#0A1A3F',
        border: 'rgba(255,255,255,0.07)',
        text: '#F5F7FA',
        textSub: 'rgba(245,247,250,0.65)',
        textMuted: 'rgba(245,247,250,0.35)',
        input: 'rgba(10,26,63,0.6)',
        inputBorder: 'rgba(255,90,31,0.22)',
        divider: 'rgba(255,255,255,0.07)',
        shadow: '0 24px 60px rgba(0,0,0,0.5)',
        hover: 'rgba(255,90,31,0.06)',
    },
    light: {
        bg: '#F5F7FA',
        card: '#ffffff',
        cardInner: '#F5F7FA',
        border: 'rgba(10,26,63,0.08)',
        text: '#0A1A3F',
        textSub: 'rgba(10,26,63,0.6)',
        textMuted: 'rgba(10,26,63,0.35)',
        input: '#F5F7FA',
        inputBorder: 'rgba(10,26,63,0.12)',
        divider: 'rgba(10,26,63,0.07)',
        shadow: '0 24px 60px rgba(10,26,63,0.08)',
        hover: 'rgba(255,90,31,0.04)',
    },
};

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
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');

    const t = isDark ? themes.dark : themes.light;

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        window.dispatchEvent(new Event('themeChange'));
    };

    /* ── Hospital search ── */
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

    const selectHospital = (h) => { setSelectedHospital(h); setHospitalQuery(h.hospitalName); setShowDropdown(false); };
    const clearHospital = () => { setSelectedHospital(null); setHospitalQuery(''); setHospitalResults([]); };
    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

    /* ── Login ── */
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!selectedHospital) { setError('Please select your hospital first.'); return; }
        setIsLoading(true); setError('');
        try {
            const data = await authAPI.staffLogin({
                identifier: formData.identifier,
                password: formData.password,
                hospitalId: selectedHospital.id,
            });
            const user = data.user || {};
            const role = (user.role || user.staffRole || 'staff').toLowerCase();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ ...user, role, hospital_id: user.hospitalId || user.hospital_id }));
            localStorage.setItem('userRole', role);
            window.dispatchEvent(new Event('authChange'));
            navigate('/staffdashboard');
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    /* ── Forgot Password ── */
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotLoading(true); setForgotError(''); setForgotSuccess('');
        try {
            await authAPI.forgotPassword(forgotEmail);
            setForgotSuccess('Reset link sent! Check your inbox.');
        } catch (err) {
            // Fallback: show success regardless to prevent email enumeration
            setForgotSuccess('If this email exists, a reset link has been sent. Check your inbox.');
        } finally {
            setForgotLoading(false);
        }
    };

    /* ── Shared styles ── */
    const inputStyle = {
        width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`,
        borderRadius: 10, padding: '12px 14px', color: t.text, fontSize: 14,
        outline: 'none', transition: 'border 0.2s, box-shadow 0.2s',
        fontFamily: 'inherit', boxSizing: 'border-box',
    };

    return (
        <div style={{
            minHeight: '100vh', background: t.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: t.text,
            transition: 'background 0.3s, color 0.3s', padding: '24px 16px',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                input::placeholder { color: ${t.textMuted}; }
                .input-field:focus { border-color: ${ORANGE} !important; box-shadow: 0 0 0 3px rgba(255,90,31,0.12) !important; }
                .hospital-item:hover { background: ${t.hover} !important; }
                @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes overlayIn  { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalIn    { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>

            {/* ── Theme Toggle ── */}
            <button onClick={toggleTheme} style={{
                position: 'fixed', top: 20, right: 20,
                width: 38, height: 38, borderRadius: 10,
                background: t.card, border: `1px solid ${t.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: t.textSub, zIndex: 100,
                boxShadow: t.shadow, transition: 'transform 0.2s',
            }}
                onMouseEnter={e => e.currentTarget.style.transform = 'rotate(20deg) scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
            >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* ── Forgot Password Modal ── */}
            {step === 'forgot' && (
                <>
                    {/* Overlay */}
                    <div
                        onClick={() => { setStep('login'); setForgotError(''); setForgotSuccess(''); setForgotEmail(''); }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 200,
                            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                            animation: 'overlayIn 0.2s ease',
                        }}
                    />
                    {/* Modal */}
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%', zIndex: 201,
                        transform: 'translate(-50%, -50%)',
                        width: '100%', maxWidth: 420,
                        background: t.card, borderRadius: 20,
                        border: `1px solid ${t.border}`,
                        boxShadow: t.shadow,
                        padding: '32px 28px',
                        animation: 'modalIn 0.25s cubic-bezier(0.34,1.2,0.64,1)',
                    }}>
                        {/* Close */}
                        <button
                            onClick={() => { setStep('login'); setForgotError(''); setForgotSuccess(''); setForgotEmail(''); }}
                            style={{
                                position: 'absolute', top: 16, right: 16,
                                background: t.input, border: `1px solid ${t.border}`,
                                borderRadius: 8, width: 30, height: 30,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: t.textMuted,
                            }}
                        ><X size={14} /></button>

                        {/* Icon */}
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE2})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 16, boxShadow: '0 8px 24px rgba(255,90,31,0.35)',
                        }}>
                            <KeyRound size={22} color="#fff" />
                        </div>

                        <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 4, color: t.text }}>Forgot Password?</h2>
                        <p style={{ fontSize: 13, color: t.textSub, marginBottom: 24 }}>
                            Enter your work email and we'll send a reset link.
                        </p>

                        {!forgotSuccess ? (
                            <form onSubmit={handleForgotPassword}>
                                <div style={{ marginBottom: 18 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSub, marginBottom: 8 }}>
                                        Work Email
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={15} color={t.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                        <input
                                            type="email" value={forgotEmail}
                                            onChange={e => { setForgotEmail(e.target.value); setForgotError(''); }}
                                            required placeholder="your.email@hospital.com"
                                            className="input-field"
                                            style={{ ...inputStyle, paddingLeft: 42 }}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {forgotError && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, marginBottom: 18 }}>
                                        <AlertCircle size={15} color="#ef4444" />
                                        <span style={{ fontSize: 13, color: '#ef4444' }}>{forgotError}</span>
                                    </div>
                                )}

                                <button type="submit" disabled={forgotLoading} style={{
                                    width: '100%', padding: 13,
                                    background: forgotLoading ? 'rgba(255,90,31,0.45)' : `linear-gradient(135deg, ${ORANGE}, ${ORANGE2})`,
                                    color: '#fff', border: 'none', borderRadius: 12,
                                    fontWeight: 700, fontSize: 15,
                                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                                    fontFamily: 'inherit',
                                    boxShadow: forgotLoading ? 'none' : '0 4px 20px rgba(255,90,31,0.35)',
                                    transition: 'opacity 0.2s',
                                }}>
                                    {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                                </button>
                            </form>
                        ) : (
                            <div style={{ animation: 'fadeSlideIn 0.3s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, marginBottom: 20 }}>
                                    <BadgeCheck size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span style={{ fontSize: 13, color: '#10b981', lineHeight: 1.5 }}>{forgotSuccess}</span>
                                </div>
                                <button
                                    onClick={() => { setStep('login'); setForgotSuccess(''); setForgotEmail(''); }}
                                    style={{
                                        width: '100%', padding: 13,
                                        background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE2})`,
                                        color: '#fff', border: 'none', borderRadius: 12,
                                        fontWeight: 700, fontSize: 15, cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        boxShadow: '0 4px 20px rgba(255,90,31,0.35)',
                                    }}
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            <div style={{ width: '100%', maxWidth: 480 }}>

                {/* ── Logo ── */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: 16,
                        background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE2})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: `0 8px 32px rgba(255,90,31,0.35)`,
                    }}>
                        <Stethoscope size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px', marginBottom: 4, color: t.text }}>
                        HMS<span style={{ color: ORANGE }}>Care</span>
                    </h1>
                    <p style={{ color: t.textSub, fontSize: 14 }}>Staff & Doctor Portal</p>
                </div>

                {/* ── Card ── */}
                <div style={{
                    background: t.card, borderRadius: 24,
                    border: `1px solid ${t.border}`, boxShadow: t.shadow, overflow: 'hidden',
                }}>
                    {/* Card Header */}
                    <div style={{
                        padding: '20px 28px', borderBottom: `1px solid ${t.divider}`,
                        background: isDark ? 'rgba(255,90,31,0.07)' : 'rgba(255,90,31,0.04)',
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'rgba(255,90,31,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Activity size={18} color={ORANGE} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: 15, color: t.text }}>Staff Login</p>
                            <p style={{ fontSize: 12, color: t.textSub }}>Use credentials provided by your hospital admin</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div style={{ padding: '28px' }}>
                        <form onSubmit={handleLogin}>

                            {/* Hospital Search */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSub, marginBottom: 8 }}>Your Hospital</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.input, border: `1px solid ${selectedHospital ? ORANGE : t.inputBorder}`, borderRadius: 10, padding: '10px 14px', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                                        <Building2 size={16} color={selectedHospital ? ORANGE : t.textMuted} style={{ flexShrink: 0 }} />
                                        <input
                                            type="text" placeholder="Search your hospital name..."
                                            value={hospitalQuery}
                                            onChange={e => { setHospitalQuery(e.target.value); setSelectedHospital(null); }}
                                            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 14, fontFamily: 'inherit' }}
                                        />
                                        {searching && <span style={{ fontSize: 11, color: t.textMuted }}>…</span>}
                                        {selectedHospital && (
                                            <button type="button" onClick={clearHospital}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, display: 'flex' }}>
                                                <X size={14} />
                                            </button>
                                        )}
                                        {!selectedHospital && !searching && <Search size={14} color={t.textMuted} />}
                                    </div>

                                    {/* Dropdown results */}
                                    {showDropdown && hospitalResults.length > 0 && (
                                        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50, background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, boxShadow: t.shadow, overflow: 'hidden' }}>
                                            {hospitalResults.map(h => (
                                                <div key={h.id} className="hospital-item" onClick={() => selectHospital(h)}
                                                    style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,90,31,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <Building2 size={15} color={ORANGE} />
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, fontSize: 13, color: t.text }}>{h.hospitalName}</p>
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
                                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,90,31,0.1)', borderRadius: 8, padding: '6px 10px' }}>
                                        <BadgeCheck size={14} color={ORANGE} />
                                        <span style={{ fontSize: 12, color: ORANGE, fontWeight: 600 }}>{selectedHospital.hospitalName}</span>
                                    </div>
                                )}
                            </div>

                            {/* Email / Staff ID */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSub, marginBottom: 8 }}>Email or Staff ID</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={15} color={t.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} required
                                        placeholder="e.g. john@hospital.com" className="input-field"
                                        style={{ ...inputStyle, paddingLeft: 42 }} />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: 10 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSub, marginBottom: 8 }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={15} color={t.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                                        placeholder="••••••••" className="input-field"
                                        style={{ ...inputStyle, paddingLeft: 42, paddingRight: 44 }} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted,
                                        display: 'flex', transition: 'color 0.15s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.color = ORANGE}
                                        onMouseLeave={e => e.currentTarget.style.color = t.textMuted}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot password trigger */}
                            <div style={{ textAlign: 'right', marginBottom: 20 }}>
                                <button type="button" onClick={() => { setStep('forgot'); setError(''); }}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: ORANGE, fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                                        transition: 'color 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = ORANGE2}
                                    onMouseLeave={e => e.currentTarget.style.color = ORANGE}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, marginBottom: 18 }}>
                                    <AlertCircle size={15} color="#ef4444" />
                                    <span style={{ fontSize: 13, color: '#ef4444' }}>{error}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button type="submit" disabled={isLoading} style={{
                                width: '100%', padding: 13,
                                background: isLoading ? 'rgba(255,90,31,0.45)' : `linear-gradient(135deg, ${ORANGE}, ${ORANGE2})`,
                                color: '#fff', border: 'none', borderRadius: 12,
                                fontWeight: 700, fontSize: 15,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit',
                                boxShadow: isLoading ? 'none' : '0 4px 20px rgba(255,90,31,0.35)',
                                transition: 'opacity 0.2s, transform 0.15s',
                            }}
                                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.9'; }}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                {isLoading ? 'Signing in…' : 'Sign In to Portal'}
                            </button>
                        </form>
                    </div>

                    {/* Card Footer */}
                    <div style={{
                        padding: '16px 28px', borderTop: `1px solid ${t.divider}`,
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(10,26,63,0.02)',
                        textAlign: 'center',
                    }}>
                        <p style={{ fontSize: 12, color: t.textMuted }}>
                            Don't have credentials?{' '}
                            <span style={{ color: t.textSub, fontWeight: 600 }}>Contact your hospital administrator</span>
                        </p>
                    </div>
                </div>

                {/* Bottom Links */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24, flexWrap: 'wrap' }}>
                    {[
                        { to: '/', label: '← Back to Home' },
                        { to: '/patientlogin', label: 'Patient Portal →' },
                        { to: '/hospital/auth', label: 'Hospital Login →' },
                    ].map(({ to, label }) => (
                        <Link key={to} to={to} style={{
                            fontSize: 13, color: t.textMuted, textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: 4,
                            transition: 'color 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = ORANGE}
                            onMouseLeave={e => e.currentTarget.style.color = t.textMuted}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}