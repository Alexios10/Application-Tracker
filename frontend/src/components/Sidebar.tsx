import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
  BarChart2,
  X,
  Search,
  Building2,
  DollarSign,
  Star,
  Pen,
  List,
} from "lucide-react";
import { Application } from "@/types/application";
import AddApplicationDialog from "@/components/AddApplicationDialog";

const NAV_ITEMS = [
  { label: "Oversikt", icon: LayoutDashboard, key: "oversikt" },
  { label: "Kommer mer snart", icon: Pen, key: "soknadsrapport" },
  // { label: "Finn jobber", icon: Search, key: "finn_jobber" },
  // { label: "Se bedrifter", icon: Building2, key: "se_bedrifter" },
  // { label: "Lønnssjekk", icon: DollarSign, key: "lonnssjekk" },
  // { label: "Lagrede jobber", icon: Star, key: "lagrede_jobber" },
  // { label: "Skriv anmeldelse", icon: Pen, key: "skriv_anmeldelse" },
  // { label: "Lønnsbidrag", icon: BarChart2, key: "lonnsbidrag" },
  // { label: "Innstillinger", icon: Settings, key: "innstillinger" },
];

interface Props {
  onAdd: (app: Omit<Application, "id">) => void;
  onReport: () => void;
  onLogout: () => void;
  onClose?: () => void; // Valgfri, kun nødvendig for mobilskuffen for å lukke den etter handling
}

export function Sidebar({ onAdd, onReport, onLogout, onClose }: Props) {
  return (
    <div className="flex h-full flex-col py-6">
      <div className="mb-8 flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg shadow-cyan-500/30">
            <List className="h-4 w-4 text-slate-950" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-50">Mine Søknader</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
              Verktøy
            </p>
          </div>
        </div>

        {/* Lukk knapp — kun synlig i skuffen */}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav lenker */}
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === "oversikt";
          return (
            <button
              key={item.key}
              onClick={onClose}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? "bg-cyan-500/10 text-sm font-medium text-cyan-400"
                  : "text-xs font-medium uppercase tracking-wider text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto space-y-1 px-3">
        <div className="w-full [&>button]:w-full [&>button]:justify-center pb-1">
          <AddApplicationDialog onAdd={onAdd} />
        </div>
        <button
          onClick={onReport}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-colors"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          Rapporter problem
        </button>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logg ut
        </button>
      </div>
    </div>
  );
}
