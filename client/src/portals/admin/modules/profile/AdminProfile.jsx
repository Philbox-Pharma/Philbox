// src/portals/admin/modules/profile/AdminProfile.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FaUserShield, FaEnvelope, FaPhone, FaLock, FaShieldAlt,
    FaEdit, FaCamera, FaSpinner, FaCheckCircle, FaExclamationTriangle,
    FaEye, FaEyeSlash
} from 'react-icons/fa';
import { adminAuthApi, staffApi } from '../../../../core/api/admin/adminApi';
import { FormInput } from '../../../../shared/components/Form';

export default function AdminProfile() {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Tabs
    const [activeTab, setActiveTab] = useState('profile'); // profile, security, 2fa

    // Edit Profile State
    const [editing, setEditing] = useState(false);
    const [profileData, setProfileData] = useState({});
    const [savingProfile, setSavingProfile] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordError, setPasswordError] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // 2FA State
    const [toggling2FA, setToggling2FA] = useState(false);

    // Fetch Admin Data
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await adminAuthApi.verifySession();
            if (response.status === 200 || response.data) {
                const data = response.data?.admin || response.data;
                setAdmin(data);
                setProfileData({
                    name: data.name || data.fullName,
                    phone_number: data.phone_number || data.contactNumber
                });
            } else {
                throw new Error('Failed to load profile');
            }
        } catch (err) {
            console.error(err);
            setError('Could not load profile data');
        } finally {
            setLoading(false);
        }
    };

    // --- Profile Handlers ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            // Use existing update API or specific profile update endpoint if available
            // Assuming we use updateAdmin with current ID
            const formData = new FormData();
            formData.append('name', profileData.name);
            if (profileData.phone_number) formData.append('phone_number', profileData.phone_number);

            const response = await staffApi.updateAdmin(admin._id, formData);
            if (response.status === 200 || response.success) {
                setAdmin(prev => ({ ...prev, ...profileData }));
                setSuccessMessage('Profile updated successfully');
                setEditing(false);
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    // --- 2FA Handlers ---
    const toggle2FA = async () => {
        setToggling2FA(true);
        try {
            const newValue = !admin.isTwoFactorEnabled;
            const response = await adminAuthApi.update2FASettings(newValue);

            if (response.status === 200 || response.success) {
                setAdmin(prev => ({ ...prev, isTwoFactorEnabled: newValue }));
                setSuccessMessage(`Two-Factor Authentication ${newValue ? 'Enabled' : 'Disabled'}`);
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            setError('Failed to update 2FA settings');
        } finally {
            setToggling2FA(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <FaSpinner className="animate-spin text-4xl text-[#1a365d]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"
                >
                    <FaCheckCircle /> {successMessage}
                </motion.div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <FaExclamationTriangle /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar / Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-[#1a365d] to-[#2f855a]"></div>
                        <div className="px-6 pb-6 text-center -mt-12">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center shadow-md overflow-hidden">
                                    {admin?.profile_img_url ? (
                                        <img src={admin.profile_img_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaUserShield className="text-4xl text-gray-400" />
                                    )}
                                </div>
                                {/* <button className="absolute bottom-0 right-0 p-2 bg-[#1a365d] text-white rounded-full shadow hover:bg-[#2c5282] transition-colors">
                                    <FaCamera className="text-xs" />
                                </button> */}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mt-3">{admin?.name || admin?.fullName}</h2>
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mt-1">
                                {admin?.category === 'super-admin' || admin?.admin_category === 'super-admin' ? 'Super Admin' : 'Branch Admin'}
                            </span>
                        </div>
                        <div className="border-t border-gray-100 p-4">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FaEnvelope className="text-gray-400" />
                                    <span className="truncate">{admin?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FaPhone className="text-gray-400" />
                                    <span>{admin?.phone_number || 'Not set'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs (Vertical on Desktop) */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 space-y-1">
                        {[
                            { id: 'profile', label: 'Profile Information', icon: FaUserShield },
                            // { id: 'security', label: 'Password & Security', icon: FaLock },
                            { id: '2fa', label: 'Two-Factor Auth', icon: FaShieldAlt }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-[#1a365d] text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <tab.icon />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                    >
                        {/* --- Profile Information Tab --- */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-800">Profile Details</h3>
                                    {!editing && (
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="text-[#1a365d] text-sm hover:underline flex items-center gap-1"
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput
                                            label="Full Name"
                                            value={editing ? profileData.name : admin?.name || admin?.fullName}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            disabled={!editing}
                                        />
                                        <FormInput
                                            label="Phone Number"
                                            value={editing ? profileData.phone_number : admin?.phone_number || admin?.contactNumber || ''}
                                            onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                                            disabled={!editing}
                                            placeholder="Not set"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput
                                            label="Email Address"
                                            value={admin?.email}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                        <FormInput
                                            label="Role"
                                            value={admin?.category === 'super-admin' || admin?.admin_category === 'super-admin' ? 'Super Admin' : 'Branch Admin'}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </div>

                                    {editing && (
                                        <div className="flex justify-end gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditing(false);
                                                    setProfileData({
                                                        name: admin.name || admin.fullName,
                                                        phone_number: admin.phone_number || admin.contactNumber
                                                    });
                                                }}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={savingProfile}
                                                className="px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] flex items-center gap-2"
                                            >
                                                {savingProfile ? <FaSpinner className="animate-spin" /> : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* --- 2FA Settings Tab --- */}
                        {activeTab === '2fa' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Two-Factor Authentication</h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Add an extra layer of security to your account by enabling 2FA.
                                    </p>
                                </div>

                                <div className={`p-6 rounded-xl border ${
                                    admin?.isTwoFactorEnabled
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-gray-50 border-gray-200'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                admin?.isTwoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                                            }`}>
                                                <FaShieldAlt className="text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {admin?.isTwoFactorEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {admin?.isTwoFactorEnabled
                                                        ? 'Your account is protected with email OTP verification.'
                                                        : 'Enable 2FA to require email OTP when logging in.'}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={toggle2FA}
                                            disabled={toggling2FA}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                admin?.isTwoFactorEnabled
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-[#1a365d] text-white hover:bg-[#2c5282]'
                                            }`}
                                        >
                                            {toggling2FA ? (
                                                <FaSpinner className="animate-spin mx-auto" />
                                            ) : (
                                                admin?.isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
