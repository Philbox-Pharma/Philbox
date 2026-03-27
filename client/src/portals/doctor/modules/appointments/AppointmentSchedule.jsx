import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaClinicMedical,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaTimes,
  FaSearch,
  FaStethoscope,
  FaNotesMedical,
} from 'react-icons/fa';
import { doctorAppointmentsApi } from '../../../../core/api/doctor/appointments.service';
import MedicalHistoryModal from '../../components/MedicalHistoryModal';

// ==========================================
// STATUS CONFIG
// ==========================================
const STATUS_CONFIG = {
  accepted: { label: 'Accepted', bg: 'bg-green-100', text: 'text-green-700', icon: FaCheckCircle },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-100', text: 'text-blue-700', icon: FaCheckCircle },
  completed: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: FaCheckCircle },
  'in-progress': { label: 'In Progress', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FaClock },
};

// ==========================================
// SCHEDULE CARD
// ==========================================
function ScheduleCard({ appointment, onViewHistory }) {
  const patient = appointment.patient_id || appointment.patient || {};
  const slot = appointment.slot_id || {};
  const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.accepted;
  const StatusIcon = statusInfo.icon;

  const appointmentDate = slot.date || appointment.preferred_date;
  const dateObj = appointmentDate ? new Date(appointmentDate) : new Date();
  const isPast = dateObj < new Date(new Date().toDateString());

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden ${
        isPast ? 'opacity-70' : ''
      }`}
    >
      {/* Top accent */}
      <div
        className={`h-1 ${
          isPast
            ? 'bg-gray-300'
            : appointment.status === 'completed'
            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
            : 'bg-gradient-to-r from-blue-400 to-indigo-500'
        }`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {(patient.fullName || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                {patient.fullName || 'Patient'}
              </h3>
              <p className="text-xs text-gray-500">{patient.email || '—'}</p>
            </div>
          </div>
          <span className={`badge ${statusInfo.bg} ${statusInfo.text} flex items-center gap-1`}>
            <StatusIcon size={10} />
            {statusInfo.label}
          </span>
        </div>

        {/* Schedule Details */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt size={11} className="text-gray-400" />
            {dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <FaClock size={11} className="text-gray-400" />
            {slot.start_time || appointment.preferred_time || '—'}{' '}
            {slot.end_time ? `— ${slot.end_time}` : ''}
          </span>
          <span
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${
              appointment.appointment_type === 'online'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-purple-50 text-purple-600'
            }`}
          >
            {appointment.appointment_type === 'online' ? (
              <FaVideo size={10} />
            ) : (
              <FaClinicMedical size={10} />
            )}
            {appointment.appointment_type === 'online' ? 'Online' : 'In-Person'}
          </span>
        </div>

        {/* Duration */}
        {slot.slot_duration && (
          <p className="text-xs text-gray-400">Duration: {slot.slot_duration} min</p>
        )}

        {/* Notes */}
        {appointment.notes && (
          <div className="bg-gray-50 rounded-lg p-2.5 mt-2">
            <p className="text-xs text-gray-600 line-clamp-2">{appointment.notes}</p>
          </div>
        )}

        {isPast && (
          <p className="text-xs text-gray-400 mt-2 italic">Past appointment</p>
        )}

        {/* Action Button */}
        <div className="pt-3 border-t border-gray-100 mt-3 flex justify-end">
          <button
            onClick={() => onViewHistory(patient._id)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <FaNotesMedical /> View Medical History
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AppointmentSchedule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Medical History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyPatientId, setHistoryPatientId] = useState(null);

  // ==========================================
  // FETCH
  // ==========================================
  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const filters = {
        page,
        limit,
        ...(typeFilter && { appointment_type: typeFilter }),
      };
      const response = await doctorAppointmentsApi.getAcceptedAppointments(filters);
      const data = response.data || {};
      setAppointments(data.appointments || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || data.total || 0);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err.response?.data?.message || 'Failed to load schedule.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCalendarCheck className="text-blue-500" />
            My Schedule
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Your accepted and upcoming appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary !w-auto px-4 flex items-center gap-1.5 text-sm ${
              showFilters ? '!bg-blue-50 !text-blue-600 !border-blue-200' : ''
            }`}
          >
            <FaFilter size={12} /> Filter
          </button>
          {totalCount > 0 && (
            <span className="badge bg-blue-100 text-blue-700 text-sm px-3 py-1.5">
              {totalCount} appointment{totalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 animate-fadeIn shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <label className="input-label !mb-0">Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="input-field !w-auto"
            >
              <option value="">All Types</option>
              <option value="online">Online</option>
              <option value="in-person">In-Person</option>
            </select>
            {typeFilter && (
              <button
                onClick={() => {
                  setTypeFilter('');
                  setPage(1);
                }}
                className="btn-secondary !w-auto px-3 text-sm flex items-center gap-1"
              >
                <FaTimes size={10} /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div className="alert-error">{error}</div>}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-500">Loading schedule...</p>
        </div>
      )}

      {/* Cards */}
      {!loading && appointments.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{appointments.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{totalCount}</span> appointments
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((appt) => (
              <ScheduleCard 
                key={appt._id} 
                appointment={appt} 
                onViewHistory={(pid) => {
                  setHistoryPatientId(pid);
                  setHistoryModalOpen(true);
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty */}
      {!loading && !error && appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <FaCalendarCheck className="text-3xl text-blue-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Appointments Yet</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Your accepted and confirmed appointments will appear here.
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <FaChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) pageNum = i + 1;
            else if (page <= 3) pageNum = i + 1;
            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = page - 2 + i;
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      )}

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
