import { getErrorMessage } from "@/lib/utils";
import { API_BASE } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";

interface Report {
  id: number;
  subject: string;
  description: string;
  userId?: string;
  createdAt: string;
}

const AdminReportsPage = () => {
  const { user, authFetch } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await authFetch(`${API_BASE}/api/reports`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Ingen tilgang eller feil ved henting.");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchReports();
  }, [user, authFetch]);

  return (
    <AppLayout>
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
        Rapporter
      </h1>
      <p className="mt-1 text-muted-foreground">
        Problemer og ønsker sendt inn av brukere.
      </p>

      <div className="mt-8 max-w-3xl">
        {loading && (
          <p className="text-muted-foreground">Henter rapporter...</p>
        )}
        {error && <p className="text-destructive">{error}</p>}
        {reports.length === 0 && !loading && !error && (
          <p className="text-muted-foreground">Ingen rapporter ennå.</p>
        )}
        {reports.length > 0 && (
          <ul className="divide-y rounded-xl border bg-card">
            {reports.map((r) => (
              <li key={r.id} className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{r.subject}</p>
                  {r.createdAt && (
                    <time className="tabular text-sm text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString("nb-NO")}
                    </time>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-line text-sm">
                  {r.description}
                </p>
                {r.userId && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Bruker-ID: {r.userId}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminReportsPage;
