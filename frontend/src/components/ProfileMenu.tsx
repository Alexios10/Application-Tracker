import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border-2 border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-400"
        title="Profilmeny"
      >
        <Avatar>
          <AvatarFallback className="bg-transparent">
            {user?.fullName?.[0]?.toUpperCase() || "P"}
          </AvatarFallback>
        </Avatar>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.18, ease: "easeOut" },
            }}
            exit={{
              opacity: 0,
              y: -8,
              transition: { duration: 0.12, ease: "easeIn" },
            }}
            className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-900 p-1 text-slate-100 shadow-xl z-50"
          >
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-slate-800"
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
            >
              <User className="h-4 w-4 text-slate-400" />
              Min profil
            </button>
            <div className="my-1 border-t border-slate-700/80" />
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer text-rose-400 hover:bg-slate-800"
              onClick={() => {
                logout();
                setOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              Logg ut
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
