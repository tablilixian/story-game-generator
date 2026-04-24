# 场景提取提示词

## 任务描述

从小说文本中提取所有场景信息。

## 输入

- 小说文本内容
- 已提取的角色列表（用于关联场景中的角色）

## 输出要求

输出 JSON 格式的场景列表：

```json
{
  "scenes": [
    {
      "id": "scene_001",
      "key": "school_gate",
      "name": "学校门口",
      "description": "清晨的学校大门，学生们陆续进入",
      "timeOfDay": "morning",
      "weather": "sunny",
      "atmosphere": "青春活力",
      "location": "室外 - 学校",
      "characters": ["char_001", "char_002"]
    }
  ]
}
```

## 规则

1. **key 命名规则**
   - 使用英文拼音缩写
   - 格式：地点类型_具体位置（如 school_gate, classroom_1, home_bedroom）

2. **timeOfDay 选项**
   - morning（早上）
   - afternoon（下午）
   - evening（傍晚）
   - night（夜晚）
   - dusk（黄昏）
   - dawn（黎明）

3. **weather 选项**
   - sunny（晴天）
   - cloudy（多云）
   - rainy（雨天）
   - snowy（雪天）
   - foggy（雾天）
   - stormy（暴风雨）

4. **location 格式**
   - 室内/室外 - 具体地点
   - 如：室内 - 教室、室外 - 操场

## 注意事项

- 场景是故事发生的地点，不是每个情节
- 相同地点但不同时间算作不同场景
- 记录每个场景出场的角色
