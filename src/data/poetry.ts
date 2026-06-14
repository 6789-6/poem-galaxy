export type Dynasty = '先秦' | '汉魏六朝' | '唐' | '宋' | '元明清' | '近现代';

export type Poet = {
  id: string;
  name: string;
  dynasty: Dynasty;
  years: string;
  summary: string;
  brightness: number;
  position: [number, number, number];
  themes: string[];
  works: string[];
  relations: string[];
};

export type Poem = {
  id: string;
  title: string;
  poetId: string;
  dynasty: Dynasty;
  form: string;
  excerpt: string;
  fullText: string;
  themes: string[];
};

export const dynastyColors: Record<Dynasty, string> = {
  '先秦': '#55f6ff',
  '汉魏六朝': '#8d7cff',
  '唐': '#ffd36e',
  '宋': '#7effb2',
  '元明清': '#ff79c6',
  '近现代': '#a8c7ff'
};

export const dynastyOrder: Dynasty[] = ['先秦', '汉魏六朝', '唐', '宋', '元明清', '近现代'];

export const poets: Poet[] = [
  {
    id: 'qu-yuan',
    name: '屈原',
    dynasty: '先秦',
    years: '约前340—前278',
    summary: '楚辞传统的开创者，将个人生命、神话想象与家国悲歌熔铸为浪漫主义长河。',
    brightness: 1.25,
    position: [-42, 8, -20],
    themes: ['楚辞', '家国', '神话'],
    works: ['离骚', '九歌', '天问'],
    relations: ['tao-yuanming', 'li-bai']
  },
  {
    id: 'tao-yuanming',
    name: '陶渊明',
    dynasty: '汉魏六朝',
    years: '365—427',
    summary: '田园诗宗，把隐逸、自然与人格独立写成中国诗歌的长久母题。',
    brightness: 1.05,
    position: [-28, -6, 16],
    themes: ['田园', '归隐', '自然'],
    works: ['饮酒', '归园田居', '桃花源诗'],
    relations: ['wang-wei', 'su-shi']
  },
  {
    id: 'wang-wei',
    name: '王维',
    dynasty: '唐',
    years: '701—761',
    summary: '诗佛，以山水田园和禅意构成清远空灵的视觉诗境。',
    brightness: 1.18,
    position: [-7, 10, -12],
    themes: ['山水', '禅意', '边塞'],
    works: ['山居秋暝', '鹿柴', '使至塞上'],
    relations: ['meng-haoran', 'li-bai', 'du-fu']
  },
  {
    id: 'meng-haoran',
    name: '孟浩然',
    dynasty: '唐',
    years: '689—740',
    summary: '山水田园诗的重要代表，诗风清淡自然。',
    brightness: 0.95,
    position: [-15, 14, -4],
    themes: ['山水', '田园', '送别'],
    works: ['春晓', '过故人庄', '宿建德江'],
    relations: ['wang-wei', 'li-bai']
  },
  {
    id: 'li-bai',
    name: '李白',
    dynasty: '唐',
    years: '701—762',
    summary: '诗仙，以极高想象力、酒意、月光与豪放人格照亮盛唐诗歌星域。',
    brightness: 1.75,
    position: [8, 22, 0],
    themes: ['浪漫', '酒', '月', '山水'],
    works: ['将进酒', '静夜思', '蜀道难', '梦游天姥吟留别'],
    relations: ['du-fu', 'wang-wei', 'meng-haoran', 'li-he']
  },
  {
    id: 'du-fu',
    name: '杜甫',
    dynasty: '唐',
    years: '712—770',
    summary: '诗圣，以沉郁顿挫记录时代灾难、社会现实与人格重量。',
    brightness: 1.65,
    position: [17, 9, 14],
    themes: ['现实', '家国', '战争', '民生'],
    works: ['春望', '登高', '茅屋为秋风所破歌', '三吏三别'],
    relations: ['li-bai', 'bai-juyi', 'wang-wei']
  },
  {
    id: 'bai-juyi',
    name: '白居易',
    dynasty: '唐',
    years: '772—846',
    summary: '新乐府运动代表，主张文章合为时而著，歌诗合为事而作。',
    brightness: 1.22,
    position: [28, -4, 9],
    themes: ['讽喻', '民生', '叙事'],
    works: ['长恨歌', '琵琶行', '卖炭翁'],
    relations: ['du-fu', 'yuan-zhen', 'su-shi']
  },
  {
    id: 'li-he',
    name: '李贺',
    dynasty: '唐',
    years: '790—816',
    summary: '诗鬼，意象幽奇瑰丽，形成冷艳、怪诞而高密度的诗歌光谱。',
    brightness: 1.0,
    position: [6, -18, -14],
    themes: ['奇崛', '神鬼', '冷艳'],
    works: ['雁门太守行', '李凭箜篌引', '梦天'],
    relations: ['li-bai', 'li-shangyin']
  },
  {
    id: 'li-shangyin',
    name: '李商隐',
    dynasty: '唐',
    years: '约813—858',
    summary: '晚唐代表，诗歌结构精密、象征隐微，形成迷离繁复的情感星云。',
    brightness: 1.28,
    position: [32, 17, -18],
    themes: ['爱情', '无题', '象征'],
    works: ['锦瑟', '无题', '夜雨寄北'],
    relations: ['du-mu', 'li-he']
  },
  {
    id: 'du-mu',
    name: '杜牧',
    dynasty: '唐',
    years: '803—852',
    summary: '小杜，诗风俊爽清丽，咏史与抒情兼具。',
    brightness: 1.05,
    position: [38, 3, -2],
    themes: ['咏史', '怀古', '风流'],
    works: ['泊秦淮', '山行', '赤壁'],
    relations: ['li-shangyin']
  },
  {
    id: 'su-shi',
    name: '苏轼',
    dynasty: '宋',
    years: '1037—1101',
    summary: '宋代文艺宇宙的超大质量恒星，诗、词、文、书画贯通，旷达而深沉。',
    brightness: 1.7,
    position: [14, -7, 38],
    themes: ['豪放', '人生', '山水', '哲思'],
    works: ['水调歌头', '念奴娇·赤壁怀古', '定风波', '题西林壁'],
    relations: ['huang-tingjian', 'xin-qiji', 'li-qingzhao', 'tao-yuanming']
  },
  {
    id: 'huang-tingjian',
    name: '黄庭坚',
    dynasty: '宋',
    years: '1045—1105',
    summary: '江西诗派宗主，重法度、重锻炼，以瘦硬奇崛见长。',
    brightness: 1.0,
    position: [3, -24, 34],
    themes: ['江西诗派', '法度', '书卷'],
    works: ['寄黄几复', '登快阁'],
    relations: ['su-shi']
  },
  {
    id: 'li-qingzhao',
    name: '李清照',
    dynasty: '宋',
    years: '1084—约1155',
    summary: '千古第一才女，词风从清丽婉约到家国沉痛，情感分辨率极高。',
    brightness: 1.32,
    position: [25, -13, 29],
    themes: ['婉约', '离乱', '女性书写'],
    works: ['声声慢', '如梦令', '一剪梅'],
    relations: ['su-shi', 'xin-qiji']
  },
  {
    id: 'xin-qiji',
    name: '辛弃疾',
    dynasty: '宋',
    years: '1140—1207',
    summary: '词中之龙，以英雄志、家国梦和豪放笔力构成南宋最炽烈的星群。',
    brightness: 1.45,
    position: [39, -21, 24],
    themes: ['豪放', '家国', '英雄'],
    works: ['破阵子', '永遇乐·京口北固亭怀古', '青玉案·元夕'],
    relations: ['su-shi', 'li-qingzhao']
  },
  {
    id: 'ma-zhiyuan',
    name: '马致远',
    dynasty: '元明清',
    years: '约1250—约1321',
    summary: '元曲代表，短小曲牌中凝聚苍凉游子意象。',
    brightness: 0.88,
    position: [46, 4, 32],
    themes: ['元曲', '羁旅', '秋思'],
    works: ['天净沙·秋思'],
    relations: ['nalan-xingde']
  },
  {
    id: 'nalan-xingde',
    name: '纳兰性德',
    dynasty: '元明清',
    years: '1655—1685',
    summary: '清词大家，以真切哀感与贵族气质写尽人世无常。',
    brightness: 1.05,
    position: [55, -8, 16],
    themes: ['清词', '悼亡', '深情'],
    works: ['木兰花令', '长相思', '浣溪沙'],
    relations: ['li-qingzhao', 'ma-zhiyuan']
  },
  {
    id: 'xu-zhimo',
    name: '徐志摩',
    dynasty: '近现代',
    years: '1897—1931',
    summary: '新月派代表，将现代汉语、音乐性与个人情感汇入新的诗歌轨道。',
    brightness: 0.95,
    position: [62, 12, -7],
    themes: ['现代诗', '新月派', '爱情'],
    works: ['再别康桥', '偶然'],
    relations: ['guo-moruo']
  },
  {
    id: 'guo-moruo',
    name: '郭沫若',
    dynasty: '近现代',
    years: '1892—1978',
    summary: '现代浪漫主义诗歌的重要开拓者，强调自我、时代与新文学爆发力。',
    brightness: 0.92,
    position: [70, 0, 10],
    themes: ['现代诗', '浪漫主义', '时代'],
    works: ['女神', '天上的街市'],
    relations: ['xu-zhimo']
  }
];

export const poems: Poem[] = [
  {
    id: 'li-sao',
    title: '离骚',
    poetId: 'qu-yuan',
    dynasty: '先秦',
    form: '楚辞',
    excerpt: '路漫漫其修远兮，吾将上下而求索。',
    fullText: '帝高阳之苗裔兮，朕皇考曰伯庸。摄提贞于孟陬兮，惟庚寅吾以降。路漫漫其修远兮，吾将上下而求索。',
    themes: ['家国', '求索', '楚辞']
  },
  {
    id: 'drinking-5',
    title: '饮酒·其五',
    poetId: 'tao-yuanming',
    dynasty: '汉魏六朝',
    form: '五言古诗',
    excerpt: '采菊东篱下，悠然见南山。',
    fullText: '结庐在人境，而无车马喧。问君何能尔？心远地自偏。采菊东篱下，悠然见南山。山气日夕佳，飞鸟相与还。此中有真意，欲辨已忘言。',
    themes: ['田园', '自然', '隐逸']
  },
  {
    id: 'jiangjinjiu',
    title: '将进酒',
    poetId: 'li-bai',
    dynasty: '唐',
    form: '乐府',
    excerpt: '天生我材必有用，千金散尽还复来。',
    fullText: '君不见黄河之水天上来，奔流到海不复回。君不见高堂明镜悲白发，朝如青丝暮成雪。人生得意须尽欢，莫使金樽空对月。天生我材必有用，千金散尽还复来。',
    themes: ['酒', '豪放', '生命']
  },
  {
    id: 'jingyesi',
    title: '静夜思',
    poetId: 'li-bai',
    dynasty: '唐',
    form: '五言绝句',
    excerpt: '举头望明月，低头思故乡。',
    fullText: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
    themes: ['月', '思乡']
  },
  {
    id: 'chunwang',
    title: '春望',
    poetId: 'du-fu',
    dynasty: '唐',
    form: '五言律诗',
    excerpt: '国破山河在，城春草木深。',
    fullText: '国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。烽火连三月，家书抵万金。白头搔更短，浑欲不胜簪。',
    themes: ['家国', '战争', '现实']
  },
  {
    id: 'denggao',
    title: '登高',
    poetId: 'du-fu',
    dynasty: '唐',
    form: '七言律诗',
    excerpt: '无边落木萧萧下，不尽长江滚滚来。',
    fullText: '风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。万里悲秋常作客，百年多病独登台。艰难苦恨繁霜鬓，潦倒新停浊酒杯。',
    themes: ['悲秋', '人生', '现实']
  },
  {
    id: 'shanjuqiuming',
    title: '山居秋暝',
    poetId: 'wang-wei',
    dynasty: '唐',
    form: '五言律诗',
    excerpt: '明月松间照，清泉石上流。',
    fullText: '空山新雨后，天气晚来秋。明月松间照，清泉石上流。竹喧归浣女，莲动下渔舟。随意春芳歇，王孙自可留。',
    themes: ['山水', '禅意', '秋']
  },
  {
    id: 'changhenge',
    title: '长恨歌',
    poetId: 'bai-juyi',
    dynasty: '唐',
    form: '长篇叙事诗',
    excerpt: '在天愿作比翼鸟，在地愿为连理枝。',
    fullText: '汉皇重色思倾国，御宇多年求不得。杨家有女初长成，养在深闺人未识。在天愿作比翼鸟，在地愿为连理枝。天长地久有时尽，此恨绵绵无绝期。',
    themes: ['爱情', '叙事', '历史']
  },
  {
    id: 'jinse',
    title: '锦瑟',
    poetId: 'li-shangyin',
    dynasty: '唐',
    form: '七言律诗',
    excerpt: '此情可待成追忆，只是当时已惘然。',
    fullText: '锦瑟无端五十弦，一弦一柱思华年。庄生晓梦迷蝴蝶，望帝春心托杜鹃。沧海月明珠有泪，蓝田日暖玉生烟。此情可待成追忆，只是当时已惘然。',
    themes: ['爱情', '象征', '追忆']
  },
  {
    id: 'shuidiaogetou',
    title: '水调歌头·明月几时有',
    poetId: 'su-shi',
    dynasty: '宋',
    form: '词',
    excerpt: '但愿人长久，千里共婵娟。',
    fullText: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。',
    themes: ['月', '人生', '旷达']
  },
  {
    id: 'nian-nu-jiao',
    title: '念奴娇·赤壁怀古',
    poetId: 'su-shi',
    dynasty: '宋',
    form: '词',
    excerpt: '大江东去，浪淘尽，千古风流人物。',
    fullText: '大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。人生如梦，一尊还酹江月。',
    themes: ['豪放', '怀古', '人生']
  },
  {
    id: 'shengshengman',
    title: '声声慢',
    poetId: 'li-qingzhao',
    dynasty: '宋',
    form: '词',
    excerpt: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。',
    fullText: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。乍暖还寒时候，最难将息。梧桐更兼细雨，到黄昏、点点滴滴。这次第，怎一个愁字了得！',
    themes: ['离乱', '愁', '婉约']
  },
  {
    id: 'po-zhenzi',
    title: '破阵子·为陈同甫赋壮词以寄之',
    poetId: 'xin-qiji',
    dynasty: '宋',
    form: '词',
    excerpt: '了却君王天下事，赢得生前身后名。',
    fullText: '醉里挑灯看剑，梦回吹角连营。八百里分麾下炙，五十弦翻塞外声。沙场秋点兵。了却君王天下事，赢得生前身后名。可怜白发生！',
    themes: ['家国', '英雄', '战争']
  },
  {
    id: 'qiusi',
    title: '天净沙·秋思',
    poetId: 'ma-zhiyuan',
    dynasty: '元明清',
    form: '元曲',
    excerpt: '夕阳西下，断肠人在天涯。',
    fullText: '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。',
    themes: ['羁旅', '秋思', '苍凉']
  },
  {
    id: 'changxiangsi',
    title: '长相思·山一程',
    poetId: 'nalan-xingde',
    dynasty: '元明清',
    form: '词',
    excerpt: '风一更，雪一更，聒碎乡心梦不成。',
    fullText: '山一程，水一程，身向榆关那畔行，夜深千帐灯。风一更，雪一更，聒碎乡心梦不成，故园无此声。',
    themes: ['羁旅', '乡心', '清词']
  },
  {
    id: 'kangqiao',
    title: '再别康桥',
    poetId: 'xu-zhimo',
    dynasty: '近现代',
    form: '现代诗',
    excerpt: '轻轻的我走了，正如我轻轻的来。',
    fullText: '轻轻的我走了，正如我轻轻的来；我轻轻的招手，作别西天的云彩。那河畔的金柳，是夕阳中的新娘。',
    themes: ['现代诗', '离别', '新月派']
  },
  {
    id: 'street-sky',
    title: '天上的街市',
    poetId: 'guo-moruo',
    dynasty: '近现代',
    form: '现代诗',
    excerpt: '远远的街灯明了，好像闪着无数的明星。',
    fullText: '远远的街灯明了，好像闪着无数的明星。天上的明星现了，好像点着无数的街灯。',
    themes: ['现代诗', '想象', '星空']
  }
];

export const poetById = Object.fromEntries(poets.map((poet) => [poet.id, poet]));
export const poemsByPoet = poets.reduce<Record<string, Poem[]>>((acc, poet) => {
  acc[poet.id] = poems.filter((poem) => poem.poetId === poet.id);
  return acc;
}, {});
