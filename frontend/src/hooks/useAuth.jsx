import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); 

  
  useEffect(() => {
    const token = localStorage.getItem("tf_token");
    if (!token) { setLoading(false); return; }

    api.me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem("tf_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login({ email, password });
    localStorage.setItem("tf_token", token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { token, user } = await api.register({ name, email, password });
    localStorage.setItem("tf_token", token);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("tf_token");
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
