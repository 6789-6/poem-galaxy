import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AuthorRecord, PoemRecord } from '../data/schema';
import { FocusPanel } from './FocusPanel';

const author: AuthorRecord = {
  id: 'du-fu',
  name: '杜甫',
  dynasty: 'tang',
  themes: ['家国'],
  poemShardIds: ['tang-001']
};

const baseProps = {
  authors: [author],
  loadedPoems: [] as PoemRecord[],
  relations: [],
  onSelectPoem: vi.fn(),
  onBack: vi.fn()
};

describe('FocusPanel', () => {
  it('keeps a failed shard retry available without changing the current author mode', async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    render(
      <FocusPanel
        {...baseProps}
        mode="poet"
        selectedAuthor={author}
        selectedPoem={null}
        selectionError={new Error('shard failed')}
        onRetrySelection={retry}
      />
    );

    expect(screen.getByRole('heading', { name: '杜甫' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '重试载入' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('shows the licensed metadata notice and suppresses supplied lines', () => {
    const poem: PoemRecord = {
      id: 'metadata-poem',
      title: '索引诗',
      authorId: author.id,
      dynasty: 'tang',
      lines: ['不得显示的占位正文'],
      themes: ['月'],
      textAvailability: 'metadata-only'
    };
    render(
      <FocusPanel
        {...baseProps}
        mode="poem"
        selectedAuthor={author}
        selectedPoem={poem}
        loadedPoems={[poem]}
        selectionError={null}
        onRetrySelection={null}
      />
    );

    expect(screen.getByText('仅提供题名与主题索引，不提供未经授权全文')).toBeInTheDocument();
    expect(screen.queryByText('不得显示的占位正文')).not.toBeInTheDocument();
  });
});
