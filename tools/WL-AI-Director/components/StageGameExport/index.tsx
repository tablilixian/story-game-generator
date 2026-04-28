import React, { useState } from 'react';
import { Gamepad2, Zap, Download, Play, FileText, AlertCircle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { ProjectState } from '../../types';
import { useAlert } from '../GlobalAlert';
import { logger, LogCategory } from '../../services/logger';
import { convertRawScriptToVNScript, convertAllChaptersToVNScript } from '../../services/vnScriptConverter';
import { generateVNScriptFromShots } from '../../services/vnScriptConverter';
import { downloadMonogatariScript, openGamePreviewWithLocalEngine, downloadCompleteGame, downloadCompleteGameWithAssets, exportGameToLocal, exportGameWithAssetsToLocal } from '../../utils/monogatariExport';
import { extractGameAssets } from '../../services/vnScriptConverter';

interface StageGameExportProps {
  project: ProjectState;
  updateProject: (updates: Partial<ProjectState> | ((prev: ProjectState) => ProjectState)) => void;
}

const StageGameExport: React.FC<StageGameExportProps> = ({ project, updateProject }) => {
  const { showAlert } = useAlert();
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);



  const handleAIGenerateScript = async () => {
    if (!project.scriptData) {
      showAlert('请先在剧本阶段生成剧本', { type: 'warning' });
      return;
    }

    if (!project.shots || project.shots.length === 0) {
      showAlert('没有可转换的分镜', { type: 'warning' });
      return;
    }

    if (!project.scriptData.characters || project.scriptData.characters.length === 0) {
      showAlert('没有可用的角色数据', { type: 'warning' });
      return;
    }

    if (!project.scriptData.scenes || project.scriptData.scenes.length === 0) {
      showAlert('没有可用的场景数据', { type: 'warning' });
      return;
    }

    setIsGeneratingScript(true);
    logger.debug(LogCategory.AI, '🤖 开始 AI 生成剧本...');

    try {
      const scriptData = await generateVNScriptFromShots(
        project.shots,
        project.scriptData.characters,
        project.scriptData.scenes,
        project.scriptData.title || '视觉小说',
        (current, total) => {
          logger.debug(LogCategory.AI, `📝 剧本生成进度: ${current}/${total}`);
        },
        // 传入 storyParagraphs（如果存在），用于生成更丰富的 VN 事件
        project.scriptData.storyParagraphs
      );

      updateProject({
        novelData: {
          sourceText: project.rawScript || '',
          chapters: [],
          characters: [],
          scenes: [],
          isAnalyzing: false,
          analyzedChapters: [],
          vnScript: scriptData
        }
      });

      logger.debug(LogCategory.AI, `✅ AI 剧本生成完成: ${Object.keys(scriptData.scripts).length} 个章节剧本`);
      showAlert(`AI 剧本生成完成！共 ${Object.keys(scriptData.scripts).length} 个章节`, { type: 'success' });
    } catch (error) {
      logger.error(LogCategory.AI, 'AI 剧本生成失败:', error);
      showAlert('AI 剧本生成失败，请重试', { type: 'error' });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handlePreviewGame = async () => {
    if (!project.novelData?.vnScript) {
      showAlert('请先生成游戏剧本', { type: 'warning' });
      return;
    }

    try {
      await openGamePreviewWithLocalEngine(project.novelData.vnScript, project.title || '视觉小说');
      logger.info(LogCategory.UI, '🎮 游戏预览已打开');
    } catch (error) {
      logger.error(LogCategory.UI, '预览失败:', error);
      showAlert('预览失败，请重试', { type: 'error' });
    }
  };

  const handleExportScript = () => {
    if (!project.novelData?.vnScript) {
      showAlert('请先生成游戏剧本', { type: 'warning' });
      return;
    }

    downloadMonogatariScript(project.novelData.vnScript, 'script.js');
    logger.info(LogCategory.UI, '✅ Monogatari 脚本已导出');
    showAlert('Monogatari 脚本已导出！', { type: 'success' });
  };

  const handleExportCompleteGame = async () => {
    if (!project.novelData?.vnScript) {
      showAlert('请先生成游戏剧本', { type: 'warning' });
      return;
    }

    const hasScriptData = project.scriptData && project.scriptData.characters && project.scriptData.characters.length > 0;
    const hasScriptDataCharacters = hasScriptData && project.scriptData.characters.length > 0;
    const hasScriptDataScenes = hasScriptData && project.scriptData.scenes && project.scriptData.scenes.length > 0;
    const hasShots = project.shots && project.shots.length > 0;

    let assets = null;
    if (hasScriptDataCharacters && hasScriptDataScenes && hasShots) {
      assets = await extractGameAssets(
        project.shots,
        project.scriptData!.characters,
        project.scriptData!.scenes
      );
      
      if (assets.stats.totalImages === 0) {
        showAlert('没有可导出的图片资源', { type: 'warning' });
      }
    }

    if (assets && assets.stats.totalImages > 0) {
      await downloadCompleteGameWithAssets(
        project.novelData.vnScript,
        assets,
        project.title || 'game',
        (message, percent) => {
          logger.debug(LogCategory.UI, `导出进度: ${percent}% - ${message}`);
        }
      );
      logger.info(LogCategory.UI, `✅ 完整游戏已导出（含 ${assets.stats.totalImages} 张图片）`);
      showAlert(`完整游戏已导出！含 ${assets.stats.totalImages} 张图片`, { type: 'success' });
    } else {
      downloadCompleteGame(project.novelData.vnScript, project.title || 'game');
      logger.info(LogCategory.UI, '✅ 完整游戏已导出');
      showAlert('完整游戏已导出！', { type: 'success' });
    }
  };

  const handleExportToLocal = async () => {
    if (!project.novelData?.vnScript) {
      showAlert('请先生成游戏剧本', { type: 'warning' });
      return;
    }

    const hasScriptData = project.scriptData && project.scriptData.characters && project.scriptData.characters.length > 0;
    const hasScriptDataCharacters = hasScriptData && project.scriptData.characters.length > 0;
    const hasScriptDataScenes = hasScriptData && project.scriptData.scenes && project.scriptData.scenes.length > 0;
    const hasShots = project.shots && project.shots.length > 0;

    let assets = null;
    if (hasScriptDataCharacters && hasScriptDataScenes && hasShots) {
      assets = await extractGameAssets(
        project.shots,
        project.scriptData!.characters,
        project.scriptData!.scenes
      );
      
      if (assets.stats.totalImages === 0) {
        showAlert('没有可导出的图片资源', { type: 'warning' });
      }
    }

    if (assets && assets.stats.totalImages > 0) {
      const result = await exportGameWithAssetsToLocal(
        project.novelData.vnScript,
        assets,
        project.title || 'game',
        (message, percent) => {
          logger.debug(LogCategory.UI, `导出进度: ${percent}% - ${message}`);
        }
      );
      
      if (result.success) {
        logger.info(LogCategory.UI, `✅ 游戏已保存到本地（含 ${assets.stats.totalImages} 张图片）`);
        showAlert(`游戏已保存到本地！含 ${assets.stats.totalImages} 张图片`, { type: 'success' });
      } else {
        logger.warn(LogCategory.UI, `导出取消: ${result.error}`);
        if (result.error !== '用户取消了保存') {
          showAlert(`导出失败: ${result.error}`, { type: 'error' });
        }
      }
    } else {
      const result = await exportGameToLocal(
        project.novelData.vnScript,
        project.title || 'game'
      );
      
      if (result.success) {
        logger.info(LogCategory.UI, '✅ 游戏已保存到本地');
        showAlert('游戏已保存到本地！', { type: 'success' });
      } else {
        logger.warn(LogCategory.UI, `导出取消: ${result.error}`);
        if (result.error !== '用户取消了保存') {
          showAlert(`导出失败: ${result.error}`, { type: 'error' });
        }
      }
    }
  };

  const hasNovelData = project.novelData && project.novelData.sourceText;
  const hasChapters = project.novelData?.chapters && project.novelData.chapters.length > 0;
  const hasCharacters = project.novelData?.characters && project.novelData.characters.length > 0;
  const hasScenes = project.novelData?.scenes && project.novelData.scenes.length > 0;
  const hasVnScript = project.novelData?.vnScript;

  const hasScriptData = project.scriptData && project.scriptData.characters && project.scriptData.characters.length > 0;
  const hasScriptDataCharacters = hasScriptData && project.scriptData.characters.length > 0;
  const hasScriptDataScenes = hasScriptData && project.scriptData.scenes && project.scriptData.scenes.length > 0;
  const hasShots = project.shots && project.shots.length > 0;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      {/* 标题区域 */}
      <div className="px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-surface)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          游戏导出
        </h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          将小说转换为视觉游戏，支持快速转换和预览导出
        </p>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 数据状态 */}
          <div className="bg-[var(--bg-surface)] rounded-lg p-4 border border-[var(--border-primary)]">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">数据状态</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hasNovelData ? 'bg-green-600/20 text-green-400' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'}`}>
                {hasNovelData ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-xs">小说数据</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hasChapters ? 'bg-green-600/20 text-green-400' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'}`}>
                {hasChapters ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-xs">章节</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hasCharacters ? 'bg-green-600/20 text-green-400' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'}`}>
                {hasCharacters ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-xs">角色</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hasScenes ? 'bg-green-600/20 text-green-400' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'}`}>
                {hasScenes ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-xs">场景</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hasVnScript ? 'bg-green-600/20 text-green-400' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'}`}>
                {hasVnScript ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-xs">游戏剧本</span>
              </div>
            </div>
          </div>


          {/* AI 生成剧本区域 */}
          <div className="bg-[var(--bg-surface)] rounded-lg p-6 border border-[var(--border-primary)]">
            <h3 className="text-base font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI 生成剧本
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] mb-4">
              使用 AI 智能生成游戏剧本，支持对话、场景描述和分支剧情。需要 AI API Key。
            </p>
            
            {hasVnScript ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-4 py-3 bg-green-600/20 text-green-400 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span>剧本已生成</span>
                </div>
                <button
                  onClick={handleAIGenerateScript}
                  disabled={!hasScriptDataCharacters || !hasScriptDataScenes || !hasShots || isGeneratingScript}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/80 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingScript ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI 生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      重新 AI 生成
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleAIGenerateScript}
                disabled={!hasScriptDataCharacters || !hasScriptDataScenes || !hasShots || isGeneratingScript}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingScript ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI 生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    开始 AI 生成
                  </>
                )}
              </button>
            )}

            {(!hasScriptDataCharacters || !hasScriptDataScenes || !hasShots) && !isGeneratingScript && (
              <p className="text-xs text-[var(--text-muted)] mt-2">
                {!hasScriptDataCharacters && '请先在剧本阶段生成角色'}
                {hasScriptDataCharacters && !hasScriptDataScenes && '请先在剧本阶段生成场景'}
                {hasScriptDataCharacters && hasScriptDataScenes && !hasShots && '请先生成分镜'}
              </p>
            )}
          </div>

          {/* 导出功能区域 */}
          {hasVnScript && (
            <div className="bg-[var(--bg-surface)] rounded-lg p-6 border border-[var(--border-primary)]">
              <h3 className="text-base font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                导出与预览
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handlePreviewGame}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <Play className="w-5 h-5" />
                  预览游戏
                </button>
                
                <button
                  onClick={handleExportScript}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <FileText className="w-5 h-5" />
                  导出脚本 (Monogatari)
                </button>
                
                <button
                  onClick={handleExportCompleteGame}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <Download className="w-5 h-5" />
                  导出完整游戏
                </button>
                
                <button
                  onClick={handleExportToLocal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <FileText className="w-5 h-5" />
                  保存到本地
                </button>
              </div>
            </div>
          )}

          {/* 统计信息 */}
          {hasVnScript && project.novelData?.vnScript && (
            <div className="bg-[var(--bg-surface)] rounded-lg p-6 border border-[var(--border-primary)]">
              <h3 className="text-base font-medium text-[var(--text-primary)] mb-4">剧本统计</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--accent)]">
                    {Object.keys(project.novelData.vnScript.characters).length}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">角色数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--accent)]">
                    {Object.keys(project.novelData.vnScript.scenes).length}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">场景数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--accent)]">
                    {Object.keys(project.novelData.vnScript.scripts).length}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">章节数</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StageGameExport;
