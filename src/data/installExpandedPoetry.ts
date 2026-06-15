import { poets as seedPoets, poems as seedPoems } from './poetry';
import { poets as expandedPoets, poems as expandedPoems } from './expandedPoetry';

const installedPoetIds = new Set(seedPoets.map((poet) => poet.id));
expandedPoets.forEach((poet) => {
  if (!installedPoetIds.has(poet.id)) {
    seedPoets.push(poet);
    installedPoetIds.add(poet.id);
  }
});

const installedPoemIds = new Set(seedPoems.map((poem) => poem.id));
expandedPoems.forEach((poem) => {
  if (!installedPoemIds.has(poem.id)) {
    seedPoems.push(poem);
    installedPoemIds.add(poem.id);
  }
});
