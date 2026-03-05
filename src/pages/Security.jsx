import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Server, 
  FileLock2, 
  UserCheck, 
  RefreshCcw, 
  CheckCircle 
} from 'lucide-react';

const SecurityFeature = ({ icon: Icon, title, description }) => (
  <div className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
      <Icon className="w-6 h-6 text-indigo-600" />
    </div>
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function Security() {
  const securityMeasures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data in transit is encrypted using TLS 1.3, and data at rest is protected using AES-256 encryption standards."
    },
    {
      icon: UserCheck,
      title: "Multi-Factor Authentication",
      description: "Protect your account with an extra layer of security. We support TOTP-based MFA for all hospital administrators."
    },
    {
      icon: EyeOff,
      title: "Data Anonymization",
      description: "For analytics and reporting, we use advanced masking techniques to ensure patient identities remain private."
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description: "Our systems are hosted on AWS with strict VPC configurations, isolated databases, and regular penetration testing."
    },
    {
      icon: FileLock2,
      title: "Role-Based Access (RBAC)",
      description: "Granular permissions ensure that medical staff only see the information necessary for their specific role."
    },
    {
      icon: RefreshCcw,
      title: "Continuous Monitoring",
      description: "Automated systems monitor for suspicious activity 24/7, with instant lockout for unauthorized login attempts."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-slate-900 py-20 px-4 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            Enterprise-Grade Protection
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            Your health data is <br />
            <span className="text-indigo-400">our highest priority.</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Apex-HMS employs a multi-layered security strategy to protect patient records 
            and hospital operations against evolving digital threats.
          </p>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityMeasures.map((measure, index) => (
            <SecurityFeature key={index} {...measure} />
          ))}
        </div>
      </section>

      {/* Compliance Section */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Compliance & Standards</h2>
            <p className="text-slate-600">We align our security practices with international healthcare regulations.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "HIPAA Compliant Architecture",
              "GDPR Data Protection Ready",
              "ISO 27001 Information Security",
              "SOC 2 Type II Certified Data Centers",
              "Regular External Audits",
              "Encrypted Cloud Backups"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-medium">
                <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-indigo-600 text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-6">Trust Apex-HMS with your facility</h2>
        <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
          Want to learn more about our technical security whitepapers? Contact our security team.
        </p>
        <button className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition shadow-xl">
          Contact Security Team
        </button>
      </section>
    </div>
  );
}