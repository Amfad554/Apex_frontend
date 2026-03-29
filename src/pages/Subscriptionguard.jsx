import React, { useEffect, useState, createContext, useContext } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ✅ Export this so the dashboard can read it
export const SubscriptionContext = createContext({ status: 'none' });
export const useSubscription = () => useContext(SubscriptionContext);

export default function SubscriptionGuard() {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [subStatus, setSubStatus] = useState('none');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/hospital/auth', { replace: true }); return; }

        fetch(`${API_BASE}/api/subscriptions/status`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => setSubStatus(data.status || 'none'))
            .catch(() => setSubStatus('none'))
            .finally(() => setChecking(false));
    }, []);

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

    // ✅ No redirect — always let them in, just pass the status
    return (
        <SubscriptionContext.Provider value={{ status: subStatus }}>
            <Outlet />
        </SubscriptionContext.Provider>
    );
}