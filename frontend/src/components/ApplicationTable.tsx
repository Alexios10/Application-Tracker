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
import { Pencil } from "lucide-react";
import { EditApplicationModal } from "./EditApplicationModal";

interface ApplicationTableProps {
  applications: Application[];
  onUpdateStatus: (id: number, status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
  onEdit?: (app: Application) => void;
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
  onEdit,
}: ApplicationTableProps) => {
  // ID på søknaden som har åpen status-dropdown i tabellen (kan bare være én om gangen)
  const [editingId, setEditingId] = useState<number | null>(null);
  // Modal for redigering
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
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
    <div className="h-[40rem] w-full overflow-y-auto rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-xl backdrop-blur">
      {/* Modal for endring */}
      <EditApplicationModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        application={editApp}
        onSave={(updated) => {
          setEditModalOpen(false);
          setEditApp(null);
          if (updated && updated.id && typeof onEdit === "function") {
            onEdit(updated);
          }
        }}
      />
      {/* Mobile card layout */}
      <div className="flex flex-col divide-y divide-slate-800/80 sm:hidden">
        {applications.map((app, index) => (
          <div
            key={app.id}
            className="group flex flex-col gap-2 px-4 py-4 bg-slate-900/60 rounded-xl m-2 shadow-md transition-colors hover:bg-slate-900/80"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs text-slate-500 mr-2">
                  #{index + 1}
                </span>
                <span className="text-base font-semibold text-slate-100">
                  {app.company}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-sky-400 hover:text-sky-300 hover:bg-sky-900/10"
                  onClick={() => {
                    setEditApp(app);
                    setEditModalOpen(true);
                  }}
                  title="Endre søknad"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-5 w-5" />
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
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-2">
              <span className="truncate max-w-[120px]">{app.position}</span>
              <span className="shrink-0 text-slate-500">·</span>
              <span className="shrink-0">{app.dateSent}</span>
              <span className="shrink-0">·</span>
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
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <Table className="min-w-[700px] w-full table-fixed">
          <TableHeader>
            <TableRow className="bg-slate-900/80">
              <TableHead className="w-[36px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                #
              </TableHead>
              <TableHead className="w-[22%] text-xs font-semibold uppercase tracking-wide text-slate-400">
                Bedrift
              </TableHead>
              <TableHead className="w-[28%] text-xs font-semibold uppercase tracking-wide text-slate-400">
                Stilling
              </TableHead>
              <TableHead className="w-[18%] text-xs font-semibold uppercase tracking-wide text-slate-400">
                Dato sendt
              </TableHead>
              <TableHead className="w-[14%] text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </TableHead>
              <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wide text-slate-400 text-center">
                Handling
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app, index) => (
              <TableRow
                key={app.id}
                className="border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 transition-colors"
              >
                <TableCell className="text-xs text-slate-500 py-4 text-center">
                  {index + 1}
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-100 py-4">
                  <span className="line-clamp-2 break-words">
                    {app.company}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-400 py-4">
                  <span className="line-clamp-2 break-words">
                    {app.position}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-400 py-4 whitespace-nowrap">
                  {app.dateSent}
                </TableCell>
                <TableCell className="py-4">
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
                <TableCell className="py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-sky-400 hover:text-sky-300 hover:bg-sky-900/10"
                      onClick={() => {
                        setEditApp(app);
                        setEditModalOpen(true);
                      }}
                      title="Endre søknad"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-5 w-5" />
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ApplicationTable;
