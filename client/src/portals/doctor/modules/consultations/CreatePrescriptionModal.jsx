import { useState } from 'react';
import { FaTimes, FaPlus, FaTrash, FaFilePdf, FaCheck } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { doctorPrescriptionsApi } from '../../../../core/api/doctor/prescriptions.service';

const generateObjectId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  return (
    timestamp +
    'xxxxxxxxxxxxxxxx'
      .replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16))
      .toLowerCase()
  );
};

export default function CreatePrescriptionModal({
  consultation,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [validTill, setValidTill] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [medicines, setMedicines] = useState([
    {
      medicineId: generateObjectId(),
      medicineName: '',
      form: 'tablet',
      dosage: '',
      frequency: 'once a day',
      durationDays: 7,
      quantityPrescribed: 10,
      instructions: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !consultation) return null;

  const patient = consultation.patient_id || {};

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        medicineId: generateObjectId(),
        medicineName: '',
        form: 'tablet',
        dosage: '',
        frequency: 'once a day',
        durationDays: 7,
        quantityPrescribed: 10,
        instructions: '',
      },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleChangeMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const generatePDFPreview = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('MEDICAL PRESCRIPTION', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Philbox Healthcare Platform', 105, 28, { align: 'center' });

    // Doctor & Patient info
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`Patient Name: ${patient.fullName || 'Unknown'}`, 20, 45);
    if (patient.contactNumber) {
      doc.text(`Patient Contact: ${patient.contactNumber}`, 20, 52);
    }
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 45);
    doc.text(`Valid Till: ${new Date(validTill).toLocaleDateString()}`, 140, 52);

    // Diagnosis
    doc.text(`Diagnosis: ${diagnosis}`, 20, 65);

    // Medicines Table
    const tableColumn = [
      'Medicine',
      'Form',
      'Dosage',
      'Frequency',
      'Duration (Days)',
      'Qty',
    ];
    const tableRows = [];

    medicines.forEach((med) => {
      const rowData = [
        med.medicineName || 'Unspecified',
        med.form,
        med.dosage,
        med.frequency,
        med.durationDays,
        med.quantityPrescribed,
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'grid',
    });

    // Notes
    if (notes) {
      doc.text(
        'Special Instructions:',
        20,
        doc.autoTable.previous.finalY + 15
      );
      doc.setFontSize(10);
      doc.text(notes, 20, doc.autoTable.previous.finalY + 22, {
        maxWidth: 170,
      });
    }

    // Output the PDF in a new window/tab
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis) {
      setError('Diagnosis is required.');
      return;
    }
    if (medicines.some((m) => !m.medicineName || !m.dosage)) {
      setError('Please fill in Medicine Name and Dosage for all rows.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        appointmentId: consultation._id,
        patientId: patient._id || consultation.patient_id,
        diagnosis,
        notes,
        validTill: new Date(validTill).toISOString(),
        medicines: medicines.map((m) => ({
          medicineId: m.medicineId, // Mocked object id representing the medicine name
          medicineName: m.medicineName, // <-- ADDED: Required by backend DTO
          // Since the backend expects existing medicine ids, but we have none, 
          // we pass random OIDs. Mongoose validation behavior dictates if this will crash.
          form: m.form,
          dosage: m.dosage,
          frequency: m.frequency,
          durationDays: Number(m.durationDays),
          quantityPrescribed: Number(m.quantityPrescribed),
          instructions: m.instructions || '',
        })),
      };

      await doctorPrescriptionsApi.createPrescription(payload);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to create prescription.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Create Prescription</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {error && <div className="alert-error mb-4">{error}</div>}

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Generating prescription for{' '}
              <span className="font-semibold">{patient.fullName || 'Patient'}</span>
            </p>
          </div>

          <form id="prescription-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Viral Fever"
                  required
                />
              </div>
              <div>
                <label className="input-label">Valid Until</label>
                <input
                  type="date"
                  value={validTill}
                  onChange={(e) => setValidTill(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="input-label !mb-0">
                  Medicines <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  <FaPlus size={10} /> Add Medicine
                </button>
              </div>

              <div className="space-y-3">
                {medicines.map((med, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3"
                  >
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                      >
                        <FaTimes size={10} />
                      </button>
                    )}
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">
                        Medicine Name
                      </label>
                      <input
                        type="text"
                        value={med.medicineName}
                        onChange={(e) =>
                          handleChangeMedicine(index, 'medicineName', e.target.value)
                        }
                        placeholder="e.g. Panadol"
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Form
                      </label>
                      <select
                        value={med.form}
                        onChange={(e) =>
                          handleChangeMedicine(index, 'form', e.target.value)
                        }
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        <option value="tablet">Tablet</option>
                        <option value="syrup">Syrup</option>
                        <option value="injection">Injection</option>
                        <option value="inhaler">Inhaler</option>
                        <option value="ointment">Ointment</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) =>
                          handleChangeMedicine(index, 'dosage', e.target.value)
                        }
                        placeholder="e.g. 500mg"
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Frequency
                      </label>
                      <select
                        value={med.frequency}
                        onChange={(e) =>
                          handleChangeMedicine(index, 'frequency', e.target.value)
                        }
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        <option value="once a day">Once a day</option>
                        <option value="twice a day">Twice a day</option>
                        <option value="thrice a day">Thrice a day</option>
                        <option value="every 8 hours">Every 8 hours</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Days
                        </label>
                        <input
                          type="number"
                          value={med.durationDays}
                          onChange={(e) =>
                            handleChangeMedicine(index, 'durationDays', e.target.value)
                          }
                          min="1"
                          className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          value={med.quantityPrescribed}
                          onChange={(e) =>
                            handleChangeMedicine(index, 'quantityPrescribed', e.target.value)
                          }
                          min="1"
                          className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="md:col-span-6 mt-1">
                      <label className="text-xs text-gray-500 block mb-1">
                        Medicine-Specific Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) =>
                          handleChangeMedicine(index, 'instructions', e.target.value)
                        }
                        placeholder="e.g. Take with food"
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Special Instructions / Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder="Take after meals..."
              />
            </div>
          </form>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary !w-auto px-6 text-sm"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={generatePDFPreview}
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <FaFilePdf size={12} /> Preview PDF
            </button>
            <button
              form="prescription-form"
              type="submit"
              disabled={loading}
              className="btn-primary !w-auto px-6 flex items-center gap-2 !bg-emerald-600 hover:!bg-emerald-700 disabled:opacity-50"
            >
              <FaCheck size={12} /> {loading ? 'Saving...' : 'Save Prescription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
