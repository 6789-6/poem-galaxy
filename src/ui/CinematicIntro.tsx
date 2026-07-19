import { useCallback, useEffect, useState } from 'react';

const INTRO_SESSION_KEY = 'poem-galaxy:intro-seen';

function mediaMatches(query: string) {
  return typeof window !== 'undefined' && window.matchMedia(query).matches;
}

export interface CinematicIntroProps {
  poemCount?: number;
}

export function CinematicIntro({ poemCount }: CinematicIntroProps) {
  const [reducedMotion] = useState(() => mediaMatches('(prefers-reduced-motion: reduce)'));
  const [mobile] = useState(() => mediaMatches('(max-width: 760px)'));
  const [visible, setVisible] = useState(() => (
    typeof window !== 'undefined'
    && !mediaMatches('(prefers-reduced-motion: reduce)')
    && sessionStorage.getItem(INTRO_SESSION_KEY) !== '1'
  ));

  const finish = useCallback(() => {
    sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    setVisible(false);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      sessionStorage.setItem(INTRO_SESSION_KEY, '1');
      return;
    }
    if (!visible) return;
    const timer = window.setTimeout(finish, mobile ? 1000 : 3600);
    return () => window.clearTimeout(timer);
  }, [finish, mobile, reducedMotion, visible]);

  if (!visible) return null;

  return (
    <section className="cinematic-intro" aria-label="诗词星河开场">
      <div className="cinematic-intro__flare" aria-hidden="true" />
      <div className="cinematic-intro__title">
        <p>{poemCount ? `${poemCount.toLocaleString('zh-CN')} 首古典诗词 · ` : ''}六道时间星环</p>
        <strong>中华诗词星河</strong>
        <span>穿越千年文脉</span>
      </div>
      <button type="button" onClick={finish}>跳过开场</button>
    </section>
  );
}
