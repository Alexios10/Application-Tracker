import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ReportModal } from "@/components/ReportModal";

// Shared frame for every page after login: top bar with navigation, then the page content
export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);

  const links = [
    { to: "/", label: "Oversikt" },
    { to: "/profile", label: "Profil" },
    ...(user?.isAdmin ? [{ to: "/admin/reports", label: "Rapporter" }] : []),
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-5 px-4 sm:gap-8 sm:px-6">
          <Logo />
          <nav className="flex h-full items-stretch gap-4 sm:gap-6">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  `flex items-center border-b-2 pt-[2px] text-sm transition-colors ${
                    isActive
                      ? "border-foreground font-medium text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto">
            <ProfileMenu onReport={() => setReportOpen(true)} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
