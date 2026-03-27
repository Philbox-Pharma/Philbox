import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FaUserMd,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaBriefcase,
  FaStethoscope,
  FaMoneyBillWave,
  FaLock,
  FaCheckCircle,
  FaExclamationCircle,
  FaVideo,
  FaClinicMedical,
  FaGlobe,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { doctorProfileApi } from '../../../../core/api/doctor/profile.service';

export default function DoctorProfile() {
  const { doctor, setDoctor } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit modes
  const [editingBasic, setEditingBasic] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Form data
  const [basicForm, setBasicForm] = useState({
    name: '',
    specialization: '',
    bio: '',
    phone_number: '',
    qualifications: '',
    experience_years: '',
  });
  const [consultationType, setConsultationType] = useState('both');
  const [consultationFee, setConsultationFee] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const profileImageRef = useRef(null);

  // ==========================================
  // FETCH PROFILE
  // ==========================================
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorProfileApi.getProfile();
      const data = response.data || {};
      setProfile(data);

      setBasicForm({
        name: data.name || data.fullName || '',
        specialization: data.specialization || '',
        bio: data.bio || '',
        phone_number: data.phone_number || '',
        qualifications: Array.isArray(data.qualifications)
          ? data.qualifications.join(', ')
          : data.qualifications || '',
        experience_years: data.experience_years || '',
      });
      setConsultationType(data.consultation_type || 'both');
      setConsultationFee(data.consultation_fee || '');
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const showMessage = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccess(msg);
      setError('');
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(msg);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleUpdateBasic = async () => {
    try {
      setSaving(true);
      const payload = {
        name: basicForm.name,
        specialization: basicForm.specialization,
        bio: basicForm.bio,
        phone_number: basicForm.phone_number,
        experience_years: basicForm.experience_years
          ? Number(basicForm.experience_years)
          : undefined,
      };
      if (basicForm.qualifications) {
        payload.qualifications = basicForm.qualifications
          .split(',')
          .map((q) => q.trim())
          .filter(Boolean);
      }

      await doctorProfileApi.updateProfile(payload);
      showMessage('Profile updated successfully!');
      setEditingBasic(false);
      fetchProfile();

      // Update layout doctor data
      if (setDoctor) {
        setDoctor({
          ...doctor,
          name: basicForm.name,
          specialization: basicForm.specialization,
        });
      }
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateConsultationType = async () => {
    try {
      setSaving(true);
      await doctorProfileApi.updateConsultationType(consultationType);
      showMessage('Consultation type updated!');
      setEditingConsultation(false);
      fetchProfile();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateFee = async () => {
    try {
      setSaving(true);
      await doctorProfileApi.updateConsultationFee(Number(consultationFee));
      showMessage('Consultation fee updated!');
      fetchProfile();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update fee.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const response = await doctorProfileApi.updateProfileImage(file);
      showMessage('Profile image updated!');
      fetchProfile();
      if (setDoctor && response.data?.profile_img_url) {
        setDoctor({ ...doctor, profile_img_url: response.data.profile_img_url });
      }
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to upload image.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('Passwords do not match.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showMessage('Password must be at least 8 characters.', 'error');
      return;
    }

    try {
      setSaving(true);
      await doctorProfileApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      showMessage('Password changed successfully!');
      setChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <svg
          className="animate-spin h-10 w-10 text-emerald-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Messages */}
      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Cover */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 relative">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden">
              {profile?.profile_img_url ? (
                <img
                  src={profile.profile_img_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                (profile?.name || 'D').charAt(0).toUpperCase()
              )}
            </div>
            <button
              onClick={() => profileImageRef.current?.click()}
              disabled={saving}
              className="absolute bottom-1 left-20 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-emerald-600 transition-colors border border-gray-200"
            >
              <FaCamera size={12} />
            </button>
            <input
              ref={profileImageRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Dr. {profile?.name || profile?.fullName || 'Doctor'}
              </h1>
              <p className="text-sm text-emerald-600 font-medium mt-0.5">
                {profile?.specialization || 'General Physician'}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                {profile?.email && (
                  <span className="flex items-center gap-1.5">
                    <FaEnvelope size={11} /> {profile.email}
                  </span>
                )}
                {profile?.phone_number && (
                  <span className="flex items-center gap-1.5">
                    <FaPhone size={11} /> {profile.phone_number}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`badge flex items-center gap-1 ${
                  profile?.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {profile?.status === 'approved' ? (
                  <FaCheckCircle size={10} />
                ) : (
                  <FaExclamationCircle size={10} />
                )}
                {profile?.status === 'approved' ? 'Verified' : profile?.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <FaUserMd className="text-emerald-500" size={14} />
            Basic Information
          </h2>
          {!editingBasic ? (
            <button
              onClick={() => setEditingBasic(true)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <FaEdit size={12} /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingBasic(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={14} />
              </button>
              <button
                onClick={handleUpdateBasic}
                disabled={saving}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                <FaSave size={12} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          {editingBasic ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  value={basicForm.name}
                  onChange={(e) => setBasicForm({ ...basicForm, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Specialization</label>
                <input
                  type="text"
                  value={basicForm.specialization}
                  onChange={(e) =>
                    setBasicForm({ ...basicForm, specialization: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Phone Number</label>
                <input
                  type="text"
                  value={basicForm.phone_number}
                  onChange={(e) =>
                    setBasicForm({ ...basicForm, phone_number: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Experience (Years)</label>
                <input
                  type="number"
                  value={basicForm.experience_years}
                  onChange={(e) =>
                    setBasicForm({ ...basicForm, experience_years: e.target.value })
                  }
                  className="input-field"
                  min="0"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Qualifications (comma-separated)</label>
                <input
                  type="text"
                  value={basicForm.qualifications}
                  onChange={(e) =>
                    setBasicForm({ ...basicForm, qualifications: e.target.value })
                  }
                  className="input-field"
                  placeholder="MBBS, MD, FCPS..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Bio</label>
                <textarea
                  value={basicForm.bio}
                  onChange={(e) => setBasicForm({ ...basicForm, bio: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Tell patients about yourself..."
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={FaUserMd} label="Full Name" value={profile?.name || '—'} />
              <InfoRow icon={FaStethoscope} label="Specialization" value={profile?.specialization || '—'} />
              <InfoRow icon={FaEnvelope} label="Email" value={profile?.email || '—'} />
              <InfoRow icon={FaPhone} label="Phone" value={profile?.phone_number || '—'} />
              <InfoRow
                icon={FaBriefcase}
                label="Experience"
                value={profile?.experience_years ? `${profile.experience_years} years` : '—'}
              />
              <InfoRow
                icon={FaGraduationCap}
                label="Qualifications"
                value={
                  Array.isArray(profile?.qualifications)
                    ? profile.qualifications.join(', ')
                    : profile?.qualifications || '—'
                }
              />
              {profile?.bio && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Bio</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Consultation Settings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <FaStethoscope className="text-blue-500" size={14} />
            Consultation Settings
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Consultation Type */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Consultation Type</label>
              {!editingConsultation ? (
                <button
                  onClick={() => setEditingConsultation(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <FaEdit size={12} /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingConsultation(false)} className="text-sm text-gray-500">
                    <FaTimes size={14} />
                  </button>
                  <button
                    onClick={handleUpdateConsultationType}
                    disabled={saving}
                    className="text-sm text-blue-600 font-medium flex items-center gap-1"
                  >
                    <FaSave size={12} /> Save
                  </button>
                </div>
              )}
            </div>

            {editingConsultation ? (
              <div className="flex gap-3">
                {[
                  { value: 'online', label: 'Online Only', icon: FaVideo, color: 'blue' },
                  { value: 'in-person', label: 'In-Person Only', icon: FaClinicMedical, color: 'purple' },
                  { value: 'both', label: 'Both', icon: FaGlobe, color: 'emerald' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setConsultationType(opt.value)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-1.5 ${
                      consultationType === opt.value
                        ? `border-${opt.color}-500 bg-${opt.color}-50 text-${opt.color}-700`
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <opt.icon size={16} />
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {profile?.consultation_type === 'online' && (
                  <span className="badge bg-blue-100 text-blue-700 flex items-center gap-1">
                    <FaVideo size={10} /> Online
                  </span>
                )}
                {profile?.consultation_type === 'in-person' && (
                  <span className="badge bg-purple-100 text-purple-700 flex items-center gap-1">
                    <FaClinicMedical size={10} /> In-Person
                  </span>
                )}
                {profile?.consultation_type === 'both' && (
                  <span className="badge bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <FaGlobe size={10} /> Online & In-Person
                  </span>
                )}
                {!profile?.consultation_type && (
                  <span className="text-sm text-gray-500">Not set</span>
                )}
              </div>
            )}
          </div>

          {/* Consultation Fee */}
          <div className="border-t border-gray-100 pt-5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
              <FaMoneyBillWave className="text-green-500" size={13} />
              Consultation Fee (PKR)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                className="input-field !w-48"
                min="0"
                placeholder="e.g., 1500"
              />
              <button
                onClick={handleUpdateFee}
                disabled={saving}
                className="btn-primary !w-auto px-5 text-sm !bg-emerald-600 hover:!bg-emerald-700"
              >
                {saving ? 'Saving...' : 'Update Fee'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <FaLock className="text-red-500" size={14} />
            Security
          </h2>
          {!changingPassword && (
            <button
              onClick={() => setChangingPassword(true)}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Change Password
            </button>
          )}
        </div>

        {changingPassword && (
          <div className="p-6">
            <div className="max-w-md space-y-4">
              <div>
                <label className="input-label">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="input-field"
                  minLength={8}
                />
              </div>
              <div>
                <label className="input-label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="btn-secondary !w-auto px-5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={
                    saving ||
                    !passwordForm.currentPassword ||
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword
                  }
                  className="btn-primary !w-auto px-5 !bg-red-600 hover:!bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!changingPassword && (
          <div className="p-6">
            <p className="text-sm text-gray-500">
              Keep your account secure by using a strong password.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// INFO ROW COMPONENT
// ==========================================
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="text-gray-500" size={13} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
