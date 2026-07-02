import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import BentoCard from './BentoCard';

function useCountUp(target, duration = 1200, startWhenVisible) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startWhenVisible) return;

    let start = null;
    let frame;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
      else setCount(target);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, startWhenVisible]);

  return count;
}

export default function StatCard({
  label,
  value,
  format = (v) => String(v),
  span = '1x1',
  variant = 'glass',
  suffix = '',
  prefix = '',
  animateNumber = true,
  className,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.]/g, '')) || 0;
  const animated = useCountUp(numericValue, 1200, animateNumber && isInView);
  const display = animateNumber && typeof value === 'number' ? animated : value;

  return (
    <BentoCard span={span} variant={variant} className={className} noMotion>
      <div ref={ref}>
        <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
        <motion.p
          className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
        >
          {prefix}
          {typeof value === 'number' ? format(display) : display}
          {suffix}
        </motion.p>
      </div>
    </BentoCard>
  );
}
