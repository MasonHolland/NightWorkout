import type { ReactNode } from 'react';

/** iOS: nothing extra. The web version (WebDemo.web.tsx) adds the demo banner and desktop frame. */
export function WebDemo({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
