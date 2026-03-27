import { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaCalendarAlt,
  FaFilter,
  FaVideo,
  FaPrescriptionBottleAlt,
  FaStickyNote,
  FaFilePdf,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaPlay,
  FaDownload,
  FaStethoscope,
  FaExclamationTriangle,
  FaPlus,
  FaNotesMedical,
} from 'react-icons/fa';
import CreatePrescriptionModal from './CreatePrescriptionModal';
import MedicalHistoryModal from '../../components/MedicalHistoryModal';
import { doctorConsultationsApi } from '../../../../core/api/doctor/consultations.service';

// ==========================================
// STATUS CONFIGS
// ==========================================
const STATUS_CONFIG = {
  completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', icon: FaCheckCircle },
  missed: { label: 'Missed', bg: 'bg-red-100', text: 'text-red-700', icon: FaTimesCircle },
  'in-progress': { label: 'In Progress', bg: 'bg-blue-100', text: 'text-blue-700', icon: FaClock },
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FaClock },
};

// ==========================================
// CONSULTATION CARD COMPONENT
// ==========================================
function ConsultationCard({ consultation, onViewDetails }) {
  const patient = consultation.patient_id || {};
  const status = STATUS_CONFIG[consultation.status] || STATUS_CONFIG.completed;
  const StatusIcon = status.icon;
  const date = new Date(consultation.created_at);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={() => onViewDetails(consultation)}
    >
      {/* Top accent bar */}
      <div className={`h-1 ${consultation.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : consultation.status === 'missed' ? 'bg-gradient-to-r from-red-400 to-pink-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`} />

      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Patient Avatar */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {patient.fullName || 'Patient'}
              </h3>
              <p className="text-xs text-gray-500">{patient.email || '—'}</p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`badge ${status.bg} ${status.text} flex items-center gap-1`}>
            <StatusIcon size={11} />
            {status.label}
          </span>
        </div>

        {/* Details Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt size={11} className="text-gray-400" />
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <FaClock size={11} className="text-gray-400" />
            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${
            consultation.appointment_type === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
          }`}>
            {consultation.appointment_type === 'online' ? <FaVideo size={10} /> : <FaStethoscope size={10} />}
            {consultation.appointment_type === 'online' ? 'Online' : 'In-Person'}
          </span>
        </div>

        {/* Bottom Indicators */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          {consultation.recording_url && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <FaVideo size={10} /> Recording
            </span>
          )}
          {consultation.prescription_generated && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <FaPrescriptionBottleAlt size={10} /> Prescription
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto flex items-center gap-1 group-hover:text-blue-500 transition-colors">
            <FaEye size={10} /> View Details
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CONSULTATION DETAIL MODAL
// ==========================================
function ConsultationDetailModal({ consultation, isOpen, onClose, onCreatePrescription, onViewHistory }) {
  if (!isOpen || !consultation) return null;

  const patient = consultation.patient_id || {};
  const status = STATUS_CONFIG[consultation.status] || STATUS_CONFIG.completed;
  const StatusIcon = status.icon;
  const date = new Date(consultation.created_at);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaStethoscope /> Consultation Details
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Patient & Status */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{patient.fullName || 'Patient'}</h3>
                <p className="text-sm text-gray-500">{patient.email || '—'}</p>
                {patient.contactNumber && (
                  <p className="text-sm text-gray-500">{patient.contactNumber}</p>
                )}
              </div>
            </div>
            <span className={`badge ${status.bg} ${status.text} flex items-center gap-1 text-sm`}>
              <StatusIcon size={13} /> {status.label}
            </span>
          </div>

          {/* Appointment Info Grid */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Appointment Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-800">
                  {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium text-gray-800">
                  {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                  {consultation.appointment_type === 'online' ? (
                    <><FaVideo size={12} className="text-blue-500" /> Online Consultation</>
                  ) : (
                    <><FaStethoscope size={12} className="text-purple-500" /> In-Person</>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className={`text-sm font-medium ${status.text}`}>{status.label}</p>
              </div>
              {consultation.missed_by && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Missed By</p>
                  <p className="text-sm font-medium text-red-600 capitalize">{consultation.missed_by}</p>
                </div>
              )}
            </div>
          </div>

          {/* Consultation Notes */}
          {consultation.notes && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                <FaStickyNote size={13} /> Consultation Notes
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">{consultation.notes}</p>
            </div>
          )}

          {/* Video Recording */}
          {consultation.recording_url && (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <FaVideo size={13} /> Session Recording
                </h4>
                <a
                  href={consultation.recording_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <FaDownload size={10} /> Download
                </a>
              </div>
              <div className="aspect-video bg-black flex items-center justify-center">
                <video
                  src={consultation.recording_url}
                  controls
                  className="w-full h-full"
                  poster=""
                >
                  <track kind="captions" />
                  Your browser does not support video playback.
                </video>
              </div>
            </div>
          )}

          {/* No Recording Available */}
          {!consultation.recording_url && consultation.appointment_type === 'online' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <FaVideo className="text-gray-300 text-2xl mx-auto mb-2" />
              <p className="text-sm text-gray-500">No recording available for this session</p>
            </div>
          )}

          {/* Prescription */}
          {consultation.prescription_generated ? (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1.5">
                <FaPrescriptionBottleAlt size={13} /> Prescription Issued
              </h4>
              {typeof consultation.prescription_generated === 'object' ? (
                <div className="space-y-2">
                  {consultation.prescription_generated.medicines?.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{med.name}</p>
                        <p className="text-xs text-gray-500">{med.dosage} — {med.frequency}</p>
                      </div>
                      <span className="text-xs text-gray-400">{med.duration}</span>
                    </div>
                  ))}
                  {consultation.prescription_generated.notes && (
                    <p className="text-sm text-green-700 mt-2 italic">
                      Note: {consultation.prescription_generated.notes}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-green-700">Prescription has been generated for this consultation.</p>
              )}
            </div>
          ) : (
            ['completed', 'in-progress'].includes(consultation.status) && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <FaPrescriptionBottleAlt className="text-emerald-300 text-2xl mx-auto mb-2" />
                <p className="text-sm text-emerald-700 mb-3">No prescription issued yet.</p>
                <button
                  onClick={() => onCreatePrescription(consultation)}
                  className="btn-primary !w-auto px-5 py-2 text-sm !bg-emerald-600 hover:!bg-emerald-700 mx-auto flex items-center gap-2"
                >
                  <FaPlus size={12} /> Create Prescription
                </button>
              </div>
            )
          )}

          {/* Transaction Info */}
          {consultation.transaction_id && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-purple-700 flex items-center gap-1.5">
                <FaCheckCircle size={13} /> Payment Received
              </h4>
              <p className="text-sm text-purple-600 mt-1">
                Transaction ID: <span className="font-mono text-xs">{typeof consultation.transaction_id === 'string' ? consultation.transaction_id : consultation.transaction_id._id}</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0 flex items-center justify-between">
          <button onClick={onClose} className="btn-secondary !w-auto px-6 text-sm">
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewHistory(patient._id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
            >
              <FaNotesMedical size={12} /> Medical History
            </button>
            {consultation.recording_url && (
              <a
                href={consultation.recording_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <FaPlay size={10} /> Watch Recording
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN CONSULTATIONS PAGE
// ==========================================
export default function ConsultationHistory() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Detail modal
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Prescription modal
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescriptionConsultation, setPrescriptionConsultation] = useState(null);

  // Export
  const [exporting, setExporting] = useState(false);

  // Medical History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyPatientId, setHistoryPatientId] = useState(null);

  // ==========================================
  // FETCH CONSULTATIONS
  // ==========================================
  const fetchConsultations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {
        page,
        limit,
        ...(searchQuery && { patient_name: searchQuery }),
        ...(dateFrom && { start_date: dateFrom }),
        ...(dateTo && { end_date: dateTo }),
        ...(statusFilter && { status: statusFilter }),
      };

      const response = await doctorConsultationsApi.getConsultations(filters);
      const data = response.data || {};

      setConsultations(data.consultations || data.appointments || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || data.total || 0);
    } catch (err) {
      console.error('Error fetching consultations:', err);
      if (err.response?.status === 404) {
        setError('Consultation history API is not available yet. Backend endpoint needed: GET /api/doctor/consultations');
      } else {
        setError(err.response?.data?.message || 'Failed to load consultation history.');
      }
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, dateFrom, dateTo, statusFilter]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchConsultations();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('');
    setPage(1);
  };

  const handleViewDetails = async (consultation) => {
    // Try to fetch full details from API
    try {
      const response = await doctorConsultationsApi.getConsultationById(consultation._id);
      setSelectedConsultation(response.data || consultation);
    } catch {
      // If detail API fails, use existing data
      setSelectedConsultation(consultation);
    }
    setIsDetailOpen(true);
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const blob = await doctorConsultationsApi.exportToPDF({
        ...(dateFrom && { start_date: dateFrom }),
        ...(dateTo && { end_date: dateTo }),
        ...(statusFilter && { status: statusFilter }),
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `consultation-history-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('PDF export is not available yet. Backend endpoint needed: GET /api/doctor/consultations/export/pdf');
    } finally {
      setExporting(false);
    }
  };

  const hasActiveFilters = searchQuery || dateFrom || dateTo || statusFilter;

  // ==========================================
  // STATS
  // ==========================================
  const completedCount = consultations.filter(c => c.status === 'completed').length;
  const missedCount = consultations.filter(c => c.status === 'missed').length;
  const onlineCount = consultations.filter(c => c.appointment_type === 'online').length;

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaStethoscope className="text-blue-500" />
                Consultation History
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Review your past appointments and consultations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary !w-auto px-4 flex items-center gap-1.5 text-sm ${showFilters ? '!bg-blue-50 !text-blue-600 !border-blue-200' : ''}`}
              >
                <FaFilter size={12} /> Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exporting || consultations.length === 0}
                className="btn-primary !w-auto px-4 flex items-center gap-1.5 text-sm disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <FaFilePdf size={12} /> Export PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 animate-fadeIn shadow-sm">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="input-label">Patient Name</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field !pl-9"
                      placeholder="Search by name..."
                    />
                  </div>
                </div>

                {/* Date From */}
                <div>
                  <label className="input-label">From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="input-label">To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="input-label">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                    <option value="in-progress">In Progress</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                <button type="submit" className="btn-primary !w-auto px-5 text-sm flex items-center gap-1.5">
                  <FaSearch size={12} /> Apply Filters
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="btn-secondary !w-auto px-4 text-sm flex items-center gap-1.5"
                  >
                    <FaTimes size={12} /> Clear
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert-warning mb-6 flex items-start gap-2">
            <FaExclamationTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Backend API Required</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaStethoscope className="text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{totalCount}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{completedCount}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaTimesCircle className="text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-600">{missedCount}</p>
              <p className="text-xs text-gray-500">Missed</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <FaVideo className="text-indigo-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-indigo-600">{onlineCount}</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && consultations.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{consultations.length}</span> of{' '}
              <span className="font-semibold text-gray-700">{totalCount}</span> consultations
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-500">Loading consultations...</p>
          </div>
        )}

        {/* Consultations Grid */}
        {!loading && consultations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {consultations.map((consultation) => (
              <ConsultationCard
                key={consultation._id}
                consultation={consultation}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && consultations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaStethoscope className="text-3xl text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No Consultations Found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {hasActiveFilters
                ? 'No consultations match your current filters. Try adjusting your search criteria.'
                : 'Your consultation history will appear here once you start taking appointments.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="btn-secondary !w-auto px-5 mt-4 text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FaChevronLeft size={14} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    page === pageNum
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ConsultationDetailModal
        consultation={selectedConsultation}
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedConsultation(null); }}
        onCreatePrescription={(consultation) => {
          setIsDetailOpen(false);
          setPrescriptionConsultation(consultation);
          setIsPrescriptionModalOpen(true);
        }}
        onViewHistory={(pid) => {
          setHistoryPatientId(pid);
          setHistoryModalOpen(true);
        }}
      />

      {/* Prescription Modal */}
      <CreatePrescriptionModal
        consultation={prescriptionConsultation}
        isOpen={isPrescriptionModalOpen}
        onClose={() => {
          setIsPrescriptionModalOpen(false);
          setPrescriptionConsultation(null);
        }}
        onSuccess={() => {
          setIsPrescriptionModalOpen(false);
          setPrescriptionConsultation(null);
          fetchConsultations(); // refresh list
        }}
      />

      {/* Medical History Modal */}
      <MedicalHistoryModal
        patientId={historyPatientId}
        isOpen={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setHistoryPatientId(null);
        }}
      />
    </div>
  );
}
