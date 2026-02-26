import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Typer for auth-data
interface AuthUser {
  token: string;
  fullName: string;
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<string | null>;
  register: (
    username: string,
    email: string,
    fullName: string,
    password: string,
  ) => Promise<string | null>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
export { AuthContext };

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
).replace(/\/+$/, "");

// Lagrer brukerdata i localStorage slik at man forblir innlogget
function saveUser(user: AuthUser) {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

function loadUser(): AuthUser | null {
  const data = localStorage.getItem("auth_user");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function clearUser() {
  localStorage.removeItem("auth_user");
}

// Provider-komponent som wrapper hele appen
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sjekk om bruker allerede er lagret ved oppstart
  useEffect(() => {
    const saved = loadUser();
    if (saved) {
      setUser(saved);
    }
    setIsLoading(false);
  }, []);

  // Innlogging — returnerer feilmelding eller null ved suksess
  const login = async (
    username: string,
    password: string,
  ): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error || "Innlogging feilet.";
      }

      const authUser: AuthUser = {
        token: data.token,
        fullName: data.fullName,
        username: data.username,
      };
      setUser(authUser);
      saveUser(authUser);
      return null; // Ingen feil
    } catch {
      return "Kunne ikke koble til serveren.";
    }
  };

  // Registrering — returnerer feilmelding eller null ved suksess
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
        body: JSON.stringify({ username, email, fullName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error || "Registrering feilet.";
      }

      const authUser: AuthUser = {
        token: data.token,
        fullName: data.fullName,
        username: data.username,
      };
      setUser(authUser);
      saveUser(authUser);
      return null;
    } catch {
      return "Kunne ikke koble til serveren.";
    }
  };

  const logout = () => {
    setUser(null);
    clearUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
