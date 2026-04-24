import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, RotateCcw, ChevronRight } from 'lucide-react';

export interface VNEvent {
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
  events: VNEvent[];
}

export interface VNCharacter {
  key: string;
  name: string;
  color: string;
}

export interface VNPreviewData {
  characters: Record<string, { name: string; color: string }>;
  scenes: Record<string, string>;
  scripts: Record<string, VNScript>;
}

interface VNPlayerProps {
  data: VNPreviewData;
  onClose: () => void;
}

const VNPlayer: React.FC<VNPlayerProps> = ({ data, onClose }) => {
  const scriptKeys = Object.keys(data.scripts);
  const initialLabel = scriptKeys.length > 0 ? scriptKeys[0] : 'Start';
  const [currentLabel, setCurrentLabel] = useState<string>(initialLabel);
  const [eventIndex, setEventIndex] = useState(0);
  const [currentEvent, setCurrentEvent] = useState<VNEvent | null>(null);
  const [showChoice, setShowChoice] = useState(false);
  const [history, setHistory] = useState<string[]>([initialLabel]);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentScript = data.scripts[currentLabel];
  const events = currentScript?.events || [];

  useEffect(() => {
    if (events.length > 0) {
      const idx = Math.min(eventIndex, events.length - 1);
      const evt = events[idx];
      setCurrentEvent(evt);
      
      if (evt.choice && evt.options) {
        setShowChoice(true);
      } else if (evt.end) {
        setShowChoice(false);
      }
    } else if (showChoice) {
      setShowChoice(false);
    }
  }, [currentLabel, eventIndex, events, showChoice]);

  const advance = useCallback(() => {
    if (!currentEvent) return;
    
    if (currentEvent.choice && currentEvent.options) {
      return;
    }
    
    if (currentEvent.end) {
      return;
    }
    
    const nextIndex = eventIndex + 1;
    if (nextIndex < events.length) {
      setEventIndex(nextIndex);
    }
  }, [currentEvent, eventIndex, events]);

  const handleChoice = (nextLabel: string) => {
    const validLabel = data.scripts[nextLabel] ? nextLabel : initialLabel;
    setShowChoice(false);
    setEventIndex(0);
    setCurrentLabel(validLabel);
    setHistory(prev => [...prev, validLabel]);
  };

  const handleRestart = () => {
    setCurrentLabel(initialLabel);
    setEventIndex(0);
    setShowChoice(false);
    setHistory([initialLabel]);
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prevLabel = newHistory[newHistory.length - 1];
      setCurrentLabel(prevLabel);
      setEventIndex(0);
      setShowChoice(false);
      setHistory(newHistory);
    }
  };

  const getCharacterName = (key: string): string => {
    return data.characters[key]?.name || key;
  };

  const getCharacterColor = (key: string): string => {
    return data.characters[key]?.color || '#3498db';
  };

  const getSceneDescription = (key: string): string => {
    if (data.scenes[key]) {
      return data.scenes[key];
    }
    for (const [sceneKey, sceneName] of Object.entries(data.scenes)) {
      if (sceneName === key) {
        return sceneName;
      }
    }
    return key;
  };

  const renderContent = () => {
    if (!currentEvent) return null;

    if (currentEvent.scene) {
      return (
        <div className="text-center text-white/60 text-lg">
          场景: {getSceneDescription(currentEvent.scene)}
        </div>
      );

    } else if (currentEvent.narration) {
      return (
        <div className="text-center text-white/80 text-lg italic">
          {currentEvent.narration}
        </div>
      );

    } else if (currentEvent.character && currentEvent.text) {
      return (
        <div className="flex flex-col items-center">
          <div 
            className="text-2xl font-bold mb-2"
            style={{ color: getCharacterColor(currentEvent.character) }}
          >
            {getCharacterName(currentEvent.character)}
          </div>
          <div className="text-white text-xl">
            {currentEvent.text}
          </div>
        </div>
      );

    } else if (currentEvent.monologue) {
      return (
        <div className="flex flex-col items-center">
          <div className="text-white/50 text-sm mb-2">（内心独白）</div>
          <div className="text-white/90 text-lg italic">
            "{currentEvent.monologue}"
          </div>
        </div>
      );

    } else if (currentEvent.action) {
      return (
        <div className="text-center text-white/70">
          {currentEvent.action}
        </div>
      );

    } else if (currentEvent.end) {
      return (
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-4">
            {currentEvent.end}
          </div>
          <div className="text-white/60">
            —— 完 —
          </div>
        </div>
      );

    }

    return null;
  };

  const renderChoice = () => {
    if (!currentEvent || !currentEvent.choice || !currentEvent.options) return null;

    return (
      <div className="flex flex-col gap-3 mt-6">
        {currentEvent.options?.map((option: any, idx: number) => (
          <button
            key={idx}
            onClick={() => handleChoice(option.next || initialLabel)}
            className="px-6 py-3 bg-[var(--accent)]/80 hover:bg-[var(--accent)] text-white rounded-lg transition-colors"
          >
            {option.text}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleRestart}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          title="重新开始"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={handleBack}
          disabled={history.length <= 1}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors disabled:opacity-30"
          title="后退"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          title="关闭"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-center p-8 cursor-pointer"
        onClick={advance}
      >
        <div className="max-w-2xl w-full">
          {renderContent()}
          {renderChoice()}
        </div>
      </div>

      <div className="h-16 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
        <div className="text-white/40 text-sm">
          {currentEvent && !currentEvent.end && !showChoice && '点击继续...'}
          {showChoice && '请选择...'}
          {currentEvent?.end && '预览结束'}
        </div>
      </div>
    </div>
  );
};

export default VNPlayer;
