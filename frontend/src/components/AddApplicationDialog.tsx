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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [dateSent, setDateSent] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<ApplicationStatus>("Sendt");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position || !dateSent) return;
    onAdd({
      company,
      position,
      dateSent: format(dateSent, "dd.MM.yy"),
      status,
    });
    setCompany("");
    setPosition("");
    setDateSent(undefined);
    setStatus("Sendt");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" />
          Legg til søknad
        </Button>
      </DialogTrigger>
      <DialogContent className="border border-slate-800/70 bg-[#10121a] p-6 rounded-2xl shadow-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100 text-lg font-semibold">
            Ny søknad
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label
              htmlFor="company"
              className="text-slate-400 text-xs font-semibold uppercase tracking-wider"
            >
              Bedrift
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Bedriftsnavn"
              required
              maxLength={200}
              className="rounded-lg border border-slate-700/80 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="position"
              className="text-slate-400 text-xs font-semibold uppercase tracking-wider"
            >
              Stilling
            </Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Stillingstittel"
              required
              maxLength={200}
              className="rounded-lg border border-slate-700/80 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Dato sendt
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={
                    "w-full justify-start text-left font-normal rounded-lg border border-slate-700/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" +
                    (!dateSent ? " text-slate-500" : "")
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateSent ? format(dateSent, "dd.MM.yyyy") : "Velg dato"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-800 border-slate-700">
                <Calendar
                  mode="single"
                  selected={dateSent}
                  onSelect={(date) => {
                    setDateSent(date ?? undefined);
                    if (date) setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ApplicationStatus)}
            >
              <SelectTrigger className="rounded-lg border border-slate-700/80 bg-slate-900/80 text-slate-100 focus:ring-cyan-500">
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
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-semibold hover:opacity-90 transition-opacity mt-2"
          >
            Legg til
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddApplicationDialog;
