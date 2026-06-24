"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Coordinates the bottom-right floating buttons. The BackToTop button is
 * per-page and only appears once scrolled past a threshold; the BackgroundMusic
 * button is global. The music button reads `backToTopVisible` to decide whether
 * to sit at the bottom (when nothing is below it) or slide up above BackToTop —
 * so it never floats with empty space beneath it.
 *
 * BackToTop reports its own visibility here (and resets to false on unmount, so
 * navigating to a page without it drops the music button back down).
 */

type FloatingButtonsContextValue = {
  backToTopVisible: boolean;
  setBackToTopVisible: (visible: boolean) => void;
};

const FloatingButtonsContext = createContext<FloatingButtonsContextValue>({
  backToTopVisible: false,
  setBackToTopVisible: () => {},
});

export function FloatingButtonsProvider({ children }: { children: ReactNode }) {
  const [backToTopVisible, setBackToTopVisible] = useState(false);
  const value = useMemo(
    () => ({ backToTopVisible, setBackToTopVisible }),
    [backToTopVisible]
  );
  return (
    <FloatingButtonsContext.Provider value={value}>{children}</FloatingButtonsContext.Provider>
  );
}

export function useFloatingButtons() {
  return useContext(FloatingButtonsContext);
}
