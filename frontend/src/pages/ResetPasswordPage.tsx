import { API_BASE } from "@/lib/api";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/AuthCard";
import { PasswordInput } from "@/components/PasswordInput";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  // Redirect to login after 3 seconds on success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate("/login"), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passordene er ikke like.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/account/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        // Read the error message from the backend
        try {
          const data = await res.json();
          setError(data.error || "Ugyldig eller utløpt lenke.");
        } catch {
          setError("Ugyldig eller utløpt lenke.");
        }
      }
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthCard
        title="Lenken virker ikke"
        description="Lenken for nytt passord er ugyldig eller har utløpt."
      >
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-link underline-offset-4 hover:underline"
        >
          Be om en ny lenke
        </Link>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard
        title="Passordet er endret"
        description="Du sendes til innloggingen om et øyeblikk."
      >
        <Button onClick={() => navigate("/login")} className="w-full">
          Gå til innlogging
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Nytt passord"
      description="Velg et nytt passord for kontoen din."
    >
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
          <Label htmlFor="password">Nytt passord</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            aria-describedby="password-hint"
            minLength={8}
            required
          />
          <p id="password-hint" className="text-sm text-muted-foreground">
            Minst 8 tegn, med stor og liten bokstav og et tall.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Gjenta passordet</Label>
          <PasswordInput
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Lagrer..." : "Lagre nytt passord"}
        </Button>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordPage;
