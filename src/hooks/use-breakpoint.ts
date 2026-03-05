import { useState, useEffect } from "react";

export function useBreakpoint(minWidth: number): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= minWidth : true,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [minWidth]);

  return matches;
}
