import { useState, useEffect } from 'react';
import {
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaShieldAlt,
  FaToggleOn,
  FaToggleOff,
  FaCalendarAlt,
} from 'react-icons/fa';
import { useAuth } from '../../../../shared/context/AuthContext';
import apiClient from '../../../../core/api/client';

export default function SalespersonProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling2FA, setToggling2FA] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/salesperson/auth/me');
        setProfile(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        // Fallback to auth context user
        if (user) setProfile(user);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handle2FAToggle = async () => {
    if (!profile) return;
    const newValue = !profile.isTwoFactorEnabled;
    setToggling2FA(true);
    try {
      await apiClient.patch('/salesperson/auth/2fa-settings', {
        isTwoFactorEnabled: newValue,
      });
      setProfile(prev => ({ ...prev, isTwoFactorEnabled: newValue }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update 2FA settings');
    } finally {
      setToggling2FA(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 animate-fadeIn max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaUserTie className="text-blue-500" />
          My Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">Your account details and settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-3xl font-black text-blue-600 border-4 border-white">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
          </div>
        </div>

        <div className="pt-14 px-6 pb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {profile?.fullName || 'Salesperson'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Sales Agent</p>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <InfoItem icon={FaEnvelope} label="Email" value={profile?.email} />
            <InfoItem icon={FaPhone} label="Phone" value={profile?.phone || '—'} />
            <InfoItem icon={FaBuilding} label="Branch" value={profile?.branch_id?.name || profile?.branch || '—'} />
            <InfoItem
              icon={FaCalendarAlt}
              label="Joined"
              value={formatDate(profile?.created_at || profile?.createdAt)}
            />
            <InfoItem
              icon={FaShieldAlt}
              label="Status"
              value={
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  profile?.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {profile?.status || 'active'}
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* 2FA Settings Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaShieldAlt className="text-indigo-500" />
          Security Settings
        </h3>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="font-semibold text-gray-800">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Add an extra layer of security with email OTP verification
            </p>
          </div>
          <button
            onClick={handle2FAToggle}
            disabled={toggling2FA}
            className="text-3xl transition-colors disabled:opacity-50"
          >
            {profile?.isTwoFactorEnabled ? (
              <FaToggleOn className="text-green-500" />
            ) : (
              <FaToggleOff className="text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
        <Icon className="text-blue-600" size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="text-sm font-medium text-gray-800 mt-0.5 truncate">
          {typeof value === 'string' ? value : value}
        </div>
      </div>
    </div>
  );
}
