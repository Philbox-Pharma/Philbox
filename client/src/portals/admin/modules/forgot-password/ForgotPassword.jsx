import ForgotPasswordForm from '../../../../shared/components/auth/ForgotPasswordForm';
import { adminAuthApi } from '../../../../core/api/admin/auth';

export default function ForgotPassword() {
    const handleSubmit = async (email) => {
        await adminAuthApi.forgotPassword(email);
    };

    return (
        <ForgotPasswordForm
            onSubmit={handleSubmit}
            loginPath="/admin/login"
            title="Admin - Forgot Password"
            subtitle="Enter your admin email to reset password"
        />
    );
}
