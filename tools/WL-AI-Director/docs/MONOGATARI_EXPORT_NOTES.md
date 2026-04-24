# Monogatari 游戏导出开发注意事项

## 概述

本文档记录了开发 WL-AI-Director 视觉小说导出功能时遇到的问题和解决方案，供后续开发参考。

## 核心问题

### 1. options.js 格式错误

**问题**: 之前使用了自定义的 `OPTIONS` 和 `SETTINGS` 对象格式，导致与 Monogatari 引擎不兼容。

**解决**: 参考 Demo 正确格式，使用:
- `monogatari.settings({})` - 游戏设置
- `monogatari.preferences({})` - 用户偏好设置

```javascript
'use strict';
/* global Monogatari */

const monogatari = Monogatari.default;

monogatari.settings({
    'Name': '视觉小说',
    'Version': '1.0.0',
    'MultiLanguage': false,
    'LanguageSelectionScreen': false,
    // ... 其他设置
});

monogatari.preferences({
    'Language': '简体中文',
    // ... 其他偏好
});
```

### 2. storage.js 格式错误

**问题**: 之前使用了自定义的 `STORAGE` 对象。

**解决**: 使用 Monogatari 提供的 API:
```javascript
/* global monogatari */

monogatari.storage ({
    player: {
        name: "Player"
    }
});
```

### 3. 语言代码错误

**问题**: 使用了 `'cn'` 作为简体中文代码，但 Monogatari 引擎不识别。

**解决**: 使用正确的 ISO 639-1 代码:
- 简体中文: `'zh-hans'`
- 繁体中文: `'zh-hant'`
- 英语: `'en'`

### 4. MultiLanguage 模式与脚本格式不匹配

**问题**: 当 `MultiLanguage: true` 时，脚本需要使用多语言格式:
```javascript
monogatari.script ({
    '简体中文': {
        'Start': [...]
    },
    'English': {
        'Start': [...]
    }
});
```

当 `MultiLanguage: false` 时，脚本应该使用简单格式:
```javascript
monogatari.script ({
    'Start': [...]
});
```

**解决**: 
- 关闭 `MultiLanguage` 模式使用简单格式
- 或保持开启但确保所有语言的剧本都已配置

### 5. script.js 生成逻辑重复

**问题**: 代码在外层包装了 `'Start'` 标签，导致生成重复:
```javascript
monogatari.script ({
    'Start': [
    'Start': [  // 重复!
        ...
    ]
});
```

**解决**: 直接返回标签内容，不要外层包装。

### 6. 远程文件覆盖问题

**问题**: `generateCompleteGameZip` 从远程服务器加载引擎文件，但没有覆盖 options.js 和 storage.js，导致使用远程默认文件。

**解决**: 在生成 ZIP 时显式添加本地生成的配置:
```typescript
zip.file('js/script.js', scriptContent);
zip.file('js/options.js', generateOptionsJs());
zip.file('js/storage.js', generateStorageJs());
```

## 开发检查清单

在修改 monogatariExport.ts 后，请检查以下几点:

1. **options.js** - 确认使用 `monogatari.settings()` 和 `monogatari.preferences()` 格式
2. **storage.js** - 确认使用 `monogatari.storage()` 格式  
3. **script.js** - 确认脚本格式与 MultiLanguage 设置匹配
4. **语言代码** - 使用正确的 ISO 代码 (zh-hans, zh-hant, en 等)
5. **ZIP 生成** - 确认覆盖了所有需要本地生成的配置文件
6. **本地测试** - 导出后先用本地服务器测试，确认无语法错误

## 相关文件

- `tools/WL-AI-Director/utils/monogatariExport.ts` - 导出核心逻辑
- `tools/WL-AI-Director/types.ts` - 类型定义
- `engine/monogatari/Demo/js/options.js` - 正确格式参考
- `engine/monogatari/Demo/js/storage.js` - 正确格式参考
