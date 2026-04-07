import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Application } from "@/types/application";
import { Sidebar } from "./Sidebar";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (app: Omit<Application, "id">) => void;
  onReport: () => void;
  onLogout: () => void;
}

// Wraps Sidebar in an animated slide-in drawer for mobile screens.
export function MobileDrawer({
  isOpen,
  onClose,
  onAdd,
  onReport,
  onLogout,
}: Props) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent background scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-slate-800/60 bg-[#10121a] lg:hidden"
          >
            <Sidebar
              onAdd={onAdd}
              onReport={onReport}
              onLogout={onLogout}
              onClose={onClose}
              alwaysExpanded
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
