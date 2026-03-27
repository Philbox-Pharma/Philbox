import { useState, useEffect, useCallback } from 'react';
import {
  FaCalendarCheck,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaClinicMedical,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaStickyNote,
  FaFilter,
} from 'react-icons/fa';
import { doctorAppointmentsApi } from '../../../../core/api/doctor/appointments.service';

// ==========================================
// REQUEST CARD
// ==========================================
function RequestCard({ appointment, onAccept, onReject, onView, actionLoading }) {
  const patient = appointment.patient_id || appointment.patient || {};
  const createdAt = appointment.created_at ? new Date(appointment.created_at) : new Date();

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-500" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {(patient.fullName || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                {patient.fullName || 'Patient'}
              </h3>
              <p className="text-xs text-gray-500">{patient.email || '—'}</p>
            </div>
          </div>
          <span className="badge bg-orange-100 text-orange-700 flex items-center gap-1">
            <FaHourglassHalf size={10} /> Pending
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt size={11} className="text-gray-400" />
            {appointment.preferred_date
              ? new Date(appointment.preferred_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </span>
          <span className="flex items-center gap-1.5">
            <FaClock size={11} className="text-gray-400" />
            {appointment.preferred_time || '—'}
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

        {/* Reason */}
        {appointment.reason && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-xs text-gray-500 font-medium mb-0.5">Reason</p>
            <p className="text-sm text-gray-700 line-clamp-2">{appointment.reason}</p>
          </div>
        )}

        {/* Submitted Time */}
        <p className="text-xs text-gray-400 mb-4">
          Submitted{' '}
          {createdAt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}{' '}
          at{' '}
          {createdAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(appointment._id)}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <FaCheckCircle size={13} />
            Accept
          </button>
          <button
            onClick={() => onReject(appointment)}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <FaTimesCircle size={13} />
            Reject
          </button>
          <button
            onClick={() => onView(appointment)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <FaEye size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// REJECT MODAL
// ==========================================
function RejectModal({ appointment, isOpen, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaTimesCircle /> Reject Request
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Please provide a reason for rejecting this appointment request from{' '}
            <span className="font-semibold">
              {appointment?.patient_id?.fullName || 'the patient'}
            </span>
            .
          </p>
          <label className="input-label">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="e.g., I'm not available on the requested date..."
            required
          />

          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="btn-secondary !w-auto px-6">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(appointment._id, reason)}
              disabled={!reason.trim() || loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 !bg-red-600 hover:!bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Rejecting...' : 'Reject Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// DETAIL MODAL
// ==========================================
function DetailModal({ appointment, isOpen, onClose }) {
  if (!isOpen || !appointment) return null;

  const patient = appointment.patient_id || appointment.patient || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn max-h-[85vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaEye /> Request Details
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Patient Info */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {(patient.fullName || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {patient.fullName || 'Patient'}
              </h3>
              <p className="text-sm text-gray-500">{patient.email || '—'}</p>
              {patient.contactNumber && (
                <p className="text-sm text-gray-500">{patient.contactNumber}</p>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Appointment Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Preferred Date</p>
                <p className="text-sm font-medium text-gray-800">
                  {appointment.preferred_date
                    ? new Date(appointment.preferred_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Preferred Time</p>
                <p className="text-sm font-medium text-gray-800">
                  {appointment.preferred_time || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                  {appointment.appointment_type === 'online' ? (
                    <>
                      <FaVideo size={12} className="text-blue-500" /> Online
                    </>
                  ) : (
                    <>
                      <FaClinicMedical size={12} className="text-purple-500" /> In-Person
                    </>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium text-orange-600">Pending</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          {appointment.reason && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                <FaStickyNote size={13} /> Patient's Reason
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed">{appointment.reason}</p>
            </div>
          )}

          {/* Symptoms */}
          {appointment.symptoms && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-purple-700 mb-2">Symptoms</h4>
              <p className="text-sm text-purple-800 leading-relaxed">{appointment.symptoms}</p>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4 bg-gray-50 flex-shrink-0">
          <button onClick={onClose} className="btn-secondary !w-auto px-6 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AppointmentRequests() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Modals
  const [rejectingAppointment, setRejectingAppointment] = useState(null);
  const [viewingAppointment, setViewingAppointment] = useState(null);

  // ==========================================
  // FETCH
  // ==========================================
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await doctorAppointmentsApi.getPendingRequests({
        page,
        limit,
        status: 'pending',
      });
      const data = response.data || {};
      setAppointments(data.appointments || data.requests || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || data.total || 0);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.message || 'Failed to load appointment requests.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const showMessage = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccess(msg);
      setError('');
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(msg);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleAccept = async (appointmentId) => {
    try {
      setActionLoading(true);
      await doctorAppointmentsApi.acceptRequest(appointmentId);
      showMessage('Appointment accepted successfully!');
      fetchRequests();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to accept request.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (appointmentId, reason) => {
    try {
      setActionLoading(true);
      await doctorAppointmentsApi.rejectRequest(appointmentId, reason);
      showMessage('Appointment rejected.');
      setRejectingAppointment(null);
      fetchRequests();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to reject request.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaHourglassHalf className="text-orange-500" />
            Appointment Requests
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and manage incoming appointment requests
          </p>
        </div>
        {totalCount > 0 && (
          <span className="badge bg-orange-100 text-orange-700 text-sm px-3 py-1.5">
            {totalCount} pending request{totalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Messages */}
      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            className="animate-spin h-10 w-10 text-orange-500 mb-4"
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
          <p className="text-gray-500">Loading requests...</p>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && appointments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appt) => (
            <RequestCard
              key={appt._id}
              appointment={appt}
              onAccept={handleAccept}
              onReject={setRejectingAppointment}
              onView={setViewingAppointment}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <FaCalendarCheck className="text-3xl text-orange-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Pending Requests</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            All appointment requests have been handled. New requests will appear here.
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
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
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

      {/* Modals */}
      <RejectModal
        appointment={rejectingAppointment}
        isOpen={!!rejectingAppointment}
        onClose={() => setRejectingAppointment(null)}
        onConfirm={handleReject}
        loading={actionLoading}
      />
      <DetailModal
        appointment={viewingAppointment}
        isOpen={!!viewingAppointment}
        onClose={() => setViewingAppointment(null)}
      />
    </div>
  );
}
