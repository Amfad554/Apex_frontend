import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import {
  Eye, EyeOff, Heart, Mail, Lock, Sun, Moon,
  AlertCircle, BadgeCheck, ArrowLeft, Activity
} from "lucide-react";

// ── Theme tokens matching dashboard exactly ──────────────────────
const themes = {
  dark: {
    bg: '#0a0d14',
    card: '#0f1117',
    cardInner: '#141824',
    border: 'rgba(59,91,219,0.18)',
    text: '#f0f4ff',
    textSub: 'rgba(255,255,255,0.45)',
    textMuted: 'rgba(255,255,255,0.25)',
    input: '#0d1321',
    inputBorder: 'rgba(59,91,219,0.25)',
    divider: 'rgba(255,255,255,0.07)',
    shadow: '0 24px 60px rgba(0,0,0,0.6)',
    hover: 'rgba(255,255,255,0.04)',
  },
  light: {
    bg: '#f0f4fb',
    card: '#ffffff',
    cardInner: '#f7f9fe',
    border: 'rgba(0,0,0,0.08)',
    text: '#111827',
    textSub: 'rgba(0,0,0,0.5)',
    textMuted: 'rgba(0,0,0,0.3)',
    input: '#f1f5fd',
    inputBorder: 'rgba(0,0,0,0.12)',
    divider: 'rgba(0,0,0,0.07)',
    shadow: '0 24px 60px rgba(0,0,0,0.1)',
    hover: 'rgba(0,0,0,0.03)',
  }
};

const BLUE  = '#3b5bdb';
const BLUE2 = '#228be6';
const PINK  = '#ec4899';
const PINK2 = '#f472b6';

export default function PatientLogin() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({ email: "", password: "" });

  const t = isDark ? themes.dark : themes.light;

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    window.dispatchEvent(new Event('themeChange'));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post("http://localhost:5000/api/patients/login", formData);
      const data = res.data;

      localStorage.setItem("token", data.token || "no-token");
      localStorage.setItem("user", JSON.stringify({ ...data.user, role: 'patient' }));
      localStorage.setItem("userRole", "patient");
      window.dispatchEvent(new Event('authChange'));

      navigate("/patientdashboard");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid credentials. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: t.input,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: 10,
    padding: '12px 14px',
    color: t.text,
    fontSize: 14,
    outline: 'none',
    transition: 'border 0.2s',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: t.text,
      transition: 'background 0.3s, color 0.3s',
      padding: '24px 16px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: ${t.textMuted}; }
        .input-field:focus { border-color: ${PINK} !important; }
      `}</style>

      {/* ── Theme Toggle ── */}
      <button onClick={toggleTheme} style={{
        position: 'fixed', top: 20, right: 20,
        width: 38, height: 38, borderRadius: 10,
        background: t.card, border: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: t.textSub, zIndex: 100,
        boxShadow: t.shadow,
      }}>
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: `linear-gradient(135deg, ${PINK}, ${PINK2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 8px 32px rgba(236,72,153,0.4)`,
          }}>
            <Heart size={28} color="#fff" />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px', marginBottom: 4 }}>
            HMS<span style={{
              background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>Care</span>
          </h1>
          <p style={{ color: t.textSub, fontSize: 14 }}>Patient Portal</p>
        </div>

        {/* ── Card ── */}
        <div style={{
          background: t.card,
          borderRadius: 24,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
          overflow: 'hidden',
        }}>

          {/* Card Header */}
          <div style={{
            padding: '20px 28px',
            borderBottom: `1px solid ${t.divider}`,
            background: isDark ? 'rgba(236,72,153,0.06)' : 'rgba(236,72,153,0.03)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(236,72,153,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={18} color={PINK} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>Patient Login</p>
              <p style={{ fontSize: 12, color: t.textSub }}>
                Use credentials provided by your hospital
              </p>
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: '28px' }}>
            <form onSubmit={handleLogin}>

              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSub, marginBottom: 8 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color={t.textMuted} style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', pointerEvents: 'none'
                  }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                    className="input-field"
                    style={{ ...inputStyle, paddingLeft: 42 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.textSub, marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color={t.textMuted} style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', pointerEvents: 'none'
                  }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="input-field"
                    style={{ ...inputStyle, paddingLeft: 42, paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: t.textMuted, display: 'flex',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <button type="button" style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: PINK, fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                }}>
                  Forgot password?
                </button>
              </div>

              {/* Error / Success message */}
              {message.text && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 10, marginBottom: 18,
                  background: message.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${message.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                }}>
                  {message.type === 'error'
                    ? <AlertCircle size={15} color="#ef4444" />
                    : <BadgeCheck size={15} color="#10b981" />
                  }
                  <span style={{
                    fontSize: 13,
                    color: message.type === 'error' ? '#ef4444' : '#10b981'
                  }}>
                    {message.text}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: loading
                    ? `rgba(236,72,153,0.5)`
                    : `linear-gradient(135deg, ${PINK}, ${PINK2})`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(236,72,153,0.4)',
                  transition: 'opacity 0.2s',
                }}
              >
                {loading ? "Signing in..." : "Sign In to Patient Portal"}
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div style={{
            padding: '16px 28px',
            borderTop: `1px solid ${t.divider}`,
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 12, color: t.textMuted }}>
              Don't have an account?{' '}
              <span style={{ color: t.textSub, fontWeight: 600 }}>
                Contact your hospital administrator
              </span>
            </p>
          </div>
        </div>

        {/* ── Bottom Links ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
          <Link to="/" style={{
            fontSize: 13, color: t.textMuted, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <ArrowLeft size={13} /> Back to Home
          </Link>
          <Link to="/stafflogin" style={{ fontSize: 13, color: t.textMuted, textDecoration: 'none' }}>
            Staff Portal →
          </Link>
          <Link to="/hospital/auth" style={{ fontSize: 13, color: t.textMuted, textDecoration: 'none' }}>
            Hospital Login →
          </Link>
        </div>

      </div>
    </div>
  );
}