import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import { Box } from '@mui/material';
import analyzingAnimation from '../../../assets/lottie/analyzing.json';

interface Props {
  size?: number;
}

/** Brand-colored "scanning the closet" loop shown while Smart Buy is analyzing compatibility. */
export default function AnalyzingLottie({ size = 140 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: analyzingAnimation,
    });

    return () => anim.destroy();
  }, []);

  return <Box ref={containerRef} sx={{ width: size, height: size }} />;
}
