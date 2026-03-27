import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import SalespersonSidebar from './components/SalespersonSidebar';
import SalespersonHeader from './components/SalespersonHeader';

export default function SalespersonLayout() {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading) {
    return (
      <div className="flex bg-[#f3f4f6] items-center justify-center min-h-screen">
        <svg
          className="animate-spin h-10 w-10 text-blue-600 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  // TEMPORARY BYPASS FOR TESTING - COMMENT OUT FOR PRODUCTION
  /*
  if (!user || role !== 'salesperson') {
    return <Navigate to="/salesperson/login" replace />;
  }
  */

  // Mock user for testing if not logged in
  const displayUser = user || {
    fullName: 'Test Salesperson',
    email: 'test@philbox.com',
    role: 'salesperson',
    status: 'active',
    branch: 'Main Branch'
  };

  return (
    <div className="flex min-h-[100dvh] bg-gray-50 flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <SalespersonSidebar
        isOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        salesperson={displayUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-[100dvh] h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar bg-gray-50">
        <SalespersonHeader
          toggleSidebar={toggleSidebar}
          salesperson={displayUser}
        />

        <main className="flex-1 w-full relative pt-2 sm:pt-4 pb-12 sm:pb-24 lg:pb-12 bg-gray-50/50">
          {/* Dashboard Container */}
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
