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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Innsendte rapporter</h1>
      {loading && <div>Laster rapporter...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {reports.length === 0 && !loading && <div>Ingen rapporter funnet.</div>}
      <ul className="space-y-4">
        {reports.map((r) => (
          <li key={r.id} className="border rounded p-4 bg-slate-900">
            <div className="font-semibold text-sky-300">{r.subject}</div>
            <div className="text-slate-200 whitespace-pre-line mb-2">
              {r.description}
            </div>
            <div className="text-xs text-slate-400">
              {r.createdAt && new Date(r.createdAt).toLocaleString()}{" "}
              {r.userId && <>· Bruker-ID: {r.userId}</>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminReportsPage;
