// src/portals/admin/modules/staff/admins/EditAdmin.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import {
  FaArrowLeft,
  FaSave,
  FaUserShield,
  FaEnvelope,
  FaPhone,
  FaSpinner,
  FaCamera,
  FaTrash,
  FaCodeBranch,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  FormInput,
  FormSelect,
  FormMultiSelect,
} from '../../../../../shared/components/Form';
import { staffApi, branchApi } from '../../../../../core/api/admin/adminApi';

export default function EditAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
    name: '',
    phone_number: '',
    status: 'active',
    category: 'branch-admin',
    branches_managed: [],
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState(null);

  // Options
  const categoryOptions = [
    { value: 'branch-admin', label: 'Branch Admin' },
    { value: 'super-admin', label: 'Super Admin' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'blocked', label: 'Blocked' },
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

  // Fetch Admin Data
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setErrors({});
    try {
      const response = await staffApi.getAdminById(id);

      if (response.status === 200 || response.data) {
        const admin = response.data?.admin || response.data;

        // Handle different field names
        const adminName = admin.name || admin.fullName || '';
        const adminPhone =
          admin.phone_number || admin.contactNumber || admin.phone || '';
        const adminStatus = admin.status || admin.account_status || 'active';
        const adminCategory =
          admin.category || admin.admin_category || 'branch-admin';
        const adminProfileImg =
          admin.profile_img_url || admin.profileImg || admin.avatar || null;
        const adminCoverImg = admin.cover_img_url || admin.coverImg || null;
        const adminBranches =
          admin.branches_managed?.map(b => b._id || b) || [];

        setFormData({
          name: adminName,
          phone_number: adminPhone,
          status: adminStatus,
          category: adminCategory,
          branches_managed: adminBranches,
        });

        setOriginalData({
          ...admin,
          name: adminName,
          phone_number: adminPhone,
          status: adminStatus,
          category: adminCategory,
          branches_managed: adminBranches,
          profile_img_url: adminProfileImg,
          cover_img_url: adminCoverImg,
        });

        if (adminProfileImg) setProfilePreview(adminProfileImg);
        if (adminCoverImg) setCoverPreview(adminCoverImg);
      } else {
        throw new Error(response.message || 'Failed to fetch admin');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setErrors({ fetch: err.message || 'Failed to load admin data' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Validation Rules
  const validationRules = {
    name: {
      required: true,
      minLength: 3,
      message: {
        required: 'Name is required',
        minLength: 'Minimum 3 characters',
      },
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
      setRemoveProfileImage(false);
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

    // Validate
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
    setErrors(prev => ({ ...prev, ...newErrors }));

    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();

      // Only append changed fields
      if (formData.name !== originalData?.name) {
        submitData.append('name', formData.name.trim());
      }
      if (formData.phone_number !== originalData?.phone_number) {
        submitData.append('phone_number', formData.phone_number.trim());
      }
      if (formData.status !== originalData?.status) {
        submitData.append('status', formData.status);
      }
      if (formData.category !== originalData?.category) {
        submitData.append('category', formData.category);
      }

      // Handle branches_managed
      const branchesChanged =
        JSON.stringify([...formData.branches_managed].sort()) !==
        JSON.stringify([...(originalData?.branches_managed || [])].sort());

      if (branchesChanged) {
        if (formData.branches_managed.length > 0) {
          formData.branches_managed.forEach((branchId, index) => {
            submitData.append(`branches_managed[${index}]`, branchId);
          });
        } else {
          submitData.append('branches_managed', '[]');
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

      const response = await staffApi.updateAdmin(id, submitData);

      if (response.status === 200 || response.success) {
        navigate(`/admin/staff/admins/${id}`, {
          state: { message: 'Admin updated successfully!' },
        });
      } else {
        throw new Error(response.message || 'Failed to update admin');
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
        setErrors(prev => ({
          ...prev,
          submit: err.message || 'Failed to update admin',
        }));
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!originalData) return false;

    const branchesChanged =
      JSON.stringify([...formData.branches_managed].sort()) !==
      JSON.stringify([...(originalData?.branches_managed || [])].sort());

    return (
      formData.name !== originalData.name ||
      formData.phone_number !== (originalData.phone_number || '') ||
      formData.status !== originalData.status ||
      formData.category !== originalData.category ||
      branchesChanged ||
      profileImg !== null ||
      coverImg !== null ||
      removeProfileImage ||
      removeCoverImage
    );
  };

  // Dynamic check - based on current form selection
  const isSuperAdmin = formData.category === 'super-admin';

  const adminEmail = originalData?.email || '';

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <FaSpinner className="animate-spin text-3xl text-[#1a365d]" />
      </div>
    );
  }

  if (errors.fetch && !originalData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/staff/admins"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Edit Admin</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{errors.fetch}</p>
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={`/admin/staff/admins/${id}`}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FaArrowLeft />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Edit Admin
          </h1>
          <p className="text-gray-600 text-sm truncate">{adminEmail}</p>
        </div>
      </div>

      <form
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
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center ${
                    isSuperAdmin ? 'bg-purple-100' : 'bg-blue-100'
                  }`}
                >
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
                    <FaUserShield
                      className={`text-3xl sm:text-4xl ${isSuperAdmin ? 'text-purple-400' : 'text-blue-400'}`}
                    />
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

          {/* Account Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserShield className="text-[#1a365d]" /> Account Information
            </h2>

            {/* Read-only: Email only */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg border border-gray-200 text-gray-600">
                <FaEnvelope className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{adminEmail}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Editable fields */}
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
                options={categoryOptions}
              />

              <FormSelect
                label="Account Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
              />
            </div>
          </div>

          {/* Category Change Warning */}
          {formData.category !== originalData?.category && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 text-sm">
                <strong>Warning:</strong> Changing category from "
                {originalData?.category === 'super-admin'
                  ? 'Super Admin'
                  : 'Branch Admin'}
                " to "
                {formData.category === 'super-admin'
                  ? 'Super Admin'
                  : 'Branch Admin'}
                " will{' '}
                {formData.category === 'super-admin'
                  ? 'grant full system access to this admin.'
                  : 'restrict this admin to only their assigned branches.'}
              </p>
            </div>
          )}

          {/* Branch Assignment (for branch-admin only) */}
          {!isSuperAdmin && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCodeBranch className="text-[#1a365d]" /> Branch Assignment
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Managed Branches
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
                    placeholder="Select branches to manage"
                  />
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Select which branches this admin can manage
                </p>
              </div>
            </div>
          )}

          {/* Status Warning */}
          {formData.status !== 'active' && (
            <div
              className={`border rounded-lg p-4 ${
                formData.status === 'blocked'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <p
                className={`text-sm ${
                  formData.status === 'blocked'
                    ? 'text-red-800'
                    : 'text-yellow-800'
                }`}
              >
                <strong>Warning:</strong> Changing status to "{formData.status}"
                will{' '}
                {formData.status === 'suspended'
                  ? 'temporarily restrict'
                  : 'permanently block'}{' '}
                this admin's access to the system.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            {hasChanges() ? (
              <span className="text-orange-600">
                • You have unsaved changes
              </span>
            ) : (
              <span>No changes made</span>
            )}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Link
              to={`/admin/staff/admins/${id}`}
              className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !hasChanges()}
              className="flex-1 sm:flex-none px-6 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
