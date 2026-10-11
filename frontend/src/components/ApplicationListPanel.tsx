import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Application, ApplicationStatus } from "@/types/application";
import ApplicationTable from "@/components/application-table/ApplicationTable";

interface Props {
  applications: Application[]; // already filtered + paginated
  hasApplications: boolean; // false when the user has no applications at all
  isLoading: boolean;
  totalCount: number; // total after filtering (for "showing X of Y")
  page: number;
  totalPages: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onUpdateStatus: (id: number, status: ApplicationStatus) => void;
  onEdit: (app: Application) => void;
  onDelete: (id: number) => void;
}

export function ApplicationListPanel({
  applications,
  hasApplications,
  isLoading,
  totalCount,
  page,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
  onUpdateStatus,
  onEdit,
  onDelete,
}: Props) {
  const from = totalCount === 0 ? 0 : (page - 1) * 10 + 1;
  const to = Math.min(page * 10, totalCount);

  if (isLoading) {
    return <p className="py-10 text-muted-foreground">Henter søknadene...</p>;
  }

  if (!hasApplications) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center">
        <p className="font-medium">Du har ingen søknader ennå</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Legg til den første søknaden din, så får du oversikten her.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Søk etter bedrift eller stilling"
            aria-label="Søk i søknader"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              aria-label="Tøm søket"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="tabular text-sm text-muted-foreground">
          Viser {from}–{to} av {totalCount}
        </p>
      </div>

      {applications.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Ingen søknader passer søket eller filteret.
        </p>
      ) : (
        <ApplicationTable
          applications={applications}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Forrige side"
            className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="tabular min-w-[3.5rem] text-center text-sm text-muted-foreground">
            {page} av {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Neste side"
            className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
