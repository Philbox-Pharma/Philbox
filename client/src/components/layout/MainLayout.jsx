import React from 'react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({
  children,
  showNav = true,
  showAuthButtons = true,
  showFooter = true,
}) => {
  return (
    <div className="font-[Segoe UI] text-[#2D3748] bg-linear-to-br from-[#F8F9FA] via-white to-[#F0F7F0] min-h-screen flex flex-col">
      <Header showNav={showNav} showAuthButtons={showAuthButtons} />

      <main className="grow">{children}</main>

      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
