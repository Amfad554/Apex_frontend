import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Phone, MapPin, FileText, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Toast from '../Components/Toast';
import { ButtonSpinner } from '../Components/LoadingSpinner';
import { authAPI } from '../services/api';

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

        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => navigate('/hospitaldashboard'), 1000);

      } catch (error) {
        showToast(error.message || 'Login failed', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} duration={5000} />
      )}

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-xl shadow-indigo-200 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-800">
            {mode === 'signin' ? 'Hospital Login' : 'Register Your Hospital'}
          </h2>
          <p className="text-slate-600 mt-2">
            {mode === 'signin'
              ? 'Access your hospital management dashboard'
              : 'Join hundreds of hospitals on our platform'}
          </p>
        </div>

        <div className="bg-slate-100 rounded-xl p-1 mb-6 flex">
          <button
            onClick={() => setMode('signin')}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition ${mode === 'signin' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-600 hover:text-slate-800'} disabled:opacity-50`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition ${mode === 'signup' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-600 hover:text-slate-800'} disabled:opacity-50`}
          >
            Register
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === 'signin' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isLoading} placeholder="hospital@example.com"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required disabled={isLoading} placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button type="button" disabled={isLoading} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50">
                    Forgot password?
                  </button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange} required disabled={isLoading} placeholder="Central General Hospital"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Type *</label>
                  <select name="hospitalType" value={formData.hospitalType} onChange={handleChange} required disabled={isLoading}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-600 disabled:bg-slate-50 disabled:cursor-not-allowed">
                    <option value="">Select hospital type</option>
                    <option value="public">Public Hospital</option>
                    <option value="private">Private Hospital</option>
                    <option value="specialty">Specialty Hospital</option>
                    <option value="clinic">Clinic</option>
                    <option value="medical_center">Medical Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required disabled={isLoading} placeholder="123 Medical Street, City, State"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required disabled={isLoading} placeholder="+1234567890"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">License # *</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required disabled={isLoading} placeholder="LIC123456"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Administrator Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" name="adminName" value={formData.adminName} onChange={handleChange} required disabled={isLoading} placeholder="Dr. John Smith"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isLoading} placeholder="admin@hospital.com"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required minLength={8} disabled={isLoading} placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)} disabled={isLoading}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed" />
                  <label htmlFor="showPassword" className="text-sm text-slate-600">Show passwords</label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Approval Required</p>
                      <p className="text-xs text-blue-700">
                        Your registration will be reviewed by our Super Admin team.
                        You'll receive approval notification within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <ButtonSpinner />
                  <span>{mode === 'signin' ? 'Signing In...' : 'Registering...'}</span>
                </>
              ) : (
                <span>{mode === 'signin' ? 'Sign In' : 'Submit for Approval'}</span>
              )}
            </button>

            {mode === 'signup' && (
              <p className="text-xs text-slate-500 text-center mt-4">
                By registering, you agree to our{' '}
                <a href="/terms" className="text-indigo-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>
              </p>
            )}
          </form>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => navigate('/')} disabled={isLoading}
            className="text-sm text-slate-600 hover:text-indigo-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}