import {
  Send,
  XCircle,
  Clock,
  Ghost,
  CalendarCheck,
  Trophy,
} from "lucide-react";

type StatsCardKey =
  | "total"
  | "rejected"
  | "pending"
  | "interview"
  | "offer"
  | "ghosted";

interface StatsCardsProps {
  total: number;
  rejected: number;
  pending: number;
  interview: number;
  offer: number;
  ghosted: number;
  selectedCard?: StatsCardKey;
  onCardClick?: (card: StatsCardKey) => void;
}

const StatsCards = ({
  total,
  rejected,
  pending,
  interview,
  offer,
  ghosted,
  selectedCard,
  onCardClick,
}: StatsCardsProps) => {
  return (
    <div className="grid gap-4 grid-cols-2">
      <div
        className={`relative flex justify-between overflow-hidden rounded-2xl border bg-gradient-to-br from-sky-500/80 via-emerald-400/80 to-sky-500/70 p-5 text-slate-950 shadow-xl cursor-pointer transition-transform hover:scale-[1.01] ${selectedCard === "total" ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-emerald-300" : "border-sky-500/30"}`}
        onClick={() => onCardClick?.("total")}
        aria-label="Vis alle søknader"
      >
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-900/80">
              Sendt
            </p>
            <p className="mt-2 text-3xl font-semibold">{total}</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <Send className="h-6 w-6 text-slate-900/70" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <div
        className={`rounded-2xl flex border bg-gradient-to-br from-red-500/10 via-slate-900/40 to-slate-900/70 p-5 text-slate-100 shadow-lg cursor-pointer transition-transform hover:scale-[1.01] ${selectedCard === "rejected" ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-red-400" : "border-red-500/25"}`}
        onClick={() => onCardClick?.("rejected")}
        aria-label="Vis avslagne søknader"
      >
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-300/90">
              Avslag
            </p>
            <p className="mt-2 text-3xl font-semibold text-red-300">
              {rejected}
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <XCircle className="h-6 w-6 text-red-300" />
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl flex border bg-gradient-to-br from-amber-400/15 via-slate-900/40 to-slate-900/70 p-5 text-slate-100 shadow-lg cursor-pointer transition-transform hover:scale-[1.01] ${selectedCard === "pending" ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-amber-300" : "border-amber-400/25"}`}
        onClick={() => onCardClick?.("pending")}
        aria-label="Vis søknader som venter svar"
      >
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-200/90">
              Venter
            </p>
            <p className="mt-2 text-3xl font-semibold text-amber-100">
              {pending}
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <Clock className="h-6 w-6 text-amber-200" />
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl flex border bg-gradient-to-br from-emerald-500/15 via-slate-900/40 to-slate-900/70 p-5 text-slate-100 shadow-lg cursor-pointer transition-transform hover:scale-[1.01] ${selectedCard === "interview" ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-emerald-400" : "border-emerald-500/25"}`}
        onClick={() => onCardClick?.("interview")}
        aria-label="Vis søknader med intervju"
      >
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/90">
              Intervju
            </p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">
              {interview}
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <CalendarCheck className="h-6 w-6 text-emerald-300" />
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl flex border bg-gradient-to-br from-teal-400/15 via-slate-900/40 to-slate-900/70 p-5 text-slate-100 shadow-lg cursor-pointer transition-transform hover:scale-[1.01] ${selectedCard === "offer" ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-teal-300" : "border-teal-400/25"}`}
        onClick={() => onCardClick?.("offer")}
        aria-label="Vis søknader med tilbud"
      >
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-teal-300/90">
              Tilbud
            </p>
            <p className="mt-2 text-3xl font-semibold text-teal-300">{offer}</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <Trophy className="h-6 w-6 text-teal-300" />
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl flex border bg-gradient-to-br from-purple-500/15 via-slate-900/40 to-slate-900/70 p-5 text-slate-100 shadow-lg cursor-pointer transition-transform hover:scale-[1.01] ${selectedCard === "ghosted" ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-purple-400" : "border-purple-500/25"}`}
        onClick={() => onCardClick?.("ghosted")}
        aria-label="Vis ghostede søknader"
      >
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-300/90">
              Ghosted
            </p>
            <p className="mt-2 text-3xl font-semibold text-purple-300">
              {ghosted}
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <Ghost className="h-6 w-6 text-purple-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
