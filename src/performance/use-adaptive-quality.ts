import { useCallback, useRef, useState } from 'react';
import { chooseInitialQuality, demoteQuality, QUALITY_PRESETS } from './quality';

function initialQuality() {
  return chooseInitialQuality({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    mobile: window.innerWidth <= 760,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    devicePixelRatio: window.devicePixelRatio || 1
  });
}

export function useAdaptiveQuality() {
  const [quality, setQuality] = useState(initialQuality);
  const consecutiveLowSamples = useRef(0);

  const reportFps = useCallback((fps: number) => {
    setQuality((current) => {
      const belowTarget = fps < QUALITY_PRESETS[current].targetFps * 0.8;
      consecutiveLowSamples.current = belowTarget ? consecutiveLowSamples.current + 1 : 0;
      if (consecutiveLowSamples.current < 3) return current;
      consecutiveLowSamples.current = 0;
      return demoteQuality(current);
    });
  }, []);

  return { quality, reportFps };
}
