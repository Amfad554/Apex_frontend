import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarDays, Users, FileText, ShieldCheck, Activity, Stethoscope,
    Clock, Heart, Award, Phone, MapPin, Mail, ChevronRight, CheckCircle2,
    Zap, Lock, MessageSquare, Building2, ClipboardList, Pill, UserCog,
    TrendingUp, Star, ArrowRight, Database, Globe, Smartphone, BarChart3,
    Shield, HeartPulse, UserPlus, FileCheck, BellRing, Blocks, LogIn,
    AlertCircle, Loader2, Send, CheckCheck,
} from "lucide-react";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   API CONFIG
───────────────────────────────────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API = {
    stats:   `${API_BASE}/api/platform/stats`,
    contact: `${API_BASE}/api/contact`,
    me:      `${API_BASE}/api/hospitals/me`,
};

/* ─────────────────────────────────────────────────────────────────────────────
   AUTH CHECK — returns true if the stored JWT belongs to a valid hospital
───────────────────────────────────────────────────────────────────────────── */
async function isHospitalLoggedIn() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
        const res = await fetch(API.me, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.ok;
    } catch {
        return false;
    }
}

/* Fallback stats shown when API is unavailable */
const FALLBACK_STATS = {
    patients: 50000,
    hospitals: 250,
    doctors: 1500,
    uptime: 99.9,
    rating: 4.9,
};

/* ─────────────────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────────────────── */
function useAnimatedStats(target, duration = 2000) {
    const [current, setCurrent] = useState({
        patients: 0, hospitals: 0, doctors: 0, uptime: 0, rating: 0,
    });

    useEffect(() => {
        const start = performance.now();
        const animate = (time) => {
            const p = Math.min((time - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setCurrent({
                patients:  Math.floor(ease * target.patients),
                hospitals: Math.floor(ease * target.hospitals),
                doctors:   Math.floor(ease * target.doctors),
                uptime:    (ease * target.uptime).toFixed(1),
                rating:    (ease * target.rating).toFixed(1),
            });
            if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [target.patients]);

    return current;
}

/* ─────────────────────────────────────────────────────────────────────────────
   VALIDATION
───────────────────────────────────────────────────────────────────────────── */
const VALIDATORS = {
    hospitalName:      v => v.trim().length < 2  ? "Hospital name must be at least 2 characters." : "",
    administratorName: v => v.trim().length < 2  ? "Administrator name is required." : "",
    email:             v => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address." : "",
    phone:             v => !/^\+?[\d\s\-().]{7,}$/.test(v) ? "Enter a valid phone number." : "",
    hospitalType:      v => !v ? "Please select a hospital type." : "",
    message:           v => v.trim().length < 10 ? "Message must be at least 10 characters." : "",
};

function validate(form) {
    const errors = {};
    Object.keys(VALIDATORS).forEach(key => {
        const msg = VALIDATORS[key](form[key] || "");
        if (msg) errors[key] = msg;
    });
    return errors;
}

const INITIAL_FORM = {
    hospitalName: "", administratorName: "", email: "",
    phone: "", hospitalType: "", message: "",
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function Home() {
    const navigate = useNavigate();

    /* ── Auth redirect: if already logged in, go straight to dashboard ── */
    useEffect(() => {
        isHospitalLoggedIn().then(loggedIn => {
            if (loggedIn) navigate('/hospital/dashboard', { replace: true });
        });
    }, []);

    /* ── Stats ── */
    const [statTarget, setStatTarget] = useState(FALLBACK_STATS);
    const [statsLive, setStatsLive] = useState(false);
    const stats = useAnimatedStats(statTarget);

    useEffect(() => {
        fetch(API.stats)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => {
                setStatTarget({
                    patients:  data.totalPatients   ?? FALLBACK_STATS.patients,
                    hospitals: data.totalHospitals  ?? FALLBACK_STATS.hospitals,
                    doctors:   data.totalDoctors    ?? FALLBACK_STATS.doctors,
                    uptime:    data.uptimePercent   ?? FALLBACK_STATS.uptime,
                    rating:    data.averageRating   ?? FALLBACK_STATS.rating,
                });
                setStatsLive(true);
            })
            .catch(() => {});
    }, []);

    /* ── Contact form ── */
    const [form, setForm]           = useState(INITIAL_FORM);
    const [errors, setErrors]       = useState({});
    const [touched, setTouched]     = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState("idle");
    const [submitMsg, setSubmitMsg] = useState("");

    const setField = (key, value) => {
        setForm(f => ({ ...f, [key]: value }));
        if (touched[key]) {
            const msg = VALIDATORS[key]?.(value) ?? "";
            setErrors(e => ({ ...e, [key]: msg }));
        }
    };

    const touchField = (key) => {
        setTouched(t => ({ ...t, [key]: true }));
        const msg = VALIDATORS[key]?.(form[key] || "") ?? "";
        setErrors(e => ({ ...e, [key]: msg }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const allTouched = Object.keys(INITIAL_FORM).reduce((acc, k) => ({ ...acc, [k]: true }), {});
        setTouched(allTouched);
        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSubmitting(true);
        setSubmitState("idle");

        try {
            const res = await fetch(API.contact, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hospitalName:      form.hospitalName,
                    administratorName: form.administratorName,
                    email:             form.email,
                    phone:             form.phone,
                    hospitalType:      form.hospitalType,
                    message:           form.message,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Submission failed. Please try again.");
            }
            setSubmitState("success");
            setSubmitMsg("Message sent! We'll get back to you within 24 hours.");
            setForm(INITIAL_FORM);
            setTouched({});
            setErrors({});
        } catch (err) {
            setSubmitState("error");
            setSubmitMsg(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Field helper ── */
    const field = (key, label, type = "text", extra = {}) => (
        <FieldWrapper key={key} error={touched[key] && errors[key]}>
            {type === "select" ? (
                <select
                    value={form[key]}
                    onChange={e => setField(key, e.target.value)}
                    onBlur={() => touchField(key)}
                    className={inputCls(touched[key] && errors[key])}
                >
                    <option value="">Hospital Type</option>
                    {["General Hospital", "Specialty Hospital", "Private Clinic", "Medical Center", "Multi-Location Network"].map(o => (
                        <option key={o}>{o}</option>
                    ))}
                </select>
            ) : type === "textarea" ? (
                <textarea
                    placeholder={label}
                    rows={4}
                    value={form[key]}
                    onChange={e => setField(key, e.target.value)}
                    onBlur={() => touchField(key)}
                    className={inputCls(touched[key] && errors[key])}
                    {...extra}
                />
            ) : (
                <input
                    type={type}
                    placeholder={label}
                    value={form[key]}
                    onChange={e => setField(key, e.target.value)}
                    onBlur={() => touchField(key)}
                    className={inputCls(touched[key] && errors[key])}
                    {...extra}
                />
            )}
            {touched[key] && errors[key] && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors[key]}
                </p>
            )}
        </FieldWrapper>
    );

    return (
        <div className="bg-white text-slate-800">

            {/* ═══════════════════════ HERO ═══════════════════════ */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                        <Activity className="w-4 h-4" />
                        <span>Multi-Tenant Healthcare Platform</span>
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
                        Centralized Hospital<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                            Management Platform
                        </span>
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                        A unified platform where hospitals register, manage patients, schedule appointments,
                        and store medical records. Each hospital operates independently with complete data isolation.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-4 mb-12">
                        <button onClick={() => navigate("/hospital/auth")}
                            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
                            Register Your Hospital <ChevronRight className="w-5 h-5" />
                        </button>
                        <button onClick={() => navigate("/hospital/auth")}
                            className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:border-indigo-600 hover:text-indigo-600 active:scale-95 transition-all">
                            Hospital Login
                        </button>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-8 text-sm text-slate-600">
                        {["Instant Setup", "Super Admin Approval", "HIPAA Compliant", "Data Isolation"].map(t => (
                            <div key={t} className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" /><span>{t}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Stats card */}
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                        className="mt-16 max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-semibold text-slate-700">Platform Statistics</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${statsLive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                {statsLive ? "Live" : "Demo"}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            <StatBox label="Registered Hospitals"   value={`${stats.hospitals}+`} />
                            <StatBox label="Total Patients"          value={`${Number(stats.patients).toLocaleString()}+`} />
                            <StatBox label="Healthcare Providers"    value={`${Number(stats.doctors).toLocaleString()}+`} />
                            <StatBox label="System Uptime"           value={`${stats.uptime}%`} />
                            <StatBox label="Average Rating"          value={`${stats.rating}/5`} />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════ LOGIN PORTALS ═══════════════════════ */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <p className="text-indigo-600 font-semibold mb-2">Access Your Portal</p>
                        <h2 className="text-4xl lg:text-5xl font-black mb-4">Who are you?</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Choose your role to access the right portal. All credentials are provided by your hospital administrator.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="relative group bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                            onClick={() => navigate("/hospital/auth")}
                        >
                            <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Self Register</div>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Hospital Admin</h3>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                Register your hospital or login to manage your facility, staff, and patients.
                            </p>
                            <ul className="space-y-2 mb-8">
                                {["Register & login your hospital", "Manage staff & patients", "Full dashboard access"].map(i => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-indigo-100">
                                        <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />{i}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center gap-2 font-bold group-hover:gap-4 transition-all duration-200">
                                <LogIn className="w-5 h-5" /> Hospital Portal <ArrowRight className="w-4 h-4 ml-auto" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                            className="relative group bg-white rounded-3xl p-8 border-2 border-slate-100 hover:border-green-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                            onClick={() => navigate("/stafflogin")}
                        >
                            <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">By Invite</div>
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Stethoscope className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 text-slate-800">Staff Login</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                Doctors, nurses, pharmacists and other hospital staff login here with credentials from your admin.
                            </p>
                            <ul className="space-y-2 mb-8">
                                {["Login with admin-issued credentials", "View & manage your patients", "Update records & prescriptions"].map(i => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />{i}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center gap-2 font-bold text-green-600 group-hover:gap-4 transition-all duration-200">
                                <LogIn className="w-5 h-5" /> Staff Portal <ArrowRight className="w-4 h-4 ml-auto" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                            className="relative group bg-white rounded-3xl p-8 border-2 border-slate-100 hover:border-pink-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                            onClick={() => navigate("/patientlogin")}
                        >
                            <div className="absolute top-4 right-4 bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full">By Invite</div>
                            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Heart className="w-8 h-8 text-pink-500" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 text-slate-800">Patient Login</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                Patients registered by your hospital can login here to access their medical records and history.
                            </p>
                            <ul className="space-y-2 mb-8">
                                {["Login with hospital-issued credentials", "View your medical records", "Check prescriptions & appointments"].map(i => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                                        <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0" />{i}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center gap-2 font-bold text-pink-500 group-hover:gap-4 transition-all duration-200">
                                <LogIn className="w-5 h-5" /> Patient Portal <ArrowRight className="w-4 h-4 ml-auto" />
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="mt-10 max-w-5xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4 text-center md:text-left"
                    >
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <BellRing className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-sm text-slate-600">
                            <span className="font-bold text-slate-800">Staff & Patients:</span> You cannot self-register.
                            Your hospital administrator will create your account and send your login credentials via email.
                            Use those credentials to login to your portal above.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-indigo-600 font-semibold mb-2">How It Works</p>
                        <h2 className="text-4xl lg:text-5xl font-black mb-4">Simple 4-step onboarding process</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Register your hospital and start managing patient records in minutes.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        <StepCard step="01" icon={<Building2 />} title="Register Your Hospital"
                            desc="Fill out the hospital registration form with your facility details and administrator information." />
                        <StepCard step="02" icon={<ShieldCheck />} title="Super Admin Approval"
                            desc="Our team reviews your application and approves your hospital within 24 hours." />
                        <StepCard step="03" icon={<UserPlus />} title="Setup Your Dashboard"
                            desc="Login to your hospital dashboard, add staff members, and configure departments." />
                        <StepCard step="04" icon={<Activity />} title="Start Managing Patients"
                            desc="Register patients, schedule appointments, and maintain complete medical records." />
                    </div>
                    <div className="relative max-w-4xl mx-auto">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 -translate-y-1/2 hidden lg:block" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                            <FlowCard title="Public Platform"    items={["Hospital Registration", "Hospital Login", "Super Admin Login"]}          color="blue" />
                            <FlowCard title="Super Admin Panel"  items={["Approve Hospitals", "Monitor Activities", "Manage Platform"]}            color="purple" />
                            <FlowCard title="Hospital Dashboard" items={["Patient Management", "Staff & Appointments", "Medical Records"]}         color="green" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ FEATURES ═══════════════════════ */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="text-4xl lg:text-5xl font-black mb-4">Everything your hospital needs</motion.h2>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                            Complete hospital management system with patient records, appointments, staff management, and medical records in one unified platform.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={<Users />}       title="Patient Registration"    color="blue"   desc="Register and manage unlimited patients with complete demographic and medical information." />
                        <FeatureCard icon={<CalendarDays />} title="Appointment Scheduling" color="indigo" desc="Book appointments with doctors, manage schedules, and send automated reminders." />
                        <FeatureCard icon={<FileText />}    title="Medical Records"         color="purple" desc="Store diagnoses, test results, prescriptions, and complete patient medical history securely." />
                        <FeatureCard icon={<UserCog />}     title="Staff Management"        color="green"  desc="Add doctors, nurses, pharmacists, and lab staff with role-based access control." />
                        <FeatureCard icon={<Database />}    title="Data Isolation"          color="red"    desc="Complete data separation between hospitals. Your patient data is yours alone." />
                        <FeatureCard icon={<ShieldCheck />} title="HIPAA Compliant"         color="orange" desc="Enterprise-grade security with encryption, audit logs, and compliance monitoring." />
                        <FeatureCard icon={<BarChart3 />}   title="Analytics & Reports"     color="cyan"   desc="Real-time dashboards showing patient statistics, appointment trends, and operational insights." />
                        <FeatureCard icon={<Pill />}        title="Pharmacy Integration"    color="pink"   desc="Manage prescriptions, track medication dispensing, and monitor pharmacy inventory." />
                        <FeatureCard icon={<Blocks />}      title="Multi-Department Support" color="teal"  desc="Organize your hospital by departments with specialized workflows for each unit." />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ USER ROLES ═══════════════════════ */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-indigo-600 font-semibold mb-2">User Roles</p>
                        <h2 className="text-4xl lg:text-5xl font-black mb-4">Role-based access for everyone</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Different access levels for different users, ensuring data security and operational efficiency.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <RoleCard icon={<Shield />}     title="Super Admin"    color="red"   permissions={["Approve hospital registrations", "Monitor all platform activity", "Suspend/delete hospitals", "Manage system settings"]} />
                        <RoleCard icon={<Building2 />}  title="Hospital Admin" color="blue"  permissions={["Manage hospital profile", "Add/remove staff members", "Register patients", "Full hospital access"]} />
                        <RoleCard icon={<Stethoscope />} title="Doctors & Staff" color="green" permissions={["View assigned patients", "Add medical records", "Manage appointments", "Update prescriptions"]} />
                        <RoleCard icon={<Heart />}      title="Patients"       color="pink"  permissions={["Registered by hospital", "Access medical records", "View appointment history", "Secure patient portal"]} />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ SECURITY ═══════════════════════ */}
            <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <div className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                                <Lock className="w-4 h-4" /><span>Enterprise Security</span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black mb-4">Your data is our priority</h2>
                            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                                Bank-level security with complete data isolation between hospitals.
                            </p>
                        </motion.div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <SecurityFeature icon={<Lock />}       title="End-to-End Encryption" desc="All data encrypted in transit and at rest" />
                        <SecurityFeature icon={<Database />}   title="Data Isolation"         desc="Complete separation of hospital databases" />
                        <SecurityFeature icon={<ShieldCheck />} title="HIPAA Compliant"       desc="Meets all healthcare data regulations" />
                        <SecurityFeature icon={<FileCheck />}  title="Audit Trails"           desc="Complete logging of all system activities" />
                        <SecurityFeature icon={<Users />}      title="Role-Based Access"      desc="Granular permissions for each user type" />
                        <SecurityFeature icon={<Activity />}   title="24/7 Monitoring"        desc="Real-time security threat detection" />
                        <SecurityFeature icon={<Globe />}      title="Automated Backups"      desc="Daily backups with 99.9% uptime SLA" />
                        <SecurityFeature icon={<BellRing />}   title="Instant Alerts"         desc="Security notifications for suspicious activity" />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-indigo-600 font-semibold mb-2">Testimonials</p>
                        <h2 className="text-4xl lg:text-5xl font-black mb-4">Trusted by hospitals worldwide</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Join hundreds of healthcare facilities managing their operations on our platform.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <TestimonialCard quote="This platform transformed how we manage our multi-location hospital network. Patient data is centralized yet completely secure." initials="DR" name="Dr. Rachel Martinez" title="Chief Medical Officer" company="MediCare General Hospital Network" />
                        <TestimonialCard quote="The role-based access system is perfect. Our doctors, nurses, and admin staff each have exactly the permissions they need." initials="JS" name="James Sullivan" title="Hospital Administrator" company="St. Mary's Medical Center" />
                        <TestimonialCard quote="We registered 3 of our hospitals on this platform. The centralized management while maintaining complete data separation is exactly what we needed." initials="AK" name="Dr. Aisha Kamara" title="Director of Operations" company="HealthFirst Clinic Network" />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ CTA ═══════════════════════ */}
            <section className="py-24 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
                <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-4xl lg:text-5xl font-black mb-6">Ready to register your hospital?</h2>
                        <p className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto">
                            Join the growing network of hospitals using our centralized management platform.
                            Get approved and start managing patients within 24 hours.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 mb-12">
                            {["Quick registration", "24-hour approval", "Unlimited patients", "Free migration support"].map(t => (
                                <div key={t} className="flex items-center gap-2 text-indigo-100">
                                    <CheckCircle2 className="w-5 h-5" /><span>{t}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button onClick={() => navigate("/hospital/auth")}
                                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                                Register Your Hospital <ArrowRight className="w-5 h-5" />
                            </button>
                            <button onClick={() => navigate("/hospital/auth")}
                                className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 active:scale-95 transition-all">
                                Hospital Login
                            </button>
                        </div>
                        <div className="mt-8 pt-8 border-t border-indigo-500/30">
                            <button onClick={() => navigate("/superadminlogin")}
                                className="text-indigo-200 hover:text-white text-sm font-medium transition-colors">
                                Super Admin Access →
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════ CONTACT FORM ═══════════════════════ */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-slate-100">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-bold mb-3">Need more information?</h3>
                            <p className="text-slate-600">Contact our team to learn more about the platform and registration process.</p>
                        </div>

                        {submitState === "success" ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCheck className="w-8 h-8 text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">Message Sent!</h4>
                                <p className="text-slate-600 max-w-sm">{submitMsg}</p>
                                <button
                                    onClick={() => setSubmitState("idle")}
                                    className="mt-4 px-6 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                                >
                                    Send another message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                                {submitState === "error" && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{submitMsg}</span>
                                    </motion.div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    {field("hospitalName",      "Hospital Name")}
                                    {field("administratorName", "Administrator Name")}
                                </div>
                                {field("email",       "Email Address", "email")}
                                {field("phone",       "Phone Number",  "tel")}
                                {field("hospitalType", "",             "select")}
                                {field("message",     "Message or Questions", "textarea")}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Sending…</>
                                    ) : (
                                        <><Send className="w-4 h-4" /> Send Message</>
                                    )}
                                </button>

                                <p className="text-xs text-slate-500 text-center">
                                    By submitting, you agree to our Privacy Policy and Terms of Service.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ═══════════════════════ FORM HELPERS ═══════════════════════ */
function inputCls(hasError) {
    return [
        "w-full px-4 py-3 border rounded-lg text-slate-800 placeholder-slate-400",
        "focus:outline-none focus:ring-2 transition-all",
        hasError
            ? "border-red-400 focus:ring-red-200 bg-red-50"
            : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-400",
    ].join(" ");
}

function FieldWrapper({ children, error }) {
    return <div className="flex flex-col">{children}</div>;
}

/* ═══════════════════════ SHARED COMPONENTS ═══════════════════════ */
function StatBox({ label, value }) {
    return (
        <div className="text-center">
            <p className="text-3xl font-black text-slate-800 mb-1">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color = "indigo" }) {
    const colorClasses = {
        blue:   "bg-blue-100 text-blue-600 group-hover:bg-blue-600",
        indigo: "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600",
        purple: "bg-purple-100 text-purple-600 group-hover:bg-purple-600",
        green:  "bg-green-100 text-green-600 group-hover:bg-green-600",
        red:    "bg-red-100 text-red-600 group-hover:bg-red-600",
        orange: "bg-orange-100 text-orange-600 group-hover:bg-orange-600",
        cyan:   "bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600",
        pink:   "bg-pink-100 text-pink-600 group-hover:bg-pink-600",
        teal:   "bg-teal-100 text-teal-600 group-hover:bg-teal-600",
    };
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 group cursor-default">
            <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-6 group-hover:text-white transition-all duration-300`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function StepCard({ step, icon, title, desc }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 font-black text-xl mb-4">
                {React.cloneElement(icon, { size: 28 })}
            </div>
            <div className="absolute top-0 right-0 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                {step}
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function FlowCard({ title, items, color }) {
    const colorClasses = {
        blue:   "from-blue-500 to-blue-600",
        purple: "from-purple-500 to-purple-600",
        green:  "from-green-500 to-green-600",
    };
    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className={`bg-gradient-to-br ${colorClasses[color]} text-white px-4 py-2 rounded-lg font-bold text-center mb-4`}>
                {title}
            </div>
            <ul className="space-y-2">
                {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /><span>{item}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

function RoleCard({ icon, title, permissions, color }) {
    const colorClasses = {
        red:  "bg-red-100 text-red-600",
        blue: "bg-blue-100 text-blue-600",
        green:"bg-green-100 text-green-600",
        pink: "bg-pink-100 text-pink-600",
    };
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-800">{title}</h3>
            <ul className="space-y-2">
                {permissions.map((perm, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /><span>{perm}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

function SecurityFeature({ icon, title, desc }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-indigo-500 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-4">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <h4 className="font-bold mb-2">{title}</h4>
            <p className="text-sm text-slate-400">{desc}</p>
        </motion.div>
    );
}

function TestimonialCard({ quote, initials, name, title, company }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
            </div>
            <p className="text-slate-700 mb-6 leading-relaxed italic">"{quote}"</p>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                    {initials}
                </div>
                <div>
                    <p className="font-bold text-slate-800">{name}</p>
                    <p className="text-sm text-slate-600">{title}</p>
                    <p className="text-xs text-slate-500">{company}</p>
                </div>
            </div>
        </motion.div>
    );
}