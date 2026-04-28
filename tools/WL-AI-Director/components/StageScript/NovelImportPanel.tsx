import React, { useState, useCallback } from 'react';
import { FileText, Upload, Loader2, AlertCircle, CheckCircle, BookOpen, Play, X, RefreshCw, Download, Users, MapPin, Zap } from 'lucide-react';
import { NovelData, NovelChapter, NovelCharacter, NovelScene } from '../../types';
import { useAlert } from '../GlobalAlert';
import { logger, LogCategory } from '../../services/logger';
import VNPlayer from './VNPlayer';

interface NovelImportPanelProps {
  novelData: NovelData | null | undefined;
  onImport: (text: string) => void;
  onAnalyzeChapters: () => void;
  onGenerateScript: () => void;
  onQuickConvert?: () => void;
  onApplyToScript?: () => void;
  onExportMonogatari: () => void;
  onPreviewGame: () => void;
  onExportCompleteGame: () => void;
  isAnalyzing: boolean;
  isGeneratingScript: boolean;
  isApplyingToScript?: boolean;
}

const NovelImportPanel: React.FC<NovelImportPanelProps> = ({
  novelData,
  onImport,
  onAnalyzeChapters,
  onGenerateScript,
  onQuickConvert,
  onApplyToScript,
  onExportMonogatari,
  onPreviewGame,
  onExportCompleteGame,
  isAnalyzing,
  isGeneratingScript,
  isApplyingToScript
}) => {
  const { showAlert } = useAlert();
  const [novelText, setNovelText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<NovelCharacter | null>(null);
  const [selectedScene, setSelectedScene] = useState<NovelScene | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      showAlert('仅支持 .txt 格式的文件', { type: 'warning' });
      return;
    }

    try {
      const text = await file.text();
      setNovelText(text);
      logger.debug(LogCategory.UI, `📄 已加载文件: ${file.name}, 字符数: ${text.length}`);
    } catch (error) {
      logger.error(LogCategory.UI, '文件读取失败:', error);
      showAlert('文件读取失败', { type: 'error' });
    }
  }, [showAlert]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleImport = () => {
    if (!novelText.trim()) {
      showAlert('请输入小说文本或上传文件', { type: 'warning' });
      return;
    }
    onImport(novelText);
  };

  const hasNovelData = novelData && novelData.sourceText;
  const hasChapters = novelData && novelData.chapters && novelData.chapters.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* 标题区域 */}
      <div className="px-6 py-4 border-b border-[var(--border-primary)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          小说导入
        </h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          导入小说文本，自动拆分章节，提取角色和场景
        </p>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        {!hasNovelData ? (
          <>
            {/* 文本输入区 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                小说文本
              </label>
              <textarea
                value={novelText}
                onChange={(e) => setNovelText(e.target.value)}
                placeholder="在此粘贴小说文本，或拖拽 .txt 文件到下方区域..."
                className="w-full h-48 px-3 py-2 text-sm bg-[var(--bg-base)] border border-[var(--border-primary)] rounded-lg resize-none focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
            </div>

            {/* 文件上传区 */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                  : 'border-[var(--border-primary)] hover:border-[var(--accent)]'
              }`}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                拖拽 .txt 文件到此处，或
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                <FileText className="w-4 h-4" />
                选择文件
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-[var(--text-muted)] mt-3">
                支持 .txt 格式的文本文件
              </p>
            </div>

            {/* 导入按钮 */}
            <button
              onClick={handleImport}
              disabled={!novelText.trim()}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              开始导入
            </button>
          </>
        ) : (
          <>
            {/* 已导入状态 */}
            <div className="space-y-4">
              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--bg-hover)] rounded-lg p-4">
                  <div className="text-2xl font-bold text-[var(--accent)]">
                    {novelData.sourceText.length.toLocaleString()}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">字符数</div>
                </div>
                <div className="bg-[var(--bg-hover)] rounded-lg p-4">
                  <div className="text-2xl font-bold text-[var(--accent)]">
                    {novelData.chapters?.length || 0}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">章节数</div>
                </div>
              </div>

              {/* 章节列表 */}
              {hasChapters && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                    章节预览
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {novelData.chapters.map((chapter: NovelChapter, index: number) => (
                      <div 
                        key={chapter.id}
                        className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-hover)] rounded-lg text-sm"
                      >
                        <span className="text-[var(--text-muted)] w-8">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-[var(--text-primary)] truncate">
                          {chapter.title}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {(chapter.content.length / 1000).toFixed(1)}k 字
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setNovelText(novelData.sourceText)}
                  className="flex-1 px-4 py-2 border border-[var(--border-primary)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                >
                  重新编辑
                </button>
                <button
                  onClick={onAnalyzeChapters}
                  disabled={isAnalyzing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      分析章节
                    </>
                  )}
                </button>
              </div>

              {/* 应用到角色/场景按钮 */}
              {novelData.characters && novelData.characters.length > 0 && novelData.scenes && novelData.scenes.length > 0 && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={onApplyToScript}
                    disabled={isApplyingToScript}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isApplyingToScript ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        应用中...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        应用到角色/场景
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* 快速转换按钮（无需AI） */}
              {onQuickConvert && !novelData.vnScript && (
                <button
                  onClick={onQuickConvert}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <Zap className="w-4 h-4" />
                  快速转换（无需AI）
                </button>
              )}

              {/* 生成剧本按钮 */}
              {novelData.characters && novelData.characters.length > 0 && novelData.scenes && novelData.scenes.length > 0 && !novelData.vnScript && (
                <button
                  onClick={onGenerateScript}
                  disabled={isGeneratingScript}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isGeneratingScript ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      生成剧本中...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      生成视觉小说剧本
                    </>
                  )}
                </button>
              )}

              {/* 导出 Monogatari 按钮 */}
              {novelData.vnScript && (
                <div className="flex gap-2">
                  <button
                    onClick={onPreviewGame}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    <Play className="w-4 h-4" />
                    预览游戏
                  </button>
                  <button
                    onClick={onExportMonogatari}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    <FileText className="w-4 h-4" />
                    导出脚本
                  </button>
                </div>
              )}

              {/* 导出完整游戏按钮 */}
              {novelData.vnScript && (
                <button
                  onClick={onExportCompleteGame}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  导出完整游戏
                </button>
              )}

              {/* 重新生成剧本按钮 */}
              {novelData.vnScript && (
                <button
                  onClick={onGenerateScript}
                  disabled={isGeneratingScript}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isGeneratingScript ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      重新生成中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      重新生成剧本
                    </>
                  )}
                </button>
              )}

              {/* 分析进度 */}
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在提取角色和场景...
                </div>
              )}

              {/* 提取结果 */}
              {novelData.characters && novelData.characters.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                    已提取角色 ({novelData.characters.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {novelData.characters.slice(0, 20).map((char) => (
                      <span 
                        key={char.id}
                        onClick={() => setSelectedCharacter(char)}
                        className="px-2 py-1 bg-[var(--bg-hover)] rounded text-xs text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--accent)] hover:text-white transition-colors"
                        style={char.color ? { borderLeft: `3px solid ${char.color}` } : undefined}
                      >
                        {char.name}
                      </span>
                    ))}
                    {novelData.characters.length > 20 && (
                      <span className="px-2 py-1 text-xs text-[var(--text-muted)]">
                        +{novelData.characters.length - 20} 更多
                      </span>
                    )}
                  </div>
                </div>
              )}

              {novelData.scenes && novelData.scenes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                    已提取场景 ({novelData.scenes.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {novelData.scenes.slice(0, 20).map((scene) => (
                      <span 
                        key={scene.id}
                        onClick={() => setSelectedScene(scene)}
                        className="px-2 py-1 bg-[var(--bg-hover)] rounded text-xs text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--accent)] hover:text-white transition-colors"
                      >
                        {scene.name}
                      </span>
                    ))}
                    {novelData.scenes.length > 20 && (
                      <span className="px-2 py-1 text-xs text-[var(--text-muted)]">
                        +{novelData.scenes.length - 20} 更多
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showPlayer && novelData.vnScript && (
        <VNPlayer
          data={novelData.vnScript}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {selectedCharacter && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedCharacter(null)}>
          <div className="bg-[var(--bg-surface)] rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
              <h2 className="text-lg font-bold" style={{ color: selectedCharacter.color }}>{selectedCharacter.name}</h2>
              <button onClick={() => setSelectedCharacter(null)} className="p-1 hover:bg-[var(--bg-hover)] rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {selectedCharacter.new_aliases && selectedCharacter.new_aliases.length > 0 && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">别名：</span>
                  <span className="text-sm">{selectedCharacter.new_aliases.join('、')}</span>
                </div>
              )}
              {selectedCharacter.role && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">角色定位：</span>
                  <span className="text-sm">
                    {selectedCharacter.role === 'protagonist' && '主角'}
                    {selectedCharacter.role === 'supporting' && '配角'}
                    {selectedCharacter.role === 'antagonist' && '反派'}
                    {selectedCharacter.role === 'minor' && '龙套'}
                  </span>
                </div>
              )}
              {selectedCharacter.gender && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">性别：</span>
                  <span className="text-sm">
                    {selectedCharacter.gender === 'male' && '男'}
                    {selectedCharacter.gender === 'female' && '女'}
                    {selectedCharacter.gender === 'other' && '其他'}
                    {selectedCharacter.gender === 'unknown' && '未知'}
                  </span>
                </div>
              )}
              {selectedCharacter.age && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">年龄：</span>
                  <span className="text-sm">{selectedCharacter.age}</span>
                </div>
              )}
              {selectedCharacter.personality && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">性格：</span>
                  <span className="text-sm">{selectedCharacter.personality}</span>
                </div>
              )}
              {selectedCharacter.appearance && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">外貌：</span>
                  <span className="text-sm">{selectedCharacter.appearance}</span>
                </div>
              )}
              {selectedCharacter.firstAppearance && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">首次出场：</span>
                  <span className="text-sm">{selectedCharacter.firstAppearance}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedScene && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedScene(null)}>
          <div className="bg-[var(--bg-surface)] rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedScene.name}</h2>
              <button onClick={() => setSelectedScene(null)} className="p-1 hover:bg-[var(--bg-hover)] rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {selectedScene.type && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">类型：</span>
                  <span className="text-sm">{selectedScene.type}</span>
                </div>
              )}
              {selectedScene.parent && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">上级地点：</span>
                  <span className="text-sm">{selectedScene.parent}</span>
                </div>
              )}
              {selectedScene.timeOfDay && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">时间段：</span>
                  <span className="text-sm">
                    {selectedScene.timeOfDay === 'morning' && '早晨'}
                    {selectedScene.timeOfDay === 'afternoon' && '下午'}
                    {selectedScene.timeOfDay === 'evening' && '傍晚'}
                    {selectedScene.timeOfDay === 'night' && '夜晚'}
                    {selectedScene.timeOfDay === 'day' && '白天'}
                    {selectedScene.timeOfDay === 'dusk' && '黄昏'}
                    {selectedScene.timeOfDay === 'dawn' && '黎明'}
                  </span>
                </div>
              )}
              {selectedScene.weather && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">天气：</span>
                  <span className="text-sm">
                    {selectedScene.weather === 'sunny' && '晴朗'}
                    {selectedScene.weather === 'cloudy' && '多云'}
                    {selectedScene.weather === 'rainy' && '下雨'}
                    {selectedScene.weather === 'snowy' && '下雪'}
                    {selectedScene.weather === 'foggy' && '雾'}
                    {selectedScene.weather === 'stormy' && '暴风雨'}
                  </span>
                </div>
              )}
              {selectedScene.atmosphere && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">氛围：</span>
                  <span className="text-sm">{selectedScene.atmosphere}</span>
                </div>
              )}
              {selectedScene.description && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">描述：</span>
                  <span className="text-sm">{selectedScene.description}</span>
                </div>
              )}
              {selectedScene.chapterRef && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">首次出场：</span>
                  <span className="text-sm">{selectedScene.chapterRef}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovelImportPanel;
