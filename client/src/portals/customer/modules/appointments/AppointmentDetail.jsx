import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaHospital,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaPhoneAlt,
  FaTimes,
  FaEnvelope,
} from 'react-icons/fa';
import appointmentsService from '../../../../core/api/customer/appointments.service';
import ContactSupportModal from '../../../../shared/components/Modal/ContactSupportModal';

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch appointment detail
  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await appointmentsService.getRequestById(id);
        setAppointment(response.data?.data || null);
      } catch (err) {
        console.error('Failed to load appointment:', err);
        setError('Appointment not found or failed to load.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Helpers
  const getDoctorName = () => {
    if (appointment?.doctor_id && typeof appointment.doctor_id === 'object') {
      return `Dr. ${appointment.doctor_id.first_name || ''} ${appointment.doctor_id.last_name || ''}`.trim();
    }
    return 'Doctor';
  };

  const getDoctorSpecialty = () => {
    if (appointment?.doctor_id?.specialization) {
      return Array.isArray(appointment.doctor_id.specialization)
        ? appointment.doctor_id.specialization.join(', ')
        : appointment.doctor_id.specialization;
    }
    return '';
  };

  const getDateTime = () => {
    if (appointment?.slot_id && typeof appointment.slot_id === 'object') {
      return {
        date: appointment.slot_id.date
          ? new Date(appointment.slot_id.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'TBD',
        time: appointment.slot_id.start_time
          ? `${appointment.slot_id.start_time}${appointment.slot_id.end_time ? ' - ' + appointment.slot_id.end_time : ''}`
          : 'TBD',
      };
    }
    if (appointment?.preferred_date) {
      return {
        date: new Date(appointment.preferred_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: appointment.preferred_time || 'TBD',
      };
    }
    return { date: 'Not scheduled', time: 'TBD' };
  };

  const getRequestStatus = () => appointment?.appointment_request || 'processing';
  const getAppointmentStatus = () => appointment?.status || 'pending';

  // Status config
  const statusConfig = {
    processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700', icon: FaSpinner },
    accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: FaTimesCircle },
    pending: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: FaClock },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
    'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: FaSpinner },
  };

  const currentStatus = getRequestStatus() === 'accepted' ? getAppointmentStatus() : getRequestStatus();
  const config = statusConfig[currentStatus] || statusConfig.processing;
  const StatusIcon = config.icon;

  // Cancel appointment request
  const handleCancel = async () => {
    if (!cancelReason) {
      alert('Please select a reason');
      return;
    }
    setCancelLoading(true);
    try {
      await appointmentsService.cancelRequest(id, cancelReason);
      alert('Appointment request cancelled successfully.');
      setShowCancelModal(false);
      navigate('/appointments');
    } catch (err) {
      console.error('Failed to cancel:', err);
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(false);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error / not found
  if (error || !appointment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Not Found</h2>
        <p className="text-gray-500 mb-6">{error || "The appointment you're looking for doesn't exist."}</p>
        <Link
          to="/appointments"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          View All Appointments
        </Link>
      </div>
    );
  }

  const dateTime = getDateTime();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/appointments"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
      >
        <FaArrowLeft />
        Back to Appointments
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Appointment Details</h1>
            <p className="text-gray-500 mt-1">
              Requested on{' '}
              {appointment.created_at
                ? new Date(appointment.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
            <StatusIcon className={currentStatus === 'processing' || currentStatus === 'in-progress' ? 'animate-spin' : ''} />
            {config.label}
          </span>
        </div>

        {/* Cancellation reason if cancelled */}
        {(getRequestStatus() === 'cancelled' || getRequestStatus() === 'rejected') && appointment.cancellation_reason && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <span className="font-medium">
                {getRequestStatus() === 'rejected' ? 'Rejection Reason' : 'Cancellation Reason'}:
              </span>{' '}
              {appointment.cancellation_reason}
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left - Doctor & Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Doctor Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Doctor Details</h2>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                {appointment.doctor_id?.profile_picture ? (
                  <img
                    src={appointment.doctor_id.profile_picture}
                    alt={getDoctorName()}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <FaUserMd className="text-blue-600 text-2xl" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-lg">{getDoctorName()}</h3>
                {getDoctorSpecialty() && (
                  <p className="text-blue-600">{getDoctorSpecialty()}</p>
                )}
                {appointment.doctor_id?.email && (
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    {appointment.doctor_id.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaCalendarAlt className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">{dateTime.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaClock className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-800">{dateTime.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  {appointment.appointment_type === 'video' || appointment.appointment_type === 'online' ? (
                    <FaVideo className="text-purple-600" />
                  ) : (
                    <FaHospital className="text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-800 capitalize">
                    {appointment.appointment_type === 'video' || appointment.appointment_type === 'online'
                      ? 'Video Call'
                      : 'In-Person'}
                  </p>
                </div>
              </div>
              {appointment.doctor_id?.consultation_fee && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">₨</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fee</p>
                    <p className="font-medium text-gray-800">Rs. {appointment.doctor_id.consultation_fee}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Consultation Reason */}
            {appointment.consultation_reason && (
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Consultation Reason</p>
                <p className="text-gray-800">{appointment.consultation_reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right - Summary & Actions */}
        <div className="space-y-6">
          {/* Payment Summary */}
          {appointment.doctor_id?.consultation_fee && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium">Rs. {appointment.doctor_id.consultation_fee}</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-blue-600">Rs. {appointment.doctor_id.consultation_fee}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
            <div className="space-y-3">
              {/* Cancel button for processing requests */}
              {getRequestStatus() === 'processing' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <FaTimesCircle />
                  Cancel Request
                </button>
              )}

              {/* Book again for completed/cancelled */}
              {(getRequestStatus() === 'cancelled' || getRequestStatus() === 'rejected' || getAppointmentStatus() === 'completed') && (
                <Link
                  to="/appointments/book"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Book New Appointment
                </Link>
              )}

              {/* Contact Support */}
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaPhoneAlt />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Cancel Appointment</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              Are you sure you want to cancel this appointment request?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for cancellation *
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select a reason</option>
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Found another doctor">Found another doctor</option>
                <option value="Feeling better">Feeling better</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading || !cancelReason}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      <ContactSupportModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
}
