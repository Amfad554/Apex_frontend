import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import {
  Check, HelpCircle, Zap, Building2,
  X, Loader2, AlertCircle, CheckCheck, Send, Mail,
  CreditCard, ShieldCheck, Globe
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const C = {
  navy: '#0A1A3F',
  softNavy: '#1F2A44',
  orange: '#FF5A1F',
  lightGray: '#F5F7FA',
};

const PROFESSIONAL = {
  tier: 'Professional',
  planKey: 'professional',
  price: '19,900',
  rawPrice: 19900,
  currency: '₦',
  description: 'Comprehensive solution for mid-sized hospitals.',
  features: [
    'Unlimited Medical Staff', 'Unlimited Patient Records',
    'Advanced Pharmacy & Lab Sync', '24/7 Priority Support',
    'Role-Based Access Control', 'Inventory Management',
  ],
};

/* ── Payment Modal with Paystack ── */
function PaymentModal({ plan, onClose }) {
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  
  const [email, setEmail] = useState(storedUser?.email || '');
  const [name, setName] = useState(storedUser?.adminName || '');
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [errMsg, setErrMsg] = useState('');

  // Paystack Configuration
  const config = {
    reference: `HMS-${new Date().getTime()}`,
    email: email,
    amount: plan.rawPrice * 100, // Amount in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here',
    metadata: {
      plan: plan.tier,
      hospital: storedUser?.hospitalName || 'Unknown',
      adminName: name
    }
  };

  const initializePayment = usePaystackPayment(config);

  const handleSuccess = (reference) => {
    // 1. You would typically verify this on your backend here
    // fetch(`${API_BASE}/api/payments/verify`, { method: 'POST', body: JSON.stringify(reference) })
    setStatus('success');
  };

  const handleClose = () => {
    console.log('Payment closed');
  };

  const overlay = { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' };
  const card = { background: '#fff', borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.25)', width: '100%', maxWidth: 440, padding: '40px 32px', position: 'relative' };

  return (
    <div style={overlay}>
      <div style={card}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: C.lightGray, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7a99' }}><X size={18} /></button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', py: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCheck size={36} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.navy, margin: '0 0 10px' }}>Payment Received!</h2>
            <p style={{ color: '#6b7a99', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
              Your subscription to the <strong>{plan.tier} Plan</strong> is now active. You can now access all professional features.
            </p>
            <button onClick={onClose} style={{ width: '100%', padding: '14px', background: C.navy, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Go to Dashboard</button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 20, background: `${C.orange}12`, color: C.orange, fontSize: '0.75rem', fontWeight: 800, marginBottom: 16, textTransform: 'uppercase' }}>
                Secure Checkout
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: C.navy, margin: 0 }}>Finalize Subscription</h2>
              <p style={{ color: '#6b7a99', fontSize: '0.875rem', marginTop: 8 }}>Get instant access to HMSCare Professional.</p>
            </div>

            <div style={{ background: C.lightGray, borderRadius: 20, padding: '20px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7a99' }}>Selected Plan:</span>
                <span style={{ fontWeight: 700, color: C.navy }}>{plan.tier}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7a99' }}>Total Amount:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: C.orange }}>{plan.currency}{plan.price}</span>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>Email for Receipt</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                placeholder="hospital-admin@example.com"
              />
            </div>

            <button 
              onClick={() => {
                if(!email) return alert("Please enter your email");
                initializePayment(handleSuccess, handleClose);
              }}
              style={{ width: '100%', padding: '16px', background: C.orange, color: '#fff', border: 'none', borderRadius: 16, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: `0 8px 24px ${C.orange}40` }}
            >
              <CreditCard size={20} /> Pay Now
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, color: '#94a3b8' }}>
              <ShieldCheck size={14} />
              <span style={{ fontSize: '0.75rem' }}>Secured by <strong>Paystack</strong></span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Pricing Page ── */
export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const plan = PROFESSIONAL;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* Header Section */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', background: `linear-gradient(180deg, ${C.lightGray} 0%, #fff 100%)` }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, color: C.navy, marginBottom: 16, letterSpacing: '-1.5px' }}>
          Simple Pricing, <span style={{ color: C.orange }}>Instant Access.</span>
        </h1>
        <p style={{ color: '#6b7a99', maxWidth: 600, margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Experience the full power of HMSCare today. Pay securely with Paystack and your account is activated immediately.
        </p>
      </section>

      {/* Pricing Card Section */}
      <section style={{ padding: '20px 24px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 400, background: '#fff', border: `2px solid ${C.navy}`, borderRadius: 32, padding: '48px 40px', position: 'relative', boxShadow: '0 20px 50px rgba(10,26,63,0.1)' }}>
          <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', background: C.orange, color: '#fff', padding: '6px 20px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Enterprise Ready
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: C.navy, marginBottom: 8 }}>{plan.tier}</h3>
            <p style={{ color: '#6b7a99', fontSize: '0.9rem' }}>{plan.description}</p>
          </div>

          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#94a3b8' }}>{plan.currency}</span>
            <span style={{ fontSize: '3.5rem', fontWeight: 900, color: C.navy }}>{plan.price}</span>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>/month</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {plan.features.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem', color: '#334155' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${C.orange}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} color={C.orange} strokeWidth={3} />
                </div>
                {f}
              </li>
            ))}
          </ul>

          <button 
            onClick={() => setSelectedPlan(plan)}
            style={{ width: '100%', padding: '18px', background: C.navy, color: '#fff', border: 'none', borderRadius: 16, fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 10px 25px rgba(10,26,63,0.2)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Trust Badges */}
      <section style={{ borderTop: '1px solid #f1f5f9', padding: '40px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '30px 60px', opacity: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 700, color: C.navy }}>
            <Globe size={18} /> GLOBAL AVAILABILITY
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 700, color: C.navy }}>
            <ShieldCheck size={18} /> PCI-DSS COMPLIANT
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 700, color: C.navy }}>
            <Zap size={18} /> INSTANT ACTIVATION
          </div>
        </div>
      </section>

      {selectedPlan && <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
}