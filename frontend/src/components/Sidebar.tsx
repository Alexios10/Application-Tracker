import {
  LayoutDashboard,
  HelpCircle,
  LogOut,
  Pen,
  List,
  User,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Application } from "@/types/application";
import AddApplicationDialog from "@/components/AddApplicationDialog";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Oversikt", icon: LayoutDashboard, path: "/" },
  { label: "Profil", icon: User, path: "/profile" },
  { label: "Kommer mer snart", icon: Pen, path: null },
];

interface Props {
  onAdd: (app: Omit<Application, "id">) => void;
  onReport: () => void;
  onLogout: () => void;
  onClose?: () => void;
  /** When true the sidebar is always expanded (e.g. inside mobile drawer) */
  alwaysExpanded?: boolean;
}

export function Sidebar({
  onAdd,
  onReport,
  onLogout,
  onClose,
  alwaysExpanded,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  const expanded = alwaysExpanded || hovered;

  return (
    <motion.div
      className="flex h-full flex-col py-6 overflow-hidden"
      onMouseEnter={() => !alwaysExpanded && setHovered(true)}
      onMouseMove={() => !alwaysExpanded && !hovered && setHovered(true)}
      onMouseLeave={() => !alwaysExpanded && setHovered(false)}
      animate={{ width: expanded ? 220 : 60 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      style={{ width: alwaysExpanded ? 220 : undefined }}
    >
      {/* Logo / header */}
      <div className="mb-8 flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg shadow-cyan-500/30">
            <List className="h-4 w-4 text-slate-950" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap"
              >
                <p className="text-sm font-bold text-slate-50">Mine Søknader</p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                  Verktøy
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === location.pathname;
          return (
            <button
              key={item.label}
              disabled={!item.path}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                  onClose?.();
                }
              }}
              title={!expanded ? item.label : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? "bg-cyan-500/10 text-xs font-medium uppercase tracking-wider text-cyan-400"
                  : item.path
                    ? "text-xs font-medium uppercase tracking-wider text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
                    : "text-xs font-medium uppercase tracking-wider text-slate-700 cursor-not-allowed"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.13 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 px-2">
        <div className="w-full [&>button]:w-full [&>button]:justify-center pb-1">
          <AddApplicationDialog onAdd={onAdd} collapsed={!expanded} />
        </div>
        <button
          onClick={onReport}
          title={!expanded ? "Rapporter problem" : undefined}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-colors"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.13 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Rapporter problem
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          onClick={onLogout}
          title={!expanded ? "Logg ut" : undefined}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.13 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Logg ut
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
