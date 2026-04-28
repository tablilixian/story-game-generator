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
  const key = name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
    .replace(/[\u4e00-\u9fa5]/g, (char) => {
      const pinyinMap: Record<string, string> = {
        '韩': 'han', '立': 'li', '父': 'fu', '母': 'mu',
        '铸': 'zhu', '张': 'zhang', '叔': 'shu', '老': 'lao',
        '三': 'san', '胖': 'pang', '王': 'wang', '护': 'hu',
        '法': 'fa'
      };
      return pinyinMap[char] || char;
    });
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

export async function generateVNScriptFromShots(
  shots: Shot[],
  characters: Character[],
  scenes: Scene[],
  projectTitle: string = '视觉小说',
  onProgress?: (current: number, total: number) => void
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
