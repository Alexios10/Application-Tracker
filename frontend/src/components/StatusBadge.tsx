import { ApplicationStatus } from "@/types/application";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; badge: string; showDot: boolean; dotColor?: string }
> = {
  Sendt: {
    label: "Sendt",
    badge: "bg-teal-900/50 border border-teal-600/40 text-teal-300",
    showDot: true,
    dotColor: "bg-teal-400",
  },
  Avslag: {
    label: "Avslag",
    badge: "bg-red-900/40 border border-red-600/40 text-red-400",
    showDot: false,
  },
  Intervju: {
    label: "Intervju",
    badge: "bg-blue-900/40 border border-blue-600/40 text-blue-300",
    showDot: false,
  },
  Tilbud: {
    label: "Tilbud",
    badge: "bg-green-900/40 border border-green-600/40 text-green-300",
    showDot: false,
  },
  Ghosted: {
    label: "Ghosted",
    badge: "bg-slate-800/60 border border-slate-600/40 text-slate-400",
    showDot: false,
  },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] ?? statusConfig.Sendt;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-widest ${config.badge}`}
    >
      {config.showDot ? (
        <span className="relative flex h-2 w-2 mr-1">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dotColor}`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${config.dotColor}`}
          />
        </span>
      ) : null}
      {config.label}
    </span>
  );
};

export default StatusBadge;
