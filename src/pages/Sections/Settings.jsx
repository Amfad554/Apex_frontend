import { useState, useEffect } from 'react';
import { Save, Building2, Phone, Mail, MapPin, Lock, Eye, EyeOff, CheckCircle2, Loader, X } from 'lucide-react';
import { BLUE, BLUE2, ACCENT } from '../theme.js';
import { hospitalsAPI, authAPI } from '../../services/api.js';

const HOSPITAL_TYPES = ['general', 'specialty', 'private', 'clinic', 'medical_center'];

// ── Inline Toast ──────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const id = setTimeout(onClose, 4000); return () => clearTimeout(id); }, []);
  const colors = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
  };
  const c = colors[type] || colors.success;
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 12, padding: '14px 18px', minWidth: 280, maxWidth: 420, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'flex-start', gap: 10, animation: 'toastIn 0.3s cubic-bezier(0.21,1.02,0.73,1) forwards' }}>
      <style>{`@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.6, padding: 0, display: 'flex' }}><X size={15} /></button>
    </div>
  );
}

export default function DashSettings({ isDark, t, hospital }) {
    const [profile, setProfile] = useState({ hospitalName: '', hospitalType: 'general', phone: '', address: '', email: '' });
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false });
    const [profileLoading, setProfileLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [passError, setPassError] = useState('');
    const [profileError, setProfileError] = useState('');

    const showToast = (message, type = 'success') => setToast({ message, type });

    useEffect(() => {
        authAPI.me()
            .then(data => {
                const h = data.user;
                setProfile({
                    hospitalName: h.hospitalName || '',
                    hospitalType: h.hospitalType || 'general',
                    phone: h.phone || '',
                    address: h.address || '',
                    email: h.email || '',
                });
            })
            .catch(console.error)
            .finally(() => setPageLoading(false));
    }, []);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileLoading(true);
        try {
            await hospitalsAPI.updateProfile(profile);
            showToast('Profile saved successfully!');
        } catch (err) {
            setProfileError(err.message || 'Failed to save profile.');
            showToast(err.message || 'Failed to save profile.', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPassError('');
        if (passwords.newPass !== passwords.confirm) { setPassError('New passwords do not match.'); return; }
        if (passwords.newPass.length < 8) { setPassError('Password must be at least 8 characters.'); return; }
        if (passwords.current === passwords.newPass) { setPassError('New password must be different from current.'); return; }
        setPassLoading(true);
        try {
            await authAPI.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPass });
            setPasswords({ current: '', newPass: '', confirm: '' });
            showToast('Password updated successfully!');
        } catch (err) {
            setPassError(err.message || 'Failed to update password.');
            showToast(err.message || 'Failed to update password.', 'error');
        } finally {
            setPassLoading(false);
        }
    };

    const inputStyle = { width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: '11px 14px', color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 7 };

    if (pageLoading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10, color: t.textSub }}>
            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Loading settings...
        </div>
    );

    return (
        <div style={{ maxWidth: 720 }}>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Settings</h1>
                <p style={{ color: t.textSub, fontSize: 14 }}>Manage your hospital profile and account settings</p>
            </div>

            {/* Hospital Profile */}
            <div style={{ background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, boxShadow: t.shadow, marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(59,91,219,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={17} color={BLUE} />
                    </div>
                    <div>
                        <h2 style={{ fontWeight: 700, fontSize: 15 }}>Hospital Profile</h2>
                        <p style={{ fontSize: 12, color: t.textSub }}>Update your hospital's information</p>
                    </div>
                </div>
                <form onSubmit={handleProfileSave} style={{ padding: '24px' }}>
                    {profileError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 14 }}>{profileError}</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div style={{ gridColumn: '1/-1' }}>
                            <label style={labelStyle}>Hospital Name *</label>
                            <input required style={inputStyle} value={profile.hospitalName} onChange={e => setProfile({ ...profile, hospitalName: e.target.value })} />
                        </div>
                        <div>
                            <label style={labelStyle}>Hospital Type</label>
                            <select style={inputStyle} value={profile.hospitalType} onChange={e => setProfile({ ...profile, hospitalType: e.target.value })}>
                                {HOSPITAL_TYPES.map(ht => <option key={ht} value={ht}>{ht.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={14} color={t.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="email" style={{ ...inputStyle, paddingLeft: 36 }} value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Phone Number *</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={14} color={t.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input required style={{ ...inputStyle, paddingLeft: 36 }} value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ gridColumn: '1/-1' }}>
                            <label style={labelStyle}>Address *</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={14} color={t.textMuted} style={{ position: 'absolute', left: 12, top: 13, pointerEvents: 'none' }} />
                                <textarea required style={{ ...inputStyle, paddingLeft: 36, minHeight: 70, resize: 'vertical' }} value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: 18 }}>
                        <button type="submit" disabled={profileLoading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: profileLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: profileLoading ? 0.7 : 1 }}>
                            <Save size={16} /> {profileLoading ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Password */}
            <div style={{ background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, boxShadow: t.shadow, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Lock size={17} color={ACCENT.red} />
                    </div>
                    <div>
                        <h2 style={{ fontWeight: 700, fontSize: 15 }}>Change Password</h2>
                        <p style={{ fontSize: 12, color: t.textSub }}>Update your account password</p>
                    </div>
                </div>
                <form onSubmit={handlePasswordChange} style={{ padding: '24px' }}>
                    {passError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 14 }}>{passError}</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                        {[
                            { key: 'current', label: 'Current Password' },
                            { key: 'newPass', label: 'New Password' },
                            { key: 'confirm', label: 'Confirm New Password' },
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label style={labelStyle}>{label}</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={14} color={t.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    <input
                                        type={showPass[key] ? 'text' : 'password'}
                                        required
                                        style={{ ...inputStyle, paddingLeft: 36, paddingRight: 40 }}
                                        value={passwords[key]}
                                        onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPass(p => ({ ...p, [key]: !p[key] }))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, display: 'flex' }}>
                                        {showPass[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 18 }}>
                        <button type="submit" disabled={passLoading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: `linear-gradient(135deg, ${ACCENT.red}, #f87171)`, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: passLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: passLoading ? 0.7 : 1 }}>
                            <Lock size={15} /> {passLoading ? 'Updating…' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}