import { lazy, Suspense } from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext';

import Layout from './layouts/Layout';

import { ToastContainer } from './components/Toast';

import { ErrorBoundary } from './components/ErrorBoundary';



const Landing = lazy(() => import('./pages/Landing'));

const Login = lazy(() => import('./pages/Login'));

const Register = lazy(() => import('./pages/Register'));

const Dashboard = lazy(() => import('./pages/Dashboard'));

const DataIngestion = lazy(() => import('./pages/DataIngestion'));

const Checkout = lazy(() => import('./pages/Checkout'));

const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

const ResetPassword = lazy(() => import('./pages/ResetPassword'));



function ProtectedRoute({ children }) {

  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) return <Navigate to="/login" replace />;

  return children;

}



function PageLoader() {

  return (

    <div className="min-h-screen flex items-center justify-center bg-canvas">

      <div className="w-8 h-8 border-2 border-ink/20 border-t-violet rounded-full animate-spin" />

    </div>

  );

}



export default function App() {

  return (

    <ErrorBoundary>

      <ToastContainer />

      <Suspense fallback={<PageLoader />}>

        <Routes>

          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route

            element={

              <ProtectedRoute>

                <Layout />

              </ProtectedRoute>

            }

          >

            <Route path="dashboard" element={<Dashboard />} />

            <Route path="ingestion" element={<DataIngestion />} />

            <Route path="checkout" element={<Checkout />} />

          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </Suspense>

    </ErrorBoundary>

  );

}

