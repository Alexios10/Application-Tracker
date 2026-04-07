import { useState, useEffect } from "react";
import { Application, ApplicationStatus } from "@/types/application";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
).replace(/\/+$/, "");

const JSON_HEADERS = { "Content-Type": "application/json" };

// This hook owns all data fetching and mutation logic.
// Components just call these functions — they don't care about fetch/API details.
export function useApplications() {
  const { user, authFetch } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch(`${API_BASE}/api/applications`, {
          headers: JSON_HEADERS,
        });
        if (!res.ok) return;
        const data: Application[] = await res.json();
        setApplications(data);
      } catch (err) {
        console.error("Failed to load applications", err);
      }
    }
    load();
  }, [user]);

  async function addApplication(app: Omit<Application, "id">) {
    try {
      const res = await authFetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(app),
      });
      if (!res.ok) return;
      const created: Application = await res.json();
      setApplications((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Failed to add application", err);
    }
  }

  async function updateApplication(updated: Application) {
    try {
      const res = await authFetch(
        `${API_BASE}/api/applications/${updated.id}`,
        {
          method: "PUT",
          headers: JSON_HEADERS,
          body: JSON.stringify(updated),
        },
      );
      if (!res.ok) return;
      setApplications((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
    } catch (err) {
      console.error("Failed to update application", err);
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
      if (!res.ok) return;
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete application", err);
    }
  }

  return {
    applications,
    addApplication,
    updateApplication,
    updateStatus,
    deleteApplication,
  };
}
