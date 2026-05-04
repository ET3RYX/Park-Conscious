/**
 * apps/admin/src/hooks/useAuth.js
 *
 * Purpose: Custom hook for accessing the admin authentication context.
 * Provides a clean shorthand for useContext(AuthContext) across the app.
 */
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextObject';

export const useAuth = () => useContext(AuthContext);
