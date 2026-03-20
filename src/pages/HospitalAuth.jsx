import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Phone, MapPin, FileText, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Toast from '../Components/Toast';
import { ButtonSpinner } from '../Components/LoadingSpinner';
import { authAPI } from '../Services/api';

export default function HospitalAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    hospitalName: '',
    address: '',
    phone: '',
    licenseNumber: '',
    hospitalType: '',
    adminName: '',
    confirmPassword: ''
  });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        showToast('Passwords do not match', 'error');
        setIsLoading(false);
        return;
      }

      try {
        await authAPI.hospitalRegister({
          hospitalName: formData.hospitalName,
          hospitalType: formData.hospitalType,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          licenseNumber: formData.licenseNumber,
          adminName: formData.adminName,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });

        showToast('🎉 Registration submitted successfully! Awaiting Super Admin approval.', 'success');
        setFormData({
          email: formData.email,
          password: '',
          hospitalName: '',
          address: '',
          phone: '',
          licenseNumber: '',
          hospitalType: '',
          adminName: '',
          confirmPassword: ''
        });
        setTimeout(() => setMode('signin'), 3000);

      } catch (error) {
        showToast(error.message || 'Registration failed', 'error');
      } finally {
        setIsLoading(false);
      }

    } else {
      try {
        const data = await authAPI.hospitalLogin({
          email: formData.email,
          password: formData.password
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', 'hospital_admin');
        window.dispatchEvent(new Event('authChange'));

        if (data.requiresPayment && formData.email !== 'georgechiamaka02@gmail.com') {
          showToast('Please choose a plan to activate your account.', 'info');
          setTimeout(() => navigate('/pricing'), 1000);
        } else {
          showToast('Login successful! Redirecting...', 'success');
          setTimeout(() => navigate('/hospitaldashboard'), 1000);
        }

      } catch (error) {
        showToast(error.message || 'Login failed', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  /* ── Shared input class ── */
  const inputCls = "w-full py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:cursor-not-allowed"
    + " border-gray-200 focus:ring-orange-100 focus:border-orange-400 text-slate-800 placeholder-gray-400 bg-white disabled:bg-gray-50";

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#F5F7FA" }}
    >
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} duration={5000} />
      )}

      <div className="max-w-md w-full">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ backgroundColor: "#0A1A3F", boxShadow: "0 8px 32px rgba(10,26,63,0.25)" }}
          >
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black" style={{ color: "#0A1A3F" }}>
            {mode === 'signin' ? 'Hospital Login' : 'Register Your Hospital'}
          </h2>
          <p className="mt-2" style={{ color: "#718096" }}>
            {mode === 'signin'
              ? 'Access your hospital management dashboard'
              : 'Join hundreds of hospitals on our platform'}
          </p>
        </div>

        {/* ── Tab switcher ── */}
        <div
          className="rounded-xl p-1 mb-6 flex"
          style={{ backgroundColor: "rgba(10,26,63,0.07)" }}
        >
          <button
            onClick={() => setMode('signin')}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition disabled:opacity-50"
            style={mode === 'signin'
              ? { backgroundColor: "#fff", color: "#FF5A1F", boxShadow: "0 2px 8px rgba(10,26,63,0.1)" }
              : { backgroundColor: "transparent", color: "#718096" }}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition disabled:opacity-50"
            style={mode === 'signup'
              ? { backgroundColor: "#fff", color: "#FF5A1F", boxShadow: "0 2px 8px rgba(10,26,63,0.1)" }
              : { backgroundColor: "transparent", color: "#718096" }}
          >
            Register
          </button>
        </div>

        {/* ── Form card ── */}
        <div
          className="bg-white rounded-2xl p-8"
          style={{ border: "1px solid rgba(10,26,63,0.08)", boxShadow: "0 8px 40px rgba(10,26,63,0.08)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ════ SIGN IN ════ */}
            {mode === 'signin' && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#0A1A3F" }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A0AEC0" }} />
                    <input
                      type="email" name="email" value={formData.email}
                      onChange={handleChange} required disabled={isLoading}
                      placeholder="hospital@example.com"
                      className={`${inputCls} pl-11 pr-4`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#0A1A3F" }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A0AEC0" }} />
                    <input
                      type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                      onChange={handleChange} required disabled={isLoading}
                      placeholder="••••••••"
                      className={`${inputCls} pl-11 pr-11`}
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 disabled:cursor-not-allowed transition-colors"
                      style={{ color: "#A0AEC0" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#FF5A1F"}
                      onMouseLeave={e => e.currentTarget.style.color = "#A0AEC0"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button" disabled={isLoading}
                    className="text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ color: "#FF5A1F" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#e64d15"}
                    onMouseLeave={e => e.currentTarget.style.color = "#FF5A1F"}
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}

            {/* ════ SIGN UP ════ */}
            {mode === 'signup' && (
              <>
                {/* Hospital Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#0A1A3F" }}>Hospital Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A0AEC0" }} />
                    <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange}
                      required disabled={isLoading} placeholder="Central General Hospital"
                      className={`${inputCls} pl-11 pr-4`} />
                  </div>
                </div>

                {/* Hospital Type */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#0A1A3F" }}>Hospital Type *</label>
                  <select
                    name="hospitalType" value={formData.hospitalType} onChange={handleChange}
                    required disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                    style={{ color: formData.hospitalType ? "#0A1A3F" : "#A0AEC0" }}
                  >
                    <option value="">Select hospital type</option>
                    <option value="public">Public Hospital</option>
                    <option value="private">Private Hospital</option>
                    <option value="specialty">Specialty Hospital</option>
                    <option value="clinic">Clinic</option>
                    <option value="medical_center">Medical Center</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#0A1A3F" }}>Hospital Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A0AEC0" }} />
                    <input type="text" name="address" value={formData.address} onChange={handleChange}
                      required disabled={isLoading} placeholder="123 Medical Street, City, State"
                      className={`${inputCls} pl-11 pr-4`} />
                  </div>
                </div>

                {/* Phone + License */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0A1A3F" }}>Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A0AEC0" }} />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        required disabled={isLoading} placeholder="+1234567890"
                        className={`${inputCls} pl-11 pr-4`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0A1A3F" }}>License # *</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A0AEC0" }} />
                      <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange}
                        required disabled={isLoading} placeholder="LIC123456"
                        className={`${inputCls} pl-11 pr-4`} />
                    </div>
                  </div>
                </div>

                {/* Admin Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#0A1A3F" }}>Administrator Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A0AEC0" }} />
                    <input type="text" name="adminName" value={formData.adminName} onChange={handleChange}
                      required disabled={isLoading} placeholder="Dr. John Smith"
                      className={`${inputCls} pl-11 pr-4`} />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#0A1A3F" }}>Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A0AEC0" }} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      required disabled={isLoading} placeholder="admin@hospital.com"
                      className={`${inputCls} pl-11 pr-4`} />
                  </div>
                </div>

                {/* Password + Confirm */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0A1A3F" }}>Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A0AEC0" }} />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                        onChange={handleChange} required minLength={8} disabled={isLoading} placeholder="••••••••"
                        className={`${inputCls} pl-11 pr-4`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0A1A3F" }}>Confirm *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A0AEC0" }} />
                      <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword}
                        onChange={handleChange} required disabled={isLoading} placeholder="••••••••"
                        className={`${inputCls} pl-11 pr-4`} />
                    </div>
                  </div>
                </div>

                {/* Show password toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox" id="showPassword" checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)} disabled={isLoading}
                    className="w-4 h-4 rounded disabled:cursor-not-allowed accent-orange-500"
                  />
                  <label htmlFor="showPassword" className="text-sm" style={{ color: "#718096" }}>
                    Show passwords
                  </label>
                </div>

                {/* Approval notice */}
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "rgba(10,26,63,0.04)", border: "1px solid rgba(10,26,63,0.1)" }}
                >
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#FF5A1F" }} />
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: "#0A1A3F" }}>Approval Required</p>
                      <p className="text-xs" style={{ color: "#718096" }}>
                        Your registration will be reviewed by our Super Admin team.
                        You'll receive approval notification within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Submit ── */}
            <button
              type="submit" disabled={isLoading}
              className="w-full py-3 rounded-lg font-bold mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white transition-all active:scale-[0.98]"
              style={{ backgroundColor: "#FF5A1F", boxShadow: "0 4px 20px rgba(255,90,31,0.3)" }}
              onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = "#e64d15")}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FF5A1F"}
            >
              {isLoading ? (
                <><ButtonSpinner /><span>{mode === 'signin' ? 'Signing In...' : 'Registering...'}</span></>
              ) : (
                <span>{mode === 'signin' ? 'Sign In' : 'Submit for Approval'}</span>
              )}
            </button>

            {mode === 'signup' && (
              <p className="text-xs text-center mt-4" style={{ color: "#A0AEC0" }}>
                By registering, you agree to our{' '}
                <a href="/terms" className="transition-colors" style={{ color: "#FF5A1F" }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="/privacy" className="transition-colors" style={{ color: "#FF5A1F" }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                  Privacy Policy
                </a>
              </p>
            )}
          </form>
        </div>

        {/* ── Back link ── */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')} disabled={isLoading}
            className="text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: "#718096" }}
            onMouseEnter={e => e.currentTarget.style.color = "#FF5A1F"}
            onMouseLeave={e => e.currentTarget.style.color = "#718096"}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}