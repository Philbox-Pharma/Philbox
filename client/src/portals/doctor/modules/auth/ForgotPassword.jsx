import ForgotPasswordForm from '../../../../shared/components/auth/ForgotPasswordForm';
import { doctorAuthApi } from '../../../../core/api/doctor/auth';

export default function ForgotPassword() {
    const handleSubmit = async (email) => {
        await doctorAuthApi.forgotPassword(email);
    };

    return (
        <ForgotPasswordForm
            onSubmit={handleSubmit}
            loginPath="/doctor/login"
            title="Doctor - Forgot Password"
            subtitle="Enter your email to reset password"
        />
    );
}
