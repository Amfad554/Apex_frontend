import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import './index.css';

// The "App" component containing your loading logic and heartbeat animation
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

/**
 * PROTECTED ROUTE COMPONENT
 * Handles authorization by checking JWT token and user roles in localStorage.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  // 1. If no credentials exist, redirect to patient login
  if (!token || !userString) {
    return <Navigate to="/patientlogin" replace />;
  }

  const user = JSON.parse(userString);

  // 2. If the user's role is not authorized for this route, redirect to unauthorized
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Render children via Outlet if authorized
  return <Outlet />;
};

/**
 * ROUTER CONFIGURATION
 * App is the parent element to handle the global loading state.
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      {
        path: "/",
        element: <Layout />, 
        children: [
          { index: true, element: <Home /> },

          // --- PUBLIC AUTHENTICATION ---
          { path: "hospital/auth", element: <HospitalAuth /> },
          { path: "patientregistration", element: <PatientRegister /> },
          { path: "patientlogin", element: <PatientLogin /> },
          { path: "superadminlogin", element: <SuperAdminLogin /> },
          { path: "verify-email", element: <VerifyEmail /> },
          { path: "features", element: <Features /> },
          { path: "contact", element: <Contact /> },
          { path: "security", element: <Security /> },
          { path: "pricing", element: <Pricing /> },
          { path: "stafflogin", element: <StaffLogin /> },
          { path: "unauthorized", element: (
              <div className="flex items-center justify-center min-h-[60vh] text-white">
                <div className="text-center p-10 bg-red-900/20 rounded-lg border border-red-500 backdrop-blur-sm">
                  <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                  <p>You do not have permission to view this page.</p>
                </div>
              </div>
            )
          },

          // ==========================================
          // PROTECTED HOSPITAL ADMIN ROUTES (NEW SECTION)
          // ==========================================
          {
            element: <ProtectedRoute allowedRoles={['hospital_admin']} />,
            children: [
              { path: "hospitaldashboard", element: <HospitalDashboard /> },
              { path: "patientmanagement", element: <PatientManagement /> },
            ],
          },

          // ==========================================
          // PROTECTED SUPER ADMIN ROUTES
          // ==========================================
          {
            element: <ProtectedRoute allowedRoles={['super_admin']} />,
            children: [
              { path: "superadmindashboard", element: <SuperAdminDashboard /> },
            ],
          },

          // ==========================================
          // PROTECTED PATIENT ROUTES
          // ==========================================
          {
            element: <ProtectedRoute allowedRoles={['patient']} />,
            children: [
              {
                path: "patientdashboard",
                element: <PatientDashboardLayout />,
                children: [
                  { index: true, element: <PatientDashboard /> },
                  { path: "prescriptions", element: <Prescriptions /> },
                ],
              },
            ],
          },

          // --- 404 CATCH-ALL ---
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);

// Render the application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);