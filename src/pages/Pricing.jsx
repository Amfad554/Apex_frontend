import React, { useState } from 'react';
import {
  Check, HelpCircle, Zap, Building2,
  X, Loader2, AlertCircle, CheckCheck, Send, Mail,
  Copy, CopyCheck, Landmark, Upload,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const C = {
  navy:      '#0A1A3F',
  softNavy:  '#1F2A44',
  orange:    '#FF5A1F',
  lightGray: '#F5F7FA',
};

const BANK = {
  name:    'OPay',
  number:  '7078431645',
  account: 'Chiamaka George Favour',
};

const PROFESSIONAL = {
  tier: 'Professional', planKey: 'professional', price: '19,900', rawPrice: 19900, currency: '₦',
  description: 'Comprehensive solution for mid-sized hospitals.',
  icon: Building2,
  features: [
    'Unlimited Medical Staff', 'Unlimited Patient Records',
    'Advanced Pharmacy & Lab Sync', '24/7 Priority Support',
    'Role-Based Access Control', 'Inventory Management',
  ],
};

/* ── helpers ── */
const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: '12px',
  border: '1px solid rgba(10,26,63,0.15)', outline: 'none',
  fontSize: '0.875rem', color: C.navy, background: '#fff',
  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit',
};
const focusInput  = e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}22`; };
const blurInput   = e => { e.target.style.borderColor = 'rgba(10,26,63,0.15)'; e.target.style.boxShadow = 'none'; };

function Label({ children }) {
  return <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7a99', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</p>;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: copied ? '#6ee7a0' : 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s' }}>
      {copied ? <CopyCheck size={14} /> : <Copy size={14} />}
    </button>
  );
}

/* ── Payment Modal ── */
function PaymentModal({ plan, onClose }) {
  const [step, setStep] = useState(1);
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  const [form, setForm] = useState({ name: storedUser?.adminName || '', email: storedUser?.email || '', hospital: storedUser?.hospitalName || '', phone: '', reference: '', screenshot: null });
  const [preview, setPreview] = useState(null);
  const [submitting, setSub] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set('screenshot', file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.reference || !form.screenshot) {
      setErrMsg('Please fill all fields and upload your payment screenshot.');
      setStatus('error'); return;
    }
    setSub(true); setErrMsg(''); setStatus('idle');
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(form.screenshot);
      });
      const res = await fetch(`${API_BASE}/api/payments/proof`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.tier, planKey: plan.planKey, amount: `${plan.currency}${plan.price}`, name: form.name, email: form.email, hospital: form.hospital || 'Not specified', phone: form.phone, reference: form.reference, screenshotBase64: base64, screenshotName: form.screenshot.name }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Submission failed.');
      setStatus('success');
    } catch (err) { setErrMsg(err.message || 'Something went wrong. Please try again.'); setStatus('error'); }
    finally { setSub(false); }
  };

  const overlay = { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '64px 16px 16px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', overflowY: 'auto' };
  const card    = { background: '#fff', borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.25)', width: '100%', maxWidth: 480, padding: '36px 32px', position: 'relative', margin: '0 auto 32px' };

  return (
    <div style={overlay}>
      <div style={card}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', border: 'none', background: C.lightGray, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7a99' }}><X size={16} /></button>

        {status === 'success' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', textAlign: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${C.orange}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCheck size={28} color={C.orange} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: C.navy, margin: 0 }}>Proof Submitted!</h3>
            <p style={{ color: '#6b7a99', fontSize: '0.875rem', maxWidth: 280, margin: 0 }}>
              We've received your payment proof for the <strong style={{ color: C.orange }}>{plan.tier} plan</strong>. Your account will be activated within <strong>24 hours</strong>.
            </p>
            <div style={{ width: '100%', background: C.lightGray, border: `1px solid rgba(10,26,63,0.08)`, borderRadius: 16, padding: '16px 20px', textAlign: 'left', fontSize: '0.84rem', color: '#4b5563', lineHeight: 1.8, borderLeft: `3px solid ${C.orange}` }}>
              <p style={{ fontWeight: 700, color: C.navy, marginBottom: 8 }}>What happens next?</p>
              {['We verify your payment', 'We activate your hospital account', 'You receive a confirmation email within 24 hours', 'Login and start managing your hospital'].map((s, i) => (
                <p key={i} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Check size={13} color={C.orange} /> {s}</p>
              ))}
            </div>
            <button onClick={onClose} style={{ padding: '12px 32px', background: C.orange, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Done</button>
          </div>

        ) : step === 1 ? (
          <>
            <div style={{ marginBottom: 24 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${C.orange}18`, color: C.orange, fontSize: '0.75rem', fontWeight: 700, marginBottom: 10 }}>
                {plan.tier} Plan · {plan.currency}{plan.price}/month
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.navy, margin: '0 0 6px' }}>Make Your Transfer</h2>
              <p style={{ color: '#6b7a99', fontSize: '0.875rem', margin: 0 }}>
                Send exactly <strong style={{ color: C.navy }}>{plan.currency}{plan.price}</strong> to the account below, then click "I've Paid".
              </p>
            </div>

            {/* Bank card */}
            <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.softNavy} 100%)`, borderRadius: 20, padding: 24, color: '#fff', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Landmark size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Bank Details</p>
                  <p style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>{BANK.name}</p>
                </div>
              </div>
              {[
                { label: 'Account Number', value: BANK.number, large: true },
                { label: 'Account Name', value: BANK.account },
                { label: 'Amount to Transfer', value: `${plan.currency}${plan.price}`, large: true, copyVal: String(plan.rawPrice) },
              ].map(({ label, value, large, copyVal }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', marginBottom: 10 }}>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <p style={{ fontWeight: 800, fontSize: large ? '1.4rem' : '1rem', margin: 0, letterSpacing: large ? '0.08em' : 0 }}>{value}</p>
                    <CopyButton text={copyVal || value} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff8f5', border: `1px solid ${C.orange}40`, borderRadius: 12, padding: '12px 16px', fontSize: '0.82rem', color: '#92400e', marginBottom: 20 }}>
              ⚠️ After transferring, take a <strong>screenshot of your receipt</strong> — you'll need it in the next step.
            </div>

            <button onClick={() => setStep(2)} style={{ width: '100%', padding: '14px', background: C.orange, color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 6px 20px ${C.orange}40` }}>
              I've Paid — Submit Proof <Check size={16} />
            </button>
          </>

        ) : (
          <>
            <button onClick={() => setStep(1)} style={{ fontSize: '0.78rem', color: C.orange, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12 }}>← Back to bank details</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.navy, margin: '0 0 6px' }}>Submit Payment Proof</h2>
            <p style={{ color: '#6b7a99', fontSize: '0.875rem', margin: '0 0 20px' }}>Fill in your details and upload your screenshot.</p>

            {status === 'error' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', fontSize: '0.82rem', color: '#b91c1c', marginBottom: 16 }}>
                <AlertCircle size={15} /> {errMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <Label>Full Name *</Label>
                  <input required placeholder="Administrator name" value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <input required type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>
              </div>
              <div><Label>Email Address *</Label><input required type="email" placeholder="admin@yourhospital.com" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
              <div><Label>Hospital Name</Label><input placeholder="Your hospital's name" value={form.hospital} onChange={e => set('hospital', e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
              <div><Label>Payment Reference / Transaction ID *</Label><input required placeholder="e.g. OPY20240315123456" value={form.reference} onChange={e => set('reference', e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>

              <div>
                <Label>Payment Screenshot *</Label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', border: `2px dashed ${preview ? C.orange : 'rgba(10,26,63,0.15)'}`, borderRadius: 14, cursor: 'pointer', background: preview ? `${C.orange}08` : C.lightGray, transition: 'all 0.2s', overflow: 'hidden' }}>
                  {preview ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <img src={preview} alt="Payment screenshot" style={{ width: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 12, padding: 8 }} />
                      <span style={{ position: 'absolute', bottom: 10, right: 10, background: '#16a34a', color: '#fff', fontSize: '0.7rem', padding: '3px 10px', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={10} /> Uploaded
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', color: '#94a3b8' }}>
                      <Upload size={26} style={{ marginBottom: 8 }} />
                      <p style={{ fontSize: '0.84rem', fontWeight: 700, margin: '0 0 4px' }}>Click to upload screenshot</p>
                      <p style={{ fontSize: '0.72rem', margin: 0 }}>PNG, JPG, JPEG (max 5MB)</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                </label>
              </div>

              <button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', background: submitting ? '#c74410' : C.orange, color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 6px 20px ${C.orange}40`, marginTop: 4 }}>
                {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : <><Send size={14} /> Submit Payment Proof</>}
              </button>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', margin: 0 }}>We'll verify your payment and activate your account within 24 hours.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Contact Modal ── */
function ContactModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', hospital: '', phone: '', message: "I'm interested in a custom plan for my facility." });
  const [submitting, setSub] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    setSub(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalName: form.hospital || 'Not specified', administratorName: form.name, email: form.email, phone: form.phone, hospitalType: 'custom', message: form.message }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Submission failed.');
      setStatus('success');
    } catch (err) { setErrMsg(err.message || 'Something went wrong.'); setStatus('error'); }
    finally { setSub(false); }
  };

  const overlay = { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '64px 16px 16px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', overflowY: 'auto' };
  const card    = { background: '#fff', borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.25)', width: '100%', maxWidth: 480, padding: '36px 32px', position: 'relative', margin: '0 auto 32px' };

  return (
    <div style={overlay}>
      <div style={card}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', border: 'none', background: C.lightGray, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7a99' }}><X size={16} /></button>

        {status === 'success' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', textAlign: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${C.orange}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCheck size={28} color={C.orange} /></div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: C.navy, margin: 0 }}>Message Sent!</h3>
            <p style={{ color: '#6b7a99', fontSize: '0.875rem', margin: 0 }}>Our sales team will reach out within 24 hours.</p>
            <button onClick={onClose} style={{ padding: '12px 32px', background: C.orange, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Done</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.navy, margin: '0 0 4px' }}>Contact Sales</h2>
            <p style={{ color: '#6b7a99', fontSize: '0.875rem', margin: '0 0 24px' }}>Need a custom plan? Tell us about your facility.</p>
            {status === 'error' && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', fontSize: '0.82rem', color: '#b91c1c', marginBottom: 16 }}><AlertCircle size={15} /> {errMsg}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><Label>Full Name *</Label><input required placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
                <div><Label>Phone *</Label><input required type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
              </div>
              <div><Label>Email *</Label><input required type="email" placeholder="admin@yourhospital.com" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
              <div><Label>Hospital Name</Label><input placeholder="Your hospital's name" value={form.hospital} onChange={e => set('hospital', e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
              <div><Label>Message</Label><textarea rows={3} value={form.message} onChange={e => set('message', e.target.value)} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={focusInput} onBlur={blurInput} /></div>
              <button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', background: submitting ? '#c74410' : C.orange, color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 6px 20px ${C.orange}40` }}>
                {submitting ? <><Loader2 size={16} /> Sending…</> : <><Send size={14} /> Send Message</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Pricing Page ── */
export default function Pricing() {
  const [selectedPlan, setSelectedPlan]     = useState(null);
  const [showContactModal, setShowContact]  = useState(false);
  const plan = PROFESSIONAL;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Georgia', serif" }}>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', background: `linear-gradient(180deg, ${C.lightGray} 0%, #fff 100%)`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Top orange accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${C.orange}, transparent)` }} />

        <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.orange, marginBottom: 16 }}>Pricing Plan</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: C.navy, margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-1px' }}>
          One powerful plan for<br />
          <span style={{ color: C.orange }}>every healthcare facility.</span>
        </h1>
        <p style={{ color: '#6b7a99', maxWidth: 520, margin: '0 auto 40px', fontSize: '1rem', lineHeight: 1.7 }}>
          Transparent pricing with no hidden fees. Pay via bank transfer and get activated within 24 hours.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 28px' }}>
          {[
            { step: '1', label: 'Choose your plan' },
            { step: '2', label: 'Transfer to our account' },
            { step: '3', label: 'Submit payment proof' },
            { step: '4', label: 'Activated within 24h' },
          ].map(({ step, label }) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#4b5563' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: C.navy, color: '#fff', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step}</div>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Plan Card */}
      <section style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          position: 'relative', width: '100%', maxWidth: 380,
          background: '#fff',
          border: `2px solid ${C.navy}`,
          borderRadius: 28,
          padding: 36,
          boxShadow: `0 20px 60px rgba(10,26,63,0.12)`,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Badge */}
          <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', background: C.orange, color: '#fff', padding: '5px 20px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: `0 4px 14px ${C.orange}50` }}>
            Most Popular
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, background: C.navy, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Building2 size={22} color="#fff" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.navy, margin: '0 0 8px' }}>{plan.tier}</h3>
            <p style={{ color: '#6b7a99', fontSize: '0.875rem', margin: 0 }}>{plan.description}</p>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#94a3b8' }}>{plan.currency}</span>
              <span style={{ fontSize: '2.8rem', fontWeight: 900, color: C.navy, lineHeight: 1 }}>{plan.price}</span>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>/month</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pay via bank transfer · Activated within 24h</p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `${C.navy}10`, marginBottom: 24 }} />

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {plan.features.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: '#374151' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${C.orange}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color={C.orange} />
                </div>
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setSelectedPlan({ tier: plan.tier, planKey: plan.planKey, price: plan.price, rawPrice: plan.rawPrice, currency: plan.currency })}
            style={{ width: '100%', padding: '15px', background: C.orange, color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: `0 8px 24px ${C.orange}45`, transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e04e18'}
            onMouseLeave={e => e.currentTarget.style.background = C.orange}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Custom CTA */}
      <section style={{ padding: '0 24px 80px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.softNavy} 100%)`, borderRadius: 28, padding: '40px 48px', color: '#fff', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, background: `${C.orange}15`, borderRadius: '50%', filter: 'blur(40px)' }} />
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={20} color={C.orange} /> Need a custom plan?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
              Non-profit or government-run facility? Contact us for specialized subsidized pricing.
            </p>
          </div>
          <button onClick={() => setShowContact(true)}
            style={{ padding: '12px 28px', background: C.orange, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', flexShrink: 0, boxShadow: `0 6px 20px ${C.orange}50`, position: 'relative' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e04e18'}
            onMouseLeave={e => e.currentTarget.style.background = C.orange}
          >
            Contact Sales
          </button>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ padding: '28px 24px', borderTop: '1px solid rgba(10,26,63,0.08)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 40px' }}>
          {[{ icon: <Zap size={16} />, label: 'Reliable' }, { icon: <Check size={16} />, label: 'Secure' }, { icon: <Building2 size={16} />, label: 'Scalable' }, { icon: <Mail size={16} />, label: '24h Activation' }].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 800, color: 'rgba(10,26,63,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {icon} {label}
            </div>
          ))}
        </div>
      </section>

      {selectedPlan && <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
      {showContactModal && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  );
}