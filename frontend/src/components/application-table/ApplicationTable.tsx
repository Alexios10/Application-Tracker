import { useState } from "react";
import { MessageSquareText, Pencil } from "lucide-react";
import { Application, ApplicationStatus } from "@/types/application";
import { EditApplicationModal } from "../EditApplicationModal";
import { ApplicationDetailsModal } from "../ApplicationDetailsModal";
import { StatusSelect } from "@/components/application-table/StatusSelect";
import { DeleteDialog } from "@/components/application-table/TableDeleteDialog";

interface ApplicationTableProps {
  applications: Application[];
  onUpdateStatus: (id: number, status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
  onEdit: (app: Application) => void;
}

const hasNote = (app: Application) => (app.note?.trim().length ?? 0) > 0;

const ApplicationTable = ({
  applications,
  onUpdateStatus,
  onDelete,
  onEdit,
}: ApplicationTableProps) => {
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [detailsApp, setDetailsApp] = useState<Application | null>(null);

  // Opens the details (with the note) on click, Enter or Space
  const rowProps = (app: Application) => ({
    onClick: () => setDetailsApp(app),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      setDetailsApp(app);
    },
    role: "button",
    tabIndex: 0,
    "aria-label": `Vis detaljer for ${app.company}`,
  });

  const actions = (app: Application) => (
    <div
      className="flex items-center justify-end gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        onClick={() => setEditApp(app)}
        aria-label={`Endre søknaden til ${app.company}`}
        title="Endre søknad"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <DeleteDialog company={app.company} onDelete={() => onDelete(app.id)} />
    </div>
  );

  const noteIcon = (app: Application) =>
    hasNote(app) && (
      <MessageSquareText
        className="h-4 w-4 shrink-0 text-muted-foreground"
        aria-label="Har notat"
      />
    );

  return (
    <>
      <ApplicationDetailsModal
        open={detailsApp !== null}
        application={detailsApp}
        onClose={() => setDetailsApp(null)}
        onSaveNote={(updated) => {
          setDetailsApp(updated);
          onEdit(updated);
        }}
      />

      <EditApplicationModal
        open={editApp !== null}
        onClose={() => setEditApp(null)}
        application={editApp}
        onSave={(updated) => {
          setEditApp(null);
          onEdit(updated);
        }}
      />

      {/* Mobile: one row per application */}
      <ul className="divide-y md:hidden">
        {applications.map((app) => (
          <li
            key={app.id}
            {...rowProps(app)}
            className="cursor-pointer px-4 py-3 hover:bg-muted"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                  <span className="truncate">{app.company}</span>
                  {noteIcon(app)}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {app.position}
                </p>
              </div>
              <span className="shrink-0 pt-0.5 text-sm text-muted-foreground">
                {app.dateSent}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="-ml-2">
                <StatusSelect
                  status={app.status}
                  onChange={(status) => onUpdateStatus(app.id, status)}
                />
              </div>
              {actions(app)}
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <table className="hidden w-full table-fixed text-left md:table">
        <thead>
          <tr className="border-b text-sm text-muted-foreground">
            <th className="w-[28%] px-4 py-2.5 font-medium">Bedrift</th>
            <th className="px-4 py-2.5 font-medium">Stilling</th>
            <th className="w-[13%] px-4 py-2.5 font-medium">Sendt</th>
            <th className="w-[17%] px-4 py-2.5 font-medium">Status</th>
            <th className="w-[96px] px-4 py-2.5">
              <span className="sr-only">Handlinger</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {applications.map((app) => (
            <tr
              key={app.id}
              {...rowProps(app)}
              className="cursor-pointer hover:bg-muted"
            >
              <td className="px-4 py-2.5 font-medium">
                <span className="flex items-center gap-2">
                  <span className="truncate">{app.company}</span>
                  {noteIcon(app)}
                </span>
              </td>
              <td className="truncate px-4 py-2.5 text-muted-foreground">
                {app.position}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {app.dateSent}
              </td>
              <td className="px-2 py-1.5">
                <StatusSelect
                  status={app.status}
                  onChange={(status) => onUpdateStatus(app.id, status)}
                />
              </td>
              <td className="px-3 py-1.5">{actions(app)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ApplicationTable;
