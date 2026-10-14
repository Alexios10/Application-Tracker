import { useState } from "react";
import {
  CircleHelp,
  Download,
  ListChecks,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Short guide to the main features. Plain content, so it is easy to update when features change.
const STEPS = [
  {
    icon: Plus,
    title: "Legg til en søknad",
    text: "Klikk «Legg til søknad» og fyll inn bedrift, stilling og når du sendte den. Lenke til annonsen, søknadsfrist og søknadsteksten du sendte er valgfritt.",
  },
  {
    icon: ListChecks,
    title: "Oppdater status",
    text: "Når du får svar, bytter du status rett i lista: Sendt, Intervju, Tilbud, Avslag eller Ghosted.",
  },
  {
    icon: MessageSquareText,
    title: "Notat og søknadstekst",
    text: "Klikk på en søknad for å se alt om den. Der kan du skrive notater og lagre eller endre søknadsteksten du sendte. Ikonene i lista viser hvilke søknader som har notat eller søknadstekst.",
  },
  {
    icon: Pencil,
    title: "Endre eller slette",
    text: "Bruk blyanten for å endre en søknad, og søppelbøtta for å slette den.",
  },
  {
    icon: Search,
    title: "Finn fram",
    text: "Søk etter bedrift eller stilling, eller klikk på en status over lista for å bare vise de søknadene.",
  },
  {
    icon: Download,
    title: "Last ned",
    text: "Last ned alle søknadene som Excel-fil eller PDF, eller skriv dem ut, for eksempel til Nav.",
  },
  {
    icon: User,
    title: "Profil og hjelp",
    text: "Klikk på forbokstaven din øverst til høyre for å endre navn eller passord, rapportere et problem eller logge ut.",
  },
];

export function HelpModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Slik bruker du siden"
          title="Slik bruker du siden"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <CircleHelp className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Slik bruker du siden</DialogTitle>
          <DialogDescription>
            Hold oversikt over alle jobbsøknadene dine på ett sted.
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-4">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
