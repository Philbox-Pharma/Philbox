// src/portals/admin/layouts/components/AdminFooter.jsx
import { FaHeart } from 'react-icons/fa';

export default function AdminFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-600 text-sm">
                    © {currentYear} <span className="text-[#1a365d] font-semibold">Philbox Pharmaceuticals</span>. All rights reserved.
                </p>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                    Made with <FaHeart className="text-red-500" /> by Philbox Team
                </p>
            </div>
        </footer>
    );
}
