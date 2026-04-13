import { useState, useRef, useEffect } from 'react';
import {
  FaCloudUploadAlt,
  FaDownload,
  FaFileExcel,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaRedo,
  FaEye,
  FaArrowLeft,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { salespersonInventoryUploadApi } from '../../../../core/api/salesperson/inventoryUpload.service';

import { branchApi } from '../../../../core/api/admin/adminApi';
import { useAuth } from '../../../../shared/context/AuthContext';

// ==========================================
// UPLOAD STEP INDICATOR
// ==========================================
function StepIndicator({ currentStep }) {
  const steps = [
    { num: 1, label: 'Upload File' },
    { num: 2, label: 'Preview & Validate' },
    { num: 3, label: 'Confirm & Process' },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            currentStep === step.num
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : currentStep > step.num
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {currentStep > step.num ? (
              <FaCheckCircle size={14} />
            ) : (
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{step.num}</span>
            )}
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-0.5 mx-1 ${currentStep > step.num ? 'bg-green-300' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// ERROR ROW CARD
// ==========================================
function ErrorRow({ error, onResolve }) {
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    setResolving(true);
    try {
      await onResolve(error);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
      <div className="flex items-start gap-3">
        <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
        <div>
          <p className="text-sm font-medium text-red-800">Row {error.row || error.rowNumber || '?'}</p>
          <p className="text-xs text-red-600 mt-0.5">{error.message || error.error || 'Validation error'}</p>
          {error.data && (
            <p className="text-xs text-gray-500 mt-1 font-mono">{JSON.stringify(error.data).slice(0, 100)}</p>
          )}
        </div>
      </div>
      <button
        onClick={handleResolve}
        disabled={resolving}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {resolving ? <FaSpinner className="animate-spin" size={10} /> : <FaRedo size={10} />}
        {resolving ? 'Resolving...' : 'Resolve'}
      </button>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function InventoryUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const defaultBranchId = user?.branch_id?._id || user?.branch_id || '';

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [branchId, setBranchId] = useState(defaultBranchId);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [apiBranches, setApiBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchApi.getAll(1, 100, { status: 'Active' });
        const branches = response.data?.branches || [];
        if (Array.isArray(branches)) {
          setApiBranches(branches);
          if (branches.length > 0) {
            setBranchId(prev => prev || branches[0]._id);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch assigned branches', err);
      }
    };
    fetchBranches();
  }, []);

  // Preview data
  const [previewData, setPreviewData] = useState(null);
  const [previewErrors, setPreviewErrors] = useState([]);

  // Upload result
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);

  // Status
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // success, error, info

  // ==========================================
  // DOWNLOAD TEMPLATE
  // ==========================================
  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const response = await salespersonInventoryUploadApi.downloadTemplate();
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'inventory_template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setStatusMessage('Template downloaded successfully!');
      setStatusType('success');
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to download template');
      setStatusType('error');
    } finally {
      setDownloadingTemplate(false);
      setTimeout(() => { setStatusMessage(''); setStatusType(''); }, 3000);
    }
  };

  // ==========================================
  // HANDLE FILE SELECT
  // ==========================================
  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(selected.type) && !selected.name.match(/\.(xlsx|xls|csv)$/i)) {
      setStatusMessage('Please select a valid Excel or CSV file');
      setStatusType('error');
      return;
    }

    setFile(selected);
    setStatusMessage('');
    setStatusType('');
  };

  // ==========================================
  // PREVIEW
  // ==========================================
  const handlePreview = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (branchId) formData.append('branch_id', branchId);

      const res = await salespersonInventoryUploadApi.previewUpload(formData);
      const data = res.data || res;
      setPreviewData(data.validRows || data.preview || data.rows || []);
      setPreviewErrors(data.errors || data.invalidRows || []);
      setStep(2);
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to preview file');
      setStatusType('error');
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // CONFIRM UPLOAD
  // ==========================================
  const handleConfirmUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (branchId) formData.append('branch_id', branchId);

      const res = await salespersonInventoryUploadApi.uploadInventory(formData);
      const data = res.data || res;
      setUploadResult(data);
      setUploadErrors(data.errors || []);
      setStep(3);
      setStatusMessage('Inventory uploaded successfully!');
      setStatusType('success');
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Upload failed');
      setStatusType('error');
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // RESET
  // ==========================================
  const resetUpload = () => {
    setStep(1);
    setFile(null);
    setBranchId(defaultBranchId);
    setPreviewData(null);
    setPreviewErrors([]);
    setUploadResult(null);
    setUploadErrors([]);
    setStatusMessage('');
    setStatusType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 py-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/salesperson/inventory')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
            <FaArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaCloudUploadAlt className="text-green-500" />
              Bulk Inventory Upload
            </h1>
            <p className="text-sm text-gray-500 mt-1">Upload Excel file to add or update multiple medicines at once</p>
          </div>
        </div>
        <button
          onClick={handleDownloadTemplate}
          disabled={downloadingTemplate}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md disabled:opacity-50"
        >
          {downloadingTemplate ? <FaSpinner className="animate-spin" size={14} /> : <FaDownload size={14} />}
          Download Template
        </button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`rounded-xl p-4 text-sm flex items-center gap-2 ${
          statusType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          statusType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {statusType === 'success' ? <FaCheckCircle /> : statusType === 'error' ? <FaExclamationTriangle /> : null}
          {statusMessage}
        </div>
      )}

      {/* Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* ==========================================
          STEP 1: UPLOAD FILE
      ========================================== */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/30 ${
              file ? 'border-green-300 bg-green-50/30' : 'border-gray-300'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FaFileExcel className="text-green-600 text-2xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                >
                  <FaTimes size={10} /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaCloudUploadAlt className="text-gray-400 text-2xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">Supports .xlsx, .xls, .csv files</p>
                </div>
              </div>
            )}
          </div>

          {/* Branch Select */}
          <div className="mt-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Select Branch *</label>
            {apiBranches.length > 0 ? (
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select Branch</option>
                {apiBranches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            ) : (
                <div className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500">
                  Loading branches...
                </div>
            )}
          </div>

          {/* Action */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handlePreview}
              disabled={!file || uploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? <FaSpinner className="animate-spin" size={14} /> : <FaEye size={14} />}
              {uploading ? 'Validating...' : 'Preview & Validate'}
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 2: PREVIEW & VALIDATE
      ========================================== */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{Array.isArray(previewData) ? previewData.length : 0}</p>
              <p className="text-xs font-semibold text-green-700 uppercase mt-1">Valid Rows</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{previewErrors.length}</p>
              <p className="text-xs font-semibold text-red-700 uppercase mt-1">Errors Found</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{(Array.isArray(previewData) ? previewData.length : 0) + previewErrors.length}</p>
              <p className="text-xs font-semibold text-blue-700 uppercase mt-1">Total Rows</p>
            </div>
          </div>

          {/* Preview Table */}
          {Array.isArray(previewData) && previewData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" /> Valid Rows Preview
                </h3>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-500 font-semibold uppercase">#</th>
                      <th className="px-4 py-2 text-left text-gray-500 font-semibold uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-gray-500 font-semibold uppercase">Category</th>
                      <th className="px-4 py-2 text-left text-gray-500 font-semibold uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-gray-500 font-semibold uppercase">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 20).map((row, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2 font-medium text-gray-800">{row.Name || row.name || '—'}</td>
                        <td className="px-4 py-2 text-gray-600">{row.category || '—'}</td>
                        <td className="px-4 py-2 text-gray-600">{row.unit_price || row.price || '—'}</td>
                        <td className="px-4 py-2 text-gray-600">{row.quantity_in_stock || row.stock || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 20 && (
                  <p className="text-xs text-gray-400 text-center py-2">...and {previewData.length - 20} more rows</p>
                )}
              </div>
            </div>
          )}

          {/* Errors */}
          {previewErrors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-red-800 flex items-center gap-2">
                <FaExclamationTriangle /> Validation Errors
              </h3>
              {previewErrors.map((err, i) => (
                <ErrorRow key={i} error={err} onResolve={() => {}} />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => { setStep(1); setPreviewData(null); setPreviewErrors([]); }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaArrowLeft size={12} /> Back
            </button>
            <button
              onClick={handleConfirmUpload}
              disabled={uploading || (Array.isArray(previewData) && previewData.length === 0)}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            >
              {uploading ? <FaSpinner className="animate-spin" size={14} /> : <FaCloudUploadAlt size={14} />}
              {uploading ? 'Uploading...' : 'Confirm & Upload'}
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 3: RESULT
      ========================================== */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            uploadErrors.length > 0 ? 'bg-orange-100' : 'bg-green-100'
          }`}>
            {uploadErrors.length > 0 ? (
              <FaExclamationTriangle className="text-orange-500 text-3xl" />
            ) : (
              <FaCheckCircle className="text-green-500 text-3xl" />
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {uploadErrors.length > 0 ? 'Upload Completed with Warnings' : 'Upload Successful! 🎉'}
          </h2>
          <p className="text-gray-500 mb-6">
            {uploadResult?.message || `${uploadResult?.inserted || uploadResult?.processed || 0} medicines have been processed.`}
          </p>

          {uploadResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 max-w-2xl mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-lg font-bold text-green-600">{uploadResult.inserted || uploadResult.created || 0}</p>
                <p className="text-xs text-green-700">Inserted</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-lg font-bold text-blue-600">{uploadResult.updated || 0}</p>
                <p className="text-xs text-blue-700">Updated</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-lg font-bold text-gray-600">{uploadResult.skipped || 0}</p>
                <p className="text-xs text-gray-500">Skipped</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-lg font-bold text-red-600">{uploadResult.failed || uploadErrors.length || 0}</p>
                <p className="text-xs text-red-700">Failed</p>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button
              onClick={resetUpload}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaRedo size={12} /> Upload Another
            </button>
            <button
              onClick={() => navigate('/salesperson/inventory')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <FaEye size={12} /> View Inventory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
