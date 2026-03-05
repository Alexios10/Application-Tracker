import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
).replace(/\/+$/, "");

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

      // Backend sender e-post direkte — vi viser bare bekreftelse
      setSent(true);
    } catch (err) {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-emerald-300 shadow-lg shadow-emerald-500/40">
            <Briefcase className="h-7 w-7 text-slate-950" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-50">
            Glemt passord
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Skriv inn e-postadressen din, så sender vi en lenke for å
            tilbakestille passordet
          </p>
        </div>

        {/* Skjema */}
        <div className="space-y-5 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {sent ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="text-center text-sm text-slate-300">
                Hvis e-postadressen er registrert, har vi sendt en lenke for å
                tilbakestille passordet ditt.
              </p>
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-sm text-amber-300">
                  Sjekk søppelpost/spam-mappen din hvis du ikke finner e-posten
                  i innboksen.
                </p>
              </div>
              <a
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Tilbake til innlogging
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  E-postadresse
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@epost.no"
                    required
                    className="border-slate-700/80 bg-slate-900/70 pl-10 text-slate-50 placeholder:text-slate-500 focus-visible:ring-sky-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-emerald-400 font-semibold text-slate-950 hover:from-sky-400 hover:to-emerald-300"
              >
                {loading ? "Sender..." : "Send tilbakestillingslenke"}
              </Button>

              <p className="text-center text-sm text-slate-400">
                Husker du passordet?{" "}
                <a
                  href="/login"
                  className="font-medium text-sky-400 hover:text-sky-300"
                >
                  Logg inn
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
