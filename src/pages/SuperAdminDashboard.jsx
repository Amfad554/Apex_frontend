import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Building2, 
  Users, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LogOut,
  Eye,
  Trash2,
  Ban,
  Search,
  RefreshCw
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, suspended
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    suspended: 0,
    totalPatients: 0,
    totalStaff: 0
  });

  // Fetch hospitals on component mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/hospitals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHospitals(data.hospitals);
        
        // Calculate stats
        const stats = {
          total: data.hospitals.length,
          pending: data.hospitals.filter(h => h.status === 'pending').length,
          approved: data.hospitals.filter(h => h.status === 'approved').length,
          suspended: data.hospitals.filter(h => h.status === 'suspended').length,
          totalPatients: data.hospitals.reduce((sum, h) => sum + (h.patientCount || 0), 0),
          totalStaff: data.hospitals.reduce((sum, h) => sum + (h.staffCount || 0), 0)
        };
        setStats(stats);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        navigate('/admin/login');
      } else {
        console.error('Failed to fetch hospitals');
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/hospitals/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.hospital.name} has been approved!`);
        fetchHospitals(); // Refresh list
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error approving hospital:', error);
      alert('Failed to approve hospital');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject/delete this hospital registration? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/hospitals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`🗑️ ${data.hospital.name} has been deleted`);
        fetchHospitals(); // Refresh list
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting hospital:', error);
      alert('Failed to delete hospital');
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Are you sure you want to suspend this hospital? They will not be able to login.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/hospitals/${id}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`⛔ ${data.hospital.name} has been suspended`);
        fetchHospitals(); // Refresh list
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error suspending hospital:', error);
      alert('Failed to suspend hospital');
    }
  };

  const handleReactivate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/hospitals/${id}/reactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.hospital.name} has been reactivated`);
        fetchHospitals(); // Refresh list
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error reactivating hospital:', error);
      alert('Failed to reactivate hospital');
    }
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesFilter = filter === 'all' || hospital.status === filter;
    const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hospital.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Super Admin Panel</h1>
              <p className="text-xs text-slate-400">Platform Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchHospitals}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-semibold text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Hospital Management</h2>
          <p className="text-slate-600">Review and manage all registered hospitals</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <StatCard
            icon={<Building2 className="w-6 h-6" />}
            label="Total Hospitals"
            value={stats.total}
            color="blue"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Pending Approval"
            value={stats.pending}
            color="yellow"
            highlight={stats.pending > 0}
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Approved"
            value={stats.approved}
            color="green"
          />
          <StatCard
            icon={<Ban className="w-6 h-6" />}
            label="Suspended"
            value={stats.suspended}
            color="red"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Patients"
            value={stats.totalPatients.toLocaleString()}
            color="purple"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Healthcare Staff"
            value={stats.totalStaff}
            color="indigo"
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-96 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search hospitals by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                label="All"
                count={stats.total}
              />
              <FilterButton
                active={filter === 'pending'}
                onClick={() => setFilter('pending')}
                label="Pending"
                count={stats.pending}
                color="yellow"
              />
              <FilterButton
                active={filter === 'approved'}
                onClick={() => setFilter('approved')}
                label="Approved"
                count={stats.approved}
                color="green"
              />
              <FilterButton
                active={filter === 'suspended'}
                onClick={() => setFilter('suspended')}
                label="Suspended"
                count={stats.suspended}
                color="red"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading hospitals...</p>
          </div>
        )}

        {/* Hospitals List */}
        {!loading && (
          <div className="space-y-4">
            {filteredHospitals.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No hospitals found</h3>
                <p className="text-slate-600">
                  {hospitals.length === 0 
                    ? 'No hospitals have registered yet.' 
                    : 'Try adjusting your search or filter.'}
                </p>
              </div>
            ) : (
              filteredHospitals.map(hospital => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onSuspend={handleSuspend}
                  onReactivate={handleReactivate}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color, highlight }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  };

  return (
    <div className={`bg-white rounded-xl p-6 border border-slate-200 ${highlight ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}>
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800 mb-1">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

// Filter Button Component
function FilterButton({ active, onClick, label, count, color = 'indigo' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label} <span className="ml-1">({count})</span>
    </button>
  );
}

// Hospital Card Component
function HospitalCard({ hospital, onApprove, onReject, onSuspend, onReactivate }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    suspended: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{hospital.name}</h3>
            <p className="text-sm text-slate-600 mb-2 capitalize">{hospital.type} Hospital</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
              <span>📍 {hospital.address}</span>
              <span>📞 {hospital.phone}</span>
              <span>📧 {hospital.email}</span>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[hospital.status]}`}>
          {hospital.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
        <div>
          <p className="text-xs text-slate-600 mb-1">Administrator</p>
          <p className="font-semibold text-slate-800">{hospital.admin}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">License Number</p>
          <p className="font-semibold text-slate-800">{hospital.license}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Patients</p>
          <p className="font-semibold text-slate-800">{hospital.patientCount?.toLocaleString() || 0}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Staff Members</p>
          <p className="font-semibold text-slate-800">{hospital.staffCount || 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {hospital.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(hospital.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => onReject(hospital.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm font-semibold"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </>
        )}
        {hospital.status === 'approved' && (
          <button
            onClick={() => onSuspend(hospital.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm font-semibold"
          >
            <Ban className="w-4 h-4" />
            Suspend
          </button>
        )}
        {hospital.status === 'suspended' && (
          <button
            onClick={() => onReactivate(hospital.id)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-semibold"
          >
            <CheckCircle2 className="w-4 h-4" />
            Reactivate
          </button>
        )}
        <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 text-sm font-semibold">
          <Eye className="w-4 h-4" />
          View Details
        </button>
        {hospital.status === 'pending' && (
          <button
            onClick={() => onReject(hospital.id)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2 text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>
      
      {/* Registration Date */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Registered: {new Date(hospital.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );
}