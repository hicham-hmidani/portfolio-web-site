import { useEffect, useRef } from 'react';
import { ScrollTrigger } from '../lib/gsap';

/**
 * Hook to trigger ScrollTrigger.refresh() after two animation frames
 * when dynamic dependencies (such as Firestore data or lists) change.
 */
export function useScrollRefresh(dependencies: unknown[] = []): void {
  const raf1Ref = useRef<number | null>(null);
  const raf2Ref = useRef<number | null>(null);

  useEffect(() => {
    if (raf1Ref.current !== null) {
      cancelAnimationFrame(raf1Ref.current);
    }
    if (raf2Ref.current !== null) {
      cancelAnimationFrame(raf2Ref.current);
    }

    raf1Ref.current = requestAnimationFrame(() => {
      raf2Ref.current = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });

    return () => {
      if (raf1Ref.current !== null) {
        cancelAnimationFrame(raf1Ref.current);
      }
      if (raf2Ref.current !== null) {
        cancelAnimationFrame(raf2Ref.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

export default useScrollRefresh;
