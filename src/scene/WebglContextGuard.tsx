import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

export function WebglContextGuard({ onFail }: { onFail: () => void }) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    let failureTimer: number | null = null;

    const clearFailureTimer = () => {
      if (failureTimer !== null) window.clearTimeout(failureTimer);
      failureTimer = null;
    };
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      clearFailureTimer();
      failureTimer = window.setTimeout(() => {
        failureTimer = null;
        onFail();
      }, 1500);
    };
    const handleContextRestored = () => clearFailureTimer();

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      clearFailureTimer();
    };
  }, [gl, onFail]);

  return null;
}
