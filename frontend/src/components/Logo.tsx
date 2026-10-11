import { Link } from "react-router-dom";
import { STATUSES, STATUS_DOT } from "@/constants/status";

// The logo is five small bars in the status colors - the same colors
// the user sees in the overview, so the brand and the product match
export function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 rounded-sm text-[17px] font-semibold tracking-tight text-foreground"
    >
      <span className="flex h-4 items-end gap-[2px]" aria-hidden="true">
        {STATUSES.map((status, i) => (
          <span
            key={status}
            className={`w-[3px] rounded-[1px] ${STATUS_DOT[status]}`}
            style={{ height: `${100 - i * 15}%` }}
          />
        ))}
      </span>
      Mine søknader
    </Link>
  );
}
