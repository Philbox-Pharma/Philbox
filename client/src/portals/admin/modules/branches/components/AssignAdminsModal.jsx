// src/portals/admin/modules/branches/components/AssignAdminsModal.jsx
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import { motion } from 'framer-motion';
import { FaTimes, FaUserShield, FaSpinner, FaCheck } from 'react-icons/fa';
import { branchApi, staffApi } from '../../../../../core/api/admin/adminApi';

export default function AssignAdminsModal({
  isOpen,
  onClose,
  branchId,
  branchName,
  currentAdmins = [],
  onSuccess,
}) {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Set current admins on open
  useEffect(() => {
    if (isOpen) {
      setSelectedAdmins(currentAdmins.map(a => a._id));
      fetchAdmins();
    }
  }, [isOpen, currentAdmins]);

  // Fetch all admins
  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await staffApi.getAdmins(1, 100);
      if (response.success || response.data) {
        setAdmins(response.data?.admins || []);
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      // Mock data for now
      setAdmins([
        {
          _id: '1',
          name: 'Admin One',
          email: 'admin1@philbox.com',
          admin_category: 'super_admin',
        },
        {
          _id: '2',
          name: 'Admin Two',
          email: 'admin2@philbox.com',
          admin_category: 'branch_admin',
        },
        {
          _id: '3',
          name: 'Admin Three',
          email: 'admin3@philbox.com',
          admin_category: 'branch_admin',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle admin selection
  const toggleAdmin = adminId => {
    setSelectedAdmins(prev =>
      prev.includes(adminId)
        ? prev.filter(id => id !== adminId)
        : [...prev, adminId]
    );
  };

  // Save assignments
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await branchApi.assignAdmins(branchId, selectedAdmins);
      if (response.success || response.status === 200) {
        onSuccess();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Failed to assign admins:', err);
      setError(err.message || 'Failed to assign admins');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-linear-to-r from-[#1a365d] to-[#2c5282] text-white">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaUserShield />
                    Assign Admins
                  </h3>
                  <p className="text-sm text-white/80">{branchName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 max-h-96 overflow-y-auto">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-[#1a365d]" />
                  </div>
                ) : admins.length > 0 ? (
                  <div className="space-y-2">
                    {admins.map(admin => (
                      <div
                        key={admin._id}
                        onClick={() => toggleAdmin(admin._id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedAdmins.includes(admin._id)
                            ? 'bg-[#1a365d]/10 border-2 border-[#1a365d]'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedAdmins.includes(admin._id)
                              ? 'bg-[#1a365d] text-white'
                              : 'bg-purple-100'
                          }`}
                        >
                          {selectedAdmins.includes(admin._id) ? (
                            <FaCheck />
                          ) : (
                            <FaUserShield className="text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {admin.name || admin.fullName}
                          </p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            admin.admin_category === 'super_admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {admin.admin_category === 'super_admin'
                            ? 'Super Admin'
                            : 'Branch Admin'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No admins available
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#1a365d] text-white rounded-lg font-medium hover:bg-[#2c5282] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Save ({selectedAdmins.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
