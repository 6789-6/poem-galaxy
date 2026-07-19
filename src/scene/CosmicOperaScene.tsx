import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { CameraDirector } from './CameraDirector';
import { AccretionDisk } from './layers/AccretionDisk';
import { DynastyBands } from './layers/DynastyBands';
import { PoemDust } from './layers/PoemDust';
import { PoetStars } from './layers/PoetStars';
import { RelationArcs } from './layers/RelationArcs';
import type { CosmicOperaSceneProps } from './scene-contract';
import { ScenePostProcessing } from './ScenePostProcessing';
import { consumeVisibleFrameDelta, useVisibilityFrameTiming } from './scene-timing';

function RollingFpsReporter({ onFpsSample }: Pick<CosmicOperaSceneProps, 'onFpsSample'>) {
  const elapsed = useRef(0);
  const frames = useRef(0);
  const frameTiming = useVisibilityFrameTiming();

  useFrame((_, delta) => {
    const visibleDelta = consumeVisibleFrameDelta(frameTiming, delta);
    if (visibleDelta === null) {
      elapsed.current = 0;
      frames.current = 0;
      return;
    }
    elapsed.current += visibleDelta;
    frames.current += 1;
    if (elapsed.current < 2) return;
    onFpsSample(frames.current / elapsed.current);
    elapsed.current = 0;
    frames.current = 0;
  });

  return null;
}

export function CosmicOperaScene(props: CosmicOperaSceneProps) {
  const visibleAuthors = useMemo(
    () => props.authors.filter((author) => props.state.activeDynasties.includes(author.dynasty)),
    [props.authors, props.state.activeDynasties]
  );
  const visiblePoems = useMemo(
    () => props.loadedPoems.filter((poem) => props.state.activeDynasties.includes(poem.dynasty)),
    [props.loadedPoems, props.state.activeDynasties]
  );

  return (
    <>
      <color attach="background" args={['#020100']} />
      <fog attach="fog" args={['#070301', 88, 190]} />
      <ambientLight intensity={0.16} color="#9d7447" />
      <pointLight position={[0, 16, 5]} intensity={18} distance={82} decay={2} color="#ffad42" />
      <AccretionDisk />
      <DynastyBands activeDynasties={props.state.activeDynasties} />
      <PoemDust poems={visiblePoems} quality={props.quality} onSelectPoem={props.onSelectPoem} />
      <PoetStars
        authors={visibleAuthors}
        selectedAuthorId={props.state.selectedAuthorId}
        onSelectAuthor={props.onSelectAuthor}
      />
      <RelationArcs authors={visibleAuthors} relations={props.relations} />
      <CameraDirector state={props.state} authors={visibleAuthors} loadedPoems={visiblePoems} />
      <ScenePostProcessing quality={props.quality} mode={props.state.mode} />
      <RollingFpsReporter onFpsSample={props.onFpsSample} />
    </>
  );
}
