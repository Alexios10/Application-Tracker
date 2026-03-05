import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Application, ApplicationStatus } from "@/types/application";

interface EditApplicationModalProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
  onSave: (updated: Application) => void;
}

const statuses: ApplicationStatus[] = [
  "Sendt",
  "Avslag",
  "Intervju",
  "Tilbud",
  "Ghosted",
];

export const EditApplicationModal: React.FC<EditApplicationModalProps> = ({
  open,
  onClose,
  application,
  onSave,
}) => {
  const [company, setCompany] = useState(application?.company || "");
  const [position, setPosition] = useState(application?.position || "");
  const [dateSent, setDateSent] = useState(application?.dateSent || "");
  const [status, setStatus] = useState<ApplicationStatus>(
    application?.status || "Sendt",
  );

  // Oppdater felter hvis application endres
  React.useEffect(() => {
    setCompany(application?.company || "");
    setPosition(application?.position || "");
    setDateSent(application?.dateSent || "");
    setStatus(application?.status || "Sendt");
  }, [application]);

  if (!application) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...application, company, position, dateSent, status });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideClose
        className="border border-slate-800/70 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-slate-950/95 p-6 rounded-3xl shadow-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Bedrift"
            required
            maxLength={200}
            className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100"
          />
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Stilling"
            required
            maxLength={200}
            className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100"
          />
          <Input
            value={dateSent}
            onChange={(e) => setDateSent(e.target.value)}
            placeholder="Dato sendt"
            required
            maxLength={20}
            className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100"
          />
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ApplicationStatus)}
            >
              <SelectTrigger className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100 focus:ring-sky-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border border-slate-700 bg-slate-900 text-slate-100">
                {statuses.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="text-slate-100 focus:bg-slate-800 focus:text-slate-50"
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              className="bg-sky-900 text-sky-200 hover:bg-sky-700"
            >
              Lagre
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
