export interface ParsedChapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export function parseNovelToChapters(text: string): ParsedChapter[] {
  const chapters: ParsedChapter[] = [];
  
  const chapterPatterns = [
    /^第([一二三四五六七八九十百千\d]+)章[：:\s]+(.+)$/gm,
    /^第([一二三四五六七八九十百千\d]+)节[：:\s]+(.+)$/gm,
    /^第([一二三四五六七八九十百千\d]+)卷[：:\s]+(.+)$/gm,
    /^第([一二三四五六七八九十百千\d]+)回[　:\s]+(.+)$/gm,
    /^第([一二三四五六七八九十百千\d]+)回$/gm,
    /^第([一二三四五六七八九十百千\d]+)集[　:\s]+(.+)$/gm,
    /^第([一二三四五六七八九十百千\d]+)部[　:\s]+(.+)$/gm,
    /^Chapter\s+(\d+)[:\s]+(.+)$/gim,
    /^第([一二三四五六七八九十百千\d]+)章$/gm,
    /^(\d+)[、：:\s]+(.+)$/gm,
  ];

  const specialChapterPatterns = [
    /^楔子[　:\s]*(.*)$/gm,
    /^序章[　:\s]*(.*)$/gm,
    /^前言[　:\s]*(.*)$/gm,
    /^引子[　:\s]*(.*)$/gm,
    /^尾声[　:\s]*(.*)$/gm,
    /^后记[　:\s]*(.*)$/gm,
  ];

  const lines = text.split('\n');
  let currentChapter: { title: string; content: string[] } | null = null;
  let chapterOrder = 0;
  
  const chineseToNumber = (str: string): number => {
    const numMap: Record<string, number> = {
      '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
      '百': 100, '千': 1000
    };
    
    let result = 0;
    let temp = 0;
    
    for (const char of str) {
      if (numMap[char] < 10) {
        temp = temp * 10 + numMap[char];
      } else if (char === '十') {
        temp = temp === 0 ? 10 : temp * 10;
      } else if (char === '百') {
        temp = temp === 0 ? 100 : temp * 100;
      } else if (char === '千') {
        temp = temp === 0 ? 1000 : temp * 1000;
      }
    }
    
    return temp || result;
  };

  const isChapterHeader = (line: string): { isChapter: boolean; title: string; order?: number } => {
    for (const pattern of chapterPatterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      const match = regex.exec(line);
      if (match) {
        const title = match[2]?.trim() || match[1];
        let order: number | undefined;
        
        if (/^\d+$/.test(match[1])) {
          order = parseInt(match[1]);
        } else {
          order = chineseToNumber(match[1]);
        }
        
        return { isChapter: true, title, order };
      }
    }
    
    if (/^第[一二三四五六七八九十百千\d]+章/.test(line)) {
      const numMatch = line.match(/^第([一二三四五六七八九十百千\d]+)章/);
      if (numMatch) {
        return { isChapter: true, title: line.replace(/^第[一二三四五六七八九十百千\d]+章/, '').trim() || '无标题', order: chineseToNumber(numMatch[1]) };
      }
    }
    
    if (/^第[一二三四五六七八九十百千\d]+回/.test(line)) {
      const numMatch = line.match(/^第([一二三四五六七八九十百千\d]+)回/);
      if (numMatch) {
        return { isChapter: true, title: line.replace(/^第[一二三四五六七八九十百千\d]+回/, '').trim() || '无标题', order: chineseToNumber(numMatch[1]) };
      }
    }
    
    if (/^第[一二三四五六七八九十百千\d]+集/.test(line)) {
      const numMatch = line.match(/^第([一二三四五六七八九十百千\d]+)集/);
      if (numMatch) {
        return { isChapter: true, title: line.replace(/^第[一二三四五六七八九十百千\d]+集/, '').trim() || '无标题', order: chineseToNumber(numMatch[1]) * 1000 };
      }
    }
    
    for (const pattern of specialChapterPatterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      const match = regex.exec(line);
      if (match) {
        return { isChapter: true, title: match[1]?.trim() || line, order: 0 };
      }
    }
    
    return { isChapter: false, title: '' };
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;
    
    const { isChapter, title, order } = isChapterHeader(trimmedLine);
    
    if (isChapter) {
      if (currentChapter && currentChapter.content.length > 0) {
        chapters.push({
          id: `ch_${chapterOrder}`,
          title: currentChapter.title,
          content: currentChapter.content.join('\n'),
          order: chapterOrder
        });
      }
      
      chapterOrder++;
      currentChapter = {
        title: title || `第 ${chapterOrder} 章`,
        content: []
      };
    } else {
      if (!currentChapter) {
        currentChapter = {
          title: '前言/楔子',
          content: []
        };
      }
      currentChapter.content.push(line);
    }
  }
  
  if (currentChapter && currentChapter.content.length > 0) {
    chapters.push({
      id: `ch_${chapterOrder}`,
      title: currentChapter.title,
      content: currentChapter.content.join('\n'),
      order: chapterOrder
    });
  }

  if (chapters.length === 0 && text.length > 0) {
    const maxChunkSize = 10000;
    const chunks: string[] = [];
    
    for (let i = 0; i < text.length; i += maxChunkSize) {
      chunks.push(text.slice(i, i + maxChunkSize));
    }
    
    chapters.push(...chunks.map((content, idx) => ({
      id: `ch_${idx + 1}`,
      title: `第 ${idx + 1} 部分`,
      content,
      order: idx + 1
    })));
  }

  return chapters;
}

export function generateNovelId(): string {
  return `novel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCharacterKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
    .slice(0, 20) || 'char';
}

export function estimateReadingTime(text: string, wordsPerMinute: number = 500): number {
  const charCount = text.length;
  return Math.ceil(charCount / wordsPerMinute);
}
