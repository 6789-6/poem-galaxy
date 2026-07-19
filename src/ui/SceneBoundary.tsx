import { useThree } from '@react-three/fiber';
import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react';

export interface SceneBoundaryProps {
  children: ReactNode;
  onFail: () => void;
}

interface SceneBoundaryState {
  failed: boolean;
}

export class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

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
