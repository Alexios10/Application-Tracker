import { useState } from "react";
import { Application, ApplicationStatus } from "@/types/application";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddApplicationDialogProps {
  onAdd: (app: Omit<Application, "id">) => void;
}

const statuses: ApplicationStatus[] = [
  "Sendt", "Avslag", "Mulig avslag", "Avslag etter test", "Lagt ut på nytt", "Intervju", "Tilbud"
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Legg til søknad
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ny søknad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Bedrift</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Bedriftsnavn" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Stilling</Label>
            <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Stillingstittel" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Dato sendt</Label>
            <Input id="date" value={dateSent} onChange={(e) => setDateSent(e.target.value)} placeholder="DD.MM.ÅÅ" required />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">Legg til</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddApplicationDialog;
