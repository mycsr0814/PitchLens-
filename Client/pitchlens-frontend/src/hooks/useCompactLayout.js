import { useEffect, useState } from 'react';

function getIsCompact(breakpoint) {
  if (typeof window === 'undefined') return false;

  const query = `(max-width: ${breakpoint}px)`;
  if (window.matchMedia?.(query).matches) return true;

  const viewportWidth = window.visualViewport?.width;
  if (viewportWidth != null && viewportWidth <= breakpoint) return true;

  return window.innerWidth <= breakpoint;
}

export default function useCompactLayout(breakpoint = 760) {
  const [isCompact, setIsCompact] = useState(() => getIsCompact(breakpoint));

  useEffect(() => {
    const query = `(max-width: ${breakpoint}px)`;
    const media = window.matchMedia(query);
    const update = () => setIsCompact(getIsCompact(breakpoint));

    update();
    media.addEventListener('change', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);

    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, [breakpoint]);

  return isCompact;
}
