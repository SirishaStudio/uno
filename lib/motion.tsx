"use client";

import { createContext, useContext, useEffect, useState } from "react";

type MotionLevel = "full" | "reduced";

const MotionContext = createContext<{ level: MotionLevel; setLevel: (l: MotionLevel) => void }>({
  level: "full",
  setLevel: () => {},
});

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevelState] = useState<MotionLevel>("full");

  useEffect(() => {
    const stored = window.localStorage.getItem("uno:motion") as MotionLevel | null;
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setLevelState(stored ?? (prefersReduced ? "reduced" : "full"));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = level;
  }, [level]);

  function setLevel(l: MotionLevel) {
    setLevelState(l);
    window.localStorage.setItem("uno:motion", l);
  }

  return <MotionContext.Provider value={{ level, setLevel }}>{children}</MotionContext.Provider>;
}

export function useMotion() {
  return useContext(MotionContext);
}
