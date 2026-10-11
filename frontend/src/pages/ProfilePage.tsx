import { getErrorMessage } from "@/lib/utils";
import { API_BASE } from "@/lib/api";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/AppLayout";
import { PasswordInput } from "@/components/PasswordInput";

const ProfilePage = () => {
  const { user, logout, authFetch, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasChanges(false);
      return;
    }
    const fullNameChanged = fullName.trim() !== user.fullName;
    const usernameChanged = username.trim() !== user.username;
    const passwordChanged = password.trim() !== "";
    setHasChanges(fullNameChanged || usernameChanged || passwordChanged);
  }, [fullName, username, password, user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const fullNameChanged = fullName.trim() !== user?.fullName;
    const usernameChanged = username.trim() !== user?.username;
    const passwordChanged = password.trim() !== "";
    if (!fullNameChanged && !usernameChanged && !passwordChanged) {
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
          username,
          password: passwordChanged ? password : undefined,
          currentPassword: passwordChanged ? currentPassword : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Kunne ikke oppdatere profil.");
      }
      // The server returns the updated user, so the new name shows everywhere right away
      updateUser(await res.json());
      setMessage("Profil oppdatert!");
      setPassword("");
      setCurrentPassword("");
    } catch (err) {
      setError(getErrorMessage(err));
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
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <AppLayout>
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
        Profil
      </h1>

      <form
        onSubmit={handleUpdate}
        className="mt-8 max-w-2xl rounded-xl border bg-card"
      >
        <section className="space-y-4 p-6">
          <h2 className="font-semibold">Navn og brukernavn</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Fullt navn</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">Brukernavn</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={50}
                autoComplete="username"
                aria-describedby="username-hint"
                required
              />
              <p id="username-hint" className="text-sm text-muted-foreground">
                Det du logger inn med.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t p-6">
          <div>
            <h2 className="font-semibold">Bytt passord</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fyll inn bare hvis du vil bytte passord.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Nåværende passord</Label>
              <PasswordInput
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Nytt passord</Label>
              <PasswordInput
                id="newPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4 border-t px-6 py-4">
          <Button type="submit" disabled={loading || !hasChanges}>
            {loading ? "Lagrer..." : "Lagre endringer"}
          </Button>
          {message && (
            <p role="status" className="text-sm text-status-Tilbud">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </form>

      <section className="mt-10 max-w-2xl">
        <h2 className="font-semibold">Slett konto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sletter kontoen og alle søknadene dine for godt. Dette kan ikke
          angres.
        </p>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              Slett kontoen min
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Slette kontoen din?</AlertDialogTitle>
              <AlertDialogDescription>
                Kontoen og alle søknadene dine blir slettet for godt. Dette kan
                ikke angres.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Slett kontoen min
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </AppLayout>
  );
};

export default ProfilePage;
