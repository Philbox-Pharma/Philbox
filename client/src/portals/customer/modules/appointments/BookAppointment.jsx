import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaUserMd,
  FaStar,
  FaVideo,
  FaHospital,
  FaCalendarAlt,
  FaClock,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaCreditCard,
  FaMoneyBillWave,
  FaMobileAlt,
  FaLock,
  FaDownload,
  FaPrint,
} from 'react-icons/fa';

export default function BookAppointment() {
  const navigate = useNavigate();
  const receiptRef = useRef(null);

  // Steps: 1 = Select Doctor, 2 = Select Date/Time, 3 = Payment, 4 = Confirm
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [consultationType, setConsultationType] = useState('all');

  // Selected values
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState('video');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Booking state
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [paymentTime, setPaymentTime] = useState('');

  // Mock doctors data
  const doctors = [
    {
      id: 1,
      name: 'Dr. Ahmed Khan',
      specialty: 'Cardiologist',
      experience: '15 years',
      rating: 4.8,
      reviews: 256,
      fee: 2000,
      image: 'https://via.placeholder.com/100x100?text=AK',
      availableTypes: ['video', 'in-person'],
      hospital: 'Heart Care Hospital, Lahore',
      about: 'Specialized in heart diseases, ECG, and cardiac care.',
    },
    {
      id: 2,
      name: 'Dr. Sara Ali',
      specialty: 'Dermatologist',
      experience: '10 years',
      rating: 4.9,
      reviews: 189,
      fee: 1500,
      image: 'https://via.placeholder.com/100x100?text=SA',
      availableTypes: ['video', 'in-person'],
      hospital: 'Skin & Beauty Clinic, Lahore',
      about:
        'Expert in skin conditions, acne treatment, and cosmetic dermatology.',
    },
    {
      id: 3,
      name: 'Dr. Usman Malik',
      specialty: 'General Physician',
      experience: '8 years',
      rating: 4.6,
      reviews: 312,
      fee: 1000,
      image: 'https://via.placeholder.com/100x100?text=UM',
      availableTypes: ['video'],
      hospital: 'Philbox Online Clinic',
      about: 'General health consultations, fever, flu, and common illnesses.',
    },
    {
      id: 4,
      name: 'Dr. Fatima Noor',
      specialty: 'Gynecologist',
      experience: '12 years',
      rating: 4.7,
      reviews: 178,
      fee: 2500,
      image: 'https://via.placeholder.com/100x100?text=FN',
      availableTypes: ['video', 'in-person'],
      hospital: 'Women Health Center, Lahore',
      about: 'Women health, pregnancy care, and gynecological issues.',
    },
    {
      id: 5,
      name: 'Dr. Hassan Raza',
      specialty: 'Orthopedic',
      experience: '18 years',
      rating: 4.5,
      reviews: 145,
      fee: 1800,
      image: 'https://via.placeholder.com/100x100?text=HR',
      availableTypes: ['in-person'],
      hospital: 'Bone & Joint Hospital, Lahore',
      about: 'Bone fractures, joint pain, and orthopedic surgeries.',
    },
    {
      id: 6,
      name: 'Dr. Ayesha Tariq',
      specialty: 'Pediatrician',
      experience: '9 years',
      rating: 4.9,
      reviews: 223,
      fee: 1200,
      image: 'https://via.placeholder.com/100x100?text=AT',
      availableTypes: ['video', 'in-person'],
      hospital: 'Children Care Clinic, Lahore',
      about: 'Child health, vaccinations, and pediatric care.',
    },
  ];

  // Specialties for filter
  const specialties = ['all', ...new Set(doctors.map(d => d.specialty))];

  // Mock booked slots (simulating already booked appointments)
  const bookedSlots = {
    [getDateString(1)]: ['09:00 AM', '10:30 AM', '02:00 PM'],
    [getDateString(2)]: ['11:00 AM', '03:30 PM'],
    [getDateString(3)]: ['09:30 AM', '02:30 PM', '04:00 PM', '05:00 PM'],
    [getDateString(4)]: ['10:00 AM'],
    [getDateString(5)]: ['11:30 AM', '03:00 PM', '04:30 PM'],
  };

  // Helper function to get date string
  function getDateString(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  // All time slots
  const allTimeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
  ];

  // Get available slots for selected date
  const getAvailableSlots = date => {
    const booked = bookedSlots[date] || [];
    return allTimeSlots.map(time => ({
      time,
      available: !booked.includes(time),
    }));
  };

  // Generate next 7 days for date selection
  const getNextDays = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const bookedCount = (bookedSlots[dateStr] || []).length;
      const availableCount = allTimeSlots.length - bookedCount;

      days.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        availableSlots: availableCount,
      });
    }
    return days;
  };

  const availableDates = getNextDays();

  // Payment methods
  const paymentMethods = [
    {
      id: 'jazzcash',
      name: 'JazzCash',
      icon: FaMobileAlt,
      color: 'text-red-500',
    },
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      icon: FaMobileAlt,
      color: 'text-green-500',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: FaCreditCard,
      color: 'text-blue-500',
    },
  ];

  // Filter doctors
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      specialtyFilter === 'all' || doc.specialty === specialtyFilter;
    const matchesType =
      consultationType === 'all' ||
      doc.availableTypes.includes(consultationType);
    return matchesSearch && matchesSpecialty && matchesType;
  });

  // Handle booking
  const handleBooking = async () => {
    setLoading(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newBookingId = `APT-${Date.now().toString().slice(-6)}`;
    setBookingId(newBookingId);
    setPaymentTime(
      new Date().toLocaleString('en-PK', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    );
    setBookingComplete(true);
    setLoading(false);
  };

  // Download Receipt as Text/HTML file
  const handleDownloadReceipt = () => {
    const receiptContent = `
╔════════════════════════════════════════════════════════════╗
║                    PHILBOX PHARMACY                        ║
║                  APPOINTMENT RECEIPT                       ║
╚════════════════════════════════════════════════════════════╝

Booking ID: ${bookingId}
Payment Date: ${paymentTime}
Status: CONFIRMED ✓

─────────────────────────────────────────────────────────────
DOCTOR DETAILS
─────────────────────────────────────────────────────────────
Doctor Name: ${selectedDoctor.name}
Specialty: ${selectedDoctor.specialty}
Hospital: ${selectedDoctor.hospital}

─────────────────────────────────────────────────────────────
APPOINTMENT DETAILS
─────────────────────────────────────────────────────────────
Date: ${selectedDate}
Time: ${selectedTime}
Consultation Type: ${selectedType === 'video' ? 'Video Call' : 'In-Person Visit'}
${selectedType === 'in-person' ? `Location: ${selectedDoctor.hospital}` : 'Video link will be sent to your email'}

${notes ? `Patient Notes: ${notes}` : ''}

─────────────────────────────────────────────────────────────
PAYMENT DETAILS
─────────────────────────────────────────────────────────────
Payment Method: ${paymentMethods.find(p => p.id === paymentMethod)?.name}
Consultation Fee: Rs. ${selectedDoctor.fee}
─────────────────────────────────────────────────────────────
TOTAL PAID: Rs. ${selectedDoctor.fee}
─────────────────────────────────────────────────────────────

Thank you for choosing Philbox Pharmacy!
For any queries, contact us at: support@philbox.pk

*** This is a computer-generated receipt ***
        `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Philbox_Receipt_${bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download as PDF-style HTML
  const handleDownloadPDF = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Appointment Receipt - ${bookingId}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px;
            background: #f5f5f5;
        }
        .receipt {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #3b82f6;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 5px 0 0;
        }
        .success-badge {
            background: #22c55e;
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            display: inline-block;
            margin: 15px 0;
            font-weight: bold;
        }
        .booking-id {
            background: #f0f9ff;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin: 15px 0;
        }
        .booking-id span {
            font-size: 18px;
            font-weight: bold;
            color: #3b82f6;
        }
        .section {
            margin: 10px 0;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
        }
        .section h3 {
            margin: 0 0 10px;
            color: #374151;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .row:last-child {
            border-bottom: none;
        }
        .row .label {
            color: #6b7280;
        }
        .row .value {
            font-weight: 600;
            color: #111827;
        }
        .total {
            background: #3b82f6;
            color: white;
            padding: 15px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        .total .amount {
            font-size: 24px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
        }
        .video-notice {
            background: #dbeafe;
            border: 1px solid #93c5fd;
            padding: 12px;
            border-radius: 8px;
            margin: 15px 0;
            color: #1e40af;
            font-size: 14px;
        }
        @media print {
            body { background: white; padding: 0; }
            .receipt { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>Philbox Pharmacy</h1>
            <p>Your Trusted Healthcare Partner</p>
            <div class="success-badge">Payment Successful</div>
        </div>

        <div class="booking-id">
            Booking ID: <span>${bookingId}</span>
        </div>

        <div class="section">
            <h3>Doctor Information</h3>
            <div class="row">
                <span class="label">Doctor Name</span>
                <span class="value">${selectedDoctor.name}</span>
            </div>
            <div class="row">
                <span class="label">Specialty</span>
                <span class="value">${selectedDoctor.specialty}</span>
            </div>
            <div class="row">
                <span class="label">Hospital</span>
                <span class="value">${selectedDoctor.hospital}</span>
            </div>
        </div>

        <div class="section">
            <h3>Appointment Details</h3>
            <div class="row">
                <span class="label">Date</span>
                <span class="value">${selectedDate}</span>
            </div>
            <div class="row">
                <span class="label">Time</span>
                <span class="value">${selectedTime}</span>
            </div>
            <div class="row">
                <span class="label">Consultation Type</span>
                <span class="value">${selectedType === 'video' ? 'Video Call' : 'In-Person'}</span>
            </div>
        </div>

        ${
          selectedType === 'video'
            ? `
        <div class="video-notice">
             Video call link will be sent to your registered email 15 minutes before the appointment.
        </div>
        `
            : ''
        }

        <div class="section">
            <h3>Payment Information</h3>
            <div class="row">
                <span class="label">Payment Method</span>
                <span class="value">${paymentMethods.find(p => p.id === paymentMethod)?.name}</span>
            </div>
            <div class="row">
                <span class="label">Payment Date</span>
                <span class="value">${paymentTime}</span>
            </div>
            <div class="row">
                <span class="label">Status</span>
                <span class="value" style="color: #22c55e;">Paid</span>
            </div>
        </div>

        <div class="total">
            <span>Total Amount Paid</span>
            <span class="amount">Rs. ${selectedDoctor.fee}</span>
        </div>

        <div class="footer">
            <p>Thank you for choosing Philbox Pharmacy!</p>
            <p>For support: contact@philbox.pk | +92 314 7445269</p>
        </div>
    </div>

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
        `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // Render stars
  const renderStars = rating => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
        size={12}
      />
    ));
  };

  // Booking complete screen
  if (bookingComplete) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-500 mb-2">
            Your appointment has been confirmed.
          </p>
          <p className="text-gray-500">
            Booking ID: <strong className="text-blue-600">{bookingId}</strong>
          </p>
        </div>

        {/* Receipt Card */}
        <div
          ref={receiptRef}
          className="bg-white rounded-xl shadow-lg border overflow-hidden mb-6"
        >
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 text-center">
            <h2 className="text-xl font-bold">💊 Philbox Pharmacy</h2>
            <p className="text-blue-100 text-sm">Appointment Receipt</p>
          </div>

          <div className="p-6">
            {/* Doctor Info */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b">
              <img
                src={selectedDoctor.image}
                alt={selectedDoctor.name}
                className="w-16 h-16 rounded-full border-2 border-blue-200"
              />
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedDoctor.name}
                </h3>
                <p className="text-sm text-blue-600">
                  {selectedDoctor.specialty}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedDoctor.hospital}
                </p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-dashed">
                <span className="text-gray-500">Booking ID</span>
                <span className="font-bold text-blue-600">{bookingId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dashed">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dashed">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dashed">
                <span className="text-gray-500">Consultation</span>
                <span className="font-medium capitalize">
                  {selectedType === 'video' ? 'Video Call' : 'In-Person'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-dashed">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium">
                  {paymentMethods.find(p => p.id === paymentMethod)?.name}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-dashed">
                <span className="text-gray-500">Payment Time</span>
                <span className="font-medium">{paymentTime}</span>
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  Total Paid
                </span>
                <span className="text-2xl font-bold text-green-600">
                  Rs. {selectedDoctor.fee}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Call Notice */}
        {selectedType === 'video' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Video Call Link</strong> will be sent to your email and
              will also be available in your appointments section 15 minutes
              before the scheduled time.
            </p>
          </div>
        )}

        {/* Download Buttons */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-3 text-center">
            Download your receipt
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
            >
              <FaDownload />
              Text File
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <FaPrint />
              Print / PDF
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/appointments')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            <FaCalendarAlt />
            View Appointments
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/appointments')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
        >
          <FaArrowLeft />
          Back to Appointments
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Book Appointment
        </h1>
        <p className="text-gray-500 mt-1">
          Find a doctor and schedule your appointment
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[
          { num: 1, label: 'Select Doctor' },
          { num: 2, label: 'Date & Time' },
          { num: 3, label: 'Payment' },
          { num: 4, label: 'Confirm' },
        ].map((s, index) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                step >= s.num
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s.num ? <FaCheckCircle /> : s.num}
            </div>
            <span
              className={`ml-2 text-sm hidden sm:block ${
                step >= s.num ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}
            >
              {s.label}
            </span>
            {index < 3 && (
              <div
                className={`w-8 sm:w-16 h-1 mx-2 ${
                  step > s.num ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by doctor name or specialty..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <select
                value={specialtyFilter}
                onChange={e => setSpecialtyFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Specialties</option>
                {specialties
                  .filter(s => s !== 'all')
                  .map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
              <select
                value={consultationType}
                onChange={e => setConsultationType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Types</option>
                <option value="video">Video Call</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>
          </div>

          {/* Doctors List */}
          {filteredDoctors.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredDoctors.map(doctor => (
                <div
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor)}
                  className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all ${
                    selectedDoctor?.id === doctor.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <div className="flex gap-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {doctor.name}
                          </h3>
                          <p className="text-sm text-blue-600">
                            {doctor.specialty}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doctor.experience} experience
                          </p>
                        </div>
                        {selectedDoctor?.id === doctor.id && (
                          <FaCheckCircle className="text-blue-500 text-xl" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {renderStars(doctor.rating)}
                        <span className="text-sm text-gray-600 ml-1">
                          {doctor.rating}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({doctor.reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {doctor.availableTypes.includes('video') && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <FaVideo /> Video
                          </span>
                        )}
                        {doctor.availableTypes.includes('in-person') && (
                          <span className="inline-flex items-center gap-1 text-xs text-purple-600">
                            <FaHospital /> In-Person
                          </span>
                        )}
                      </div>
                      <div className="mt-3">
                        <span className="text-lg font-bold text-gray-800">
                          Rs. {doctor.fee}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaUserMd className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No doctors found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedDoctor}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div>
          {/* Selected Doctor Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <div className="flex items-center gap-4">
              <img
                src={selectedDoctor.image}
                alt={selectedDoctor.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedDoctor.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedDoctor.specialty}
                </p>
                <p className="text-sm font-medium text-blue-600">
                  Rs. {selectedDoctor.fee}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="ml-auto text-sm text-blue-600 hover:underline"
              >
                Change
              </button>
            </div>
          </div>

          {/* Consultation Type */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Consultation Type
            </h3>
            <div className="flex gap-4">
              {selectedDoctor.availableTypes.includes('video') && (
                <button
                  onClick={() => setSelectedType('video')}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    selectedType === 'video'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaVideo className="text-xl" />
                  <span className="font-medium">Video Call</span>
                </button>
              )}
              {selectedDoctor.availableTypes.includes('in-person') && (
                <button
                  onClick={() => setSelectedType('in-person')}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    selectedType === 'in-person'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaHospital className="text-xl" />
                  <span className="font-medium">In-Person</span>
                </button>
              )}
            </div>
            {selectedType === 'in-person' && (
              <p className="text-sm text-gray-500 mt-3">
                📍 {selectedDoctor.hospital}
              </p>
            )}
          </div>

          {/* Date Selection */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Select Date</h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {availableDates.map(d => (
                <button
                  key={d.date}
                  onClick={() => {
                    setSelectedDate(d.date);
                    setSelectedTime('');
                  }}
                  className={`p-3 rounded-lg text-center transition-all ${
                    selectedDate === d.date
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-xs">{d.day}</p>
                  <p className="text-lg font-bold">{d.dayNum}</p>
                  <p className="text-xs">{d.month}</p>
                  <p
                    className={`text-xs mt-1 ${selectedDate === d.date ? 'text-blue-100' : 'text-green-600'}`}
                  >
                    {d.availableSlots} slots
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Select Time</h3>
              <p className="text-sm text-gray-500 mb-4">
                <span className="inline-block w-3 h-3 bg-gray-200 rounded mr-1"></span>{' '}
                Booked
                <span className="inline-block w-3 h-3 bg-blue-500 rounded ml-4 mr-1"></span>{' '}
                Available
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                {getAvailableSlots(selectedDate).map(({ time, available }) => (
                  <button
                    key={time}
                    onClick={() => available && setSelectedTime(time)}
                    disabled={!available}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      !available
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                        : selectedTime === time
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">
              Notes for Doctor (Optional)
            </h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe your symptoms or reason for visit..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedTime}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto">
          {/* Booking Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Booking Summary
            </h3>
            <div className="flex items-center gap-4 pb-4 border-b">
              <img
                src={selectedDoctor.image}
                alt={selectedDoctor.name}
                className="w-14 h-14 rounded-full"
              />
              <div>
                <h4 className="font-semibold text-gray-800">
                  {selectedDoctor.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {selectedDoctor.specialty}
                </p>
              </div>
            </div>
            <div className="py-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time</span>
                <span className="font-medium">
                  {selectedDate} at {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Type</span>
                <span className="font-medium capitalize">
                  {selectedType === 'video' ? 'Video Call' : 'In-Person'}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-blue-600">
                Rs. {selectedDoctor.fee}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Select Payment Method
            </h3>
            <div className="space-y-3">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ${method.color}`}
                  >
                    <method.icon className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{method.name}</p>
                  </div>
                  {paymentMethod === method.id && (
                    <FaCheckCircle className="text-blue-500 text-xl" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <FaLock className="text-green-500" />
              <p className="text-sm">
                Your payment information is secure and encrypted.
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!paymentMethod}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Review Booking <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-6">
              Confirm Your Booking
            </h3>

            {/* Doctor */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <img
                src={selectedDoctor.image}
                alt={selectedDoctor.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h4 className="font-semibold text-gray-800">
                  {selectedDoctor.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {selectedDoctor.specialty}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium text-gray-800">
                  {selectedDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-medium text-gray-800">
                  {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-medium text-gray-800 capitalize">
                  {selectedType === 'video' ? 'Video Call' : 'In-Person'}
                </span>
              </div>
              {selectedType === 'in-person' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-800 text-right">
                    {selectedDoctor.hospital}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-800">
                  {paymentMethods.find(p => p.id === paymentMethod)?.name}
                </span>
              </div>
              {notes && (
                <div className="pt-2">
                  <span className="text-gray-600 block mb-1">Notes:</span>
                  <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                    {notes}
                  </p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  Total to Pay
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  Rs. {selectedDoctor.fee}
                </span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-700">
              ⚠️ By confirming, you agree to our cancellation policy.
              Cancellations made less than 2 hours before the appointment are
              non-refundable.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft /> Back
            </button>
            <button
              onClick={handleBooking}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors"
            >
              {loading ? (
                <>Processing Payment...</>
              ) : (
                <>Pay Rs. {selectedDoctor.fee} & Confirm</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
