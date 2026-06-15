import {
  poets as seedPoets,
  poems as seedPoems,
  dynastyColors,
  dynastyOrder,
  type Dynasty,
  type Poet,
  type Poem
} from './poetry';

const extraPoets: Poet[] = [
  {
    id: 'shijing-anon',
    name: '诗经作者群',
    dynasty: '先秦',
    years: '约前11世纪—前6世纪',
    summary: '《诗经》所代表的早期诗歌共同体，保留风、雅、颂中的民间歌唱、礼乐秩序与历史记忆。',
    brightness: 1.15,
    position: [-66, 2, -28],
    themes: ['诗经', '风雅', '民歌'],
    works: ['关雎', '蒹葭', '采薇'],
    relations: ['qu-yuan', 'cao-zhi']
  },
  {
    id: 'cao-cao',
    name: '曹操',
    dynasty: '汉魏六朝',
    years: '155—220',
    summary: '建安文学核心人物之一，以雄健苍凉的气象开拓汉魏诗歌的新格局。',
    brightness: 1.08,
    position: [-52, -15, 8],
    themes: ['建安', '慷慨', '英雄'],
    works: ['观沧海', '短歌行'],
    relations: ['cao-zhi', 'tao-yuanming']
  },
  {
    id: 'cao-zhi',
    name: '曹植',
    dynasty: '汉魏六朝',
    years: '192—232',
    summary: '建安诗人的重要代表，辞采华茂而情感沉郁。',
    brightness: 1.1,
    position: [-44, -20, 2],
    themes: ['建安', '辞采', '悲慨'],
    works: ['七步诗', '洛神赋'],
    relations: ['cao-cao', 'xie-lingyun']
  },
  {
    id: 'xie-lingyun',
    name: '谢灵运',
    dynasty: '汉魏六朝',
    years: '385—433',
    summary: '山水诗的开拓者，把山川游观转化为精密的诗歌空间。',
    brightness: 1.0,
    position: [-36, 4, 27],
    themes: ['山水', '游观', '玄言'],
    works: ['登池上楼', '石壁精舍还湖中作'],
    relations: ['tao-yuanming', 'wang-wei']
  },
  {
    id: 'yu-xin',
    name: '庾信',
    dynasty: '汉魏六朝',
    years: '513—581',
    summary: '南北朝文学转折中的关键诗人，兼具宫体余韵与故国沉痛。',
    brightness: 0.94,
    position: [-20, -18, 24],
    themes: ['南北朝', '乡关', '沉郁'],
    works: ['拟咏怀', '哀江南赋'],
    relations: ['du-fu', 'li-shangyin']
  },
  {
    id: 'chen-ziang',
    name: '陈子昂',
    dynasty: '唐',
    years: '661—702',
    summary: '初唐诗歌革新者，倡导风骨，开启盛唐气象的前奏。',
    brightness: 0.98,
    position: [-18, 22, -24],
    themes: ['风骨', '初唐', '怀古'],
    works: ['登幽州台歌'],
    relations: ['li-bai', 'du-fu']
  },
  {
    id: 'zhang-jiuling',
    name: '张九龄',
    dynasty: '唐',
    years: '678—740',
    summary: '盛唐前期名相与诗人，以清雅高华见长。',
    brightness: 0.92,
    position: [-2, 28, -22],
    themes: ['清雅', '感遇', '盛唐'],
    works: ['望月怀远', '感遇'],
    relations: ['meng-haoran', 'wang-wei']
  },
  {
    id: 'gao-shi',
    name: '高适',
    dynasty: '唐',
    years: '704—765',
    summary: '边塞诗代表之一，诗风雄浑质直，具有强烈现实感。',
    brightness: 1.0,
    position: [2, 14, -30],
    themes: ['边塞', '现实', '壮阔'],
    works: ['燕歌行', '别董大'],
    relations: ['cen-shen', 'du-fu', 'li-bai']
  },
  {
    id: 'cen-shen',
    name: '岑参',
    dynasty: '唐',
    years: '约715—770',
    summary: '边塞诗代表，善写奇寒壮丽的西域景象。',
    brightness: 1.02,
    position: [12, 18, -32],
    themes: ['边塞', '西域', '奇景'],
    works: ['白雪歌送武判官归京', '逢入京使'],
    relations: ['gao-shi', 'du-fu']
  },
  {
    id: 'liu-changqing',
    name: '刘长卿',
    dynasty: '唐',
    years: '约709—约789',
    summary: '中唐诗人，长于五言，以清冷孤远的意境见称。',
    brightness: 0.86,
    position: [23, 20, -25],
    themes: ['五言', '羁旅', '清冷'],
    works: ['逢雪宿芙蓉山主人', '送灵澈上人'],
    relations: ['wang-wei', 'wei-yingwu']
  },
  {
    id: 'wei-yingwu',
    name: '韦应物',
    dynasty: '唐',
    years: '737—约792',
    summary: '山水田园诗名家，诗风澄淡高远。',
    brightness: 0.9,
    position: [18, 25, -13],
    themes: ['山水', '田园', '澄淡'],
    works: ['滁州西涧', '寄李儋元锡'],
    relations: ['wang-wei', 'liu-changqing']
  },
  {
    id: 'meng-jiao',
    name: '孟郊',
    dynasty: '唐',
    years: '751—814',
    summary: '中唐苦吟诗人，以寒瘦奇峭与深切情感著称。',
    brightness: 0.9,
    position: [32, -15, -18],
    themes: ['苦吟', '亲情', '寒瘦'],
    works: ['游子吟'],
    relations: ['han-yu', 'jia-dao']
  },
  {
    id: 'han-yu',
    name: '韩愈',
    dynasty: '唐',
    years: '768—824',
    summary: '古文运动领袖，同时以险怪雄奇的诗风拓展中唐诗歌边界。',
    brightness: 1.08,
    position: [35, -9, -8],
    themes: ['古文', '奇崛', '中唐'],
    works: ['左迁至蓝关示侄孙湘', '山石'],
    relations: ['meng-jiao', 'liu-yuxi', 'bai-juyi']
  },
  {
    id: 'liu-yuxi',
    name: '刘禹锡',
    dynasty: '唐',
    years: '772—842',
    summary: '中唐诗人，豪健明朗，咏史怀古与民歌吸收皆有新意。',
    brightness: 1.04,
    position: [42, -4, -12],
    themes: ['咏史', '豪健', '民歌'],
    works: ['陋室铭', '乌衣巷', '竹枝词'],
    relations: ['bai-juyi', 'han-yu', 'du-mu']
  },
  {
    id: 'yuan-zhen',
    name: '元稹',
    dynasty: '唐',
    years: '779—831',
    summary: '新乐府运动重要诗人，与白居易并称元白。',
    brightness: 0.92,
    position: [31, -12, 8],
    themes: ['新乐府', '爱情', '元白'],
    works: ['离思', '遣悲怀'],
    relations: ['bai-juyi']
  },
  {
    id: 'jia-dao',
    name: '贾岛',
    dynasty: '唐',
    years: '779—843',
    summary: '苦吟诗人的代表，讲求炼字炼句。',
    brightness: 0.84,
    position: [28, -24, -9],
    themes: ['苦吟', '炼字', '幽僻'],
    works: ['寻隐者不遇', '题李凝幽居'],
    relations: ['meng-jiao', 'han-yu']
  },
  {
    id: 'wen-tingyun',
    name: '温庭筠',
    dynasty: '唐',
    years: '约812—约866',
    summary: '花间词派先声，诗词皆富丽精工。',
    brightness: 1.02,
    position: [45, 12, -18],
    themes: ['花间', '艳丽', '晚唐'],
    works: ['菩萨蛮', '商山早行'],
    relations: ['li-shangyin', 'li-qingzhao']
  },
  {
    id: 'feng-yansi',
    name: '冯延巳',
    dynasty: '宋',
    years: '903—960',
    summary: '五代词人，深婉绵邈，为宋词成熟提供重要前奏。',
    brightness: 0.88,
    position: [-4, -32, 42],
    themes: ['五代词', '婉约', '深情'],
    works: ['鹊踏枝'],
    relations: ['yan-shu', 'li-qingzhao']
  },
  {
    id: 'yan-shu',
    name: '晏殊',
    dynasty: '宋',
    years: '991—1055',
    summary: '北宋词坛重要人物，词风富贵闲雅而含人生感喟。',
    brightness: 0.96,
    position: [7, -32, 44],
    themes: ['婉约', '闲雅', '北宋词'],
    works: ['浣溪沙', '蝶恋花'],
    relations: ['ouyang-xiu', 'yan-jidao']
  },
  {
    id: 'ouyang-xiu',
    name: '欧阳修',
    dynasty: '宋',
    years: '1007—1072',
    summary: '北宋文坛领袖，诗文词兼擅，推动宋代文学风气。',
    brightness: 1.12,
    position: [2, -18, 48],
    themes: ['北宋', '文章', '词'],
    works: ['蝶恋花', '醉翁亭记'],
    relations: ['su-shi', 'yan-shu']
  },
  {
    id: 'wang-anshi',
    name: '王安石',
    dynasty: '宋',
    years: '1021—1086',
    summary: '政治家与文学家，诗风精警峭拔，晚年山水小诗尤见清峻。',
    brightness: 1.06,
    position: [10, -28, 50],
    themes: ['改革', '清峻', '宋诗'],
    works: ['泊船瓜洲', '梅花'],
    relations: ['su-shi', 'ouyang-xiu']
  },
  {
    id: 'yan-jidao',
    name: '晏几道',
    dynasty: '宋',
    years: '约1038—约1110',
    summary: '北宋词人，以小令写深情旧梦，精致而凄艳。',
    brightness: 0.92,
    position: [20, -31, 41],
    themes: ['小令', '深情', '婉约'],
    works: ['临江仙', '鹧鸪天'],
    relations: ['yan-shu', 'li-qingzhao']
  },
  {
    id: 'zhou-bangyan',
    name: '周邦彦',
    dynasty: '宋',
    years: '1056—1121',
    summary: '格律派词宗，擅长铺叙与精密声律。',
    brightness: 1.02,
    position: [31, -28, 36],
    themes: ['格律', '铺叙', '婉约'],
    works: ['兰陵王', '苏幕遮'],
    relations: ['li-qingzhao', 'jiang-kui']
  },
  {
    id: 'lu-you',
    name: '陆游',
    dynasty: '宋',
    years: '1125—1210',
    summary: '南宋诗人，存诗极多，爱国情怀与日常书写共同构成宏大诗歌星区。',
    brightness: 1.36,
    position: [46, -10, 36],
    themes: ['爱国', '日常', '南宋'],
    works: ['示儿', '游山西村', '书愤'],
    relations: ['xin-qiji', 'du-fu', 'yang-wanli']
  },
  {
    id: 'yang-wanli',
    name: '杨万里',
    dynasty: '宋',
    years: '1127—1206',
    summary: '南宋诗人，诚斋体清新活泼，善从日常景物中见生机。',
    brightness: 0.98,
    position: [43, -20, 42],
    themes: ['诚斋体', '自然', '日常'],
    works: ['小池', '晓出净慈寺送林子方'],
    relations: ['lu-you', 'fan-chengda']
  },
  {
    id: 'fan-chengda',
    name: '范成大',
    dynasty: '宋',
    years: '1126—1193',
    summary: '南宋诗人，田园组诗与社会观察兼具。',
    brightness: 0.96,
    position: [36, -24, 48],
    themes: ['田园', '南宋', '社会'],
    works: ['四时田园杂兴'],
    relations: ['yang-wanli', 'lu-you']
  },
  {
    id: 'jiang-kui',
    name: '姜夔',
    dynasty: '宋',
    years: '约1155—约1221',
    summary: '南宋词人，清空骚雅，兼具音乐性与冷逸气质。',
    brightness: 0.98,
    position: [49, -28, 30],
    themes: ['清空', '音乐', '词'],
    works: ['扬州慢', '暗香'],
    relations: ['zhou-bangyan', 'li-qingzhao']
  },
  {
    id: 'guan-hanqing',
    name: '关汉卿',
    dynasty: '元明清',
    years: '约1220—约1300',
    summary: '元杂剧奠基者，剧曲语言泼辣鲜活，关注世情与女性命运。',
    brightness: 1.08,
    position: [48, 14, 40],
    themes: ['元曲', '杂剧', '世情'],
    works: ['窦娥冤', '救风尘'],
    relations: ['ma-zhiyuan']
  },
  {
    id: 'zhang-yanghao',
    name: '张养浩',
    dynasty: '元明清',
    years: '1270—1329',
    summary: '元代散曲家，以苍凉历史感与民生关怀见长。',
    brightness: 0.9,
    position: [54, 9, 38],
    themes: ['散曲', '怀古', '民生'],
    works: ['山坡羊·潼关怀古'],
    relations: ['ma-zhiyuan', 'guan-hanqing']
  },
  {
    id: 'gao-qi',
    name: '高启',
    dynasty: '元明清',
    years: '1336—1374',
    summary: '明初诗人，才气高华，承接唐宋传统而自具清俊。',
    brightness: 0.86,
    position: [60, 3, 28],
    themes: ['明初', '清俊', '怀古'],
    works: ['登金陵雨花台望大江'],
    relations: ['du-fu', 'yuan-mei']
  },
  {
    id: 'tang-yin',
    name: '唐寅',
    dynasty: '元明清',
    years: '1470—1524',
    summary: '明代文人画家与诗人，才情放逸，诗画相生。',
    brightness: 0.94,
    position: [63, -3, 25],
    themes: ['明代', '诗画', '风流'],
    works: ['桃花庵歌'],
    relations: ['yuan-mei']
  },
  {
    id: 'yuan-mei',
    name: '袁枚',
    dynasty: '元明清',
    years: '1716—1797',
    summary: '清代性灵派代表，强调真情、灵机与个人感受。',
    brightness: 0.96,
    position: [66, -13, 24],
    themes: ['性灵', '清诗', '真情'],
    works: ['苔', '所见'],
    relations: ['nalan-xingde', 'gong-zizhen']
  },
  {
    id: 'gong-zizhen',
    name: '龚自珍',
    dynasty: '元明清',
    years: '1792—1841',
    summary: '晚清思想家与诗人，以思想锋芒和时代忧患开启近代诗歌感受。',
    brightness: 1.06,
    position: [72, -5, 18],
    themes: ['晚清', '忧患', '思想'],
    works: ['己亥杂诗'],
    relations: ['yuan-mei', 'guo-moruo']
  },
  {
    id: 'wen-yiduo',
    name: '闻一多',
    dynasty: '近现代',
    years: '1899—1946',
    summary: '现代诗人、学者，新格律诗理论的重要推动者。',
    brightness: 0.9,
    position: [62, 22, -16],
    themes: ['现代诗', '新格律', '学者'],
    works: ['死水', '红烛'],
    relations: ['xu-zhimo', 'ai-qing']
  },
  {
    id: 'dai-wangshu',
    name: '戴望舒',
    dynasty: '近现代',
    years: '1905—1950',
    summary: '现代派诗人，以象征、音乐性与都市孤独感形成独特诗风。',
    brightness: 0.9,
    position: [69, 16, -18],
    themes: ['现代派', '象征', '孤独'],
    works: ['雨巷', '我用残损的手掌'],
    relations: ['xu-zhimo', 'bei-dao']
  },
  {
    id: 'ai-qing',
    name: '艾青',
    dynasty: '近现代',
    years: '1910—1996',
    summary: '现代诗代表，以土地、太阳和民族苦难构成宽阔沉雄的诗歌图景。',
    brightness: 1.0,
    position: [76, 8, -6],
    themes: ['土地', '太阳', '现代诗'],
    works: ['大堰河——我的保姆', '我爱这土地'],
    relations: ['guo-moruo', 'wen-yiduo', 'shu-ting']
  },
  {
    id: 'mu-dan',
    name: '穆旦',
    dynasty: '近现代',
    years: '1918—1977',
    summary: '九叶派重要诗人，将现代经验、理性张力和复杂自我写入汉语新诗。',
    brightness: 0.9,
    position: [75, -4, -14],
    themes: ['九叶派', '现代性', '理性'],
    works: ['赞美', '诗八首'],
    relations: ['dai-wangshu', 'bei-dao']
  },
  {
    id: 'bei-dao',
    name: '北岛',
    dynasty: '近现代',
    years: '1949—',
    summary: '朦胧诗代表，以冷峻凝练的语言表达一代人的精神处境。',
    brightness: 0.92,
    position: [82, 2, -11],
    themes: ['朦胧诗', '现代性', '精神'],
    works: ['回答', '一切'],
    relations: ['shu-ting', 'dai-wangshu', 'mu-dan']
  },
  {
    id: 'shu-ting',
    name: '舒婷',
    dynasty: '近现代',
    years: '1952—',
    summary: '朦胧诗代表诗人之一，以温柔而坚韧的抒情表达主体意识。',
    brightness: 0.9,
    position: [80, -10, -1],
    themes: ['朦胧诗', '女性书写', '抒情'],
    works: ['致橡树', '祖国啊，我亲爱的祖国'],
    relations: ['bei-dao', 'ai-qing']
  }
];

const generatedPoems: Poem[] = extraPoets.map((poet) => ({
  id: `${poet.id}-overview`,
  title: poet.works[0] ?? `${poet.name}代表作`,
  poetId: poet.id,
  dynasty: poet.dynasty,
  form: poet.dynasty === '近现代' ? '现代诗 / 代表作' : '代表作',
  excerpt: `${poet.name}星域：${poet.themes.join('、')}。`,
  fullText: `${poet.summary}\n\n代表作品：${poet.works.join('、')}。`,
  themes: poet.themes
}));

export { dynastyColors, dynastyOrder };
export type { Dynasty, Poet, Poem };

export const poets: Poet[] = [...seedPoets, ...extraPoets];
export const poems: Poem[] = [...seedPoems, ...generatedPoems];
export const poetById = Object.fromEntries(poets.map((poet) => [poet.id, poet]));
export const poemsByPoet = poets.reduce<Record<string, Poem[]>>((acc, poet) => {
  acc[poet.id] = poems.filter((poem) => poem.poetId === poet.id);
  return acc;
}, {});
