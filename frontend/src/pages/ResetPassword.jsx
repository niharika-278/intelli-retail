import { useState } from 'react';

import { Link, useSearchParams } from 'react-router-dom';

import { motion } from 'framer-motion';

import { authApi } from '../services/api';

import Logo from '../components/Logo';

import BentoCard from '../components/BentoCard';



const inputClass =

  'w-full px-4 py-2.5 border border-black/[0.08] rounded-bento bg-white/50 text-ink placeholder-ink/40 focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition-all';



export default function ResetPassword() {

  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');

  const [confirm, setConfirm] = useState('');

  const [error, setError] = useState('');

  const [success, setSuccess] = useState(false);

  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    if (newPassword.length < 6) {

      setError('Password must be at least 6 characters.');

      return;

    }

    if (newPassword !== confirm) {

      setError('Passwords do not match.');

      return;

    }

    if (!token) {

      setError('Invalid reset link.');

      return;

    }

    setLoading(true);

    try {

      await authApi.resetPassword({ token, newPassword });

      setSuccess(true);

    } catch (err) {

      setError(err.response?.data?.message || 'Reset failed.');

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

          <h1 className="font-display text-2xl font-bold text-ink mb-1">Reset password</h1>

          <p className="text-sm text-ink/50 mb-6">Enter your new password.</p>

          {success ? (

            <p className="text-sm text-violet font-medium">

              Password updated. <Link to="/login" className="underline">Sign in</Link>

            </p>

          ) : (

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>

                <label className="block text-sm font-medium text-ink/70 mb-1.5">New password</label>

                <input

                  type="password"

                  value={newPassword}

                  onChange={(e) => setNewPassword(e.target.value)}

                  className={inputClass}

                  placeholder="Min 6 characters"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-ink/70 mb-1.5">Confirm password</label>

                <input

                  type="password"

                  value={confirm}

                  onChange={(e) => setConfirm(e.target.value)}

                  className={inputClass}

                  placeholder="Repeat password"

                />

              </div>

              {error && <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-bento">{error}</p>}

              <motion.button

                type="submit"

                disabled={loading || !token}

                whileHover={{ scale: 1.01 }}

                whileTap={{ scale: 0.99 }}

                className="w-full py-3 bg-ink text-white rounded-full font-semibold hover:bg-ink/90 disabled:opacity-50"

              >

                {loading ? 'Updating…' : 'Update password'}

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

