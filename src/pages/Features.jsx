import React from 'react';
import {
    ShieldCheck,
    Activity,
    Users,
    Clock,
    ClipboardList,
    Lock,
    Search,
    Bell
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">
            {description}
        </p>
    </div>
);

export default function Features() {
    const features = [
        {
            icon: ShieldCheck,
            title: "Verified Hospitals",
            description: "Every hospital on our platform undergoes a rigorous manual verification process by Super Admins to ensure medical standards.",
            color: "bg-blue-600"
        },
        {
            icon: ClipboardList,
            title: "Digital Records",
            description: "Say goodbye to paper files. Access patient history, lab results, and prescriptions instantly from any authorized device.",
            color: "bg-indigo-600"
        },
        {
            icon: Activity,
            title: "Real-time Analytics",
            description: "Hospital admins can track admission rates, department performance, and resource allocation through visual dashboards.",
            color: "bg-emerald-600"
        },
        {
            icon: Users,
            title: "Patient Management",
            description: "Streamlined registration, appointment scheduling, and communication tools to enhance the patient experience.",
            color: "bg-orange-500"
        },
        {
            icon: Lock,
            title: "Data Security",
            description: "Enterprise-grade encryption for all medical data. We ensure HIPAA-compliant storage and secure access controls.",
            color: "bg-slate-800"
        },
        {
            icon: Bell,
            title: "Smart Notifications",
            description: "Automated reminders for follow-ups, prescription refills, and critical updates for both doctors and patients.",
            color: "bg-rose-500"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-white py-20 px-4 border-b border-slate-100">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-4">
                        Advanced Capabilities
                    </h2>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                        Everything you need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            manage healthcare modernly
                        </span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Apex-HMS provides a unified platform for hospitals to optimize operations
                        and for patients to take control of their health journey.
                    </p>
                </div>
            </section>

            {/* Grid Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto bg-indigo-600 rounded-3xl p-12 text-center text-white shadow-xl shadow-indigo-200">
                    <h2 className="text-3xl font-bold mb-6">Ready to transform your hospital?</h2>
                    <p className="text-indigo-100 mb-8 text-lg max-w-xl mx-auto">
                        Join our network today and get your medical facility verified in less than 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition">
                            Register Hospital
                        </button>
                        <button className="px-8 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-400 transition border border-indigo-400">
                            View Demo
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}