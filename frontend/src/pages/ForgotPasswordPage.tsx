import { API_BASE } from "@/lib/api";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/AuthCard";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSent(false);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/account/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setError("Noe gikk galt. Prøv igjen.");
        setLoading(false);
        return;
      }

      // The backend sends the email - we only show a confirmation
      setSent(true);
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Glemt passord"
      description={
        sent
          ? undefined
          : "Skriv inn e-postadressen du registrerte deg med, så sender vi deg en lenke for å lage nytt passord."
      }
    >
      {sent ? (
        <div className="space-y-4 text-sm">
          <p>
            Hvis e-postadressen er registrert hos oss, har du nå fått en e-post
            med en lenke. Lenken virker i én time.
          </p>
          <p className="text-muted-foreground">
            Finner du den ikke? Sjekk søppelpost-mappen.
          </p>
          <Link
            to="/login"
            className="inline-block font-medium text-link underline-offset-4 hover:underline"
          >
            Tilbake til innlogging
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sender..." : "Send lenke"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Husker du passordet?{" "}
            <Link
              to="/login"
              className="font-medium text-link underline-offset-4 hover:underline"
            >
              Logg inn
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPasswordPage;
