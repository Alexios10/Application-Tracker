import { useState, useMemo, useEffect } from "react";
import { Application, ApplicationStatus } from "@/types/application";
import { StatFilter } from "@/constants/stats";

const ITEMS_PER_PAGE = 10;

// This hook owns all filtering, searching and pagination logic.
// Separating it keeps Index.tsx clean and makes this easy to test in isolation.
export function useFilteredApplications(applications: Application[]) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatFilter>("all");
  const [page, setPage] = useState(1);

  // Reset til første side ved endring i søk eller filter, for å unngå "ingen resultater"
  // når man er på en høyere side enn det nye resultatsettet har.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filtered = useMemo(() => {
    let result = applications;

    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.company.toLowerCase().startsWith(q) ||
          a.position?.toLowerCase().includes(q),
      );
    }

    return [...result].sort((a, b) => {
      const toDate = (d: string) => {
        const [day, month, year] = d.split(".").map(Number);
        return new Date(2000 + year, month - 1, day).getTime();
      };
      return toDate(b.dateSent) - toDate(a.dateSent);
    });
  }, [applications, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    filtered,
    paginated,
  };
}
