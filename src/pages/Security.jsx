/**
 * Security.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Public "Security" page for Apex-HMS.
 *
 * Sections:
 *   1. Hero              – headline and tagline
 *   2. Feature Grid      – six SecurityFeature cards (encryption, MFA, RBAC…)
 *   3. Compliance Block  – list of standards / certifications
 *   4. CTA               – dark navy banner with a "Contact Security Team" button
 *
 * This is a purely presentational page — no API calls, no state.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import {
    ShieldCheck, Lock, EyeOff, Server,
    FileLock2, UserCheck, RefreshCcw, CheckCircle,
} from 'lucide-react';

// ─── Brand colour tokens ──────────────────────────────────────────────────────
const C = {
    navy:      '#0A1A3F',
    softNavy:  '#1F2A44',
    orange:    '#FF5A1F',
    lightGray: '#F5F7FA',
};


// ─── Security Feature Card ────────────────────────────────────────────────────
/**
 * Single card in the security feature grid.
 * Alternates between orange and navy icon backgrounds based on `index` parity
 * to add visual rhythm across the grid.
 *
 * Props:
 *   icon        – Lucide icon component
 *   title       – feature heading
 *   description – two-sentence description
 *   index       – position in the list; used for alternating colour
 */
const SecurityFeature = ({ icon: Icon, title, description, index }) => (
    <div
        style={{
            display: 'flex', gap: 16, padding: 24,
            background: '#fff',
            border: '1px solid rgba(10,26,63,0.08)',
            borderRadius: 20,
            boxShadow: '0 2px 12px rgba(10,26,63,0.05)',
            transition: 'box-shadow 0.2s, transform 0.2s',
            cursor: 'default',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(10,26,63,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(10,26,63,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
        {/* Icon badge – alternates orange vs navy tint based on card position */}
        <div style={{
            flexShrink: 0, width: 48, height: 48,
            background: index % 2 === 0 ? `${C.orange}15` : `${C.navy}08`,
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon size={22} color={index % 2 === 0 ? C.orange : C.navy} />
        </div>

        <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: C.navy, margin: '0 0 6px' }}>{title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7a99', lineHeight: 1.7, margin: 0 }}>{description}</p>
        </div>
    </div>
);


// ─── Main Security Component ──────────────────────────────────────────────────
export default function Security() {

    /**
     * Security feature card data.
     * Defined here so it's easy to add/remove features without touching the JSX.
     */
    const securityMeasures = [
        {
            icon: Lock,
            title: "End-to-End Encryption",
            description: "All data in transit is encrypted using TLS 1.3, and data at rest is protected using AES-256 encryption standards.",
        },
        {
            icon: UserCheck,
            title: "Multi-Factor Authentication",
            description: "Protect your account with an extra layer of security. We support TOTP-based MFA for all hospital administrators.",
        },
        {
            icon: EyeOff,
            title: "Data Anonymization",
            description: "For analytics and reporting, we use advanced masking techniques to ensure patient identities remain private.",
        },
        {
            icon: Server,
            title: "Secure Infrastructure",
            description: "Our systems are hosted on AWS with strict VPC configurations, isolated databases, and regular penetration testing.",
        },
        {
            icon: FileLock2,
            title: "Role-Based Access (RBAC)",
            description: "Granular permissions ensure that medical staff only see the information necessary for their specific role.",
        },
        {
            icon: RefreshCcw,
            title: "Continuous Monitoring",
            description: "Automated systems monitor for suspicious activity 24/7, with instant lockout for unauthorized login attempts.",
        },
    ];

    /** Compliance certifications shown in the bottom compliance block */
    const compliance = [
        "HIPAA Compliant Architecture",
        "GDPR Data Protection Ready",
        "ISO 27001 Information Security",
        "SOC 2 Type II Certified Data Centers",
        "Regular External Audits",
        "Encrypted Cloud Backups",
    ];


    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: C.lightGray, fontFamily: "'Georgia', serif" }}>

            {/* ── Hero section ── */}
            <section style={{
                padding: '80px 24px 64px',
                background: `linear-gradient(180deg, ${C.lightGray} 0%, #fff 100%)`,
                textAlign: 'center',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Orange top accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${C.orange}, transparent)` }} />

                {/* Decorative blurred blobs — purely visual */}
                <div style={{ position: 'absolute', top: -80, right: '10%', width: 280, height: 280, background: `radial-gradient(circle, ${C.orange}10 0%, transparent 70%)`, borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -40, left: '5%', width: 200, height: 200, background: `radial-gradient(circle, ${C.navy}06 0%, transparent 70%)`, borderRadius: '50%' }} />

                <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
                    {/* Eyebrow pill */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '7px 18px', background: `${C.orange}15`, borderRadius: 24,
                        color: C.orange, fontSize: '0.72rem', fontWeight: 800,
                        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24,
                    }}>
                        <ShieldCheck size={14} /> Enterprise-Grade Protection
                    </div>

                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: C.navy, margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-1px' }}>
                        Your health data is<br />
                        <span style={{ color: C.orange }}>our highest priority.</span>
                    </h1>

                    <p style={{ color: '#6b7a99', maxWidth: 560, margin: '0 auto', fontSize: '1rem', lineHeight: 1.75 }}>
                        Apex-HMS employs a multi-layered security strategy to protect patient records
                        and hospital operations against evolving digital threats.
                    </p>
                </div>
            </section>


            {/* ── Security features grid ── */}
            <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    {securityMeasures.map((measure, index) => (
                        <SecurityFeature key={index} {...measure} index={index} />
                    ))}
                </div>
            </section>


            {/* ── Compliance & standards block ── */}
            <section style={{ padding: '0 24px 72px', maxWidth: 860, margin: '0 auto' }}>
                <div style={{
                    background: '#fff',
                    border: `1px solid rgba(10,26,63,0.08)`,
                    borderRadius: 28, padding: '48px 40px',
                    boxShadow: '0 4px 24px rgba(10,26,63,0.07)',
                    borderTop: `4px solid ${C.orange}`,  // orange accent stripe
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.navy, margin: '0 0 10px' }}>
                            Compliance & Standards
                        </h2>
                        <p style={{ color: '#6b7a99', fontSize: '0.9rem', margin: 0 }}>
                            We align our security practices with international healthcare regulations.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                        {compliance.map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '14px 18px',
                                background: C.lightGray,
                                border: '1px solid rgba(10,26,63,0.07)',
                                borderRadius: 14,
                                fontSize: '0.875rem', fontWeight: 700, color: C.softNavy,
                            }}>
                                <CheckCircle size={18} color={C.orange} style={{ flexShrink: 0 }} />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ── Bottom CTA ── */}
            <section style={{
                padding: '72px 24px',
                background: `linear-gradient(135deg, ${C.navy} 0%, ${C.softNavy} 100%)`,
                textAlign: 'center',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative orange glow */}
                <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: `${C.orange}12`, borderRadius: '50%', filter: 'blur(50px)' }} />

                <div style={{ position: 'relative' }}>
                    <div style={{ width: 56, height: 56, background: `${C.orange}20`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <ShieldCheck size={26} color={C.orange} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
                        Trust Apex-HMS with your facility
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 auto 32px', maxWidth: 460, fontSize: '0.95rem', lineHeight: 1.7 }}>
                        Want to learn more about our technical security whitepapers? Contact our security team.
                    </p>
                    <button
                        style={{ padding: '14px 36px', background: C.orange, color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: `0 8px 28px ${C.orange}50`, transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e04e18'}
                        onMouseLeave={e => e.currentTarget.style.background = C.orange}
                    >
                        Contact Security Team
                    </button>
                </div>
            </section>
        </div>
    );
} 