import React, { useState, useEffect } from 'react';
import {
    Users, Search, Plus, Edit, Trash2, X, Save,
    UserPlus, Phone, Mail, MapPin, Calendar, Droplet, User
} from 'lucide-react';

/* ─── Brand Tokens ─────────────────────────────────────────────────────────── */
const ORANGE  = '#FF5A1F';
const ORANGE2 = '#e64d15';

const C = {
    pageBg:    '#F5F7FA',
    card:      '#ffffff',
    border:    'rgba(10,26,63,0.08)',
    text:      '#0A1A3F',
    textSub:   '#374151',
    textMuted: '#6B7280',
    shadow:    '0 2px 12px rgba(10,26,63,0.06)',
};

/* Shared input class */
const INPUT_CLS =
    "w-full py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 transition-all " +
    "focus:ring-orange-200 focus:border-orange-400 placeholder-slate-400 bg-white text-sm";

/* Shared label style */
const LBL = { fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 5 };

export default function PatientManagement() {
    const [patients, setPatients]               = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [searchQuery, setSearchQuery]         = useState('');
    const [showModal, setShowModal]             = useState(false);
    const [modalMode, setModalMode]             = useState('add');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isMobile, setIsMobile]               = useState(false);
    const [formData, setFormData] = useState({
        fullName: '', dateOfBirth: '', gender: '', phone: '', email: '',
        address: '', bloodGroup: '', medicalConditions: '',
        nextOfKinName: '', nextOfKinPhone: ''
    });

    useEffect(() => {
        fetchPatients();
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const user  = JSON.parse(localStorage.getItem('user'));

            if (!user?.id) {
                console.error('No hospital ID found');
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/patients/hospital/${user.id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.ok) {
                const data = await response.json();
                // handle both { patients: [...] } and direct array responses
                setPatients(Array.isArray(data) ? data : (data.patients || []));
            } else {
                console.error('Failed to fetch patients');
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPatient = () => {
        setModalMode('add');
        setFormData({ fullName: '', dateOfBirth: '', gender: '', phone: '', email: '', address: '', bloodGroup: '', medicalConditions: '', nextOfKinName: '', nextOfKinPhone: '' });
        setShowModal(true);
    };

    const handleEditPatient = (patient) => {
        setModalMode('edit');
        setSelectedPatient(patient);
        setFormData({
            fullName: patient.full_name, dateOfBirth: patient.date_of_birth,
            gender: patient.gender, phone: patient.phone, email: patient.email || '',
            address: patient.address, bloodGroup: patient.blood_group || '',
            medicalConditions: patient.medical_conditions || '',
            nextOfKinName: patient.next_of_kin_name || '',
            nextOfKinPhone: patient.next_of_kin_phone || ''
        });
        setShowModal(true);
    };

    const handleDeletePatient = async (patientId, patientName) => {
        if (!window.confirm(`Delete ${patientName}? This cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch(`${import.meta.env.VITE_API_URL}/api/patients/${patientId}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) { alert('Patient deleted'); fetchPatients(); }
            else { const d = await res.json(); alert(`Error: ${d.error}`); }
        } catch (e) { console.error(e); alert('Failed to delete patient'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const user  = JSON.parse(localStorage.getItem('user'));
            const url   = modalMode === 'add'
                ? `${import.meta.env.VITE_API_URL}/api/patients/hospital/${user.id}`
                : `${import.meta.env.VITE_API_URL}/api/patients/${selectedPatient.id}`;
            const res = await fetch(url, {
                method:  modalMode === 'add' ? 'POST' : 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body:    JSON.stringify(formData)
            });
            if (res.ok) {
                alert(modalMode === 'add' ? 'Patient registered!' : 'Patient updated!');
                setShowModal(false); fetchPatients();
            } else { const d = await res.json(); alert(`Error: ${d.error}`); }
        } catch (e) { console.error(e); alert('Failed to save patient'); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const filteredPatients = patients.filter(p =>
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patient_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.phone && p.phone.includes(searchQuery))
    );

    /* ── Loading ── */
    if (loading) return (
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: C.pageBg }}>
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-t-transparent rounded-full mx-auto mb-3 animate-spin"
                    style={{ borderColor: ORANGE, borderTopColor: 'transparent' }} />
                <p style={{ color: C.textSub, fontSize: 13 }}>Loading patients...</p>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: C.pageBg, minHeight: '100vh', padding: isMobile ? '14px 12px' : '24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <div style={{ width: 30, height: 3, borderRadius: 2, background: ORANGE, marginBottom: 8 }} />
                        <h1 style={{ fontSize: isMobile ? 17 : 21, fontWeight: 800, color: C.text, letterSpacing: '-0.3px', marginBottom: 2 }}>
                            Patient Management
                        </h1>
                        <p style={{ fontSize: 12, color: C.textMuted }}>Manage all registered patients</p>
                    </div>
                    <button
                        onClick={handleAddPatient}
                        className="flex items-center gap-1.5 text-white rounded-lg font-semibold transition-all active:scale-95"
                        style={{
                            backgroundColor: ORANGE,
                            boxShadow: '0 4px 14px rgba(255,90,31,0.3)',
                            padding: isMobile ? '8px 12px' : '9px 16px',
                            fontSize: isMobile ? 12 : 13
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = ORANGE2}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ORANGE}
                    >
                        <Plus className="w-4 h-4" />
                        {isMobile ? 'Add' : 'Add Patient'}
                    </button>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'rgba(255,90,31,0.1)' }}>
                                <Users className="w-4 h-4" style={{ color: ORANGE }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1 }}>{patients.length}</p>
                                <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Total Patients</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <UserPlus className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1 }}>
                                    {patients.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length}
                                </p>
                                <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Today</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Search ── */}
                <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, patient number, or phone..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={`${INPUT_CLS} pl-9 pr-4`}
                            style={{ color: C.text }}
                        />
                    </div>
                </div>

                {/* ── Patient List ── */}
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                    {filteredPatients.length === 0 ? (
                        <div className="text-center py-10">
                            <Users className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(10,26,63,0.12)' }} />
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                                {patients.length === 0 ? 'No patients registered yet' : 'No patients found'}
                            </h3>
                            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>
                                {patients.length === 0 ? 'Start by registering your first patient' : 'Try adjusting your search'}
                            </p>
                            {patients.length === 0 && (
                                <button onClick={handleAddPatient}
                                    className="px-4 py-2 text-white rounded-lg font-semibold transition-all active:scale-95 text-xs"
                                    style={{ backgroundColor: ORANGE }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = ORANGE2}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ORANGE}
                                >
                                    Register First Patient
                                </button>
                            )}
                        </div>
                    ) : isMobile ? (

                        /* ════ MOBILE: Card list ════ */
                        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {filteredPatients.map(patient => (
                                <div key={patient.id}
                                    style={{ background: '#FAFBFC', borderRadius: 10, padding: '10px 12px', border: `1px solid ${C.border}` }}>
                                    <div className="flex items-center justify-between gap-2">
                                        {/* Avatar + name */}
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                                                style={{ backgroundColor: '#0A1A3F', fontSize: 11 }}>
                                                {patient.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {patient.full_name}
                                                </p>
                                                <p style={{ fontSize: 10, color: ORANGE, fontFamily: 'monospace', fontWeight: 600 }}>
                                                    {patient.patient_number}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex items-center gap-0.5 flex-shrink-0">
                                            <button onClick={() => handleEditPatient(patient)}
                                                className="p-1.5 rounded-lg transition-colors"
                                                style={{ color: ORANGE }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,90,31,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                            ><Edit className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDeletePatient(patient.id, patient.full_name)}
                                                className="p-1.5 rounded-lg transition-colors"
                                                style={{ color: '#ef4444' }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                            ><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                    {/* Detail row */}
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span style={{ fontSize: 11, color: C.textMuted, textTransform: 'capitalize' }}>{patient.gender}</span>
                                        <span style={{ fontSize: 11, color: C.textMuted }}>·</span>
                                        <span style={{ fontSize: 11, color: C.textMuted }}>{patient.phone}</span>
                                        {patient.blood_group && (
                                            <>
                                                <span style={{ fontSize: 11, color: C.textMuted }}>·</span>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: '#c0392b', backgroundColor: 'rgba(225,29,72,0.07)', padding: '1px 5px', borderRadius: 4 }}>
                                                    {patient.blood_group}
                                                </span>
                                            </>
                                        )}
                                        <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 'auto' }}>
                                            {new Date(patient.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    ) : (

                        /* ════ DESKTOP: Table ════ */
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead style={{ backgroundColor: '#F5F7FA', borderBottom: `1px solid ${C.border}` }}>
                                    <tr>
                                        {['Patient #', 'Name', 'Gender', 'Blood Group', 'Phone', 'Registered', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map(patient => (
                                        <tr key={patient.id}
                                            style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,90,31,0.03)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '10px 16px' }}>
                                                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: ORANGE }}>
                                                    {patient.patient_number}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 16px' }}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                                                        style={{ backgroundColor: '#0A1A3F', fontSize: 11 }}>
                                                        {patient.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{patient.full_name}</p>
                                                        <p style={{ fontSize: 11, color: C.textMuted }}>{patient.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 16px', fontSize: 12, color: C.textSub, textTransform: 'capitalize' }}>{patient.gender}</td>
                                            <td style={{ padding: '10px 16px' }}>
                                                <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 700, backgroundColor: 'rgba(225,29,72,0.07)', color: '#c0392b', border: '1px solid rgba(225,29,72,0.15)' }}>
                                                    {patient.blood_group || 'N/A'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 16px', fontSize: 12, color: C.textSub }}>{patient.phone}</td>
                                            <td style={{ padding: '10px 16px', fontSize: 11, color: C.textMuted }}>
                                                {new Date(patient.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '10px 16px' }}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleEditPatient(patient)}
                                                        className="p-1.5 rounded-lg transition-colors"
                                                        style={{ color: ORANGE }}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,90,31,0.08)'}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        title="Edit">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDeletePatient(patient.id, patient.full_name)}
                                                        className="p-1.5 rounded-lg transition-colors"
                                                        style={{ color: '#ef4444' }}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        title="Delete">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════ MODAL ══════════ */}
            {showModal && (
                <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: isMobile ? 0 : 16 }}>
                    <div
                        className="bg-white w-full overflow-y-auto"
                        style={{
                            borderRadius:  isMobile ? '20px 20px 0 0' : 14,
                            maxWidth:      isMobile ? '100%' : 520,
                            maxHeight:     isMobile ? '92vh' : '88vh',
                            border:        `1px solid ${C.border}`,
                            boxShadow:     '0 24px 80px rgba(10,26,63,0.15)',
                        }}>

                        {/* Modal header */}
                        <div className="sticky top-0 bg-white px-5 py-3.5 flex items-center justify-between"
                            style={{ borderBottom: `1px solid ${C.border}` }}>
                            <div>
                                <div style={{ width: 22, height: 3, borderRadius: 2, background: ORANGE, marginBottom: 6 }} />
                                <h2 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>
                                    {modalMode === 'add' ? 'Register New Patient' : 'Edit Patient'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ color: C.textMuted }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(10,26,63,0.06)'; e.currentTarget.style.color = C.text; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.textMuted; }}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>

                            {/* Full Name */}
                            <div>
                                <label style={LBL}>Full Name *</label>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe"
                                        className={`${INPUT_CLS} pl-8 pr-3`} style={{ color: C.text }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label style={LBL}>Date of Birth *</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required
                                            className={`${INPUT_CLS} pl-8 pr-2`} style={{ color: C.text }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={LBL}>Gender *</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required
                                        className={`${INPUT_CLS} px-3`} style={{ color: formData.gender ? C.text : '#9CA3AF' }}>
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label style={LBL}>Phone *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1234567890"
                                            className={`${INPUT_CLS} pl-8 pr-3`} style={{ color: C.text }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={LBL}>Blood Group</label>
                                    <div className="relative">
                                        <Droplet className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
                                            className={`${INPUT_CLS} pl-8 pr-2`} style={{ color: formData.bloodGroup ? C.text : '#9CA3AF' }}>
                                            <option value="">Select</option>
                                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={LBL}>Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="patient@email.com"
                                        className={`${INPUT_CLS} pl-8 pr-3`} style={{ color: C.text }} />
                                </div>
                            </div>

                            <div>
                                <label style={LBL}>Address *</label>
                                <div className="relative">
                                    <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                    <textarea name="address" value={formData.address} onChange={handleChange} required rows="2"
                                        placeholder="123 Main Street, City, State"
                                        className={`${INPUT_CLS} pl-8 pr-3`} style={{ color: C.text }} />
                                </div>
                            </div>

                            <div>
                                <label style={LBL}>Medical Conditions</label>
                                <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} rows="2"
                                    placeholder="Known conditions, allergies, etc."
                                    className={`${INPUT_CLS} px-3`} style={{ color: C.text }} />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label style={LBL}>Next of Kin</label>
                                    <input type="text" name="nextOfKinName" value={formData.nextOfKinName} onChange={handleChange} placeholder="Jane Doe"
                                        className={`${INPUT_CLS} px-3`} style={{ color: C.text }} />
                                </div>
                                <div>
                                    <label style={LBL}>Kin Phone</label>
                                    <input type="tel" name="nextOfKinPhone" value={formData.nextOfKinPhone} onChange={handleChange} placeholder="+234..."
                                        className={`${INPUT_CLS} px-3`} style={{ color: C.text }} />
                                </div>
                            </div>

                            {/* Submit row */}
                            <div className="flex gap-2 pt-1">
                                <button type="submit"
                                    className="flex-1 text-white rounded-lg font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                                    style={{ backgroundColor: ORANGE, boxShadow: '0 4px 14px rgba(255,90,31,0.3)', padding: '10px 0', fontSize: 13 }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = ORANGE2}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ORANGE}
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {modalMode === 'add' ? 'Register Patient' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="rounded-lg font-semibold transition-all"
                                    style={{ border: `1px solid ${C.border}`, color: C.textSub, backgroundColor: 'transparent', padding: '10px 14px', fontSize: 13 }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(10,26,63,0.04)'; e.currentTarget.style.borderColor = 'rgba(10,26,63,0.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = C.border; }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}