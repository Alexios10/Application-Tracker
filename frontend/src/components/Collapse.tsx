import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  children: React.ReactNode;
}

// Shows or hides its content with a short height + fade animation.
// The content stays in the page while hidden, so it is made inert (can't be
// clicked or tabbed to) and the fieldset is disabled (fields aren't required
// or submitted).
export function Collapse({ open, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.inert = !open;
  }, [open]);

  return (
    <div
      ref={ref}
      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <fieldset disabled={!open} className="min-w-0 overflow-hidden">
        {children}
      </fieldset>
    </div>
  );
}
