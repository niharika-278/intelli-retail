export const SPAN = {
  '1x1': 'col-span-1 row-span-1',
  '2x1': 'col-span-1 md:col-span-2 row-span-1',
  '1x2': 'col-span-1 row-span-1 md:row-span-2',
  '2x2': 'col-span-1 md:col-span-2 row-span-1 md:row-span-2',
  '3x1': 'col-span-1 md:col-span-3 row-span-1',   
  '3x2': 'col-span-1 md:col-span-3 row-span-1 md:row-span-2',
  full: 'col-span-1 md:col-span-4 lg:col-span-6 row-span-1',
};

export const VARIANTS = {
  coral: 'bg-coral text-ink',
  neon: 'bg-neon text-ink',
  violet: 'bg-violet text-white',
  sun: 'bg-sun text-ink',
  ink: 'bg-ink text-white',
  teal: 'bg-teal text-white',   
  pink: 'bg-pink text-ink',
  lightpink: 'bg-[#FFE8F2] text-ink', 
  cyan: 'bg-[#EEFDF4] text-ink',   
  sky: 'bg-sky text-white', 
  glass: 'bg-white/80 backdrop-blur-sm text-ink border-black/[0.6]',
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};
