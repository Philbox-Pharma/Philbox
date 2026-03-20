import { useState, useEffect, useRef } from 'react';
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
  FaEyeSlash,
} from 'react-icons/fa';
import profileService from '../../../../core/api/customer/profile.service';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // User details state
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    gender: 'Male',
    dateOfBirth: '',
    profile_img: 'https://via.placeholder.com/150',
    cover_img: 'https://via.placeholder.com/800x200',
    address: {
      street: '',
      town: '',
      city: '',
      province: '',
      zip_code: '',
      country: '',
    },
    created_at: '',
  });

  // Edit form state
  const [formData, setFormData] = useState({ ...userData });
  const profileImgInputRef = useRef(null);
  const coverImgInputRef = useRef(null);

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await profileService.getProfile();
      const profile = response.data || response;
      const parsedData = {
        fullName: profile.fullName || '',
        email: profile.email || '',
        contactNumber: profile.contactNumber || '',
        gender: profile.gender || 'Male',
        dateOfBirth: profile.dateOfBirth
          ? profile.dateOfBirth.substring(0, 10)
          : '',
        profile_img: profile.profile_img || 'https://via.placeholder.com/150',
        cover_img: profile.cover_img || 'https://via.placeholder.com/800x200',
        address: profile.address || {
          street: '',
          town: '',
          city: '',
          province: '',
          zip_code: '',
          country: '',
        },
        created_at: profile.created_at
          ? new Date(profile.created_at).toLocaleDateString()
          : 'N/A',
      };
      setUserData(parsedData);
      setFormData(parsedData);
    } catch (error) {
      console.error('Failed to load profile details', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = e => {
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

  const handleSave = async () => {
    // Basic Form Validations
    if (formData.fullName.length < 3) {
      alert('Name must be at least 3 characters.');
      return;
    }
    if (formData.contactNumber && formData.contactNumber.length < 10) {
      alert('Please provide a valid contact number.');
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        street: formData.address.street,
        town: formData.address.town,
        city: formData.address.city,
        province: formData.address.province,
        zip_code: formData.address.zip_code,
        country: formData.address.country,
      };

      await profileService.updateProfile(payload);
      setUserData({ ...formData });
      setIsEditing(false);
      alert('Profile updated successfully!');
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      console.error(error);
      alert('Failed to update profile!');
    }
  };

  const handleCancel = () => {
    setFormData({ ...userData });
    setIsEditing(false);
  };

  const handlePasswordChange = async e => {
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
    try {
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      alert('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to change password. Please check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    if (type === 'profile') {
      data.append('profile_img', file);
    } else {
      data.append('cover_img', file);
    }

    try {
      let response;
      if (type === 'profile') {
        response = await profileService.uploadProfilePicture(data);
      } else {
        response = await profileService.uploadCoverImage(data);
      }

      const updatedUrl =
        response.data?.profile_img ||
        response.data?.cover_img ||
        response.data?.url ||
        URL.createObjectURL(file);

      setUserData(prev => ({
        ...prev,
        [type === 'profile' ? 'profile_img' : 'cover_img']: updatedUrl,
      }));
      setFormData(prev => ({
        ...prev,
        [type === 'profile' ? 'profile_img' : 'cover_img']: updatedUrl,
      }));

      alert(response.message || 'Image uploaded successfully!');
      if (type === 'profile') {
        window.dispatchEvent(new Event('profileUpdated'));
      }
    } catch (error) {
      console.error('Failed to upload image', error);
      alert('Failed to upload image!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col items-center h-screen space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium tracking-wide">
          Loading Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-16 bg-gradient-to-r from-blue-300 to-blue-500">
        <img
          src={userData.cover_img}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <input
          type="file"
          ref={coverImgInputRef}
          hidden
          accept="image/*"
          onChange={e => handleImageUpload(e, 'cover')}
        />
        <button
          onClick={() => coverImgInputRef.current?.click()}
          className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          title="Upload Cover Photo"
        >
          <FaCamera />
        </button>

        {/* Profile Image */}
        <div className="absolute -bottom-12 left-6 md:left-10">
          <div className="relative">
            <img
              src={userData.profile_img}
              alt={userData.fullName}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover bg-white"
            />
            <input
              type="file"
              ref={profileImgInputRef}
              hidden
              accept="image/*"
              onChange={e => handleImageUpload(e, 'profile')}
            />
            <button
              onClick={() => profileImgInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              title="Upload Profile Photo"
            >
              <FaCamera size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Name & Edit Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {userData.fullName}
          </h1>
          <p className="text-gray-500">Member since: {userData.created_at}</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
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
      <div className="flex border-b mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {[
          { id: 'profile', label: 'Profile Info' },
          { id: 'address', label: 'Address' },
          { id: 'security', label: 'Security' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab.id
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
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <FaUser className="text-gray-400" /> Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-800 py-2 border-b border-transparent">
                    {userData.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <FaEnvelope className="text-gray-400" /> Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                    disabled
                  />
                ) : (
                  <p className="text-gray-800 py-2">{userData.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <FaPhone className="text-gray-400" /> Contact Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-800 py-2">
                    {userData.contactNumber || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <FaUser className="text-gray-400" /> Gender
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : (
                  <p className="text-gray-800 py-2">{userData.gender}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <FaCalendarAlt className="text-gray-400" /> Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-800 py-2">
                    {userData.dateOfBirth || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Delivery Address
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Street */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <FaMapMarkerAlt className="text-gray-400" /> Street Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="House/Apt, Street, Area"
                  />
                ) : (
                  <p className="text-gray-800 py-2">
                    {userData.address.street || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Town */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Town
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.town"
                    value={formData.address.town}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-800 py-2">
                    {userData.address.town || 'N/A'}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-800 py-2">
                    {userData.address.city || 'N/A'}
                  </p>
                )}
              </div>

              {/* Province */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Province/State
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.province"
                    value={formData.address.province}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-800 py-2">
                    {userData.address.province || 'N/A'}
                  </p>
                )}
              </div>

              {/* Zip Code */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Zip/Postal Code
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.zip_code"
                    value={formData.address.zip_code}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-800 py-2">
                    {userData.address.zip_code || 'N/A'}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Country
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-800 py-2">
                    {userData.address.country || 'N/A'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Security Settings
            </h2>

            {/* Change Password */}
            <div className="p-4 border rounded-lg hover:border-blue-200 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <FaLock className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Account Password
                    </p>
                    <p className="text-sm text-gray-500">
                      Change your account credentials regularly.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full sm:w-auto px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Current Password
                </label>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={e =>
                    setPasswordData(prev => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full pl-3 pr-10 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords(prev => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  New Password
                </label>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={e =>
                    setPasswordData(prev => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full pl-3 pr-10 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords(prev => ({ ...prev, new: !prev.new }))
                  }
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={e =>
                    setPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full pl-3 pr-10 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords(prev => ({
                      ...prev,
                      confirm: !prev.confirm,
                    }))
                  }
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="flex gap-3 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                >
                  {passwordLoading ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
