/**
 * Unified Monitoring Utility for Events Platform
 * Reports handled/soft errors to the centralized system log.
 */
export const reportSystemError = (message, type = 'api_failure', metadata = {}) => {
  const API_URL = '/api/admin/logs';
  
  try {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'events',
        type,
        message,
        stack: new Error().stack,
        url: window.location.href,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      })
    }).catch(err => console.warn('Monitoring: Report failed', err));
  } catch (_e) {
    // Fail silently to avoid interfering with app logic
  }
};
