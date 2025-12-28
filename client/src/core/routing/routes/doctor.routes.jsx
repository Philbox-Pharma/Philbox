import Register from '../../../portals/doctor/modules/auth/Register';
import Login from '../../../portals/doctor/modules/auth/Login';
import VerifyEmail from '../../../portals/doctor/modules/auth/VerifyEmail';
import ForgotPassword from '../../../portals/doctor/modules/auth/ForgotPassword';
import ResetPassword from '../../../portals/doctor/modules/auth/ResetPassword';
import SubmitApplication from '../../../portals/doctor/modules/onboarding/SubmitApplication';
import ApplicationStatus from '../../../portals/doctor/modules/onboarding/ApplicationStatus';
import CompleteProfile from '../../../portals/doctor/modules/onboarding/CompleteProfile';
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
  {
    path: '/doctor/submit-application',
    element: <SubmitApplication />,
  },
  {
    path: '/doctor/application-status',
    element: <ApplicationStatus />,
  },
  {
    path: '/doctor/complete-profile',
    element: <CompleteProfile />,
  },
  {
    path: '/doctor/auth/oauth/success',
    element: <OAuthSuccess />,
  },
  {
    path: '/doctor/auth/oauth/error',
    element: <OAuthError />,
  },
];
