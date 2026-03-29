import { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  FaClock,
  FaPlus,
  FaTrash,
  FaEdit,
  FaTimes,
  FaCalendarAlt,
  FaRedo,
  FaBan,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { doctorSlotsApi } from '../../../../core/api/doctor/slots.service';

// ==========================================
// CONSTANTS
// ==========================================
const SLOT_DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const STATUS_COLORS = {
  available: { bg: '#22c55e', border: '#16a34a', text: 'Available' },
  booked: { bg: '#3b82f6', border: '#2563eb', text: 'Booked' },
  unavailable: { bg: '#9ca3af', border: '#6b7280', text: 'Unavailable' },
};

// ==========================================
// SLOT CREATION MODAL
// ==========================================
function SlotModal({ isOpen, onClose, onSubmit, editingSlot, loading, selectedDate }) {
  const [mode, setMode] = useState('single'); // 'single' | 'recurring'
  const [formData, setFormData] = useState({
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    slot_duration: 30,
    notes: '',
  });
  const [recurringData, setRecurringData] = useState({
    frequency: 'weekly',
    days_of_week: [],
    start_date: '',
    end_date: '',
  });

  // Reset form when modal opens/editing slot changes
  useEffect(() => {
    if (editingSlot) {
      setMode('single');
      setFormData({
        date: editingSlot.dateStr || '',
        start_time: editingSlot.start_time || '09:00',
        end_time: editingSlot.end_time || '17:00',
        slot_duration: editingSlot.slot_duration || 30,
        notes: editingSlot.notes || '',
      });
    } else {
      setFormData({
        date: selectedDate || new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: 30,
        notes: '',
      });
      setRecurringData({
        frequency: 'weekly',
        days_of_week: [],
        start_date: selectedDate || new Date().toISOString().split('T')[0],
        end_date: '',
      });
    }
  }, [editingSlot, selectedDate, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'slot_duration' ? Number(value) : value }));
  };

  const handleRecurringChange = (e) => {
    const { name, value } = e.target;
    setRecurringData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDay = (dayIndex) => {
    setRecurringData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayIndex)
        ? prev.days_of_week.filter(d => d !== dayIndex)
        : [...prev.days_of_week, dayIndex],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'single') {
      onSubmit({ ...formData, mode: 'single', isEdit: !!editingSlot, slotId: editingSlot?._id });
    } else {
      onSubmit({
        start_time: formData.start_time,
        end_time: formData.end_time,
        slot_duration: formData.slot_duration,
        notes: formData.notes,
        mode: 'recurring',
        recurring_pattern: {
          frequency: recurringData.frequency,
          days_of_week: recurringData.days_of_week,
          start_date: recurringData.start_date,
          end_date: recurringData.end_date,
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {editingSlot ? <FaEdit /> : <FaPlus />}
              {editingSlot ? 'Edit Time Slot' : 'Create Time Slot'}
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Mode Toggle (only for create) */}
          {!editingSlot && (
            <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                <FaCalendarAlt className="inline mr-1.5" size={12} />
                Single Slot
              </button>
              <button
                type="button"
                onClick={() => setMode('recurring')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'recurring' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                <FaRedo className="inline mr-1.5" size={12} />
                Recurring
              </button>
            </div>
          )}

          {/* Date (Single Mode Only) */}
          {mode === 'single' && (
            <div className="mb-4">
              <label className="input-label">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="input-label">Start Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">End Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Slot Duration */}
          <div className="mb-4">
            <label className="input-label">Slot Duration <span className="text-red-500">*</span></label>
            <div className="flex gap-3">
              {SLOT_DURATIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, slot_duration: value }))}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.slot_duration === value
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <FaClock className="inline mr-1" size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring Options */}
          {mode === 'recurring' && !editingSlot && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-1.5">
                <FaRedo size={12} /> Recurring Settings
              </h3>

              {/* Frequency */}
              <div className="mb-3">
                <label className="input-label">Frequency</label>
                <select
                  name="frequency"
                  value={recurringData.frequency}
                  onChange={handleRecurringChange}
                  className="input-field"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Days of Week (Weekly only) */}
              {recurringData.frequency === 'weekly' && (
                <div className="mb-3">
                  <label className="input-label">Select Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAY_NAMES.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                          recurringData.days_of_week.includes(index)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={recurringData.start_date}
                    onChange={handleRecurringChange}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={recurringData.end_date}
                    onChange={handleRecurringChange}
                    className="input-field"
                    min={recurringData.start_date || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-5">
            <label className="input-label">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="input-field resize-none"
              placeholder="e.g., Telehealth only, Follow-up patients..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary !w-auto px-6">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : editingSlot ? 'Update Slot' : mode === 'recurring' ? 'Create Recurring Slots' : 'Create Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// SLOT DETAIL POPUP
// ==========================================
function SlotDetailPopup({ slot, position, onClose, onEdit, onDelete, onMarkUnavailable, actionLoading }) {
  if (!slot) return null;

  const statusInfo = STATUS_COLORS[slot.status] || STATUS_COLORS.available;
  const isPast = new Date(slot.date) < new Date(new Date().toDateString());
  const isBooked = slot.status === 'booked';
  const canModify = !isPast && !isBooked;

  return (
    <div
      className="fixed z-40 bg-white rounded-xl shadow-2xl border border-gray-200 w-72 animate-fadeIn"
      style={{ top: position.y, left: position.x }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusInfo.bg }} />
          <span className="text-sm font-semibold text-gray-800">{statusInfo.text}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <FaTimes size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-sm">
          <FaCalendarAlt className="text-gray-400" size={13} />
          <span className="text-gray-700">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FaClock className="text-gray-400" size={13} />
          <span className="text-gray-700 font-medium">{slot.start_time} — {slot.end_time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FaClock className="text-gray-400" size={13} />
          <span className="text-gray-500">Duration: {slot.slot_duration} min</span>
        </div>
        {slot.notes && (
          <p className="text-xs text-gray-500 italic bg-gray-50 rounded-md px-3 py-2">{slot.notes}</p>
        )}
        {isBooked && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md">
            <FaCheckCircle size={11} /> This slot is booked by a patient
          </div>
        )}
        {isPast && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md">
            <FaExclamationTriangle size={11} /> Past slot — cannot be modified
          </div>
        )}
      </div>

      {/* Actions */}
      {canModify && (
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={() => onEdit(slot)}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            <FaEdit size={12} /> Edit
          </button>
          {slot.status === 'available' && (
            <button
              onClick={() => onMarkUnavailable(slot._id)}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-medium hover:bg-yellow-100 transition-colors"
            >
              <FaBan size={12} /> Block
            </button>
          )}
          <button
            onClick={() => onDelete(slot._id)}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
          >
            <FaTrash size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN SLOT MANAGEMENT COMPONENT
// ==========================================
export default function SlotManagement() {
  const calendarRef = useRef(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  // Selected slot popup
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Stats
  const [stats, setStats] = useState({ total: 0, available: 0, booked: 0, unavailable: 0 });

  // ==========================================
  // FETCH SLOTS
  // ==========================================
  const fetchSlots = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true);
      const filters = {};
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;

      const response = await doctorSlotsApi.getSlots(filters);
      const fetchedSlots = response.data?.slots || [];
      setSlots(fetchedSlots);

      // Calculate stats
      const total = fetchedSlots.length;
      const available = fetchedSlots.filter(s => s.status === 'available').length;
      const booked = fetchedSlots.filter(s => s.status === 'booked').length;
      const unavailable = fetchedSlots.filter(s => s.status === 'unavailable').length;
      setStats({ total, available, booked, unavailable });
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load time slots.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch — current month range
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    fetchSlots(startOfMonth, endOfMonth);
  }, [fetchSlots]);

  // ==========================================
  // CONVERT SLOTS TO FULLCALENDAR EVENTS
  // ==========================================
  const calendarEvents = slots.map(slot => {
    const colors = STATUS_COLORS[slot.status] || STATUS_COLORS.available;
    const dateStr = new Date(slot.date).toISOString().split('T')[0];
    return {
      id: slot._id,
      title: `${slot.start_time} - ${slot.end_time}`,
      start: `${dateStr}T${slot.start_time}`,
      end: `${dateStr}T${slot.end_time}`,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: '#fff',
      extendedProps: {
        ...slot,
        dateStr,
      },
    };
  });

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

  // Date click — open create modal for that date
  const handleDateClick = (info) => {
    setSelectedSlot(null);
    setEditingSlot(null);
    setSelectedDate(info.dateStr);
    setIsModalOpen(true);
  };

  // Event click — show slot detail popup
  const handleEventClick = (info) => {
    const rect = info.el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const popupWidth = 288;

    let x = rect.right + 8;
    let y = rect.top;

    // If popup would go off-screen right, show on left
    if (x + popupWidth > viewportWidth) {
      x = rect.left - popupWidth - 8;
    }
    // If still off-screen, center it
    if (x < 0) {
      x = Math.max(8, (viewportWidth - popupWidth) / 2);
    }
    // Ensure Y doesn't go too far down
    if (y + 300 > window.innerHeight) {
      y = window.innerHeight - 320;
    }

    setPopupPosition({ x, y });
    setSelectedSlot(info.event.extendedProps);
  };

  // Close popup when clicking calendar background
  const handleDateSelect = () => {
    setSelectedSlot(null);
  };

  // On calendar date range change — fetch slots for that range
  const handleDatesSet = (dateInfo) => {
    const start = dateInfo.startStr.split('T')[0];
    const end = dateInfo.endStr.split('T')[0];
    fetchSlots(start, end);
  };

  // Create or update slot
  const handleSlotSubmit = async (data) => {
    try {
      setActionLoading(true);

      if (data.isEdit && data.slotId) {
        // Update (Note: date is not allowed in update as per DTO)
        await doctorSlotsApi.updateSlot(data.slotId, {
          start_time: data.start_time,
          end_time: data.end_time,
          slot_duration: data.slot_duration,
          notes: data.notes,
        });
        showMessage('Slot updated successfully!');
      } else if (data.mode === 'recurring') {
        // Create recurring
        const response = await doctorSlotsApi.createRecurringSlots({
          start_time: data.start_time,
          end_time: data.end_time,
          slot_duration: data.slot_duration,
          notes: data.notes,
          recurring_pattern: data.recurring_pattern,
        });
        const count = response.data?.count || 0;
        showMessage(`${count} recurring slots created!`);
      } else {
        // Create single
        await doctorSlotsApi.createSlot({
          date: data.date,
          start_time: data.start_time,
          end_time: data.end_time,
          slot_duration: data.slot_duration,
          notes: data.notes,
        });
        showMessage('Slot created successfully!');
      }

      setIsModalOpen(false);
      setEditingSlot(null);
      setSelectedSlot(null);

      // Refresh calendar
      const calApi = calendarRef.current?.getApi();
      if (calApi) {
        const view = calApi.view;
        fetchSlots(view.activeStart.toISOString().split('T')[0], view.activeEnd.toISOString().split('T')[0]);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save slot.';
      showMessage(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit slot
  const handleEditSlot = (slot) => {
    setSelectedSlot(null);
    setEditingSlot({
      _id: slot._id,
      dateStr: new Date(slot.date).toISOString().split('T')[0],
      start_time: slot.start_time,
      end_time: slot.end_time,
      slot_duration: slot.slot_duration,
      notes: slot.notes,
    });
    setIsModalOpen(true);
  };

  // Mark unavailable
  const handleMarkUnavailable = async (slotId) => {
    try {
      setActionLoading(true);
      await doctorSlotsApi.markSlotUnavailable(slotId);
      showMessage('Slot marked as unavailable.');
      setSelectedSlot(null);

      const calApi = calendarRef.current?.getApi();
      if (calApi) {
        const view = calApi.view;
        fetchSlots(view.activeStart.toISOString().split('T')[0], view.activeEnd.toISOString().split('T')[0]);
      }
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to mark unavailable.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete slot
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;

    try {
      setActionLoading(true);
      await doctorSlotsApi.deleteSlot(slotId);
      showMessage('Slot deleted successfully.');
      setSelectedSlot(null);

      const calApi = calendarRef.current?.getApi();
      if (calApi) {
        const view = calApi.view;
        fetchSlots(view.activeStart.toISOString().split('T')[0], view.activeEnd.toISOString().split('T')[0]);
      }
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to delete slot.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                Availability Management
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your consultation time slots</p>
            </div>
            <button
              onClick={() => {
                setEditingSlot(null);
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setIsModalOpen(true);
              }}
              className="btn-primary !w-auto px-5 flex items-center justify-center gap-2"
            >
              <FaPlus size={14} /> Add Time Slot
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Messages */}
        {error && <div className="alert-error mb-4">{error}</div>}
        {success && <div className="alert-success mb-4">{success}</div>}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FaCalendarAlt className="text-gray-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Slots</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{stats.available}</p>
              <p className="text-xs text-gray-500">Available</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaClock className="text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">{stats.booked}</p>
              <p className="text-xs text-gray-500">Booked</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FaBan className="text-gray-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-600">{stats.unavailable}</p>
              <p className="text-xs text-gray-500">Unavailable</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {Object.entries(STATUS_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: val.bg }} />
              {val.text}
            </div>
          ))}
          <span className="text-xs text-gray-400 ml-auto">Click a date to create • Click a slot to manage</span>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center py-4 bg-blue-50 border-b border-blue-100">
              <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-blue-600">Loading slots...</span>
            </div>
          )}

          <div className="p-4 sm:p-6 slot-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              select={handleDateSelect}
              datesSet={handleDatesSet}
              selectable={true}
              editable={false}
              dayMaxEvents={3}
              moreLinkText={(num) => `+${num} more`}
              height="auto"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }}
              buttonText={{
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day',
              }}
              buttonIcons={{
                prev: 'chevron-left',
                next: 'chevron-right',
              }}
            />
          </div>
        </div>
      </div>

      {/* Slot Detail Popup */}
      {selectedSlot && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setSelectedSlot(null)} />
          <SlotDetailPopup
            slot={selectedSlot}
            position={popupPosition}
            onClose={() => setSelectedSlot(null)}
            onEdit={handleEditSlot}
            onDelete={handleDeleteSlot}
            onMarkUnavailable={handleMarkUnavailable}
            actionLoading={actionLoading}
          />
        </>
      )}

      {/* Create/Edit Modal */}
      <SlotModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingSlot(null); }}
        onSubmit={handleSlotSubmit}
        editingSlot={editingSlot}
        loading={actionLoading}
        selectedDate={selectedDate}
      />
    </div>
  );
}
