/**
 * apps/admin/src/context/AuthContextObject.js
 *
 * Purpose: Creates and exports the raw React AuthContext object.
 * Kept separate from AuthContext.jsx to avoid circular import issues.
 */
import { createContext } from 'react';

export const AuthContext = createContext();
