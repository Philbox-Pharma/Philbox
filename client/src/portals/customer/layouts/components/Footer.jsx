import { Link } from 'react-router-dom';
import {
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaLinkedin,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt
} from 'react-icons/fa';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-gray-300">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/vite.svg" alt="PhilBox" className="h-8 w-8" />
                            <span className="text-xl font-bold text-white">PhilBox</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Your trusted online pharmacy for medicines, healthcare products, and doctor consultations.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/share/1DeSgct8EE/?mibextid=wwXIfr" className="text-gray-400 hover:text-white transition-colors">
                                <FaFacebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FaTwitter size={20} />
                            </a>
                            <a href="https://www.instagram.com/philboxofficial?igsh=MTFnZ3dyeWJzNDFvYw==" className="text-gray-400 hover:text-white transition-colors">
                                <FaInstagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FaLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/medicines" className="text-sm hover:text-white transition-colors">
                                    Browse Medicines
                                </Link>
                            </li>
                            <li>
                                <Link to="/appointments/book" className="text-sm hover:text-white transition-colors">
                                    Book Appointment
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-sm hover:text-white transition-colors">
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link to="/prescriptions" className="text-sm hover:text-white transition-colors">
                                    My Prescriptions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/help" className="text-sm hover:text-white transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/returns" className="text-sm hover:text-white transition-colors">
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping" className="text-sm hover:text-white transition-colors">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-sm hover:text-white transition-colors">
                                    FAQs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <FaPhone className="text-blue-400" />
                                <span className="text-sm">+92 314 7445269</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaEnvelope className="text-blue-400" />
                                <span className="text-sm">contact@philbox.pk</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <FaMapMarkerAlt className="text-blue-400 mt-1" />
                                <span className="text-sm">Philbox Medical Complec Near Ali Town Orange Line Staion, Lahore, Pakistan</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            © {currentYear} PhilBox. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
