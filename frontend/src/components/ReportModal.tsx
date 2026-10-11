import { getErrorMessage } from "@/lib/utils";
import { API_BASE } from "@/lib/api";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/useAuth";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ open, onClose }) => {
  const { authFetch } = useAuth();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Start with an empty form each time the dialog is opened
  useEffect(() => {
    if (open) {
      setSuccess(false);
      setError("");
    }
  }, [open]);

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
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rapporter et problem</DialogTitle>
          <DialogDescription>
            Fant du en feil, eller savner du noe? Beskriv det her, så ser jeg på
            det.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="space-y-4">
            <p>Takk! Rapporten er sendt.</p>
            <div className="flex justify-end">
              <Button onClick={onClose}>Lukk</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="report-subject">Emne</Label>
              <Input
                id="report-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="report-description">Beskrivelse</Label>
              <Textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                maxLength={5000}
                rows={5}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sender..." : "Send rapport"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
