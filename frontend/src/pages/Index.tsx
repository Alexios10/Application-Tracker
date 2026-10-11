import { useApplications } from "@/hooks/useApplications";
import { useFilteredApplications } from "@/hooks/useFilteredApplications";
import { AppLayout } from "@/components/AppLayout";
import AddApplicationDialog from "@/components/AddApplicationDialog";
import { StatusOverview } from "@/components/StatusOverview";
import { ExportMenu } from "@/components/ExportMenu";
import { ApplicationListPanel } from "@/components/ApplicationListPanel";

const Index = () => {
  // All fetching and changes to applications are handled by this hook
  const {
    applications,
    isLoading,
    addApplication,
    updateApplication,
    updateStatus,
    deleteApplication,
  } = useApplications();

  // All filtering, searching and pagination for the application list
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

  return (
    <AppLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
            Oversikt
          </h1>
          <p className="mt-1 text-muted-foreground">
            <span className="tabular">{applications.length}</span>{" "}
            {applications.length === 1 ? "søknad" : "søknader"}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportMenu applications={applications} />
          <AddApplicationDialog onAdd={addApplication} />
        </div>
      </div>

      {applications.length > 0 && (
        <div className="mt-8">
          <StatusOverview
            applications={applications}
            activeFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />
        </div>
      )}

      <div className="mt-8">
        <ApplicationListPanel
          applications={paginated}
          hasApplications={applications.length > 0}
          isLoading={isLoading}
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
      </div>
    </AppLayout>
  );
};

export default Index;
