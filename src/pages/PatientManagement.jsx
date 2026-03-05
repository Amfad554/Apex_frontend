import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    X,
    Save,
    UserPlus,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Droplet,
    User
} from 'lucide-react';

export default function PatientManagement() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        bloodGroup: '',
        medicalConditions: '',
        nextOfKinName: '',
        nextOfKinPhone: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!user?.id) {
                console.error('No hospital ID found');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/patients/hospital/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setPatients(data.patients);
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
        setFormData({
            fullName: '',
            dateOfBirth: '',
            gender: '',
            phone: '',
            email: '',
            address: '',
            bloodGroup: '',
            medicalConditions: '',
            nextOfKinName: '',
            nextOfKinPhone: ''
        });
        setShowModal(true);
    };

    const handleEditPatient = (patient) => {
        setModalMode('edit');
        setSelectedPatient(patient);
        setFormData({
            fullName: patient.full_name,
            dateOfBirth: patient.date_of_birth,
            gender: patient.gender,
            phone: patient.phone,
            email: patient.email || '',
            address: patient.address,
            bloodGroup: patient.blood_group || '',
            medicalConditions: patient.medical_conditions || '',
            nextOfKinName: patient.next_of_kin_name || '',
            nextOfKinPhone: patient.next_of_kin_phone || ''
        });
        setShowModal(true);
    };

    const handleDeletePatient = async (patientId, patientName) => {
        if (!window.confirm(`Are you sure you want to delete ${patientName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Patient deleted successfully');
                fetchPatients();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error deleting patient:', error);
            alert('Failed to delete patient');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (modalMode === 'add') {
                // Create new patient
                const response = await fetch(`http://localhost:5000/api/patients/hospital/${user.id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Patient registered successfully!');
                    setShowModal(false);
                    fetchPatients();
                } else {
                    const data = await response.json();
                    alert(`Error: ${data.error}`);
                }
            } else {
                // Update existing patient
                const response = await fetch(`http://localhost:5000/api/patients/${selectedPatient.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Patient updated successfully!');
                    setShowModal(false);
                    fetchPatients();
                } else {
                    const data = await response.json();
                    alert(`Error: ${data.error}`);
                }
            }
        } catch (error) {
            console.error('Error saving patient:', error);
            alert('Failed to save patient');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const filteredPatients = patients.filter(patient =>
        patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patient_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchQuery))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading patients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Patient Management</h1>
                        <p className="text-slate-600">Manage all registered patients</p>
                    </div>
                    <button
                        onClick={handleAddPatient}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Patient
                    </button>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{patients.length}</p>
                                <p className="text-sm text-slate-600">Total Patients</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">
                                    {patients.filter(p => {
                                        const regDate = new Date(p.created_at);
                                        const today = new Date();
                                        return regDate.toDateString() === today.toDateString();
                                    }).length}
                                </p>
                                <p className="text-sm text-slate-600">Registered Today</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, patient number, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Patients Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {filteredPatients.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                {patients.length === 0 ? 'No patients registered yet' : 'No patients found'}
                            </h3>
                            <p className="text-slate-600 mb-6">
                                {patients.length === 0
                                    ? 'Start by registering your first patient'
                                    : 'Try adjusting your search query'}
                            </p>
                            {patients.length === 0 && (
                                <button
                                    onClick={handleAddPatient}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                                >
                                    Register First Patient
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Patient #</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Gender</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Blood Group</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Phone</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Registered</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-semibold text-indigo-600">
                                                    {patient.patient_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                        {patient.full_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{patient.full_name}</p>
                                                        <p className="text-sm text-slate-600">{patient.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 capitalize">
                                                <span className="text-slate-700">{patient.gender}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-semibold">
                                                    {patient.blood_group || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{patient.phone}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(patient.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditPatient(patient)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePatient(patient.id, patient.full_name)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {modalMode === 'add' ? 'Register New Patient' : 'Edit Patient'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Date of Birth *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Gender *
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="+1234567890"
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Blood Group */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Blood Group
                                    </label>
                                    <div className="relative">
                                        <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <select
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select blood group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="patient@email.com"
                                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Address *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        rows="2"
                                        placeholder="123 Main Street, City, State, ZIP"
                                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Medical Conditions */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Medical Conditions
                                </label>
                                <textarea
                                    name="medicalConditions"
                                    value={formData.medicalConditions}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Any known medical conditions, allergies, etc."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                ></textarea>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Next of Kin Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Next of Kin Name
                                    </label>
                                    <input
                                        type="text"
                                        name="nextOfKinName"
                                        value={formData.nextOfKinName}
                                        onChange={handleChange}
                                        placeholder="Jane Doe"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Next of Kin Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Next of Kin Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="nextOfKinPhone"
                                        value={formData.nextOfKinPhone}
                                        onChange={handleChange}
                                        placeholder="+1234567890"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    {modalMode === 'add' ? 'Register Patient' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition"
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