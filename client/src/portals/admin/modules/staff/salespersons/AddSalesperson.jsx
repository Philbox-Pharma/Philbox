/* eslint-disable no-unused-vars */
// src/portals/admin/modules/staff/salespersons/AddSalesperson.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaSave,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaSpinner,
  FaVenusMars,
  FaBirthdayCake,
  FaEye,
  FaCodeBranch,
  FaCamera,
  FaTrash,
} from 'react-icons/fa';
import { useRef } from 'react';
import {
  FormInput,
  FormSelect,
  FormMultiSelect,
} from '../../../../../shared/components/Form';
import { staffApi, branchApi } from '../../../../../core/api/admin/adminApi';

export default function AddSalesperson() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Branch options for assignment
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
    fullName: '',
    email: '',
    password: '',
    contactNumber: '',
    gender: '',
    dateOfBirth: '',
    branches_to_be_managed: [],
  });

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  // Fetch branches for dropdown
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
      } finally {
        setBranchLoading(false);
      }
    };
    fetchBranches();
  }, []);

  // Validation Rules (matching backend DTO)
  const validationRules = {
    fullName: {
      required: true,
      minLength: 3,
      maxLength: 50,
      message: {
        required: 'Full name is required',
        minLength: 'Minimum 3 characters',
        maxLength: 'Maximum 50 characters',
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
    contactNumber: {
      required: true,
      pattern: /^[0-9]{11}$/,
      message: {
        required: 'Phone number is required',
        pattern: 'Phone number must be exactly 11 digits',
      },
    },
    gender: {
      required: true,
      message: { required: 'Please select gender' },
    },
    branches_to_be_managed: {
      required: true,
      minLength: 1,
      message: {
        required: 'At least one branch must be assigned',
        minLength: 'At least one branch must be assigned',
      },
    },
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    // Handle arrays
    if (Array.isArray(value)) {
      if (rules.required && value.length === 0) {
        return rules.message.required;
      }
      if (rules.minLength && value.length < rules.minLength) {
        return rules.message.minLength;
      }
      return '';
    }

    const val = typeof value === 'string' ? value.trim() : value;

    if (rules.required && !val) {
      return rules.message.required;
    }

    if (!val) return '';

    if (rules.minLength && val.length < rules.minLength) {
      return rules.message.minLength;
    }

    if (rules.maxLength && val.length > rules.maxLength) {
      return rules.message.maxLength;
    }

    if (rules.pattern && !rules.pattern.test(val)) {
      return rules.message.pattern;
    }

    return '';
  };

  // --- Image Handlers ---
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [type]: 'Image size must be less than 5MB',
        }));
        return;
      }
      setErrors(prev => ({ ...prev, [type]: null }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profileImg') {
          setProfileImg(file);
          setProfilePreview(reader.result);
        } else {
          setCoverImg(file);
          setCoverPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
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

  const handleChange = e => {
    const { name, value } = e.target;

    // Only allow digits for phone number
    if (name === 'contactNumber') {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBranchChange = e => {
    // e is event object from FormMultiSelect: { target: { name, value } }
    const selectedBranches = e.target ? e.target.value : e;

    setFormData(prev => ({
      ...prev,
      branches_to_be_managed: selectedBranches,
    }));

    if (touched.branches_to_be_managed) {
      setErrors(prev => ({
        ...prev,
        branches_to_be_managed: validateField(
          'branches_to_be_managed',
          selectedBranches
        ),
      }));
    }
  };
  const handleBlur = e => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
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
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName.trim());
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('password', formData.password);
      formDataToSend.append('contactNumber', formData.contactNumber.trim());
      formDataToSend.append('gender', formData.gender);
      
      formData.branches_to_be_managed.forEach(branch => {
        formDataToSend.append('branches_to_be_managed[]', branch);
      });

      // Add optional dateOfBirth if provided
      if (formData.dateOfBirth) {
        formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      }
      
      if (profileImg) {
        formDataToSend.append('profile_img', profileImg);
      }
      if (coverImg) {
        formDataToSend.append('cover_img', coverImg);
      }

      const response = await staffApi.createSalesperson(formDataToSend);

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.success
      ) {
        navigate('/admin/staff/salespersons', {
          state: {
            message:
              'Salesperson created successfully! Credentials sent to email.',
          },
        });
      } else {
        throw new Error(response.message || 'Failed to create salesperson');
      }
    } catch (err) {
      console.error('Submit failed:', err);

      // Handle validation errors from backend
      if (err.data?.error && Array.isArray(err.data.error)) {
        const backendErrors = {};
        err.data.error.forEach(errMsg => {
          // Parse error messages like '"fullName" is required'
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
        setErrors({ submit: err.message || 'Failed to create salesperson' });
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
          to="/admin/staff/salespersons"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Add New Salesperson
          </h1>
          <p className="text-gray-600">Create a new salesperson account</p>
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
            <span className="font-medium">Error:</span> {errors.submit}
          </div>
        )}

        <div className="p-6 space-y-8">
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
                  onChange={(e) => handleImageChange(e, 'coverImg')}
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
                    <FaUserTie className="text-3xl sm:text-4xl text-gray-400" />
                  )}
                </div>

                <input
                  type="file"
                  ref={profileInputRef}
                  onChange={(e) => handleImageChange(e, 'profileImg')}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2 bg-[#1a365d] text-white rounded-lg shadow hover:bg-[#2c5282]"
                  title="Upload Profile Picture"
                >
                  <FaCamera className="text-sm" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-800">Profile Picture</h3>
                  {profilePreview && (
                    <button
                      type="button"
                      onClick={removeProfileImg}
                      className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                      <FaTrash className="text-xs" /> Remove
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a professional photo. Recommended size 400x400px.
                  <br /> Max size: 5MB. Formats: JPG, PNG.
                </p>
                {errors.profileImg && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.profileImg}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserTie className="text-[#1a365d]" /> Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.fullName}
                placeholder="Enter full name (3-50 characters)"
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
                placeholder="salesperson@philbox.com"
                required
              />

              <FormInput
                label="Phone Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.contactNumber}
                icon={FaPhone}
                placeholder="03XXXXXXXXX"
                maxLength={11}
                required
              />

              <FormSelect
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.gender}
                options={genderOptions}
                placeholder="Select gender"
                required
              />

              <FormInput
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                icon={FaBirthdayCake}
              />

              <div className="md:col-span-2">
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  icon={FaLock}
                  placeholder="Enter password (min 8 characters)"
                  required
                />
              </div>
            </div>
          </div>

          {/* Branch Assignment */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCodeBranch className="text-[#1a365d]" /> Branch Assignment
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Branch(es) <span className="text-red-500">*</span>
              </label>
              {branchLoading ? (
                <div className="flex items-center gap-2 text-gray-500 py-2">
                  <FaSpinner className="animate-spin" /> Loading branches...
                </div>
              ) : (
                <FormMultiSelect
                  name="branches_to_be_managed"
                  value={formData.branches_to_be_managed}
                  onChange={handleBranchChange}
                  options={branchOptions}
                  placeholder="Select one or more branches"
                  error={errors.branches_to_be_managed}
                />
              )}
              {errors.branches_to_be_managed && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.branches_to_be_managed}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                At least one branch must be assigned
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> An email with login credentials will be
              sent to the salesperson's email address after successful creation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row justify-end gap-3">
          <Link
            to="/admin/staff/salespersons"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FaSave />
                Create Salesperson
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
