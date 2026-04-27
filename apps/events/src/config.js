const isDev = process.env.NODE_ENV === 'development';
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (isDev ? "http://localhost:3001" : "");
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "missing_client_id_placeholder";
