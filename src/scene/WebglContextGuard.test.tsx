import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebglContextGuard } from './WebglContextGuard';

const fiber = vi.hoisted(() => ({ useThree: vi.fn() }));

vi.mock('@react-three/fiber', () => fiber);

describe('WebglContextGuard', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    vi.useFakeTimers();
    canvas = document.createElement('canvas');
    fiber.useThree.mockReturnValue({ gl: { domElement: canvas } });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    fiber.useThree.mockReset();
  });

  it('falls back only after a context stays lost for 1.5 seconds', () => {
    const onFail = vi.fn();
    render(<WebglContextGuard onFail={onFail} />);
    const lost = new Event('webglcontextlost', { cancelable: true });
    canvas.dispatchEvent(lost);

    expect(lost.defaultPrevented).toBe(true);
    act(() => vi.advanceTimersByTime(1_499));
    expect(onFail).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onFail).toHaveBeenCalledTimes(1);
  });

  it('cancels fallback when the context is restored in time', () => {
    const onFail = vi.fn();
    render(<WebglContextGuard onFail={onFail} />);
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    act(() => vi.advanceTimersByTime(900));
    canvas.dispatchEvent(new Event('webglcontextrestored'));
    act(() => vi.advanceTimersByTime(1_500));
    expect(onFail).not.toHaveBeenCalled();
  });

  it('removes both listeners and the pending timer on cleanup', () => {
    const onFail = vi.fn();
    const removeListener = vi.spyOn(canvas, 'removeEventListener');
    const { unmount } = render(<WebglContextGuard onFail={onFail} />);
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    unmount();
    act(() => vi.advanceTimersByTime(1_500));

    expect(removeListener).toHaveBeenCalledWith('webglcontextlost', expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith('webglcontextrestored', expect.any(Function));
    expect(onFail).not.toHaveBeenCalled();
  });
});
