import { useState } from 'react';

import { Outlet, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import Logo from '../components/Logo';



const nav = [

  { to: '/dashboard', label: 'Dashboard' },

  { to: '/checkout', label: 'Checkout' },

  { to: '/ingestion', label: 'Data Ingestion' },

];



export default function Layout() {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);



  const handleLogout = () => {

    logout();

    navigate('/login');

  };



  return (

    <div className="min-h-screen gradient-mesh flex flex-col">

      <header className="bg-white/55 backdrop-blur-xl border border-white/40/80 backdrop-blur-md border-b border-black/[0.06] sticky top-0 z-10">

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center h-16">

            <div className="flex items-center gap-8">

              <Logo to="/dashboard" />

              <nav className="hidden md:flex gap-1">

                {nav.map(({ to, label }) => (

                  <NavLink

                    key={to}

                    to={to}

                    className={({ isActive }) =>

                      `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${

                        isActive

                          ? 'bg-ink text-white'

                          : 'text-ink/60 hover:text-ink hover:bg-black/[0.04]'

                      }`

                    }

                  >

                    {label}

                  </NavLink>

                ))}

              </nav>

            </div>

            <div className="flex items-center gap-3">

              <span className="text-sm text-ink/50 hidden sm:inline">

                {user?.name} <span className="text-ink/40">({user?.role})</span>

              </span>

              <button

                type="button"

                onClick={handleLogout}

                className="text-sm text-ink/60 hover:text-ink font-medium px-3 py-1.5 rounded-full hover:bg-black/[0.04] transition-colors"

              >

                Log out

              </button>

              <button

                type="button"

                className="md:hidden p-2 rounded-full text-ink/60 hover:bg-black/[0.04]"

                onClick={() => setMenuOpen((o) => !o)}

                aria-label="Menu"

              >

                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />

                </svg>

              </button>

            </div>

          </div>

          {menuOpen && (

            <nav className="md:hidden py-2 border-t border-black/[0.06]">

              {nav.map(({ to, label }) => (

                <NavLink

                  key={to}

                  to={to}

                  onClick={() => setMenuOpen(false)}

                  className={({ isActive }) =>

                    `block px-3 py-2 rounded-lg text-sm ${

                      isActive ? 'bg-ink text-white font-medium' : 'text-ink/60'

                    }`

                  }

                >

                  {label}

                </NavLink>

              ))}

            </nav>

          )}

        </div>

      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

        <Outlet />

      </main>

    </div>

  );

}

