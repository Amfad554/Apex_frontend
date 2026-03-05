import React, { useState } from 'react';
import { Pill, Calendar, User, FileText, Download, Clock } from 'lucide-react';

export default function Prescriptions() {
  const [prescriptions] = useState([
    {
      id: 1,
      medication: "Amoxicillin 500mg",
      dosage: "1 tablet, 3 times daily",
      duration: "7 days",
      prescribedBy: "Dr. Sarah Johnson",
      date: "2024-02-01",
      status: "Active",
      refills: 2,
      instructions: "Take with food. Complete the full course."
    },
    {
      id: 2,
      medication: "Lisinopril 10mg",
      dosage: "1 tablet, once daily",
      duration: "Ongoing",
      prescribedBy: "Dr. Michael Chen",
      date: "2024-01-15",
      status: "Active",
      refills: 5,
      instructions: "Take in the morning. Monitor blood pressure."
    },
    {
      id: 3,
      medication: "Ibuprofen 400mg",
      dosage: "1 tablet as needed",
      duration: "30 days",
      prescribedBy: "Dr. Sarah Johnson",
      date: "2023-12-20",
      status: "Completed",
      refills: 0,
      instructions: "Do not exceed 3 tablets per day. Take with food."
    }
  ]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Prescriptions</h1>
          <p className="text-slate-600">View and manage your prescribed medications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {prescriptions.filter(p => p.status === "Active").length}
                </p>
                <p className="text-sm text-slate-600">Active Prescriptions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {prescriptions.reduce((sum, p) => sum + p.refills, 0)}
                </p>
                <p className="text-sm text-slate-600">Available Refills</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{prescriptions.length}</p>
                <p className="text-sm text-slate-600">Total Records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    prescription.status === "Active" 
                      ? "bg-green-100" 
                      : "bg-slate-100"
                  }`}>
                    <Pill className={`w-6 h-6 ${
                      prescription.status === "Active" 
                        ? "text-green-600" 
                        : "text-slate-600"
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      {prescription.medication}
                    </h3>
                    <p className="text-slate-600 mb-2">{prescription.dosage}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{prescription.prescribedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(prescription.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{prescription.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    prescription.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {prescription.status}
                  </span>
                  {prescription.refills > 0 && (
                    <span className="text-xs text-slate-600">
                      {prescription.refills} refills available
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-slate-700 mb-1">Instructions:</p>
                <p className="text-sm text-slate-600">{prescription.instructions}</p>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 text-sm font-semibold">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                {prescription.status === "Active" && prescription.refills > 0 && (
                  <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-semibold">
                    Request Refill
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {prescriptions.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <Pill className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Prescriptions</h3>
            <p className="text-slate-600">You don't have any prescriptions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}