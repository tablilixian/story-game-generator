# 视觉小说剧本生成提示词

## 任务描述

将小说章节转换为视觉小说格式的剧本。

## 输入

- 章节内容
- 角色列表（key 和 name 的映射）
- 场景列表

## 输出要求

输出 JSON 格式的剧本事件列表：

```json
{
  "script": [
    {
      "type": "scene",
      "sceneKey": "school_gate"
    },
    {
      "type": "narration",
      "content": "清晨的阳光洒在学校门口..."
    },
    {
      "type": "dialogue",
      "characterKey": "xm",
      "content": "今天开学第一天..."
    },
    {
      "type": "choice",
      "question": "你打算怎么做？",
      "options": [
        {
          "key": "option1",
          "text": "直接去教室",
          "next": "scene_2"
        },
        {
          "key": "option2",
          "text": "先去操场看看",
          "next": "scene_3"
        }
      ]
    }
  ]
}
```

## 事件类型

1. **scene** - 场景切换
2. **narration** - 旁白/叙述
3. **dialogue** - 角色对话
4. **monologue** - 内心独白
5. **action** - 动作描述
6. **choice** - 分支选择
7. **end** - 结局

## 转换规则

1. **原文旁白** → narration
2. **直接引语对话** → dialogue（角色名为说话者）
3. **括号内心理活动** → monologue
4. **描述性动作** → action
5. **人物做决定的地方** → choice

## 注意事项

- 保持对话流畅自然
- 选择点要合理（不是每处都是选择）
- 每个分支要有不同的发展
- 区分主角主动选择和被动触发
