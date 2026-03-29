import VerifyEmail from '../../../../shared/components/auth/VerifyEmail';
import { doctorAuthApi } from '../../../../core/api/doctor/auth';

export default function DoctorVerifyEmail() {
    const handleVerify = async (token) => {
        await doctorAuthApi.verifyEmail(token);
    };

    return (
        <VerifyEmail
            onVerify={handleVerify}
            loginPath="/doctor/login"
            registerPath="/doctor/register"
            title="Doctor Email Verification"
        />
    );
}
