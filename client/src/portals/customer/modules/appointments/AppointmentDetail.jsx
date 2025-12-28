import { useState } from 'react';
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
    FaFilePrescription,
    FaPhoneAlt,
    FaTimes,
    FaExternalLinkAlt,
    FaStar
} from 'react-icons/fa';
import ContactSupportModal from '../../../../shared/components/Modal/ContactSupportModal';

export default function AppointmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Modal States
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);

    // Mock appointments database
    const appointmentsDatabase = {
        'APT-001': {
            id: 'APT-001',
            doctor: {
                name: 'Dr. Ahmed Khan',
                specialty: 'Cardiologist',
                image: 'https://via.placeholder.com/100x100?text=AK',
                hospital: 'Heart Care Hospital, Lahore',
                phone: '+92 300 1234567',
                rating: 4.8,
            },
            date: '2024-01-28',
            time: '10:00 AM',
            type: 'video',
            status: 'upcoming',
            fee: 2000,
            paymentStatus: 'Paid',
            meetingLink: 'https://meet.philbox.com/apt-001',
            notes: 'Regular checkup for blood pressure monitoring.',
            prescription: null,
            bookedOn: '2024-01-20',
        },
        'APT-002': {
            id: 'APT-002',
            doctor: {
                name: 'Dr. Sara Ali',
                specialty: 'Dermatologist',
                image: 'https://via.placeholder.com/100x100?text=SA',
                hospital: 'Skin & Beauty Clinic, Lahore',
                phone: '+92 300 2345678',
                rating: 4.9,
            },
            date: '2024-01-30',
            time: '02:30 PM',
            type: 'in-person',
            status: 'upcoming',
            fee: 1500,
            paymentStatus: 'Paid',
            location: 'Skin & Beauty Clinic, Main Boulevard, Lahore',
            notes: 'Skin allergy consultation.',
            prescription: null,
            bookedOn: '2024-01-22',
        },
        'APT-003': {
            id: 'APT-003',
            doctor: {
                name: 'Dr. Usman Malik',
                specialty: 'General Physician',
                image: 'https://via.placeholder.com/100x100?text=UM',
                hospital: 'PhilBox Online Clinic',
                phone: '+92 300 3456789',
                rating: 4.6,
            },
            date: '2024-01-20',
            time: '11:00 AM',
            type: 'video',
            status: 'completed',
            fee: 1000,
            paymentStatus: 'Paid',
            notes: 'Fever and flu symptoms.',
            prescription: {
                id: 'PRX-001',
                diagnosis: 'Viral Fever',
                medicines: [
                    { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Every 6 hours', duration: '5 days' },
                    { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once daily', duration: '5 days' },
                ],
            },
            bookedOn: '2024-01-15',
            completedOn: '2024-01-20',
        },
        'APT-004': {
            id: 'APT-004',
            doctor: {
                name: 'Dr. Fatima Noor',
                specialty: 'Gynecologist',
                image: 'https://via.placeholder.com/100x100?text=FN',
                hospital: 'Women Health Center, Lahore',
                phone: '+92 300 4567890',
                rating: 4.7,
            },
            date: '2024-01-15',
            time: '04:00 PM',
            type: 'in-person',
            status: 'completed',
            fee: 2500,
            paymentStatus: 'Paid',
            location: 'Women Health Center, Gulberg, Lahore',
            notes: 'Routine checkup.',
            prescription: {
                id: 'PRX-002',
                diagnosis: 'Iron Deficiency',
                medicines: [
                    { name: 'Ferrous Sulfate', dosage: '1 tablet', frequency: 'Twice daily', duration: '30 days' },
                ],
            },
            bookedOn: '2024-01-10',
            completedOn: '2024-01-15',
        },
        'APT-005': {
            id: 'APT-005',
            doctor: {
                name: 'Dr. Hassan Raza',
                specialty: 'Orthopedic',
                image: 'https://via.placeholder.com/100x100?text=HR',
                hospital: 'Bone & Joint Hospital, Lahore',
                phone: '+92 300 5678901',
                rating: 4.5,
            },
            date: '2024-01-18',
            time: '09:00 AM',
            type: 'video',
            status: 'cancelled',
            fee: 1800,
            paymentStatus: 'Refunded',
            cancelReason: 'Doctor unavailable due to emergency.',
            notes: 'Knee pain consultation.',
            prescription: null,
            bookedOn: '2024-01-12',
            cancelledOn: '2024-01-17',
        },
    };

    const appointment = appointmentsDatabase[id];

    // Appointment not found
    if (!appointment) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Not Found</h2>
                <p className="text-gray-500 mb-6">The appointment you're looking for doesn't exist.</p>
                <Link to="/appointments" className="btn-primary inline-block px-6 py-3">
                    View All Appointments
                </Link>
            </div>
        );
    }

    // Status config
    const statusConfig = {
        upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: FaClock },
        completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
        cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
        'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: FaSpinner },
    };

    const StatusBadge = ({ status }) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className={status === 'in-progress' ? 'animate-spin' : ''} />
                {config.label}
            </span>
        );
    };

    // Cancel appointment
    const handleCancel = async () => {
        if (!cancelReason) {
            alert('Please select a reason');
            return;
        }

        setCancelLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        alert('Appointment cancelled successfully. Refund will be processed within 3-5 days.');
        setShowCancelModal(false);
        navigate('/appointments');
    };

    // Render stars
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
                size={14}
            />
        ));
    };

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
                        <h1 className="text-2xl font-bold text-gray-800">{appointment.id}</h1>
                        <p className="text-gray-500 mt-1">Booked on {appointment.bookedOn}</p>
                    </div>
                    <StatusBadge status={appointment.status} />
                </div>

                {/* Meeting Link for upcoming video appointments */}
                {appointment.status === 'upcoming' && appointment.type === 'video' && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-green-800">Video Consultation</p>
                                <p className="text-sm text-green-600 mt-1">
                                    Join the meeting at {appointment.time} on {appointment.date}
                                </p>
                            </div>
                            <a
                                href={appointment.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <FaVideo />
                                Join Meeting
                                <FaExternalLinkAlt size={12} />
                            </a>
                        </div>
                    </div>
                )}

                {/* Location for in-person */}
                {appointment.status === 'upcoming' && appointment.type === 'in-person' && (
                    <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="font-medium text-purple-800">In-Person Visit</p>
                        <p className="text-sm text-purple-600 mt-1">📍 {appointment.location}</p>
                    </div>
                )}

                {/* Cancelled Reason */}
                {appointment.status === 'cancelled' && appointment.cancelReason && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                            <span className="font-medium">Cancellation Reason:</span> {appointment.cancelReason}
                        </p>
                        <p className="text-sm text-red-600 mt-1">Cancelled on {appointment.cancelledOn}</p>
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
                            <img
                                src={appointment.doctor.image}
                                alt={appointment.doctor.name}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-lg">{appointment.doctor.name}</h3>
                                <p className="text-blue-600">{appointment.doctor.specialty}</p>
                                <p className="text-sm text-gray-500 mt-1">{appointment.doctor.hospital}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    {renderStars(appointment.doctor.rating)}
                                    <span className="text-sm text-gray-600 ml-1">{appointment.doctor.rating}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                                    <FaPhoneAlt className="text-gray-400" />
                                    {appointment.doctor.phone}
                                </p>
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
                                    <p className="font-medium text-gray-800">{appointment.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <FaClock className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium text-gray-800">{appointment.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    {appointment.type === 'video' ? (
                                        <FaVideo className="text-purple-600" />
                                    ) : (
                                        <FaHospital className="text-purple-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <p className="font-medium text-gray-800 capitalize">
                                        {appointment.type === 'video' ? 'Video Call' : 'In-Person'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-yellow-600 font-bold">₨</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Fee</p>
                                    <p className="font-medium text-gray-800">Rs. {appointment.fee}</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {appointment.notes && (
                            <div className="mt-6 pt-4 border-t">
                                <p className="text-sm text-gray-500 mb-1">Your Notes</p>
                                <p className="text-gray-800">{appointment.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Prescription (if completed) */}
                    {appointment.prescription && (
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <FaFilePrescription className="text-green-600" />
                                    Prescription
                                </h2>
                                <Link
                                    to="/prescriptions"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    View All Prescriptions
                                </Link>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Diagnosis</p>
                                <p className="font-medium text-gray-800">{appointment.prescription.diagnosis}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-2">Prescribed Medicines</p>
                                <div className="space-y-2">
                                    {appointment.prescription.medicines.map((med, index) => (
                                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                            <p className="font-medium text-gray-800">{med.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {med.dosage} • {med.frequency} • {med.duration}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                                <Link
                                    to={`/medicines?prescription=${appointment.prescription.id}`}
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    Order Medicines
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right - Summary & Actions */}
                <div className="space-y-6">
                    {/* Payment Summary */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Consultation Fee</span>
                                <span className="font-medium">Rs. {appointment.fee}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-800">Total</span>
                                <span className="font-bold text-blue-600">Rs. {appointment.fee}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-gray-600">Status</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${appointment.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                    appointment.paymentStatus === 'Refunded' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {appointment.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
                        <div className="space-y-3">
                            {/* Upcoming Actions */}
                            {appointment.status === 'upcoming' && (
                                <>
                                    {appointment.type === 'video' && (
                                        <a
                                            href={appointment.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            <FaVideo />
                                            Join Meeting
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <FaTimesCircle />
                                        Cancel Appointment
                                    </button>
                                </>
                            )}

                            {/* Completed Actions */}
                            {appointment.status === 'completed' && (
                                <>
                                    {appointment.prescription && (
                                        <Link
                                            to="/prescriptions"
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            <FaFilePrescription />
                                            View Prescription
                                        </Link>
                                    )}
                                    <Link
                                        to="/appointments/book"
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Book Again
                                    </Link>
                                </>
                            )}

                            {/* Cancelled Actions */}
                            {appointment.status === 'cancelled' && (
                                <Link
                                    to="/appointments/book"
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Book New Appointment
                                </Link>
                            )}

                            {/* Common - Contact Support */}
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
                            Are you sure you want to cancel this appointment? Refund will be processed within 3-5 business days.
                        </p>

                        <div className="mb-4">
                            <label className="input-label">Reason for cancellation *</label>
                            <select
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="input-field"
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

            {/* Contact Support Modal - Reusable Component */}
            <ContactSupportModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
            />
        </div>
    );
}
