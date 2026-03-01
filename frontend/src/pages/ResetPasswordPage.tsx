import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Lock, CheckCircle2, XCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5242";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  // Redirect til login etter 3 sekunder ved suksess
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
      setError("Passordene matcher ikke.");
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
        setError("Ugyldig eller utløpt lenke.");
      }
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20">
              <XCircle className="h-7 w-7 text-red-400" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-50">
              Ugyldig lenke
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Denne tilbakestillingslenken er ugyldig eller har utløpt.
            </p>
            <a
              href="/forgot-password"
              className="mt-4 inline-block text-sm font-medium text-sky-400 hover:text-sky-300"
            >
              Be om ny lenke
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-emerald-300 shadow-lg shadow-emerald-500/40">
            <Briefcase className="h-7 w-7 text-slate-950" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-50">
            Nytt passord
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Velg et nytt passord for kontoen din
          </p>
        </div>

        {/* Skjema */}
        <div className="space-y-5 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="text-center text-sm text-slate-300">
                Passordet er endret! Du sendes til innloggingssiden...
              </p>
              <Button
                onClick={() => navigate("/login")}
                variant="ghost"
                className="text-sky-400 hover:text-sky-300 hover:bg-slate-800/50"
              >
                Gå til innlogging nå
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Nytt passord
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minst 6 tegn, inkl. et tall"
                    required
                    minLength={6}
                    className="border-slate-700/80 bg-slate-900/70 pl-10 text-slate-50 placeholder:text-slate-500 focus-visible:ring-sky-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-slate-300">
                  Gjenta nytt passord
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Skriv passordet på nytt"
                    required
                    minLength={6}
                    className="border-slate-700/80 bg-slate-900/70 pl-10 text-slate-50 placeholder:text-slate-500 focus-visible:ring-sky-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-emerald-400 font-semibold text-slate-950 hover:from-sky-400 hover:to-emerald-300"
              >
                {loading ? "Lagrer..." : "Lagre nytt passord"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
