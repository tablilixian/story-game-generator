import fs from 'fs';
import path from 'path';

// 读取用户提供的 JSON 数据
const jsonPath = '/Users/wl/Downloads/wl_backup_2026-05-08T06-05-24-821Z.json';
const rawData = fs.readFileSync(jsonPath, 'utf-8');
const backupData = JSON.parse(rawData);

// 获取 projects 数组
const projects = backupData.stores?.projects || [];

// 找到包含完整 scriptData 和 shots 的项目
const project = projects.find(p => p.scriptData && p.shots && p.shots.length > 0) || projects[0];

console.log('=== 项目信息 ===');
console.log(`标题: ${project.title}`);
console.log(`剧本数据: ${project.scriptData ? '存在' : '不存在'}`);
console.log(`分镜数量: ${project.shots ? project.shots.length : 0}`);
console.log(`角色数量: ${project.scriptData?.characters?.length || 0}`);
console.log(`场景数量: ${project.scriptData?.scenes?.length || 0}`);
console.log(`故事段落: ${project.scriptData?.storyParagraphs?.length || 0}`);

// 模拟 generateWebGALConfig 函数
const generateWebGALConfig = (project) => {
  const gameName = project.title || 'AI生成游戏';
  const gameKey = project.id?.substring(0, 8) || 'webgal001';
  
  return `Game_name:${gameName};
Game_key:${gameKey};
Title_img:title.png;
Title_bgm:title.mp3;
Game_Logo:logo.png;
Enable_Appreciation:true;
Default_Language:zh_CN;
Show_panic:false;
Legacy_Expression_Blend_Mode:false;
Max_line:3;
Line_height:1.5;`;
};

// 模拟 generateWebGALScript 函数（最新版本）
const generateWebGALScript = (project) => {
  if (!project.shots || !project.scriptData) return '';

  let script = '; WebGAL 剧本脚本 - 由 WL-AI-Director 生成\n\n';
  
  // 添加角色定义
  if (project.scriptData.characters && project.scriptData.characters.length > 0) {
    script += '; 角色定义\n';
    project.scriptData.characters.forEach((char, index) => {
      const charKey = char.name?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || `char${index}`;
      script += `setVar:${charKey}=${char.name};\n`;
    });
    script += '\n';
  }

  // 添加场景定义
  if (project.scriptData.scenes && project.scriptData.scenes.length > 0) {
    script += '; 场景定义\n';
    project.scriptData.scenes.forEach((scene, index) => {
      const bgKey = `bg_${scene.id}`;
      script += `setVar:${bgKey}=${scene.location};\n`;
    });
    script += '\n';
  }

  // 添加主剧情脚本
  script += '; 主剧情脚本\n';
  
  // 先处理剧本段落（故事叙述）
  if (project.scriptData.storyParagraphs && project.scriptData.storyParagraphs.length > 0) {
    let currentSceneId = '';
    
    project.scriptData.storyParagraphs.forEach((paragraph, pIndex) => {
      // 场景切换
      if (paragraph.sceneRefId && paragraph.sceneRefId !== currentSceneId) {
        currentSceneId = paragraph.sceneRefId;
        const scene = project.scriptData?.scenes?.find(s => s.id === currentSceneId);
        const sceneName = scene?.location || `场景${currentSceneId}`;
        script += `\n// ========== ${sceneName} ==========\n`;
        script += `:${sceneName} - ${scene?.time || ''};\n`;
      }
      
      // 添加段落标题
      if (paragraph.text) {
        script += `\n// ${paragraph.text}\n`;
      }
      
      // 处理段落元素（对话和叙述）
      paragraph.elements?.forEach((element, eIndex) => {
        if (element.type === 'narration' && element.text) {
          // 处理叙述文本，去除多余的空白字符
          const cleanText = element.text.replace(/[\r\n]+/g, '').trim();
          if (cleanText) {
            script += `:${cleanText};\n`;
          }
        } else if (element.type === 'dialogue' && element.text) {
          const speaker = element.speaker || '旁白';
          const cleanText = element.text.replace(/[\r\n]+/g, '').trim();
          if (cleanText) {
            script += `{${speaker}}:${cleanText};\n`;
          }
        }
      });
    });
  }
  
  // 添加分镜脚本（作为补充）
  if (project.shots.length > 0) {
    script += '\n// ========== 分镜脚本 ==========\n';
    project.shots.forEach((shot, index) => {
      // 添加动作描述
      if (shot.actionSummary) {
        script += `:【镜头${index + 1}】${shot.actionSummary};\n`;
      }
      
      // 添加对话
      if (shot.dialogue) {
        const charIds = shot.characters || [];
        if (charIds.length > 0 && project.scriptData) {
          const char = project.scriptData.characters.find(c => c.id === charIds[0]);
          const charName = char?.name || '旁白';
          
          if (charName === '旁白') {
            script += `:${shot.dialogue};\n`;
          } else {
            script += `{${charName}}:${shot.dialogue};\n`;
          }
        } else {
          script += `:${shot.dialogue};\n`;
        }
      }
      
      // 添加镜头间隔
      if (index < project.shots.length - 1) {
        script += '\n';
      }
    });
  }

  return script;
};

// 生成配置和脚本
const config = generateWebGALConfig(project);
const script = generateWebGALScript(project);

// 输出结果
console.log('\n=== 生成的 config.txt ===');
console.log(config);

console.log('\n=== 生成的 start.txt ===');
console.log(script);

// 保存到文件
const outputDir = '/Users/wl/Desktop/job/learn/story-game-generator/tools/WL-AI-Director/output';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'config.txt'), config);
fs.writeFileSync(path.join(outputDir, 'start.txt'), script);

console.log('\n=== 输出文件 ===');
console.log(`配置文件: ${path.join(outputDir, 'config.txt')}`);
console.log(`剧本脚本: ${path.join(outputDir, 'start.txt')}`);

console.log('\n✅ 测试完成！生成的 WebGAL 配置和脚本已保存。');
