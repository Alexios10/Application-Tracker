import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full border-2 border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-400"
          title="Profilmeny"
        >
          <Avatar>
            <AvatarFallback className="bg-transparent">
              {user?.fullName?.[0]?.toUpperCase() || "P"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 rounded-lg border border-slate-700 bg-slate-900 p-1 text-slate-100 shadow-xl"
      >
        <DropdownMenuItem
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer focus:bg-slate-800 focus:text-slate-100"
          onClick={() => navigate("/profile")}
        >
          <User className="h-4 w-4 text-slate-400" />
          Min profil
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 border-slate-700/80" />
        <DropdownMenuItem
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer text-rose-400 focus:bg-slate-800 focus:text-rose-400"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logg ut
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
