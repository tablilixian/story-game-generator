# 实体预扫描功能移植方案

> **项目**: WL-AI-Director  
> **源项目**: AI-Reader-V2  
> **生成日期**: 2026-04-27  
> **状态**: 方案设计

---

## 1. 背景与目标

### 1.1 背景

**AI-Reader-V2** 中的「实体预扫描」功能是一个在小说分析前自动提取实体的预处理模块，它通过统计扫描 + LLM 分类的方式，在不消耗大量 Token 的情况下快速建立实体字典，显著提升后续分析的准确率。

**WL-AI-Director** 目前使用 `novelAnalysisService.ts` 进行小说分析，直接调用 LLM 提取角色和场景，存在以下问题：
- 每章都调用 LLM，Token 消耗大
- 缺乏全局实体字典，跨章节实体识别不连贯
- 没有统计预处理，依赖 LLM 的实体召回质量

### 1.2 目标

将 AI-Reader-V2 的实体预扫描功能移植到 WL-AI-Director，实现：
1. 上传小说时自动进行实体预扫描
2. 建立全局实体字典（人名、地名、组织、物品）
3. 识别别名关系
4. 为后续分镜生成提供实体上下文

---

## 2. 两个项目架构对比

### 2.1 AI-Reader-V2 架构

```
┌─────────────────────────────────────────────────────────────┐
│                      AI-Reader-V2 Backend                    │
├─────────────────────────────────────────────────────────────┤
│  技术栈: Python FastAPI + SQLite                            │
│  部署: 可本地/云端部署                                       │
│                                                              │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ 实体预扫描   │ →  │ 实体字典存储  │ →  │ 分析服务调用  │  │
│  │ (Python)    │    │ (SQLite)     │    │ (注入字典)    │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│         ↑                                                    │
│  ┌──────┴──────┐                                           │
│  │ Phase 1     │ 统计扫描 (CPU)                             │
│  │ - jieba     │  - 分词频率                                │
│  │ - n-gram    │  - N-gram 频率                            │
│  │ - 对话提取  │  - 对话说话人                              │
│  │ - 标题词   │  - 章节标题词                               │
│  │ - 命名模式 │  - 命名模式 (叫作/名叫)                     │
│  │ - 后缀规则 │  - 后缀类型推断                             │
│  └─────────────┘                                           │
│         ↑                                                    │
│  ┌──────┴──────┐                                           │
│  │ Phase 2     │ LLM 分类                                   │
│  │ - 类型判断  │  - 实体类型 (person/location/item/org)     │
│  │ - 别名识别 │  - 别名关系                                 │
│  │ - 噪声过滤 │  - 低质量词汇过滤                           │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 WL-AI-Director 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    WL-AI-Director Frontend                   │
├─────────────────────────────────────────────────────────────┤
│  技术栈: React 19 + TypeScript + Vite                        │
│  存储: IndexedDB + Supabase 云端同步                         │
│  AI: ModelRegistry (多模型支持)                              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              novelAnalysisService.ts                 │    │
│  │  - 直接调用 LLM 提取角色                              │    │
│  │  - 直接调用 LLM 提取场景                              │    │
│  │  - 无预处理阶段                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    数据存储                          │    │
│  │  - projects 表: 项目信息 + ScriptData                │    │
│  │  - assetLibrary 表: 角色/场景/道具资产                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 核心差异对比

| 维度 | AI-Reader-V2 | WL-AI-Director |
|------|--------------|----------------|
| 架构 | 后端 (Python) | 前端 (React) |
| 部署 | 可独立部署 | 浏览器内运行 |
| 存储 | SQLite | IndexedDB |
| 统计计算 | CPU (jieba) | 需 WebAssembly/JS 实现 |
| LLM 调用 | 可配置 | 已支持 (ModelRegistry) |
| 实体字典 | 独立表 | 嵌入 ScriptData.characters |
| 预处理 | Phase 1 统计 | 无 |

---

## 3. 方案对比

### 方案 A：完整移植 (推荐)

**思路**: 将 AI-Reader 的 Phase 1 统计扫描逻辑完整移植到前端，使用 JavaScript/TypeScript 重写。

#### 实现要点

1. **统计扫描模块 (JavaScript)**
   - 使用 `segment` 库替代 jieba（Node.js 中文分词）
   - 实现 N-gram 频率统计
   - 实现对话说话人提取（正则表达式）
   - 实现章节标题词提取
   - 实现命名模式匹配
   - 实现后缀规则匹配

2. **数据结构设计**
   ```typescript
   interface EntityDictEntry {
     name: string;
     entity_type: 'person' | 'location' | 'item' | 'org' | 'concept' | 'unknown';
     frequency: number;
     confidence: 'high' | 'medium' | 'low';
     aliases: string[];
     source: 'freq' | 'ngram' | 'dialogue' | 'title' | 'naming' | 'suffix' | 'llm';
     sample_context?: string;
   }

   interface PrescanResult {
     novel_id: string;
     status: 'pending' | 'running' | 'completed' | 'failed';
     entities: EntityDictEntry[];
     created_at: number;
   }
   ```

3. **存储方案**
   - 新增 `entityDictionary` 表存储在 IndexedDB
   - 集成到现有 HybridStorageService

4. **LLM 分类 (Phase 2)**
   - 复用现有 `chatCompletion` 函数
   - 复用 AI-Reader 的 `prescan_prompts.py` 提示词

5. **UI 组件**
   - 实体预扫描状态卡片
   - 实体列表查看/编辑
   - 手动触发按钮

#### 优点
- ✅ 功能完整，预处理效果与原版一致
- ✅ 减少 LLM Token 消耗
- ✅ 实体字典可复用，跨章节识别更准确

#### 缺点
- ❌ 实现复杂度较高
- ❌ 需要找到合适的 JS 中文分词库

#### 预估工作量
- 统计扫描核心模块: 3-4 天
- 数据存储: 1 天
- LLM 分类: 1 天
- UI 组件: 1-2 天
- **总计: 6-8 天**

---

### 方案 B：轻量级方案 (基于现有服务扩展)

**思路**: 保留现有的 LLM 分析方式，但增加「预扫描」作为独立步骤，在上传小说时先进行一次全局实体提取，建立基础字典。

#### 实现要点

1. **全局实体提取**
   - 将整本小说（而非单章）发送给 LLM
   - 一次性提取所有角色/场景/物品
   - 结果存入 entityDictionary

2. **数据结构**
   ```typescript
   interface LightweightEntity {
     name: string;
     type: 'person' | 'location' | 'item' | 'org';
     aliases: string[];
     firstChapter?: number;
     confidence: 'high' | 'medium';
   }
   ```

3. **注入分析流程**
   - 分析时从字典获取实体列表
   - 作为上下文注入提示词
   - 辅助 LLM 更准确识别

#### 优点
- ✅ 实现简单
- ✅ 利用现有 LLM 能力
- ✅ 开发周期短

#### 缺点
- ❌ 没有统计预处理
- ❌ LLM Token 消耗仍然较大
- ❌ 实体识别质量完全依赖 LLM

#### 预估工作量
- 服务扩展: 1 天
- 数据存储: 0.5 天
- UI: 0.5 天
- **总计: 2 天**

---

### 方案对比总结

| 维度 | 方案 A (完整移植) | 方案 B (轻量级) |
|------|------------------|----------------|
| 实现复杂度 | 高 | 低 |
| Token 消耗 | 低 (统计预处理) | 中 |
| 开发周期 | 6-8 天 | 2 天 |
| 实体识别质量 | 高 | 中 |
| 可维护性 | 中 (需维护两套逻辑) | 高 |
| 长期价值 | 高 | 中 |

---

## 4. 推荐方案：方案 A (完整移植)

综合考虑长期价值和功能完整性，**推荐方案 A**，具体实施步骤如下：

---

## 5. 详细实施计划

### 5.1 技术选型

| 模块 | 技术选择 |
|------|----------|
| 中文分词 | `segment` (npm 包) 或自实现简单分词器 |
| N-gram 统计 | 自实现 (性能要求不高) |
| 存储 | IndexedDB 新增表 |
| AI 调用 | 复用 `services/ai/apiCore.ts` |

### 5.2 目录结构

```
WL-AI-Director/
├── src/
│   ├── services/
│   │   ├── entityPreScanner.ts      # 核心扫描逻辑 (新)
│   │   ├── entityDictionaryStore.ts  # 数据存储 (新)
│   │   └── novelAnalysisService.ts   # 扩展 (修改)
│   │
│   ├── components/
│   │   ├── EntityPrescanCard.tsx     # 扫描状态卡片 (新)
│   │   ├── EntityDictionaryPanel.tsx  # 实体列表面板 (新)
│   │   └── StageScript/
│   │       └── NovelImportPanel.tsx   # 扩展导入面板 (修改)
│   │
│   ├── hooks/
│   │   └── useEntityPrescan.ts       # 扫描状态 Hook (新)
│   │
│   └── types/
│       └── index.ts                   # 扩展类型定义 (修改)
│
└── docs/
    └── entity-prescan-design.md       # 设计文档
```

### 5.3 核心模块设计

#### 5.3.1 实体预扫描服务 (`entityPreScanner.ts`)

```typescript
// 核心类设计
export class EntityPreScanner {
  // 停用词表
  private stopwords: Set<string>;
  
  // 后缀规则
  private suffixRules: Map<string, string[]>;
  
  // 对话动词模式
  private dialoguePatterns: RegExp[];
  
  // 命名模式
  private namingPatterns: RegExp[];
  
  // 主扫描入口
  async scan(novelId: string, chapters: Chapter[]): Promise<EntityDictEntry[]>;
  
  // Phase 1: 统计扫描
  private phase1StatisticalScan(chapters: Chapter[], titles: string[]): CandidateMap;
  
  // Phase 2: LLM 分类
  private async phase2LLMClassification(candidates: EntityDictEntry[]): Promise<EntityDictEntry[]>;
  
  // 辅助方法
  private extractDialogueNames(text: string): Counter;
  private extractTitleWords(titles: string[]): Counter;
  private extractNamingPatterns(text: string): Counter;
  private matchSuffixPatterns(candidates: Set<string>): Map<string, string>;
  private mergeCandidates(...sources: CandidateMap[]): EntityDictEntry[];
}
```

#### 5.3.2 数据存储 (`entityDictionaryStore.ts`)

```typescript
// IndexedDB 表定义
const ENTITY_DICTIONARY_DB = {
  name: 'WLDB',
  version: 8, // 升级版本
  stores: [
    {
      name: 'entityDictionary',
      keyPath: 'id',
      indexes: [
        { name: 'novelId', keyPath: 'novelId' },
        { name: 'entityType', keyPath: 'entityType' }
      ]
    }
  ]
};

// API 设计
export const entityDictionaryStore = {
  async save(novelId: string, entities: EntityDictEntry[]): Promise<void>;
  
  async getAll(novelId: string): Promise<EntityDictEntry[]>;
  
  async getByType(novelId: string, type: string): Promise<EntityDictEntry[]>;
  
  async deleteAll(novelId: string): Promise<void>;
  
  async getStatus(novelId: string): Promise<PrescanStatus>;
  
  async updateStatus(novelId: string, status: PrescanStatus): Promise<void>;
};
```

### 5.4 实施阶段

#### 阶段 1: 基础设施 (第 1-2 天)

- [ ] 扩展 `types/index.ts` 添加实体字典相关类型
- [ ] 创建 `entityDictionaryStore.ts` 实现 IndexedDB 存储
- [ ] 升级数据库版本

#### 阶段 2: 统计扫描核心 (第 3-5 天)

- [ ] 实现 `EntityPreScanner` 类
- [ ] 停用词表迁移
- [ ] 后缀规则迁移
- [ ] 对话提取正则迁移
- [ ] 命名模式迁移
- [ ] N-gram 统计实现
- [ ] 候选合并逻辑

#### 阶段 3: LLM 分类 (第 6 天)

- [ ] 提示词迁移 (从 `prescan_prompts.py`)
- [ ] 实现 `phase2LLMClassification` 方法
- [ ] 结果合并逻辑

#### 阶段 4: 集成与 UI (第 7-8 天)

- [ ] 修改 `NovelImportPanel.tsx` 自动触发扫描
- [ ] 创建 `EntityPrescanCard.tsx` 组件
- [ ] 创建 `EntityDictionaryPanel.tsx` 组件
- [ ] 集成到 StageScript 流程

#### 阶段 5: 测试与优化 (第 9-10 天)

- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化
- [ ] Bug 修复

---

## 6. 风险与注意事项

### 6.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| JS 中文分词库质量不如 jieba | 实体召回率低 | 使用 `segment` 库 + N-gram 补充 |
| 浏览器性能限制 | 大文本扫描卡顿 | 使用 Web Worker 异步处理 |
| LLM 调用失败 | 分类无法完成 | 实现降级策略，只用 Phase 1 结果 |

### 6.2 兼容性

- 需要检查 `segment` 库在浏览器环境的兼容性
- IndexedDB 版本升级需要处理数据迁移

### 6.3 数据迁移

- 现有项目需要手动重新运行预扫描
- 考虑添加数据迁移引导

---

## 7. 附录

### 7.1 参考资源

- AI-Reader-V2 源文件:
  - [entity_pre_scanner.py](file:///Users/wl/Desktop/job/learn/story-game-generator/AI-Reader-V2/backend/src/extraction/entity_pre_scanner.py)
  - [prescan_prompts.py](file:///Users/wl/Desktop/job/learn/story-game-generator/AI-Reader-V2/backend/src/extraction/prescan_prompts.py)
  - [prescan.py](file:///Users/wl/Desktop/job/learn/story-game-generator/AI-Reader-V2/backend/src/api/routes/prescan.py)
  - [entity_dictionary_store.py](file:///Users/wl/Desktop/job/learn/story-game-generator/AI-Reader-V2/backend/src/db/entity_dictionary_store.py)

- WL-AI-Director 现有文件:
  - [novelAnalysisService.ts](file:///Users/wl/Desktop/job/learn/story-game-generator/tools/WL-AI-Director/services/novelAnalysisService.ts)
  - [apiCore.ts](file:///Users/wl/Desktop/job/learn/story-game-generator/tools/WL-AI-Director/services/ai/apiCore.ts)
  - [DATABASE_STRUCTURE.md](file:///Users/wl/Desktop/job/learn/story-game-generator/tools/WL-AI-Director/DATABASE_STRUCTURE.md)

### 7.2 相关 npm 包

- `segment` - Node.js 中文分词库
- `nunjucks` - 模板引擎 (如需提示词模板化)

---

## 8. 决策确认

请确认以下事项后开始实施：

1. [ ] 采用方案 A 还是方案 B？
2. [ ] 是否需要支持离线使用？
3. [ ] 优先级：是先实现核心功能还是完整 UI？
4. [ ] 目标上线时间？

---

*文档版本: 1.0*
