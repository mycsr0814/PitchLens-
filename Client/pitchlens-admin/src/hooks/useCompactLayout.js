import { useEffect, useState } from 'react';

export default function useCompactLayout(breakpoint = 768) {
  const [isCompact, setIsCompact] = useState(() => (
    typeof window !== 'undefined' && window.innerWidth <= breakpoint
  ));

  useEffect(() => {
    const update = () => setIsCompact(window.innerWidth <= breakpoint);
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [breakpoint]);

  return isCompact;
}
