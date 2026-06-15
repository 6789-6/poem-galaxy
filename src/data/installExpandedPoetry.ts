import { poets as seedPoets, poems as seedPoems } from './poetry';
import { poets as expandedPoets, poems as expandedPoems } from './expandedPoetry';
import { massPoets, massPoems } from './massPoetryData';

const expandedPoetIds = new Set(expandedPoets.map((poet) => poet.id));
massPoets.forEach((poet) => {
  if (!expandedPoetIds.has(poet.id)) {
    expandedPoets.push(poet);
    expandedPoetIds.add(poet.id);
  }
});

const expandedPoemIds = new Set(expandedPoems.map((poem) => poem.id));
massPoems.forEach((poem) => {
  if (!expandedPoemIds.has(poem.id)) {
    expandedPoems.push(poem);
    expandedPoemIds.add(poem.id);
  }
});

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
