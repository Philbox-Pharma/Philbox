// src/shared/components/Landing/LandingHero.jsx
import { motion as _motion } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

export default function LandingHero({
  content = {},
  theme = {},
  floatingIcons = [],
}) {
  const gradient =
    theme.gradient ||
    'linear-gradient(135deg, #003399 0%, #0052cc 50%, #4FA64F 100%)';
  const secondary = theme.secondary || '#4FA64F';

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{ background: gradient }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Floating Icons */}
      {floatingIcons.map((Icon, index) => (
        <motion.div
          key={index}
          className={`absolute text-white/20 text-6xl hidden md:block`}
          style={{
            top: `${25 + index * 20}%`,
            left: index % 2 === 0 ? '10%' : 'auto',
            right: index % 2 === 1 ? '10%' : 'auto',
          }}
          animate={{
            y: [0, index % 2 === 0 ? -20 : 20, 0],
            rotate: [0, index % 2 === 0 ? 10 : -10, 0],
          }}
          transition={{ duration: 5 + index, repeat: Infinity }}
        >
          <Icon />
        </motion.div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {content.badge && (
            <motion.span
              className="inline-block px-6 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-6 backdrop-blur-sm border border-white/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {content.badge}
            </motion.span>
          )}

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {content.title}
            <span className="block" style={{ color: secondary }}>
              {content.titleHighlight}
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {content.description}
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {content.primaryCTA && (
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
                whileTap={{ scale: 0.95 }}
                onClick={content.primaryCTA.onClick}
                className="px-8 py-4 bg-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
                style={{ color: theme.primary }}
              >
                {content.primaryCTA.label}
                {content.primaryCTA.icon && <content.primaryCTA.icon />}
              </motion.button>
            )}
            {content.secondaryCTA && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={content.secondaryCTA.onClick}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-[var(--primary)] transition-all flex items-center gap-2"
                style={{ '--primary': theme.primary }}
              >
                {content.secondaryCTA.icon && <content.secondaryCTA.icon />}
                {content.secondaryCTA.label}
              </motion.button>
            )}
          </motion.div>

          {/* Stats */}
          {content.stats && content.stats.length > 0 && (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {content.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <p className="text-2xl md:text-4xl font-bold text-white">
                    {stat.number}
                  </p>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <a href="#features" className="text-white/80 hover:text-white">
          <FaChevronDown className="text-2xl" />
        </a>
      </motion.div>
    </section>
  );
}
