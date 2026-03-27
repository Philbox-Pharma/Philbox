import { Link } from 'react-router-dom';
import {
  FaUserMd,
  FaCalendarCheck,
  FaStethoscope,
  FaClock,
  FaChevronRight,
  FaSignInAlt,
  FaUserPlus,
  FaShieldAlt,
  FaStar,
  FaVideo,
} from 'react-icons/fa';

export default function DoctorLanding() {
  const features = [
    {
      icon: FaCalendarCheck,
      title: 'Manage Appointments',
      desc: 'Review, accept, or reject patient appointment requests seamlessly.',
      color: 'blue',
    },
    {
      icon: FaClock,
      title: 'Slot Management',
      desc: 'Set your availability with flexible single or recurring time slots.',
      color: 'emerald',
    },
    {
      icon: FaStethoscope,
      title: 'Consultation History',
      desc: 'Access detailed records of all your past consultations.',
      color: 'purple',
    },
    {
      icon: FaVideo,
      title: 'Online Consultations',
      desc: 'Conduct video consultations directly from your dashboard.',
      color: 'cyan',
    },
    {
      icon: FaStar,
      title: 'Patient Feedback',
      desc: 'Monitor ratings, reviews, and sentiment analysis from patients.',
      color: 'yellow',
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Private',
      desc: 'Your data is protected with enterprise-grade security.',
      color: 'red',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2b3d] via-[#0f2b3d] to-gray-900 text-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img
            src="/Philbox.PNG"
            alt="Philbox"
            className="h-10 w-auto"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <span className="font-bold text-xl tracking-tight">Philbox Doctor</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/doctor/login"
            className="px-5 py-2.5 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <FaSignInAlt size={13} />
            Login
          </Link>
          <Link
            to="/doctor/register"
            className="px-5 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 hidden sm:flex"
          >
            <FaUserPlus size={13} />
            Register
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-emerald-300 text-sm font-medium mb-6 border border-white/10">
          <FaUserMd size={14} />
          For Healthcare Professionals
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-3xl mx-auto">
          Your Practice,{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
            Simplified
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join the Philbox platform to manage your appointments, consultations, and prescriptions
          — all in one place. Grow your practice and connect with patients effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/doctor/register"
            className="px-8 py-3.5 bg-emerald-500 text-white rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2"
          >
            Get Started <FaChevronRight size={14} />
          </Link>
          <Link
            to="/doctor/login"
            className="px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2"
          >
            <FaSignInAlt size={14} /> Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
          Everything You Need to{' '}
          <span className="text-emerald-400">Practice Efficiently</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const colorMap = {
              blue: 'bg-blue-500/20 text-blue-400',
              emerald: 'bg-emerald-500/20 text-emerald-400',
              purple: 'bg-purple-500/20 text-purple-400',
              cyan: 'bg-cyan-500/20 text-cyan-400',
              yellow: 'bg-yellow-500/20 text-yellow-400',
              red: 'bg-red-500/20 text-red-400',
            };

            return (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[feature.color]} group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-10 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full" />

          <h2 className="text-2xl sm:text-3xl font-bold mb-4 relative z-10">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-emerald-100 mb-8 max-w-lg mx-auto relative z-10">
            Join hundreds of doctors who are already using Philbox to streamline their healthcare
            services.
          </p>
          <Link
            to="/doctor/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-700 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg relative z-10"
          >
            <FaUserPlus size={14} /> Register Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Philbox Pharmaceuticals. All rights reserved.
      </footer>
    </div>
  );
}
