import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SceneBoundary } from './SceneBoundary';

describe('SceneBoundary', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('reports a scene render failure and leaves switching to its parent', () => {
    const onFail = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const suppressExpectedError = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener('error', suppressExpectedError);
    function BrokenScene(): ReactNode {
      throw new Error('WebGL unavailable');
    }

    const { container } = render(
      <SceneBoundary onFail={onFail}>
        <BrokenScene />
      </SceneBoundary>
    );

    expect(onFail).toHaveBeenCalledTimes(1);
    expect(container).toBeEmptyDOMElement();
    window.removeEventListener('error', suppressExpectedError);
  });
});
