import Register from '../../../portals/doctor/modules/auth/Register';
import Login from '../../../portals/doctor/modules/auth/Login';
import VerifyEmail from '../../../portals/doctor/modules/auth/VerifyEmail';
import ForgotPassword from '../../../portals/doctor/modules/auth/ForgotPassword';
import ResetPassword from '../../../portals/doctor/modules/auth/ResetPassword';
import DoctorOnboarding from '../../../portals/doctor/modules/onboarding/DoctorOnboarding';
import SlotManagement from '../../../portals/doctor/modules/slots/SlotManagement';
import ConsultationHistory from '../../../portals/doctor/modules/consultations/ConsultationHistory';
import PatientFeedback from '../../../portals/doctor/modules/feedback/PatientFeedback';
import OAuthSuccess from '../../../portals/doctor/modules/oauth/OAuthSuccess';
import OAuthError from '../../../portals/doctor/modules/oauth/OAuthError';

export const doctorRoutes = [
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
    path: '/doctor/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/doctor/reset-password/:token',
    element: <ResetPassword />,
  },
  // ====== UNIFIED ONBOARDING WIZARD ======
  // Single route handles: document upload, application status, complete profile
  {
    path: '/doctor/onboarding',
    element: <DoctorOnboarding />,
  },
  // Keep old routes redirecting to onboarding for backward compatibility
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
  // ====== DASHBOARD FEATURES ======
  {
    path: '/doctor/slots',
    element: <SlotManagement />,
  },
  {
    path: '/doctor/consultations',
    element: <ConsultationHistory />,
  },
  {
    path: '/doctor/feedback',
    element: <PatientFeedback />,
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
];
