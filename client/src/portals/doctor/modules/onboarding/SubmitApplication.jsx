import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCloudUploadAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { doctorAuthApi } from '../../../../core/api/doctor/auth.service';

export default function SubmitApplication() {
  const navigate = useNavigate();
  const location = useLocation();
  const isResubmit = location.state?.resubmit || false;

  const [files, setFiles] = useState({
    cnic_front: null,
    cnic_back: null,
    medical_license: null,
    mbbs_md_degree: null,
    specialist_license: null,
    experience_letters: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Required files
  const requiredFiles = [
    'cnic_front',
    'cnic_back',
    'medical_license',
    'mbbs_md_degree',
  ];

  // File labels
  const fileLabels = {
    cnic_front: 'CNIC Front Side',
    cnic_back: 'CNIC Back Side',
    medical_license: 'Medical License',
    mbbs_md_degree: 'MBBS / MD Degree',
    specialist_license: 'Specialist License (Optional)',
    experience_letters: 'Experience Letters (Optional)',
  };

  // Handle file change
  const handleFileChange = e => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles.length > 0) {
      setFiles(prev => ({
        ...prev,
        [name]: selectedFiles[0],
      }));
    }
  };

  // Remove file
  const handleRemoveFile = fieldName => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: null,
    }));
  };

  // Validate required files
  const validateFiles = () => {
    const missing = requiredFiles.filter(field => !files[field]);
    if (missing.length > 0) {
      const missingLabels = missing.map(f => fileLabels[f]).join(', ');
      setError(`Please upload required documents: ${missingLabels}`);
      return false;
    }
    return true;
  };

  // Handle submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!validateFiles()) return;

    setLoading(true);

    try {
      const formData = new FormData();

      // Append all files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const response = await doctorAuthApi.submitApplication(formData);

      if (
        response.data?.nextStep === 'waiting-approval' ||
        response.nextStep === 'waiting-approval'
      ) {
        navigate('/doctor/application-status');
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to submit application.';

      // Check for missing files error
      if (err.response?.data?.data?.missingFiles) {
        const missing = err.response.data.data.missingFiles.join(', ');
        setError(`Missing required documents: ${missing}`);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Group CNIC fields together for better UI
  const cnicFields = ['cnic_front', 'cnic_back'];
  const otherFields = [
    'medical_license',
    'mbbs_md_degree',
    'specialist_license',
    'experience_letters',
  ];

  return (
    <div className="auth-wrapper">
      <div className="card-container w-[550px]!">
        {/* Logo */}
        <img src="/vite.svg" alt="Logo" className="auth-logo" />

        {/* Title */}
        <h1 className="auth-title">
          {isResubmit ? 'Resubmit Application' : 'Submit Application'}
        </h1>
        <p className="auth-subtitle">
          {isResubmit
            ? 'Your previous documents were rejected. Please upload again.'
            : 'Upload your documents for verification'}
        </p>

        {/* Resubmit Warning */}
        {isResubmit && (
          <div className="alert-error mb-4">
            <p className="font-medium">Documents Rejected</p>
            <p className="text-sm mt-1">
              Please review and upload correct documents.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && <div className="alert-error mb-4">{error}</div>}

          {/* CNIC Section - Side by Side */}
          <div className="mb-4">
            <label className="input-label">
              CNIC / National ID <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {cnicFields.map(fieldName => (
                <div key={fieldName}>
                  <p className="text-xs text-gray-500 mb-2">
                    {fieldName === 'cnic_front' ? 'Front Side' : 'Back Side'}
                  </p>

                  {files[fieldName] ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FaCheckCircle className="text-green-500 shrink-0" />
                        <span className="text-xs text-green-700 truncate">
                          {files[fieldName].name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(fieldName)}
                        className="text-red-500 hover:text-red-700 shrink-0"
                      >
                        <FaTimesCircle />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                      <FaCloudUploadAlt className="text-2xl text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">
                        Click to upload
                      </span>
                      <input
                        type="file"
                        name={fieldName}
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Other File Upload Fields */}
          {otherFields.map(fieldName => (
            <div key={fieldName} className="mb-4">
              <label className="input-label">
                {fileLabels[fieldName]}
                {requiredFiles.includes(fieldName) && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>

              {/* File Input or Selected File */}
              {files[fieldName] ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-sm text-green-700 truncate max-w-[350px]">
                      {files[fieldName].name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(fieldName)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimesCircle />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <FaCloudUploadAlt className="text-3xl text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload</span>
                  <span className="text-xs text-gray-400 mt-1">
                    PDF, JPG, PNG (Max 5MB)
                  </span>
                  <input
                    type="file"
                    name={fieldName}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
