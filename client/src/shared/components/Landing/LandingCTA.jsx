// src/shared/components/Landing/LandingCTA.jsx
import { motion as _motion } from 'framer-motion';

export default function LandingCTA({
  title = 'Ready to Get Started?',
  subtitle = '',
  primaryCTA = {},
  secondaryCTA = {},
  theme = {},
}) {
  const gradient =
    theme.gradient ||
    'linear-gradient(135deg, #003399 0%, #0052cc 50%, #4FA64F 100%)';
  const primaryColor = theme.primary || '#003399';

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: gradient }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          {primaryCTA.label && (
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={primaryCTA.onClick}
              className="px-10 py-4 bg-white rounded-full font-bold text-lg shadow-xl"
              style={{ color: primaryColor }}
            >
              {primaryCTA.label}
            </motion.button>
          )}
          {secondaryCTA.label && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={secondaryCTA.onClick}
              className="px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-[var(--primary)] transition-all"
              style={{ '--primary': primaryColor }}
            >
              {secondaryCTA.label}
            </motion.button>
          )}
        </div>
      </motion.div>
    </section>
  );
}
