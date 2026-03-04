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
  isAdmin?: boolean;
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

// Sjekk om JWT-token er utløpt ved å lese exp-claim
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp er i sekunder, Date.now() er i millisekunder
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Ugyldig token = behandle som utløpt
  }
}

function loadUser(): AuthUser | null {
  const data = localStorage.getItem("auth_user");
  if (!data) return null;
  try {
    const user = JSON.parse(data) as AuthUser;
    // Sjekk om token er utløpt — logg ut automatisk
    if (isTokenExpired(user.token)) {
      localStorage.removeItem("auth_user");
      return null;
    }
    return user;
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
        isAdmin: data.isAdmin ?? false,
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
        isAdmin: data.isAdmin ?? false,
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
