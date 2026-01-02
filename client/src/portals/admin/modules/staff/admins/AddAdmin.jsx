// src/portals/admin/modules/staff/admins/AddAdmin.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaSave,
  FaUserShield,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaSpinner,
  FaCamera,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCodeBranch,
  FaExclamationTriangle,
  FaShieldAlt,
  FaToggleOn,
  FaToggleOff,
} from 'react-icons/fa';
import {
  FormInput,
  FormSelect,
  FormMultiSelect,
} from '../../../../../shared/components/Form';
import { staffApi, branchApi } from '../../../../../core/api/admin/adminApi';

export default function AddAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Branch options
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchLoading, setBranchLoading] = useState(true);

  // Image States
  const [profileImg, setProfileImg] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverImg, setCoverImg] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // File Input Refs
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    category: 'branch-admin',
    status: 'active',
    isTwoFactorEnabled: false,
    branches_managed: [],
  });

  const categoryOptions = [
    { value: 'branch-admin', label: 'Branch Admin' },
    { value: 'super-admin', label: 'Super Admin' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
  ];

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      setBranchLoading(true);
      try {
        const response = await branchApi.getAll(1, 100, { status: 'Active' });
        if (response.status === 200 || response.data) {
          const branches = response.data?.branches || [];
          setBranchOptions(
            branches.map(b => ({
              value: b._id,
              label: `${b.name} (${b.code})`,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch branches:', err);
        // Mock data
        setBranchOptions([
          {
            value: '507f1f77bcf86cd799439011',
            label: 'Lahore Main Branch (PHIL25#001)',
          },
          {
            value: '507f1f77bcf86cd799439012',
            label: 'Karachi Branch (PHIL25#002)',
          },
        ]);
      } finally {
        setBranchLoading(false);
      }
    };
    fetchBranches();
  }, []);

  // Validation Rules (matching backend DTO)
  const validationRules = {
    name: {
      required: true,
      minLength: 3,
      message: {
        required: 'Name is required',
        minLength: 'Minimum 3 characters',
      },
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: {
        required: 'Email is required',
        pattern: 'Invalid email format',
      },
    },
    password: {
      required: true,
      minLength: 8,
      message: {
        required: 'Password is required',
        minLength: 'Minimum 8 characters',
      },
    },
    category: {
      required: true,
      message: { required: 'Please select a category' },
    },
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    const val = typeof value === 'string' ? value.trim() : value;

    if (rules.required && !val) {
      return rules.message.required;
    }

    if (!val) return '';

    if (rules.minLength && val.length < rules.minLength) {
      return rules.message.minLength;
    }

    if (rules.pattern && !rules.pattern.test(val)) {
      return rules.message.pattern;
    }

    return '';
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBranchChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Image Handlers
  const handleProfileImgChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profileImg: 'Image must be less than 5MB',
        }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profileImg: 'Please select an image file',
        }));
        return;
      }
      setProfileImg(file);
      setProfilePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, profileImg: '' }));
    }
  };

  const handleCoverImgChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          coverImg: 'Image must be less than 10MB',
        }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          coverImg: 'Please select an image file',
        }));
        return;
      }
      setCoverImg(file);
      setCoverPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, coverImg: '' }));
    }
  };

  const removeProfileImg = () => {
    setProfileImg(null);
    setProfilePreview(null);
    if (profileInputRef.current) profileInputRef.current.value = '';
  };

  const removeCoverImg = () => {
    setCoverImg(null);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate all fields
    const allTouched = Object.keys(validationRules).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    const newErrors = {};
    let isValid = true;
    Object.keys(validationRules).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) {
        newErrors[key] = err;
        isValid = false;
      }
    });
    setErrors(newErrors);

    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      // Create FormData for multipart/form-data
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('email', formData.email.trim().toLowerCase());
      submitData.append('password', formData.password);
      submitData.append('category', formData.category);
      submitData.append('status', formData.status);
      submitData.append('isTwoFactorEnabled', formData.isTwoFactorEnabled);

      if (formData.phone_number) {
        submitData.append('phone_number', formData.phone_number.trim());
      }

      // Append branches_managed as JSON array
      if (formData.branches_managed.length > 0) {
        formData.branches_managed.forEach((branchId, index) => {
          submitData.append(`branches_managed[${index}]`, branchId);
        });
      }

      if (profileImg) {
        submitData.append('profile_img', profileImg);
      }

      if (coverImg) {
        submitData.append('cover_img', coverImg);
      }

      const response = await staffApi.createAdmin(submitData);

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.success
      ) {
        navigate('/admin/staff/admins', {
          state: {
            message: 'Admin created successfully! Credentials sent to email.',
          },
        });
      } else {
        throw new Error(response.message || 'Failed to create admin');
      }
    } catch (err) {
      console.error('Submit failed:', err);

      // Handle backend validation errors
      if (err.data?.error && Array.isArray(err.data.error)) {
        const backendErrors = {};
        err.data.error.forEach(errMsg => {
          const match = errMsg.match(/"(\w+)"/);
          if (match) {
            backendErrors[match[1]] = errMsg.replace(/"/g, '');
          }
        });
        setErrors(prev => ({
          ...prev,
          ...backendErrors,
          submit: 'Please fix the errors below',
        }));
      } else {
        setErrors({ submit: err.message || 'Failed to create admin' });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/staff/admins"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Add New Admin
          </h1>
          <p className="text-gray-600 text-sm">
            Create a new administrator account
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Error Banner */}
        {errors.submit && (
          <div className="bg-red-50 p-4 text-red-700 border-b border-red-200 flex items-center gap-2">
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{errors.submit}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-8">
          {/* Cover Image Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCamera className="text-[#1a365d]" /> Profile Images
            </h2>

            {/* Cover Image */}
            <div className="relative mb-6">
              <div className="h-32 sm:h-40 bg-gradient-to-r from-[#1a365d] to-[#2c5282] rounded-xl overflow-hidden">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
                    <span>Cover Image (Optional)</span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-3 right-3 flex gap-2">
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverImgChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
                  title="Upload Cover"
                >
                  <FaCamera className="text-gray-600" />
                </button>
                {coverPreview && (
                  <button
                    type="button"
                    onClick={removeCoverImg}
                    className="p-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                    title="Remove Cover"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              {errors.coverImg && (
                <p className="text-red-500 text-xs mt-1">{errors.coverImg}</p>
              )}
            </div>

            {/* Profile Image */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUserShield className="text-3xl sm:text-4xl text-gray-400" />
                  )}
                </div>

                <input
                  type="file"
                  ref={profileInputRef}
                  onChange={handleProfileImgChange}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-[#1a365d] text-white rounded-lg shadow hover:bg-[#2c5282]"
                  title="Upload Photo"
                >
                  <FaCamera className="text-xs" />
                </button>
              </div>

              <div>
                <p className="font-medium text-gray-700">Profile Photo</p>
                <p className="text-sm text-gray-500">JPG, PNG. Max 5MB</p>
                {profilePreview && (
                  <button
                    type="button"
                    onClick={removeProfileImg}
                    className="text-red-500 text-sm hover:underline mt-1"
                  >
                    Remove Photo
                  </button>
                )}
                {errors.profileImg && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.profileImg}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserShield className="text-[#1a365d]" /> Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name}
                placeholder="Enter full name"
                required
              />

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                icon={FaEnvelope}
                placeholder="admin@philbox.com"
                required
              />

              <FormInput
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phone_number}
                icon={FaPhone}
                placeholder="+92-300-1234567"
              />

              <FormSelect
                label="Admin Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.category}
                options={categoryOptions}
                required
              />

              <FormSelect
                label="Account Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
              />

              {/* Password Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter password (min 8 characters)"
                    className={`w-full pl-10 pr-12 py-2.5 rounded-lg border transition-all duration-200 ${
                      errors.password
                        ? 'border-red-500 focus:ring-red-500 ring-1 ring-red-100'
                        : 'border-gray-300 focus:ring-[#1a365d] focus:border-[#1a365d] focus:ring-2 focus:ring-opacity-20'
                    } focus:outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Branch Assignment (for branch-admin) */}
          {formData.category === 'branch-admin' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCodeBranch className="text-[#1a365d]" /> Branch Assignment
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Branch(es)
                </label>
                {branchLoading ? (
                  <div className="flex items-center gap-2 text-gray-500 py-2">
                    <FaSpinner className="animate-spin" /> Loading branches...
                  </div>
                ) : (
                  <FormMultiSelect
                    name="branches_managed"
                    value={formData.branches_managed}
                    onChange={handleBranchChange}
                    options={branchOptions}
                    placeholder="Select branches (optional)"
                  />
                )}
                <p className="text-gray-500 text-xs mt-1">
                  You can assign branches later from admin details page
                </p>
              </div>
            </div>
          )}

          {/* Security Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-[#1a365d]" /> Security Settings
            </h2>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-500">
                    Require OTP verification on login
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      isTwoFactorEnabled: !prev.isTwoFactorEnabled,
                    }))
                  }
                  className="flex items-center gap-2 text-2xl transition-colors"
                >
                  {formData.isTwoFactorEnabled ? (
                    <FaToggleOn className="text-green-500" />
                  ) : (
                    <FaToggleOff className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> An email with login credentials will be
              sent to the admin's email address after successful creation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row justify-end gap-3">
          <Link
            to="/admin/staff/admins"
            className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FaSave />
                Create Admin
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
