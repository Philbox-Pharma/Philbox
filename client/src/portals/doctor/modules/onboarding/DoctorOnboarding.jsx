import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaFileUpload,
  FaSearch,
  FaUserMd,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaTimesCircle,
  FaPlus,
  FaTrash,
  FaClock,
  FaExclamationTriangle,
  FaArrowRight,
} from 'react-icons/fa';
import { doctorOnboardingApi } from '../../../../core/api/doctor/onboarding.service';

// ==========================================
// STEP CONFIGURATION
// ==========================================
const ONBOARDING_STEPS = [
  { id: 1, title: 'Documents', icon: FaFileUpload, key: 'documents' },
  { id: 2, title: 'Review', icon: FaSearch, key: 'review' },
  { id: 3, title: 'Profile', icon: FaUserMd, key: 'profile' },
];

// ==========================================
// FILE UPLOAD COMPONENT (Reusable)
// ==========================================
function FileUploadBox({ file, onFileChange, onRemove, label }) {
  return (
    <div>
      {file ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <FaCheckCircle className="text-green-500 flex-shrink-0" />
            <span className="text-sm text-green-700 truncate">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 flex-shrink-0"
          >
            <FaTimesCircle />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
          <FaCloudUploadAlt className="text-2xl text-gray-400 mb-1" />
          <span className="text-sm text-gray-500">{label}</span>
          <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
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
}

// ==========================================
// MAIN ONBOARDING WIZARD
// ==========================================
export default function DoctorOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const isResubmit = location.state?.resubmit || false;

  // Track active onboarding step
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application status data
  const [applicationData, setApplicationData] = useState(null);

  // ==========================================
  // STEP 1: Document Upload State
  // ==========================================
  const [files, setFiles] = useState({
    cnic: null,
    medical_license: null,
    mbbs_md_degree: null,
    specialist_license: null,
    experience_letters: null,
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // ==========================================
  // STEP 3: Complete Profile State
  // ==========================================
  const [profileImg, setProfileImg] = useState(null);
  const [coverImg, setCoverImg] = useState(null);
  const [digitalSignature, setDigitalSignature] = useState(null);
  const [profileFormData, setProfileFormData] = useState({
    license_number: '',
    affiliated_hospital: '',
    consultation_type: '',
    consultation_fee: '',
    onlineProfileURL: '',
  });
  const [specializations, setSpecializations] = useState(['']);
  const [educationList, setEducationList] = useState([
    { degree: '', institution: '', year: '', file: null },
  ]);
  const [experienceList, setExperienceList] = useState([
    { title: '', hospital: '', from_year: '', to_year: '', file: null },
  ]);
  const [profileLoading, setProfileLoading] = useState(false);

  // ==========================================
  // FETCH APPLICATION STATUS ON MOUNT
  // ==========================================
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorOnboardingApi.getApplicationStatus();
      const data = response.data;
      setApplicationData(data);

      // Determine which step to show
      if (data.nextStep === 'submit-application' || data.status === 'not_submitted') {
        setActiveStep(1);
      } else if (data.nextStep === 'waiting-approval' || data.status === 'pending' || data.status === 'processing') {
        setActiveStep(2);
      } else if (data.nextStep === 'resubmit-application' || data.status === 'rejected') {
        setActiveStep(1); // Go back to documents for resubmit
      } else if (data.nextStep === 'complete-profile' || data.status === 'approved') {
        setActiveStep(3);
      } else if (data.nextStep === 'dashboard') {
        navigate('/doctor/dashboard');
        return;
      }
    } catch (err) {
      console.error('Error fetching status:', err);
      // If 401 or not authenticated, the status check failed
      if (err.response?.status === 401) {
        navigate('/doctor/login');
        return;
      }
      // If no application exists, show step 1
      setActiveStep(1);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle resubmit navigation state
  useEffect(() => {
    if (isResubmit) {
      setActiveStep(1);
    }
  }, [isResubmit]);

  // ==========================================
  // STEP 1: DOCUMENT UPLOAD HANDLERS
  // ==========================================
  const handleFileChange = (fieldName, file) => {
    setFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  const handleRemoveFile = (fieldName) => {
    setFiles(prev => ({ ...prev, [fieldName]: null }));
  };

  const fileLabels = {
    cnic: 'CNIC / National ID',
    medical_license: 'Medical License / PMDC',
    mbbs_md_degree: 'MBBS / MD Degree',
    specialist_license: 'Specialist License (Optional)',
    experience_letters: 'Experience Letters (Optional)',
  };

  const requiredDocFiles = ['cnic', 'medical_license', 'mbbs_md_degree'];

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required files
    const missing = requiredDocFiles.filter(field => !files[field]);
    if (missing.length > 0) {
      const missingLabels = missing.map(f => fileLabels[f]).join(', ');
      setError(`Please upload required documents: ${missingLabels}`);
      return;
    }

    setSubmitLoading(true);

    try {
      const formData = new FormData();

      // Backend expects 'cnic' not 'cnic_front'/'cnic_back' separately
      // But the current SubmitApplication sends them separately
      // Following existing pattern:
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const isResubmitting = applicationData?.status === 'rejected' || isResubmit;
      const apiCall = isResubmitting
        ? doctorOnboardingApi.resubmitApplication
        : doctorOnboardingApi.submitApplication;

      await apiCall(formData);

      // Move to review step
      setActiveStep(2);
      await fetchStatus();
    } catch (err) {
      const serverError = err.response?.data;
      const message = serverError?.message || 'Failed to submit application.';
      const detail = serverError?.error || '';

      if (serverError?.data?.missingFiles) {
        const missingFiles = serverError.data.missingFiles.join(', ');
        setError(`Missing required documents: ${missingFiles}`);
      } else if (err.response?.status === 500) {
        setError(`Server Error: ${message}. ${detail ? `Details: ${detail}` : ''}`);
      } else {
        setError(message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // ==========================================
  // STEP 3: COMPLETE PROFILE HANDLERS
  // ==========================================
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  // Specialization handlers
  const handleSpecializationChange = (index, value) => {
    const updated = [...specializations];
    updated[index] = value;
    setSpecializations(updated);
  };
  const addSpecialization = () => setSpecializations([...specializations, '']);
  const removeSpecialization = (index) => {
    if (specializations.length > 1) {
      setSpecializations(specializations.filter((_, i) => i !== index));
    }
  };

  // Education handlers
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

  // Experience handlers
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

  // Profile form validation
  const validateProfile = () => {
    if (!profileFormData.license_number) {
      setError('License / PMDC number is required');
      return false;
    }
    if (!profileFormData.consultation_type) {
      setError('Consultation type is required');
      return false;
    }
    if (!profileFormData.consultation_fee) {
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

  // Profile submit handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateProfile()) return;

    setProfileLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append images
      if (profileImg) formDataToSend.append('profile_img', profileImg);
      if (coverImg) formDataToSend.append('cover_img', coverImg);
      if (digitalSignature) formDataToSend.append('digital_signature', digitalSignature);

      // Append basic fields
      Object.entries(profileFormData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      // Append specializations
      const filteredSpecializations = specializations.filter(s => s.trim());
      formDataToSend.append('specialization', JSON.stringify(filteredSpecializations));

      // Append education
      // eslint-disable-next-line no-unused-vars
      const educationData = educationList.map(({ file: _file, ...rest }) => rest);
      formDataToSend.append('educational_details', JSON.stringify(educationData));
      educationList.forEach(edu => {
        if (edu.file) formDataToSend.append('education_files', edu.file);
      });

      // Append experience
      // eslint-disable-next-line no-unused-vars
      const experienceData = experienceList.map(({ file: _file, ...rest }) => rest);
      formDataToSend.append('experience_details', JSON.stringify(experienceData));
      experienceList.forEach(exp => {
        if (exp.file) formDataToSend.append('experience_files', exp.file);
      });

      const response = await doctorOnboardingApi.completeProfile(formDataToSend);

      if (response.data?.nextStep === 'dashboard' || response.nextStep === 'dashboard') {
        navigate('/doctor/dashboard');
      }
    } catch (err) {
      console.error('Profile complete error:', err);
      const serverError = err.response?.data;
      const message = serverError?.message || 'Failed to complete profile.';
      const detail = serverError?.error || '';

      if (err.response?.status === 500) {
        setError(`Server Error: ${message}. ${detail ? `Details: ${detail}` : ''}`);
      } else {
        setError(message);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // ==========================================
  // STEP INDICATOR COMPONENT
  // ==========================================
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {ONBOARDING_STEPS.map((step, index) => {
        const isActive = activeStep === step.id;
        const isCompleted = activeStep > step.id;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-2
                  ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-200'
                    : isActive
                      ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200 animate-pulse'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}
              >
                {isCompleted ? <FaCheckCircle size={16} /> : <Icon size={16} />}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium transition-colors duration-300 ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            </div>

            {index < ONBOARDING_STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 transition-colors duration-500 ${
                  activeStep > step.id ? 'bg-green-400' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // ==========================================
  // STEP 1 RENDER: DOCUMENT UPLOAD
  // ==========================================
  const renderDocumentUpload = () => {
    const isRejected = applicationData?.status === 'rejected';

    return (
      <form onSubmit={handleDocumentSubmit} className="animate-fadeIn">
        <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <FaFileUpload className="text-blue-500" />
          {isRejected ? 'Resubmit Documents' : 'Upload Documents'}
        </h2>
        <p className="text-sm text-gray-500 mb-5">Upload your verification documents to proceed</p>

        {/* Rejection Warning */}
        {isRejected && (
          <div className="alert-error mb-4">
            <div className="flex items-center gap-2 mb-1">
              <FaExclamationTriangle />
              <p className="font-medium">Previous Submission Rejected</p>
            </div>
            {applicationData?.application?.admin_comment && (
              <p className="text-sm mt-1">
                <strong>Reason:</strong> {applicationData.application.admin_comment}
              </p>
            )}
            <p className="text-sm mt-1">Please review and upload correct documents.</p>
          </div>
        )}

        {/* Document Fields */}
        <div className="space-y-4 mb-6">
          {Object.keys(fileLabels).map((fieldName) => (
            <div key={fieldName}>
              <label className="input-label">
                {fileLabels[fieldName]}
                {requiredDocFiles.includes(fieldName) && <span className="text-red-500 ml-1">*</span>}
              </label>
              <FileUploadBox
                file={files[fieldName]}
                onFileChange={(file) => handleFileChange(fieldName, file)}
                onRemove={() => handleRemoveFile(fieldName)}
                label={`Upload ${fileLabels[fieldName]}`}
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitLoading}
          className="btn-primary mt-2 flex items-center justify-center gap-2"
        >
          {submitLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </>
          ) : (
            <>
              Submit Documents <FaArrowRight size={14} />
            </>
          )}
        </button>
      </form>
    );
  };

  // ==========================================
  // STEP 2: AUTO-POLLING FOR STATUS UPDATES
  // ==========================================
  useEffect(() => {
    if (activeStep !== 2) return;
    const status = applicationData?.status;
    // Only poll when pending or processing
    if (status !== 'pending' && status !== 'processing') return;

    const interval = setInterval(() => {
      fetchStatus();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [activeStep, applicationData?.status, fetchStatus]);

  // ==========================================
  // STEP 2 RENDER: APPLICATION STATUS TRACKING
  // ==========================================
  const renderApplicationStatus = () => {
    const status = applicationData?.status || 'pending';

    const statusConfig = {
      pending: {
        icon: FaClock,
        title: 'Application Under Review',
        message: 'Your documents have been submitted successfully. Our team is currently reviewing your application.',
        bgClass: 'bg-yellow-100',
        iconClass: 'text-yellow-500',
        badgeClass: 'badge-warning',
        borderClass: 'border-yellow-300',
        gradientFrom: 'from-yellow-50',
        gradientTo: 'to-orange-50',
      },
      processing: {
        icon: FaSearch,
        title: 'Credentials Being Verified',
        message: 'Your application is actively being processed. We are verifying your professional credentials.',
        bgClass: 'bg-blue-100',
        iconClass: 'text-blue-500',
        badgeClass: 'badge-info',
        borderClass: 'border-blue-300',
        gradientFrom: 'from-blue-50',
        gradientTo: 'to-indigo-50',
      },
      approved: {
        icon: FaCheckCircle,
        title: 'Application Approved! 🎉',
        message: 'Congratulations! Your application has been approved. You can now complete your professional profile and start consulting.',
        bgClass: 'bg-green-100',
        iconClass: 'text-green-500',
        badgeClass: 'badge-success',
        borderClass: 'border-green-300',
        gradientFrom: 'from-green-50',
        gradientTo: 'to-emerald-50',
      },
      rejected: {
        icon: FaTimesCircle,
        title: 'Application Needs Revision',
        message: 'Your application could not be approved at this time. Please review the admin feedback below and resubmit with the correct documents.',
        bgClass: 'bg-red-100',
        iconClass: 'text-red-500',
        badgeClass: 'badge-error',
        borderClass: 'border-red-300',
        gradientFrom: 'from-red-50',
        gradientTo: 'to-pink-50',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    // Timeline steps for visual journey
    const timelineSteps = [
      { key: 'submitted', label: 'Submitted', icon: FaFileUpload, done: true },
      { key: 'pending', label: 'Pending Review', icon: FaClock, done: ['pending', 'processing', 'approved'].includes(status) },
      { key: 'processing', label: 'Verifying', icon: FaSearch, done: ['processing', 'approved'].includes(status) },
      { key: 'approved', label: 'Approved', icon: FaCheckCircle, done: status === 'approved' },
    ];

    // If rejected, show rejected timeline
    const rejectedTimeline = [
      { key: 'submitted', label: 'Submitted', icon: FaFileUpload, done: true },
      { key: 'reviewed', label: 'Reviewed', icon: FaSearch, done: true },
      { key: 'rejected', label: 'Rejected', icon: FaTimesCircle, done: true, isError: true },
    ];

    const timeline = status === 'rejected' ? rejectedTimeline : timelineSteps;

    return (
      <div className="animate-fadeIn">
        {/* Status Hero Card */}
        <div className={`bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} border ${config.borderClass} rounded-xl p-6 mb-6`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Status Icon */}
            <div className="relative flex-shrink-0">
              <div className={`w-20 h-20 ${config.bgClass} rounded-full flex items-center justify-center`}>
                <StatusIcon className={`text-3xl ${config.iconClass}`} />
              </div>
              {(status === 'pending' || status === 'processing') && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <FaClock className="text-white text-xs" />
                </div>
              )}
            </div>

            {/* Status Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-800">{config.title}</h2>
                <span className={`badge ${config.badgeClass}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{config.message}</p>
            </div>
          </div>
        </div>

        {/* Visual Journey Timeline */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Application Journey</h3>
          <div className="relative">
            {timeline.map((step, index) => {
              const isActive = (status === 'pending' && step.key === 'pending') ||
                               (status === 'processing' && step.key === 'processing') ||
                               (status === 'approved' && step.key === 'approved') ||
                               (status === 'rejected' && step.key === 'rejected');
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {/* Timeline Node & Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300
                        ${step.isError
                          ? 'bg-red-500 border-red-500 text-white'
                          : step.done
                            ? isActive
                              ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200'
                              : 'bg-green-500 border-green-500 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        }
                        ${isActive && !step.isError ? 'ring-4 ring-blue-100' : ''}
                      `}
                    >
                      <Icon size={14} />
                    </div>
                    {/* Vertical connector line */}
                    {index < timeline.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          step.done && timeline[index + 1]?.done
                            ? step.isError || timeline[index + 1]?.isError
                              ? 'bg-red-300'
                              : 'bg-green-300'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className={`pb-6 ${index === timeline.length - 1 ? 'pb-0' : ''}`}>
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-700' : step.done ? (step.isError ? 'text-red-700' : 'text-green-700') : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    {isActive && (status === 'pending' || status === 'processing') && (
                      <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        In progress...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Details Card */}
        {applicationData?.application && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaFileUpload className="text-gray-400" size={14} />
                Application Details
              </h3>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {applicationData.application.submitted_at && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FaClock size={12} className="text-gray-400" /> Submitted
                  </span>
                  <span className="text-gray-700 font-medium">
                    {new Date(applicationData.application.submitted_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
              {applicationData.application.reviewed_at && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FaSearch size={12} className="text-gray-400" /> Reviewed
                  </span>
                  <span className="text-gray-700 font-medium">
                    {new Date(applicationData.application.reviewed_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
              {applicationData.application.reviewed_by?.name && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FaUserMd size={12} className="text-gray-400" /> Reviewed By
                  </span>
                  <span className="text-gray-700 font-medium">{applicationData.application.reviewed_by.name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Comments Section (Prominent for rejected) */}
        {applicationData?.application?.admin_comment && (
          <div className={`rounded-xl overflow-hidden mb-6 border ${
            status === 'rejected' ? 'border-red-200 bg-red-50' : status === 'approved' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
          }`}>
            <div className={`px-4 py-3 border-b ${
              status === 'rejected' ? 'bg-red-100 border-red-200' : status === 'approved' ? 'bg-green-100 border-green-200' : 'bg-blue-100 border-blue-200'
            }`}>
              <h3 className={`text-sm font-semibold flex items-center gap-2 ${
                status === 'rejected' ? 'text-red-700' : status === 'approved' ? 'text-green-700' : 'text-blue-700'
              }`}>
                {status === 'rejected' ? (
                  <><FaExclamationTriangle size={14} /> Rejection Reason</>
                ) : (
                  <><FaCheckCircle size={14} /> Admin Feedback</>
                )}
              </h3>
            </div>
            <div className="p-4">
              <p className={`text-sm leading-relaxed ${
                status === 'rejected' ? 'text-red-700' : status === 'approved' ? 'text-green-700' : 'text-blue-700'
              }`}>
                &quot;{applicationData.application.admin_comment}&quot;
              </p>
              {status === 'rejected' && (
                <p className="text-xs text-red-500 mt-3 italic">
                  Please address the above feedback and resubmit your documents.
                </p>
              )}
            </div>
          </div>
        )}

        {/* What Happens Next - Only for pending/processing */}
        {(status === 'pending' || status === 'processing') && (
          <div className="alert-info text-left mb-6">
            <p className="font-medium flex items-center gap-2">
              <FaClock size={14} /> What happens next?
            </p>
            <ul className="text-sm mt-2 list-disc list-inside space-y-1.5">
              <li>Our admin team will verify your uploaded documents</li>
              <li>You&apos;ll receive an <strong>email notification</strong> when status changes</li>
              <li>Review usually takes <strong className="text-blue-600">24-48 hours</strong></li>
              <li>Once approved, you&apos;ll be prompted to complete your profile</li>
            </ul>
            <p className="text-xs text-blue-500 mt-3 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Status auto-refreshes every 30 seconds
            </p>
          </div>
        )}

        {/* Approved Success - CTA to Complete Profile */}
        {status === 'approved' && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mb-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
                <FaUserMd className="text-2xl text-green-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-green-800 mb-1">You&apos;re Almost There!</h3>
            <p className="text-sm text-green-600 mb-4">
              Complete your professional profile to start receiving consultations.
            </p>
            <button
              onClick={() => setActiveStep(3)}
              className="btn-primary !bg-green-500 hover:!bg-green-600 flex items-center justify-center gap-2 mx-auto !w-auto px-8"
            >
              Complete Your Profile <FaArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Rejected - Resubmit CTA */}
        {status === 'rejected' && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 mb-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <FaFileUpload className="text-2xl text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-1">Resubmit Your Documents</h3>
            <p className="text-sm text-red-600 mb-4">
              Please review the admin feedback above and upload corrected documents.
            </p>
            <button
              onClick={() => setActiveStep(1)}
              className="btn-primary !bg-red-500 hover:!bg-red-600 flex items-center justify-center gap-2 mx-auto !w-auto px-8"
            >
              <FaFileUpload size={14} /> Resubmit Documents
            </button>
          </div>
        )}

        {/* Refresh Status Button - Pending/Processing */}
        {(status === 'pending' || status === 'processing') && (
          <button
            onClick={fetchStatus}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <FaSearch size={14} /> Check Status Now
          </button>
        )}
      </div>
    );
  };

  // ==========================================
  // STEP 3 RENDER: COMPLETE PROFILE
  // ==========================================
  const renderCompleteProfile = () => (
    <form onSubmit={handleProfileSubmit} className="animate-fadeIn">
      <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
        <FaUserMd className="text-blue-500" />
        Complete Your Profile
      </h2>
      <p className="text-sm text-gray-500 mb-5">Final step to start your practice on PhilBox</p>

      {/* Profile & Cover Images */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-700 mb-3">Profile Images</h3>
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

      {/* Professional Information */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-700 mb-3">Professional Information</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="input-label">
              PMDC / License Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="license_number"
              value={profileFormData.license_number}
              onChange={handleProfileChange}
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
              value={profileFormData.affiliated_hospital}
              onChange={handleProfileChange}
              className="input-field"
              placeholder="City Hospital"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="input-label">
              Consultation Type <span className="text-red-500">*</span>
            </label>
            <select
              name="consultation_type"
              value={profileFormData.consultation_type}
              onChange={handleProfileChange}
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
            <label className="input-label">
              Consultation Fee (PKR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="consultation_fee"
              value={profileFormData.consultation_fee}
              onChange={handleProfileChange}
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
            value={profileFormData.onlineProfileURL}
            onChange={handleProfileChange}
            className="input-field"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
      </div>

      {/* Specializations */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-700">
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

      {/* Education */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-700">
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

      {/* Experience */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-700">Experience Details</h3>
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

      {/* Digital Signature */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-700 mb-3">Digital Signature</h3>
        <FileUploadBox
          file={digitalSignature}
          onFileChange={setDigitalSignature}
          onRemove={() => setDigitalSignature(null)}
          label="Upload Signature Image"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={profileLoading}
        className="btn-primary flex items-center justify-center gap-2"
      >
        {profileLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </>
        ) : (
          'Complete Profile & Start'
        )}
      </button>
    </form>
  );

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="card-container !w-[700px] !max-w-[95vw] text-center">
          <img src="/Philbox.PNG" alt="Logo" className="auth-logo" />
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-500">Loading your application status...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="auth-wrapper !py-8">
      <div className="card-container !w-[700px] !max-w-[95vw]">
        {/* Logo */}
        <img src="/Philbox.PNG" alt="Logo" className="auth-logo" />

        {/* Title */}
        <h1 className="auth-title">Doctor Onboarding</h1>
        <p className="auth-subtitle">
          {activeStep === 1 && 'Upload your documents for verification'}
          {activeStep === 2 && 'Track your application status'}
          {activeStep === 3 && 'Complete your professional profile'}
        </p>

        {/* Step Progress */}
        <StepIndicator />

        {/* Error Message */}
        {error && <div className="alert-error mb-4">{error}</div>}

        {/* Doctor Welcome */}
        {applicationData?.doctor?.fullName && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-5">
            <p className="text-sm text-blue-700">
              Welcome, <strong>Dr. {applicationData.doctor.fullName}</strong>
            </p>
          </div>
        )}

        {/* Render Active Step */}
        {activeStep === 1 && renderDocumentUpload()}
        {activeStep === 2 && renderApplicationStatus()}
        {activeStep === 3 && renderCompleteProfile()}
      </div>
    </div>
  );
}
