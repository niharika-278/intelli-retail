import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import { SPAN, VARIANTS } from './bentoVariants';

function BlobDecoration() {
  return (
    <>
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full border border-black/10" />

      <div className="absolute bottom-8 left-8 h-20 w-20 rounded-full border border-black/10" />
    </>
  );
}

export default function BentoCard({
  span = '1x1',
  variant = 'glass',
  emphasis = false,
  href,
  className,
  children,
  motionProps = {},
  noMotion = false,
}) {
  const classes = cn(
    'relative overflow-hidden rounded-2xl',
    'border border-black/[0.6]',
    'shadow-bento transition-shadow duration-200',
    'group',
    SPAN[span],
    VARIANTS[variant],
    emphasis ? 'p-8 md:p-10' : 'p-6',
    className
  );

  const content = (
    <>
      <BlobDecoration variant={variant} />
      <div className="relative z-10 h-full">{children}</div>
    </>
  );

  if (noMotion) {
    if (href) {
      return (
        <Link to={href} className={cn(classes, 'block hover:shadow-bento-hover hover:-translate-y-0.5 transition-all duration-200')}>
          {content}
        </Link>
      );
    }
    return <article className={classes}>{content}</article>;
  }

  const defaultMotion = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    whileHover: { y: -4, transition: { duration: 0.2 } },
    ...motionProps,
  };

  if (href) {
    return (
      <motion.div {...defaultMotion} className={SPAN[span]}>
        <Link
          to={href}
          className={cn(
            classes,
            'block h-full hover:shadow-bento-hover transition-shadow duration-200'
          )}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.article {...defaultMotion} className={classes}>
      {content}
    </motion.article>
  );
}
