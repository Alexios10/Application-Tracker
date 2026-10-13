import { Application } from "@/types/application";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ExternalLink } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { isSafeUrl } from "@/lib/applications";
import { EditableTextSection } from "./EditableTextSection";

interface ApplicationDetailsModalProps {
  open: boolean;
  application: Application | null;
  onClose: () => void;
  onSave: (updated: Application) => void;
}

export function ApplicationDetailsModal({
  open,
  application,
  onClose,
  onSave,
}: ApplicationDetailsModalProps) {
  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
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

        <EditableTextSection
          key={`note-${application.id}`}
          id="application-note"
          label="Notat"
          value={application.note}
          maxLength={1000}
          placeholder="F.eks. hvem du snakket med, eller når du bør følge opp"
          emptyText="Ingen notat ennå."
          addLabel="Legg til notat"
          editLabel="Endre notat"
          saveLabel="Lagre notat"
          deleteLabel="Slett notat"
          onSave={(note) => onSave({ ...application, note })}
        />

        <EditableTextSection
          key={`cover-letter-${application.id}`}
          id="application-cover-letter"
          label="Søknaden du sendte"
          value={application.coverLetter}
          maxLength={20000}
          placeholder="Lim inn søknadsteksten du sendte, så har du den klar til intervjuet"
          emptyText="Ingen søknadstekst lagret ennå."
          addLabel="Legg til søknadstekst"
          editLabel="Endre søknadstekst"
          saveLabel="Lagre søknadstekst"
          deleteLabel="Slett søknadstekst"
          onSave={(coverLetter) => onSave({ ...application, coverLetter })}
          large
        />
      </DialogContent>
    </Dialog>
  );
}
