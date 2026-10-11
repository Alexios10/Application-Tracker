import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LifeBuoy, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function ProfileMenu({ onReport }: { onReport: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside it or pressing Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-muted";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Åpne brukermeny"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-primary-foreground"
      >
        {user?.fullName?.[0]?.toUpperCase() || "?"}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border bg-popover p-1 shadow-lg">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{user?.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.username}
            </p>
          </div>
          <div className="my-1 border-t" />
          <button
            className={itemClass}
            onClick={() => {
              navigate("/profile");
              setOpen(false);
            }}
          >
            <User className="h-4 w-4 text-muted-foreground" />
            Min profil
          </button>
          <button
            className={itemClass}
            onClick={() => {
              onReport();
              setOpen(false);
            }}
          >
            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
            Rapporter et problem
          </button>
          <div className="my-1 border-t" />
          <button
            className={itemClass}
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            Logg ut
          </button>
        </div>
      )}
    </div>
  );
}
