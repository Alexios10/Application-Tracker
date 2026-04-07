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
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditApplicationModal } from "../EditApplicationModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { StatusSelect } from "@/components/application-table/TabelStatusSelect";
import { DeleteDialog } from "@/components/application-table/TableDeleteDialog";

interface ApplicationTableProps {
  applications: Application[];
  onUpdateStatus: (id: number, status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
  onEdit?: (app: Application) => void;
}

const ApplicationTable = ({
  applications,
  onUpdateStatus,
  onDelete,
  onEdit,
}: ApplicationTableProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const isMobile = useIsMobile();
  const editRef = useRef<HTMLDivElement>(null);
  const editRefMobile = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingId === null) {
      setSelectOpen(false);
      return;
    }
    const timer = setTimeout(() => setSelectOpen(true), 50);
    return () => clearTimeout(timer);
  }, [editingId]);

  useEffect(() => {
    if (!editingId) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (editRef.current?.contains(target)) return;
      if (editRefMobile.current?.contains(target)) return;
      if (target.closest(".status-select-dropdown")) return;
      setEditingId(null);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editingId]);

  const handleStatusChange = (id: number, v: ApplicationStatus) => {
    onUpdateStatus(id, v);
    setSelectOpen(false);
    setEditingId(null);
  };

  return (
    <div className="h-[40rem] w-full overflow-y-auto rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-xl">
      <EditApplicationModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        application={editApp}
        onSave={(updated) => {
          setEditModalOpen(false);
          setEditApp(null);
          if (updated?.id && typeof onEdit === "function") {
            onEdit(updated);
          }
        }}
      />

      {/* Mobile card layout */}
      <div className="flex flex-col divide-y divide-slate-800/80 min-[800px]:hidden">
        {applications.map((app, index) => (
          <div
            key={app.id}
            className="group flex flex-col gap-2 px-4 py-4 bg-slate-900/60 rounded-xl m-2 shadow-md transition-colors hover:bg-slate-900/80 relative"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs text-slate-500 mr-2">
                  #{index + 1}
                </span>
                <span
                  className="text-base font-semibold text-slate-100 truncate min-w-0 max-w-[100px] inline-block align-bottom"
                  title={app.company}
                >
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
                <DeleteDialog
                  company={app.company}
                  onDelete={() => onDelete(app.id)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-2">
              <div className="flex flex-nowrap items-center gap-3">
                <span className="truncate max-w-[40px] flex-shrink min-w-0">
                  {app.position}
                </span>
                <span className="shrink-0 text-slate-500">·</span>
                <span className="shrink-0">{app.dateSent}</span>
                <span className="shrink-0">·</span>
                <div
                  style={{
                    minHeight: "2rem",
                    position: "relative",
                    flexShrink: 0,
                    width: "fit-content",
                  }}
                >
                  {editingId === app.id ? (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        zIndex: 10,
                        width: "100%",
                        minWidth: "80px",
                        maxWidth: "120px",
                      }}
                    >
                      <StatusSelect
                        refProp={editRefMobile}
                        open={isMobile && selectOpen}
                        status={app.status}
                        onOpenChange={(open) => {
                          setSelectOpen(open);
                          if (!open) setEditingId(null);
                        }}
                        onValueChange={(v) => handleStatusChange(app.id, v)}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(app.id)}
                      className="cursor-pointer"
                      style={{
                        minHeight: "2rem",
                        minWidth: "80px",
                        maxWidth: "120px",
                        width: "100%",
                      }}
                    >
                      <StatusBadge status={app.status} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden min-[800px]:block w-full overflow-x-auto">
        <Table className="min-w-[700px] w-full table-fixed">
          <TableHeader>
            <TableRow className="bg-slate-900/80 hover:bg-slate-900/80">
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
                    <StatusSelect
                      refProp={editRef}
                      open={!isMobile && selectOpen}
                      status={app.status}
                      onOpenChange={(open) => {
                        setSelectOpen(open);
                        if (!open) setEditingId(null);
                      }}
                      onValueChange={(v) => handleStatusChange(app.id, v)}
                    />
                  ) : (
                    <div
                      onClick={() => setEditingId(app.id)}
                      className="flex h-8 w-fit items-center justify-start select-none transition-colors cursor-pointer rounded-lg px-2"
                      style={{ minHeight: "2rem" }}
                      tabIndex={0}
                      role="button"
                      aria-label="Endre status"
                    >
                      <StatusBadge status={app.status} />
                    </div>
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
                    <DeleteDialog
                      company={app.company}
                      onDelete={() => onDelete(app.id)}
                    />
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
