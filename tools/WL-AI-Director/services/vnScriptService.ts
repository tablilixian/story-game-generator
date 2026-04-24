import { logger, LogCategory } from './logger';
import { getActiveChatModel } from './modelRegistry';
import { chatCompletion } from './ai/apiCore';
import type { NovelChapter, NovelCharacter, NovelScene } from '../types';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

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

const SCRIPT_GENERATION_PROMPT = `你是一个 Monogatari 视觉小说脚本作家。请将以下小说章节转换为 Monogatari 游戏引擎可用的剧本格式。

## 任务
将小说文本转换为 Monogatari 脚本事件序列。

## 角色映射（必须使用这些键名）
{characters}

## 场景映射（必须使用这些键名）
{scenes}

## 输出格式
请直接输出 Monogatari 格式的 JSON，不要有其他内容。每一章节输出一个 JSON 对象，包含以下字段：

{
  "label": "章节标签名",
  "events": [
    { "scene": "场景键名" },
    { "narration": "旁白内容..." },
    { "character": "角色键名", "text": "对话内容..." },
    { "monologue": "内心独白内容..." },
    { "action": "动作描写..." },
    { "choice": "选择问题文本", "options": [{ "text": "选项1", "next": "目标标签1" }, { "text": "选项2", "next": "目标标签2" }] },
    { "end": "结局标题" }
  ]
}

## Monogatari 脚本语法规则

1. **场景切换**：{ "scene": "场景键名" } → 切换到指定场景
2. **居中旁白**：{ "narration": "旁白内容" } → 显示居中的旁白文字
3. **角色对话**：{ "character": "角色键名", "text": "对话内容" } → 显示角色对话
4. **内心独白**：{ "monologue": "独白内容" } → 显示内心独白
5. **动作描写**：{ "action": "动作内容" } → 显示动作描述
6. **选择支**：
   - question: 询问的文本
   - options: 选项数组，每个选项包含 text（显示文本）和 next（跳转目标标签）
   - next 必须是 "jump 标签" 格式，如 "jump chapter_2"
7. **结束**：{ "end": "结局标题" } → 结束当前分支

## 重要约束

1. **只输出 JSON**：不要输出任何解释、markdown 代码块或其他内容
2. **字符转义**：对话内容中的引号 " 必须写成 \\"，换行用 \\n
3. **角色键名**：必须使用给定的角色键名，不能自己创建
4. **场景键名**：必须使用给定的场景键名
5. **跳转格式**：选择支的 next 必须是 "jump 标签" 格式
6. **选择支限制**：每个章节最多 1-2 个选择支，不要太多
7. **内容精简**：将长段落拆分成多个短事件，保持节奏感
8. **标签命名**：
   - 第一章用 "Start" 作为起始标签
   - 后续章节用 "chapter_1", "chapter_2", ... 格式
   - 选择支跳转目标使用 "chapter_X" 格式

## 小说章节：
{chapter}
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

function buildCharacterMapping(characters: NovelCharacter[]): string {
  return characters.map(c => `${c.key}: ${c.name}`).join('\n');
}

function buildSceneMapping(scenes: NovelScene[]): string {
  return scenes.map(s => `${s.key}: ${s.name}`).join('\n');
}

export async function generateVNScriptForChapter(
  chapter: NovelChapter,
  characters: NovelCharacter[],
  scenes: NovelScene[],
  chapterIndex: number = 0
): Promise<VNScript | null> {
  const charMap = buildCharacterMapping(characters);
  const sceneMap = buildSceneMapping(scenes);
  
  const prompt = SCRIPT_GENERATION_PROMPT
    .replace('{characters}', charMap)
    .replace('{scenes}', sceneMap)
    .replace('{chapter}', chapter.content.slice(0, 12000));
  
  logger.debug(LogCategory.AI, `📝 开始生成剧本: ${chapter.title}`);
  
  try {
    const response = await chatCompletion(prompt, DEFAULT_MODEL, 0.8, 8192, 'json_object');
    const result = parseJSON<{ label: string; events: VNDialogueEvent[] }>(response);
    
    if (result?.events) {
      logger.debug(LogCategory.AI, `✅ 剧本生成完成: ${chapter.title}, ${result.events.length} 个事件`);
      
      return {
        label: result.label || (chapterIndex === 0 ? 'Start' : `chapter_${chapterIndex}`),
        events: result.events
      };
    }
    
    return null;
  } catch (error) {
    logger.error(LogCategory.AI, '剧本生成失败:', error);
    return null;
  }
}

export async function generateAllVNScripts(
  chapters: NovelChapter[],
  characters: NovelCharacter[],
  scenes: NovelScene[],
  onProgress?: (current: number, total: number) => void
): Promise<VisualNovelScriptData> {
  const scripts: Record<string, VNScript> = {};
  const charDef: Record<string, { name: string; color: string }> = {};
  const sceneDef: Record<string, string> = {};
  
  for (const char of characters) {
    charDef[char.key] = {
      name: char.name,
      color: char.color || '#3498db'
    };
  }
  
  for (const scene of scenes) {
    sceneDef[scene.key] = scene.name;
  }
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const label = i === 0 ? 'Start' : `chapter_${i}`;
    
    logger.debug(LogCategory.AI, `📝 生成剧本 ${i + 1}/${chapters.length}: ${chapter.title}`);
    
    const script = await generateVNScriptForChapter(chapter, characters, scenes, i);
    if (script) {
      const finalLabel = script.label || label;
      scripts[finalLabel] = { ...script, label: finalLabel };
    }
    
    onProgress?.(i + 1, chapters.length);
  }
  
  logger.debug(LogCategory.AI, `✅ 全部剧本生成完成: ${Object.keys(scripts).length} 个章节`);
  
  return {
    characters: charDef,
    scenes: sceneDef,
    scripts
  };
}

export function convertToMonogatariFormat(vnScript: VisualNovelScriptData): string {
  const lines: string[] = [];
  
  lines.push('{');
  lines.push('    "characters": {');
  const charEntries = Object.entries(vnScript.characters);
  charEntries.forEach(([key, char], idx) => {
    const comma = idx < charEntries.length - 1 ? ',' : '';
    lines.push(`        "${key}": {`);
    lines.push(`            "name": "${char.name}",`);
    lines.push(`            "color": "${char.color}"`);
    lines.push(`        }${comma}`);
  });
  lines.push('    },');
  
  lines.push('    "scenes": {');
  const sceneEntries = Object.entries(vnScript.scenes);
  sceneEntries.forEach(([key, name], idx) => {
    const comma = idx < sceneEntries.length - 1 ? ',' : '';
    lines.push(`        "${key}": "${name}"${comma}`);
  });
  lines.push('    },');
  
  lines.push('    "script": {');
  const scriptEntries = Object.entries(vnScript.scripts);
  scriptEntries.forEach(([label, script], idx) => {
    const comma = idx < scriptEntries.length - 1 ? ',' : '';
    lines.push(`        "${label}": [`);
    
    script.events.forEach((event, eventIdx) => {
      let eventStr = '';
      
      if (event.scene) {
        eventStr = `            { "scene": "${event.scene}" }`;
      } else if (event.narration) {
        eventStr = `            { "narration": "${event.narration}" }`;
      } else if (event.character && event.text) {
        eventStr = `            { "character": "${event.character}", "text": "${event.text}" }`;
      } else if (event.monologue) {
        eventStr = `            { "monologue": "${event.monologue}" }`;
      } else if (event.action) {
        eventStr = `            { "action": "${event.action}" }`;
      } else if (event.choice && event.options) {
        const optionsStr = event.options.map((o) => `{ "text": "${o.text}", "next": "${o.next}" }`).join(', ');
        eventStr = `            { "choice": "${event.choice}", "options": [${optionsStr}] }`;
      } else if (event.end) {
        eventStr = `            { "end": "${event.end}" }`;
      }
      
      const eventComma = eventIdx < script.events.length - 1 ? ',' : '';
      lines.push(eventStr + eventComma);
    });
    
    lines.push(`        ]${comma}`);
  });
  lines.push('    }');
  lines.push('}');
  
  return lines.join('\n');
}
