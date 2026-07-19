import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CinematicIntro } from './CinematicIntro';

const INTRO_KEY = 'poem-galaxy:intro-seen';

function setMedia({ mobile = false, reduced = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reduced : mobile,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}

describe('CinematicIntro', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setMedia();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('completes the desktop opening after 3.6 seconds for this session', () => {
    vi.useFakeTimers();
    render(<CinematicIntro />);
    expect(screen.getByRole('button', { name: '跳过开场' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3_599));
    expect(screen.getByRole('button', { name: '跳过开场' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole('button', { name: '跳过开场' })).not.toBeInTheDocument();
    expect(sessionStorage.getItem(INTRO_KEY)).toBe('1');
  });

  it('uses a one-second opening on mobile', () => {
    vi.useFakeTimers();
    setMedia({ mobile: true });
    render(<CinematicIntro />);
    act(() => vi.advanceTimersByTime(999));
    expect(screen.getByRole('button', { name: '跳过开场' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole('button', { name: '跳过开场' })).not.toBeInTheDocument();
  });

  it('renders the corpus count supplied by the generated manifest', () => {
    render(<CinematicIntro poemCount={17_396} />);
    expect(screen.getByText('17,396 首古典诗词 · 六道时间星环')).toBeInTheDocument();
    expect(screen.queryByText(/一万五千首诗/)).not.toBeInTheDocument();
  });

  it('lets the visitor skip and does not replay in the same session', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CinematicIntro />);
    await user.click(screen.getByRole('button', { name: '跳过开场' }));
    expect(sessionStorage.getItem(INTRO_KEY)).toBe('1');
    unmount();
    render(<CinematicIntro />);
    expect(screen.queryByRole('button', { name: '跳过开场' })).not.toBeInTheDocument();
  });

  it('immediately records and suppresses the opening for reduced motion', () => {
    setMedia({ reduced: true });
    render(<CinematicIntro />);
    expect(screen.queryByRole('button', { name: '跳过开场' })).not.toBeInTheDocument();
    expect(sessionStorage.getItem(INTRO_KEY)).toBe('1');
  });
});
