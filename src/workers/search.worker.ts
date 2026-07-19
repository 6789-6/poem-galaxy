import { searchEntries } from './search-core';
import type { SearchEntry, SearchRequest, SearchResponse } from './search-protocol';

let entries: SearchEntry[] = [];

self.onmessage = (event: MessageEvent<SearchRequest>) => {
  const message = event.data;
  if (message.type === 'init') {
    entries = message.entries;
    self.postMessage({ type: 'ready' } satisfies SearchResponse);
    return;
  }

  self.postMessage({
    type: 'results',
    requestId: message.requestId,
    results: searchEntries(entries, message.query, message.limit)
  } satisfies SearchResponse);
};
