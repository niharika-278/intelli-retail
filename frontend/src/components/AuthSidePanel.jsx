import { motion } from 'framer-motion';
import BentoGrid from './BentoGrid';
import BentoCard from './BentoCard';
import { staggerContainer, staggerItem } from './bentoVariants';

export default function AuthSidePanel() {
  return (
    <div className="hidden lg:flex flex-col justify-center p-bento-lg max-w-xl mx-auto w-full">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="w-full"
      >
        <BentoGrid className="!grid-cols-2">
          <motion.div variants={staggerItem} className="col-span-2">
            <BentoCard span="2x1" variant="ink" emphasis className="!col-span-full" noMotion>
              <span className="text-xs font-medium uppercase tracking-widest text-neon">IntelliRetail</span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight">
                Retail intelligence,
                <br />
                designed for clarity.
              </h2>
            </BentoCard>
          </motion.div>
          <motion.div variants={staggerItem}>
            <BentoCard span="1x1" variant="coral" noMotion>
              <p className="font-display text-3xl font-bold">AI</p>
              <p className="text-sm opacity-70 mt-1">Smart analytics</p>
            </BentoCard>
          </motion.div>
          <motion.div variants={staggerItem}>
            <BentoCard span="1x1" variant="neon" noMotion>
              <p className="font-display text-3xl font-bold">+47%</p>
              <p className="text-sm opacity-70 mt-1">Faster ops</p>
            </BentoCard>
          </motion.div>
        </BentoGrid>
      </motion.div>
    </div>
  );
}
