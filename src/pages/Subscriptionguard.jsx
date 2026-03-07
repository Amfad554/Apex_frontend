import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Loader2, ShieldX, Clock, CheckCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * SubscriptionGuard
 * Wraps all hospital dashboard routes.
 * Checks the hospital's subscription status on every mount.
 *
 * - active   → renders the dashboard (Outlet)
 * - pending  → shows a "waiting for activation" screen
 * - none     → redirects to /pricing
 * - expired  → redirects to /pricing
 * - error    → redirects to /pricing (fail safe)
 */
export default function SubscriptionGuard() {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [subStatus, setSubStatus] = useState(null); // null | 'none' | 'pending' | 'active' | 'expired'

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/hospital/auth', { replace: true }); return; }

        fetch(`${API_BASE}/api/subscriptions/status`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => {
                setSubStatus(data.status || 'none');
            })
            .catch(() => setSubStatus('none'))
            .finally(() => setChecking(false));
    }, []);

    // ── Loading ──────────────────────────────────────────────────────────────────
    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4 text-slate-500">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <p className="text-sm font-medium">Checking subscription…</p>
                </div>
            </div>
        );
    }

    // ── No subscription or expired → send to pricing ─────────────────────────────
    if (subStatus === 'none' || subStatus === 'expired') {
        return <Navigate to="/pricing" replace />;
    }

    // ── Pending → show waiting screen ────────────────────────────────────────────
    if (subStatus === 'pending') {
        return <PendingScreen />;
    }

    // ── Active → render the dashboard ────────────────────────────────────────────
    return <Outlet />;
}

/* ─── Pending activation screen ─────────────────────────────────────────────── */
function PendingScreen() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/', { replace: true });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-10 text-center border border-slate-100">

                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-amber-500" />
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-3">
                    Payment Under Review
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    We've received your payment proof and are currently verifying it.
                    Your dashboard will be unlocked once your payment is confirmed —
                    usually within <strong className="text-slate-700">24 hours</strong>.
                </p>

                {/* Steps */}
                <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 mb-6 border border-slate-100">
                    <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700">Payment proof submitted</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        </div>
                        <span className="text-slate-700 font-medium">Verifying your payment…</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                        <span>Dashboard access granted</span>
                    </div>
                </div>

                <p className="text-xs text-slate-400 mb-6">
                    We'll send a confirmation email to your registered address once your account is activated.
                    If it's been more than 24 hours, please contact us.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition text-sm"
                    >
                        Check Again
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 border border-slate-200 text-slate-500 rounded-xl font-medium hover:bg-slate-50 transition text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}