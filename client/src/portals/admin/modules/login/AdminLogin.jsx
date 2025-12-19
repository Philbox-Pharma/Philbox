import { useState } from 'react';
import logo from '../../../../../public/vite.svg';
import CredentialsForm from './components/CredentialsForm';
import OtpForm from './components/OtpForm';

export default function AdminLogin() {
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [email, setEmail] = useState('');

  const handleOtpSent = (userEmail) => {
    setEmail(userEmail);
    setStep('otp');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card-container">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="w-16 h-16" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
          PhilBox Admin
        </h1>

        {step === 'credentials' && (
          <p className="text-center text-gray-500 mb-6">
            Sign in to access dashboard
          </p>
        )}

        {step === 'credentials' ? (
          <CredentialsForm onOtpSent={handleOtpSent} />
        ) : (
          <OtpForm email={email} onBack={() => setStep('credentials')} />
        )}
      </div>
    </div>
  );
}
