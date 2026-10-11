import { createPortal } from "react-dom";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Application } from "@/types/application";
import { sortNewestFirst } from "@/lib/applications";

interface Props {
  applications: Application[];
  fullName: string;
}

// The list that is printed when the user clicks "Skriv ut".
// It is placed outside the app (#root) and is only visible on paper:
// when printing, the app is hidden and this list is shown instead (see index.css).
export function PrintableList({ applications, fullName }: Props) {
  return createPortal(
    <div className="print-only text-black">
      <h1 className="text-2xl font-semibold">Jobbsøknader</h1>
      <p className="mt-1 text-sm">
        {fullName}. Hentet ut{" "}
        {format(new Date(), "d. MMMM yyyy", { locale: nb })}.{" "}
        {applications.length}{" "}
        {applications.length === 1 ? "søknad" : "søknader"}.
      </p>
      <table className="mt-6 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-2 pr-4 font-semibold">Bedrift</th>
            <th className="py-2 pr-4 font-semibold">Stilling</th>
            <th className="py-2 pr-4 font-semibold">Sendt</th>
            <th className="py-2 pr-4 font-semibold">Status</th>
            <th className="py-2 pr-4 font-semibold">Frist</th>
            <th className="py-2 font-semibold">Lenke</th>
          </tr>
        </thead>
        <tbody>
          {sortNewestFirst(applications).map((app) => (
            <tr key={app.id} className="break-inside-avoid border-b">
              <td className="py-2 pr-4 align-top font-medium">{app.company}</td>
              <td className="py-2 pr-4 align-top">{app.position}</td>
              <td className="whitespace-nowrap py-2 pr-4 align-top">
                {app.dateSent}
              </td>
              <td className="py-2 pr-4 align-top">{app.status}</td>
              <td className="whitespace-nowrap py-2 pr-4 align-top">
                {app.deadline ?? ""}
              </td>
              <td className="break-all py-2 align-top text-xs">
                {app.jobUrl ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
    document.body,
  );
}
