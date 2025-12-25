import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaCalendarPlus,
    FaSearch,
    FaFilter,
    FaClock,
    FaVideo,
    FaHospital,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaCalendarAlt,
    FaTimes
} from 'react-icons/fa';
import ContactSupportModal from '../../../../shared/components/Modal/ContactSupportModal';

export default function Appointments() {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Modal states
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);

    // Mock appointments data
    const [appointments, setAppointments] = useState([
        {
            id: 'APT-001',
            doctor: {
                name: 'Dr. Ahmed Khan',
                specialty: 'Cardiologist',
                image: 'https://via.placeholder.com/60x60?text=AK',
            },
            date: '2024-01-28',
            time: '10:00 AM',
            type: 'video',
            status: 'upcoming',
            fee: 2000,
            meetingLink: 'https://meet.philbox.com/apt-001',
        },
        {
            id: 'APT-002',
            doctor: {
                name: 'Dr. Sara Ali',
                specialty: 'Dermatologist',
                image: 'https://via.placeholder.com/60x60?text=SA',
            },
            date: '2024-01-30',
            time: '02:30 PM',
            type: 'in-person',
            status: 'upcoming',
            fee: 1500,
            location: 'PhilBox Clinic, Lahore',
        },
        {
            id: 'APT-003',
            doctor: {
                name: 'Dr. Usman Malik',
                specialty: 'General Physician',
                image: 'https://via.placeholder.com/60x60?text=UM',
            },
            date: '2024-01-20',
            time: '11:00 AM',
            type: 'video',
            status: 'completed',
            fee: 1000,
            prescription: true,
        },
        {
            id: 'APT-004',
            doctor: {
                name: 'Dr. Fatima Noor',
                specialty: 'Gynecologist',
                image: 'https://via.placeholder.com/60x60?text=FN',
            },
            date: '2024-01-15',
            time: '04:00 PM',
            type: 'in-person',
            status: 'completed',
            fee: 2500,
            prescription: true,
        },
        {
            id: 'APT-005',
            doctor: {
                name: 'Dr. Hassan Raza',
                specialty: 'Orthopedic',
                image: 'https://via.placeholder.com/60x60?text=HR',
            },
            date: '2024-01-18',
            time: '09:00 AM',
            type: 'video',
            status: 'cancelled',
            fee: 1800,
            cancelReason: 'Doctor unavailable',
        },
    ]);

    // Status config
    const statusConfig = {
        upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: FaClock },
        completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
        cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
        'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: FaSpinner },
    };

    // Filter appointments
    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
        const matchesType = typeFilter === 'all' || apt.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Separate upcoming and past appointments
    const upcomingAppointments = filteredAppointments.filter(apt => apt.status === 'upcoming');
    const pastAppointments = filteredAppointments.filter(apt => apt.status !== 'upcoming');

    // Cancel handlers
    const handleCancelClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelModal(true);
    };

    const handleCancelConfirm = async () => {
        if (!cancelReason) {
            alert('Please select a reason');
            return;
        }

        setCancelLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        setAppointments(prev =>
            prev.map(apt =>
                apt.id === selectedAppointment.id
                    ? { ...apt, status: 'cancelled', cancelReason }
                    : apt
            )
        );

        alert('Appointment cancelled successfully! Refund will be processed within 3-5 days.');
        setShowCancelModal(false);
        setSelectedAppointment(null);
        setCancelReason('');
        setCancelLoading(false);
    };

    // Book again handler - FIXED
    const handleBookAgain = () => {
        navigate('/appointments/book');
    };

    const StatusBadge = ({ status }) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className={status === 'in-progress' ? 'animate-spin' : ''} size={12} />
                {config.label}
            </span>
        );
    };

    const AppointmentCard = ({ appointment }) => (
        <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                {/* Doctor Image */}
                <img
                    src={appointment.doctor.image}
                    alt={appointment.doctor.name}
                    className="w-14 h-14 rounded-full object-cover"
                />

                {/* Details */}
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-800">{appointment.doctor.name}</h3>
                            <p className="text-sm text-gray-500">{appointment.doctor.specialty}</p>
                        </div>
                        <StatusBadge status={appointment.status} />
                    </div>

                    {/* Date & Time */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                            <FaCalendarAlt className="text-blue-500" />
                            <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                            <FaClock className="text-blue-500" />
                            <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                            {appointment.type === 'video' ? (
                                <>
                                    <FaVideo className="text-green-500" />
                                    <span>Video Call</span>
                                </>
                            ) : (
                                <>
                                    <FaHospital className="text-purple-500" />
                                    <span>In-Person</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Location for in-person */}
                    {appointment.type === 'in-person' && appointment.location && (
                        <p className="text-sm text-gray-500 mt-2">📍 {appointment.location}</p>
                    )}

                    {/* Cancel Reason */}
                    {appointment.status === 'cancelled' && appointment.cancelReason && (
                        <p className="text-sm text-red-500 mt-2">Reason: {appointment.cancelReason}</p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        {appointment.status === 'upcoming' && (
                            <>
                                {appointment.type === 'video' && (
                                    <a
                                        href={appointment.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        <FaVideo />
                                        Join Call
                                    </a>
                                )}
                                <Link
                                    to={`/appointments/${appointment.id}`}
                                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    View Details
                                </Link>
                                <button
                                    onClick={() => handleCancelClick(appointment)}
                                    className="px-4 py-2 text-red-600 text-sm border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        )}

                        {appointment.status === 'completed' && (
                            <>
                                <Link
                                    to={`/appointments/${appointment.id}`}
                                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    View Details
                                </Link>
                                {appointment.prescription && (
                                    <Link
                                        to="/prescriptions"
                                        className="px-4 py-2 text-purple-600 text-sm border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                                    >
                                        View Prescription
                                    </Link>
                                )}
                                <button
                                    onClick={handleBookAgain}
                                    className="px-4 py-2 text-gray-600 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Book Again
                                </button>
                            </>
                        )}

                        {appointment.status === 'cancelled' && (
                            <button
                                onClick={handleBookAgain}
                                className="px-4 py-2 text-blue-600 text-sm border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                Book Again
                            </button>
                        )}
                    </div>
                </div>

                {/* Fee */}
                <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-500">Fee</p>
                    <p className="font-bold text-gray-800">Rs. {appointment.fee}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Appointments</h1>
                    <p className="text-gray-500 mt-1">Manage your doctor appointments</p>
                </div>
                <Link
                    to="/appointments/book"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <FaCalendarPlus />
                    Book Appointment
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by doctor name or specialty..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="all">All Status</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="all">All Types</option>
                        <option value="video">Video Call</option>
                        <option value="in-person">In-Person</option>
                    </select>
                </div>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length > 0 ? (
                <div className="space-y-8">
                    {/* Upcoming */}
                    {upcomingAppointments.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Upcoming Appointments ({upcomingAppointments.length})
                            </h2>
                            <div className="space-y-4">
                                {upcomingAppointments.map(apt => (
                                    <AppointmentCard key={apt.id} appointment={apt} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past */}
                    {pastAppointments.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Past Appointments ({pastAppointments.length})
                            </h2>
                            <div className="space-y-4">
                                {pastAppointments.map(apt => (
                                    <AppointmentCard key={apt.id} appointment={apt} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCalendarAlt className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments found</h3>
                    <p className="text-gray-500 mb-6">
                        {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : "You haven't booked any appointments yet"}
                    </p>
                    <Link to="/appointments/book" className="btn-primary inline-block px-6 py-3">
                        Book Your First Appointment
                    </Link>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Cancel Appointment</h3>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setSelectedAppointment(null);
                                    setCancelReason('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-800">{selectedAppointment.doctor.name}</p>
                            <p className="text-sm text-gray-500">
                                {selectedAppointment.date} at {selectedAppointment.time}
                            </p>
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
                                <option value="Financial reasons">Financial reasons</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setSelectedAppointment(null);
                                    setCancelReason('');
                                }}
                                disabled={cancelLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Keep Appointment
                            </button>
                            <button
                                onClick={handleCancelConfirm}
                                disabled={cancelLoading || !cancelReason}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Support Modal - Now using reusable component */}
            <ContactSupportModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
            />
        </div>
    );
}
