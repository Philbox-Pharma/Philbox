// src/portals/admin/modules/staff/salespersons/EditSalesperson.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaArrowLeft,
    FaSave,
    FaUserTie,
    FaEnvelope,
    FaPhone,
    FaCodeBranch,
    FaSpinner
} from 'react-icons/fa';
import { FormInput, FormSelect } from '../../../../../shared/components/Form';
import { staffApi, branchApi } from '../../../../../core/api/admin/adminApi';

export default function EditSalesperson() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [branches, setBranches] = useState([]);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        contactNumber: '',
        branch_id: '',
        account_status: 'active'
    });

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch branches
                const branchResponse = await branchApi.getAll(1, 100, { status: 'Active' });
                setBranches(branchResponse.data?.branches || []);

                // Fetch salesperson (mock for now)
                // const spResponse = await staffApi.getSalesperson(id);
                // setFormData(spResponse.data);

                // Mock data
                setFormData({
                    fullName: 'Ali Hassan',
                    email: 'ali@philbox.com',
                    contactNumber: '+92-300-1234567',
                    branch_id: '1',
                    account_status: 'active'
                });
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setBranches([
                    { _id: '1', name: 'Lahore Branch' },
                    { _id: '2', name: 'Karachi Branch' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

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
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
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

        setSaving(true);
        try {
            await staffApi.updateSalesperson(id, formData);
            navigate('/admin/staff/salespersons', {
                state: { message: 'Salesperson updated successfully!' }
            });
        } catch (err) {
            console.error('Update salesperson failed:', err);
            setErrors({ submit: err.message || 'Failed to update salesperson' });
        } finally {
            setSaving(false);
        }
    };

    const branchOptions = branches.map(b => ({ value: b._id, label: b.name }));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-[#1a365d] mx-auto" />
                    <p className="text-gray-600 mt-4">Loading...</p>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold text-gray-800">Edit Salesperson</h1>
                    <p className="text-gray-600 mt-1">Update salesperson information</p>
                </div>
            </div>

            {/* Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
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
                            <FormSelect
                                label="Account Status"
                                name="account_status"
                                value={formData.account_status}
                                onChange={handleChange}
                                options={statusOptions}
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
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50"
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
            </motion.form>
        </div>
    );
}
