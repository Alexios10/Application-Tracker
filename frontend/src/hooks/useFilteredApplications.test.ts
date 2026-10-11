import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilteredApplications } from "./useFilteredApplications";
import { Application, ApplicationStatus } from "@/types/application";

// Small helper so each test only has to describe the fields it cares about
function app(
  id: number,
  company: string,
  dateSent: string,
  status: ApplicationStatus = "Sendt",
  position = "Utvikler",
): Application {
  return { id, company, position, dateSent, status };
}

describe("useFilteredApplications", () => {
  it("sorts the newest application first", () => {
    const apps = [
      app(1, "Gammel AS", "01.01.26"),
      app(2, "Ny AS", "10.10.26"),
      app(3, "Midt AS", "15.05.26"),
    ];

    const { result } = renderHook(() => useFilteredApplications(apps));

    expect(result.current.filtered.map((a) => a.company)).toEqual([
      "Ny AS",
      "Midt AS",
      "Gammel AS",
    ]);
  });

  it("filters by status", () => {
    const apps = [
      app(1, "A", "01.01.26", "Sendt"),
      app(2, "B", "02.01.26", "Intervju"),
      app(3, "C", "03.01.26", "Intervju"),
    ];

    const { result } = renderHook(() => useFilteredApplications(apps));
    act(() => result.current.setStatusFilter("Intervju"));

    expect(result.current.filtered.map((a) => a.id)).toEqual([3, 2]);
  });

  it("searches company names from the start and positions anywhere, ignoring case", () => {
    const apps = [
      app(1, "Equinor", "01.01.26", "Sendt", "Frontend"),
      app(2, "DNB", "02.01.26", "Sendt", "Equinor-konsulent"),
      app(3, "Telenor", "03.01.26", "Sendt", "Backend"),
    ];

    const { result } = renderHook(() => useFilteredApplications(apps));
    // Company name must start with the search text
    act(() => result.current.setSearch("TEL"));
    expect(result.current.filtered.map((a) => a.id)).toEqual([3]);

    // "nor" is at the end of Equinor and Telenor, so only the position "Equinor-konsulent" matches
    act(() => result.current.setSearch("nor"));
    expect(result.current.filtered.map((a) => a.id)).toEqual([2]);
  });

  it("shows 10 applications per page", () => {
    const apps = Array.from({ length: 25 }, (_, i) =>
      app(i + 1, `Firma ${i + 1}`, "01.01.26"),
    );

    const { result } = renderHook(() => useFilteredApplications(apps));

    expect(result.current.totalPages).toBe(3);
    expect(result.current.paginated).toHaveLength(10);

    act(() => result.current.setPage(3));
    expect(result.current.paginated).toHaveLength(5);
  });

  it("goes back to page 1 when the search changes", () => {
    const apps = Array.from({ length: 25 }, (_, i) =>
      app(i + 1, `Firma ${i + 1}`, "01.01.26"),
    );

    const { result } = renderHook(() => useFilteredApplications(apps));
    act(() => result.current.setPage(3));
    act(() => result.current.setSearch("Firma"));

    expect(result.current.page).toBe(1);
  });
});
