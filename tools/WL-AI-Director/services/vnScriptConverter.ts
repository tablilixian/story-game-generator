import { logger, LogCategory } from './logger';
import type { NovelChapter, NovelCharacter, NovelScene, Shot, Character, Scene } from '../types';

export interface VNDialogueEvent {
  scene?: string;
  narration?: string;
  character?: string;
  text?: string;
  monologue?: string;
  action?: string;
  choice?: string;
  options?: Array<{ text: string; next: string }>;
  end?: string;
}

export interface VNScript {
  label: string;
  events: VNDialogueEvent[];
}

export interface VisualNovelScriptData {
  characters: Record<string, { name: string; color: string }>;
  scenes: Record<string, string>;
  scripts: Record<string, VNScript>;
}

function extractDialogues(text: string): { type: 'dialogue' | 'narration' | 'action'; content: string; character?: string }[] {
  const results: { type: 'dialogue' | 'narration' | 'action'; content: string; character?: string }[] = [];
  
  const dialoguePattern = /([^"\n]+)["「『](.+?)["」』]/g;
  const monologuePattern = /（(.+?)）/g;
  
  const paragraphs = text.split(/\n+/).filter(p => p.trim());
  
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    
    const dialogueMatches = [...trimmed.matchAll(dialoguePattern)];
    
    if (dialogueMatches.length > 0) {
      for (const match of dialogueMatches) {
        const speaker = match[1].trim().replace(/[：:]$/, '');
        const content = match[2].trim();
        
        if (speaker && content) {
          results.push({
            type: 'dialogue',
            content,
            character: speaker
          });
        }
      }
      
      const remaining = trimmed.replace(dialoguePattern, '').trim();
      if (remaining) {
        results.push({
          type: 'narration',
          content: remaining
        });
      }
    } else {
      if (trimmed.length > 20) {
        results.push({
          type: 'action',
          content: trimmed
        });
      } else {
        results.push({
          type: 'narration',
          content: trimmed
        });
      }
    }
  }
  
  return results;
}

function generateCharacterKey(name: string): string {
  // 直接保留中文字符和数字，用于 Monogatari 键名
  // 移除空格和特殊字符，保留中文、英文、数字
  const key = name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
  return key || 'unknown';
}

function generateSceneKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
    .replace(/\s+/g, '');
}

function inferCharacters(events: { type: string; character?: string; content: string }[]): Record<string, { name: string; color: string }> {
  const characters: Record<string, { name: string; color: string }> = {};
  const colorPalette = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
  let colorIndex = 0;
  
  const seenCharacters = new Set<string>();
  
  for (const event of events) {
    if (event.type === 'dialogue' && event.character) {
      if (!seenCharacters.has(event.character)) {
        seenCharacters.add(event.character);
        const key = generateCharacterKey(event.character);
        const finalKey = characters[key] ? `${key}_${seenCharacters.size}` : key;
        
        characters[finalKey] = {
          name: event.character,
          color: colorPalette[colorIndex % colorPalette.length]
        };
        colorIndex++;
      }
    }
  }
  
  return characters;
}

function inferScenes(text: string): Record<string, string> {
  const scenes: Record<string, string> = {};
  const sceneKeywords = [
    '镇', '城', '村', '店', '楼', '府', '山', '林', '河', '湖',
    '街', '道', '屋', '房', '门', '口', '车内', '车上', '马车上'
  ];
  
  const foundScenes = new Set<string>();
  
  for (const keyword of sceneKeywords) {
    const regex = new RegExp(`(?:在|到|来到|进入|出了)?(.+?${keyword})`, 'g');
    const matches = [...text.matchAll(regex)];
    
    for (const match of matches) {
      const sceneName = match[1]?.trim();
      if (sceneName && sceneName.length <= 10 && !foundScenes.has(sceneName)) {
        foundScenes.add(sceneName);
        const key = generateSceneKey(sceneName);
        scenes[key] = sceneName;
      }
    }
  }
  
  if (Object.keys(scenes).length === 0) {
    scenes['default'] = '默认场景';
  }
  
  return scenes;
}

export function convertTextToVNScript(
  text: string,
  chapterTitle: string = 'Start',
  characters?: NovelCharacter[],
  scenes?: NovelScene[]
): VisualNovelScriptData {
  logger.debug(LogCategory.AI, `📝 开始转换文本到 VN 脚本: ${chapterTitle}`);
  
  const events = extractDialogues(text);
  
  const charDef: Record<string, { name: string; color: string }> = {};
  
  if (characters && characters.length > 0) {
    for (const char of characters) {
      charDef[char.key] = {
        name: char.name,
        color: char.color || '#3498db'
      };
    }
  } else {
    const inferred = inferCharacters(events);
    Object.assign(charDef, inferred);
  }
  
  let sceneDef: Record<string, string> = {};
  
  if (scenes && scenes.length > 0) {
    for (const scene of scenes) {
      sceneDef[scene.key] = scene.name;
    }
  } else {
    sceneDef = inferScenes(text);
    if (!sceneDef[Object.keys(sceneDef)[0]]) {
      sceneDef = { 'default': '默认场景' };
    }
  }
  
  const vnEvents: VNDialogueEvent[] = [];
  
  const firstSceneKey = Object.keys(sceneDef)[0];
  vnEvents.push({ scene: firstSceneKey });
  
  for (const event of events) {
    if (event.type === 'dialogue') {
      let characterKey = 'unknown';
      
      if (characters && characters.length > 0) {
        const matched = characters.find(c => 
          c.name === event.character || 
          c.new_aliases?.includes(event.character || '')
        );
        if (matched) {
          characterKey = matched.key;
        }
      } else {
        const inferredChars = Object.entries(charDef).find(([_, v]) => v.name === event.character);
        if (inferredChars) {
          characterKey = inferredChars[0];
        }
      }
      
      vnEvents.push({
        character: characterKey,
        text: event.content
      });
    } else if (event.type === 'narration') {
      vnEvents.push({
        narration: event.content
      });
    } else if (event.type === 'action') {
      vnEvents.push({
        action: event.content
      });
    }
  }
  
  const label = chapterTitle === 'Start' || !chapterTitle ? 'Start' : chapterTitle;
  
  return {
    characters: charDef,
    scenes: sceneDef,
    scripts: {
      [label]: {
        label,
        events: vnEvents
      }
    }
  };
}

export function convertChapterToVNScript(
  chapter: NovelChapter,
  characters?: NovelCharacter[],
  scenes?: NovelScene[]
): VisualNovelScriptData {
  return convertTextToVNScript(
    chapter.content,
    chapter.title,
    characters,
    scenes
  );
}

export function convertAllChaptersToVNScript(
  chapters: NovelChapter[],
  characters?: NovelCharacter[],
  scenes?: NovelScene[]
): VisualNovelScriptData {
  const allCharacters: Record<string, { name: string; color: string }> = {};
  const allScenes: Record<string, string> = {};
  const allScripts: Record<string, VNScript> = {};
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const vnScript = convertChapterToVNScript(chapter, characters, scenes);
    
    Object.assign(allCharacters, vnScript.characters);
    Object.assign(allScenes, vnScript.scenes);
    
    const label = i === 0 ? 'Start' : `chapter_${i}`;
    allScripts[label] = {
      ...vnScript.scripts[Object.keys(vnScript.scripts)[0]],
      label
    };
  }
  
  return {
    characters: allCharacters,
    scenes: allScenes,
    scripts: allScripts
  };
}

export function convertRawScriptToVNScript(
  rawScript: string,
  characters?: NovelCharacter[],
  scenes?: NovelScene[]
): VisualNovelScriptData {
  return convertTextToVNScript(rawScript, 'Start', characters, scenes);
}

/**
 * 解析 storyParagraph 中的文本，根据格式提取 VN 事件
 * 支持的格式：
 * - 角色对白：角色(表情)：对话 → { character, text }
 * - 动作描述：（动作描述） → { action }
 * - 画外音：画外音：内容 → { narration }
 * - 场景标题：【场景X：名称，时间】 → { scene }
 * - 环境描述：默认无角色/动作标记 → { narration }
 */
function parseStoryParagraph(text: string, characters: Character[]): VNDialogueEvent {
  const trimmed = text.trim();
  
  // 场景标题格式：【场景二：青牛客栈，午饭时分】
  const sceneMatch = trimmed.match(/^【场景(\d+)[:：](.+?)】?$/);
  if (sceneMatch) {
    return { 
      scene: `scene_${sceneMatch[1]}`,
      narration: sceneMatch[2].trim()
    };
  }
  
  // 场景标题格式（无【】）：场景二 青牛客栈，午饭时分 或 场景二 青牛客栈，午饭时分】
  const simpleSceneMatch = trimmed.match(/^场景(\d+)\s+(.+?)(】)?$/);
  if (simpleSceneMatch) {
    return { 
      scene: `scene_${simpleSceneMatch[1]}`,
      narration: (simpleSceneMatch[2] || '').replace(/】$/, '').trim()
    };
  }
  
  // 动作描述格式：（韩胖子带着韩立走进客栈）
  const actionMatch = trimmed.match(/^【?\(（(.+?)\)'】?$/);
  if (actionMatch) {
    return { action: actionMatch[1].trim() };
  }
  
  // 检查是否以（开头和）结尾，可能是动作描述
  if (trimmed.startsWith('（') && trimmed.endsWith('）')) {
    return { action: trimmed.slice(1, -1).trim() };
  }
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return { action: trimmed.slice(1, -1).trim() };
  }
  
  // 画外音格式：画外音：内容
  const voiceOverMatch = trimmed.match(/^(画外音|旁白|OS)[:：]\s*(.+)$/);
  if (voiceOverMatch) {
    return { narration: voiceOverMatch[2].trim() };
  }
  
  // 角色对白格式：角色(表情)：对话 或 角色：对话
  const dialogueMatch = trimmed.match(/^([^()\n:：]+?)(?:（([^）]+)）)?[:：]\s*(.+)$/);
  if (dialogueMatch) {
    const speakerName = dialogueMatch[1].trim();
    const expression = dialogueMatch[2]?.trim(); // 可选的表情
    const dialogueText = dialogueMatch[3].trim();
    
    // 尝试匹配已知角色
    let characterKey = 'unknown';
    const matchedChar = characters.find(c => c.name === speakerName);
    
    if (matchedChar) {
      characterKey = generateCharacterKey(matchedChar.name);
    } else {
      // 如果没有匹配到已知角色，生成一个键名
      characterKey = generateCharacterKey(speakerName);
    }
    
    return { 
      character: characterKey, 
      text: expression ? `${expression} ${dialogueText}` : dialogueText 
    };
  }
  
  // 默认：环境描述/旁白
  return { narration: trimmed };
}

/**
 * 从 storyParagraphs 生成 VN 事件列表
 * 按 sceneRefId 关联到对应的场景
 */
function generateEventsFromStoryParagraphs(
  storyParagraphs: { id: number; text: string; sceneRefId: string }[],
  scenes: Scene[],
  characters: Character[]
): VNDialogueEvent[] {
  const events: VNDialogueEvent[] = [];
  let currentSceneKey: string | null = null;
  
  for (const para of storyParagraphs) {
    const event = parseStoryParagraph(para.text, characters);
    
    // 如果是场景切换事件，记录当前场景
    if (event.scene) {
      // 只有当场景真正改变时才添加 scene 事件
      if (currentSceneKey !== event.scene) {
        currentSceneKey = event.scene;
        events.push({ scene: currentSceneKey });
      }
    } else {
      // 非场景切换事件，根据 sceneRefId 确定当前场景
      // 只有当 scene 发生改变时才生成 show scene 命令
      const sceneIndex = scenes.findIndex(s => String(s.id) === String(para.sceneRefId));
      const paraSceneKey = sceneIndex >= 0 ? `scene_${sceneIndex + 1}` : null;
      
      if (paraSceneKey && paraSceneKey !== currentSceneKey) {
        currentSceneKey = paraSceneKey;
        events.push({ scene: currentSceneKey });
      }
      
      // 添加非场景切换事件（不带 scene 字段）
      events.push(event);
    }
  }
  
  return events;
}

export async function generateVNScriptFromShots(
  shots: Shot[],
  characters: Character[],
  scenes: Scene[],
  projectTitle: string = '视觉小说',
  onProgress?: (current: number, total: number) => void,
  /**
   * 可选的 storyParagraphs，包含更详细的剧情信息
   * 如果提供，将使用此数据生成 VN 事件，而不是 shots
   */
  storyParagraphs?: { id: number; text: string; sceneRefId: string }[]
): Promise<VisualNovelScriptData> {
  logger.debug(LogCategory.AI, `📝 开始从分镜生成 VN 剧本，共 ${shots.length} 个分镜`);

  const colorPalette = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
  
  const generateKey = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
      .replace(/\s+/g, '');
  };

  const charDef: Record<string, { name: string; color: string }> = {};
  const sceneDef: Record<string, string> = {};
  const scripts: Record<string, VNScript> = {};

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const key = generateKey(char.name);
    charDef[key] = {
      name: char.name,
      color: colorPalette[i % colorPalette.length]
    };
  }

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const key = `scene_${i + 1}`;
    sceneDef[key] = `${scene.location} - ${scene.time}`;
  }

  const events: VNDialogueEvent[] = [];
  
  // 如果提供了 storyParagraphs，使用它来生成更丰富的 VN 事件
  if (storyParagraphs && storyParagraphs.length > 0) {
    logger.debug(LogCategory.AI, `📝 使用 storyParagraphs 生成 VN 剧本，共 ${storyParagraphs.length} 个段落`);
    
    const paragraphEvents = generateEventsFromStoryParagraphs(storyParagraphs, scenes, characters);
    
    // 遍历段落事件，添加到主事件列表
    for (let i = 0; i < paragraphEvents.length; i++) {
      const event = paragraphEvents[i];
      events.push(event);
      onProgress?.(i + 1, paragraphEvents.length);
    }
  } else {
    // 使用原始的 shots 方式生成 VN 事件
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      
      const sceneIndex = scenes.findIndex(s => s.id === shot.sceneId);
      if (sceneIndex >= 0) {
        const sceneKey = `scene_${sceneIndex + 1}`;
        events.push({ scene: sceneKey });
      }

      if (shot.actionSummary) {
        events.push({
          narration: shot.actionSummary
        });
      }

      if (shot.dialogue) {
        const charIds = shot.characters || [];
        if (charIds.length > 0) {
          const char = characters.find(c => c.id === charIds[0]);
          if (char) {
            const charKey = generateCharacterKey(char.name);
            events.push({
              character: charKey,
              text: shot.dialogue
            });
          }
        } else {
          events.push({
            narration: shot.dialogue
          });
        }
      }

      onProgress?.(i + 1, shots.length);
    }
  }

  scripts['Start'] = {
    label: 'Start',
    events
  };

  logger.debug(LogCategory.AI, `✅ VN 剧本生成完成: ${events.length} 个事件`);

  return {
    characters: charDef,
    scenes: sceneDef,
    scripts
  };
}

function generateCharacterAssetKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
    .replace(/\s+/g, '');
}

async function resolveImageUrlToBase64(imageUrl: string): Promise<string | null> {
  if (!imageUrl) return null;
  
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  if (imageUrl.startsWith('local:')) {
    const localId = imageUrl.replace('local:', '');
    try {
      const { imageStorageService } = await import('./imageStorageService');
      const blob = await imageStorageService.getImage(localId);
      if (blob) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }
    } catch (error) {
      logger.error(LogCategory.IMAGE, 'Failed to load local image:', error);
    }
    return null;
  }
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }
    } catch (error) {
      logger.error(LogCategory.IMAGE, 'Failed to fetch image:', error);
    }
    return null;
  }
  
  return null;
}

export async function extractGameAssets(
  shots: Shot[],
  characters: Character[],
  scenes: Scene[]
): Promise<import('../types').GameAssets> {
  logger.debug(LogCategory.AI, '🎨 开始提取游戏资源...');

  const result: import('../types').GameAssets = {
    scenes: {},
    characters: {},
    stats: {
      totalScenes: 0,
      totalCharacterSprites: 0,
      totalImages: 0
    }
  };

  const colorPalette = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const key = `scene_${i + 1}`;
    
    let imageUrl = '';
    if (scene.imageUrl) {
      imageUrl = await resolveImageUrlToBase64(scene.imageUrl) || '';
    }
    
    result.scenes[key] = {
      id: scene.id,
      name: scene.location,
      imageUrl
    };

    if (imageUrl) {
      result.stats.totalImages++;
    }
  }
  result.stats.totalScenes = scenes.length;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const key = generateCharacterAssetKey(char.name);
    
    const charAsset: import('../types').GameCharacterAsset = {
      id: char.id,
      key,
      name: char.name,
      color: colorPalette[i % colorPalette.length],
      sprites: {}
    };

    if (char.imageUrl) {
      const resolvedUrl = await resolveImageUrlToBase64(char.imageUrl);
      if (resolvedUrl) {
        charAsset.mainImageUrl = resolvedUrl;
        charAsset.sprites['normal'] = resolvedUrl;
        result.stats.totalImages++;
        result.stats.totalCharacterSprites++;
      }
    }

    for (let j = 0; j < char.variations.length; j++) {
      const variation = char.variations[j];
      if (variation.imageUrl) {
        const resolvedUrl = await resolveImageUrlToBase64(variation.imageUrl);
        if (resolvedUrl) {
          const spriteName = variation.name?.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '') || `variation_${j + 1}`;
          charAsset.sprites[spriteName] = resolvedUrl;
          result.stats.totalImages++;
          result.stats.totalCharacterSprites++;
        }
      }
    }

    result.characters[key] = charAsset;
  }

  logger.debug(LogCategory.AI, `✅ 资源提取完成: ${result.stats.totalScenes} 个场景, ${result.stats.totalCharacterSprites} 个角色立绘`);

  return result;
}

export function generateMonogatariAssetConfig(
  assets: import('../types').GameAssets
): import('../types').MonogatariAssetConfig {
  const config: import('../types').MonogatariAssetConfig = {
    scenes: {},
    characters: {}
  };

  Object.entries(assets.scenes).forEach(([key, scene]) => {
    if (scene.imageUrl) {
      config.scenes[key] = `scenes/${key}.png`;
    } else {
      config.scenes[key] = 'scenes/placeholder.png';
    }
  });

  Object.entries(assets.characters).forEach(([key, char]) => {
    config.characters[key] = {
      name: char.name,
      color: char.color,
      directory: key,
      sprites: {}
    };

    Object.entries(char.sprites).forEach(([spriteName, imageUrl]) => {
      config.characters[key].sprites[spriteName] = `characters/${key}/${spriteName}.png`;
    });
  });

  return config;
}
