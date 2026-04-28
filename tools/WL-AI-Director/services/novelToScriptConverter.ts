import type { NovelCharacter, NovelScene, NovelData, Character, Scene, CharacterVariation, CharacterTurnaroundData } from '../types';

/**
 * 小说数据转换器
 * 
 * 功能：将小说分析得到的数据（novelData）转换为剧本编辑页面使用的数据格式（scriptData）
 * 
 * 转换内容：
 * - NovelCharacter → Character：角色信息转换
 * - NovelScene → Scene：场景信息转换
 * 
 * 字段映射规则：
 * - 角色：name, gender, age, personality, appearance → name, gender, age, personality, coreFeatures
 * - 场景：name, atmosphere, timeOfDay → location, atmosphere, time
 */

export interface ConvertNovelToScriptResult {
  characters: Character[];
  scenes: Scene[];
  errors: ConvertError[];
}

export interface ConvertError {
  type: 'character' | 'scene';
  id: string;
  message: string;
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 性别转换：英文枚举 → 中文
 * 
 * @param gender - 原始性别枚举值
 * @returns 中文字符串
 */
function convertGender(gender?: string): string {
  switch (gender) {
    case 'male':
      return '男';
    case 'female':
      return '女';
    case 'other':
      return '其他';
    case 'unknown':
    default:
      return '未知';
  }
}

/**
 * 时间段转换：英文枚举 → 中文
 * 
 * @param timeOfDay - 原始时间段枚举值
 * @returns 中文字符串
 */
function convertTimeOfDay(timeOfDay?: string): string {
  switch (timeOfDay) {
    case 'morning':
      return '早晨';
    case 'afternoon':
      return '下午';
    case 'evening':
      return '傍晚';
    case 'night':
      return '夜晚';
    case 'day':
      return '白天';
    case 'dusk':
      return '黄昏';
    case 'dawn':
      return '黎明';
    case 'cloudy':
      return '多云';
    case 'rainy':
      return '下雨';
    case 'snowy':
      return '下雪';
    case 'foggy':
      return '雾';
    case 'stormy':
      return '暴风雨';
    default:
      return timeOfDay || '未知';
  }
}

/**
 * 天气转换：英文枚举 → 中文（与时间段组合显示）
 * 
 * @param weather - 原始天气枚举值
 * @returns 中文字符串（不含时间）
 */
function convertWeather(weather?: string): string {
  switch (weather) {
    case 'sunny':
      return '晴朗';
    case 'cloudy':
      return '多云';
    case 'rainy':
      return '雨天';
    case 'snowy':
      return '雪天';
    case 'foggy':
      return '雾天';
    case 'stormy':
      return '暴风雨';
    default:
      return '';
  }
}

/**
 * 验证角色数据是否有效
 * 
 * @param character - 待验证的角色对象
 * @returns 是否有效
 */
function isValidCharacter(character: NovelCharacter): boolean {
  return !!(character && character.name && character.name.trim().length > 0);
}

/**
 * 验证场景数据是否有效
 * 
 * @param scene - 待验证的场景对象
 * @returns 是否有效
 */
function isValidScene(scene: NovelScene): boolean {
  return !!(scene && scene.name && scene.name.trim().length > 0);
}

/**
 * 将单个小说角色转换为剧本编辑角色
 * 
 * @param novelCharacter - 原始小说角色数据
 * @returns 转换后的角色数据
 */
export function convertCharacter(novelCharacter: NovelCharacter): Character {
  const character: Character = {
    id: generateId(),
    name: novelCharacter.name.trim(),
    gender: convertGender(novelCharacter.gender),
    age: novelCharacter.age?.trim() || '未知',
    personality: novelCharacter.personality?.trim() || '',
    coreFeatures: novelCharacter.appearance?.trim() || '',
    variations: [] as CharacterVariation[],
    status: 'pending',
  };

  if (novelCharacter.new_aliases && novelCharacter.new_aliases.length > 0) {
    character.personality = `${character.personality}${novelCharacter.new_aliases.length > 0 ? `（别名：${novelCharacter.new_aliases.join('、')}）` : ''}`.trim();
  }

  return character;
}

/**
 * 将单个小说场景转换为剧本编辑场景
 * 
 * @param novelScene - 原始小说场景数据
 * @returns 转换后的场景数据
 */
export function convertScene(novelScene: NovelScene): Scene {
  const scene: Scene = {
    id: generateId(),
    location: novelScene.name.trim(),
    atmosphere: novelScene.atmosphere?.trim() || '',
    time: convertTimeOfDay(novelScene.timeOfDay),
    status: 'pending',
  };

  if (novelScene.weather && novelScene.weather !== 'sunny') {
    const weatherStr = convertWeather(novelScene.weather);
    if (weatherStr) {
      scene.time = scene.time ? `${scene.time} · ${weatherStr}` : weatherStr;
    }
  }

  if (novelScene.type) {
    scene.atmosphere = `${novelScene.type} · ${scene.atmosphere}`.trim();
  }

  return scene;
}

/**
 * 将小说数据转换为剧本编辑数据
 * 
 * 这是主要的转换入口函数，将 novelData 中的 characters 和 scenes
 * 转换为 scriptData 可用的格式
 * 
 * @param novelData - 小说分析后的完整数据
 * @returns 转换结果，包含转换后的角色列表、场景列表和错误信息
 * 
 * @example
 * ```typescript
 * const result = convertNovelToScriptData(novelData);
 * console.log(`转换了 ${result.characters.length} 个角色，${result.scenes.length} 个场景`);
 * if (result.errors.length > 0) {
 *   console.warn('转换过程中的错误：', result.errors);
 * }
 * ```
 */
export function convertNovelToScriptData(novelData: NovelData): ConvertNovelToScriptResult {
  const errors: ConvertError[] = [];
  const characters: Character[] = [];
  const scenes: Scene[] = [];

  if (!novelData) {
    errors.push({
      type: 'character',
      id: 'novelData',
      message: '小说数据为空或无效',
    });
    return { characters, scenes, errors };
  }

  if (!novelData.characters || !Array.isArray(novelData.characters)) {
    errors.push({
      type: 'character',
      id: 'characters',
      message: '角色数据为空或无效',
    });
  } else {
    const characterMap = new Map<string, NovelCharacter>();
    
    for (const char of novelData.characters) {
      if (!isValidCharacter(char)) {
        errors.push({
          type: 'character',
          id: char?.id || 'unknown',
          message: `角色 "${char?.name || '未知'}" 数据无效，已跳过`,
        });
        continue;
      }

      if (characterMap.has(char.name)) {
        const existing = characterMap.get(char.name)!;
        const firstChapter = existing.firstAppearance || '';
        const currentChapter = char.firstAppearance || '';
        
        if (currentChapter.localeCompare(firstChapter) < 0) {
          characterMap.set(char.name, char);
        }
      } else {
        characterMap.set(char.name, char);
      }
    }

    for (const char of characterMap.values()) {
      try {
        characters.push(convertCharacter(char));
      } catch (error) {
        errors.push({
          type: 'character',
          id: char.id,
          message: `转换角色 "${char.name}" 失败: ${error instanceof Error ? error.message : '未知错误'}`,
        });
      }
    }
  }

  if (!novelData.scenes || !Array.isArray(novelData.scenes)) {
    errors.push({
      type: 'scene',
      id: 'scenes',
      message: '场景数据为空或无效',
    });
  } else {
    const sceneMap = new Map<string, NovelScene>();
    
    for (const scene of novelData.scenes) {
      if (!isValidScene(scene)) {
        errors.push({
          type: 'scene',
          id: scene?.id || 'unknown',
          message: `场景 "${scene?.name || '未知'}" 数据无效，已跳过`,
        });
        continue;
      }

      if (!sceneMap.has(scene.name)) {
        sceneMap.set(scene.name, scene);
      }
    }

    for (const scene of sceneMap.values()) {
      try {
        scenes.push(convertScene(scene));
      } catch (error) {
        errors.push({
          type: 'scene',
          id: scene.id,
          message: `转换场景 "${scene.name}" 失败: ${error instanceof Error ? error.message : '未知错误'}`,
        });
      }
    }
  }

  return { characters, scenes, errors };
}

/**
 * 检查是否已经转换过（检查 scriptData 是否已有角色/场景数据）
 * 
 * @param novelData - 小说数据
 * @param scriptData - 剧本数据（可选）
 * @returns 是否已转换
 */
export function hasConverted(novelData: NovelData | null | undefined, scriptData: any): boolean {
  if (!novelData || !novelData.characters || !novelData.scenes) {
    return false;
  }

  if (!scriptData) {
    return false;
  }

  const hasCharacters = scriptData.characters && scriptData.characters.length > 0;
  const hasScenes = scriptData.scenes && scriptData.scenes.length > 0;

  return hasCharacters || hasScenes;
}

/**
 * 获取转换统计信息
 * 
 * @param novelData - 小说数据
 * @returns 统计信息
 */
export function getConversionStats(novelData: NovelData): {
  totalCharacters: number;
  totalScenes: number;
  validCharacters: number;
  validScenes: number;
} {
  const totalCharacters = novelData?.characters?.length || 0;
  const totalScenes = novelData?.scenes?.length || 0;
  
  const validCharacters = novelData?.characters?.filter(isValidCharacter).length || 0;
  const validScenes = novelData?.scenes?.filter(isValidScene).length || 0;

  return {
    totalCharacters,
    totalScenes,
    validCharacters,
    validScenes,
  };
}
