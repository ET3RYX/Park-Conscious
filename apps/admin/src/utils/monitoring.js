/**
 * apps/admin/src/utils/monitoring.js
 *
 * Purpose: Error monitoring utility for the Admin Panel.
 * Sends handled/soft errors to the centralized system log endpoint.
 * Ignores routine business logic errors (e.g., "not found", "already exists")
 * to reduce noise in the system log dashboard.
 */
export const reportSystemError = (message, type = 'api_failure', metadata = {}) => {
  // Filter out business logic errors (non-critical)
  const ignoredMessages = ['already exists', 'not found', 'unauthorized', 'invalid credentials'];
  if (ignoredMessages.some(msg => message.toLowerCase().includes(msg))) {
    return;
  }

  const API_URL = '/api/admin/logs';
  
  try {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'admin',
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
