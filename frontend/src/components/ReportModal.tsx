import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/useAuth";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ open, onClose }) => {
  const { user, authFetch } = useAuth();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = (
    import.meta.env.VITE_API_BASE ?? "http://localhost:5242"
  ).replace(/\/+$/, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await authFetch(`${API_BASE}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, description }),
      });
      if (!res.ok) throw new Error("Noe gikk galt. Prøv igjen.");
      setSuccess(true);
      setSubject("");
      setDescription("");
    } catch (err: any) {
      setError(err.message || "Ukjent feil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideClose
        className="border border-slate-800/70 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-slate-950/95 p-6 rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.9)]"
      >
        {success ? (
          <div className="text-green-400 font-medium text-center py-6">
            Takk for tilbakemeldingen!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              placeholder="Emne"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={200}
              className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100 focus-visible:ring-2 focus-visible:ring-sky-400"
            />
            <textarea
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100 focus-visible:ring-2 focus-visible:ring-sky-400 min-h-[100px]"
              placeholder="Beskrivelse"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={5000}
              rows={4}
            />
            {error && (
              <div className="text-red-400 font-medium text-center">
                {error}
              </div>
            )}
            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-sky-900 text-sky-200 hover:bg-sky-700"
              >
                {loading ? "Sender..." : "Send inn"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
