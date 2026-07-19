export interface SeedRelation {
  fromName: string;
  toName: string;
  type: 'historical' | 'family' | 'literary' | 'theme-similarity';
  sourceLabel: string;
}

export const FEATURED_AUTHOR_NAMES = [
  '屈原', '曹操', '陶渊明', '王勃', '孟浩然', '王维', '李白', '杜甫', '白居易', '元稹',
  '李商隐', '杜牧', '刘禹锡', '苏轼', '苏辙', '黄庭坚', '李清照', '辛弃疾', '陆游',
  '欧阳修', '王安石', '马致远', '纳兰性德', '龚自珍'
] as const;

export const CURATED_RELATIONS: SeedRelation[] = [
  { fromName: '李白', toName: '杜甫', type: 'literary', sourceLabel: '杜甫《春日忆李白》《赠李白》等唱和作品' },
  { fromName: '元稹', toName: '白居易', type: 'literary', sourceLabel: '元白诗派及两人唱和作品' },
  { fromName: '苏轼', toName: '苏辙', type: 'family', sourceLabel: '苏轼与苏辙为兄弟' }
];

export const CURATED_THEMES: Record<string, string[]> = {
  '李白': ['月', '酒', '山河', '豪放'],
  '杜甫': ['家国', '现实', '秋', '长安'],
  '苏轼': ['月', '江河', '人生', '豪放'],
  '李清照': ['离愁', '秋', '女性书写', '婉约'],
  '辛弃疾': ['家国', '豪放', '灯火', '军旅']
};

export const MODERN_WORKS_METADATA = [
  { author: '徐志摩', title: '再别康桥', themes: ['离别', '康桥', '新月派'] },
  { author: '闻一多', title: '死水', themes: ['现实', '象征', '新格律诗'] },
  { author: '戴望舒', title: '雨巷', themes: ['江南', '雨', '象征'] },
  { author: '艾青', title: '大堰河——我的保姆', themes: ['土地', '母性', '现实'] },
  { author: '穆旦', title: '赞美', themes: ['土地', '战争', '现代主义'] },
  { author: '海子', title: '面朝大海，春暖花开', themes: ['大海', '生活', '祝福'] }
] as const;
