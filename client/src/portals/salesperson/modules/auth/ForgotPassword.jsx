import ForgotPasswordForm from '../../../../shared/components/auth/ForgotPasswordForm';
import { salespersonAuthApi } from '../../../../core/api/salesperson/auth.service';

export default function ForgotPassword() {
  const handleSubmit = async email => {
    await salespersonAuthApi.forgotPassword(email);
  };

  return (
    <ForgotPasswordForm
      onSubmit={handleSubmit}
      loginPath="/salesperson/login"
      title="Salesperson - Forgot Password"
      subtitle="Enter your email to reset password"
    />
  );
}
