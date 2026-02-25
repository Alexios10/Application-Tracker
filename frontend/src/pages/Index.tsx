import { useState, useMemo, useEffect } from "react";
import { Application, ApplicationStatus } from "@/types/application";
import StatsCards from "@/components/StatsCards";
import ApplicationTable from "@/components/ApplicationTable";
import AddApplicationDialog from "@/components/AddApplicationDialog";
import { Input } from "@/components/ui/input";
import { Briefcase, Search } from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
).replace(/\/+$/, "");

const Index = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>(
    "all",
  );

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/applications`);
        if (!res.ok) {
          console.error("Failed to fetch applications", res.statusText);
          return;
        }
        const data: Application[] = await res.json();
        setApplications(data);
      } catch (err) {
        console.error("Error fetching applications", err);
      }
    };

    fetchApplications();
  }, []);

  const filtered = useMemo(() => {
    let result = applications;

    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.company.toLowerCase().startsWith(q));
    }

    return result;
  }, [applications, statusFilter, search]);

  const totalSent = applications.length;
  const rejected = applications.filter((a) => a.status === "Avslag").length;
  const pending = applications.filter((a) => a.status === "Sendt").length;
  const ghosted = applications.filter((a) => a.status === "Ghosted").length;

  const handleAdd = async (app: Omit<Application, "id">) => {
    try {
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(app),
      });
      if (!res.ok) {
        console.error("Failed to add application", res.statusText);
        return;
      }
      const created: Application = await res.json();
      setApplications((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Error adding application", err);
    }
  };

  const handleUpdateStatus = async (id: string, status: ApplicationStatus) => {
    const existing = applications.find((a) => a.id === id);
    if (!existing) return;

    const updated: Application = { ...existing, status };

    try {
      const res = await fetch(`${API_BASE}/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        console.error("Failed to update status", res.statusText);
        return;
      }
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Failed to delete application", res.statusText);
        return;
      }
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting application", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-10">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-emerald-300 shadow-lg shadow-emerald-500/40">
              <Briefcase className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300/80">
                Oversikt
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Jobbsøknad Tracker
              </h1>
              <p className="mt-1 text-sm text-slate-300/80">
                Hold oversikt over alle søknadene dine på ett sted.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start sm:self-auto">
            <div className="hidden text-right text-xs text-slate-400/80 sm:block">
              <p className="font-medium text-slate-200/90">
                {totalSent} søknader totalt
              </p>
              <p>
                {pending} venter svar · {rejected} avslag · {ghosted} ghosted
              </p>
            </div>
            <AddApplicationDialog onAdd={handleAdd} />
          </div>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,2.3fr)]">
          {/* Left column: stats + search */}
          <section className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-slate-950/95 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
              <StatsCards
                total={totalSent}
                rejected={rejected}
                pending={pending}
                ghosted={ghosted}
                selectedCard={
                  statusFilter === "all"
                    ? "total"
                    : statusFilter === "Avslag"
                      ? "rejected"
                      : statusFilter === "Sendt"
                        ? "pending"
                        : statusFilter === "Ghosted"
                          ? "ghosted"
                          : "total"
                }
                onCardClick={(card) => {
                  if (card === "total") {
                    setStatusFilter("all");
                  } else if (card === "rejected") {
                    setStatusFilter("Avslag");
                  } else if (card === "pending") {
                    setStatusFilter("Sendt");
                  } else if (card === "ghosted") {
                    setStatusFilter("Ghosted");
                  }
                }}
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-lg backdrop-blur">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-medium text-slate-100">
                    Søk i søknader
                  </h2>
                  <p className="text-xs text-slate-400/90">
                    Start å skrive for å filtrere på bedrift.
                  </p>
                </div>
                <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300">
                  {filtered.length} synlig nå
                </span>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Søk etter bedrift eller stilling..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-slate-700/80 bg-slate-900/70 pl-9 text-slate-50 placeholder:text-slate-500 focus-visible:ring-sky-400"
                />
              </div>
            </div>
          </section>

          {/* Right column: table */}
          <section className="flex w-full flex-col overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/85 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.9)] sm:p-5 lg:w-[47rem]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-medium text-slate-100">
                  Søknadsliste
                </h2>
                <p className="text-xs text-slate-400/90">
                  Oppdater status direkte i tabellen.
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ApplicationTable
                applications={filtered}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
