import { motion, useReducedMotion } from 'framer-motion';

export function FeatureCard({ feature, index = 0 }) {
  const Icon = feature.icon;
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      className="public-feature-card"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.36, delay: Math.min(index % 4, 3) * 0.06 }}
    >
      <span className="public-icon-tile"><Icon size={21} aria-hidden="true" /></span>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </motion.article>
  );
}
