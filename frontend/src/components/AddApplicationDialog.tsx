import { useState } from "react";
import { Plus } from "lucide-react";
import { Application } from "@/types/application";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApplicationForm } from "@/components/ApplicationForm";

interface Props {
  onAdd: (app: Omit<Application, "id">) => void;
}

const AddApplicationDialog = ({ onAdd }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" />
          Legg til søknad
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ny søknad</DialogTitle>
        </DialogHeader>
        <ApplicationForm
          submitLabel="Legg til søknad"
          onCancel={() => setOpen(false)}
          onSubmit={(values) => {
            onAdd(values);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddApplicationDialog;
