import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api";
import { Application, ApplicationStatus } from "@/types/application";
import { useAuth } from "@/hooks/useAuth";

const JSON_HEADERS = { "Content-Type": "application/json" };

// This hook owns all data fetching and mutation logic for applications.
// React Query keeps one shared copy of the list, so every page that calls
// this hook reuses the same data instead of fetching it again.
export function useApplications() {
  const { user, authFetch } = useAuth();
  const queryClient = useQueryClient();

  // The username is part of the key, so a different user never sees cached data from the previous one
  const queryKey = ["applications", user?.username];

  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async (): Promise<Application[]> => {
      const res = await authFetch(`${API_BASE}/api/applications`, {
        headers: JSON_HEADERS,
      });
      if (!res.ok) throw new Error("Kunne ikke hente søknadene.");
      return res.json();
    },
  });

  // Updates the cached list directly, so we don't need to fetch everything again after a change
  function updateCache(change: (current: Application[]) => Application[]) {
    queryClient.setQueryData<Application[]>(queryKey, (current = []) =>
      change(current),
    );
  }

  async function addApplication(app: Omit<Application, "id">) {
    try {
      const res = await authFetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(app),
      });
      if (!res.ok) throw new Error();
      const created: Application = await res.json();
      updateCache((current) => [created, ...current]);
    } catch {
      toast.error("Kunne ikke legge til søknaden.");
    }
  }

  async function updateApplication(updated: Application) {
    try {
      const res = await authFetch(`${API_BASE}/api/applications/${updated.id}`, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      updateCache((current) =>
        current.map((a) => (a.id === updated.id ? updated : a)),
      );
    } catch {
      toast.error("Kunne ikke lagre endringen.");
    }
  }

  async function updateStatus(id: number, status: ApplicationStatus) {
    const existing = applications.find((a) => a.id === id);
    if (!existing) return;
    await updateApplication({ ...existing, status });
  }

  async function deleteApplication(id: number) {
    try {
      const res = await authFetch(`${API_BASE}/api/applications/${id}`, {
        method: "DELETE",
        headers: JSON_HEADERS,
      });
      if (!res.ok) throw new Error();
      updateCache((current) => current.filter((a) => a.id !== id));
    } catch {
      toast.error("Kunne ikke slette søknaden.");
    }
  }

  return {
    applications,
    isLoading,
    isError,
    addApplication,
    updateApplication,
    updateStatus,
    deleteApplication,
  };
}
