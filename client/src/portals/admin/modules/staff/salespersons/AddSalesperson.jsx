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
    FaCodeBranch,
    FaSpinner
} from 'react-icons/fa';
import { FormInput, FormSelect } from '../../../../../shared/components/Form';
import { staffApi, branchApi } from '../../../../../core/api/admin/adminApi';

export default function AddSalesperson() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        contactNumber: '',
        branch_id: ''
    });

    // Fetch branches
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await branchApi.getAll(1, 100, { status: 'Active' });
                setBranches(response.data?.branches || []);
            } catch (err) {
                console.error('Failed to fetch branches:', err);
                setBranches([
                    { _id: '1', name: 'Lahore Branch' },
                    { _id: '2', name: 'Karachi Branch' },
                ]);
            }
        };
        fetchBranches();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (formData.contactNumber && !/^[\d\s+\-()]{10,20}$/.test(formData.contactNumber)) {
            newErrors.contactNumber = 'Invalid phone format';
        }

        if (!formData.branch_id) {
            newErrors.branch_id = 'Please select a branch';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            const { confirmPassword, ...submitData } = formData;
            await staffApi.createSalesperson(submitData);
            navigate('/admin/staff/salespersons', {
                state: { message: 'Salesperson created successfully!' }
            });
        } catch (err) {
            console.error('Create salesperson failed:', err);
            setErrors({ submit: err.message || 'Failed to create salesperson' });
        } finally {
            setLoading(false);
        }
    };

    const branchOptions = branches.map(b => ({ value: b._id, label: b.name }));

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Link
                    to="/admin/staff/salespersons"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FaArrowLeft className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Add Salesperson</h1>
                    <p className="text-gray-600 mt-1">Create a new salesperson account</p>
                </div>
            </div>

            {/* Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
                {/* Error Banner */}
                {errors.submit && (
                    <div className="bg-red-50 border-b border-red-200 p-4 text-red-700">
                        {errors.submit}
                    </div>
                )}

                <div className="p-6 space-y-6">
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
                                placeholder="e.g., Ali Hassan"
                                error={errors.fullName}
                                required
                            />
                            <FormInput
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="e.g., ali@philbox.com"
                                error={errors.email}
                                icon={FaEnvelope}
                                required
                            />
                            <FormInput
                                label="Contact Number"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="e.g., +92-300-1234567"
                                error={errors.contactNumber}
                                icon={FaPhone}
                            />
                            <FormSelect
                                label="Assign Branch"
                                name="branch_id"
                                value={formData.branch_id}
                                onChange={handleChange}
                                options={branchOptions}
                                placeholder="Select Branch"
                                error={errors.branch_id}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaLock className="text-[#1a365d]" />
                            Password
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min. 8 characters"
                                error={errors.password}
                                required
                            />
                            <FormInput
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repeat password"
                                error={errors.confirmPassword}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <Link
                        to="/admin/staff/salespersons"
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <FaSave />
                                <span>Create Salesperson</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
