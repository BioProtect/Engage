import * as api from "../Api/AuthenticationApi";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const AuthContext = createContext();

const LOGOUT_TIME_MS = 2 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [project, setProject] = useState(() => {
    const savedProject = localStorage.getItem("project");
    return savedProject ? JSON.parse(savedProject) : null;
  });

  const logoutTimeoutRef = useRef(null);

  const logout = () => {
    setToken(null);
    setUser(null);
    setProject(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("project");
    localStorage.removeItem("loginTimestamp");
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  };

  const login = async (username, password) => {
    const res = await api.login(username, password);
    console.log("res ", res);
    if (res.accessToken) {
      setToken(res.accessToken);
      setUser({ username });
      setProject(res.project || null);
      localStorage.setItem("loginTimestamp", Date.now().toString());
    } else {
      throw new Error(res.msg || "Login failed");
    }
  };

  const signup = async (username, password) => {
    const res = await api.signup(username, password);
    if (res.msg === "Signup successful") {
      return;
    } else {
      throw new Error(res.msg || "Signup failed");
    }
  };

  useEffect(() => {
    if (token && user) {
      const loginTimestamp = parseInt(
        localStorage.getItem("loginTimestamp"),
        10,
      );
      if (!loginTimestamp) {
        logout();
        return;
      }

      const elapsed = Date.now() - loginTimestamp;
      const remaining = LOGOUT_TIME_MS - elapsed;

      if (remaining <= 0) {
        logout();
      } else {
        if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
        logoutTimeoutRef.current = setTimeout(logout, remaining);
      }
    } else {
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
        logoutTimeoutRef.current = null;
      }
    }
  }, [token, user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (project) {
      localStorage.setItem("project", JSON.stringify(project));
    } else {
      localStorage.removeItem("project");
    }
  }, [project]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        signup,
        logout,
        token,
        user,
        project,
        setProject,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
