import { ApplicationStatus } from "@/types/application";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  "Sendt": {
    label: "Sendt",
    className: "bg-status-pending text-status-pending-foreground",
  },
  "Avslag": {
    label: "Avslag",
    className: "bg-status-rejected text-status-rejected-foreground",
  },
  "Mulig avslag": {
    label: "Mulig avslag",
    className: "bg-status-warning text-status-warning-foreground",
  },
  "Avslag etter test": {
    label: "Avslag etter test",
    className: "bg-status-rejected text-status-rejected-foreground",
  },
  "Lagt ut på nytt": {
    label: "Lagt ut på nytt",
    className: "bg-status-info text-status-info-foreground",
  },
  "Intervju": {
    label: "Intervju",
    className: "bg-status-success text-status-success-foreground",
  },
  "Tilbud": {
    label: "Tilbud",
    className: "bg-status-success text-status-success-foreground",
  },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
