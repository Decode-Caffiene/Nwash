import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { login as loginRequest, logout as logoutRequest } from "../api/authApi";

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  // Session-based auth: the backend authenticates via a server-side session
  // (cookie). There is no JWT in the response body. We track login state
  // with a localStorage flag so it persists across page refreshes.
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isLoggedIn") === "true",
  );
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Sync logout across tabs (e.g. logout in another tab clears state here too)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "isLoggedIn") {
        setIsAuthenticated(e.newValue === "true");
      }
      if (e.key === "user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await loginRequest(credentials);

    const nextUser =
      response?.data?.user ??
      response?.user ?? {
        name: credentials?.userName ?? "Admin",
        role: "System Administrator",
      };

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", JSON.stringify(nextUser));
    setIsAuthenticated(true);
    setUser(nextUser);

    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // swallow — always clear local state regardless of server response
    } finally {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout }),
    [user, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
