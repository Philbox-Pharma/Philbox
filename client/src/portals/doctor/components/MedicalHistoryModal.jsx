import { useState, useEffect } from 'react';
import {
  FaTimes,
  FaCalendarAlt,
  FaNotesMedical,
  FaFilePrescription,
  FaBox,
  FaFilter,
  FaUserInjured,
  FaCheckCircle,
  FaCalendarCheck,
} from 'react-icons/fa';
import { doctorPatientsApi } from '../../../core/api/doctor/patients.service';

export default function MedicalHistoryModal({ patientId, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Tabs
  const [activeTab, setActiveTab] = useState('appointments');

  const fetchHistory = async () => {
    if (!patientId || !isOpen) return;
    try {
      setLoading(true);
      setError('');
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      const response = await doctorPatientsApi.getMedicalHistory(patientId, filters);
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load medical history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, isOpen, startDate, endDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
              <FaUserInjured size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Patient Medical History</h2>
              <p className="text-sm text-blue-100">
                {data?.patient?.fullName || 'Loading...'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-2 overflow-y-auto hidden md:flex">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">History Sections</h3>
            
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'appointments' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaCalendarCheck size={16} /> Appointments
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'prescriptions' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaFilePrescription size={16} /> Prescriptions
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'notes' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaNotesMedical size={16} /> Medical Notes
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'orders' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaBox size={16} /> Pharmacy Orders
            </button>
            
            {data?.summary && (
              <div className="mt-auto pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Summary</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between"><span>Appointments:</span> <span className="font-semibold">{data.summary.total_appointments}</span></div>
                  <div className="flex justify-between"><span>Prescriptions:</span> <span className="font-semibold">{data.summary.total_prescriptions_generated}</span></div>
                  <div className="flex justify-between"><span>Orders:</span> <span className="font-semibold">{data.summary.total_orders}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Filters Bar */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4 bg-white">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <FaFilter className="text-gray-400" /> Filter by Date:
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-sm text-red-500 hover:text-red-700 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Mobile Tabs */}
            <div className="flex md:hidden overflow-x-auto border-b border-gray-100 p-2">
              {['appointments', 'prescriptions', 'notes', 'orders'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-lg ${activeTab === tab ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {loading && <p className="text-center text-gray-500 py-10">Loading record...</p>}
              {error && <div className="alert-error mx-auto max-w-lg mt-4">{error}</div>}
              
              {!loading && !error && data && (
                <div className="space-y-6">
                  {/* Appointments Tab */}
                  {activeTab === 'appointments' && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Past Appointments</h3>
                      {data.history.appointments.length === 0 ? (
                        <p className="text-gray-500 italic">No past appointments found.</p>
                      ) : (
                        <div className="grid gap-4">
                          {data.history.appointments.map(apt => (
                            <div key={apt._id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between hover:shadow-md transition-shadow">
                              <div>
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                  <FaCalendarAlt className="text-blue-500" />
                                  {new Date(apt.created_at).toLocaleDateString()}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">Doctor: Dr. {apt.doctor_id?.fullName || 'Unknown'}</p>
                                <p className="text-sm text-gray-600">Type: {apt.appointment_type}</p>
                              </div>
                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <FaCheckCircle /> {apt.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prescriptions Tab */}
                  {activeTab === 'prescriptions' && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Doctor Prescriptions</h3>
                        {data.history.prescriptions_generated_by_doctor.length === 0 ? (
                          <p className="text-gray-500 italic">No prescriptions issued.</p>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {data.history.prescriptions_generated_by_doctor.map(rx => (
                              <div key={rx._id} className="bg-white border border-emerald-100 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex justify-between items-center">
                                  <span className="text-sm font-semibold text-emerald-800">{new Date(rx.created_at).toLocaleDateString()}</span>
                                  <span className="text-xs text-emerald-600 bg-emerald-200/50 px-2 py-1 rounded-full">{rx.status || 'Active'}</span>
                                </div>
                                <div className="p-4 space-y-2">
                                  {rx.prescription_items_ids?.map((item, id) => (
                                    <div key={id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                                      <span className="font-medium text-gray-800">{item.medicine_id?.name || item.medicineName || 'Medicine'}</span>
                                      <span className="text-gray-500">{item.dosage}</span>
                                    </div>
                                  ))}
                                  {rx.notes && <p className="text-xs text-gray-500 italic mt-2 bg-gray-50 p-2 rounded">Note: {rx.notes}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Uploaded by Patient</h3>
                        {data.history.prescriptions_uploaded_by_patient.length === 0 ? (
                          <p className="text-gray-500 italic">No uploaded prescriptions.</p>
                        ) : (
                          <div className="flex flex-wrap gap-4">
                            {data.history.prescriptions_uploaded_by_patient.map(rx => (
                              <a href={rx.file_url} target="_blank" rel="noreferrer" key={rx._id} className="group relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                                <img src={rx.file_url} alt="Prescription" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1">
                                  <p className="text-[10px] text-white truncate">{new Date(rx.created_at).toLocaleDateString()}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes Tab */}
                  {activeTab === 'notes' && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Medical Notes</h3>
                      {data.history.medical_notes.length === 0 ? (
                        <p className="text-gray-500 italic">No notes available.</p>
                      ) : (
                        <div className="space-y-4">
                          {data.history.medical_notes.map((note, idx) => (
                            <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2 text-xs text-yellow-800 font-semibold">
                                <FaCalendarAlt /> {new Date(note.appointment_date).toLocaleDateString()}
                              </div>
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.notes}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Orders Tab */}
                  {activeTab === 'orders' && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Pharmacy Orders</h3>
                      {data.history.orders.length === 0 ? (
                        <p className="text-gray-500 italic">No pharmacy orders found.</p>
                      ) : (
                        <div className="space-y-4">
                          {data.history.orders.map(order => (
                            <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-4">
                              <div className="flex justify-between border-b border-gray-100 pb-2 mb-2">
                                <span className="text-sm font-semibold text-gray-800">Order #{order.order_number || order._id.slice(-6).toUpperCase()}</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 capitalize">{order.status}</span>
                              </div>
                              <ul className="space-y-1">
                                {order.order_items?.map(item => (
                                  <li key={item._id} className="text-sm text-gray-600 flex justify-between">
                                    <span>{item.medicine_id?.name || 'Item'} x{item.quantity}</span>
                                    <span>Rs. {item.price * item.quantity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
