import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAdaptiveQuality } from './use-adaptive-quality';

describe('useAdaptiveQuality', () => {
  it('demotes after three consecutive low samples and never auto-promotes', () => {
    let reportFps!: (fps: number) => void;

    function Probe() {
      const adaptiveQuality = useAdaptiveQuality();
      reportFps = adaptiveQuality.reportFps;
      return <output>{adaptiveQuality.quality}</output>;
    }

    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 8 });
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    render(<Probe />);

    expect(screen.getByText('cinematic')).toBeInTheDocument();

    act(() => reportFps(0));
    act(() => reportFps(0));
    expect(screen.getByText('cinematic')).toBeInTheDocument();

    act(() => reportFps(0));
    expect(screen.getByText('balanced')).toBeInTheDocument();

    act(() => reportFps(120));
    expect(screen.getByText('balanced')).toBeInTheDocument();
  });
});
