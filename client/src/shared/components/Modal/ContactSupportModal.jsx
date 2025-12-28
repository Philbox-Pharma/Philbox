import { FaTimes } from 'react-icons/fa';

export default function ContactSupportModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Contact Support</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Contact Options */}
                <div className="space-y-4">
                    {/* Phone */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-800">📞 Phone Support</p>
                        <a
                            href="tel:+923147445269"
                            className="text-blue-600 text-lg font-bold mt-1 hover:underline block"
                        >
                            +92 314 7445269
                        </a>
                        <p className="text-sm text-blue-600 mt-1">Mon - Sat, 9:00 AM - 6:00 PM</p>
                    </div>

                    {/* WhatsApp */}
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="font-medium text-green-800">💬 WhatsApp</p>
                        <a
                            href="https://wa.me/923147445269"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 text-lg font-bold mt-1 hover:underline block"
                        >
                            +92 314 7445269
                        </a>
                        <p className="text-sm text-green-600 mt-1">24/7 Available</p>
                    </div>

                    {/* Email */}
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="font-medium text-purple-800">📧 Email</p>
                        <a
                            href="mailto:contact@philbox.pk"
                            className="text-purple-600 text-lg font-bold mt-1 hover:underline block"
                        >
                            contact@philbox.pk
                        </a>
                        <p className="text-sm text-purple-600 mt-1">Response within 24 hours</p>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
