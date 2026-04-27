import { lazy } from 'react';

// Auth pages (public)
const Register = lazy(
  () => import('../../../portals/doctor/modules/auth/Register')
);
const Login = lazy(
  () => import('../../../portals/doctor/modules/auth/Login')
);
const VerifyEmail = lazy(
  () => import('../../../portals/doctor/modules/auth/VerifyEmail')
);
const ForgotPassword = lazy(
  () => import('../../../portals/doctor/modules/auth/ForgotPassword')
);
const ResetPassword = lazy(
  () => import('../../../portals/doctor/modules/auth/ResetPassword')
);

// Onboarding
const DoctorOnboarding = lazy(
  () => import('../../../portals/doctor/modules/onboarding/DoctorOnboarding')
);

// OAuth
const OAuthSuccess = lazy(
  () => import('../../../portals/doctor/modules/oauth/OAuthSuccess')
);
const OAuthError = lazy(
  () => import('../../../portals/doctor/modules/oauth/OAuthError')
);

// Layout
const DoctorLayout = lazy(
  () => import('../../../portals/doctor/layouts/DoctorLayout')
);

// Dashboard
const DoctorDashboard = lazy(
  () => import('../../../portals/doctor/modules/dashboard/DoctorDashboard')
);

// Appointments
const AppointmentRequests = lazy(
  () => import('../../../portals/doctor/modules/appointments/AppointmentRequests')
);
const AppointmentSchedule = lazy(
  () => import('../../../portals/doctor/modules/appointments/AppointmentSchedule')
);

// Slots
const SlotManagement = lazy(
  () => import('../../../portals/doctor/modules/slots/SlotManagement')
);

// Consultations
const ConsultationHistory = lazy(
  () => import('../../../portals/doctor/modules/consultations/ConsultationHistory')
);
const VideoCall = lazy(
  () => import('../../../portals/doctor/modules/consultations/VideoCall')
);

// Prescriptions
const PrescriptionsList = lazy(
  () => import('../../../portals/doctor/modules/prescriptions/PrescriptionsList')
);

// Feedback
const PatientFeedback = lazy(
  () => import('../../../portals/doctor/modules/feedback/PatientFeedback')
);

// Profile
const DoctorProfile = lazy(
  () => import('../../../portals/doctor/modules/profile/DoctorProfile')
);

export const doctorRoutes = [
  // ====== PUBLIC ROUTES ======
  {
    path: '/doctor/register',
    element: <Register />,
  },
  {
    path: '/doctor/login',
    element: <Login />,
  },
  {
    path: '/doctor/verify-email/:token',
    element: <VerifyEmail />,
  },
  {
    path: '/doctor/auth/verify-email/:token', // Compatibility for broken backend link
    element: <VerifyEmail />,
  },
  {
    path: '/doctor/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/doctor/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/doctor/auth/reset-password/:token', // Compatibility for broken backend link
    element: <ResetPassword />,
  },

  // ====== ONBOARDING (Pre-Approval) ======
  {
    path: '/doctor/onboarding',
    element: <DoctorOnboarding />,
  },
  {
    path: '/doctor/submit-application',
    element: <DoctorOnboarding />,
  },
  {
    path: '/doctor/application-status',
    element: <DoctorOnboarding />,
  },
  {
    path: '/doctor/complete-profile',
    element: <DoctorOnboarding />,
  },

  // ====== OAuth ======
  {
    path: '/doctor/auth/oauth/success',
    element: <OAuthSuccess />,
  },
  {
    path: '/doctor/auth/oauth/error',
    element: <OAuthError />,
  },

  // ====== PROTECTED ROUTES (inside DoctorLayout) ======
  {
    path: '/doctor',
    element: <DoctorLayout />,
    children: [
      {
        path: 'dashboard',
        element: <DoctorDashboard />,
      },

      // --- Appointments ---
      {
        path: 'appointments/requests',
        element: <AppointmentRequests />,
      },
      {
        path: 'appointments/schedule',
        element: <AppointmentSchedule />,
      },

      // --- Slots / Availability ---
      {
        path: 'slots',
        element: <SlotManagement />,
      },

      // --- Consultations ---
      {
        path: 'consultations',
        element: <ConsultationHistory />,
      },
      {
        path: 'consultation/video/:appointmentId',
        element: <VideoCall />,
      },

      // --- Prescriptions ---
      {
        path: 'prescriptions',
        element: <PrescriptionsList />,
      },

      // --- Feedback ---
      {
        path: 'feedback',
        element: <PatientFeedback />,
      },

      // --- Profile ---
      {
        path: 'profile',
        element: <DoctorProfile />,
      },
    ],
  },
];
