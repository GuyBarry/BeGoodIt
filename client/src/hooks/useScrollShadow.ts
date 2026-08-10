import { useEffect, useRef, useState, type DependencyList } from 'react';
import { alpha } from '@mui/material/styles';

export function useScrollShadow(deps: DependencyList = []) {
  const ref = useRef<HTMLElement>(null);
  const [shadow, setShadow] = useState({ top: false, bottom: false });

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    setShadow({
      top: el.scrollTop > 4,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 4,
    });
  };

  useEffect(() => {
    onScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const boxShadow = [
    shadow.top    ? `inset 0 8px 10px -10px ${alpha('#000', 0.18)}` : null,
    shadow.bottom ? `inset 0 -8px 10px -10px ${alpha('#000', 0.12)}` : null,
  ].filter(Boolean).join(', ') || 'none';

  return { ref, onScroll, sx: { boxShadow, transition: 'box-shadow 0.15s ease' } };
}
