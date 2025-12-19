import { useState } from 'react';
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaEdit,
    FaCamera,
    FaSave,
    FaTimes,
    FaLock,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Mock user data
    const [userData, setUserData] = useState({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '03001234567',
        gender: 'Male',
        dateOfBirth: '1990-05-15',
        profileImage: 'https://via.placeholder.com/150x150?text=JD',
        coverImage: 'https://via.placeholder.com/800x200?text=Cover',
        address: {
            street: 'House 12, Street 5, Block B',
            city: 'Lahore',
            province: 'Punjab',
            zipCode: '54000',
            country: 'Pakistan',
        },
        createdAt: '2023-06-15',
    });

    // Form state for editing
    const [formData, setFormData] = useState({ ...userData });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value,
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Handle save
    const handleSave = async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUserData({ ...formData });
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    // Handle cancel edit
    const handleCancel = () => {
        setFormData({ ...userData });
        setIsEditing(false);
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters!');
            return;
        }

        setPasswordLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        alert('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
        setPasswordLoading(false);
    };

    // Handle image upload
    const handleImageUpload = (type) => {
        // In real app: Open file picker and upload
        alert(`Upload ${type} image - Feature coming soon!`);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Cover Image */}
            <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-16">
                <img
                    src={userData.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <button
                    onClick={() => handleImageUpload('cover')}
                    className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                >
                    <FaCamera />
                </button>

                {/* Profile Image */}
                <div className="absolute -bottom-12 left-6 md:left-10">
                    <div className="relative">
                        <img
                            src={userData.profileImage}
                            alt={userData.fullName}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover bg-white"
                        />
                        <button
                            onClick={() => handleImageUpload('profile')}
                            className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        >
                            <FaCamera size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Name & Edit Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-2">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{userData.fullName}</h1>
                    <p className="text-gray-500">Member since {userData.createdAt}</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <FaEdit />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaTimes />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <FaSave />
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-6">
                {[
                    { id: 'profile', label: 'Profile Info' },
                    { id: 'address', label: 'Address' },
                    { id: 'security', label: 'Security' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                {/* Profile Info Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <FaUser className="text-gray-400" />
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                ) : (
                                    <p className="text-gray-800 py-2">{userData.fullName}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <FaEnvelope className="text-gray-400" />
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-field"
                                        disabled
                                    />
                                ) : (
                                    <p className="text-gray-800 py-2">{userData.email}</p>
                                )}
                                {isEditing && (
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <FaPhone className="text-gray-400" />
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                ) : (
                                    <p className="text-gray-800 py-2">{userData.phone}</p>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <FaUser className="text-gray-400" />
                                    Gender
                                </label>
                                {isEditing ? (
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-800 py-2">{userData.gender}</p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <FaCalendarAlt className="text-gray-400" />
                                    Date of Birth
                                </label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                ) : (
                                    <p className="text-gray-800 py-2">{userData.dateOfBirth}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Address Tab */}
                {activeTab === 'address' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Street */}
                            <div className="md:col-span-2">
                                <label className="input-label flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-gray-400" />
                                    Street Address
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="address.street"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="House/Apt, Street, Area"
                                    />
                                ) : (
                                    <p className="text-gray-800 py-2">{userData.address.street}</p>
                                )}
                            </div>

                            {/* City */}
                            <div>
                                <label className="input-label">City</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                ) : (
                                    <p className="text-gray-800 py-2">{userData.address.city}</p>
                                )}
                            </div>

                            {/* Province */}
                            <div>
                                <label className="input-label">Province/State</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="address.province"
                                        value={formData.address.province}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                ) : (
                                    <p className="text-gray-800 py-2">{userData.address.province}</p>
                                )}
                            </div>

                            {/* Zip Code */}
                            <div>
                                <label className="input-label">Zip/Postal Code</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="address.zipCode"
                                        value={formData.address.zipCode}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                ) : (
                                    <p className="text-gray-800 py-2">{userData.address.zipCode}</p>
                                )}
                            </div>

                            {/* Country */}
                            <div>
                                <label className="input-label">Country</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="address.country"
                                        value={formData.address.country}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                ) : (
                                    <p className="text-gray-800 py-2">{userData.address.country}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h2>

                        {/* Change Password */}
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FaLock className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Password</p>
                                        <p className="text-sm text-gray-500">Change your account password</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>

                        {/* Two Factor Auth - Future */}
                        <div className="p-4 border rounded-lg opacity-60">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <FaLock className="text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-lg">
                                    Coming Soon
                                </span>
                            </div>
                        </div>

                        {/* Delete Account - Future */}
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-red-800">Delete Account</p>
                                    <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                                </div>
                                <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {/* Current Password */}
                            <div className="relative">
                                <label className="input-label">Current Password</label>
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="input-field pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>

                            {/* New Password */}
                            <div className="relative">
                                <label className="input-label">New Password</label>
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="input-field pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>

                            {/* Confirm Password */}
                            <div className="relative">
                                <label className="input-label">Confirm New Password</label>
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="input-field pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>

                            <p className="text-xs text-gray-500">
                                Password must be at least 6 characters long
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                                >
                                    {passwordLoading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
