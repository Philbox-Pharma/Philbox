import { Outlet } from 'react-router-dom';
import Header from './components/Header'; // Assume these exist or create placeholders
//import Footer from "./components/Footer";

const AdminLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow p-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout;
