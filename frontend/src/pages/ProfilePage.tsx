import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
).replace(/\/+$/, "");

const ProfilePage = () => {
  // Tilbake-knapp funksjon
  const handleBack = () => window.history.back();
  const { user, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  function showNewPasswordToggle() {
    setShowNewPassword(!showNewPassword);
  }

  function showCurrentPasswordToggle() {
    setShowCurrentPassword(!showCurrentPassword);
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    // Passordvalidering
    if (password) {
      if (!currentPassword) {
        setError("Du må skrive inn nåværende passord for å endre passord.");
        setLoading(false);
        return;
      }
      const minLen = password.length >= 8;
      const hasDigit = /\d/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      if (!minLen || !hasDigit || !hasUpper || !hasLower) {
        setError(
          "Passordet må være minst 8 tegn med stor bokstav, liten bokstav og tall.",
        );
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
        body: JSON.stringify({
          fullName,
          password: password || undefined,
          currentPassword: currentPassword || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Kunne ikke oppdatere profil.");
      }
      setMessage("Profil oppdatert!");
      setPassword("");
      setCurrentPassword("");
    } catch (err: any) {
      setError(err.message || "Ukjent feil");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
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
      setDeleteDialogOpen(false);
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
              <div className="flex justify-between relative items-center">
                <label className="block text-sm mb-1 text-slate-200">
                  Nåværende passord
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100 focus-visible:ring-2 focus-visible:ring-sky-400"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <span
                  className="text-slate-50 absolute right-3 cursor-pointer"
                  onClick={showCurrentPasswordToggle}
                >
                  {showCurrentPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-200">
                  Nytt passord
                </label>
                <div className="flex justify-between relative items-center">
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100 focus-visible:ring-2 focus-visible:ring-sky-400"
                    type={showNewPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <span
                    className="text-slate-50 absolute right-3 cursor-pointer"
                    onClick={showNewPasswordToggle}
                  >
                    {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
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
            {/* Delete user confirmation modal */}
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={loading}
                  className="w-full"
                >
                  Slett bruker
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-slate-700 bg-slate-900 text-slate-100">
                <AlertDialogHeader>
                  <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    Dette vil slette brukeren din permanent. Denne handlingen
                    kan ikke angres.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700">
                    Avbryt
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    Slett
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
