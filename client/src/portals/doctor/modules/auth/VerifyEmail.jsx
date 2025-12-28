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
            title="Doctor Email Verification"
        />
    );
}
