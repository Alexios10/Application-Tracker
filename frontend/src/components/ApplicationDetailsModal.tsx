import React, { useEffect, useState } from "react";
import { Application } from "@/types/application";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import StatusBadge from "./StatusBadge";

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
      <DialogContent className="border border-slate-800/70 bg-slate-950 p-6 text-slate-100 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-50">
              {application.company}
            </DialogTitle>
          </DialogHeader>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-slate-500">Stilling</dt>
              <dd className="mt-1 text-slate-200">{application.position}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Dato sendt</dt>
              <dd className="mt-1 text-slate-200">{application.dateSent}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase text-slate-500">Status</dt>
              <dd className="mt-2">
                <StatusBadge status={application.status} />
              </dd>
            </div>
          </dl>

          {hasNote && !isEditingNote && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase text-slate-500">Notat</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                {savedNote}
              </p>
            </div>
          )}

          {!isEditingNote && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setIsEditingNote(true)}
                className="bg-sky-900 text-sky-200 hover:bg-sky-700"
              >
                {hasNote ? "Endre notat" : "Legg til notat"}
              </Button>
              {hasNote && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDeleteNote}
                  className="bg-slate-900/80 text-red-300 hover:bg-red-950/40 hover:text-red-200"
                >
                  Slett notat
                </Button>
              )}
            </div>
          )}

          {isEditingNote && (
            <div className="space-y-2">
              <Label
                htmlFor="application-note"
                className="text-sm text-slate-300"
              >
                Notat
              </Label>
              <Textarea
                id="application-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Skriv et notat"
                maxLength={1000}
                className="min-h-32 resize-none border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500"
              />
            </div>
          )}

          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={isEditingNote ? () => setIsEditingNote(false) : onClose}
              className="bg-slate-900/80 text-slate-200 hover:bg-slate-800"
            >
              {isEditingNote ? "Avbryt" : "Lukk"}
            </Button>
            {isEditingNote && (
              <Button
                type="submit"
                className="bg-sky-900 text-sky-200 hover:bg-sky-700"
              >
                Lagre notat
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
