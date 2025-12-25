import ResetPasswordForm from '../../../../shared/components/auth/ResetPasswordForm';
import { adminAuthApi } from '../../../../core/api/admin/auth';

export default function ResetPassword() {
    const handleSubmit = async (token, newPassword) => {
        await adminAuthApi.resetPassword(token, newPassword);
    };

    return (
        <ResetPasswordForm
            onSubmit={handleSubmit}
            loginPath="/admin/login"
            title="Admin - Reset Password"
            subtitle="Enter your new password"
            minPasswordLength={8}  // Admin stricter validation
        />
    );
}
