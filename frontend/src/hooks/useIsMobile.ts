import { useEffect, useState } from "react";

export const useIsMobile = (breakpoint = 799) => {
  const [isMobile, setIsMobile] = useState(false);

  // Listens for viewport size changes and updates the isMobile state
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
};
