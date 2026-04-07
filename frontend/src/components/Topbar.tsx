import { Bell, Settings2, Menu } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";

const TAB_LABELS = [
  "Søknader",
  "Intervjuer (kommer snart)",
  "Tilbud (kommer snart)",
];

interface Props {
  onOpenDrawer: () => void;
}

export function Topbar({ onOpenDrawer }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-slate-800/60 bg-[#10121a] px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          onClick={onOpenDrawer}
          aria-label="Åpne meny"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden items-center gap-4 md:flex lg:gap-6">
          {TAB_LABELS.map((label, i) => (
            <button
              key={label}
              className={`text-sm font-medium pb-0.5 transition-colors ${
                i === 0
                  ? "border-b-2 border-cyan-400 text-slate-100"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors sm:flex">
          <Bell className="h-4 w-4" />
        </button>
        <button className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors sm:flex">
          <Settings2 className="h-4 w-4" />
        </button>
        <ProfileMenu />
      </div>
    </header>
  );
}
