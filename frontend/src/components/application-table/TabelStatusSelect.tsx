import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationStatus } from "@/types/application";

const statuses: ApplicationStatus[] = [
  "Sendt",
  "Avslag",
  "Intervju",
  "Tilbud",
  "Ghosted",
];

type StatusSelectProps = {
  refProp: React.RefObject<HTMLDivElement>;
  open: boolean;
  status: ApplicationStatus;
  onOpenChange: (open: boolean) => void;
  onValueChange: (v: ApplicationStatus) => void;
};

export const StatusSelect = ({
  refProp,
  open,
  status,
  onOpenChange,
  onValueChange,
}: StatusSelectProps) => (
  <div ref={refProp} className="flex h-8 w-fit items-center">
    <Select
      open={open}
      onOpenChange={onOpenChange}
      value={status}
      onValueChange={(v) => onValueChange(v as ApplicationStatus)}
    >
      <SelectTrigger className="h-7 w-fit text-xs border-slate-700 bg-slate-900 text-slate-100">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="status-select-dropdown border-slate-700 bg-slate-900 text-slate-100">
        {statuses.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
