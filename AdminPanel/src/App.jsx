import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Login from './pages/Login';

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

function App() {
  return (
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
            
            {/* Work in Progress Modules */}
            <Route path="attendees" element={
              <div className="h-[60vh] flex flex-col items-center justify-center opacity-40">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-white/20 mb-6 flex items-center justify-center">
                  <span className="text-4xl">🛠️</span>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest">Attendee Stream</h2>
                <p className="mt-2 text-sm font-medium">Telemetry sync in progress. Module offline.</p>
              </div>
            } />
            <Route path="settings" element={
              <div className="h-[60vh] flex flex-col items-center justify-center opacity-40">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-white/20 mb-6 flex items-center justify-center">
                  <span className="text-4xl">⚙️</span>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest">System Protocols</h2>
                <p className="mt-2 text-sm font-medium">Core configuration locked. Terminal inactive.</p>
              </div>
            } />
          </Route>

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
