import { API_BASE } from "@/lib/api";
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Types for auth data (the token is stored in an HttpOnly cookie, not in JS)
export interface AuthUser {
  fullName: string;
  username: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (
    username: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<string | null>;
  register: (
    username: string,
    email: string,
    fullName: string,
    password: string,
  ) => Promise<string | null>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
export { AuthContext };

// Provider component that wraps the whole app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is logged in on startup
  // Tries /me first, and on 401 calls refresh to renew an expired access token
  useEffect(() => {
    const checkSession = async () => {
      try {
        let res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });

        // If the access token has expired, try to renew it with the refresh token
        if (res.status === 401) {
          const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });
          if (refreshRes.ok) {
            res = await fetch(`${API_BASE}/api/auth/me`, {
              credentials: "include",
            });
          }
        }

        if (res.ok) {
          const data = await res.json();
          setUser({
            fullName: data.fullName,
            username: data.username,
            isAdmin: data.isAdmin ?? false,
          });
        }
      } catch {
        // Network error - the user stays logged out
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // Fetch wrapper: on 401, renew the token and retry the request
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const res = await fetch(url, { ...options, credentials: "include" });

      if (res.status !== 401) return res;

      // Try to renew the access token with the refresh token
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) {
        // Refresh failed - log the user out
        setUser(null);
        return res;
      }

      // Update the user data from the refresh response
      const data = await refreshRes.json();
      setUser({
        fullName: data.fullName,
        username: data.username,
        isAdmin: data.isAdmin ?? false,
      });

      // Retry the original request with the new access token
      return fetch(url, { ...options, credentials: "include" });
    },
    [],
  );

  // Login - returns an error message, or null on success
  const login = async (
    username: string,
    password: string,
    rememberMe: boolean,
  ): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // Spaces around the username are removed, the password is sent exactly as typed
        body: JSON.stringify({
          username: username.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error || "Innlogging feilet.";
      }

      setUser({
        fullName: data.fullName,
        username: data.username,
        isAdmin: data.isAdmin ?? false,
      });
      return null; // No error
    } catch {
      return "Kunne ikke koble til serveren.";
    }
  };

  // Registration - returns an error message, or null on success
  const register = async (
    username: string,
    email: string,
    fullName: string,
    password: string,
  ): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          fullName: fullName.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error || "Registrering feilet.";
      }

      // Do not log in user after registration
      return null;
    } catch {
      return "Kunne ikke koble til serveren.";
    }
  };

  const logout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser: setUser,
        authFetch,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
