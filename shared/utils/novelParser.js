/**
 * 小说解析工具
 * 用于解析小说文本，提取章节、角色、场景等信息
 */

const fs = require('fs');
const path = require('path');

class NovelParser {
  constructor() {
    this.chapters = [];
    this.characters = new Map();
    this.scenes = new Map();
  }

  /**
   * 解析小说文本，自动识别章节
   */
  parseChapter(text) {
    const chapterPatterns = [
      /^第([一二三四五六七八九十\d]+)章\s*(.*)$/gm,
      /^第([一二三四五六七八九十\d]+)节\s*(.*)$/gm,
      /^Chapter\s*(\d+)\s*[:\-]?\s*(.*)$/gim,
      /^第([一二三四五六七八九十\d]+)卷\s*(.*)$/gm
    ];

    const chapters = [];
    let currentChapter = null;
    let chapterIndex = 0;

    const lines = text.split('\n');
    
    for (const line of lines) {
      let matched = false;
      
      for (const pattern of chapterPatterns) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          if (currentChapter) {
            chapters.push(currentChapter);
          }
          chapterIndex++;
          currentChapter = {
            id: `ch_${chapterIndex}`,
            title: match[2] || `第 ${match[1]} 章`,
            content: '',
            order: chapterIndex,
            summary: ''
          };
          matched = true;
          break;
        }
      }
      
      if (!matched && currentChapter) {
        currentChapter.content += line + '\n';
      }
    }
    
    if (currentChapter) {
      chapters.push(currentChapter);
    }

    if (chapters.length === 0) {
      chapters.push({
        id: 'ch_1',
        title: '第一章',
        content: text,
        order: 1,
        summary: this.generateSummary(text)
      });
    }

    return chapters;
  }

  /**
   * 生成章节概要
   */
  generateSummary(text, maxLength = 100) {
    const cleaned = text.replace(/[\r\n]+/g, ' ').trim();
    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    return cleaned.substring(0, maxLength) + '...';
  }

  /**
   * 从文本中提取角色名
   */
  extractCharacterNames(text) {
    const names = new Set();
    
    const patterns = [
      /([A-Z][a-zA-Z]{1,20})/g,
      /([小明小红小刚小丽张三李四王五赵六孙七周八吴九郑十]{2,4})/g,
      /"(.*?)"/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1] && match[1].length >= 2) {
          names.add(match[1]);
        }
      }
    }
    
    return Array.from(names);
  }

  /**
   * 从文本中提取场景关键词
   */
  extractSceneKeywords(text) {
    const sceneKeywords = {
      '室内': ['教室', '卧室', '客厅', '厨房', '办公室', '图书馆', '餐厅', '商场'],
      '室外': ['学校', '公园', '街道', '广场', '海边', '山', '森林', '花园'],
      '时间': ['早上', '中午', '下午', '傍晚', '晚上', '深夜', '凌晨']
    };
    
    const found = [];
    for (const [category, keywords] of Object.entries(sceneKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          found.push({ category, keyword });
        }
      }
    }
    
    return found;
  }

  /**
   * 加载提示词模板
   */
  loadPromptTemplate(templateName) {
    const templatePath = path.join(__dirname, '../prompts', `${templateName}.md`);
    try {
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (e) {
      console.error(`Failed to load prompt template: ${templateName}`, e);
      return '';
    }
  }

  /**
   * 解析 JSON 响应
   */
  parseJsonResponse(responseText) {
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      return null;
    }
  }
}

module.exports = { NovelParser };
