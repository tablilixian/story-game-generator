# Monogatari 脚本转换提示词

## 任务描述

将视觉小说剧本转换为 Monogatari 引擎可用的 script.js 代码。

## 输入

- 角色定义
- 场景定义
- 剧本事件列表

## 输出要求

输出完整的 JavaScript 代码：

```javascript
/* global monogatari */

// ============== 1. 消息通知 ==============
monogatari.action ('message').messages ({
    'End': { title: '结局', body: '<p>感谢体验！</p>' }
});

// ============== 2. 角色定义 ==============
monogatari.characters ({
    'xm': {
        name: '小明',
        color: '#3498db'
    },
    'xh': {
        name: '小红',
        color: '#e74c3c'
    }
});

// ============== 3. 资源定义 ==============
monogatari.assets ('scenes', {
    'school_gate': '#87CEEB',
    'classroom': '#F5F5DC'
});

monogatari.assets ('music', {
    'bgm_main': 'main_theme.mp3'
});

// ============== 4. 脚本内容 ==============
monogatari.script ({
    'Start': [
        'show scene school_gate',
        'centered 清晨的阳光洒在学校门口...',
        'xm 今天开学第一天！',
        {'Choice': {
            'Dialog': 'xm 你打算怎么做？',
            'go_classroom': {
                'Text': '直接去教室',
                'Do': 'jump classroom_scene'
            },
            'go_playground': {
                'Text': '先去操场看看',
                'Do': 'jump playground_scene'
            }
        }}
    ],

    'classroom_scene': [
        'show scene classroom',
        'centered 你走进教室...',
        'xh 你来了！',
        'jump ending_normal'
    ],

    'playground_scene': [
        'show scene playground',
        'centered 操场上...',
        'jump ending_normal'
    ],

    'ending_normal': [
        'centered 【结局一】美好的校园生活开始了...',
        'show message End',
        'end'
    ]
});
```

## 必须遵守的规则

### 1. 角色定义
- 键名必须使用英文（如 'xm', 'xh', 'alice'）
- name 显示中文名
- color 使用十六进制颜色

### 2. 对话格式
- 旁白：'centered 文字内容'
- 对话：'角色键名 台词内容'
- 内心独白：'narrator 文字内容'

### 3. Choice 格式
- **选项键名必须使用英文**（如 'option1', 'library'）
- **禁止使用中文键名**（如 '去图书馆' ❌）
- Do 跳转必须加 'jump' 前缀（如 'Do': 'jump library'）

### 4. 跳转规则
- 第一个标签必须叫 'Start'
- 每个分支创建独立标签
- 每个结局创建独立标签
- 最后必须以 'end' 结束

### 5. 资源占位
- 场景用纯色占位（如 '#87CEEB'）
- 音乐用占位键名（如 'main_theme.mp3'）
- 在注释中说明需要替换的资源

## 常见错误避免

| 错误 | 错误写法 | 正确写法 |
|------|---------|---------|
| Choice 用中文键名 | '去图书馆': {...} | 'library': {...} |
| 跳转没有前缀 | 'Do': 'library' | 'Do': 'jump library' |
| 跳转到不存在的标签 | 'jump not_exist' | 'jump scene_xxx' |
| 括号不匹配 | ['dialog',] | ['dialog'] |
