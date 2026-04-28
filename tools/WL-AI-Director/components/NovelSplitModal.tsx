import React, { useState, useRef } from 'react';
import { X, Scissors, Upload, Loader2, Check, Trash2 } from 'lucide-react';
import { ProjectState } from '../types';
import { saveProjectToDB } from '../services/storageService';
import { parseNovelToChapters, ParsedChapter } from './StageScript/novelParser';
import { useAlert } from './GlobalAlert';
import logger, { LogCategory } from '@/services/logger';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

type Step = 'upload' | 'preview' | 'splitting';

export const NovelSplitModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onRefresh
}) => {
  const { showAlert } = useAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<Step>('upload');
  const [novelText, setNovelText] = useState('');
  const [chapters, setChapters] = useState<ParsedChapter[]>([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [splitProgress, setSplitProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      showAlert('仅支持 .txt 格式的文件', { type: 'warning' });
      return;
    }

    try {
      const text = await file.text();
      setNovelText(text);
      setProjectTitle(file.name.replace('.txt', ''));
      logger.debug(LogCategory.UI, `📄 已加载文件: ${file.name}, 字符数: ${text.length}`);
    } catch (error) {
      logger.error(LogCategory.UI, '文件读取失败:', error);
      showAlert('文件读取失败', { type: 'error' });
    }
  };

  const handleSplitChapters = () => {
    if (!novelText.trim()) {
      showAlert('请输入小说文本或上传文件', { type: 'warning' });
      return;
    }

    const parsedChapters = parseNovelToChapters(novelText);
    
    if (parsedChapters.length === 0) {
      showAlert('未能识别到章节，请检查小说格式是否正确', { type: 'warning' });
      return;
    }

    setChapters(parsedChapters);
    setStep('preview');
    logger.debug(LogCategory.UI, `📚 已拆分章节: ${parsedChapters.length} 章`);
  };

  const handleRemoveChapter = (index: number) => {
    setChapters(prev => prev.filter((_, i) => i !== index));
  };

  const handleSplit = async () => {
    if (chapters.length === 0) return;

    setStep('splitting');
    setSplitProgress({ current: 0, total: chapters.length });

    try {
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const newProjectId = crypto.randomUUID();
        
        const newProject: ProjectState = {
          id: newProjectId,
          title: chapter.title,
          createdAt: Date.now(),
          lastModified: Date.now(),
          version: 1,
          stage: 'script',
          targetDuration: '60s',
          language: '中文',
          visualStyle: 'live-action',
          shotGenerationModel: 'gpt-5.1',
          rawScript: chapter.content,
          scriptData: null,
          shots: [],
          isParsingScript: false,
          renderLogs: [],
          novelData: null,
          novelTitle: projectTitle || '小说',
          chapterOrder: chapter.order,
          chapterTitle: chapter.title
        };

        await saveProjectToDB(newProject);
        setSplitProgress({ current: i + 1, total: chapters.length });
      }

      logger.debug(LogCategory.AI, `✅ 小说拆分完成: ${chapters.length} 个项目`);
      showAlert(`拆分成功！共创建 ${chapters.length} 个项目`, { type: 'success' });
      
      onRefresh();
      handleClose();
    } catch (error) {
      logger.error(LogCategory.AI, '小说拆分失败:', error);
      showAlert('拆分失败，请重试', { type: 'error' });
      setStep('preview');
    } finally {
      setSplitProgress(null);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setNovelText('');
    setChapters([]);
    setProjectTitle('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-base)]/70 p-6" onClick={handleClose}>
      <div
        className="relative w-full max-w-3xl bg-[var(--bg-primary)] border border-[var(--border-primary)] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          title="关闭"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg text-[var(--text-primary)] flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[var(--accent-text)]" />
            拆分小说为项目
            <span className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-widest">Split Novel</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            {step === 'upload' && '上传小说文本，自动按章节拆分并生成独立项目'}
            {step === 'preview' && `已识别 ${chapters.length} 个章节，请预览确认`}
            {step === 'splitting' && '正在创建项目...'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {step === 'upload' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  项目名称（用于生成项目标题）
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="例如：我的小说"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  小说文本
                </label>
                <textarea
                  value={novelText}
                  onChange={(e) => setNovelText(e.target.value)}
                  placeholder="在此粘贴小说文本，或点击下方按钮上传 .txt 文件..."
                  className="w-full h-64 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".txt"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  上传 .txt 文件
                </button>
                <span className="text-xs text-[var(--text-tertiary)]">
                  已输入 {novelText.length} 字符
                </span>
              </div>

              <button
                onClick={handleSplitChapters}
                disabled={!novelText.trim()}
                className="w-full py-3 bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4" />
                拆分章节
              </button>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">
                  共 {chapters.length} 个章节
                </span>
                <button
                  onClick={() => setStep('upload')}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  重新上传
                </button>
              </div>

              <div className="border border-[var(--border-primary)] rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-secondary)] sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-[var(--text-secondary)] font-medium w-16">#</th>
                      <th className="px-4 py-3 text-left text-[var(--text-secondary)] font-medium">章节标题</th>
                      <th className="px-4 py-3 text-left text-[var(--text-secondary)] font-medium w-24">字数</th>
                      <th className="px-4 py-3 text-center text-[var(--text-secondary)] font-medium w-16">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chapters.map((ch, idx) => (
                      <tr key={idx} className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]">
                        <td className="px-4 py-3 text-[var(--text-tertiary)]">{idx + 1}</td>
                        <td className="px-4 py-3 text-[var(--text-primary)]">{ch.title}</td>
                        <td className="px-4 py-3 text-[var(--text-tertiary)]">{ch.content.length} 字</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveChapter(idx)}
                            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--error-text)] transition-colors"
                            title="删除此章节"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {chapters.length === 0 && (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  已删除所有章节，请重新上传
                </div>
              )}
            </div>
          )}

          {step === 'splitting' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
              <p className="text-[var(--text-secondary)] mb-2">
                正在创建 {splitProgress?.total} 个项目...
              </p>
              <p className="text-sm text-[var(--text-tertiary)]">
                已完成: {splitProgress?.current} / {splitProgress?.total}
              </p>
            </div>
          )}
        </div>

        {step === 'preview' && (
          <div className="p-6 md:p-8 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <div className="text-xs text-[var(--text-tertiary)]">
              将创建 {chapters.length} 个新项目
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSplit}
                disabled={chapters.length === 0}
                className="px-4 py-2 bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认拆分
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NovelSplitModal;
