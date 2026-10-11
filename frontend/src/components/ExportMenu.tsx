import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { Application } from "@/types/application";
import { downloadCsv } from "@/lib/exportCsv";
import { downloadPdf } from "@/lib/exportPdf";
import { useAuth } from "@/hooks/useAuth";
import { PrintableList } from "@/components/PrintableList";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Lets the user take their list out of the app: as an Excel file, a PDF file, or on paper
export function ExportMenu({ applications }: { applications: Application[] }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [creatingPdf, setCreatingPdf] = useState(false);
  const itemClass =
    "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-muted";

  return (
    <>
      <PrintableList
        applications={applications}
        fullName={user?.fullName ?? ""}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" disabled={applications.length === 0}>
            <Download className="mr-1.5 h-4 w-4" />
            Last ned
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-1">
          <button
            className={itemClass}
            onClick={() => {
              downloadCsv(applications);
              setOpen(false);
            }}
          >
            <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              <span className="block text-sm font-medium">Excel-fil (CSV)</span>
              <span className="block text-sm text-muted-foreground">
                Alle søknadene, til Excel eller Google Sheets
              </span>
            </span>
          </button>
          <button
            className={itemClass}
            disabled={creatingPdf}
            onClick={async () => {
              setCreatingPdf(true);
              try {
                await downloadPdf(applications, user?.fullName ?? "");
              } finally {
                setCreatingPdf(false);
                setOpen(false);
              }
            }}
          >
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              <span className="block text-sm font-medium">
                {creatingPdf ? "Lager PDF..." : "PDF-fil"}
              </span>
              <span className="block text-sm text-muted-foreground">
                Klar til å sende på e-post eller ta med til Nav
              </span>
            </span>
          </button>
          <button
            className={itemClass}
            onClick={() => {
              setOpen(false);
              // The print window freezes the page while it is open. Wait until the
              // menu's closing animation (200 ms) is done, or it gets stuck on screen.
              setTimeout(() => window.print(), 300);
            }}
          >
            <Printer className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              <span className="block text-sm font-medium">Skriv ut</span>
              <span className="block text-sm text-muted-foreground">
                En ryddig liste over alle søknadene
              </span>
            </span>
          </button>
        </PopoverContent>
      </Popover>
    </>
  );
}
