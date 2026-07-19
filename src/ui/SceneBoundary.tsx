import { Component, type ErrorInfo, type ReactNode } from 'react';

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
