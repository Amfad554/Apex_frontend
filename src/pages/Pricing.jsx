import React from 'react';
import { Check, HelpCircle, Zap, Building, Building2, Globe } from 'lucide-react';

const PricingCard = ({ tier, price, description, features, icon: Icon, highlighted = false }) => (
  <div className={`relative p-8 rounded-3xl border transition-all duration-300 ${
    highlighted 
      ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100 scale-105 z-10' 
      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
  }`}>
    {highlighted && (
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
        Most Popular
      </span>
    )}
    
    <div className="mb-8">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
        highlighted ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
      }`}>
        <Icon size={24} />
      </div>
      <h3 className="text-2xl font-bold text-slate-900">{tier}</h3>
      <p className="text-slate-500 mt-2 text-sm">{description}</p>
    </div>

    <div className="mb-8">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black text-slate-900">${price}</span>
        <span className="text-slate-500 font-medium">/month</span>
      </div>
    </div>

    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
          <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check size={12} className="text-emerald-600" />
          </div>
          {feature}
        </li>
      ))}
    </ul>

    <button className={`w-full py-3 rounded-xl font-bold transition-colors ${
      highlighted 
        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
        : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50'
    }`}>
      Get Started
    </button>
  </div>
);

export default function Pricing() {
  const tiers = [
    {
      tier: "Clinic",
      price: "49",
      description: "Perfect for private practices and small specialized clinics.",
      icon: Building,
      features: [
        "Up to 5 Medical Staff",
        "1,000 Patient Records",
        "Basic Prescription Module",
        "Email Support",
        "Standard Analytics"
      ]
    },
    {
      tier: "Professional",
      price: "199",
      description: "Comprehensive solution for mid-sized hospitals.",
      icon: Building2,
      highlighted: true,
      features: [
        "Unlimited Medical Staff",
        "Unlimited Patient Records",
        "Advanced Pharmacy & Lab Sync",
        "24/7 Priority Support",
        "Role-Based Access Control",
        "Inventory Management"
      ]
    },
    {
      tier: "Enterprise",
      price: "499",
      description: "For hospital chains requiring multi-branch synchronization.",
      icon: Globe,
      features: [
        "Multiple Branch Support",
        "Custom API Integration",
        "Dedicated Account Manager",
        "White-label Patient Portal",
        "On-premise Deployment Option",
        "Audit Logs & Compliance Export"
      ]
    }
  ];

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
            Transparent pricing with no hidden fees. Choose a plan that fits your current needs and scale as your hospital grows.
          </p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <PricingCard key={index} {...tier} />
          ))}
        </div>
      </section>

      {/* FAQ Sneak Peek */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center md:justify-start gap-2">
                <HelpCircle className="text-indigo-400" />
                Need a custom plan?
              </h2>
              <p className="text-slate-400">
                Are you a non-profit or a government-run facility? Contact us for specialized subsidized pricing options.
              </p>
            </div>
            <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 transition rounded-xl font-bold">
              Contact Sales
            </button>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
          <div className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-widest">
            <Zap size={20} /> Reliable
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-widest">
            <Check size={20} /> Secure
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-widest">
            <Building2 size={20} /> Scalable
          </div>
        </div>
      </section>
    </div>
  );
}