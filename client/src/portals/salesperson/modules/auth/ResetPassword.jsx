import ResetPasswordForm from '../../../../shared/components/auth/ResetPasswordForm';
import { salespersonAuthApi } from '../../../../core/api/salesperson/auth.service';

export default function ResetPassword() {
  const handleSubmit = async (token, newPassword) => {
    await salespersonAuthApi.resetPassword(token, newPassword);
  };

  return (
    <ResetPasswordForm
      onSubmit={handleSubmit}
      loginPath="/salesperson/login"
      title="Salesperson - Reset Password"
      subtitle="Enter your new password"
      minPasswordLength={6}
    />
  );
}
