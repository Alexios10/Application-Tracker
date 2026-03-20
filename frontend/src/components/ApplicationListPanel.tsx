import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Application, ApplicationStatus } from "@/types/application";
import ApplicationTable from "@/components/application-table/ApplicationTable";

interface Props {
  applications: Application[]; // already filtered + paginated
  totalCount: number; // total after filtering (for "viser X av Y")
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

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-800/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <h2 className="text-base font-semibold text-slate-100 sm:text-lg">
          Søknadsliste
        </h2>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Søk i søknader"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-slate-700/80 bg-slate-950/70 pl-9 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <ApplicationTable
          applications={applications}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-800/60 px-4 py-3 sm:px-6">
        <p className="text-xs text-slate-500">
          Viser {from}–{to} av {totalCount} søknader
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>
          <span className="text-xs text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
