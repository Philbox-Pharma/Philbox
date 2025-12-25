import ForgotPasswordForm from '../../../../shared/components/auth/ForgotPasswordForm';
import { customerAuthApi } from '../../../../core/api/customer/auth';

export default function ForgotPassword() {
    const handleSubmit = async (email) => {
        await customerAuthApi.forgotPassword(email);
    };

    return (
        <ForgotPasswordForm
            onSubmit={handleSubmit}
            loginPath="/login"
            title="Forgot Password"
            subtitle="Enter your email to reset password"
        />
    );
}
