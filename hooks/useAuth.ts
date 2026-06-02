/**
 * useAuth hook - Convenience wrapper for AuthContext
 */

import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => useAuthContext();
