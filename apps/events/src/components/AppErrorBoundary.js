import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL EVENTS CRASH:', error, errorInfo);

    // Automatically report to centralized system log
    fetch('https://www.parkconscious.in/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'events',
        type: 'frontend_crash',
        message: error.message || 'Unknown Events Crash',
        stack: error.stack,
        url: window.location.href,
        metadata: { errorInfo }
      })
    }).catch(err => console.error('Failed to send error report:', err));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center text-white font-sans">
          <div className="max-w-md space-y-6">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <span className="text-5xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">System Error</h1>
            <p className="text-slate-400 text-sm font-medium">We encountered a critical error while loading the events platform. Our team has been notified.</p>
            <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-[10px] font-mono text-red-400 text-left overflow-auto max-h-40">
              {this.state.error?.message}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl text-xs font-bold uppercase transition hover:bg-indigo-500 shadow-xl shadow-indigo-600/20"
            >
              Reload Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
