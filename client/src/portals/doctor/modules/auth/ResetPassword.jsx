import ResetPasswordForm from '../../../../shared/components/auth/ResetPasswordForm';
import { doctorAuthApi } from '../../../../core/api/doctor/auth.service';

export default function ResetPassword() {
  const handleSubmit = async (token, newPassword) => {
    await doctorAuthApi.resetPassword(token, newPassword);
  };

  return (
    <ResetPasswordForm
      onSubmit={handleSubmit}
      loginPath="/doctor/login"
      title="Doctor - Reset Password"
      subtitle="Enter your new password"
      minPasswordLength={6}
    />
  );
}
