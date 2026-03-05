import { Activity, Twitter, Linkedin, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                                <Activity size={22} className="text-white" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tight">
                                HMS<span className="text-indigo-400">Care</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
                            The complete hospital management platform for healthcare facilities worldwide. 
                            Manage patients, appointments, and medical records from one secure place.
                        </p>
                        <div className="flex gap-3">
                            <a 
                                href="https://twitter.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition"
                            >
                                <Twitter size={18} />
                            </a>
                            <a 
                                href="https://linkedin.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition"
                            >
                                <Linkedin size={18} />
                            </a>
                            <a 
                                href="https://facebook.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition"
                            >
                                <Facebook size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/appointments" className="hover:text-white transition">
                                    Appointments
                                </Link>
                            </li>
                            <li>
                                <Link to="/registration" className="hover:text-white transition">
                                    Patient Registration
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="hover:text-white transition">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Integrations
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Security
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Solutions Links */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Solutions</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    General Hospitals
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Specialty Clinics
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Multi-Branch
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Medical Centers
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Contact Info Bar */}
                <div className="mt-12 pt-8 border-t border-slate-800">
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <Phone size={18} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Emergency Hotline</p>
                                <p className="text-white font-semibold">+1 800-999-0000</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <Mail size={18} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Email Support</p>
                                <p className="text-white font-semibold">support@hmscare.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <MapPin size={18} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Location</p>
                                <p className="text-white font-semibold">123 Medical Plaza, NY</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                        <p>© {new Date().getFullYear()} HMSCare. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition">Privacy</a>
                            <a href="#" className="hover:text-white transition">Terms</a>
                            <a href="#" className="hover:text-white transition">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}