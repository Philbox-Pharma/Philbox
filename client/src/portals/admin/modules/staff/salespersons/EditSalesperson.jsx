/* eslint-disable no-unused-vars */
// src/portals/admin/modules/staff/salespersons/EditSalesperson.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaSave,
  FaUserTie,
  FaPhone,
  FaSpinner,
  FaVenusMars,
  FaBirthdayCake,
  FaCodeBranch,
  FaExclamationTriangle,
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

export default function EditSalesperson() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Original data for comparison
  const [originalData, setOriginalData] = useState(null);

  // Branch options
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchLoading, setBranchLoading] = useState(true);

  // Image States
  const [profileImg, setProfileImg] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverImg, setCoverImg] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);

  // File Input Refs
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    gender: '',
    dateOfBirth: '',
    branches_to_be_managed: [],
  });

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  // Fetch salesperson and branches
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch branches
      setBranchLoading(true);
      const branchResponse = await branchApi.getAll(1, 100, {
        status: 'Active',
      });
      if (branchResponse.status === 200 || branchResponse.data) {
        const branches = branchResponse.data?.branches || [];
        setBranchOptions(
          branches.map(b => ({
            value: b._id,
            label: `${b.name} (${b.code})`,
          }))
        );
      }
      setBranchLoading(false);

      // Fetch salesperson
      const spResponse = await staffApi.getSalespersonById(id);
      if (spResponse.status === 200 || spResponse.data) {
        const person = spResponse.data;
        const formValues = {
          fullName: person.fullName || '',
          contactNumber: person.contactNumber || '',
          gender: person.gender || '',
          dateOfBirth: person.dateOfBirth
            ? person.dateOfBirth.split('T')[0]
            : '',
          branches_to_be_managed:
            person.branches_to_be_managed?.map(b => b._id) || [],
        };
        setFormData(formValues);
        setOriginalData({
          ...formValues,
          email: person.email,
          profile_img_url: person.profile_img_url || null,
          cover_img_url: person.cover_img_url || null,
        });

        if (person.profile_img_url) setProfilePreview(person.profile_img_url);
        if (person.cover_img_url) setCoverPreview(person.cover_img_url);
      } else {
        throw new Error(spResponse.message || 'Failed to fetch salesperson');
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load salesperson data');

      setBranchLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Validation rules (matching backend DTO)
  const validationRules = {
    fullName: {
      minLength: 3,
      maxLength: 50,
      message: {
        minLength: 'Minimum 3 characters',
        maxLength: 'Maximum 50 characters',
      },
    },
    contactNumber: {
      pattern: /^[0-9]{11}$/,
      message: {
        pattern: 'Phone number must be exactly 11 digits',
      },
    },
    branches_to_be_managed: {
      minLength: 1,
      message: {
        minLength: 'At least one branch must be assigned',
      },
    },
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    // Handle arrays
    if (Array.isArray(value)) {
      if (rules.minLength && value.length < rules.minLength) {
        return rules.message.minLength;
      }
      return '';
    }

    const val = typeof value === 'string' ? value.trim() : value;

    if (!val) return ''; // Optional fields

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched.branches_to_be_managed) {
      setErrors(prev => ({
        ...prev,
        branches_to_be_managed: validateField('branches_to_be_managed', value),
      }));
    }
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
        setErrors(prev => ({ ...prev, profileImg: 'Image must be less than 5MB' }));
        return;
      }
      setProfileImg(file);
      setProfilePreview(URL.createObjectURL(file));
      setRemoveProfileImage(false);
      setErrors(prev => ({ ...prev, profileImg: '' }));
    }
  };

  const handleCoverImgChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, coverImg: 'Image must be less than 10MB' }));
        return;
      }
      setCoverImg(file);
      setCoverPreview(URL.createObjectURL(file));
      setRemoveCoverImage(false);
      setErrors(prev => ({ ...prev, coverImg: '' }));
    }
  };

  const handleRemoveProfileImg = () => {
    setProfileImg(null);
    setProfilePreview(null);
    setRemoveProfileImage(true);
    if (profileInputRef.current) profileInputRef.current.value = '';
  };

  const handleRemoveCoverImg = () => {
    setCoverImg(null);
    setCoverPreview(null);
    setRemoveCoverImage(true);
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

    // Validate fields that have values
    Object.keys(validationRules).forEach(key => {
      const value = formData[key];
      // For arrays, always validate
      // For strings, only validate if there's a value
      if (Array.isArray(value) || (value && value.trim())) {
        const err = validateField(key, value);
        if (err) {
          newErrors[key] = err;
          isValid = false;
        }
      }
    });

    // At least fullName should be present
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

    // Branches must be selected
    if (formData.branches_to_be_managed.length === 0) {
      newErrors.branches_to_be_managed = 'At least one branch must be assigned';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      // Build payload with only changed/valid fields
      const submitData = new FormData();

      if (formData.fullName.trim() && formData.fullName !== originalData?.fullName) {
        submitData.append('fullName', formData.fullName.trim());
      }

      if (formData.contactNumber.trim() && formData.contactNumber !== originalData?.contactNumber) {
        submitData.append('contactNumber', formData.contactNumber.trim());
      }

      if (formData.gender && formData.gender !== originalData?.gender) {
        submitData.append('gender', formData.gender);
      }

      if (formData.dateOfBirth && formData.dateOfBirth !== originalData?.dateOfBirth) {
        submitData.append('dateOfBirth', formData.dateOfBirth);
      }

      const branchesChanged =
        JSON.stringify([...formData.branches_to_be_managed].sort()) !==
        JSON.stringify([...(originalData?.branches_to_be_managed || [])].sort());

      if (branchesChanged) {
        if (formData.branches_to_be_managed.length > 0) {
          formData.branches_to_be_managed.forEach((branchId) => {
            submitData.append('branches_to_be_managed[]', branchId);
          });
        }
      }

      // Handle images
      if (profileImg) {
        submitData.append('profile_img', profileImg);
      } else if (removeProfileImage) {
        submitData.append('remove_profile_img', 'true');
      }

      if (coverImg) {
        submitData.append('cover_img', coverImg);
      } else if (removeCoverImage) {
        submitData.append('remove_cover_img', 'true');
      }

      const response = await staffApi.updateSalesperson(id, submitData);

      if (response.status === 200 || response.success) {
        navigate(`/admin/staff/salespersons/${id}`, {
          state: { message: 'Salesperson updated successfully!' },
        });
      } else {
        throw new Error(response.message || 'Failed to update salesperson');
      }
    } catch (err) {
      console.error('Update failed:', err);

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
        setErrors({ submit: err.message || 'Failed to update salesperson' });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!originalData) return false;

    const branchesChanged =
      JSON.stringify([...formData.branches_to_be_managed].sort()) !==
      JSON.stringify([...(originalData?.branches_to_be_managed || [])].sort());

    return (
      formData.fullName !== originalData.fullName ||
      formData.contactNumber !== originalData.contactNumber ||
      formData.gender !== originalData.gender ||
      formData.dateOfBirth !== originalData.dateOfBirth ||
      branchesChanged ||
      profileImg !== null ||
      coverImg !== null ||
      removeProfileImage ||
      removeCoverImage
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#1a365d] mx-auto" />
          <p className="text-gray-600 mt-4">Loading salesperson data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          to={`/admin/staff/salespersons/${id}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Edit Salesperson
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Update salesperson information
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-2"
        >
          <FaExclamationTriangle className="shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {errors.submit && (
          <div className="bg-red-50 border-b border-red-200 p-4 text-red-700 flex items-center gap-2">
            <FaExclamationTriangle className="shrink-0" />
            <span>{errors.submit}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-6">
          {/* Email Display (Read-only) */}
          {originalData?.email && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">
                Email Address (cannot be changed)
              </p>
              <p className="font-medium text-gray-800">{originalData.email}</p>
            </div>
          )}

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
                    onError={e => {
                      e.target.style.display = 'none';
                    }}
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
                    onClick={handleRemoveCoverImg}
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
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center bg-blue-100">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <FaUserTie className="text-3xl sm:text-4xl text-blue-400" />
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
                    onClick={handleRemoveProfileImg}
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

          {/* Personal Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserTie className="text-[#1a365d]" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter full name (3-50 characters)"
                error={errors.fullName}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="03XXXXXXXXX"
                    maxLength={11}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-200 ${
                      errors.contactNumber
                        ? 'border-red-500 focus:ring-red-500 ring-1 ring-red-100'
                        : 'border-gray-300 focus:ring-[#1a365d] focus:border-[#1a365d] focus:ring-2 focus:ring-opacity-20'
                    } focus:outline-none`}
                  />
                </div>
                {errors.contactNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.contactNumber}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Enter 11 digits only (e.g. 03407799573)
                </p>
              </div>

              <FormSelect
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={genderOptions}
                placeholder="Select gender"
              />

              <FormInput
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                icon={FaBirthdayCake}
              />
            </div>
          </div>

          {/* Branch Assignment */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCodeBranch className="text-[#1a365d]" />
              Branch Assignment
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Branch(es) <span className="text-red-500">*</span>
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
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> To change account status (suspend/block),
              go to the salesperson's detail page and use the status buttons.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-500 w-full sm:w-auto">
            {hasChanges() ? (
              <span className="text-orange-600">
                • You have unsaved changes
              </span>
            ) : (
              <span>No changes made</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to={`/admin/staff/salespersons/${id}`}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !hasChanges()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50"
            >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
        </div>
      </motion.form>
    </div>
  );
}
