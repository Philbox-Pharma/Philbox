// src/portals/admin/layouts/AdminLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import AdminFooter from './components/AdminFooter';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Mock admin data for now (will get from login later)
    const [admin] = useState({
        _id: '1',
        name: 'Admin User',
        email: 'admin@philbox.com',
        category: 'super-admin',
        role: {
            permissions: [
                'create_branches', 'read_branches', 'update_branches', 'delete_branches',
                'read_users', 'create_users', 'update_users', 'delete_users'
            ]
        }
    });

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

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
                    <Outlet context={{ admin }} />
                </main>

                <AdminFooter />
            </div>
        </div>
    );
}
