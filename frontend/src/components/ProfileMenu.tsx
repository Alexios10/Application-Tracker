import { useState, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Lukk meny hvis man klikker utenfor
  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
  }

  return (
    <div className="relative" tabIndex={0} ref={ref} onBlur={handleBlur}>
      {/* Profilknapp */}
      <button
        className="rounded-full border-2 border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-400"
        onClick={() => setOpen((v) => !v)}
        title="Profilmeny"
      >
        <Avatar>
          <AvatarFallback className="bg-transparent">
            {user?.fullName?.[0]?.toUpperCase() || "P"}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Meny */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded bg-slate-900 border border-slate-700 shadow-lg z-10">
          <button
            className="block w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-100"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
          >
            Min profil
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-slate-800 text-rose-400"
            onClick={logout}
          >
            Logg ut
          </button>
        </div>
      )}
    </div>
  );
}
