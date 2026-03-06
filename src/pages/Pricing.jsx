import React, { useState } from 'react';
import {
  Check, HelpCircle, Zap, Building, Building2, Globe,
  X, Loader2, AlertCircle, CheckCheck, Send, Mail,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ─── Plans ─────────────────────────────────────────────────────────────────── */
const TIERS = [
  {
    tier: 'Clinic',
    planKey: 'clinic',
    price: '4,900',
    currency: '₦',
    description: 'Perfect for private practices and small specialized clinics.',
    icon: Building,
    features: [
      'Up to 5 Medical Staff',
      '1,000 Patient Records',
      'Basic Prescription Module',
      'Email Support',
      'Standard Analytics',
    ],
  },
  {
    tier: 'Professional',
    planKey: 'professional',
    price: '19,900',
    currency: '₦',
    description: 'Comprehensive solution for mid-sized hospitals.',
    icon: Building2,
    highlighted: true,
    features: [
      'Unlimited Medical Staff',
      'Unlimited Patient Records',
      'Advanced Pharmacy & Lab Sync',
      '24/7 Priority Support',
      'Role-Based Access Control',
      'Inventory Management',
    ],
  },
  {
    tier: 'Enterprise',
    planKey: 'enterprise',
    price: '49,900',
    currency: '₦',
    description: 'For hospital chains requiring multi-branch synchronization.',
    icon: Globe,
    features: [
      'Multiple Branch Support',
      'Custom API Integration',
      'Dedicated Account Manager',
      'White-label Patient Portal',
      'On-premise Deployment Option',
      'Audit Logs & Compliance Export',
    ],
  },
];

/* ─── Subscribe / Contact Modal ─────────────────────────────────────────────── */
function SubscribeModal({ plan, onClose }) {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();

  const [form, setForm] = useState({
    name:     storedUser?.adminName     || '',
    email:    storedUser?.email         || '',
    hospital: storedUser?.hospitalName  || '',
    phone:    '',
    message:  plan.planKey !== 'custom'
      ? `I'd like to subscribe to the ${plan.tier} plan (${plan.currency}${plan.price}/month).`
      : "I'm interested in a custom plan for my facility.",
  });
  const [submitting, setSub] = useState(false);
  const [status, setStatus]  = useState('idle');
  const [errMsg, setErrMsg]  = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    setSub(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalName:      form.hospital || 'Not specified',
          administratorName: form.name,
          email:             form.email,
          phone:             form.phone,
          hospitalType:      plan.planKey,
          message:           form.message,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Submission failed.');
      setStatus('success');
    } catch (err) {
      setErrMsg(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    } finally {
      setSub(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 text-slate-800 placeholder-slate-400 text-sm transition bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative my-8">
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition">
          <X size={18} />
        </button>

        {status === 'success' ? (
          <div className="flex flex-col items-center py-8 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Request Received!</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              We've received your request for the{' '}
              <span className="font-semibold text-indigo-600">{plan.tier} plan</span>.
              Our team will contact you within <span className="font-semibold">24 hours</span>.
            </p>
            <div className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-left text-sm text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800 mb-1">What happens next?</p>
              <p>✅ We review your request</p>
              <p>✅ We send you an activation email</p>
              <p>✅ You get full access within 24 hours</p>
              <p>✅ Payment is arranged via invoice</p>
            </div>
            <button onClick={onClose}
              className="mt-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition text-sm">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              {plan.planKey !== 'custom' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 bg-indigo-100 text-indigo-700">
                  {plan.tier} Plan · {plan.currency}{plan.price}/month
                </div>
              )}
              <h2 className="text-2xl font-bold text-slate-900">
                {plan.planKey === 'custom' ? 'Contact Sales' : 'Activate Your Plan'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Fill in your details and our team will set you up within 24 hours.
                {plan.planKey !== 'custom' && ' Payment is arranged via invoice — no card needed now.'}
              </p>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Full Name *</label>
                  <input required placeholder="Administrator name" value={form.name}
                    onChange={e => set('name', e.target.value)} className={inputCls} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Phone Number *</label>
                  <input required type="tel" placeholder="+234 800 000 0000" value={form.phone}
                    onChange={e => set('phone', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Email Address *</label>
                <input required type="email" placeholder="admin@yourhospital.com" value={form.email}
                  onChange={e => set('email', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Hospital Name</label>
                <input placeholder="Your hospital's name" value={form.hospital}
                  onChange={e => set('hospital', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Message</label>
                <textarea rows={3} value={form.message}
                  onChange={e => set('message', e.target.value)} className={inputCls} />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                {submitting
                  ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                  : <><Send size={14} /> {plan.planKey === 'custom' ? 'Send Message' : 'Request Activation'}</>}
              </button>

              {plan.planKey !== 'custom' && (
                <p className="text-xs text-slate-400 text-center">
                  No payment required now. We'll send an invoice after account setup.
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Pricing Card ──────────────────────────────────────────────────────────── */
function PricingCard({ tier, planKey, price, currency, description, features, icon: Icon, highlighted, onSelect }) {
  return (
    <div className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col ${
      highlighted
        ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100 scale-105 z-10'
        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md'
    }`}>
      {highlighted && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap">
          Most Popular
        </span>
      )}
      <div className="mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
          highlighted ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          <Icon size={24} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{tier}</h3>
        <p className="text-slate-500 mt-2 text-sm">{description}</p>
      </div>
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-slate-400">{currency}</span>
          <span className="text-4xl font-black text-slate-900">{price}</span>
          <span className="text-slate-500 font-medium">/month</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Billed via invoice · No card required upfront</p>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
            <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check size={12} className="text-emerald-600" />
            </div>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelect({ tier, planKey, price, currency })}
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          highlighted
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
            : 'bg-white border border-slate-200 text-slate-800 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
        }`}
      >
        Get Started
      </button>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function Pricing() {
  const [selectedPlan, setSelectedPlan]     = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-4">Pricing Plans</h2>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Scalable solutions for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
              every healthcare facility.
            </span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Transparent pricing with no hidden fees. Choose a plan, submit your details,
            and we'll activate your account within 24 hours.
          </p>

          {/* How it works */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            {[
              { step: '1', label: 'Choose your plan' },
              { step: '2', label: 'Submit your details' },
              { step: '3', label: 'We activate within 24h' },
              { step: '4', label: 'Pay via invoice' },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {step}
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {TIERS.map(tier => (
            <PricingCard key={tier.planKey} {...tier} onSelect={setSelectedPlan} />
          ))}
        </div>
      </section>

      {/* Custom plan CTA */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center md:justify-start gap-2">
                <HelpCircle className="text-indigo-400" /> Need a custom plan?
              </h2>
              <p className="text-slate-400">
                Non-profit or government-run facility? Contact us for specialized subsidized pricing.
              </p>
            </div>
            <button onClick={() => setShowContactModal(true)}
              className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 transition rounded-xl font-bold flex-shrink-0">
              Contact Sales
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 opacity-40">
          {[
            { icon: <Zap size={18} />, label: 'Reliable' },
            { icon: <Check size={18} />, label: 'Secure' },
            { icon: <Building2 size={18} />, label: 'Scalable' },
            { icon: <Mail size={18} />, label: '24h Activation' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-widest text-sm">
              {icon} {label}
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
      {selectedPlan && (
        <SubscribeModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
      {showContactModal && (
        <SubscribeModal
          plan={{ tier: 'Custom', planKey: 'custom', price: 'TBD', currency: '' }}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
}