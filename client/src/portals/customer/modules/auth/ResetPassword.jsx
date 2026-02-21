import ResetPasswordForm from '../../../../shared/components/auth/ResetPasswordForm';
import { customerAuthApi } from '../../../../core/api/customer/auth.service';

export default function ResetPassword() {
  const handleSubmit = async (token, newPassword) => {
    await customerAuthApi.resetPassword(token, newPassword);
  };

  return (
    <ResetPasswordForm
      onSubmit={handleSubmit}
      loginPath="/login"
      title="Reset Password"
      subtitle="Enter your new password"
      minPasswordLength={3} // As per backend validation
    />
  );
}
