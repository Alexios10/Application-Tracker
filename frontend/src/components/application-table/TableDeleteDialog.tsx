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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type DeleteDialogProps = {
  company: string;
  onDelete: () => void;
};

export const DeleteDialog = ({ company, onDelete }: DeleteDialogProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </AlertDialogTrigger>

    <AlertDialogContent className="border-slate-700 bg-slate-900 text-slate-100">
      <AlertDialogHeader>
        <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
        <AlertDialogDescription className="text-slate-400">
          Dette vil slette søknaden til{" "}
          <span className="font-medium text-slate-200">{company}</span>{" "}
          permanent. Denne handlingen kan ikke angres.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700">
          Avbryt
        </AlertDialogCancel>
        <AlertDialogAction
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={onDelete}
        >
          Slett
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
