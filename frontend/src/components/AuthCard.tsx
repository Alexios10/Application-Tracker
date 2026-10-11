import { Logo } from "@/components/Logo";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

// Simple page frame for the password pages: logo at the top, one narrow card in the middle
export function AuthCard({ title, description, children }: Props) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Logo />
      </div>
      <main className="mx-auto max-w-md px-4 pb-16 pt-12 sm:pt-20">
        <div className="rounded-xl border bg-card p-6 sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
