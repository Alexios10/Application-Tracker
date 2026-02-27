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
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-sky-300">
        Innsendte rapporter
      </h1>
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
            className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 shadow-md"
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
    </div>
  );
};

export default AdminReportsPage;
