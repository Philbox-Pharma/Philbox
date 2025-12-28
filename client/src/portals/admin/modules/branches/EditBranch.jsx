// src/portals/admin/modules/branches/EditBranch.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaArrowLeft, FaSave, FaCodeBranch, FaPhone,
    FaMapMarkerAlt, FaGlobe, FaSpinner, FaExclamationCircle,
    FaCheckCircle, FaMapPin, FaUserTie
} from 'react-icons/fa';
import { FormInput, FormSelect, FormMultiSelect } from '../../../../shared/components/Form';
import { branchApi, staffApi } from '../../../../core/api/admin/adminApi';
import MapPickerModal from '../../../../shared/components/Map/MapPickerModal';

export default function EditBranch() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Map State
    const [mapOpen, setMapOpen] = useState(false);

    // Staff Options
    const [adminOptions, setAdminOptions] = useState([]);
    const [salespersonOptions, setSalespersonOptions] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        street: '',
        town: '',
        city: '',
        province: '',
        zip_code: '',
        country: 'Pakistan',
        google_map_link: '',
        status: 'Active',
        under_administration_of: [], // Array of IDs
        salespersons_assigned: []    // Array of IDs
    });

    const provinces = [
        { value: 'Punjab', label: 'Punjab' },
        { value: 'Sindh', label: 'Sindh' },
        { value: 'KPK', label: 'Khyber Pakhtunkhwa' },
        { value: 'Balochistan', label: 'Balochistan' },
        { value: 'Islamabad', label: 'Islamabad Capital Territory' },
        { value: 'Gilgit-Baltistan', label: 'Gilgit-Baltistan' },
        { value: 'AJK', label: 'Azad Jammu & Kashmir' }
    ];

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
    ];

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Branch Data
                const branchRes = await branchApi.getById(id);
                if (branchRes.success || branchRes.status === 200) {
                    const branch = branchRes.data;
                    const address = branch.address || branch.address_id || {};

                    // Extract IDs for multiselect
                    const adminIds = branch.under_administration_of?.map(a => typeof a === 'object' ? a._id : a) || [];
                    const spIds = branch.salespersons_assigned?.map(s => typeof s === 'object' ? s._id : s) || [];

                    setFormData({
                        name: branch.name || '',
                        phone: branch.phone || branch.contact_number || '',
                        street: address.street || '',
                        town: address.town || '',
                        city: address.city || '',
                        province: address.province || '',
                        zip_code: address.zip_code || '',
                        country: address.country || 'Pakistan',
                        google_map_link: address.google_map_link || branch.google_map_link || '',
                        status: branch.status || 'Active',
                        under_administration_of: adminIds,
                        salespersons_assigned: spIds
                    });
                }

                // 2. Fetch Staff Options
                const adminsRes = await staffApi.getAdmins(1, 100);
                if (adminsRes.success || adminsRes.status === 200) {
                    const admins = adminsRes.data?.admins || [];
                    setAdminOptions(admins.map(a => ({
                        value: a._id,
                        label: `${a.fullName || a.name} (${a.email})`
                    })));
                }

                // Fetch Salespersons
                const spRes = await staffApi.getSalespersons(1, 100);
                if (spRes.success || spRes.status === 200) {
                    const salespersons = spRes.data?.salespersons || [];
                    setSalespersonOptions(salespersons.map(s => ({
                        value: s._id,
                        label: `${s.fullName || s.name} (${s.email})`
                    })));
                }

            } catch (err) {
                console.error('Failed to load data:', err);
                setErrors({ fetch: 'Failed to load branch data' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Validation Rules
    const validationRules = {
        name: { required: true, minLength: 2, message: { required: 'Branch name is required' } },
        city: { required: true, minLength: 2, message: { required: 'City is required' } },
        province: { required: true, message: { required: 'Select province' } },
        // Phone is optional - no 'required: true'
        phone: {
            pattern: /^[\d\s+\-()]*$/,
            message: { pattern: 'Invalid phone format' }
        }
    };
    const validateField = (name, value) => {
        const rules = validationRules[name];
        if (!rules) return ''; // No validation for this field

        const val = typeof value === 'string' ? value.trim() : value;

        // 1. Required Check
        if (rules.required && !val) {
            return rules.message.required;
        }

        // 2. If field is optional and empty, skip other checks
        if (!val) {
            return '';
        }

        // 3. Other Checks (only if value exists)
        if (rules.minLength && val.length < rules.minLength) {
            return `Min ${rules.minLength} chars`;
        }
        if (rules.pattern && !rules.pattern.test(val)) {
            return rules.message.pattern;
        }

        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Block invalid chars & spaces for phone
        if (name === 'phone') {
            // Regex: Only allow digits, +, -, ( )
            // Block spaces explicitly
            if (!/^[\d+\-()]*$/.test(value)) return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Mark fields as touched
        const allTouched = Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {});
        setTouched(allTouched);

        // 2. Validate all
        const newErrors = {};
        let isValid = true;
        Object.keys(validationRules).forEach(key => {
            const err = validateField(key, formData[key]);
            if (err) { newErrors[key] = err; isValid = false; }
        });
        setErrors(newErrors);

        if (!isValid) {
            const firstErrorField = document.querySelector('[class*="border-red-500"]');
            if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            else window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSaving(true);
        try {
            // Clean payload: Remove empty arrays/fields
            const payload = { ...formData };

            if (!payload.under_administration_of?.length) delete payload.under_administration_of;
            if (!payload.salespersons_assigned?.length) delete payload.salespersons_assigned;
            if (!payload.phone) delete payload.phone;
            if (!payload.google_map_link) delete payload.google_map_link;

            console.log('Sending Payload:', payload);

            const response = await branchApi.update(id, payload); // Use .create() in AddBranch

            if (response.success || response.status === 200) {
                navigate('/admin/branches', { state: { message: 'Branch Updated Successfully!' } });
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            console.error('Submit failed:', err);
            setErrors({ submit: err.message || 'Update Failed' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSaving(false);
        }
    };

    // Helper to extract coords for iframe preview
    const getMapEmbedUrl = (link) => {
        const coords = link.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                      link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coords) return `https://maps.google.com/maps?q=${coords[1]},${coords[2]}&z=15&output=embed`;
        return null;
    };

    if (loading) return <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-3xl text-[#1a365d]" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin/branches" className="p-2 hover:bg-gray-100 rounded-lg"><FaArrowLeft /></Link>
                <h1 className="text-2xl font-bold text-gray-800">Edit Branch</h1>
            </div>

            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {errors.submit && <div className="bg-red-50 p-4 text-red-700 border-b border-red-200">{errors.submit}</div>}

                <div className="p-6 space-y-8">
                    {/* Basic Info */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaCodeBranch className="text-[#1a365d]" /> Branch Info</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput label="Branch Name" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} required />
                            <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} error={errors.phone} icon={FaPhone} />
                            <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange} options={statusOptions} />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaMapMarkerAlt className="text-[#1a365d]" /> Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Street" name="street" value={formData.street} onChange={handleChange} className="md:col-span-2" />
                            <FormInput label="Town" name="town" value={formData.town} onChange={handleChange} />
                            <FormInput label="City" name="city" value={formData.city} onChange={handleChange} onBlur={handleBlur} error={errors.city} required />
                            <FormSelect label="Province" name="province" value={formData.province} onChange={handleChange} options={provinces} error={errors.province} required />
                            <FormInput label="ZIP" name="zip_code" value={formData.zip_code} onChange={handleChange} />
                            <FormInput label="Country" name="country" value={formData.country} disabled />
                        </div>
                    </div>

                    {/* Staff Assignment */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaUserTie className="text-[#1a365d]" /> Assign Staff</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormMultiSelect
                                label="Assign Admins"
                                name="under_administration_of"
                                value={formData.under_administration_of}
                                onChange={handleChange}
                                options={adminOptions}
                                placeholder="Select admins..."
                            />
                            <FormMultiSelect
                                label="Assign Salespersons"
                                name="salespersons_assigned"
                                value={formData.salespersons_assigned}
                                onChange={handleChange}
                                options={salespersonOptions}
                                placeholder="Select salespersons..."
                            />
                        </div>
                    </div>

                    {/* Google Maps */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaGlobe className="text-[#1a365d]" /> Google Maps</h2>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <FaGlobe className="absolute left-3 top-3.5 text-gray-400" />
                                    <input type="url" name="google_map_link" value={formData.google_map_link} onChange={handleChange} placeholder="Paste link or select from map..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1a365d] outline-none" />
                                </div>
                                <button type="button" onClick={() => setMapOpen(true)} className="px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] flex items-center gap-2 whitespace-nowrap"><FaMapMarkerAlt /> Open Map</button>
                            </div>

                            {/* Map Preview */}
                            {formData.google_map_link && (
                                <div className="rounded-lg overflow-hidden border border-gray-200 mt-3 h-64 bg-gray-100">
                                    {getMapEmbedUrl(formData.google_map_link) ? (
                                        <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" src={getMapEmbedUrl(formData.google_map_link)} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400"><FaMapMarkerAlt className="mr-2" /> Preview unavailable</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                    <Link to="/admin/branches" className="px-6 py-2 border rounded-lg hover:bg-gray-100">Cancel</Link>
                    <button type="submit" disabled={saving} className="px-6 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] flex items-center gap-2">
                        {saving ? <FaSpinner className="animate-spin" /> : <><FaSave /> Save Changes</>}
                    </button>
                </div>
            </motion.form>

            <MapPickerModal
                isOpen={mapOpen}
                onClose={() => setMapOpen(false)}
                initialQuery={formData.city ? `${formData.city}, Pakistan` : ''}
                onSelect={({ googleMapLink }) => {
                    setFormData(prev => ({ ...prev, google_map_link: googleMapLink }));
                }}
            />
        </div>
    );
}
