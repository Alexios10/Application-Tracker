import { Send, XCircle, Clock } from "lucide-react";

interface StatsCardsProps {
  total: number;
  rejected: number;
  pending: number;
}

const StatsCards = ({ total, rejected, pending }: StatsCardsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="relative flex justify-between overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/80 via-emerald-400/80 to-sky-500/70 p-5 text-slate-950 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-900/80">
              Sendt
            </p>
            <p className="mt-2 text-3xl font-semibold">{total}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl">
            <Send className="h-6 w-6 text-slate-900/70" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <div className="rounded-2xl flex border border-red-500/25 bg-gradient-to-br from-red-500/10 via-slate-900/40 to-slate-900/70 p-5 text-slate-100 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-300/90">
              Avslag
            </p>
            <p className="mt-2 text-3xl font-semibold text-red-300">
              {rejected}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl">
            <XCircle className="h-6 w-6 text-red-300" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl flex border border-amber-400/25 bg-gradient-to-br from-amber-400/15 via-slate-900/40 to-slate-900/70 p-5 text-slate-100 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-200/90">
              Venter
            </p>
            <p className="mt-2 text-3xl font-semibold text-amber-100">
              {pending}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl">
            <Clock className="h-6 w-6 text-amber-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
