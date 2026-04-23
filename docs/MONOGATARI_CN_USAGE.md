# Monogatari 视觉小说引擎 - 中文使用指南

## 目录

1. [项目简介](#1-项目简介)
2. [快速开始](#2-快速开始)
3. [核心概念](#3-核心概念)
4. [脚本语法](#4-脚本语法)
5. [动作指令](#5-动作指令)
6. [API 参考](#6-api-参考)
7. [完整示例](#7-完整示例)
8. [常见问题](#8-常见问题)

---

## 1. 项目简介

### 1.1 什么是 Monogatari？

Monogatari 是一个专为**视觉小说（Visual Novel）** 设计的 Web 游戏引擎。

- **官网**: https://monogatari.io/
- **文档**: https://developers.monogatari.io/
- **版本**: 2.8.0
- ** License**: MIT（免费开源）

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| 响应式设计 | 自适应手机/平板/桌面 |
| 多平台支持 | Web、iOS、Android、Windows、macOS、Linux |
| 简单语法 | 类似 Ren'Py 的脚本语言 |
| 多媒体支持 | 图片、音频、视频、粒子效果 |
| 存档系统 | 内置存档/读档功能 |
| 多语言 | 支持 18+ 种语言 |
| PWA 支持 | 可安装为独立应用，支持离线游玩 |

### 1.3 项目结构

```
项目目录/
├── index.html              # 主页面
├── js/
│   ├── main.js            # 入口文件（初始化引擎）
│   ├── options.js         # 游戏配置
│   ├── storage.js         # 存储配置
│   └── script.js          # 游戏脚本（主要编写位置）
├── assets/                 # 资源文件
│   ├── characters/        # 角色立绘
│   ├── scenes/           # 背景图片
│   ├── music/             # 背景音乐
│   ├── sounds/           # 音效
│   ├── voices/           # 语音
│   ├── videos/           # 视频
│   ├── images/           # 通用图片
│   └── gallery/          # CG 相册
└── engine/               # 引擎核心（无需修改）
```

---

## 2. 快速开始

### 2.1 启动开发服务器

```bash
# 方法1：使用 Python（推荐）
cd 项目目录
python3 -m http.server 8080

# 方法2：使用 Node.js
npx serve .

# 方法3：使用 Bun
bun run serve.ts
```

访问 http://localhost:8080 即可运行游戏。

### 2.2 修改游戏内容

游戏的主要逻辑在 `js/script.js` 文件中。修改后刷新浏览器即可看到效果。

### 2.3 最简单的示例

```javascript
monogatari.script({
    'Start': [
        '你好！欢迎来到 Monogatari！',
        'end'
    ]
});
```

---

## 3. 核心概念

### 3.1 脚本结构

Monogatari 使用类似 Ren'Py 的脚本语法。脚本由**标签（Label）**和**语句（Statement）**组成。

```javascript
monogatari.script({
    '标签名': [
        // 语句列表
        '动作1',
        '动作2',
        { 复杂动作 },
        'end'  // 结束游戏
    ]
});
```

### 3.2 资源定义

在 `script.js` 中使用 `monogatari.assets()` 定义资源：

```javascript
// 背景图片
monogatari.assets('scenes', {
    morning: 'morning.png',
    afternoon: 'afternoon.png',
    night: 'night.png'
});

// 背景音乐
monogatari.assets('music', {
    bgm_main: 'main_theme.mp3',
    bgm_battle: 'battle.mp3'
});

// 音效
monogatari.assets('sounds', {
    click: 'click.mp3',
    door_open: 'door.mp3'
});

// 角色立绘
monogatari.characters({
    'yui': {
        name: 'Yui',
        color: '#5bcaff',
        directory: 'yui',      // 角色图片目录
        sprites: {             // 立绘表情
            happy: 'happy.png',
            sad: 'sad.png',
            angry: 'angry.png'
        }
    }
});
```

### 3.3 资源路径配置

在 `js/options.js` 中配置资源路径：

```javascript
monogatari.settings({
    // 本地路径（默认）
    'AssetsPath': {
        'root': 'assets',
        'scenes': 'scenes',
        'characters': 'characters',
        'music': 'music',
        // ...
    },
    
    // 远程 CDN（可选）
    'AssetsPath': {
        'root': 'https://your-cdn.com/assets',
        'scenes': 'scenes',
        // ...
    }
});
```

---

## 4. 脚本语法

### 4.1 对话

#### 旁白对话（无角色）
```javascript
'这是旁白文字'
```

#### 角色对话
```javascript
// 简写形式（使用角色键名）
'y 这是 Yui 说的话'

// 完整形式
{'Character': 'y', 'Text': '这是 Yui 说的话'}
```

#### 居中对话（剧情文字）
```javascript
'centered 这是一段重要的剧情文字'
```

#### 使用变量
```javascript
'你好，{{player.name}}！'
```

### 4.2 分支选择

```javascript
{
    'Choice': {
        'Dialog': 'y 你想做什么？',
        // ⚠️ 重要：选项键名必须使用英文！不能使用中文！
        'shop': {
            'Text': '去商店',
            'Do': 'jump shop'  // ⚠️ 跳转必须加 'jump' 前缀
        },
        'home': {
            'Text': '回家',
            'Do': 'jump home'
        },
        'explore': {
            'Text': '继续探索',
            'Do': 'jump explore',
            'Condition': function() {
                // 条件显示选项（可选）
                return this.storage('has_map') === true;
            }
        }
    }
}
```

> ⚠️ **特别注意**：
> - **选项键名必须使用英文**（如 `shop`、`home`），不能使用中文（如 `去商店`）
> - **跳转必须加 `jump` 前缀**（如 `'Do': 'jump shop'`）
```

### 4.3 条件判断

```javascript
{
    'Conditional': {
        'Condition': function() {
            return this.storage('player.money') >= 100;
        },
        'True': 'y 你很有钱啊！',
        'False': 'y 你需要赚更多钱'
    }
}
```

或者简写形式：
```javascript
{'Conditional': 'player.money >= 100', 'True': '...', 'False': '...'}
```

### 4.4 玩家输入

```javascript
{
    'Input': {
        'Text': '你叫什么名字？',
        'Validation': function(input) {
            return input.trim().length > 0;  // 验证：不能为空
        },
        'Save': function(input) {
            this.storage({ player: { name: input } });  // 保存到存储
            return true;
        },
        'Revert': function() {
            this.storage({ player: { name: '' } });  // 回滚时清除
        },
        'Warning': '请输入名字！'
    }
}
```

### 4.5 跳转和标签

```javascript
monogatari.script({
    'Start': [
        'y 你好！',
        'jump chapter1'  // 跳转到 chapter1 标签（必须加 jump 前缀）
    ],
    
    'chapter1': [
        '这是第一章',
        'end'
    ]
});
```

> ⚠️ **注意**：在脚本中使用 `jump` 跳转时，必须在目标标签前加 `jump` 前缀（如 `jump chapter1`）。在 Choice 选项中使用时同样需要加前缀。

### 4.6 自定义函数

```javascript
{
    'Function': {
        'Apply': function() {
            // 执行逻辑
            this.storage({ player: { money: this.storage('player.money') + 100 } });
            console.log('金币+100');
            return true;
        },
        'Reverse': function() {
            // 回滚逻辑（可选）
            this.storage({ player: { money: this.storage('player.money') - 100 } });
            return true;
        }
    }
}
```

---

## 5. 动作指令

### 5.1 场景相关

| 指令 | 说明 | 示例 |
|------|------|------|
| `show scene` | 显示背景 | `show scene morning` |
| `show scene #color` | 显示纯色背景 | `show scene #f7f6f6` |
| `clear` | 清除所有显示 | `clear` |

### 5.2 角色相关

| 指令 | 说明 | 示例 |
|------|------|------|
| `show character` | 显示角色 | `show character yui center` |
| `show character yui happy` | 显示角色+表情 | `show character yui happy center` |
| `hide character` | 隐藏角色 | `hide character yui` |

**位置参数**: `left`, `center`, `right`

### 5.3 动画效果

| 指令 | 说明 | 示例 |
|------|------|------|
| `with fadeIn` | 淡入 | `show scene morning with fadeIn` |
| `with fadeOut` | 淡出 | `hide character yui with fadeOut` |
| `with shake` | 震动 | `show scene with shake` |
| `with zoomIn` | 放大 | `show scene with zoomIn` |
| `with move` | 移动 | `show character yui at center with move 1s` |

### 5.4 音频相关

| 指令 | 说明 | 示例 |
|------|------|------|
| `play music` | 播放背景音乐 | `play music bgm_main` |
| `stop music` | 停止背景音乐 | `stop music` |
| `play sound` | 播放音效 | `play sound click` |
| `play video` | 播放视频 | `play video intro` |

### 5.5 UI 相关

| 指令 | 说明 | 示例 |
|------|------|------|
| `show textbox` | 显示对话框 | `show textbox` |
| `hide textbox` | 隐藏对话框 | `hide textbox` |
| `show notification` | 显示通知 | `show notification Welcome` |
| `show message` | 显示消息弹窗 | `show message Help` |

### 5.6 游戏控制

| 指令 | 说明 | 示例 |
|------|------|------|
| `end` | 结束游戏 | `end` |
| `jump` | 跳转标签 | `jump chapter1` |
| `pause` | 暂停 | `pause 2s` |
| `wait` | 等待 | `wait 1s` |
| `preload` | 预加载资源 | `preload scene morning` |

### 5.7 粒子效果

```javascript
// 定义粒子效果（在 script.js 顶部）
monogatari.action('particles').particles({
    snow: {
        particles: {
            number: { value: 100 },
            shape: { type: 'circle' }
        }
    }
});

// 使用粒子
'show particles snow'

// 隐藏粒子
'hide particles'
```

---

## 6. API 参考

### 6.1 monogatari.characters()

定义角色。

```javascript
monogatari.characters({
    '角色键名': {
        name: '显示名称',           // 必填
        color: '#Hex颜色',          // 对话框名字颜色
        directory: '目录名',        // 角色图片目录
        sprites: {                  // 立绘表情
            normal: 'normal.png',
            happy: 'happy.png'
        },
        expressions: {             // 别名（等同于 sprites）
            表达式名: '图片.png'
        }
    }
});
```

### 6.2 monogatari.assets()

定义资源。

```javascript
// 场景背景
monogatari.assets('scenes', {
    '键名': '文件名.png'
});

// 背景音乐
monogatari.assets('music', {
    '键名': '文件名.mp3'
});

// 音效
monogatari.assets('sounds', {
    '键名': '文件名.mp3'
});

// 语音
monogatari.assets('voices', {
    '键名': '文件名.mp3'
});

// 视频
monogatari.assets('videos', {
    '键名': '文件名.mp4'
});

// 图片
monogatari.assets('images', {
    '键名': '文件名.png'
});

// CG 相册
monogatari.assets('gallery', {
    '键名': '文件名.png'
});
```

### 6.3 monogatari.action()

#### 消息通知

```javascript
monogatari.action('notification').notifications({
    '键名': {
        title: '通知标题',
        body: '通知内容',
        icon: '图标.png'  // 可选
    }
});
```

```javascript
// 使用
'show notification 键名'
```

#### 消息弹窗

```javascript
monogatari.action('message').messages({
    '键名': {
        title: '弹窗标题',
        subtitle: '副标题',  // 可选
        body: '弹窗内容，可以是 HTML'
    }
});
```

```javascript
// 使用
'show message 键名'
```

### 6.4 monogatari.script()

定义游戏脚本。

```javascript
monogatari.script({
    '标签名': [
        // 语句列表
    ],
    
    // 多语言支持
    '语言代码': {
        '标签名': [
            // 对应语言的语句
        ]
    }
});
```

### 6.5 monogatari.configuration()

游戏 credits。

```javascript
monogatari.configuration('credits', {
    'Developer': '你的名字',
    'Artist': '艺术家名字',
    'Music': '音乐作者'
});
```

### 6.6 Storage（存储）

在游戏脚本中使用存储：

```javascript
// 读取
var value = this.storage('key.subkey');
var money = this.storage('player.money');

// 写入
this.storage({ player: { money: 100 } });

// 存储对象
var Storage = monogatari.Storage;

// 读取
Storage.get('key');

// 写入
Storage.set('key', value);
```

---

## 7. 完整示例

这是一个完整的游戏脚本示例：

```javascript
/* global monogatari */

// 1. 定义消息通知
monogatari.action('message').messages({
    'Help': {
        title: '帮助',
        body: '<p>按空格键或点击继续对话</p><p>按存档键保存游戏</p>'
    }
});

monogatari.action('notification').notifications({
    'Welcome': {
        title: '欢迎',
        body: '欢迎来到我的视觉小说！'
    }
});

// 2. 定义资源
monogatari.assets('scenes', {
    bedroom: 'bedroom.png',
    school: 'school.png',
    park: 'park.png'
});

monogatari.assets('music', {
    bgm_main: 'main_theme.mp3',
    bgm_school: 'school_theme.mp3'
});

monogatari.assets('sounds', {
    click: 'click.mp3'
});

// 3. 定义角色
monogatari.characters({
    'yui': {
        name: 'Yui',
        color: '#5bcaff',
        directory: 'yui',
        sprites: {
            happy: 'happy.png',
            sad: 'sad.png',
            angry: 'angry.png'
        }
    },
    'tom': {
        name: 'Tom',
        color: '#ff6b6b'
    }
});

// 4. 定义脚本
monogatari.script({
    'Start': [
        // 初始化
        'show scene #f7f6f6',
        'show notification Welcome',
        
        // 玩家输入名字
        {'Input': {
            'Text': '你叫什么名字？',
            'Validation': function(input) {
                return input.trim().length > 0;
            },
            'Save': function(input) {
                this.storage({ player: { name: input } });
                return true;
            },
            'Warning': '请输入你的名字！'
        }},
        
        // 对话
        'y 嗨，{{player.name}}！欢迎来到这个故事！',
        
        // 播放音乐
        'play music bgm_main',
        
        // 场景切换
        'show scene bedroom',
        'y 看，这是我的卧室。',
        
        // 显示角色
        'show character yui happy center with fadeIn',
        'y 我今天心情真好！',
        
        // 分支选择
        {'Choice': {
            'Dialog': 'y 你想做什么？',
            '去学校': {
                'Text': '去学校',
                'Do': 'jump school'
            },
            '去公园': {
                'Text': '去公园',
                'Do': 'jump park'
            },
            '问她心情': {
                'Text': '为什么心情好？',
                'Do': 'jump ask_happy'
            }
        }}
    ],
    
    'school': [
        'show scene school',
        'y 我们到了学校！',
        'y 今天有重要的考试...',
        'jump ending'
    ],
    
    'park': [
        'show scene park',
        'y 公园的花开了，真美！',
        'y 我们坐下来聊聊天吧。',
        'jump ending'
    ],
    
    'ask_happy': [
        'show character yui happy',
        'y 因为你来了呀！{{player.name}}',
        'y 开玩笑的～但是见到你真的很开心！',
        {'Function': {
            'Apply': function() {
                this.storage({ player: { happiness: 100 } });
                return true;
            }
        }},
        'jump ending'
    ],
    
    'ending': [
        {'Function': {
            'Apply': function() {
                monogatari.stopMusic();
                return true;
            }
        }},
        'y 谢谢你的陪伴！',
        'y 希望下次还能见面！',
        'show notification Welcome',
        'end'
    ]
});
```

---

## 8. 常见问题

### Q1: Choice 选择后无法跳转怎么办？

这是最常见的错误！请检查以下几点：

1. **选项键名必须使用英文**：
```javascript
// ❌ 错误 - 使用中文键名
{'Choice': {
    '去图书馆': { 'Text': '去图书馆', 'Do': 'jump library' }
}}

// ✅ 正确 - 使用英文键名
{'Choice': {
    'library': { 'Text': '去图书馆', 'Do': 'jump library' }
}}
```

2. **跳转必须加 `jump` 前缀**：
```javascript
// ❌ 错误 - 没有 jump 前缀
{'Choice': {
    'library': { 'Text': '去图书馆', 'Do': 'library' }
}}

// ✅ 正确 - 有 jump 前缀
{'Choice': {
    'library': { 'Text': '去图书馆', 'Do': 'jump library' }
}}
```

### Q3: 图片不显示怎么办？

1. 检查 `assets/` 目录下是否有对应的图片文件
2. 检查 `script.js` 中的资源路径是否正确
3. 浏览器按 F12 打开开发者工具，查看 Network 面板的错误信息
4. 如果使用远程 CDN，确保 CORS 配置正确

### Q3: 如何实现多语言？

1. 在 `js/options.js` 中启用多语言：
```javascript
'MultiLanguage': true,
'LanguageSelectionScreen': true,
```

2. 在 `script.js` 中定义多语言脚本：
```javascript
monogatari.script({
    'English': { 'Start': ['Hello!', 'end'] },
    '简体中文': { 'Start': ['你好！', 'end'] }
});
```

### Q4: 如何自定义 UI 样式？

编辑 `style/main.css` 文件覆盖默认样式。

### Q5: 如何发布游戏？

1. 打包 `dist/` 或项目根目录
2. 部署到任意静态托管服务（GitHub Pages、Netlify、Vercol 等）
3. 或使用 Cordova 打包成移动端 App

### Q6: 如何使用粒子效果？

参考官方 Demo 中的 `universe` 粒子配置，在 `monogatari.action('particles').particles({})` 中定义。

---

## 附录：动作完整列表

| 动作 ID | 说明 |
|---------|------|
| Choice | 选择分支 |
| Clear | 清除显示 |
| Conditional | 条件判断 |
| Dialog | 对话显示 |
| End | 结束游戏 |
| Function | 自定义函数 |
| Gallery | CG 相册 |
| Hide::Canvas | 隐藏画布 |
| Hide::Character | 隐藏角色 |
| Hide::CharacterLayer | 隐藏角色图层 |
| Hide::Image | 隐藏图片 |
| Hide::Particles | 隐藏粒子 |
| Hide::TextBox | 隐藏对话框 |
| Hide::Video | 隐藏视频 |
| Input | 玩家输入 |
| Jump | 跳转标签 |
| Message | 消息弹窗 |
| Next | 下一句 |
| Notify | 通知提示 |
| Particles | 粒子效果 |
| Pause | 暂停 |
| Play | 播放媒体 |
| Preload | 预加载 |
| Scene | 场景（背景） |
| Show::Background | 显示背景 |
| Show::Character | 显示角色 |
| Show::CharacterLayer | 显示角色图层 |
| Show::Image | 显示图片 |
| Show::TextBox | 显示对话框 |
| Stop | 停止媒体 |
| Unload | 卸载资源 |
| Video | 视频 |
| Wait | 等待 |

---

*文档生成时间: 2026-04-23*
*引擎版本: Monogatari 2.8.0*
