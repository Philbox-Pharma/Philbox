// src/portals/admin/layouts/AdminLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import AdminFooter from './components/AdminFooter';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);

  // Load admin data from localStorage on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdmin({
          _id: parsedAdmin._id || parsedAdmin.id,
          name: parsedAdmin.name || parsedAdmin.fullName || 'Admin',
          email: parsedAdmin.email,
          category:
            parsedAdmin.category || parsedAdmin.admin_category || 'super-admin',
          profile_img_url:
            parsedAdmin.profile_img_url || parsedAdmin.profileImage || null,
          phone_number: parsedAdmin.phone_number || parsedAdmin.contactNumber,
          isTwoFactorEnabled: parsedAdmin.isTwoFactorEnabled,
          role: parsedAdmin.role || {
            permissions: [
              'create_branches',
              'read_branches',
              'update_branches',
              'delete_branches',
              'read_users',
              'create_users',
              'update_users',
              'delete_users',
            ],
          },
        });
      } catch (e) {
        console.error('Failed to parse admin data:', e);
        setDefaultAdmin();
      }
    } else {
      setDefaultAdmin();
    }
  }, []);

  const setDefaultAdmin = () => {
    setAdmin({
      _id: '1',
      name: 'Admin User',
      email: 'admin@philbox.com',
      category: 'super-admin',
      role: {
        permissions: [
          'create_branches',
          'read_branches',
          'update_branches',
          'delete_branches',
          'read_users',
          'create_users',
          'update_users',
          'delete_users',
        ],
      },
    });
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Update admin data handler (for profile updates)
  const updateAdmin = newAdminData => {
    setAdmin(newAdminData);
    localStorage.setItem('adminData', JSON.stringify(newAdminData));
  };

  if (!admin) return null; // Wait for admin data to load

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        admin={admin}
      />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <AdminHeader
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          admin={admin}
        />

        <main className="flex-1 p-6">
          <Outlet context={{ admin, setAdmin: updateAdmin }} />
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
