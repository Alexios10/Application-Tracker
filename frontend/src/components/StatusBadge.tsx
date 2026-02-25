import { ApplicationStatus } from "@/types/application";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  Sendt: {
    label: "Sendt",
    className: "bg-status-pending text-status-pending-foreground",
  },
  Avslag: {
    label: "Avslag",
    className: "bg-status-rejected text-status-rejected-foreground",
  },

  Intervju: {
    label: "Intervju",
    className: "bg-status-success text-status-success-foreground",
  },
  Tilbud: {
    label: "Tilbud",
    className: "bg-status-success text-status-success-foreground",
  },
  Ghosted: {
    label: "Ghosted",
    className: "bg-status-ghosted text-status-ghosted-foreground",
  },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] ?? statusConfig.Sendt;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
