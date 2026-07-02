import { useState } from 'react';

import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

import { authApi } from '../services/api';

import Logo from '../components/Logo';

import BentoCard from '../components/BentoCard';



const inputClass =

  'w-full px-4 py-2.5 border border-black/[0.08] rounded-bento bg-white/50 text-ink placeholder-ink/40 focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition-all';



export default function ForgotPassword() {

  const [email, setEmail] = useState('');

  const [sent, setSent] = useState(false);

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    if (!email.trim()) return;

    setLoading(true);

    try {

      await authApi.forgotPassword(email.trim());

      setSent(true);

    } catch (err) {

      setError(err.response?.data?.message || 'Request failed.');

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen flex items-center justify-center px-4 bg-canvas gradient-mesh">

      <motion.div

        initial={{ opacity: 0, y: 12 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.35 }}

        className="w-full max-w-md"

      >

        <div className="mb-8 flex justify-center">

          <Logo />

        </div>

        <BentoCard variant="glass" emphasis noMotion className="shadow-bento">

          <h1 className="font-display text-2xl font-bold text-ink mb-1">Forgot password</h1>

          <p className="text-sm text-ink/50 mb-6">Enter your email to receive a reset link.</p>

          {sent ? (

            <p className="text-sm text-violet font-medium">If that email exists, we sent a reset link. Check your inbox.</p>

          ) : (

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>

                <label htmlFor="email" className="block text-sm font-medium text-ink/70 mb-1.5">Email</label>

                <input

                  id="email"

                  type="email"

                  value={email}

                  onChange={(e) => setEmail(e.target.value)}

                  className={inputClass}

                  placeholder="you@example.com"

                />

              </div>

              {error && <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-bento">{error}</p>}

              <motion.button

                type="submit"

                disabled={loading}

                whileHover={{ scale: 1.01 }}

                whileTap={{ scale: 0.99 }}

                className="w-full py-3 bg-ink text-white rounded-full font-semibold hover:bg-ink/90 disabled:opacity-50"

              >

                {loading ? 'Sending…' : 'Send reset link'}

              </motion.button>

            </form>

          )}

          <p className="mt-4 text-center text-sm">

            <Link to="/login" className="text-violet font-medium hover:text-violet-dark">Back to login</Link>

          </p>

        </BentoCard>

      </motion.div>

    </div>

  );

}

