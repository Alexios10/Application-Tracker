import { useState, useRef, useEffect, useCallback } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface ApplicationTableProps {
  applications: Application[];
  onUpdateStatus: (id: number, status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const editRefMobile = useRef<HTMLDivElement>(null);

  // Track screen size to distinguish mobile vs desktop
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Auto-open the Select dropdown when editingId changes (all screen sizes)
  useEffect(() => {
    if (editingId !== null) {
      const timer = setTimeout(() => setSelectOpen(true), 50);
      return () => clearTimeout(timer);
    } else {
      setSelectOpen(false);
    }
  }, [editingId]);

  // Lukk status dropdown når man klikker utenfor
  useEffect(() => {
    if (!editingId) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Hvis vi klikker inne i selve cellen / triggeren, ikke lukk
      if (editRef.current && editRef.current.contains(target)) return;
      if (editRefMobile.current && editRefMobile.current.contains(target))
        return;

      // Hvis vi klikker inne i dropdown-menyen, ikke lukk (Radix portal)
      if (target.closest(".status-select-dropdown")) return;

      // Ellers: klikk utenfor -> lukk
      setEditingId(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editingId]);

  return (
    <div className="h-[40rem] w-full overflow-y-scroll overflow-x-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-xl backdrop-blur">
      {/* Mobile card layout */}
      <div className="flex flex-col divide-y divide-slate-800/80 sm:hidden">
        {applications.map((app, index) => (
          <div
            key={app.id}
            className="group flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-slate-900/80"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs text-slate-500 mr-2">
                  #{index + 1}
                </span>
                <span className="text-sm font-medium text-slate-100">
                  {app.company}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {editingId === app.id ? (
                  <div
                    ref={editRefMobile}
                    className="flex h-8 w-[120px] items-center"
                  >
                    <Select
                      open={isMobile && selectOpen}
                      onOpenChange={(open) => {
                        setSelectOpen(open);
                        if (!open) setEditingId(null);
                      }}
                      value={app.status}
                      onValueChange={(v) => {
                        onUpdateStatus(app.id, v as ApplicationStatus);
                        setSelectOpen(false);
                        setEditingId(null);
                      }}
                    >
                      <SelectTrigger className="h-7 w-full text-xs border-slate-700 bg-slate-900 text-slate-100">
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
                    className="cursor-pointer"
                  >
                    <StatusBadge status={app.status} />
                  </button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-slate-700 bg-slate-900 text-slate-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        Dette vil slette søknaden til{" "}
                        <span className="font-medium text-slate-200">
                          {app.company}
                        </span>{" "}
                        permanent. Denne handlingen kan ikke angres.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700">
                        Avbryt
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onDelete(app.id)}
                      >
                        Slett
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="truncate">{app.position}</span>
              <span className="shrink-0 text-slate-500">·</span>
              <span className="shrink-0">{app.dateSent}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <Table className="hidden sm:table table-fixed w-full">
        <TableHeader>
          <TableRow className="bg-slate-900/80">
            <TableHead className="w-[36px] text-xs font-semibold uppercase tracking-wide text-slate-400">
              #
            </TableHead>
            <TableHead className="w-[22%] text-xs font-semibold uppercase tracking-wide text-slate-400">
              Bedrift
            </TableHead>
            <TableHead className="w-[32%] text-xs font-semibold uppercase tracking-wide text-slate-400">
              Stilling
            </TableHead>
            <TableHead className="w-[18%] text-xs font-semibold uppercase tracking-wide text-slate-400">
              Dato sendt
            </TableHead>
            <TableHead className="w-[16%] text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status
            </TableHead>
            <TableHead className="w-[36px] font-semibold"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {applications.map((app, index) => (
            <TableRow
              key={app.id}
              className="group border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 transition-colors [&>td]:py-4"
            >
              <TableCell className="text-xs text-slate-500">
                {index + 1}
              </TableCell>
              <TableCell className="text-sm font-medium text-slate-100">
                <span className="line-clamp-2 break-words">{app.company}</span>
              </TableCell>
              <TableCell className="text-sm text-slate-400">
                <span className="line-clamp-2 break-words">{app.position}</span>
              </TableCell>
              <TableCell className="text-sm text-slate-400 whitespace-nowrap">
                {app.dateSent}
              </TableCell>
              <TableCell>
                {editingId === app.id ? (
                  <div ref={editRef} className="flex h-8 w-full items-center">
                    <Select
                      open={!isMobile && selectOpen}
                      onOpenChange={(open) => {
                        setSelectOpen(open);
                        if (!open) setEditingId(null);
                      }}
                      value={app.status}
                      onValueChange={(v) => {
                        onUpdateStatus(app.id, v as ApplicationStatus);
                        setSelectOpen(false);
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
                    className="flex h-8 w-full cursor-pointer items-center justify-start"
                  >
                    <StatusBadge status={app.status} />
                  </button>
                )}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 -ml-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-slate-700 bg-slate-900 text-slate-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        Dette vil slette søknaden til{" "}
                        <span className="font-medium text-slate-200">
                          {app.company}
                        </span>{" "}
                        permanent. Denne handlingen kan ikke angres.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700">
                        Avbryt
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onDelete(app.id)}
                      >
                        Slett
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicationTable;
