import React, { useEffect, useState } from "react";
import { Application } from "@/types/application";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ExternalLink } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { isSafeUrl } from "@/lib/applications";

interface ApplicationDetailsModalProps {
  open: boolean;
  application: Application | null;
  onClose: () => void;
  onSaveNote: (updated: Application) => void;
}

export function ApplicationDetailsModal({
  open,
  application,
  onClose,
  onSaveNote,
}: ApplicationDetailsModalProps) {
  const [note, setNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);

  useEffect(() => {
    setNote(application?.note ?? "");
    setIsEditingNote(false);
  }, [application]);

  if (!application) return null;

  const savedNote = application.note?.trim() ?? "";
  const hasNote = savedNote.length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSaveNote({ ...application, note: note.trim() });
    setIsEditingNote(false);
  };

  const handleDeleteNote = () => {
    setNote("");
    setIsEditingNote(false);
    onSaveNote({ ...application, note: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{application.company}</DialogTitle>
          <DialogDescription>{application.position}</DialogDescription>
        </DialogHeader>

        <dl className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Sendt</dt>
            <dd className="mt-0.5">{application.dateSent}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-0.5">
              <StatusBadge status={application.status} />
            </dd>
          </div>
          {application.deadline && (
            <div>
              <dt className="text-muted-foreground">Søknadsfrist</dt>
              <dd className="mt-0.5">{application.deadline}</dd>
            </div>
          )}
        </dl>

        {isSafeUrl(application.jobUrl) && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-link underline-offset-4 hover:underline"
          >
            Åpne annonsen
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
          {isEditingNote ? (
            <>
              <Label htmlFor="application-note">Notat</Label>
              <Textarea
                id="application-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="F.eks. hvem du snakket med, eller når du bør følge opp"
                maxLength={1000}
                className="min-h-32 resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditingNote(false)}
                >
                  Avbryt
                </Button>
                <Button type="submit">Lagre notat</Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Notat</p>
              {hasNote ? (
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {savedNote}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ingen notat ennå.
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingNote(true)}
                >
                  {hasNote ? "Endre notat" : "Legg til notat"}
                </Button>
                {hasNote && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleDeleteNote}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    Slett notat
                  </Button>
                )}
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
