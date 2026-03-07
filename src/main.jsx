import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import './index.css';

import App from './App.jsx';

// Layouts
import Layout from './layouts/Layout.jsx';
import PatientDashboardLayout from './layouts/PatientDashboardLayout.jsx';

// Guards
import SubscriptionGuard from './components/SubscriptionGuard.jsx';

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

/* ─── Auth helpers (synchronous) ────────────────────────────────────────────── */
function getToken() { return localStorage.getItem('token'); }
function getUser()  {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}

/* ─── Public-only home ───────────────────────────────────────────────────────── */
const PublicOnlyHome = () => {
  const token = getToken();
  const user  = getUser();
  const isHospital = token && user && (user.role === 'hospital_admin' || user.hospital_id);
  if (isHospital) return <Navigate to="/hospitaldashboard" replace />;
  return <Home />;
};

/* ─── Hospital login guard ───────────────────────────────────────────────────── */
const HospitalAuthGuard = () => {
  const token = getToken();
  const user  = getUser();
  const isHospital = token && user && (user.role === 'hospital_admin' || user.hospital_id);
  if (!isHospital) return <Navigate to="/hospital/auth" replace />;
  return <Outlet />;
};

/* ─── General protected route ────────────────────────────────────────────────── */
const ProtectedRoute = ({ allowedRoles }) => {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) return <Navigate to="/patientlogin" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};

/* ─── Router ─────────────────────────────────────────────────────────────────── */
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <PublicOnlyHome /> },

          // Public
          { path: 'hospital/auth',       element: <HospitalAuth /> },
          { path: 'patientregistration', element: <PatientRegister /> },
          { path: 'patientlogin',        element: <PatientLogin /> },
          { path: 'superadminlogin',     element: <SuperAdminLogin /> },
          { path: 'verify-email',        element: <VerifyEmail /> },
          { path: 'features',            element: <Features /> },
          { path: 'contact',             element: <Contact /> },
          { path: 'security',            element: <Security /> },
          { path: 'pricing',             element: <Pricing /> },
          { path: 'stafflogin',          element: <StaffLogin /> },
          {
            path: 'unauthorized',
            element: (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-10 bg-red-900/20 rounded-lg border border-red-500">
                  <h1 className="text-2xl font-bold mb-2 text-white">Access Denied</h1>
                  <p className="text-white">You do not have permission to view this page.</p>
                </div>
              </div>
            ),
          },

          // Hospital Admin — login guard → subscription guard → dashboard
          {
            element: <HospitalAuthGuard />,
            children: [
              {
                element: <SubscriptionGuard />,
                children: [
                  { path: 'hospitaldashboard', element: <HospitalDashboard /> },
                  { path: 'patientmanagement', element: <PatientManagement /> },
                ],
              },
            ],
          },

          // Super Admin
          { path: 'superadmindashboard', element: <SuperAdminDashboard /> },

          // Patient
          {
            path: 'patientdashboard',
            element: <PatientDashboardLayout />,
            children: [
              { index: true, element: <PatientDashboard /> },
              { path: 'prescriptions', element: <Prescriptions /> },
            ],
          },

          { path: '*', element: <Navigate to="/" replace /> },
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