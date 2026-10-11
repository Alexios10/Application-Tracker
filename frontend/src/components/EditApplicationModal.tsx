import { Application } from "@/types/application";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApplicationForm } from "@/components/ApplicationForm";

interface Props {
  open: boolean;
  onClose: () => void;
  application: Application | null;
  onSave: (updated: Application) => void;
}

export function EditApplicationModal({
  open,
  onClose,
  application,
  onSave,
}: Props) {
  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Endre søknad</DialogTitle>
        </DialogHeader>
        {/* The key gives the form fresh values when another application is opened */}
        <ApplicationForm
          key={application.id}
          initial={application}
          submitLabel="Lagre endringer"
          onCancel={onClose}
          onSubmit={(values) => onSave({ ...application, ...values })}
        />
      </DialogContent>
    </Dialog>
  );
}
