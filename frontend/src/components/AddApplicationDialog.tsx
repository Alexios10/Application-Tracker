import { useState } from "react";
import { Application, ApplicationStatus } from "@/types/application";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddApplicationDialogProps {
  onAdd: (app: Omit<Application, "id">) => void;
}

const statuses: ApplicationStatus[] = [
  "Sendt",
  "Avslag",
  "Intervju",
  "Tilbud",
  "Ghosted",
];

const AddApplicationDialog = ({ onAdd }: AddApplicationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [dateSent, setDateSent] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Sendt");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position || !dateSent) return;
    onAdd({ company, position, dateSent, status });
    setCompany("");
    setPosition("");
    setDateSent("");
    setStatus("Sendt");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-sky-500 to-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 hover:from-sky-400 hover:to-emerald-300">
          <Plus className="mr-2 h-4 w-4" />
          Legg til søknad
        </Button>
      </DialogTrigger>
      <DialogContent className="border border-slate-800/70 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-slate-950/95 p-6 rounded-3xl shadow-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100 text-lg font-semibold">
            Ny søknad
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-slate-300 text-sm">
              Bedrift
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Bedriftsnavn"
              required
              className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position" className="text-slate-300 text-sm">
              Stilling
            </Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Stillingstittel"
              required
              className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date" className="text-slate-300 text-sm">
              Dato sendt
            </Label>
            <Input
              id="date"
              value={dateSent}
              onChange={(e) => setDateSent(e.target.value)}
              placeholder="DD.MM.ÅÅ"
              required
              className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-400"
            />
          </div>
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
          <Button
            type="submit"
            className="w-full bg-sky-900 text-sky-200 hover:bg-sky-700 font-medium"
          >
            Legg til
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddApplicationDialog;
