import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  changePassword as changePasswordRequest,
  forgotPassword as forgotPasswordRequest,
  getMe,
  login as loginRequest,
  register as registerRequest } from
"../services/authService";
import { clearToken, getToken, setToken } from "../lib/storage";

export const AuthContext = createContext(null);

function normalizeMePayload(payload) {
  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data[0] || null;
  }

  if (payload?.data && !Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload && typeof payload === "object") {
    return payload;
  }

  return null;
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const syncMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      return null;
    }

    const mePayload = await getMe();
    const normalizedUser = normalizeMePayload(mePayload);
    setUser(normalizedUser);
    return normalizedUser;
  }, [token]);

  useEffect(() => {
    let isActive = true;

    async function bootstrap() {
      if (!token) {
        if (isActive) {
          setUser(null);
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const mePayload = await getMe();
        if (!isActive) {
          return;
        }
        const normalizedUser = normalizeMePayload(mePayload);
        setUser(normalizedUser);
      } catch {
        clearToken();
        if (isActive) {
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      isActive = false;
    };
  }, [token]);

  const login = useCallback(async (credentials) => {
    const response = await loginRequest(credentials);
    if (typeof response !== "string") {
      throw new Error("Invalid token response from /auth/login");
    }

    setToken(response);
    setTokenState(response);

    const mePayload = await getMe();
    const normalizedUser = normalizeMePayload(mePayload);
    setUser(normalizedUser);

    return normalizedUser;
  }, []);

  const register = useCallback(async (payload) => {
    return registerRequest(payload);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (payload) => {
    return forgotPasswordRequest(payload);
  }, []);

  const changePassword = useCallback(async (payload) => {
    return changePasswordRequest(payload);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      roleName: user?.role?.name || "",
      isBootstrapping,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      syncMe,
      forgotPassword,
      changePassword
    }),
    [token, user, isBootstrapping, login, register, logout, syncMe, forgotPassword, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}