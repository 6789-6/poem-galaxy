import type { Poem } from './poetry';

export const canonicalPoems: Poem[] = [
  {
    id: 'qu-yuan-li-sao-core',
    title: '离骚',
    poetId: 'qu-yuan',
    dynasty: '先秦',
    form: '楚辞',
    excerpt: '路漫漫其修远兮，吾将上下而求索。',
    fullText: '帝高阳之苗裔兮，朕皇考曰伯庸。\n摄提贞于孟陬兮，惟庚寅吾以降。\n皇览揆余初度兮，肇锡余以嘉名。\n名余曰正则兮，字余曰灵均。\n路漫漫其修远兮，吾将上下而求索。',
    themes: ['楚辞', '家国', '求索', '浪漫']
  },
  {
    id: 'qu-yuan-jiu-ge-core',
    title: '九歌·湘夫人',
    poetId: 'qu-yuan',
    dynasty: '先秦',
    form: '楚辞',
    excerpt: '沅有芷兮澧有兰，思公子兮未敢言。',
    fullText: '帝子降兮北渚，目眇眇兮愁予。\n袅袅兮秋风，洞庭波兮木叶下。\n沅有芷兮澧有兰，思公子兮未敢言。\n荒忽兮远望，观流水兮潺湲。',
    themes: ['神话', '祭歌', '水泽', '思慕']
  },
  {
    id: 'tao-yuanming-yinjiu-5',
    title: '饮酒·其五',
    poetId: 'tao-yuanming',
    dynasty: '汉魏六朝',
    form: '五言古诗',
    excerpt: '采菊东篱下，悠然见南山。',
    fullText: '结庐在人境，而无车马喧。\n问君何能尔？心远地自偏。\n采菊东篱下，悠然见南山。\n山气日夕佳，飞鸟相与还。\n此中有真意，欲辨已忘言。',
    themes: ['田园', '归隐', '自然', '人生']
  },
  {
    id: 'tao-yuanming-guiyuan-1',
    title: '归园田居·其一',
    poetId: 'tao-yuanming',
    dynasty: '汉魏六朝',
    form: '五言古诗',
    excerpt: '羁鸟恋旧林，池鱼思故渊。',
    fullText: '少无适俗韵，性本爱丘山。\n误落尘网中，一去三十年。\n羁鸟恋旧林，池鱼思故渊。\n开荒南野际，守拙归园田。\n方宅十余亩，草屋八九间。\n榆柳荫后檐，桃李罗堂前。',
    themes: ['田园', '自由', '归隐']
  },
  {
    id: 'wang-wei-shanju-qiuming',
    title: '山居秋暝',
    poetId: 'wang-wei',
    dynasty: '唐',
    form: '五言律诗',
    excerpt: '明月松间照，清泉石上流。',
    fullText: '空山新雨后，天气晚来秋。\n明月松间照，清泉石上流。\n竹喧归浣女，莲动下渔舟。\n随意春芳歇，王孙自可留。',
    themes: ['山水', '禅意', '秋夜', '清寂']
  },
  {
    id: 'wang-wei-luchai',
    title: '鹿柴',
    poetId: 'wang-wei',
    dynasty: '唐',
    form: '五言绝句',
    excerpt: '空山不见人，但闻人语响。',
    fullText: '空山不见人，但闻人语响。\n返景入深林，复照青苔上。',
    themes: ['山水', '空寂', '禅意']
  },
  {
    id: 'meng-haoran-chunxiao',
    title: '春晓',
    poetId: 'meng-haoran',
    dynasty: '唐',
    form: '五言绝句',
    excerpt: '春眠不觉晓，处处闻啼鸟。',
    fullText: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。',
    themes: ['春天', '自然', '田园']
  },
  {
    id: 'meng-haoran-guogurenzhuang',
    title: '过故人庄',
    poetId: 'meng-haoran',
    dynasty: '唐',
    form: '五言律诗',
    excerpt: '绿树村边合，青山郭外斜。',
    fullText: '故人具鸡黍，邀我至田家。\n绿树村边合，青山郭外斜。\n开轩面场圃，把酒话桑麻。\n待到重阳日，还来就菊花。',
    themes: ['田园', '友情', '村居']
  },
  {
    id: 'li-bai-jingyesi',
    title: '静夜思',
    poetId: 'li-bai',
    dynasty: '唐',
    form: '五言绝句',
    excerpt: '举头望明月，低头思故乡。',
    fullText: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
    themes: ['月', '乡愁', '夜']
  },
  {
    id: 'li-bai-jiangjinjiu',
    title: '将进酒',
    poetId: 'li-bai',
    dynasty: '唐',
    form: '乐府歌行',
    excerpt: '天生我材必有用，千金散尽还复来。',
    fullText: '君不见黄河之水天上来，奔流到海不复回。\n君不见高堂明镜悲白发，朝如青丝暮成雪。\n人生得意须尽欢，莫使金樽空对月。\n天生我材必有用，千金散尽还复来。\n烹羊宰牛且为乐，会须一饮三百杯。',
    themes: ['酒', '豪放', '人生', '盛唐']
  },
  {
    id: 'li-bai-shudaonan',
    title: '蜀道难',
    poetId: 'li-bai',
    dynasty: '唐',
    form: '乐府歌行',
    excerpt: '蜀道之难，难于上青天。',
    fullText: '噫吁嚱，危乎高哉！\n蜀道之难，难于上青天！\n蚕丛及鱼凫，开国何茫然。\n尔来四万八千岁，不与秦塞通人烟。\n西当太白有鸟道，可以横绝峨眉巅。',
    themes: ['山川', '奇险', '浪漫', '想象']
  },
  {
    id: 'du-fu-chunwang',
    title: '春望',
    poetId: 'du-fu',
    dynasty: '唐',
    form: '五言律诗',
    excerpt: '国破山河在，城春草木深。',
    fullText: '国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。\n烽火连三月，家书抵万金。\n白头搔更短，浑欲不胜簪。',
    themes: ['家国', '战争', '现实', '长安']
  },
  {
    id: 'du-fu-denggao',
    title: '登高',
    poetId: 'du-fu',
    dynasty: '唐',
    form: '七言律诗',
    excerpt: '无边落木萧萧下，不尽长江滚滚来。',
    fullText: '风急天高猿啸哀，渚清沙白鸟飞回。\n无边落木萧萧下，不尽长江滚滚来。\n万里悲秋常作客，百年多病独登台。\n艰难苦恨繁霜鬓，潦倒新停浊酒杯。',
    themes: ['秋', '人生', '沉郁', '长江']
  },
  {
    id: 'du-fu-maowu',
    title: '茅屋为秋风所破歌',
    poetId: 'du-fu',
    dynasty: '唐',
    form: '歌行',
    excerpt: '安得广厦千万间，大庇天下寒士俱欢颜。',
    fullText: '八月秋高风怒号，卷我屋上三重茅。\n茅飞渡江洒江郊，高者挂罥长林梢，下者飘转沉塘坳。\n安得广厦千万间，大庇天下寒士俱欢颜，风雨不动安如山。',
    themes: ['民生', '现实', '忧患', '仁心']
  },
  {
    id: 'bai-juyi-pipayin',
    title: '琵琶行',
    poetId: 'bai-juyi',
    dynasty: '唐',
    form: '长篇叙事诗',
    excerpt: '同是天涯沦落人，相逢何必曾相识。',
    fullText: '浔阳江头夜送客，枫叶荻花秋瑟瑟。\n主人下马客在船，举酒欲饮无管弦。\n千呼万唤始出来，犹抱琵琶半遮面。\n同是天涯沦落人，相逢何必曾相识。',
    themes: ['音乐', '身世', '叙事', '江州']
  },
  {
    id: 'bai-juyi-maitanweng',
    title: '卖炭翁',
    poetId: 'bai-juyi',
    dynasty: '唐',
    form: '新乐府',
    excerpt: '可怜身上衣正单，心忧炭贱愿天寒。',
    fullText: '卖炭翁，伐薪烧炭南山中。\n满面尘灰烟火色，两鬓苍苍十指黑。\n可怜身上衣正单，心忧炭贱愿天寒。',
    themes: ['民生', '讽喻', '现实']
  },
  {
    id: 'li-he-yanmen',
    title: '雁门太守行',
    poetId: 'li-he',
    dynasty: '唐',
    form: '七言古诗',
    excerpt: '黑云压城城欲摧，甲光向日金鳞开。',
    fullText: '黑云压城城欲摧，甲光向日金鳞开。\n角声满天秋色里，塞上燕脂凝夜紫。\n半卷红旗临易水，霜重鼓寒声不起。\n报君黄金台上意，提携玉龙为君死。',
    themes: ['边塞', '战争', '奇崛', '色彩']
  },
  {
    id: 'li-shangyin-jinse',
    title: '锦瑟',
    poetId: 'li-shangyin',
    dynasty: '唐',
    form: '七言律诗',
    excerpt: '此情可待成追忆，只是当时已惘然。',
    fullText: '锦瑟无端五十弦，一弦一柱思华年。\n庄生晓梦迷蝴蝶，望帝春心托杜鹃。\n沧海月明珠有泪，蓝田日暖玉生烟。\n此情可待成追忆，只是当时已惘然。',
    themes: ['爱情', '追忆', '象征', '晚唐']
  },
  {
    id: 'li-shangyin-yeyu',
    title: '夜雨寄北',
    poetId: 'li-shangyin',
    dynasty: '唐',
    form: '七言绝句',
    excerpt: '何当共剪西窗烛，却话巴山夜雨时。',
    fullText: '君问归期未有期，巴山夜雨涨秋池。\n何当共剪西窗烛，却话巴山夜雨时。',
    themes: ['夜雨', '思念', '巴山']
  },
  {
    id: 'du-mu-boqinhuai',
    title: '泊秦淮',
    poetId: 'du-mu',
    dynasty: '唐',
    form: '七言绝句',
    excerpt: '商女不知亡国恨，隔江犹唱后庭花。',
    fullText: '烟笼寒水月笼沙，夜泊秦淮近酒家。\n商女不知亡国恨，隔江犹唱后庭花。',
    themes: ['咏史', '秦淮', '晚唐']
  },
  {
    id: 'du-mu-shanxing',
    title: '山行',
    poetId: 'du-mu',
    dynasty: '唐',
    form: '七言绝句',
    excerpt: '停车坐爱枫林晚，霜叶红于二月花。',
    fullText: '远上寒山石径斜，白云生处有人家。\n停车坐爱枫林晚，霜叶红于二月花。',
    themes: ['秋山', '枫叶', '清丽']
  },
  {
    id: 'su-shi-shuidiaogetou',
    title: '水调歌头·明月几时有',
    poetId: 'su-shi',
    dynasty: '宋',
    form: '词',
    excerpt: '但愿人长久，千里共婵娟。',
    fullText: '明月几时有？把酒问青天。\n不知天上宫阙，今夕是何年。\n我欲乘风归去，又恐琼楼玉宇，高处不胜寒。\n但愿人长久，千里共婵娟。',
    themes: ['明月', '人生', '亲情', '豪放']
  },
  {
    id: 'su-shi-chibi',
    title: '念奴娇·赤壁怀古',
    poetId: 'su-shi',
    dynasty: '宋',
    form: '词',
    excerpt: '大江东去，浪淘尽，千古风流人物。',
    fullText: '大江东去，浪淘尽，千古风流人物。\n故垒西边，人道是，三国周郎赤壁。\n乱石穿空，惊涛拍岸，卷起千堆雪。\n江山如画，一时多少豪杰。',
    themes: ['赤壁', '怀古', '豪放', '江山']
  },
  {
    id: 'su-shi-tixilinbi',
    title: '题西林壁',
    poetId: 'su-shi',
    dynasty: '宋',
    form: '七言绝句',
    excerpt: '不识庐山真面目，只缘身在此山中。',
    fullText: '横看成岭侧成峰，远近高低各不同。\n不识庐山真面目，只缘身在此山中。',
    themes: ['哲思', '山水', '庐山']
  },
  {
    id: 'huang-tingjian-dengkuaige',
    title: '登快阁',
    poetId: 'huang-tingjian',
    dynasty: '宋',
    form: '七言律诗',
    excerpt: '落木千山天远大，澄江一道月分明。',
    fullText: '痴儿了却公家事，快阁东西倚晚晴。\n落木千山天远大，澄江一道月分明。\n朱弦已为佳人绝，青眼聊因美酒横。\n万里归船弄长笛，此心吾与白鸥盟。',
    themes: ['江西诗派', '登临', '江月']
  },
  {
    id: 'li-qingzhao-shengshengman',
    title: '声声慢·寻寻觅觅',
    poetId: 'li-qingzhao',
    dynasty: '宋',
    form: '词',
    excerpt: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。',
    fullText: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。\n乍暖还寒时候，最难将息。\n三杯两盏淡酒，怎敌他、晚来风急。\n梧桐更兼细雨，到黄昏、点点滴滴。',
    themes: ['婉约', '离乱', '秋声', '女性书写']
  },
  {
    id: 'li-qingzhao-rumengling',
    title: '如梦令·常记溪亭日暮',
    poetId: 'li-qingzhao',
    dynasty: '宋',
    form: '词',
    excerpt: '争渡，争渡，惊起一滩鸥鹭。',
    fullText: '常记溪亭日暮，沉醉不知归路。\n兴尽晚回舟，误入藕花深处。\n争渡，争渡，惊起一滩鸥鹭。',
    themes: ['婉约', '少女', '湖上', '清丽']
  },
  {
    id: 'xin-qiji-pozhengzi',
    title: '破阵子·为陈同甫赋壮词以寄之',
    poetId: 'xin-qiji',
    dynasty: '宋',
    form: '词',
    excerpt: '了却君王天下事，赢得生前身后名。',
    fullText: '醉里挑灯看剑，梦回吹角连营。\n八百里分麾下炙，五十弦翻塞外声。\n沙场秋点兵。\n了却君王天下事，赢得生前身后名。\n可怜白发生！',
    themes: ['豪放', '家国', '军旅', '英雄']
  },
  {
    id: 'xin-qiji-qingyuanxi',
    title: '青玉案·元夕',
    poetId: 'xin-qiji',
    dynasty: '宋',
    form: '词',
    excerpt: '蓦然回首，那人却在，灯火阑珊处。',
    fullText: '东风夜放花千树，更吹落、星如雨。\n宝马雕车香满路。\n凤箫声动，玉壶光转，一夜鱼龙舞。\n众里寻他千百度。\n蓦然回首，那人却在，灯火阑珊处。',
    themes: ['元夕', '灯火', '寻觅', '豪婉']
  },
  {
    id: 'lu-you-shier',
    title: '示儿',
    poetId: 'lu-you',
    dynasty: '宋',
    form: '七言绝句',
    excerpt: '王师北定中原日，家祭无忘告乃翁。',
    fullText: '死去元知万事空，但悲不见九州同。\n王师北定中原日，家祭无忘告乃翁。',
    themes: ['家国', '南宋', '遗愿']
  },
  {
    id: 'lu-you-you-shanxi',
    title: '游山西村',
    poetId: 'lu-you',
    dynasty: '宋',
    form: '七言律诗',
    excerpt: '山重水复疑无路，柳暗花明又一村。',
    fullText: '莫笑农家腊酒浑，丰年留客足鸡豚。\n山重水复疑无路，柳暗花明又一村。\n箫鼓追随春社近，衣冠简朴古风存。\n从今若许闲乘月，拄杖无时夜叩门。',
    themes: ['田园', '山村', '人生']
  },
  {
    id: 'ouyang-xiu-dieshua',
    title: '蝶恋花·庭院深深深几许',
    poetId: 'ouyang-xiu',
    dynasty: '宋',
    form: '词',
    excerpt: '庭院深深深几许，杨柳堆烟，帘幕无重数。',
    fullText: '庭院深深深几许，杨柳堆烟，帘幕无重数。\n玉勒雕鞍游冶处，楼高不见章台路。\n雨横风狂三月暮，门掩黄昏，无计留春住。\n泪眼问花花不语，乱红飞过秋千去。',
    themes: ['婉约', '春暮', '庭院']
  },
  {
    id: 'wang-anshi-bochuanguazhou',
    title: '泊船瓜洲',
    poetId: 'wang-anshi',
    dynasty: '宋',
    form: '七言绝句',
    excerpt: '春风又绿江南岸，明月何时照我还。',
    fullText: '京口瓜洲一水间，钟山只隔数重山。\n春风又绿江南岸，明月何时照我还。',
    themes: ['江南', '春风', '乡思']
  },
  {
    id: 'liu-yuxi-wuyi',
    title: '乌衣巷',
    poetId: 'liu-yuxi',
    dynasty: '唐',
    form: '七言绝句',
    excerpt: '旧时王谢堂前燕，飞入寻常百姓家。',
    fullText: '朱雀桥边野草花，乌衣巷口夕阳斜。\n旧时王谢堂前燕，飞入寻常百姓家。',
    themes: ['怀古', '金陵', '兴亡']
  },
  {
    id: 'liu-yuxi-loushi',
    title: '陋室铭',
    poetId: 'liu-yuxi',
    dynasty: '唐',
    form: '铭文',
    excerpt: '斯是陋室，惟吾德馨。',
    fullText: '山不在高，有仙则名。水不在深，有龙则灵。\n斯是陋室，惟吾德馨。\n苔痕上阶绿，草色入帘青。\n谈笑有鸿儒，往来无白丁。',
    themes: ['人格', '清雅', '铭文']
  },
  {
    id: 'ma-zhiyuan-tianjingsha',
    title: '天净沙·秋思',
    poetId: 'ma-zhiyuan',
    dynasty: '元明清',
    form: '小令',
    excerpt: '夕阳西下，断肠人在天涯。',
    fullText: '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。\n夕阳西下，断肠人在天涯。',
    themes: ['羁旅', '秋思', '元曲']
  },
  {
    id: 'nalan-xingde-changxiangsi',
    title: '长相思·山一程',
    poetId: 'nalan-xingde',
    dynasty: '元明清',
    form: '词',
    excerpt: '山一程，水一程，身向榆关那畔行。',
    fullText: '山一程，水一程，身向榆关那畔行，夜深千帐灯。\n风一更，雪一更，聒碎乡心梦不成，故园无此声。',
    themes: ['清词', '羁旅', '乡心']
  },
  {
    id: 'gong-zizhen-jihai',
    title: '己亥杂诗·其五',
    poetId: 'gong-zizhen',
    dynasty: '元明清',
    form: '七言绝句',
    excerpt: '落红不是无情物，化作春泥更护花。',
    fullText: '浩荡离愁白日斜，吟鞭东指即天涯。\n落红不是无情物，化作春泥更护花。',
    themes: ['晚清', '变革', '离愁']
  },
  {
    id: 'modern-xu-zhimo-index',
    title: '再别康桥',
    poetId: 'xu-zhimo',
    dynasty: '近现代',
    form: '现代诗索引',
    excerpt: '现代诗版权文本暂以索引展示，适合后续接入公开授权版本。',
    fullText: '作品索引：再别康桥。\n说明：近现代诗歌文本涉及版权，当前版本只展示题名、主题和诗人关系，不内置未授权全文。',
    themes: ['现代诗', '新月派', '索引']
  },
  {
    id: 'modern-aiqing-index',
    title: '大堰河——我的保姆',
    poetId: 'ai-qing',
    dynasty: '近现代',
    form: '现代诗索引',
    excerpt: '现代诗版权文本暂以索引展示，适合后续接入公开授权版本。',
    fullText: '作品索引：大堰河——我的保姆。\n说明：近现代诗歌文本涉及版权，当前版本只展示题名、主题和诗人关系，不内置未授权全文。',
    themes: ['现代诗', '土地', '索引']
  },
  {
    id: 'modern-beidao-index',
    title: '回答',
    poetId: 'bei-dao',
    dynasty: '近现代',
    form: '现代诗索引',
    excerpt: '现代诗版权文本暂以索引展示，适合后续接入公开授权版本。',
    fullText: '作品索引：回答。\n说明：近现代诗歌文本涉及版权，当前版本只展示题名、主题和诗人关系，不内置未授权全文。',
    themes: ['现代诗', '朦胧诗', '索引']
  },
  {
    id: 'modern-shuting-index',
    title: '致橡树',
    poetId: 'shu-ting',
    dynasty: '近现代',
    form: '现代诗索引',
    excerpt: '现代诗版权文本暂以索引展示，适合后续接入公开授权版本。',
    fullText: '作品索引：致橡树。\n说明：近现代诗歌文本涉及版权，当前版本只展示题名、主题和诗人关系，不内置未授权全文。',
    themes: ['现代诗', '女性书写', '索引']
  }
];
