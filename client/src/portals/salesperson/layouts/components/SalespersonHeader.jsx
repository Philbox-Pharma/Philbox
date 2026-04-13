import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SalespersonHeader({ toggleSidebar, salesperson }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout('salesperson');
    navigate('/salesperson/login');
  };

  return (
    <header className="h-24 shrink-0 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaBars size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-bold text-gray-800 leading-tight">
              {salesperson?.fullName || 'Salesperson'}
            </p>
            <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">
              Sales Agent
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white ring-1 ring-blue-100">
            {salesperson?.fullName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 border border-red-100 hover:shadow-md font-bold text-xs uppercase tracking-tight"
          >
            <FaSignOutAlt size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
