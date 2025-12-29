/* eslint-disable no-unused-vars */
// src/shared/components/Modal/ConfirmModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaExclamationTriangle,
  FaCheck,
  FaTrash,
} from 'react-icons/fa';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning, danger, success
  loading = false,
}) {
  const typeStyles = {
    warning: {
      icon: FaExclamationTriangle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    danger: {
      icon: FaTrash,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    success: {
      icon: FaCheck,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonBg: 'bg-green-600 hover:bg-green-700',
    },
  };

  const style = typeStyles[type] || typeStyles.warning;
  const Icon = style.icon;

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
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 text-center">
                <div
                  className={`w-16 h-16 ${style.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className={`text-2xl ${style.iconColor}`} />
                </div>
                <p className="text-gray-600">{message}</p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 ${style.buttonBg}`}
                >
                  {loading ? 'Processing...' : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
