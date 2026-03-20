import { useState, useEffect } from 'react';
import {
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaPills,
  FaBell,
} from 'react-icons/fa';
import AddEditReminderModal from './AddEditReminderModal';
import refillReminderService from '../../../../core/api/customer/refillReminder.service';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const response = await refillReminderService.getReminders();
      // Adjust based on the actual pagination structure returned by the backend
      const data = response.data?.reminders || response.data || [];
      setReminders(data);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleAdd = async payload => {
    await refillReminderService.createReminder(payload);
    setIsModalOpen(false);
    fetchReminders(); // refetch to get the latest
  };

  const handleEdit = async payload => {
    await refillReminderService.updateReminder(editingReminder._id, payload);
    setIsModalOpen(false);
    setEditingReminder(null);
    fetchReminders();
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await refillReminderService.deleteReminder(id);
        setReminders(reminders.filter(r => r._id !== id));
      } catch (error) {
        console.error('Failed to delete reminder', error);
      }
    }
  };

  const handleMarkComplete = async id => {
    try {
      await refillReminderService.markAsCompleted(id);
      fetchReminders(); // Refetch properly to update state
    } catch (error) {
      console.error('Failed to mark as completed:', error);
    }
  };

  const openEditModal = reminder => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Medicine Reminders
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your medication schedule and notifications
          </p>
        </div>
        <button
          onClick={() => {
            setEditingReminder(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          Add Reminder
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaBell className="text-blue-500 text-xl mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Enable Notifications
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Ensure your selected notification methods (Push/Email/SMS) are
              enabled to receive real-time alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      {reminders.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reminders.map(reminder => (
            <div
              key={reminder._id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden ${!reminder.isActive ? 'opacity-75 bg-gray-50' : ''}`}
            >
              <div className="p-4 border-b flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-full ${!reminder.isActive ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}
                  >
                    <FaPills size={20} />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold text-lg ${!reminder.isActive ? 'line-through text-gray-500' : 'text-gray-800'}`}
                    >
                      {reminder.medicines && reminder.medicines.join(', ')}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${reminder.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {reminder.isActive ? 'active' : 'completed'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FaClock className="text-gray-400" />
                  <span>
                    Time: <strong>{reminder.timeOfDay}</strong> (
                    {reminder.frequency})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FaBell className="text-gray-400" />
                  <span className="capitalize">
                    Notify via: {reminder.notificationMethod}
                  </span>
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-between items-center gap-2">
                <button
                  onClick={() => handleMarkComplete(reminder._id)}
                  disabled={!reminder.isActive}
                  className={`flex-1 flex justify-center items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${!reminder.isActive ? 'bg-green-100 text-green-700 opacity-50 cursor-not-allowed' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaCheckCircle />
                  {!reminder.isActive ? 'Completed' : 'Mark Done'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(reminder)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(reminder._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaClock className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Reminders Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Stay on top of your health by setting up medication reminders.
          </p>
          <button
            onClick={() => {
              setEditingReminder(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            Add Your First Reminder
          </button>
        </div>
      )}

      {isModalOpen && (
        <AddEditReminderModal
          reminder={editingReminder}
          onSave={editingReminder ? handleEdit : handleAdd}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReminder(null);
          }}
        />
      )}
    </div>
  );
}
