import { useEffect, useRef } from 'react';

export interface VisibilityFrameTiming {
  hidden: boolean;
  discardNextVisibleFrame: boolean;
}

export function createVisibilityFrameTiming(initiallyHidden: boolean): VisibilityFrameTiming {
  return {
    hidden: initiallyHidden,
    discardNextVisibleFrame: initiallyHidden
  };
}

export function setFrameVisibility(timing: VisibilityFrameTiming, hidden: boolean) {
  if (timing.hidden && !hidden) timing.discardNextVisibleFrame = true;
  timing.hidden = hidden;
}

export function consumeVisibleFrameDelta(timing: VisibilityFrameTiming, delta: number): number | null {
  if (timing.hidden) return null;
  if (timing.discardNextVisibleFrame) {
    timing.discardNextVisibleFrame = false;
    return null;
  }
  return delta;
}

function documentIsHidden() {
  return typeof document !== 'undefined' && document.hidden;
}

export function useVisibilityFrameTiming() {
  const timing = useRef<VisibilityFrameTiming | null>(null);
  if (!timing.current) timing.current = createVisibilityFrameTiming(documentIsHidden());

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const updateVisibility = () => setFrameVisibility(timing.current!, document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  return timing.current;
}
