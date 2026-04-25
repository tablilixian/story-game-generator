import { logger, LogCategory } from './logger';
import { getActiveChatModel } from './modelRegistry';
import { chatCompletion } from './ai/apiCore';
import type { NovelCharacter, NovelScene, NovelChapter } from '../types';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

interface ExtractionResult {
  characters: NovelCharacter[];
  scenes: NovelScene[];
}

const CHARACTER_EXTRACTION_PROMPT = `你是一个专业的小说分析专家。你的任务是从给定的小说章节文本中，提取结构化的事实信息。

## 核心原则
- **绝对禁止编造**：只能提取文本中明确写到的内容，绝对不能凭空编造人物、事件或任何信息
- **只提取本章出现的人物**：不要提取其他章节或其他小说的人物
- 所有人名必须使用原文中出现的名称，一字不差
- 适用于任何类型的小说：古典文言小说、现代网文、翻译文学等

## 提取规则 ⚠️ 非常重要

### 基本规则
1. **必须提取本章所有有名字或固定称呼的人物，宁多勿漏**
2. 有名字的人物必须提取，如"韩立""甄士隐""高俅""孙悟空"
3. 有固定称呼的人物也算，如"三叔""韩胖子""石猴""国王""王后"
4. **种族/物种名称作为称呼的角色也算**，如"赤尻马猴""通背猿猴""金翅大鹏""白骨精"——只要在文中有具体行为或对话就必须提取
5. **不要提取泛称和代词**：
   - ❌ "老者""少年""那人""路人""众人""其他人""大家""对方""旁人""来人不"都不是人名
   - ❌ 纯职务头衔如"堂主""长老""弟子"如果没有姓氏不应提取

### 称呼完整性规则
6. **使用完整称呼**：如果原文中的称呼是"二愣子"，不要截断为"愣子"；如果是"韩胖子"，不要截断为"胖子"。必须使用原文中的完整称呼

### 别名识别规则 ⚠️ 关键
7. 同一人有多个称呼时，最正式的名字作为 name，其他作为 new_aliases
8. **注意区分**：如果两个称呼在文中指代不同的人（如"老猴"和"通背猿猴"可能是不同角色），应分别提取
9. **别名识别模式**：
   - "X叫作Y""X被称为Y""又名X" → Y 是 X 的别名
   - **名·字·号**（古文常见）：如"姓贾名化，表字时飞，别号雨村"→ name="贾雨村"，new_aliases=["贾化", "时飞"]
   - **简称**：如"甄士隐"的"士隐"、"林如海"的"如海"在文中反复使用时应作为别名

### 别名禁止规则 ⚠️ 必须遵守
10. **别名不能是另一个独立角色**：如果 A 和 B 都是有各自行为、对话的独立角色，B 不能作为 A 的别名。例如李逵和李俊是不同的人，即使同姓"李"
11. **别名必须有文本依据**：只有文中明确表明 X 和 Y 是同一人（如"X 又名 Y""X 即 Y"或叙述中交替使用指代同一人）时才能标为别名。不要仅因为两个名字出现在同一段就认为是别名
12. **泛称/通称不是别名**：如"好汉""兄弟""娘子""太尉""大人""头领"等可指代多人的通用称呼不应作为任何人的别名
13. **梦境/幻觉/回忆中的角色是独立的**：角色在梦境、幻觉中遇到的仙童、神将等仍是独立角色，不是做梦者的别名

### 常见错误警告 ⚠️ 避免踩坑
14. ❌ **不要把地名子串当人名**：文中"韩国"不表示有人物叫"韩"；"王朝"不表示有人物叫"王"
15. ❌ **不要把描述性称呼当人名**："墨大夫女儿""韩家二弟""村长的妻子"是描述性引用，不是人名
16. ❌ **不要凭称谓推断关系**：两个人物出现在同一章但无直接互动时，不要编造关系

### 防止幻觉
17. **⚠️ 在提取每个人物时，必须确认该人物是否在本章原文中有明确出现**
18. 如果你无法确定某人物是否在本章出现，**不要提取**
19. 不要因为你"知道"某本小说有哪些角色就提取他们，必须本章有实际描写才提取

## 提取内容
- 角色名称（name）：必须使用原文中的完整姓名/称呼
- 别名（new_aliases）：绰号、乳名、简称等
- 性别（gender）：male/female/unknown
- 年龄（age）：如"17岁""少年""青年"
- 外貌描述（appearance）：原文中的外貌描写
- 角色定位（role）：protagonist（主角）/supporting（配角）/antagonist（反派）/minor（龙套）
- 本章出场地点（locations_in_chapter）：该角色在本章出现的地点

## 输出格式
请严格按照以下 JSON 格式输出（不要包含示例中的任何内容，示例仅供参考格式）：

{
  "characters": [
    {
      "key": "角色拼音缩写",
      "name": "角色姓名",
      "new_aliases": ["别名1", "别名2"],
      "color": "#颜色代码",
      "gender": "male/female/unknown",
      "age": "年龄描述",
      "personality": "性格特点",
      "appearance": "外貌描述",
      "role": "protagonist/supporting/antagonist/minor",
      "locations_in_chapter": ["地点1", "地点2"]
    }
  ]
}

## 规则
1. key 使用英文拼音缩写，多音节用下划线分隔
2. 主角用蓝色系(#3498db)，配角绿色系(#27ae60)，反派红色系(#e74c3c)
3. 只输出 JSON，不要其他内容
4. **严格按照原文提取，不要添加任何不存在的信息**

## 小说章节：
`;

const SCENE_EXTRACTION_PROMPT = `你是一个专业的小说分析专家。你的任务是从给定的小说章节文本中，提取结构化的事实信息。

## 核心原则
- **绝对禁止编造**：只能提取文本中明确写到的地点，绝对不能凭空编造地名
- **只提取本章出现的地点**：不要提取其他章节或其他小说的地点
- 所有地名必须使用原文中出现的名称，一字不差
- 适用于任何类型的小说：古典文言小说、现代网文、翻译文学等

## 提取规则 ⚠️ 非常重要

### 基本规则
1. **必须提取本章所有明确提到的地点，宁多勿漏**
2. 有具体名称的地点必须提取，如"千翠山""迷踪岭""逍遥峰"
3. 室内场所也算，如"水云间""洞府""房间""大厅"
4. **即使只被简短提及的地名也必须提取**，如"南天门""瑶池""蟠桃园"——不要因为它不是主要场景就跳过
5. **不要提取泛称**：
   - ❌ "山上""路边""城里""村里""镇上"等泛称不是具体地名
   - ❌ "地方""位置""场所"不是地名

### 地点完整性规则
6. **使用完整地名**：原文是"千翠山南，迷踪岭"，不要截断为"迷踪岭"
7. **注意区分层级**：
   - 大地点（国家/州/省）如"大唐""商朝"
   - 中地点（城市/山脉）如"洛阳""千翠山"
   - 小地点（建筑/房间）如水云间"大厅"

### 上级地点规则 ⚠️ 关键
8. **parent 填写规则**（包含关系）：
   - parent 填写在物理/行政上**包含**此地点的上级实体
   - 例：怡红院 → parent: "大观园"（怡红院在大观园内部）
   - 例：水帘洞 → parent: "花果山"（直接上级）
   - ⚠️ parent 必须是直接上级，不要跳过中间层
   - 例：花果山 → parent: "傲来国"（直接上级），而不是"东胜神洲"
9. ⚠️ **仅填写严格包含关系**，不要把"相邻""对面""旁边"的地点填为 parent

### 禁止提取的地点类型 ⚠️ 必须遵守
10. **不要提取泛化地理词**：如"山""河""海""湖""江""路""城""门"等单字泛化词不是具体地名
11. **不要提取相对位置词**："门口""家里""村里""山上""屋子""车厢""院子""房间""外面""里面""前方""旁边""附近"等都不是地名
12. **不要提取无名的通用地形词**："小路""山崖""竹林""山峰""山洞""河边""石阶""草地""树林""镇子""小城"等如果没有专名就不是地名
13. **代名词/指代不算地名**：如果"小城""镇子"在上下文中指代已知地名，不要重复提取
14. **概念不算地名**："江湖""天下""世界""人间""凡间"是抽象概念，不是具体地点

### 防止幻觉
15. **⚠️ 在提取每个地点时，必须确认该地点是否在本章原文中有明确出现**
16. 如果你无法确定某地点是否在本章出现，**不要提取**
17. 不要因为你"知道"某本小说有哪些著名地点就提取它们，必须本章有实际描写才提取

## 提取内容
- 场景名称（name）：必须使用原文中的完整地名
- 场景类型（type）：城市/村庄/山/洞府/河流/森林/室内/建筑/宫殿/城门/关隘等
- 时间段（timeOfDay）：morning/afternoon/evening/night/day/dusk/dawn
- 天气（weather）：sunny/cloudy/rainy/snowy/foggy/stormy
- 氛围描述（atmosphere）：如"神秘""阴森""温馨"
- 描述（description）：简要描述该地点
- parent：上级地点（直接包含关系）

## 输出格式
请严格按照以下 JSON 格式输出（不要包含示例中的任何内容，示例仅供参考格式）：

{
  "scenes": [
    {
      "key": "地点拼音缩写",
      "name": "地点名称",
      "type": "类型",
      "timeOfDay": "morning/afternoon/evening/night/day/dusk/dawn",
      "weather": "sunny/cloudy/rainy/snowy/foggy/stormy",
      "atmosphere": "氛围描述",
      "description": "地点描述",
      "parent": "上级地点"
    }
  ]
}

## 规则
1. key 使用英文拼音缩写，多音节用下划线分隔
2. 只输出 JSON，不要其他内容
3. **严格按照原文提取，不要添加任何不存在的信息**

## 小说章节：
`;

function parseJSON<T>(text: string): T | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    return null;
  } catch (error) {
    logger.error(LogCategory.AI, 'JSON 解析失败:', error);
    return null;
  }
}

function mergeDuplicateCharacters(characters: NovelCharacter[]): NovelCharacter[] {
  const nameMap = new Map<string, NovelCharacter>();
  
  for (const char of characters) {
    const name = char.name;
    if (nameMap.has(name)) {
      const existing = nameMap.get(name)!;
      const mergedAliases = [...new Set([...existing.new_aliases, ...char.new_aliases])];
      const mergedLocations = [...new Set([...existing.locations_in_chapter, ...char.locations_in_chapter])];
      nameMap.set(name, {
        ...existing,
        new_aliases: mergedAliases,
        locations_in_chapter: mergedLocations
      });
    } else {
      nameMap.set(name, char);
    }
  }
  
  const aliasMergeMap = new Map<string, string>();
  const allNames = new Set(nameMap.keys());
  
  for (const [name, char] of nameMap) {
    if (char.new_aliases) {
      for (const alias of char.new_aliases) {
        if (allNames.has(alias) && alias !== name) {
          aliasMergeMap.set(alias, name);
        }
      }
    }
  }
  
  for (const [target, keeper] of aliasMergeMap) {
    if (!nameMap.has(target) || !nameMap.has(keeper)) continue;
    
    const targetChar = nameMap.get(target)!;
    const keeperChar = nameMap.get(keeper)!;
    
    // 决定哪个名字更适合作为正名
    let finalName = keeper;
    let finalAliases = [...new Set([...keeperChar.new_aliases, ...targetChar.new_aliases, target])];
    
    // 检查哪个名字更可能是正式姓名
    if (isMoreFormalName(target, keeper)) {
      finalName = target;
      finalAliases = [...new Set([...targetChar.new_aliases, ...keeperChar.new_aliases, keeper])];
    }
    
    const mergedLocations = [...new Set([...keeperChar.locations_in_chapter, ...targetChar.locations_in_chapter])];
    const mergedPersonality = keeperChar.personality || targetChar.personality;
    const mergedAppearance = keeperChar.appearance || targetChar.appearance;
    const mergedGender = keeperChar.gender || targetChar.gender;
    const mergedAge = keeperChar.age || targetChar.age;
    const mergedRole = keeperChar.role || targetChar.role;
    
    // 保留更完整的角色信息
    nameMap.set(finalName, {
      ...keeperChar,
      ...targetChar,
      name: finalName,
      new_aliases: finalAliases.filter(a => a !== finalName),
      locations_in_chapter: mergedLocations,
      personality: mergedPersonality,
      appearance: mergedAppearance,
      gender: mergedGender,
      age: mergedAge,
      role: mergedRole
    });
    
    // 删除被合并的角色
    if (finalName !== keeper) {
      nameMap.delete(keeper);
    }
    if (finalName !== target) {
      nameMap.delete(target);
    }
  }
  
  const cleaned = new Map<string, NovelCharacter>();
  for (const [name, char] of nameMap) {
    if (char.new_aliases) {
      const validAliases = char.new_aliases.filter(alias => 
        !nameMap.has(alias) || alias === name
      );
      cleaned.set(name, { ...char, new_aliases: validAliases });
    } else {
      cleaned.set(name, char);
    }
  }
  
  return Array.from(cleaned.values());
}

/**
 * 判断哪个名字更可能是正式姓名
 */
function isMoreFormalName(name1: string, name2: string): boolean {
  const compoundSurnames = new Set([
    '欧阳', '司马', '上官', '夏侯', '诸葛', '东方', '南宫', '皇甫', '尉迟', '公孙',
    '轩辕', '长孙', '宇文', '慕容', '拓跋', '万俟', '呼延', '赫连', '澹台', '公羊',
    '百里', '谷梁', '宰父', '夹谷', '段干', '漆雕', '东郭', '微生', '梁丘', '左丘',
    '东门', '西门', '南门', '北门', '仲孙', '叔孙', '季孙', '言', '闻', '将我',
    '太史', '端木', '巫马', '公西', '颛孙', '壤驷', '公良', '漆雕', '乐正', '壤驷',
    '公冶', '宗政', '濮牛', '淳于', '单于', '鲜于', '闾丘', '司徒', '司空', '亓官',
    '司寇', '仉督', '子车', '颛孙', '端木', '巫马', '公西', '漆雕', '乐正', '壤驷'
  ]);
  
  const compoundSurname1 = compoundSurnames.has(name1.substring(0, 2));
  const compoundSurname2 = compoundSurnames.has(name2.substring(0, 2));
  
  if (compoundSurname1 && !compoundSurname2) {
    return true;
  }
  if (!compoundSurname1 && compoundSurname2) {
    return false;
  }
  
  if (compoundSurname1 && compoundSurname2) {
    return name1.length > name2.length;
  }
  
  const commonSurnames = new Set([
    '王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',
    '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗',
    '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹',
    '彭', '曾', '肖', '田', '董', '袁', '潘', '于', '蒋', '蔡',
    '余', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈',
    '姚', '卢', '姜', '崔', '钟', '谭', '陆', '汪', '范', '金',
    '韦', '贾', '夏', '贺', '钱', '龚', '河', '侯', '江', '童',
    '颜', '梅', '盛', '雷', '葛', '游', '龙', '关', '苗', '华',
    '俞', '顾', '邵', '孟', '万', '秦', '白', '方', '武', '管',
    '柴', '莫', '易', '连', '萧', '冷', '屈', '敖', '明', '丘',
    '应', '甄', '封', '羿', '储', '邬', '束', '康', '元', '思',
    '景', '善', '卿', '来', '党', '翟', '陶', '水', '窦', '章',
    '云', '鲁', '韦', '芮', '糜', '松', '井', '段', '富', '巫',
    '乌', '焦', '巴', '弓', '谷', '车', '侯', '宓', '蓬', '全',
    '郗', '班', '仰', '秋', '仲', '伊', '宫', '宁', '仇', '栾',
    '暴', '甘', '钭', '厉', '戎', '祖', '符', '詹', '叶', '幸',
    '司', '韶', '郜', '黎', '蓟', '薄', '印', '宿', '怀', '蒲',
    '台', '从', '鄂', '索', '咸', '籍', '赖', '卓', '蔺', '屠',
    '蒙', '池', '乔', '阴', '郁', '胥', '能', '苍', '双', '闻',
    '莘', '贡', '劳', '逄', '姬', '申', '扶', '堵', '冉', '宰',
    '雍', '桑', '寿', '通', '扁', '洪', '包', '佘', '邱', '骆',
    '靖', '言', '爱', '阳', '佟', '庆', '晋', '阎', '蔚', '过',
    '校', '敬', '召', '北', '门', '纳', '果', '干', '楼'
  ]);
  
  const name1HasSurname = commonSurnames.has(name1.charAt(0));
  const name2HasSurname = commonSurnames.has(name2.charAt(0));
  
  if (name1HasSurname && !name2HasSurname) {
    return true;
  }
  
  // 规则3：看起来像昵称的名字（如带数字、叠字、形容词等）不那么正式
  const nicknamePatterns = [
    /^[一二三四五六七八九十]+[\u4e00-\u9fa5]+$/, // 如"二愣子"
    /^[\u4e00-\u9fa5]{2,3}[子|儿|哥|姐|弟|妹|爷|奶|叔|婶]$/, // 如"愣子"
    /^[小|老|大][\u4e00-\u9fa5]+$/, // 如"小立"
    /^[\u4e00-\u9fa5]+[\u4e00-\u9fa5]+$/, // 叠字昵称
  ];
  
  const isName1Nickname = nicknamePatterns.some(pattern => pattern.test(name1));
  const isName2Nickname = nicknamePatterns.some(pattern => pattern.test(name2));
  
  if (!isName1Nickname && isName2Nickname) {
    return true;
  }
  
  // 规则4：更长的名字可能更正式
  if (name1.length > name2.length) {
    return true;
  }
  
  return false;
}

const GENERIC_PERSON_WORDS = new Set([
  "众人", "其他人", "旁人", "来人", "对方", "大家", "所有人",
  "那人", "此人", "其人", "何人", "某人", "外人", "路人",
  "他们", "她们", "我们", "诸位", "各位", "在场众人",
  "妇人", "女子", "汉子", "大汉", "壮汉", "好汉",
  "老儿", "老者", "老翁", "少女", "丫头",
  "军士", "军汉", "兵丁", "喽啰", "小喽啰",
  "差人", "差役", "官差", "公差", "衙役",
  "和尚", "僧人", "道士", "先生", "秀才",
  "店家", "店主", "小二", "店小二", "酒保",
  "庄客", "农夫", "猎户", "渔夫", "樵夫",
  "使者", "信使", "探子", "细作",
  "客人", "客官", "过客", "行人",
  "小妖", "小鬼", "众妖", "老妖", "妖精", "妖怪",
  "妖兵", "山贼", "小卒", "士兵",
  "巡山小妖", "把门小妖", "众猴", "众仙", "众神", "众鬼",
  "众僧", "老僧", "小僧", "众道", "众将", "众官",
  "后生", "後生", "后生小辈", "小辈", "晚辈",
  "玉女", "天将", "仙卿", "天妃", "仙童", "仙女",
  "天兵", "天卒", "天丁", "神将", "神兵",
  "义兄弟", "二将", "五百灵官", "八菩萨", "力士",
  "十万天兵", "四天王", "四金刚", "大众", "架火", "校尉",
  "美女", "美姬", "针工", "铁匠",
  "三藏旧徒", "二十八宿", "五方揭谛", "五龙",
  "六丁六甲", "四将", "寿星", "屠子", "护教伽蓝",
  "蛇将", "龟将", "两大元婴长老", "千寰山使者", "华天宗使者",
  "卫云城使者", "垢土化身", "年轻人", "蒙面修士", "金色小人",
  "陇家新任大长老", "青年", "黑凤族合体长老", "丑陋大汉", "二爷",
  "中年男子", "艳女", "仙姬", "三小姐", "二小姐", "同昌公主",
  "唐伯虎", "四小姐", "大小姐", "女婿", "女学生", "奶娘",
  "孩子们", "安禄山", "寿昌公主", "小丫头", "小丫鬟",
  "政老爹", "杨太真", "歌姬", "武则天", "珍爷", "琏爷",
  "秦太虚", "穆莳", "红娘", "老年人", "舞女", "西施",
  "赦老爹", "赵飞燕", "龙钟老僧", "婆子", "小乡绅之子",
  "三体战士", "主任", "值班技术员", "医生", "取信人", "司机",
  "年轻工程师", "护士", "纳米研究中心主任", "美军空军上校",
  "美国中央情报局官员", "英军上校", "那位警官", "那名工程师",
  "那名战士", "那名男警察", "哨兵", "少校军官", "年轻警官",
  "爆炸物专家", "英国陆军上校", "警卫排排长", "镇中学老师",
  "齐家屯老两口", "七八人", "丐帮帮众", "丐帮群豪", "两个采燕客",
]);

const GENERIC_LOCATION_WORDS = new Set([
  "山上", "山下", "山中", "山前", "山后", "山顶", "山脚", "山背后",
  "河边", "湖边", "海边", "江边", "溪边", "水边",
  "城里", "城外", "城中", "城东", "城西", "城南", "城北",
  "村里", "村外", "村口", "镇上", "镇上",
  "路上", "路旁", "路边", "路口", "半路", "途中", "路途", "沿途",
  "门口", "门外", "门内", "屋内", "家里", "家中", "家门", "家内",
  "外面", "里面", "前方", "后方", "旁边", "附近", "远处", "近处",
  "对面", "身边", "身旁", "眼前", "面前", "脚下", "头顶", "上方", "下方",
  "这边", "那边", "这里", "那里", "此地", "此处", "彼处",
  "天上", "云端", "云中", "云上", "空中", "半空", "半空中",
  "水面", "地面", "天空",
  "厅上", "厅前", "厅下", "堂上", "堂前", "堂下",
  "阶下", "阶前", "廊下", "檐下", "墙外", "墙内",
  "屏风后", "帘后", "帘内",
  "桥头", "桥上", "桥下",
  "林中", "林内", "树下", "树林", "草丛",
  "寨内", "寨外", "寨前", "寨中",
  "店中", "店内", "店外", "店里",
  "房中", "房内", "房里", "屋中",
  "楼上", "楼下", "楼中",
  "院中", "院内", "院外", "院子",
  "园中", "园内", "船上", "船头", "船中",
  "马上", "车上",
  "战场", "阵前", "阵中", "阵后",
  "半山腰", "深山", "荒山", "野岭", "高山", "山凹", "松林", "草坡", "山崖",
  "涧边", "大路口", "大路", "小河", "峻岭", "山坡", "小茅山", "石头山",
  "偏僻地方", "偏僻之地", "偏僻之处", "神秘之处", "神秘地方",
  "秘密之处", "隐秘之处", "安全之处", "安全地方", "隐蔽之处",
  "悬崖", "悬崖边", "崖底", "操场",
  "树上", "石上", "岩上", "岩石上", "岩石边", "岩石下", "石壁", "崖壁", "绝壁",
]);

const CONCEPTUAL_GEO_WORDS = new Set([
  "江湖", "天下", "世界", "人间", "凡间", "尘世", "世间",
  "世俗界", "修仙界", "仙界", "魔界",
  "地球", "全球", "全世界", "中国大陆", "中国", "大陆",
  "外国", "国外", "海外", "世界各地",
  "全国各地", "全球各战区", "全国科学大会",
  "地平线", "西方夜空", "云海",
  "同步轨道", "大气层",
]);

const GENERIC_FACILITY_NAMES = new Set([
  "酒店", "客店", "客栈", "旅店", "饭店", "酒楼", "酒馆", "酒肆",
  "茶坊", "茶馆", "茶楼", "茶肆", "茶铺",
  "店铺", "铺子", "当铺", "药铺", "药店", "米铺", "布店",
  "集市", "市场", "市集", "庙会",
  "衙门", "公堂", "大堂", "牢房", "牢城", "监牢", "死牢",
  "法场", "刑场", "校场",
  "寺庙", "道观", "庵堂", "祠堂",
  "宝殿", "大殿", "正殿", "偏殿", "内殿",
  "后堂", "前厅", "正厅", "大厅", "中堂", "花厅",
  "书房", "卧房", "卧室", "厨房", "柴房", "仓库",
  "内室", "内房", "内堂", "后房", "后院", "前院",
  "偏厅", "偏房", "厢房", "耳房",
  "马厩", "马棚", "草料场",
  "山寨", "营寨", "大寨", "寨子",
  "码头", "渡口", "津渡",
  "驿站", "驿馆",
  "东阁", "二层门下", "二门外", "廊庑", "高台",
  "冰地", "峡谷", "石柱",
  "宝座", "宝阁", "讲堂", "高阁",
  "影壁", "正房台矶", "三间厅", "廊檐下",
  "食堂饭厅", "横梁", "密林", "雪地",
  "宿舍", "教室",
  "方丈", "禅堂", "禅院", "法堂", "经堂",
  "前廊", "后园", "前殿", "朝门", "丹墀",
  "客房", "静室", "库房",
  "高山", "山凹", "松林", "草坡", "山崖",
  "涧边", "半空中", "大路口", "大路", "小河",
  "峻岭", "山坡", "小茅山", "石头山",
  "天", "地", "万物", "混沌", "五仙", "五虫",
  "四猴", "周天", "仙道", "人道", "鬼道",
  "天仙", "地仙", "人仙", "羽虫", "鳞虫",
  "昆虫", "毛虫", "蟾宫",
  "龙床", "绣墩", "铁笼", "牙床", "油锅",
  "红梅", "翠竹", "天罗地网", "净瓶", "红匣",
  "芭蕉树", "经柜",
  "正梁", "檐柱", "格子", "龙门", "城墙",
  "城廓", "关厢", "街坊", "坟堆",
  "孟兰盆会", "四部洲", "三清圣象",
  "九霄云里", "九霄空上", "巅险峰头",
  "摩天高山", "正南方大山", "南北大街",
  "蓼汀", "深衢", "东观", "丹灶", "雷府",
  "柴扉", "假山", "山石", "池中",
  "荒野", "荒山", "大山", "大洞", "大川",
  "西行路上", "西行道上", "取经路上",
  "东土", "西土", "南土", "北土",
  "东南角", "西北角", "东北角", "西南角",
  "东南角井边", "西边院子", "东边院子",
  "园子里", "铺子里", "村子里", "庄子里",
  "西边穿堂", "西边穿堂儿",
]);

function filterGenericPersons(characters: NovelCharacter[]): NovelCharacter[] {
  return characters.filter(char => {
    if (GENERIC_PERSON_WORDS.has(char.name)) {
      logger.debug(LogCategory.AI, `过滤泛称人物: ${char.name}`);
      return false;
    }
    return true;
  });
}

function filterGenericLocations(scenes: NovelScene[]): NovelScene[] {
  return scenes.filter(scene => {
    const name = scene.name;
    if (CONCEPTUAL_GEO_WORDS.has(name)) {
      logger.debug(LogCategory.AI, `过滤概念地点: ${name}`);
      return false;
    }
    if (GENERIC_FACILITY_NAMES.has(name)) {
      logger.debug(LogCategory.AI, `过滤通用设施: ${name}`);
      return false;
    }
    if (GENERIC_LOCATION_WORDS.has(name)) {
      logger.debug(LogCategory.AI, `过滤泛化地点: ${name}`);
      return false;
    }
    return true;
  });
}

function generateCharacterKey(name: string): string {
  const pinyinMap: Record<string, string> = {
    '小明': 'xm', '小红': 'xh', '小刚': 'xg', '小丽': 'xl',
    '主角': 'protagonist', '男主': 'maleLead', '女主': 'femaleLead',
    '老师': 'teacher', '学生': 'student', '父亲': 'father', '母亲': 'mother',
    '哥哥': 'brother', '弟弟': 'brotherYounger', '姐姐': 'sister', '妹妹': 'sisterYounger'
  };
  
  if (pinyinMap[name]) return pinyinMap[name];
  
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
    .slice(0, 10) || 'char';
}

function assignCharacterColor(role?: string): string {
  const colors = {
    protagonist: ['#3498db', '#2980b9', '#1abc9c'],
    supporting: ['#27ae60', '#2ecc71', '#16a085'],
    antagonist: ['#e74c3c', '#c0392b', '#e67e22'],
    minor: ['#9b59b6', '#95a5a6', '#7f8c8d']
  };
  
  const roleColors = colors[role as keyof typeof colors] || colors.minor;
  return roleColors[Math.floor(Math.random() * roleColors.length)];
}

export async function extractCharactersFromChapter(
  chapterContent: string,
  existingCharacters: NovelCharacter[] = [],
  modelId?: string
): Promise<NovelCharacter[]> {
  logger.debug(LogCategory.AI, '📖 开始提取角色...');
  
  const prompt = CHARACTER_EXTRACTION_PROMPT + chapterContent.slice(0, 15000);
  
  try {
    const response = await chatCompletion(prompt, modelId || DEFAULT_MODEL, 0.7, 4096, 'json_object');
    const result = parseJSON<{ characters: NovelCharacter[] }>(response);
    
    if (result?.characters) {
      const newCharacters = result.characters.map((char, idx) => ({
        ...char,
        id: `char_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`,
        key: char.key || generateCharacterKey(char.name),
        color: char.color || assignCharacterColor(char.role)
      }));
      
      const existingNames = new Set(existingCharacters.map(c => c.name));
      const merged = [...existingCharacters];
      
      for (const char of newCharacters) {
        if (!existingNames.has(char.name)) {
          merged.push(char);
          existingNames.add(char.name);
        }
      }
      
      logger.debug(LogCategory.AI, `✅ 角色提取完成: ${newCharacters.length} 个新角色`);
      const deduplicated = mergeDuplicateCharacters(merged);
      logger.debug(LogCategory.AI, `🔄 合并重复角色后: ${deduplicated.length} 个角色`);
      const filtered = filterGenericPersons(deduplicated);
      logger.debug(LogCategory.AI, `🔍 过滤泛称后: ${filtered.length} 个角色`);
      return filtered;
    }
    
    return existingCharacters;
  } catch (error) {
    logger.error(LogCategory.AI, '角色提取失败:', error);
    return existingCharacters;
  }
}

export async function extractScenesFromChapter(
  chapterContent: string,
  existingScenes: NovelScene[] = [],
  modelId?: string
): Promise<NovelScene[]> {
  logger.debug(LogCategory.AI, '🏠 开始提取场景...');
  
  const prompt = SCENE_EXTRACTION_PROMPT + chapterContent.slice(0, 15000);
  
  try {
    const response = await chatCompletion(prompt, modelId || DEFAULT_MODEL, 0.7, 4096, 'json_object');
    const result = parseJSON<{ scenes: NovelScene[] }>(response);
    
    if (result?.scenes) {
      const newScenes = result.scenes.map((scene, idx) => ({
        ...scene,
        id: `scene_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`,
        key: scene.key || scene.name.toLowerCase().replace(/\s+/g, '')
      }));
      
      const existingNames = new Set(existingScenes.map(s => s.name));
      const merged = [...existingScenes];
      
      for (const scene of newScenes) {
        if (!existingNames.has(scene.name)) {
          merged.push(scene);
          existingNames.add(scene.name);
        }
      }
      
      logger.debug(LogCategory.AI, `✅ 场景提取完成: ${newScenes.length} 个新场景`);
      const filtered = filterGenericLocations(merged);
      logger.debug(LogCategory.AI, `🔍 过滤泛化地点后: ${filtered.length} 个场景`);
      return filtered;
    }
    
    return existingScenes;
  } catch (error) {
    logger.error(LogCategory.AI, '场景提取失败:', error);
    return existingScenes;
  }
}

export async function analyzeChapter(
  chapter: NovelChapter,
  existingCharacters: NovelCharacter[],
  existingScenes: NovelScene[],
  modelId?: string
): Promise<ExtractionResult> {
  const characters = await extractCharactersFromChapter(
    chapter.content,
    existingCharacters,
    modelId
  );
  
  const scenes = await extractScenesFromChapter(
    chapter.content,
    existingScenes,
    modelId
  );
  
  const existingCharNames = new Set(existingCharacters.map(c => c.name));
  const existingSceneNames = new Set(existingScenes.map(s => s.name));
  
  const updatedCharacters = characters.map(c => {
    if (!c.firstAppearance && !existingCharNames.has(c.name)) {
      return { ...c, firstAppearance: chapter.id };
    }
    return c;
  });
  
  const updatedScenes = scenes.map(s => {
    if (!s.chapterRef && !existingSceneNames.has(s.name)) {
      return { ...s, chapterRef: chapter.id };
    }
    return s;
  });
  
  return { characters: updatedCharacters, scenes: updatedScenes };
}

export async function analyzeAllChapters(
  chapters: NovelChapter[],
  modelId?: string,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractionResult> {
  let allCharacters: NovelCharacter[] = [];
  let allScenes: NovelScene[] = [];
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    logger.debug(LogCategory.AI, `📑 分析第 ${i + 1}/${chapters.length} 章: ${chapter.title}`);
    
    const result = await analyzeChapter(chapter, allCharacters, allScenes, modelId);
    allCharacters = result.characters;
    allScenes = result.scenes;
    
    onProgress?.(i + 1, chapters.length);
  }
  
  logger.debug(LogCategory.AI, `✅ 全部章节分析完成: ${allCharacters.length} 角色, ${allScenes.length} 场景`);
  
  return { characters: allCharacters, scenes: allScenes };
}
