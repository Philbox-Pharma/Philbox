import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function AddEditReminderModal({ reminder, onSave, onClose }) {
  const [formData, setFormData] = useState({
    medicine: '',
    frequency: 'daily',
    timeOfDay: '',
    notificationMethod: 'push',
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (reminder) {
      setFormData({
        medicine:
          reminder.medicines && reminder.medicines.length > 0
            ? reminder.medicines[0]
            : '',
        frequency: reminder.frequency || 'daily',
        timeOfDay: reminder.timeOfDay || '',
        notificationMethod: reminder.notificationMethod || 'push',
        isActive: reminder.isActive !== undefined ? reminder.isActive : true,
      });
    }
  }, [reminder]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      // In case we handle booleans
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    // Construct payload strictly matching the backend DTO
    const payload = {
      medicines: [formData.medicine], // Backend expects array of strings
      frequency: formData.frequency,
      timeOfDay: formData.timeOfDay,
      notificationMethod: formData.notificationMethod,
    };

    if (reminder) {
      payload.isActive = formData.isActive;
    }

    try {
      await onSave(payload);
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert(error.response?.data?.message || 'Failed to save reminder');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mb-auto mt-10">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {reminder ? 'Edit Reminder' : 'Add New Reminder'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors font-medium border-0"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine Name *
            </label>
            <input
              type="text"
              name="medicine"
              required
              value={formData.medicine}
              onChange={handleChange}
              placeholder="e.g., Amlodipine 5mg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency *
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                name="timeOfDay"
                required
                value={formData.timeOfDay}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Method *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="notificationMethod"
                  value="push"
                  checked={formData.notificationMethod === 'push'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                Push Notification
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="notificationMethod"
                  value="email"
                  checked={formData.notificationMethod === 'email'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                Email
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="notificationMethod"
                  value="sms"
                  checked={formData.notificationMethod === 'sms'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                SMS
              </label>
            </div>
          </div>

          {reminder && (
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium bg-gray-50 p-3 rounded-lg border">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Status Active
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading
                ? 'Saving...'
                : reminder
                  ? 'Save Changes'
                  : 'Add Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
