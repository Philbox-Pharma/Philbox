import VerifyEmail from '../../../../shared/components/auth/VerifyEmail';
import { customerAuthApi } from '../../../../core/api/customer/auth';

export default function CustomerVerifyEmail() {
    const handleVerify = async (token) => {
        await customerAuthApi.verifyEmail(token);
    };

    return (
        <VerifyEmail
            onVerify={handleVerify}
            loginPath="/login"
            title="Email Verification"
        />
    );
}
