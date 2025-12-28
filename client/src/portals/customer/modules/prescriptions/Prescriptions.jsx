import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaFilePrescription,
    FaSearch,
    FaFilter,
    FaDownload,
    FaEye,
    FaUserMd,
    FaCalendarAlt,
    FaPills,
    FaCheckCircle,
    FaClock,
    FaShoppingCart
} from 'react-icons/fa';

export default function Prescriptions() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    // Mock prescriptions data
    const prescriptions = [
        // Digital prescriptions from doctors
        {
            id: 'PRX-001',
            type: 'digital',
            doctor: {
                name: 'Dr. Ahmed Khan',
                specialty: 'Cardiologist',
                image: 'https://via.placeholder.com/50x50?text=AK',
            },
            appointmentId: 'APT-003',
            date: '2024-01-20',
            diagnosis: 'Hypertension (High Blood Pressure)',
            medicines: [
                { name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' },
                { name: 'Aspirin 75mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' },
            ],
            notes: 'Reduce salt intake. Follow up after 1 month.',
            status: 'active',
        },
        {
            id: 'PRX-002',
            type: 'digital',
            doctor: {
                name: 'Dr. Fatima Noor',
                specialty: 'Gynecologist',
                image: 'https://via.placeholder.com/50x50?text=FN',
            },
            appointmentId: 'APT-004',
            date: '2024-01-15',
            diagnosis: 'Iron Deficiency Anemia',
            medicines: [
                { name: 'Ferrous Sulfate 200mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '60 days' },
                { name: 'Vitamin C 500mg', dosage: '1 tablet', frequency: 'Once daily', duration: '60 days' },
            ],
            notes: 'Take iron tablets with orange juice for better absorption.',
            status: 'active',
        },
        {
            id: 'PRX-003',
            type: 'digital',
            doctor: {
                name: 'Dr. Usman Malik',
                specialty: 'General Physician',
                image: 'https://via.placeholder.com/50x50?text=UM',
            },
            appointmentId: 'APT-006',
            date: '2024-01-05',
            diagnosis: 'Viral Fever',
            medicines: [
                { name: 'Paracetamol 500mg', dosage: '1-2 tablets', frequency: 'Every 6 hours', duration: '5 days' },
                { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once daily', duration: '5 days' },
            ],
            notes: 'Rest and drink plenty of fluids.',
            status: 'expired',
        },
        // Uploaded prescriptions - only those linked to orders
        {
            id: 'PRX-004',
            type: 'uploaded',
            uploadedBy: 'You',
            date: '2024-01-18',
            fileName: 'prescription_dr_ali.jpg',
            fileSize: '1.2 MB',
            status: 'verified',
            usedForOrder: 'ORD-2024-002',
        },
        {
            id: 'PRX-005',
            type: 'uploaded',
            uploadedBy: 'You',
            date: '2024-01-22',
            fileName: 'prescription_scan.pdf',
            fileSize: '2.5 MB',
            status: 'pending',
            usedForOrder: 'ORD-2024-005',
        },
    ];

    // Filter prescriptions
    const filteredPrescriptions = prescriptions.filter(prx => {
        const matchesSearch =
            prx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (prx.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (prx.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = typeFilter === 'all' || prx.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // Separate by type
    const digitalPrescriptions = filteredPrescriptions.filter(p => p.type === 'digital');
    const uploadedPrescriptions = filteredPrescriptions.filter(p => p.type === 'uploaded');

    // Download prescription
    const handleDownload = (prescription) => {
        alert(`Downloading prescription ${prescription.id}...`);
    };

    // Status badge
    const StatusBadge = ({ status }) => {
        const config = {
            active: { label: 'Active', color: 'bg-green-100 text-green-700' },
            expired: { label: 'Expired', color: 'bg-gray-100 text-gray-600' },
            verified: { label: 'Verified', color: 'bg-blue-100 text-blue-700' },
            pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700' },
        };
        const { label, color } = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {status === 'active' || status === 'verified' ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
                {label}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Prescriptions</h1>
                <p className="text-gray-500 mt-1">
                    View prescriptions from your doctor appointments
                </p>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <FaFilePrescription className="text-blue-500 text-xl mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-800 font-medium">
                            Need prescription medicines?
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                            You can use any of your digital prescriptions to order medicines, or upload a new prescription during checkout.
                        </p>
                        <Link
                            to="/medicines"
                            className="inline-flex items-center gap-2 text-sm text-blue-700 font-medium mt-2 hover:underline"
                        >
                            <FaShoppingCart size={14} />
                            Browse Medicines
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by ID, doctor, or diagnosis..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-400" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="all">All Types</option>
                            <option value="digital">Digital (From Doctor)</option>
                            <option value="uploaded">Uploaded (With Orders)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Prescriptions */}
            {filteredPrescriptions.length > 0 ? (
                <div className="space-y-8">
                    {/* Digital Prescriptions */}
                    {digitalPrescriptions.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaUserMd className="text-blue-500" />
                                From Doctors ({digitalPrescriptions.length})
                            </h2>
                            <div className="space-y-4">
                                {digitalPrescriptions.map((prx) => (
                                    <div key={prx.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                        {/* Header */}
                                        <div className="p-4 bg-gray-50 border-b flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={prx.doctor.image}
                                                    alt={prx.doctor.name}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{prx.doctor.name}</p>
                                                    <p className="text-sm text-gray-500">{prx.doctor.specialty}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <StatusBadge status={prx.status} />
                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                                    <FaCalendarAlt />
                                                    {prx.date}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-4">
                                            {/* Diagnosis */}
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500">Diagnosis</p>
                                                <p className="font-medium text-gray-800">{prx.diagnosis}</p>
                                            </div>

                                            {/* Medicines */}
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 mb-2">Prescribed Medicines</p>
                                                <div className="space-y-2">
                                                    {prx.medicines.map((med, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                                                        >
                                                            <FaPills className="text-blue-500" />
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-800">{med.name}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {med.dosage} • {med.frequency} • {med.duration}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {prx.notes && (
                                                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                                                    <p className="text-sm text-yellow-700">
                                                        <strong>Doctor's Notes:</strong> {prx.notes}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-3 pt-4 border-t">
                                                <button
                                                    onClick={() => handleDownload(prx)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    <FaDownload />
                                                    Download PDF
                                                </button>
                                                <Link
                                                    to={`/medicines?prescription=${prx.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 text-sm rounded-lg hover:bg-blue-50 transition-colors"
                                                >
                                                    <FaPills />
                                                    Order Medicines
                                                </Link>
                                                <Link
                                                    to={`/appointments/${prx.appointmentId}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 text-sm hover:underline"
                                                >
                                                    <FaEye />
                                                    View Appointment
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Uploaded Prescriptions (Order-linked only) */}
                    {uploadedPrescriptions.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaFilePrescription className="text-green-500" />
                                Uploaded with Orders ({uploadedPrescriptions.length})
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {uploadedPrescriptions.map((prx) => (
                                    <div key={prx.id} className="bg-white rounded-xl shadow-sm border p-4">
                                        {/* File Icon */}
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                            <FaFilePrescription className="text-3xl text-gray-400" />
                                        </div>

                                        {/* File Info */}
                                        <div className="mb-3">
                                            <p className="font-medium text-gray-800 truncate">{prx.fileName}</p>
                                            <p className="text-sm text-gray-500">{prx.fileSize}</p>
                                        </div>

                                        {/* Date & Status */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm text-gray-500">{prx.date}</span>
                                            <StatusBadge status={prx.status} />
                                        </div>

                                        {/* Used For Order */}
                                        {prx.usedForOrder && (
                                            <div className="mb-4 p-2 bg-green-50 rounded-lg">
                                                <p className="text-sm text-green-700">
                                                    Order: <Link to={`/orders/${prx.usedForOrder}`} className="font-medium hover:underline">{prx.usedForOrder}</Link>
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                                                <FaEye />
                                                View
                                            </button>
                                            <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                                                <FaDownload />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaFilePrescription className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No prescriptions found</h3>
                    <p className="text-gray-500 mb-6">
                        {searchQuery || typeFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : "You don't have any prescriptions yet. Book an appointment to get a digital prescription."}
                    </p>
                    <Link to="/appointments/book" className="btn-primary inline-block px-6 py-3">
                        Book Appointment
                    </Link>
                </div>
            )}
        </div>
    );
}
