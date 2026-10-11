import { useState } from "react";
import { format, parse } from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Application, ApplicationStatus } from "@/types/application";
import { STATUSES } from "@/constants/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";

export type ApplicationFormValues = Omit<Application, "id" | "note">;

interface Props {
  initial?: ApplicationFormValues;
  submitLabel: string;
  onSubmit: (values: ApplicationFormValues) => void;
  onCancel: () => void;
}

// Dates are stored as "dd.MM.yy" (e.g. "02.10.26")
const DATE_FORMAT = "dd.MM.yy";

// Shared form for adding and editing an application
export function ApplicationForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [company, setCompany] = useState(initial?.company ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [dateSent, setDateSent] = useState<Date>(
    initial?.dateSent
      ? parse(initial.dateSent, DATE_FORMAT, new Date())
      : new Date(),
  );
  const [status, setStatus] = useState<ApplicationStatus>(
    initial?.status ?? "Sendt",
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      company: company.trim(),
      position: position.trim(),
      dateSent: format(dateSent, DATE_FORMAT),
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="company">Bedrift</Label>
        <Input
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          maxLength={200}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="position">Stilling</Label>
        <Input
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
          maxLength={200}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Sendt</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {format(dateSent, "d. MMMM yyyy", { locale: nb })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                locale={nb}
                selected={dateSent}
                onSelect={(date) => {
                  if (!date) return;
                  setDateSent(date);
                  setCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as ApplicationStatus)}
          >
            <SelectTrigger>
              <SelectValue />
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
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
