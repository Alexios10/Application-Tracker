import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface Report {
  id: number;
  subject: string;
  description: string;
  userId?: string;
  createdAt: string;
}

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
).replace(/\/+$/, "");

const AdminReportsPage = () => {
  // Tilbake-knapp funksjon
  const handleBack = () => window.history.back();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/reports`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        if (!res.ok) throw new Error("Ingen tilgang eller feil ved henting.");
        const data = await res.json();
        setReports(data);
      } catch (err: any) {
        setError(err.message || "Ukjent feil");
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchReports();
  }, [user?.token]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen flex-col px-4 py-8 sm:px-6 lg:px-10 xl:px-16">
        <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full mb-2">
            <Button
              type="button"
              variant="outline"
              className="bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800 px-4 py-2"
              onClick={handleBack}
            >
              ← Tilbake
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-emerald-300 shadow-lg shadow-emerald-500/40">
              <span className="font-bold text-slate-950 text-lg">📝</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300/80">
                Admin
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Innsendte rapporter
              </h1>
              <p className="mt-1 text-sm text-slate-300/80">
                Her ser du alle rapporter sendt inn av brukere.
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center">
          <section className="w-full max-w-3xl rounded-3xl border border-slate-800/70 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-slate-950/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
            {loading && (
              <div className="mb-4 text-slate-400">Laster rapporter...</div>
            )}
            {error && <div className="text-red-600 mb-4">{error}</div>}
            {reports.length === 0 && !loading && (
              <div className="text-slate-400">Ingen rapporter funnet.</div>
            )}
            <div className="grid gap-5">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-slate-950/95 p-5 shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-lg text-sky-200">
                      {r.subject}
                    </div>
                    <span className="text-xs text-slate-400">
                      {r.createdAt && new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-200 whitespace-pre-line mb-2 text-sm">
                    {r.description}
                  </div>
                  {r.userId && (
                    <div className="text-xs text-slate-500">
                      Bruker-ID: {r.userId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminReportsPage;
