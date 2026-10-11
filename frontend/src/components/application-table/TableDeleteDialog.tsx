import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

type DeleteDialogProps = {
  company: string;
  onDelete: () => void;
};

export const DeleteDialog = ({ company, onDelete }: DeleteDialogProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <button
        aria-label={`Slett søknaden til ${company}`}
        title="Slett søknad"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </AlertDialogTrigger>

    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Slette søknaden til {company}?</AlertDialogTitle>
        <AlertDialogDescription>
          Søknaden og notatet blir slettet for godt. Dette kan ikke angres.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Avbryt</AlertDialogCancel>
        <AlertDialogAction
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={onDelete}
        >
          Slett søknad
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
