// src/shared/components/Landing/LandingTestimonials.jsx
import { useState, useEffect } from 'react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

export default function LandingTestimonials({
  badge = 'Testimonials',
  title = 'What People Say',
  subtitle = '',
  testimonials = [],
  theme = {},
}) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const primaryColor = theme.primary || '#003399';

  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <span
            className="font-semibold text-sm uppercase tracking-wider"
            style={{ color: theme.secondary || '#4FA64F' }}
          >
            {badge}
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold mt-2 mb-4"
            style={{ color: primaryColor }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100"
            >
              <FaQuoteLeft
                className="text-4xl mb-6"
                style={{ color: `${primaryColor}20` }}
              />
              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed italic">
                "{testimonials[activeTestimonial].text}"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonials[activeTestimonial].image}
                  alt={testimonials[activeTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="text-gray-500">
                    {testimonials[activeTestimonial].role}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[
                      ...Array(testimonials[activeTestimonial].rating || 5),
                    ].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-sm" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className="h-3 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i === activeTestimonial ? primaryColor : '#d1d5db',
                  width: i === activeTestimonial ? '2rem' : '0.75rem',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
