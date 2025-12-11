import React from 'react';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import FeaturesSection from './components/FeaturesSection';
import SecuritySection from './components/SecuritySection';
import CTASection from './components/CTASection';

const AdminLanding = () => {
  return (
    <div className="font-sans text-[#2D3748] bg-gradient-to-br from-[#F8F9FA] via-white to-[#F0F7F0]">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <SecuritySection />
      <CTASection />
    </div>
  );
};

export default AdminLanding;
