import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useNavigate, useEffect } from 'react-router-dom';
import './index.css';

import App from './App.jsx';

// Layouts
import Layout from './layouts/Layout.jsx';
import PatientDashboardLayout from './layouts/PatientDashboardLayout.jsx';

// Pages
import Home from './pages/Home.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import HospitalAuth from './pages/HospitalAuth.jsx';
import PatientLogin from './pages/PatientLogin.jsx';
import PatientRegister from './pages/PatientRegistration.jsx';
import SuperAdminLogin from './pages/SuperAdminLogin.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import Prescriptions from './pages/Prescriptions.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import HospitalDashboard from './pages/Hospitaldashboard.jsx';
import PatientManagement from './pages/PatientManagement.jsx';
import Features from './pages/Features.jsx';
import Contact from './pages/Contact.jsx';
import Security from './pages/Security.jsx';
import Pricing from './pages/Pricing.jsx';
import StaffLogin from './pages/StaffLogin.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
   AUTH HELPERS — read once, synchronously, from localStorage
───────────────────────────────────────────────────────────────────────────── */
function getToken()   { return localStorage.getItem('token'); }
function getUser()    {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}

/* ─────────────────────────────────────────────────────────────────────────────
   HOSPITAL GUARD
   • If a hospital token exists → allow through to dashboard
   • If NOT → redirect to /hospital/auth to login/register
───────────────────────────────────────────────────────────────────────────── */
const HospitalGuard = () => {
  const token = getToken();
  const user  = getUser();
  // Hospital admins have role 'hospital_admin' or just have a token with hospital_id
  // Adjust the role string below to match whatever your JWT stores
  const isHospital = token && user && (user.role === 'hospital_admin' || user.hospital_id);
  if (!isHospital) return <Navigate to="/hospital/auth" replace />;
  return <Outlet />;
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUBLIC ONLY GUARD (Home page)
   • If hospital is already logged in → redirect straight to dashboard
   • Otherwise → show the public home page
───────────────────────────────────────────────────────────────────────────── */
const PublicOnlyHome = () => {
  const token = getToken();
  const user  = getUser();
  const isHospital = token && user && (user.role === 'hospital_admin' || user.hospital_id);
  if (isHospital) return <Navigate to="/hospitaldashboard" replace />;
  return <Home />;
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATIENT / STAFF / SUPER ADMIN GUARD (existing pattern, kept intact)
───────────────────────────────────────────────────────────────────────────── */
const ProtectedRoute = ({ allowedRoles }) => {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) return <Navigate to="/patientlogin" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};

/* ─────────────────────────────────────────────────────────────────────────────
   ROUTER
───────────────────────────────────────────────────────────────────────────── */
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          // Home: redirects to dashboard if already logged in as hospital
          { index: true, element: <PublicOnlyHome /> },

          // --- PUBLIC ROUTES ---
          { path: "hospital/auth",        element: <HospitalAuth /> },
          { path: "patientregistration",  element: <PatientRegister /> },
          { path: "patientlogin",         element: <PatientLogin /> },
          { path: "superadminlogin",      element: <SuperAdminLogin /> },
          { path: "verify-email",         element: <VerifyEmail /> },
          { path: "features",             element: <Features /> },
          { path: "contact",              element: <Contact /> },
          { path: "security",             element: <Security /> },
          { path: "pricing",              element: <Pricing /> },
          { path: "stafflogin",           element: <StaffLogin /> },

          {
            path: "unauthorized",
            element: (
              <div className="flex items-center justify-center min-h-[60vh] text-white">
                <div className="text-center p-10 bg-red-900/20 rounded-lg border border-red-500 backdrop-blur-sm">
                  <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                  <p>You do not have permission to view this page.</p>
                </div>
              </div>
            ),
          },

          // --- HOSPITAL ADMIN (protected) ---
          {
            element: <HospitalGuard />,
            children: [
              { path: "hospitaldashboard", element: <HospitalDashboard /> },
              { path: "patientmanagement", element: <PatientManagement /> },
            ],
          },

          // --- SUPER ADMIN (unprotected for now — add guard when ready) ---
          { path: "superadmindashboard", element: <SuperAdminDashboard /> },

          // --- PATIENT (unprotected for now) ---
          {
            path: "patientdashboard",
            element: <PatientDashboardLayout />,
            children: [
              { index: true, element: <PatientDashboard /> },
              { path: "prescriptions", element: <Prescriptions /> },
            ],
          },

          // --- 404 ---
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);