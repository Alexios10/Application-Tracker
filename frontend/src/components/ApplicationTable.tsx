import { useState, useRef, useEffect } from "react";
import { Application, ApplicationStatus } from "@/types/application";
import StatusBadge from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ApplicationTableProps {
  applications: Application[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
}

const statuses: ApplicationStatus[] = [
  "Sendt",
  "Avslag",
  "Intervju",
  "Tilbud",
  "Ghosted",
];

const ApplicationTable = ({
  applications,
  onUpdateStatus,
  onDelete,
}: ApplicationTableProps) => {
  // ID på søknaden som har åpen status-dropdown i tabellen (kan bare være én om gangen)
  const [editingId, setEditingId] = useState<string | null>(null);
  const editRef = useRef<HTMLDivElement>(null);

  // Lukk status dropdown når man klikker utenfor
  useEffect(() => {
    if (!editingId) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Hvis vi klikker inne i selve cellen / triggeren, ikke lukk
      if (editRef.current && editRef.current.contains(target)) return;

      // Hvis vi klikker inne i dropdown-menyen, ikke lukk (Radix portal)
      if (target.closest(".status-select-dropdown")) return;

      // Ellers: klikk utenfor -> lukk
      setEditingId(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editingId]);

  return (
    <div className="h-[40rem] w-full overflow-y-scroll overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-xl backdrop-blur lg:w-[44.5rem]">
      <Table className="">
        <TableHeader>
          <TableRow className="bg-slate-900/80">
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              #
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Bedrift
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Stilling
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Dato sendt
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status
            </TableHead>
            <TableHead className="font-semibold w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {applications.map((app, index) => (
            <TableRow
              key={app.id}
              className="group border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 transition-colors"
            >
              <TableCell className="text-xs text-slate-500">
                {index + 1}
              </TableCell>
              <TableCell className="text-sm font-medium text-slate-100">
                {app.company}
              </TableCell>
              <TableCell className="text-sm text-slate-400">
                {app.position}
              </TableCell>
              <TableCell className="text-sm text-slate-400">
                {app.dateSent}
              </TableCell>
              <TableCell className="w-[180px]">
                {editingId === app.id ? (
                  <div
                    ref={editRef}
                    className="flex h-8 w-[160px] items-center"
                  >
                    <Select
                      value={app.status}
                      onValueChange={(v) => {
                        onUpdateStatus(app.id, v as ApplicationStatus);
                        setEditingId(null);
                      }}
                    >
                      <SelectTrigger className="h-7 w-full text-xs border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500">
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
                ) : (
                  <button
                    onClick={() => setEditingId(app.id)}
                    className="flex h-8 w-[160px] cursor-pointer items-center justify-start"
                  >
                    <StatusBadge status={app.status} />
                  </button>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 -ml-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(app.id)}
                >
                  <Trash2 className="h-4 w-4 " />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicationTable;
