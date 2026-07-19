import type { VisualQuality } from '../performance/quality';

const QUALITY_LABELS: Record<VisualQuality, string> = {
  performance: '性能画质',
  balanced: '均衡画质',
  cinematic: '电影画质'
};

export interface ModeDockProps {
  quality: VisualQuality;
  hudVisible: boolean;
  networkActive: boolean;
  tourActive: boolean;
  onEnterNetwork: () => void;
  onStartTour: () => void;
  onToggleHud: () => void;
}

export function ModeDock({
  quality,
  hudVisible,
  networkActive,
  tourActive,
  onEnterNetwork,
  onStartTour,
  onToggleHud
}: ModeDockProps) {
  return (
    <nav className="mode-dock" aria-label="探索模式">
      <button type="button" aria-pressed={networkActive} onClick={onEnterNetwork}>关系网络</button>
      <button type="button" aria-pressed={tourActive} onClick={onStartTour}>开始巡游</button>
      <button type="button" onClick={onToggleHud}>{hudVisible ? '隐藏界面' : '显示界面'}</button>
      <span className="quality-label" aria-label="当前画质">{QUALITY_LABELS[quality]}</span>
    </nav>
  );
}
