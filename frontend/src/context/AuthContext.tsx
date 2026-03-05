import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Typer for auth-data (token lagres i HttpOnly-cookie, ikke i JS)
interface AuthUser {
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
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
export { AuthContext };

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
).replace(/\/+$/, "");

// Provider-komponent som wrapper hele appen
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sjekk om bruker er innlogget ved oppstart
  // Prøver /me først, og ved 401 forsøker refresh for å fornye utløpt access-token
  useEffect(() => {
    const checkSession = async () => {
      try {
        let res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });

        // Hvis access-token er utløpt, prøv å fornye med refresh-token
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
        // Nettverksfeil — bruker forblir utlogget
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // Fetch-wrapper: ved 401, prøv å fornye token og kjør kallet på nytt
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const res = await fetch(url, { ...options, credentials: "include" });

      if (res.status !== 401) return res;

      // Forsøk å fornye access-token med refresh-token
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) {
        // Refresh feilet — logg ut brukeren
        setUser(null);
        return res;
      }

      // Oppdater bruker-data fra refresh-responsen
      const data = await refreshRes.json();
      setUser({
        fullName: data.fullName,
        username: data.username,
        isAdmin: data.isAdmin ?? false,
      });

      // Kjør det opprinnelige kallet på nytt med ny access-token
      return fetch(url, { ...options, credentials: "include" });
    },
    [],
  );

  // Innlogging — returnerer feilmelding eller null ved suksess
  const login = async (
    username: string,
    password: string,
  ): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
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
        credentials: "include",
        body: JSON.stringify({ username, email, fullName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error || "Registrering feilet.";
      }

      setUser({
        fullName: data.fullName,
        username: data.username,
        isAdmin: data.isAdmin ?? false,
      });
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
      value={{ user, login, register, logout, authFetch, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
