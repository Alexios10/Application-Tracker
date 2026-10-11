import { ApplicationStatus } from "@/types/application";
import { STATUS_DOT } from "@/constants/status";

// Read-only status: a colored dot and the status name
const StatusBadge = ({ status }: { status: ApplicationStatus }) => (
  <span className="inline-flex items-center gap-2 text-sm">
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[status]}`}
    />
    {status}
  </span>
);

export default StatusBadge;
