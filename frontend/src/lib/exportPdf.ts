import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Application } from "@/types/application";
import { sortNewestFirst } from "@/lib/applications";

// Creates a PDF file in the browser and downloads it.
// The PDF libraries are only loaded when the user asks for a PDF,
// so they don't make the app slower for everyone else.
export async function downloadPdf(
  applications: Application[],
  fullName: string,
) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const today = format(new Date(), "d. MMMM yyyy", { locale: nb });
  const count = `${applications.length} ${applications.length === 1 ? "søknad" : "søknader"}`;

  doc.setFontSize(16);
  doc.text("Jobbsøknader", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`${fullName}. Hentet ut ${today}. ${count}.`, 14, 25);

  autoTable(doc, {
    startY: 31,
    head: [["Bedrift", "Stilling", "Sendt", "Status", "Frist", "Lenke"]],
    body: sortNewestFirst(applications).map((a) => [
      a.company,
      a.position,
      a.dateSent,
      a.status,
      a.deadline ?? "",
      a.jobUrl ?? "",
    ]),
    styles: { fontSize: 9, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [21, 35, 63] }, // ink, same as the app's buttons
    columnStyles: { 5: { cellWidth: 80, fontSize: 7 } },
  });

  doc.save(`mine-soknader-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
