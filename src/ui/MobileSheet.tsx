import type { ReactNode } from 'react';

export interface MobileSheetProps {
  children: ReactNode;
}

export function MobileSheet({ children }: MobileSheetProps) {
  return (
    <aside className="mobile-sheet" aria-label="诗词详情">
      {children}
    </aside>
  );
}
