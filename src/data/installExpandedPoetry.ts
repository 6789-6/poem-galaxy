import { poets as seedPoets, poems as seedPoems } from './poetry';
import { poets as expandedPoets, poems as expandedPoems } from './expandedPoetry';
import { massPoets, massPoems } from './massPoetryData';
import { canonicalPoems } from './canonicalPoemDetails';

const expandedPoetIds = new Set(expandedPoets.map((poet) => poet.id));
massPoets.forEach((poet) => {
  if (!expandedPoetIds.has(poet.id)) {
    expandedPoets.push(poet);
    expandedPoetIds.add(poet.id);
  }
});

const expandedPoemIds = new Set(expandedPoems.map((poem) => poem.id));
[...massPoems, ...canonicalPoems].forEach((poem) => {
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

const superCorePoets = new Set(['li-bai', 'du-fu', 'su-shi']);
const corePoets = new Set([
  'qu-yuan',
  'tao-yuanming',
  'wang-wei',
  'bai-juyi',
  'li-shangyin',
  'du-mu',
  'li-qingzhao',
  'xin-qiji',
  'lu-you'
]);
const brightPoets = new Set([
  'meng-haoran',
  'li-he',
  'huang-tingjian',
  'nalan-xingde',
  'cao-cao',
  'cao-zhi',
  'xie-lingyun',
  'chen-ziang',
  'gao-shi',
  'cen-shen',
  'wei-yingwu',
  'han-yu',
  'liu-yuxi',
  'yuan-zhen',
  'ouyang-xiu',
  'wang-anshi',
  'yang-wanli',
  'guan-hanqing',
  'yuan-mei',
  'gong-zizhen',
  'ai-qing',
  'bei-dao',
  'shu-ting'
]);

function stableNoise(id: string) {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000;
}

function importanceBrightness(id: string, fallback: number) {
  if (superCorePoets.has(id)) return 2.72;
  if (corePoets.has(id)) return Math.max(fallback, 2.1);
  if (brightPoets.has(id)) return Math.max(fallback, 1.55);
  return Math.min(fallback, 0.68 + stableNoise(id) * 0.34);
}

const gradedPoets = new Map<string, number>();
[...seedPoets, ...expandedPoets].forEach((poet) => {
  const nextBrightness = importanceBrightness(poet.id, poet.brightness);
  poet.brightness = nextBrightness;
  gradedPoets.set(poet.id, nextBrightness);
});

massPoets.forEach((poet) => {
  poet.brightness = gradedPoets.get(poet.id) ?? importanceBrightness(poet.id, poet.brightness);
});
