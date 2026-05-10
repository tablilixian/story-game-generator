import React, { useState } from 'react';
import { Gamepad2, Zap, Download, FileText, AlertCircle, CheckCircle, Loader2, Sparkles, Code, Play } from 'lucide-react';
import { ProjectState } from '../../types';
import { useAlert } from '../GlobalAlert';
import { logger, LogCategory } from '../../services/logger';

interface StageWebGALProps {
  project: ProjectState;
  updateProject: (updates: Partial<ProjectState> | ((prev: ProjectState) => ProjectState)) => void;
}

const StageWebGAL: React.FC<StageWebGALProps> = ({ project, updateProject }) => {
  const { showAlert } = useAlert();
  const [isGenerating, setIsGenerating] = useState(false);
  const [webgalConfig, setWebgalConfig] = useState<string>('');
  const [webgalScript, setWebgalScript] = useState<string>('');

  const handleGenerateWebGAL = async () => {
    if (!project.scriptData) {
      showAlert('请先在剧本阶段生成剧本', { type: 'warning' });
      return;
    }

    if (!project.shots || project.shots.length === 0) {
      showAlert('没有可转换的分镜', { type: 'warning' });
      return;
    }

    setIsGenerating(true);
    logger.debug(LogCategory.AI, '🤖 开始生成 WebGAL 配置...');

    try {
      // 生成 WebGAL 配置文件
      const config = generateWebGALConfig(project);
      setWebgalConfig(config);

      // 生成 WebGAL 剧本脚本
      const script = generateWebGALScript(project);
      setWebgalScript(script);

      showAlert('WebGAL 配置生成成功！', { type: 'success' });
      logger.debug(LogCategory.AI, '✅ WebGAL 配置生成完成');
    } catch (error) {
      // 如果AI生成失败，使用离线模式
      logger.warn(LogCategory.AI, 'AI生成失败，使用离线模式生成WebGAL配置');
      
      // 离线生成配置
      const config = generateWebGALConfig(project);
      setWebgalConfig(config);

      // 离线生成脚本
      const script = generateWebGALScript(project);
      setWebgalScript(script);

      showAlert('WebGAL 配置生成成功（离线模式）！', { type: 'success' });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWebGALConfig = (project: ProjectState): string => {
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

  const generateWebGALScript = (project: ProjectState): string => {
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

  const handleDownloadConfig = () => {
    if (!webgalConfig) {
      showAlert('请先生成 WebGAL 配置', { type: 'warning' });
      return;
    }

    const blob = new Blob([webgalConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    showAlert('配置文件下载成功', { type: 'success' });
  };

  const handleDownloadScript = () => {
    if (!webgalScript) {
      showAlert('请先生成 WebGAL 剧本', { type: 'warning' });
      return;
    }

    const blob = new Blob([webgalScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'start.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    showAlert('剧本文件下载成功', { type: 'success' });
  };

  const handlePreviewWebGAL = () => {
    if (!webgalConfig || !webgalScript) {
      showAlert('请先生成 WebGAL 配置和剧本', { type: 'warning' });
      return;
    }

    // 打开 WebGAL 预览页面
    window.open('http://localhost:3000/', '_blank');
  };

  return (
    <div className="h-full bg-[var(--bg-base)] p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">WebGAL 游戏转换</h1>
              <p className="text-[var(--text-tertiary)]">将您的项目转换为 WebGAL 视觉小说格式</p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Generate Card */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">生成配置</h3>
            </div>
            <p className="text-[var(--text-tertiary)] text-sm mb-4">
              基于当前项目数据生成 WebGAL 配置文件
            </p>
            <button
              onClick={handleGenerateWebGAL}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  生成 WebGAL 配置
                </div>
              )}
            </button>
          </div>

          {/* Preview Card */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">预览游戏</h3>
            </div>
            <p className="text-[var(--text-tertiary)] text-sm mb-4">
              在本地 WebGAL 引擎中预览生成的结果
            </p>
            <button
              onClick={handlePreviewWebGAL}
              disabled={!webgalConfig || !webgalScript}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                预览 WebGAL 游戏
              </div>
            </button>
          </div>
        </div>

        {/* Generated Content */}
        {(webgalConfig || webgalScript) && (
          <div className="space-y-6">
            {/* Config File */}
            {webgalConfig && (
              <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[var(--text-primary)]" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">配置文件 (config.txt)</h3>
                  </div>
                  <button
                    onClick={handleDownloadConfig}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
                <div className="bg-[var(--bg-base)] rounded-lg p-4 font-mono text-sm text-[var(--text-secondary)] whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {webgalConfig}
                </div>
              </div>
            )}

            {/* Script File */}
            {webgalScript && (
              <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-[var(--text-primary)]" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">剧本脚本 (start.txt)</h3>
                  </div>
                  <button
                    onClick={handleDownloadScript}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
                <div className="bg-[var(--bg-base)] rounded-lg p-4 font-mono text-sm text-[var(--text-secondary)] whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {webgalScript}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50/50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">使用说明</h3>
          </div>
          <div className="text-sm text-blue-800 space-y-2">
            <p>1. 点击"生成 WebGAL 配置"按钮，基于当前项目数据生成配置文件</p>
            <p>2. 下载生成的配置文件，放入 WebGAL 项目的 game 文件夹中</p>
            <p>3. 点击"预览 WebGAL 游戏"在本地引擎中查看效果</p>
            <p>4. 根据需要调整配置文件和剧本脚本</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageWebGAL;