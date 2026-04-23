# Story Game Generator
> AI 小说转视觉小说游戏生成器

## 项目简介

将小说文本自动转换为可运行的视觉小说（Visual Novel）游戏。

## 目录结构

```
story-game-generator/
├── tools/                        # AI 创作工具（基于 WL-AI-Director）
│   └── WL-AI-Director/          # 短剧/漫剧生成平台
│
├── engine/                       # 游戏引擎
│   └── monogatari/              # Monogatari 视觉小说引擎
│
├── workspace/                   # 工作区
│   ├── projects/                # 项目数据
│   │   └── [项目名]/
│   │       ├── data.json        # 原始小说
│   │       ├── chapters.json    # 章节结构
│   │       ├── characters.json  # 角色库
│   │       ├── scenes.json      # 场景库
│   │       ├── scripts/          # 剧本数据
│   │       └── assets/           # 生成的角色/场景图片
│   │
│   └── templates/               # 导出模板
│       └── monogatari/          # Monogatari 导出配置
│
├── shared/                      # 共享模块
│   ├── utils/                   # 工具函数
│   │   ├── validator.js         # 脚本验证
│   │   └── converter.js         # 格式转换
│   │
│   ├── prompts/                 # AI 提示词库
│   │   ├── character_extraction.md
│   │   ├── scene_extraction.md
│   │   └── script_generation.md
│   │
│   └── schemas/                 # 数据结构定义
│       ├── character.json
│       ├── scene.json
│       └── script.json
│
└── docs/                        # 项目文档
    ├── README.md
    └── ARCHITECTURE.md
```

## 快速开始

### 1. 安装依赖

```bash
# 进入工具目录
cd tools/WL-AI-Director
npm install

# 安装验证工具
cd ../../shared/utils
npm install（如果需要）
```

### 2. 启动开发服务器

```bash
# 启动 AI 创作工具
cd tools/WL-AI-Director
npm run dev

# 启动游戏预览（新窗口）
cd ../../engine/monogatari/dist
python -m http.server 8080
```

### 3. 使用流程

1. **导入小说**：在工具中导入小说文本
2. **章节拆分**：自动识别章节结构
3. **角色提取**：AI 分析并提取角色信息
4. **场景提取**：AI 分析并提取场景信息
5. **剧本生成**：将章节转换为剧本格式
6. **脚本转换**：转换为 Monogatari 脚本
7. **资源生成**：生成角色立绘和场景图
8. **预览导出**：预览并导出游戏

## 数据流转

```
小说文本
    │
    ▼
┌─────────────────┐
│  章节拆分        │ ──► chapters.json
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  角色/场景提取   │ ──► characters.json
│                 │ ──► scenes.json
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  剧本生成        │ ──► scripts/*.json
└─────────────────┘
    │
    ▼
┌─────────────────┐     ┌─────────────────┐
│  图像生成        │ ──► │  导出游戏        │
│  (AI 绘图)      │     │  (Monogatari)   │
└─────────────────┘     └─────────────────┘
```

## 技术栈

- **前端**: React 19, Tailwind CSS
- **存储**: IndexedDB
- **AI**: OpenAI GPT / Anthropic Claude（通过 AntSK API）
- **游戏引擎**: Monogatari
- **图像生成**: Midjourney / Stable Diffusion

## 文档

- [Monogatari 中文使用指南](./engine/monogatari/MONOGATARI_CN_USAGE.md)
- [AI 工作流文档](./engine/monogatari/MONOGATARI_AI_WORKFLOW.md)

## License

MIT
