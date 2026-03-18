import { useEffect, useState } from "react";

export const useIsMobile = (breakpoint = 799) => {
  const [isMobile, setIsMobile] = useState(false);

  // Lytter på endringer i viewport-størrelsen og oppdaterer isMobile-tilstanden
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
};
