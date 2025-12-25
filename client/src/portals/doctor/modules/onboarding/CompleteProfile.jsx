import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaPlus, FaTrash } from 'react-icons/fa';
import { doctorAuthApi } from '../../../../core/api/doctor/auth';

export default function CompleteProfile() {
    const navigate = useNavigate();

    // Basic Info
    const [profileImg, setProfileImg] = useState(null);
    const [coverImg, setCoverImg] = useState(null);
    const [digitalSignature, setDigitalSignature] = useState(null);

    // Professional Info
    const [formData, setFormData] = useState({
        license_number: '',
        affiliated_hospital: '',
        consultation_type: '',
        consultation_fee: '',
        onlineProfileURL: '',
    });

    // Specializations (Array of strings)
    const [specializations, setSpecializations] = useState(['']);

    // Education (Array of objects)
    const [educationList, setEducationList] = useState([
        { degree: '', institution: '', year: '', file: null }
    ]);

    // Experience (Array of objects)
    const [experienceList, setExperienceList] = useState([
        { title: '', hospital: '', from_year: '', to_year: '', file: null }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle basic input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ============ SPECIALIZATION HANDLERS ============
    const handleSpecializationChange = (index, value) => {
        const updated = [...specializations];
        updated[index] = value;
        setSpecializations(updated);
    };

    const addSpecialization = () => {
        setSpecializations([...specializations, '']);
    };

    const removeSpecialization = (index) => {
        if (specializations.length > 1) {
            setSpecializations(specializations.filter((_, i) => i !== index));
        }
    };

    // ============ EDUCATION HANDLERS ============
    const handleEducationChange = (index, field, value) => {
        const updated = [...educationList];
        updated[index][field] = value;
        setEducationList(updated);
    };

    const handleEducationFile = (index, file) => {
        const updated = [...educationList];
        updated[index].file = file;
        setEducationList(updated);
    };

    const addEducation = () => {
        setEducationList([...educationList, { degree: '', institution: '', year: '', file: null }]);
    };

    const removeEducation = (index) => {
        if (educationList.length > 1) {
            setEducationList(educationList.filter((_, i) => i !== index));
        }
    };

    // ============ EXPERIENCE HANDLERS ============
    const handleExperienceChange = (index, field, value) => {
        const updated = [...experienceList];
        updated[index][field] = value;
        setExperienceList(updated);
    };

    const handleExperienceFile = (index, file) => {
        const updated = [...experienceList];
        updated[index].file = file;
        setExperienceList(updated);
    };

    const addExperience = () => {
        setExperienceList([...experienceList, { title: '', hospital: '', from_year: '', to_year: '', file: null }]);
    };

    const removeExperience = (index) => {
        if (experienceList.length > 1) {
            setExperienceList(experienceList.filter((_, i) => i !== index));
        }
    };

    // ============ FORM VALIDATION ============
    const validateForm = () => {
        if (!formData.license_number) {
            setError('License number is required');
            return false;
        }
        if (!formData.consultation_type) {
            setError('Consultation type is required');
            return false;
        }
        if (!formData.consultation_fee) {
            setError('Consultation fee is required');
            return false;
        }
        if (specializations.filter(s => s.trim()).length === 0) {
            setError('At least one specialization is required');
            return false;
        }
        if (educationList.some(e => !e.degree || !e.institution || !e.year)) {
            setError('Please complete all education details');
            return false;
        }
        return true;
    };

    // ============ FORM SUBMIT ============
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Append images
            if (profileImg) formDataToSend.append('profile_img', profileImg);
            if (coverImg) formDataToSend.append('cover_img', coverImg);
            if (digitalSignature) formDataToSend.append('digital_signature', digitalSignature);

            // Append basic fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value) formDataToSend.append(key, value);
            });

            // Append specializations as JSON string
            const filteredSpecializations = specializations.filter(s => s.trim());
            formDataToSend.append('specialization', JSON.stringify(filteredSpecializations));

            // Append education details as JSON string (without files)
            const educationData = educationList.map(({ file, ...rest }) => rest);
            formDataToSend.append('educational_details', JSON.stringify(educationData));

            // Append education files
            educationList.forEach((edu) => {
                if (edu.file) {
                    formDataToSend.append('education_files', edu.file);
                }
            });

            // Append experience details as JSON string (without files)
            const experienceData = experienceList.map(({ file, ...rest }) => rest);
            formDataToSend.append('experience_details', JSON.stringify(experienceData));

            // Append experience files
            experienceList.forEach((exp) => {
                if (exp.file) {
                    formDataToSend.append('experience_files', exp.file);
                }
            });

            const response = await doctorAuthApi.completeProfile(formDataToSend);

            if (response.data?.nextStep === 'dashboard' || response.nextStep === 'dashboard') {
                navigate('/doctor/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete profile.');
        } finally {
            setLoading(false);
        }
    };

    // ============ FILE UPLOAD COMPONENT ============
    const FileUploadBox = ({ file, onFileChange, onRemove, label }) => (
        <div>
            {file ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <FaCheckCircle className="text-green-500 flex-shrink-0" />
                        <span className="text-sm text-green-700 truncate">{file.name}</span>
                    </div>
                    <button type="button" onClick={onRemove} className="text-red-500 hover:text-red-700">
                        <FaTimesCircle />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                    <FaCloudUploadAlt className="text-2xl text-gray-400 mb-1" />
                    <span className="text-sm text-gray-500">{label}</span>
                    <input
                        type="file"
                        onChange={(e) => onFileChange(e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                    />
                </label>
            )}
        </div>
    );

    return (
        <div className="auth-wrapper !py-8">
            <div className="card-container !w-[700px] !max-w-[95vw]">
                {/* Logo */}
                <img src="/vite.svg" alt="Logo" className="auth-logo" />

                {/* Title */}
                <h1 className="auth-title">Complete Your Profile</h1>
                <p className="auth-subtitle">Final step to start your practice on PhilBox</p>

                {/* Error Message */}
                {error && (
                    <div className="alert-error mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* ============ PROFILE & COVER IMAGES ============ */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Profile Images</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Profile Photo</label>
                                <FileUploadBox
                                    file={profileImg}
                                    onFileChange={setProfileImg}
                                    onRemove={() => setProfileImg(null)}
                                    label="Upload Photo"
                                />
                            </div>
                            <div>
                                <label className="input-label">Cover Image</label>
                                <FileUploadBox
                                    file={coverImg}
                                    onFileChange={setCoverImg}
                                    onRemove={() => setCoverImg(null)}
                                    label="Upload Cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============ PROFESSIONAL INFO ============ */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Professional Information</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="input-label">License Number <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="license_number"
                                    value={formData.license_number}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="PMC-12345"
                                    required
                                />
                            </div>
                            <div>
                                <label className="input-label">Affiliated Hospital</label>
                                <input
                                    type="text"
                                    name="affiliated_hospital"
                                    value={formData.affiliated_hospital}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="City Hospital"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="input-label">Consultation Type <span className="text-red-500">*</span></label>
                                <select
                                    name="consultation_type"
                                    value={formData.consultation_type}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="online">Online Only</option>
                                    <option value="in-person">In-Person Only</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Consultation Fee (PKR) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="consultation_fee"
                                    value={formData.consultation_fee}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="1500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Online Profile URL</label>
                            <input
                                type="url"
                                name="onlineProfileURL"
                                value={formData.onlineProfileURL}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://linkedin.com/in/yourprofile"
                            />
                        </div>
                    </div>

                    {/* ============ SPECIALIZATIONS ============ */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Specializations <span className="text-red-500">*</span>
                            </h3>
                            <button
                                type="button"
                                onClick={addSpecialization}
                                className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                            >
                                <FaPlus size={12} /> Add More
                            </button>
                        </div>

                        {specializations.map((spec, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    value={spec}
                                    onChange={(e) => handleSpecializationChange(index, e.target.value)}
                                    className="input-field"
                                    placeholder="e.g., Cardiology, Dermatology"
                                />
                                {specializations.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSpecialization(index)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ============ EDUCATION ============ */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Educational Details <span className="text-red-500">*</span>
                            </h3>
                            <button
                                type="button"
                                onClick={addEducation}
                                className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                            >
                                <FaPlus size={12} /> Add More
                            </button>
                        </div>

                        {educationList.map((edu, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg mb-3">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-medium text-gray-600">Education #{index + 1}</span>
                                    {educationList.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeEducation(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                        className="input-field"
                                        placeholder="Degree (MBBS, MD)"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={edu.institution}
                                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                        className="input-field"
                                        placeholder="Institution"
                                        required
                                    />
                                    <input
                                        type="number"
                                        value={edu.year}
                                        onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                                        className="input-field"
                                        placeholder="Year"
                                        required
                                    />
                                </div>

                                <FileUploadBox
                                    file={edu.file}
                                    onFileChange={(file) => handleEducationFile(index, file)}
                                    onRemove={() => handleEducationFile(index, null)}
                                    label="Upload Certificate"
                                />
                            </div>
                        ))}
                    </div>

                    {/* ============ EXPERIENCE ============ */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">Experience Details</h3>
                            <button
                                type="button"
                                onClick={addExperience}
                                className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                            >
                                <FaPlus size={12} /> Add More
                            </button>
                        </div>

                        {experienceList.map((exp, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg mb-3">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-medium text-gray-600">Experience #{index + 1}</span>
                                    {experienceList.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeExperience(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={exp.title}
                                        onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                                        className="input-field"
                                        placeholder="Job Title"
                                    />
                                    <input
                                        type="text"
                                        value={exp.hospital}
                                        onChange={(e) => handleExperienceChange(index, 'hospital', e.target.value)}
                                        className="input-field"
                                        placeholder="Hospital/Clinic"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                        type="number"
                                        value={exp.from_year}
                                        onChange={(e) => handleExperienceChange(index, 'from_year', e.target.value)}
                                        className="input-field"
                                        placeholder="From Year"
                                    />
                                    <input
                                        type="number"
                                        value={exp.to_year}
                                        onChange={(e) => handleExperienceChange(index, 'to_year', e.target.value)}
                                        className="input-field"
                                        placeholder="To Year"
                                    />
                                </div>

                                <FileUploadBox
                                    file={exp.file}
                                    onFileChange={(file) => handleExperienceFile(index, file)}
                                    onRemove={() => handleExperienceFile(index, null)}
                                    label="Upload Experience Letter"
                                />
                            </div>
                        ))}
                    </div>

                    {/* ============ DIGITAL SIGNATURE ============ */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Digital Signature</h3>
                        <FileUploadBox
                            file={digitalSignature}
                            onFileChange={setDigitalSignature}
                            onRemove={() => setDigitalSignature(null)}
                            label="Upload Signature Image"
                        />
                    </div>

                    {/* ============ SUBMIT BUTTON ============ */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Submitting...' : 'Complete Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}
