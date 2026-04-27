import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useApplications } from "@/hooks/useApplications";
import { useFilteredApplications } from "@/hooks/useFilteredApplications";
import { STAT_CONFIGS } from "@/constants/stats";
import { Sidebar } from "@/components/Sidebar";

import { ReportModal } from "@/components/ReportModal";
import AddApplicationDialog from "@/components/AddApplicationDialog";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import { MobileDrawer } from "@/components/MobileDrawer";
import { Topbar } from "@/components/Topbar";
import { StatCard } from "@/components/StatCard";
import { ApplicationListPanel } from "@/components/ApplicationListPanel";

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Alle datahenting og mutasjoner relatert til søknader håndteres i denne hooken
  const {
    applications,
    addApplication,
    updateApplication,
    updateStatus,
    deleteApplication,
  } = useApplications();

  // Alle filtrering, søk og paginering for søknadslisten
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    filtered,
    paginated,
  } = useFilteredApplications(applications);

  // Antall per status for statuskortene - basert på den fullstendige søknadslisten, ikke bare den filtrerte/paginerte
  const countByFilter = (filter: string) =>
    filter === "all"
      ? applications.length
      : applications.filter((a) => a.status === filter).length;

  return (
    <div className="flex h-screen bg-[#0d0f14] text-slate-100 overflow-hidden">
      {/* Skrivebords sidepanel – skjult på mobil/nettbrett */}
      <aside className="hidden lg:flex shrink-0 flex-col border-r border-slate-800/60 bg-[#10121a]">
        <Sidebar
          onAdd={addApplication}
          onReport={() => setReportOpen(true)}
          onLogout={logout}
        />
      </aside>

      {/* Mobilskuff – skjult på skrivebord */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={addApplication}
        onReport={() => setReportOpen(true)}
        onLogout={logout}
      />

      {/* Hovedinnhold */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar onOpenDrawer={() => setDrawerOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          {/* Sideoverskrift */}
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-50 sm:text-3xl">
                  Oversikt
                </h1>
                <span className="rounded-full bg-cyan-900/40 border border-cyan-700/40 px-3 py-0.5 text-sm font-semibold text-cyan-300">
                  {applications.length} søknader totalt
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Velkommen tilbake. Her er status på dine aktive jobbsøknader.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {user?.isAdmin && (
                <Button
                  onClick={() => navigate("/admin/reports")}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors sm:px-4 sm:text-sm"
                >
                  <BarChart2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin-rapporter</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              )}
              <AddApplicationDialog onAdd={addApplication} />
            </div>
          </div>

          {/* Status kort */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {STAT_CONFIGS.map((config) => (
              <StatCard
                key={config.label}
                config={config}
                value={countByFilter(config.filter)}
                isActive={statusFilter === config.filter}
                onClick={setStatusFilter}
              />
            ))}
          </div>

          {/* Søknadstabell med søk og paginering */}
          <ApplicationListPanel
            applications={paginated}
            totalCount={filtered.length}
            page={page}
            totalPages={totalPages}
            search={search}
            onSearchChange={setSearch}
            onPageChange={setPage}
            onUpdateStatus={updateStatus}
            onEdit={updateApplication}
            onDelete={deleteApplication}
          />
        </main>
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
};

export default Index;
