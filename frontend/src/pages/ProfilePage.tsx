import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
).replace(/\/+$/, "");

const ProfilePage = () => {
  // Tilbake-knapp funksjon
  const handleBack = () => window.history.back();
  const { user, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    // Passordvalidering
    if (password) {
      const minLen = password.length >= 6;
      const hasDigit = /\d/.test(password);
      if (!minLen || !hasDigit) {
        setError("Passordet må være minst 6 tegn og inneholde minst ett tall.");
        setLoading(false);
        return;
      }
    }
    try {
      const res = await fetch(`${API_BASE}/api/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ fullName, password: password || undefined }),
      });
      if (!res.ok) throw new Error("Kunne ikke oppdatere profil.");
      setMessage("Profil oppdatert!");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Ukjent feil");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Er du sikker på at du vil slette brukeren din? Dette kan ikke angres.",
      )
    )
      return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (!res.ok) throw new Error("Kunne ikke slette bruker.");
      logout();
    } catch (err: any) {
      setError(err.message || "Ukjent feil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen flex-col px-4 py-8 sm:px-6 lg:px-10 xl:px-16">
        <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-emerald-300 shadow-lg shadow-emerald-500/40">
              <span className="font-bold text-slate-950 text-lg">👤</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300/80">
                Profil
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Min profil
              </h1>
              <p className="mt-1 text-sm text-slate-300/80">
                Oppdater navn eller passord, eller slett brukeren din.
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center">
          <section className="w-full max-w-lg rounded-3xl border border-slate-800/70 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-slate-950/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
            <div className="flex justify-end mb-2">
              <Button
                type="button"
                variant="outline"
                className="bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-400 px-4 py-2"
                onClick={handleBack}
              >
                ← Tilbake
              </Button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm mb-1 text-slate-200">
                  Fullt navn
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100 focus-visible:ring-2 focus-visible:ring-sky-400"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-200">
                  Nytt passord (valgfritt)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100 focus-visible:ring-2 focus-visible:ring-sky-400"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {message && (
                <div className="text-green-400 font-medium text-center">
                  {message}
                </div>
              )}
              {error && (
                <div className="text-red-400 font-medium text-center">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-900 text-sky-200 hover:bg-sky-700"
              >
                {loading ? "Lagrer..." : "Lagre endringer"}
              </Button>
            </form>
            <hr className="my-6 border-slate-700" />
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="w-full"
            >
              Slett bruker
            </Button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
