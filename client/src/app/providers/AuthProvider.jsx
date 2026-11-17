import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ROLES } from '../../config/roles.js';

const AuthContext = createContext(null);
const USER_KEY = 'ptms_auth_user';
const TOKEN_KEY = 'ptms_access_token';

function normalizeUser(user) {
  return {
    ...user,
    name: user.full_name || user.name,
    role: user.role,
  };
}

function loadUser() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(USER_KEY));
    return sessionStorage.getItem(TOKEN_KEY) && stored ? stored : null;
  } catch {
    return null;
  }
}

function saveSession(data) {
  const user = normalizeUser(data.user);
  sessionStorage.setItem(TOKEN_KEY, data.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const login = async ({ email, password }) => {
    const { authService } = await import('../../modules/auth/services/authService.js');
    const response = await authService.login({ email, password });
    const signedInUser = saveSession(response.data.data);
    setUser(signedInUser);
    return signedInUser;
  };

  const acceptInvitation = async ({ token, password }) => {
    const { authService } = await import('../../modules/auth/services/authService.js');
    const response = await authService.acceptInvitation({ token, password });
    const accepted = response.data.data;
    if (!accepted.token) {
      return { user: normalizeUser(accepted.user), authenticated: false };
    }
    const signedInUser = saveSession(accepted);
    setUser(signedInUser);
    return { user: signedInUser, authenticated: true };
  };

  const updateProfile = useCallback(async (profile) => {
    if (!user || user.role !== ROLES.ADMIN) {
      throw new Error('Only system administrators can edit their profile.');
    }
    const { userService } = await import('../../modules/users/services/userService.js');
    const response = await userService.update(user.id, profile);
    const updatedUser = normalizeUser(response.data.data);
    sessionStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  }, [user]);

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    login,
    acceptInvitation,
    updateProfile,
    logout,
    isAuthenticated: Boolean(user),
  }), [user, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
