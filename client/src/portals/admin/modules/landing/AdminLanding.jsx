// src/portals/admin/modules/landing/AdminLanding.jsx
import { useNavigate } from 'react-router-dom';
import {
  FaUserShield,
  FaChartLine,
  FaUsers,
  FaCodeBranch,
  FaBoxes,
  FaShieldAlt,
  FaLock,
  FaDatabase,
  FaUserCog,
  FaChartPie,
  FaTachometerAlt,
  FaArrowRight,
} from 'react-icons/fa';

// Shared Landing Components
import {
  LandingHeader,
  LandingHero,
  LandingServices,
  LandingFeatures,
  LandingTestimonials,
  LandingCTA,
  LandingFooter,
} from '../../../../shared/components/Landing';

export default function AdminLanding() {
  const navigate = useNavigate();

  // Theme Colors (Admin - Dark Navy & Gold)
  const theme = {
    primary: '#1a365d',
    secondary: '#d69e2e',
    gradient: 'linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #2b6cb0 100%)',
    light: '#ebf8ff',
  };

  // Navigation Links
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Capabilities', href: '#capabilities' },
    { name: 'Security', href: '#security' },
    { name: 'Contact', href: '#contact' },
  ];

  // Auth Buttons - Linked to actual routes
  const authButtons = {
    primary: {
      label: 'Admin Login',
      icon: FaLock,
      onClick: () => navigate('/admin/login'),
    },
    secondary: null,
  };

  // Hero Content
  const heroContent = {
    badge: '🛡️ Secure Admin Portal',
    title: 'Complete Control,',
    titleHighlight: 'Maximum Security',
    description:
      'Manage your entire pharmacy network from one powerful dashboard. Monitor branches, staff, inventory, and analytics with enterprise-grade security.',
    primaryCTA: {
      label: 'Access Dashboard',
      icon: FaArrowRight,
      onClick: () => navigate('/admin/login'),
    },
    secondaryCTA: null,
    stats: [
      { number: '50+', label: 'Branches' },
      { number: '500+', label: 'Staff Members' },
      { number: '99.9%', label: 'Uptime' },
      { number: '24/7', label: 'Monitoring' },
    ],
  };

  // Services/Capabilities
  const services = [
    {
      icon: FaTachometerAlt,
      title: 'Real-time Dashboard',
      desc: 'Monitor all operations with live updates and instant alerts',
      color: '#1a365d',
    },
    {
      icon: FaCodeBranch,
      title: 'Branch Management',
      desc: 'Add, edit, and monitor all pharmacy branches from one place',
      color: '#2b6cb0',
    },
    {
      icon: FaUsers,
      title: 'Staff Control',
      desc: 'Manage admins, salespersons, and doctors with role-based access',
      color: '#d69e2e',
    },
    {
      icon: FaBoxes,
      title: 'Inventory Overview',
      desc: 'Track stock levels, expiry dates, and reorder alerts across branches',
      color: '#38a169',
    },
    {
      icon: FaChartPie,
      title: 'Advanced Analytics',
      desc: 'Revenue reports, sales trends, and performance insights',
      color: '#805ad5',
    },
    {
      icon: FaShieldAlt,
      title: 'Security & Audit',
      desc: 'Activity logs, 2FA authentication, and permission management',
      color: '#e53e3e',
    },
  ];

  // Admin Features
  const adminFeatures = [
    'Two-Factor Authentication (2FA)',
    'Role-Based Access Control (RBAC)',
    'Complete Audit Trail & Logs',
    'Multi-Branch Management',
    'Real-time Notifications',
    'Comprehensive Reporting',
  ];

  const securityFeatures = [
    'End-to-end Encryption',
    'Session Management',
    'Activity Monitoring',
    'Password Policies',
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Ahmed Raza',
      role: 'Super Admin, Philbox HQ',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      text: 'Managing 50+ branches was a nightmare before. Now I can monitor everything from one dashboard with complete visibility.',
      rating: 5,
    },
    {
      name: 'Sarah Khan',
      role: 'Branch Manager',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      text: 'The role-based permissions ensure my team only accesses what they need. Security has never been better.',
      rating: 5,
    },
    {
      name: 'Usman Ali',
      role: 'IT Administrator',
      image: 'https://randomuser.me/api/portraits/men/67.jpg',
      text: 'The audit logs and 2FA give us peace of mind. We can track every action and ensure compliance.',
      rating: 5,
    },
  ];

  // Footer Links - All working routes
  const footerLinks = {
    company: [
      { name: 'About Philbox', href: '/' },
      { name: 'Customer Portal', href: '/login' },
      { name: 'Doctor Portal', href: '/doctor/login' },
      { name: 'Salesperson Portal', href: '/salesperson/login' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Contact IT', href: '#contact' },
      { name: 'System Status', href: '#' },
      { name: 'Documentation', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Security Policy', href: '#' },
      { name: 'Compliance', href: '#' },
    ],
  };

  // Contact Info
  const contactInfo = {
    phone: '+92 42 1234567',
    email: 'admin@philbox.com',
    address: 'Philbox HQ, Lahore, Pakistan',
  };

  // Social Links
  const socialLinks = [
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/philbox',
      icon: 'linkedin',
    },
  ];

  return (
    <div className="font-sans text-gray-800 overflow-x-hidden">
      <LandingHeader
        navLinks={navLinks}
        authButtons={authButtons}
        theme={theme}
        logoSrc="/Philbox.PNG"
      />

      <LandingHero
        content={heroContent}
        theme={theme}
        floatingIcons={[FaUserShield, FaChartLine, FaDatabase]}
      />

      <LandingServices
        id="features"
        badge="Admin Capabilities"
        title="Powerful Management Tools"
        subtitle="Everything you need to run your pharmacy network efficiently"
        services={services}
        theme={theme}
      />

      <LandingFeatures
        id="capabilities"
        badge="For Administrators"
        title="Complete"
        titleHighlight="Control Center"
        description="Access powerful tools designed for pharmacy network management with enterprise-grade features."
        features={adminFeatures}
        theme={theme}
        imageSide="right"
        imageIcon={FaUserCog}
        floatingStats={[
          { label: 'Active Users', value: '500+' },
          { label: 'Response Time', value: '<1s' },
        ]}
        ctaButtons={[
          {
            label: 'Login to Dashboard',
            primary: true,
            onClick: () => navigate('/admin/login'),
          },
        ]}
      />

      <LandingFeatures
        id="security"
        badge="Enterprise Security"
        title="Bank-Level"
        titleHighlight="Security"
        description="Your data is protected with industry-leading security measures and compliance standards."
        features={securityFeatures}
        theme={theme}
        imageSide="left"
        imageIcon={FaShieldAlt}
        floatingStats={[
          { label: 'Encryption', value: '256-bit' },
          { label: 'Uptime', value: '99.9%' },
        ]}
        ctaButtons={[]}
        bgGradient="from-gray-50 to-blue-50"
      />

      <LandingTestimonials
        badge="Trusted by Admins"
        title="What Our Team Says"
        subtitle="Hear from the administrators who manage Philbox daily"
        testimonials={testimonials}
        theme={theme}
      />

      <LandingCTA
        title="Ready to Take Control?"
        subtitle="Access your admin dashboard and manage your pharmacy network with confidence."
        primaryCTA={{
          label: 'Login Now',
          onClick: () => navigate('/admin/login'),
        }}
        secondaryCTA={{
          label: 'Forgot Password?',
          onClick: () => navigate('/admin/forgot-password'),
        }}
        theme={theme}
      />

      <LandingFooter
        id="contact"
        logoSrc="/Philbox.PNG"
        description="Enterprise pharmacy management solution for administrators. Secure, reliable, and powerful."
        footerLinks={footerLinks}
        contactInfo={contactInfo}
        socialLinks={socialLinks}
        theme={theme}
        copyrightText="© 2025 Philbox Pharmaceuticals. Admin Portal."
      />
    </div>
  );
}
