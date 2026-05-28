import { createContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest, logout as logoutRequest } from "../api/authApi";

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  token: null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("access_token"),
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials) => {
    const response = await loginRequest(credentials);
    const nextToken = response?.data?.access_token || response?.access_token;
    const nextUser = response?.data?.user ||
      response?.user || {
        name: credentials?.username || "Admin User",
        role: "System Administrator",
      };

    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("access_token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));

    return response;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
