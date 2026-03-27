import { useState, useEffect, useCallback } from 'react';
import {
  FaPrescriptionBottleAlt,
  FaSearch,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaFilePdf,
  FaPills,
  FaStickyNote,
  FaCheckCircle,
} from 'react-icons/fa';
import { doctorPrescriptionsApi } from '../../../../core/api/doctor/prescriptions.service';
import { doctorConsultationsApi } from '../../../../core/api/doctor/consultations.service';

// ==========================================
// PRESCRIPTION CARD
// ==========================================
function PrescriptionCard({ prescription, onView }) {
  const patient = prescription.patient_id || prescription.patient || {};
  const date = new Date(prescription.created_at || prescription.createdAt || Date.now());

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={() => onView(prescription)}
    >
      <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {(patient.fullName || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                {patient.fullName || 'Patient'}
              </h3>
              <p className="text-xs text-gray-500">{patient.email || '—'}</p>
            </div>
          </div>
          <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
            <FaCheckCircle size={10} /> Issued
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt size={11} className="text-gray-400" />
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <FaClock size={11} className="text-gray-400" />
            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Medicine Count */}
        <div className="flex items-center gap-2 mb-3">
          <FaPills className="text-emerald-500" size={13} />
          <span className="text-sm text-gray-700">
            {prescription.medicines?.length || 0} medicine{(prescription.medicines?.length || 0) !== 1 ? 's' : ''} prescribed
          </span>
        </div>

        {/* Diagnosis */}
        {prescription.diagnosis && (
          <div className="bg-emerald-50 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-emerald-700 line-clamp-2">{prescription.diagnosis}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
            <FaEye size={10} /> View Prescription
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// DETAIL MODAL
// ==========================================
function PrescriptionDetailModal({ prescription, isOpen, onClose }) {
  if (!isOpen || !prescription) return null;

  const patient = prescription.patient_id || prescription.patient || {};
  const date = new Date(prescription.created_at || prescription.createdAt || Date.now());

  const handleDownloadPDF = async () => {
    try {
      const response = await doctorPrescriptionsApi.getPrescriptionPDF(prescription._id);
      if (response?.data?.url) {
        window.open(response.data.url, '_blank');
      }
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('PDF generation is not available.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaPrescriptionBottleAlt /> Prescription Details
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Patient */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              {(patient.fullName || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{patient.fullName || 'Patient'}</h3>
              <p className="text-sm text-gray-500">{patient.email || '—'}</p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-800">
                  {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium text-gray-800">
                  {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">Diagnosis</h4>
              <p className="text-sm text-blue-800 leading-relaxed">{prescription.diagnosis}</p>
            </div>
          )}

          {/* Medicines */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <FaPills size={13} className="text-emerald-500" /> Prescribed Medicines
            </h4>
            <div className="space-y-2">
              {prescription.medicines?.map((med, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{med.name || med.medicine_name}</p>
                    <p className="text-xs text-gray-500">
                      {med.dosage} — {med.frequency} — {med.duration}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{med.route || ''}</span>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No medicines listed</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-1.5">
                <FaStickyNote size={13} /> Additional Notes
              </h4>
              <p className="text-sm text-yellow-800 leading-relaxed">{prescription.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex-shrink-0 flex items-center justify-between">
          <button onClick={onClose} className="btn-secondary !w-auto px-6 text-sm">
            Close
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <FaFilePdf size={12} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function PrescriptionsList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // We'll get prescriptions from consultations since there's no direct "list all" endpoint
  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch consultations that have prescriptions
      const response = await doctorConsultationsApi.getConsultations({
        page: 1,
        limit: 50,
        status: 'completed',
      });
      const data = response.data || {};
      const consultations = data.consultations || data.appointments || [];

      // Extract prescriptions from completed consultations
      const prescriptionsData = consultations
        .filter((c) => c.prescription_generated || c.prescription_id)
        .map((c) => ({
          _id: c.prescription_id?._id || c._id,
          patient_id: c.patient_id,
          medicines: c.prescription_id?.medicines || c.prescription_generated?.medicines || [],
          diagnosis: c.prescription_id?.diagnosis || c.prescription_generated?.diagnosis || '',
          notes: c.prescription_id?.notes || c.prescription_generated?.notes || '',
          created_at: c.prescription_id?.created_at || c.created_at,
        }));

      setPrescriptions(prescriptionsData);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
      setError(err.response?.data?.message || 'Failed to load prescriptions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaPrescriptionBottleAlt className="text-emerald-500" />
          Prescriptions
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          View and manage prescriptions you have issued
        </p>
      </div>

      {/* Error */}
      {error && <div className="alert-warning">{error}</div>}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            className="animate-spin h-10 w-10 text-emerald-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500">Loading prescriptions...</p>
        </div>
      )}

      {/* Grid */}
      {!loading && prescriptions.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{prescriptions.length}</span> prescription{prescriptions.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prescriptions.map((p) => (
              <PrescriptionCard
                key={p._id}
                prescription={p}
                onView={setSelectedPrescription}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty */}
      {!loading && !error && prescriptions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <FaPrescriptionBottleAlt className="text-3xl text-emerald-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Prescriptions</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Prescriptions you issue during consultations will appear here.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <PrescriptionDetailModal
        prescription={selectedPrescription}
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />
    </div>
  );
}
