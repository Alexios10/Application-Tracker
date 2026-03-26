import { useEffect, useState } from "react";
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
import {
  ChevronLeft,
  LogOut,
  Monitor,
  Smartphone,
  Shield,
  User,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { Topbar } from "@/components/Topbar";
import { useApplications } from "@/hooks/useApplications";

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
).replace(/\/+$/, "");

const ProfilePage = () => {
  const handleBack = () => window.history.back();
  const { user, logout, authFetch } = useAuth();
  const { addApplication } = useApplications();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [fullName, setFullName] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasChanges(false);
      return;
    }
    const fullNameChanged = fullName.trim() !== user.fullName;
    const passwordChanged = password.trim() !== "";
    setHasChanges(fullNameChanged || passwordChanged);
  }, [fullName, password, user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const fullNameChanged = fullName.trim() !== user?.fullName;
    const passwordChanged = password.trim() !== "";
    if (!fullNameChanged && !passwordChanged) {
      setError("Ingen endring å lagre.");
      setLoading(false);
      return;
    }

    if (passwordChanged) {
      if (!currentPassword) {
        setError("Du må skrive inn nåværende passord for å endre passord.");
        setLoading(false);
        return;
      }
      if (password === currentPassword) {
        setError("Det nye passordet kan ikke være likt det gamle passordet.");
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
      const res = await authFetch(`${API_BASE}/api/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          password: passwordChanged ? password : undefined,
          currentPassword: passwordChanged ? currentPassword : undefined,
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
      const res = await authFetch(`${API_BASE}/api/user`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
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

  const { applications } = useApplications();

  return (
    <div className="flex h-screen bg-[#0f1117] text-slate-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800/60">
        <Sidebar onAdd={addApplication} onReport={() => {}} onLogout={logout} />
      </aside>

      {/* ── Mobile Drawer ── */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={addApplication}
        onReport={() => {}}
        onLogout={logout}
      />

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-5 max-w-5xl mx-auto justify-center min-h-[60vh]">
            {/* Venstre side: Skjema */}
            <div className="flex-1 rounded-2xl bg-[#181c24] border border-slate-800/60 p-6">
              <h1 className="text-2xl font-bold mb-6 tracking-tight">
                Brukerprofil
              </h1>
              <form onSubmit={handleUpdate} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">
                    Brukernavn
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">
                      Nåværende passord
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 pr-10 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer hover:text-slate-300 transition-colors"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? <FaEye /> : <FaEyeSlash />}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">
                      Nytt passord
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 pr-10 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        type={showNewPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer hover:text-slate-300 transition-colors"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                      </span>
                    </div>
                  </div>
                </div>

                {message && (
                  <p className="text-green-400 text-sm font-medium text-center">
                    {message}
                  </p>
                )}
                {error && (
                  <p className="text-red-400 text-sm font-medium text-center">
                    {error}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={loading || !hasChanges}
                    className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Lagrer..." : "Lagre endringer"}
                  </Button>
                  <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        disabled={loading}
                        className="flex items-center gap-2 text-sm text-red-500/80 hover:text-red-400 transition-colors px-2 py-2 rounded-xl hover:bg-red-500/10"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest">
                          Slett bruker
                        </span>
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-slate-700 bg-slate-900 text-slate-100">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          Dette vil slette brukeren din permanent. Denne
                          handlingen kan ikke angres.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700">
                          Avbryt
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 text-white hover:bg-red-500"
                          onClick={handleDelete}
                        >
                          Slett
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </form>
            </div>

            {/* Høyre side: Brukerinformasjon */}
            <div className="w-full lg:w-64 space-y-4 shrink-0 self-start">
              <div className="rounded-2xl bg-[#181c24] border border-slate-800/60 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center text-lg font-bold text-slate-900 shrink-0">
                    {(user?.fullName || user?.username || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100 text-sm">
                      {user?.fullName || user?.username}
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">
                      Aktive søknader
                    </span>
                    <span className="text-xs font-semibold text-cyan-400">
                      {applications.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
