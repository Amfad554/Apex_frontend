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

    /* ── Fetch — tries every field name the backend might use for hospital ID ── */
    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const user  = JSON.parse(localStorage.getItem('user'));

            // Cover all possible field names your backend might store the hospital ID under
            const hospitalId = user?.hospital_id || user?.hospitalId || user?.id;

            if (!hospitalId) {
                console.error('No hospital ID found in stored user object:', user);
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/patients/${hospitalId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.ok) {
                const data = await response.json();
                // Handle both { patients: [] } and direct array responses
                setPatients(Array.isArray(data) ? data : (data.patients || []));
            } else {
                console.error('Failed to fetch patients — HTTP status:', response.status, 'for hospital ID:', hospitalId);
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
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
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
            const hospitalId = user?.hospital_id || user?.hospitalId || user?.id;
            const url   = modalMode === 'add'
                ? `${import.meta.env.VITE_API_URL}/api/patients`
                : `${import.meta.env.VITE_API_URL}/api/patients/${selectedPatient.id}`;
            const res = await fetch(url, {
                method:  modalMode === 'add' ? 'POST' : 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body:    JSON.stringify(formData)
            });
            if (res.ok) {
                alert(modalMode === 'add' ? 'Patient registered!' : 'Patient updated!');
                setShowModal(false); fetchPatients();
            } else { const d = await res.json(); alert(`Error: ${d.error}`); }
        } catch (e) { console.error(e); alert('Failed to save patient'); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const filteredPatients = patients.filter(p => {
        const q = searchQuery.toLowerCase();
        return (
            (p.full_name ?? '').toLowerCase().includes(q) ||
            (p.patient_number ?? '').toLowerCase().includes(q) ||
            (p.phone ?? '').includes(q)
        );
    });

    /* ── Loading spinner ── */
    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', backgroundColor: C.pageBg }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 40, height: 40, border: `3px solid rgba(255,90,31,0.2)`,
                    borderTopColor: ORANGE, borderRadius: '50%',
                    margin: '0 auto 12px',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: C.textSub, fontSize: 13 }}>Loading patients...</p>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: C.pageBg, minHeight: '100vh', padding: isMobile ? '14px 12px' : '24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <div style={{ width: 30, height: 3, borderRadius: 2, background: ORANGE, marginBottom: 8 }} />
                        <h1 style={{ fontSize: isMobile ? 17 : 21, fontWeight: 800, color: C.text, letterSpacing: '-0.3px', marginBottom: 2 }}>
                            Patient Management
                        </h1>
                        <p style={{ fontSize: 12, color: C.textMuted }}>Manage all registered patients</p>
                    </div>
                    <button
                        onClick={handleAddPatient}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            backgroundColor: ORANGE, color: '#fff',
                            border: 'none', borderRadius: 10, fontWeight: 600,
                            boxShadow: '0 4px 14px rgba(255,90,31,0.3)',
                            padding: isMobile ? '8px 12px' : '9px 16px',
                            fontSize: isMobile ? 12 : 13, cursor: 'pointer',
                            fontFamily: 'inherit', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = ORANGE2}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ORANGE}
                    >
                        <Plus style={{ width: 15, height: 15 }} />
                        {isMobile ? 'Add' : 'Add Patient'}
                    </button>
                </div>

                {/* ── Stats ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div style={{ backgroundColor: C.card, borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: 'rgba(255,90,31,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Users style={{ width: 16, height: 16, color: ORANGE }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1 }}>{patients.length}</p>
                                <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Total Patients</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ backgroundColor: C.card, borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <UserPlus style={{ width: 16, height: 16, color: '#059669' }} />
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
                <div style={{ backgroundColor: C.card, borderRadius: 12, padding: '10px 14px', marginBottom: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: C.textMuted }} />
                        <input
                            type="text"
                            placeholder="Search by name, patient number, or phone..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', paddingLeft: 32, paddingRight: 12,
                                paddingTop: 9, paddingBottom: 9,
                                border: `1px solid ${C.border}`, borderRadius: 8,
                                fontSize: 13, color: C.text, backgroundColor: '#F5F7FA',
                                outline: 'none', fontFamily: 'inherit',
                            }}
                            onFocus={e => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = '0 0 0 3px rgba(255,90,31,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                </div>

                {/* ── Patient List ── */}
                <div style={{ backgroundColor: C.card, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                    {filteredPatients.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                            <Users style={{ width: 40, height: 40, color: 'rgba(10,26,63,0.12)', margin: '0 auto 12px' }} />
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                                {patients.length === 0 ? 'No patients registered yet' : 'No patients found'}
                            </h3>
                            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>
                                {patients.length === 0 ? 'Start by registering your first patient' : 'Try adjusting your search'}
                            </p>
                            {patients.length === 0 && (
                                <button onClick={handleAddPatient}
                                    style={{ padding: '8px 16px', backgroundColor: ORANGE, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
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
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                        {/* Avatar + name */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#0A1A3F', color: '#fff', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {patient.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {patient.full_name}
                                                </p>
                                                <p style={{ fontSize: 10, color: ORANGE, fontFamily: 'monospace', fontWeight: 600 }}>
                                                    {patient.patient_number}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                            <button onClick={() => handleEditPatient(patient)}
                                                style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: ORANGE, borderRadius: 7, transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,90,31,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                            ><Edit style={{ width: 14, height: 14 }} /></button>
                                            <button onClick={() => handleDeletePatient(patient.id, patient.full_name)}
                                                style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: 7, transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                            ><Trash2 style={{ width: 14, height: 14 }} /></button>
                                        </div>
                                    </div>
                                    {/* Detail row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, color: C.textMuted, textTransform: 'capitalize' }}>{patient.gender}</span>
                                        <span style={{ fontSize: 11, color: C.textMuted }}>·</span>
                                        <span style={{ fontSize: 11, color: C.textMuted }}>{patient.phone}</span>
                                        {patient.blood_group && (
                                            <>
                                                <span style={{ fontSize: 11, color: C.textMuted }}>·</span>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: '#c0392b', backgroundColor: 'rgba(225,29,72,0.07)', padding: '1px 6px', borderRadius: 4 }}>
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
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                                            <td style={{ padding: '11px 16px' }}>
                                                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: ORANGE }}>
                                                    {patient.patient_number}
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#0A1A3F', color: '#fff', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        {patient.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{patient.full_name}</p>
                                                        <p style={{ fontSize: 11, color: C.textMuted }}>{patient.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '11px 16px', fontSize: 12, color: C.textSub, textTransform: 'capitalize' }}>{patient.gender}</td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, backgroundColor: 'rgba(225,29,72,0.07)', color: '#c0392b', border: '1px solid rgba(225,29,72,0.15)' }}>
                                                    {patient.blood_group || 'N/A'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 16px', fontSize: 12, color: C.textSub }}>{patient.phone}</td>
                                            <td style={{ padding: '11px 16px', fontSize: 11, color: C.textMuted }}>
                                                {new Date(patient.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                                                    <button onClick={() => handleEditPatient(patient)}
                                                        style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: ORANGE, borderRadius: 8, transition: 'background 0.15s' }}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,90,31,0.08)'}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        title="Edit">
                                                        <Edit style={{ width: 15, height: 15 }} />
                                                    </button>
                                                    <button onClick={() => handleDeletePatient(patient.id, patient.full_name)}
                                                        style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: 8, transition: 'background 0.15s' }}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        title="Delete">
                                                        <Trash2 style={{ width: 15, height: 15 }} />
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
                <div
                    style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: isMobile ? 0 : 16 }}
                    onClick={e => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div style={{
                        backgroundColor: '#fff', width: '100%',
                        maxWidth: isMobile ? '100%' : 520,
                        maxHeight: isMobile ? '92vh' : '88vh',
                        overflowY: 'auto',
                        borderRadius: isMobile ? '20px 20px 0 0' : 14,
                        border: `1px solid ${C.border}`,
                        boxShadow: '0 24px 80px rgba(10,26,63,0.15)',
                    }}>

                        {/* Modal header */}
                        <div style={{ position: 'sticky', top: 0, backgroundColor: '#fff', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
                            <div>
                                <div style={{ width: 22, height: 3, borderRadius: 2, background: ORANGE, marginBottom: 6 }} />
                                <h2 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>
                                    {modalMode === 'add' ? 'Register New Patient' : 'Edit Patient'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, borderRadius: 8, transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(10,26,63,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <X style={{ width: 16, height: 16 }} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>

                            {/* Full Name */}
                            <div>
                                <label style={LBL}>Full Name *</label>
                                <div style={{ position: 'relative' }}>
                                    <User style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: C.textMuted }} />
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe"
                                        className={`${INPUT_CLS} pl-8 pr-3`} style={{ color: C.text }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div>
                                    <label style={LBL}>Date of Birth *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: C.textMuted }} />
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div>
                                    <label style={LBL}>Phone *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: C.textMuted }} />
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1234567890"
                                            className={`${INPUT_CLS} pl-8 pr-3`} style={{ color: C.text }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={LBL}>Blood Group</label>
                                    <div style={{ position: 'relative' }}>
                                        <Droplet style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: C.textMuted }} />
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
                                <div style={{ position: 'relative' }}>
                                    <Mail style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: C.textMuted }} />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="patient@email.com"
                                        className={`${INPUT_CLS} pl-8 pr-3`} style={{ color: C.text }} />
                                </div>
                            </div>

                            <div>
                                <label style={LBL}>Address *</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin style={{ position: 'absolute', left: 10, top: 10, width: 13, height: 13, color: C.textMuted }} />
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                            <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                                <button type="submit"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: ORANGE, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: '10px 0', boxShadow: '0 4px 14px rgba(255,90,31,0.3)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = ORANGE2}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ORANGE}
                                >
                                    <Save style={{ width: 14, height: 14 }} />
                                    {modalMode === 'add' ? 'Register Patient' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)}
                                    style={{ padding: '10px 16px', backgroundColor: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10, color: C.textSub, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
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