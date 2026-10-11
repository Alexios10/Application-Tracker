import { Application } from "@/types/application";
import { STATUSES, STATUS_DOT, StatFilter } from "@/constants/status";

interface Props {
  applications: Application[];
  activeFilter: StatFilter;
  onFilterChange: (filter: StatFilter) => void;
}

// One bar split by status, so the user can see at a glance where their applications stand.
// The counts below the bar also work as filters for the list.
export function StatusOverview({
  applications,
  activeFilter,
  onFilterChange,
}: Props) {
  const total = applications.length;
  const counts = STATUSES.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  return (
    <section aria-label="Status på søknadene">
      <div className="flex h-3 w-full gap-[3px] overflow-hidden rounded-full bg-secondary">
        {total > 0 &&
          counts
            .filter(({ count }) => count > 0)
            .map(({ status, count }) => (
              <div
                key={status}
                className={`h-full transition-[width,opacity] duration-300 ease-out ${STATUS_DOT[status]} ${
                  activeFilter !== "all" && activeFilter !== status
                    ? "opacity-25"
                    : ""
                }`}
                style={{ width: `${(count / total) * 100}%` }}
                title={`${status}: ${count}`}
              />
            ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-1 gap-y-2">
        {counts.map(({ status, count }) => {
          const isActive = activeFilter === status;
          return (
            <button
              key={status}
              onClick={() => onFilterChange(isActive ? "all" : status)}
              aria-pressed={isActive}
              className={`flex items-baseline gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                isActive
                  ? "bg-foreground text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 self-center rounded-full ${STATUS_DOT[status]}`}
              />
              <span>{status}</span>
              <span
                className={`tabular font-semibold ${isActive ? "" : "text-foreground"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
        {activeFilter !== "all" && (
          <button
            onClick={() => onFilterChange("all")}
            className="rounded-md px-2.5 py-1.5 text-sm text-link underline-offset-4 hover:underline"
          >
            Vis alle
          </button>
        )}
      </div>
    </section>
  );
}
