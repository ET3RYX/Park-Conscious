import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Login from './pages/Login';
import PriceUpdater from './pages/PriceUpdater';
import Attendees from './pages/Attendees';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-darkBackground-900 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-premier-400 border-r-transparent animate-spin"></div>
    </div>
  );
  
  if (!admin) return <Navigate to="/login" replace />;
  
  return children;
};

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error('CRITICAL ADMIN CRASH:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <span className="text-4xl">☢️</span>
            </div>
            <h1 className="text-white text-2xl font-black uppercase tracking-tighter">System Malfunction</h1>
            <p className="text-slate-400 text-sm font-medium">A critical error occurred in the Admin Panel runtime. This is likely due to a missing component or an unexpected API response.</p>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-[10px] font-mono text-rose-400 text-left overflow-auto max-h-40">
              {this.state.error?.message}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-sky-600 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase transition hover:bg-sky-500"
            >
              Attempt System Reboot
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>

            <Route index element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="events/edit/:id" element={<EditEvent />} />
            <Route path="price-updater" element={<PriceUpdater />} />
            
            {/* Work in Progress Modules */}
            <Route path="attendees" element={<Attendees />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;
