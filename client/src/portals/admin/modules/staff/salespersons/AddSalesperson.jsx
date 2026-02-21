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
  FaEyeSlash,
  FaCodeBranch,
} from 'react-icons/fa';
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
  const [showPassword, setShowPassword] = useState(false);

  // Branch options for assignment
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchLoading, setBranchLoading] = useState(true);

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
        // Mock data for development
        setBranchOptions([
          {
            value: '507f1f77bcf86cd799439011',
            label: 'Lahore Main Branch (PHIL25#001)',
          },
          {
            value: '507f1f77bcf86cd799439012',
            label: 'Karachi Branch (PHIL25#002)',
          },
          {
            value: '507f1f77bcf86cd799439013',
            label: 'Islamabad Branch (PHIL25#003)',
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
      pattern: /^[0-9]{10,15}$/,
      message: {
        required: 'Phone number is required',
        pattern: 'Enter 10-15 digits only (no spaces, dashes, or +)',
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

  const handleChange = e => {
    const { name, value } = e.target;
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
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        contactNumber: formData.contactNumber.trim(),
        gender: formData.gender,
        branches_to_be_managed: formData.branches_to_be_managed,
      };

      // Add optional dateOfBirth if provided
      if (formData.dateOfBirth) {
        payload.dateOfBirth = formData.dateOfBirth;
      }

      const response = await staffApi.createSalesperson(payload);

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="03001234567 (digits only)"
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
                  Enter 10-15 digits without spaces or dashes
                </p>
              </div>

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

              {/* Password Field */}
              <div>
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
