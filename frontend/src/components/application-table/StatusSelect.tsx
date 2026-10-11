import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ApplicationStatus } from "@/types/application";
import { STATUSES } from "@/constants/status";
import StatusBadge from "@/components/StatusBadge";

interface Props {
  status: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
}

// Looks like a status badge, but opens a list of statuses when clicked
export const StatusSelect = ({ status, onChange }: Props) => (
  // Stops the click from also opening the application details behind it
  <div onClick={(e) => e.stopPropagation()} className="w-fit">
    <Select
      value={status}
      onValueChange={(v) => onChange(v as ApplicationStatus)}
    >
      <SelectTrigger
        aria-label={`Status: ${status}. Klikk for å endre`}
        className="h-8 w-fit gap-2 border-transparent bg-transparent px-2 shadow-none hover:border-border hover:bg-card"
      >
        <StatusBadge status={status} />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <StatusBadge status={s} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
