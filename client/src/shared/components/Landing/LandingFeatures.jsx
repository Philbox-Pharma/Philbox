// src/shared/components/Landing/LandingFeatures.jsx
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';

export default function LandingFeatures({
  id = 'features',
  badge = 'Features',
  title = 'Powerful',
  titleHighlight = 'Features',
  description = '',
  features = [],
  theme = {},
  imageSide = 'right',
  imageIcon: ImageIcon,
  floatingStats = [],
  ctaButtons = [],
  bgGradient = '',
}) {
  const primaryColor = theme.primary || '#003399';
  const secondaryColor = theme.secondary || '#4FA64F';

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const ContentSection = () => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={imageSide === 'right' ? fadeInLeft : fadeInRight}
    >
      <span
        className="font-semibold text-sm uppercase tracking-wider"
        style={{ color: primaryColor }}
      >
        {badge}
      </span>
      <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2 mb-6">
        {title} <span style={{ color: primaryColor }}>{titleHighlight}</span>
      </h2>
      <p className="text-gray-600 text-lg mb-8">{description}</p>

      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <motion.li
            key={i}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: imageSide === 'right' ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: secondaryColor }}
            >
              <FaCheck className="text-white text-xs" />
            </div>
            <span className="text-gray-700">{feature}</span>
          </motion.li>
        ))}
      </ul>

      {ctaButtons.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {ctaButtons.map((btn, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={btn.onClick}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${
                btn.primary
                  ? 'text-white shadow-lg hover:shadow-xl'
                  : 'border-2'
              }`}
              style={
                btn.primary
                  ? { backgroundColor: primaryColor }
                  : { borderColor: primaryColor, color: primaryColor }
              }
            >
              {btn.label}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );

  const ImageSection = () => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={imageSide === 'right' ? fadeInRight : fadeInLeft}
      className="relative"
    >
      <div
        className="w-full aspect-square max-w-lg mx-auto rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden"
        style={{
          background:
            theme.gradient ||
            `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        {ImageIcon && (
          <ImageIcon className="text-white/90 text-[120px] md:text-[180px]" />
        )}

        {floatingStats.map((stat, i) => (
          <motion.div
            key={i}
            className={`absolute bg-white rounded-2xl p-4 shadow-lg ${
              i === 0 ? 'top-8 right-8' : 'bottom-8 left-8'
            }`}
            animate={{ y: [0, i === 0 ? -10 : 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          >
            <p
              className="font-bold text-lg"
              style={{ color: i === 0 ? primaryColor : secondaryColor }}
            >
              {stat.value}
            </p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <section
      id={id}
      className={`py-24 overflow-hidden ${bgGradient ? `bg-linear-to-br ${bgGradient}` : 'bg-white'}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {imageSide === 'left' ? (
            <>
              <ImageSection />
              <ContentSection />
            </>
          ) : (
            <>
              <ContentSection />
              <ImageSection />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
