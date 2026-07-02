import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BentoGrid from '../components/BentoGrid';
import BentoCard from '../components/BentoCard';
import Logo from '../components/Logo';
import StatCard from '../components/StatCard';
import { staggerContainer, staggerItem } from '../components/bentoVariants';

const FEATURES = [
  {
    span: '2x2',
    variant: 'pink',
    title: 'AI Analytics',
    desc: 'See what sold before it did.',
    chip: 'Live insights',
  },
  {
    span: '1x1',
    variant: 'sky',
    title: 'Prediction',
    desc: 'Forecast demand.',
    chip: 'ML powered',
  },
  {
    span: '2x1',
    variant: 'sun',
    title: 'Retail Insights',
    desc: 'Shelf to checkout, unified.',
    chip: '360° view',
  },
  {
    span: '2x1',
    variant: 'teal',
    title: 'Automation',
    desc: 'Less ops. More margin.',
    chip: 'Smart flows',
  },
  {
    span: '2x1',
    variant: 'coral',
    title: 'Data Intelligence',
    desc: 'Your data, one brain.',
    chip: 'Unified',
  },
];

const STEPS = [
  { num: '01', title: 'Connect', desc: 'Ingest customers, inventory & sales via CSV.' },
  { num: '02', title: 'Analyze', desc: 'AI models surface trends and anomalies.' },
  { num: '03', title: 'Act', desc: 'Checkout, restock, and respond in real time.' },
  { num: '04', title: 'Grow', desc: 'Track impact with live retail metrics.' },
];

function ScrollSection({ id, children, className = '' }) {
  return (
    <section id={id} className={`py-12 md:py-20 ${className}`}>
      {children}
    </section>
  );
}

function FeatureIcon({ variant }) {
  const colors = {
    violet: 'bg-white/20',
    neon: 'bg-black/10',
    coral: 'bg-teal/10',
    sun: 'bg-black/10',
    ink: 'bg-white/15',
  };
  return (
    <div
      className={`mt-6 h-16 w-16 rounded-md ${colors[variant] || 'bg-black/10'} flex items-center justify-center`}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19V5M4 19h16M8 17V9M12 17V7M16 17v-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen gradient-mesh">
      <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/55
backdrop-blur-xl
border border-white/40 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-ink/70 hover:text-ink transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/register"
                className="text-sm font-medium bg-ink text-white px-5 py-2.5 rounded-full hover:bg-ink/90 transition-colors"
              >
                Get started
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Section 1 — Hero */}
        <ScrollSection id="hero" className="pt-8 md:pt-12">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <BentoGrid>
              <motion.div variants={staggerItem} className="col-span-1 md:col-span-2 lg:col-span-3 row-span-1 md:row-span-2">
                <BentoCard span="2x2" variant="sky" emphasis className="!col-span-full h-full min-h-[320px] md:min-h-[420px]" noMotion>
                  <span className="inline-block text-xs font-medium uppercase tracking-widest text-sun mb-4">
                    Retail intelligence
                  </span>
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
                    Intelli
                    <br />
                    Retail
                  </h1>
                  <p className="mt-6 text-lg md:text-xl opacity-70 max-w-md">
                    AI-powered analytics for modern retail. Predict demand, automate ops, grow smarter.
                  </p>
                  <motion.div className="mt-8" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 bg-ink text-canvas font-semibold px-6 py-3 rounded-full hover:bg-sun hover:text-ink transition-colors"
                    >
                      Start free
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </motion.div>
                </BentoCard>
              </motion.div>

              <motion.div variants={staggerItem}>
                <BentoCard span="1x1" variant="pink" noMotion>
                  <span className="text-xs font-medium uppercase tracking-wider opacity-70">AI Summary</span>
                  <p className="mt-3 font-display text-2xl font-bold leading-tight">
                    Smart insights, instantly
                  </p>
                  <span className="inline-block mt-4 text-xs font-medium bg-ink/10 px-3 py-1 rounded-full">
                    Real-time
                  </span>
                </BentoCard>
              </motion.div>

              <motion.div variants={staggerItem}>
                <BentoCard span="1x1" variant="coral" noMotion>
                  <span className="text-xs font-medium uppercase tracking-wider opacity-70">Impact</span>
                  <p className="mt-3 font-display text-4xl font-bold">+47%</p>
                  <p className="text-sm opacity-70 mt-1">Faster decisions</p>
                </BentoCard>
              </motion.div>

              <motion.div variants={staggerItem} className="col-span-1 md:col-span-2">
                <BentoCard span="2x1" variant="sun" className="!col-span-full h-full" noMotion>
                  <p className="font-display text-2xl md:text-3xl font-bold leading-snug max-w-lg">
                    One platform for inventory, sales & customer intelligence.
                  </p>
                </BentoCard>
              </motion.div>
            </BentoGrid>
          </motion.div>
        </ScrollSection>

        {/* Section 2 — Features */}
        <ScrollSection id="features">
          <div className="mb-8 md:mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Built for retail teams</h2>
            <p className="mt-2 text-ink/60 max-w-xl">Every block does one job — clearly, boldly, beautifully.</p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            <BentoGrid>
              {FEATURES.map((f) => (
                <motion.div key={f.title} variants={staggerItem} className={f.span === '2x2' ? 'col-span-1 md:col-span-2 row-span-1 md:row-span-2' : f.span === '2x1' ? 'col-span-1 md:col-span-2' : ''}>
                  <BentoCard span={f.span} variant={f.variant} className="h-full" noMotion>
                    <span className="inline-block text-xs font-medium uppercase tracking-wider opacity-70">{f.chip}</span>
                    <h3 className="mt-3 font-display text-2xl md:text-3xl font-bold leading-tight">{f.title}</h3>
                    <p className="mt-2 opacity-70">{f.desc}</p>
                    <FeatureIcon variant={f.variant} />
                  </BentoCard>
                </motion.div>
              ))}
            </BentoGrid>
          </motion.div>
        </ScrollSection>

        {/* Section 3 — How it works */}
        <ScrollSection id="how-it-works">
          <div className="mb-8 md:mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">How it works</h2>
            <p className="mt-2 text-ink/60">Four steps from data to growth.</p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            <BentoGrid>
              {STEPS.map((step, i) => (
                <motion.div key={step.num} variants={staggerItem}>
                  <BentoCard
                    span="1x1"
                    variant={['teal', 'violet', 'coral', 'sky'][i]}
                    className="h-full"
                    noMotion
                  >
                    <span className="inline-block font-display text-3xl font-bold opacity-30 rotate-[-2deg]">
                      {step.num}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm opacity-70">{step.desc}</p>
                  </BentoCard>
                </motion.div>
              ))}
            </BentoGrid>
          </motion.div>
        </ScrollSection>

        {/* Section 4 — Metrics */}
        <ScrollSection id="metrics">
          <div className="mb-8 md:mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Trusted by retailers</h2>
            <p className="mt-2 text-ink/60">Numbers that speak for themselves.</p>
          </div>
          <BentoGrid>
            <StatCard label="Revenue tracked" value={2400000} prefix="₹" format={(v) => `${(v / 100000).toFixed(1)}L+`} variant="violet" suffix="" />
            <StatCard label="Predictions / day" value={12000} format={(v) => v.toLocaleString('en-IN')} variant="neon" suffix="+" />
            <StatCard label="Stock accuracy" value={98} format={(v) => String(v)} variant="coral" suffix="%" />
            <StatCard label="Stores connected" value={150} format={(v) => String(v)} variant="sun" suffix="+" />
            <StatCard label="Hours saved weekly" value={32} format={(v) => String(v)} variant="pink" suffix="hrs" />
            <StatCard label="Uptime" value={99} format={(v) => String(v)} variant="glass" suffix="%" />
          </BentoGrid>
        </ScrollSection>

        {/* Section 5 — CTA */}
        <ScrollSection id="cta">
          <BentoGrid>
            <BentoCard span="full" variant="coral" emphasis className="!col-span-full min-h-[280px] flex items-center">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 w-full">
              <div>
                <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                  Ready to retail
                  <br />
                  smarter?
                </h2>
                <p className="mt-4 text-lg opacity-80 max-w-md">
                  Join IntelliRetail and turn your store data into your competitive edge.
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-ink text-white font-semibold text-lg px-8 py-4 rounded-full hover:bg-ink/90 transition-colors whitespace-nowrap"
                >
                  Get started free
                </Link>
              </motion.div>
            </div>
          </BentoCard>
          </BentoGrid>
        </ScrollSection>
      </main>

      <footer className="border-t border-black/[0.06] py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-ink/50">© {new Date().getFullYear()} IntelliRetail. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
