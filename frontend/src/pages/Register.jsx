import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useAuth } from '../context/AuthContext';

import { authApi } from '../services/api';

import Logo from '../components/Logo';

import BentoCard from '../components/BentoCard';

import AuthSidePanel from '../components/AuthSidePanel';



const inputClass =

  'w-full px-4 py-2.5 border border-black/[0.08] rounded-bento bg-white/50 text-ink placeholder-ink/40 focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition-all';



export default function Register() {

  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [role, setRole] = useState('seller');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const navigate = useNavigate();



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    if (!name.trim() || !email.trim() || !password) {

      setError('Name, email and password are required.');

      return;

    }

    if (password.length < 6) {

      setError('Password must be at least 6 characters.');

      return;

    }

    setLoading(true);

    try {

      const { data } = await authApi.register({

        name: name.trim(),

        email: email.trim(),

        password,

        role,

      });

      login(data.token, data.user);

      navigate('/dashboard', { replace: true });

    } catch (err) {

      setError(err.response?.data?.message || 'Registration failed.');

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen grid lg:grid-cols-2 bg-canvas gradient-mesh">

      <AuthSidePanel />



      <div className="flex items-center justify-center p-6 md:p-10">

        <motion.div

          initial={{ opacity: 0, y: 12 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.35 }}

          className="w-full max-w-md"

        >

          <div className="lg:hidden mb-8">

            <Logo />

          </div>



          <BentoCard variant="glass" emphasis noMotion className="shadow-bento">

            <h1 className="font-display text-2xl font-bold text-ink mb-1">Create account</h1>

            <p className="text-sm text-ink/50 mb-6">Join IntelliRetail today</p>



            <form onSubmit={handleSubmit} className="space-y-4">

              <div>

                <label htmlFor="name" className="block text-sm font-medium text-ink/70 mb-1.5">

                  Name

                </label>

                <input

                  id="name"

                  type="text"

                  autoComplete="name"

                  value={name}

                  onChange={(e) => setName(e.target.value)}

                  className={inputClass}

                  placeholder="Your name"

                />

              </div>

              <div>

                <label htmlFor="email" className="block text-sm font-medium text-ink/70 mb-1.5">

                  Email

                </label>

                <input

                  id="email"

                  type="email"

                  autoComplete="email"

                  value={email}

                  onChange={(e) => setEmail(e.target.value)}

                  className={inputClass}

                  placeholder="you@example.com"

                />

              </div>

              <div>

                <label htmlFor="password" className="block text-sm font-medium text-ink/70 mb-1.5">

                  Password

                </label>

                <input

                  id="password"

                  type="password"

                  autoComplete="new-password"

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  className={inputClass}

                  placeholder="At least 6 characters"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-ink/70 mb-1.5">Role</label>

                <select

                  value={role}

                  onChange={(e) => setRole(e.target.value)}

                  className={inputClass}

                >

                  <option value="admin">Admin</option>

                  <option value="seller">Seller</option>

                </select>

              </div>

              {error && (

                <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-bento" role="alert">

                  {error}

                </p>

              )}

              <motion.button

                type="submit"

                disabled={loading}

                whileHover={{ scale: 1.01 }}

                whileTap={{ scale: 0.99 }}

                className="w-full py-3 bg-ink text-white rounded-full font-semibold hover:bg-ink/90 disabled:opacity-50 transition-colors"

              >

                {loading ? 'Creating account…' : 'Create account'}

              </motion.button>

            </form>



            <p className="mt-4 text-center text-sm text-ink/50">

              Already have an account?{' '}

              <Link to="/login" className="text-violet font-medium hover:text-violet-dark">

                Sign in

              </Link>

            </p>

          </BentoCard>

        </motion.div>

      </div>

    </div>

  );

}

