# Monogatari AI 剧情创作工作流

> 本文档用于指导 AI 将小说/故事文本转换为 Monogatari 游戏脚本

---

## 目录

1. [AI 工作流脑图](#1-ai-工作流脑图)
2. [AI 提示词模板](#2-ai-提示词模板)
3. [自动化验证脚本](#3-自动化验证脚本)
4. [完整示例](#4-完整示例)

---

## 1. AI 工作流脑图

```
                    ┌─────────────────────┐
                    │   📥 输入故事文本     │
                    │  (小说/剧本/大纲)     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  🔍 第一步：内容分析  │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
    │  识别角色      │  │  识别场景      │  │  识别时间      │
    ├───────────────┤  ├───────────────┤  ├───────────────┤
    │ • 主角是谁？   │  │ • 发生在哪？   │  │ • 什么时间？   │
    │ • 配角是谁？   │  │ • 场景名称？   │  │ • 季节？       │
    │ • 角色关系？   │  │ • 场景类型？   │  │ • 天气？       │
    └───────────────┘  └───────────────┘  └───────────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  🔍 第二步：对话提取  │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
    │  旁白描述      │  │  角色对话      │  │  情绪表情      │
    ├───────────────┤  ├───────────────┤  ├───────────────┤
    │ → centered   │  │ → '角色 台词'  │  │ → sprites    │
    │               │  │               │  │   定义        │
    └───────────────┘  └───────────────┘  └───────────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  🔀 第三步：分支识别  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  寻找选择点          │
                    │                     │
                    │  • 人物做决定的地方   │
                    │  • 可能的不同走向    │
                    │  • 每个分支的结局    │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
    │  Branch A    │  │  Branch B     │  │  Ending 1/2  │
    │  分支A剧情    │  │  分支B剧情    │  │  结局1/2      │
    └───────────────┘  └───────────────┘  └───────────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  🎮 第四步：脚本转换  │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
    │  定义角色      │  │  定义资源      │  │  编写脚本     │
    │  characters  │  │  assets       │  │  script      │
    │ 键名: 英文    │  │ 场景: 占位色   │  │ 标签+对话     │
    │ name: 中文    │  │ 音乐: 占位键   │  │ 分支+跳转     │
    │ color: 颜色   │  │               │  │               │
    └───────────────┘  └───────────────┘  └───────────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  ✅ 第五步：错误检查  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  运行验证脚本        │
                    │                     │
                    │ ✓ Choice键名英文    │
                    │ ✓ jump前缀存在       │
                    │ ✓ 标签跳转有效       │
                    │ ✓ 括号匹配           │
                    │ ✓ 语法正确           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   📤 输出完整代码    │
                    │  script.js          │
                    └─────────────────────┘
```

---

## 2. AI 提示词模板

### 2.1 完整提示词

```markdown
你是一个 Monogatari 视觉小说引擎的脚本专家。

请根据下面的故事文本，生成完整的游戏脚本代码。

## 📝 故事文本
[在这里粘贴你的小说/故事内容]

## 📋 必须遵守的规则

### 角色定义规则
1. 角色键名必须使用英文简称（如：'xm', 'xh', 'alice'）
2. name 显示中文名（如：'小明', '小红', 'Alice'）
3. color 使用十六进制颜色（如：'#3498db', '#e74c3c'）

### 对话转换规则
1. 旁白描述 → 'centered 文字内容'
2. 角色对话 → '角色键名 台词内容'
3. 内心独白 → 'narrator 文字内容'

### 分支选择规则（非常重要！）
1. Choice 的选项键名必须使用英文（如：'option1', 'library'）
2. 不能使用中文键名（如：'去图书馆' ❌）
3. Do 跳转必须加 'jump' 前缀（如：'Do': 'jump library'）
4. 每个分支必须有对应的标签

### 资源处理规则
1. 场景使用占位纯色（如：'library': '#f5f5dc'）
2. 音乐使用占位键名（如：'bgm_1': 'placeholder.mp3'）
3. 在注释中说明需要替换的资源

### 脚本结构规则
1. 第一个标签必须叫 'Start'
2. 每个分支创建独立标签
3. 每个结局创建独立标签
4. 最后必须以 'end' 结束

## 📖 代码模板

```javascript
/* global monogatari */

// ============== 1. 消息通知（可选）==============
monogatari.action ('message').messages ({
    'About': { title: '关于', body: '<p>内容</p>' }
});

monogatari.action ('notification').notifications ({
    'Welcome': { title: '欢迎', body: '欢迎体验！' }
});

// ============== 2. 角色定义 ==============
monogatari.characters ({
    '角色键名': {
        name: '显示的中文名',
        color: '#十六进制颜色',
        // directory: '目录名',  // 如果有立绘图片
        // sprites: {           // 如果有表情
        //     normal: 'normal.png',
        //     happy: 'happy.png'
        // }
    }
});

// ============== 3. 资源定义（占位）=============
monogatari.assets ('scenes', {
    // 场景: '占位纯色或图片'
    '场景键名': '#颜色码',
    // 示例：'library': '#f5f5dc', 'school': '#e3f2fd'
});

monogatari.assets ('music', {
    // 音乐键名: '文件名.mp3'
    // 示例：'bgm_main': 'main_theme.mp3'
});

// ============== 4. 脚本内容 ==============
monogatari.script ({
    // ========== 开场 ==========
    'Start': [
        // 初始化
        'show scene 场景键名',
        'show notification Welcome',
        
        // 对话流程
        'centered 旁白内容...',
        '角色键名 角色的台词...',
        
        // 分支选择
        {'Choice': {
            'Dialog': '角色键名 你想做什么？',
            'option1': {
                'Text': '选项1显示的文字',
                'Do': 'jump branch_a'
            },
            'option2': {
                'Text': '选项2显示的文字',
                'Do': 'jump branch_b'
            }
        }}
    ],

    // ========== 分支A ==========
    'branch_a': [
        'centered 分支A的旁白...',
        '角色键名 分支A的对话...',
        // ... 更多对话 ...
        'jump ending_a'  // 跳转到结局
    ],

    // ========== 分支B ==========
    'branch_b': [
        'centered 分支B的旁白...',
        '角色键名 分支B的对话...',
        // ... 更多对话 ...
        'jump ending_b'  // 跳转到结局
    ],

    // ========== 结局A ==========
    'ending_a': [
        'centered 结局A的旁白...',
        'show message EndA',  // 显示结束弹窗
        'end'
    ],

    // ========== 结局B ==========
    'ending_b': [
        'centered 结局B的旁白...',
        'show message EndB',  // 显示结束弹窗
        'end'
    ]
});
```

## ⚠️ 常见错误（必须避免）

### 错误1：Choice 使用中文键名
```javascript
// ❌ 错误
{'Choice': {
    '去图书馆': { 'Text': '去图书馆', 'Do': 'jump library' }
}}

// ✅ 正确
{'Choice': {
    'library': { 'Text': '去图书馆', 'Do': 'jump library' }
}}
```

### 错误2：跳转没有 jump 前缀
```javascript
// ❌ 错误
{'Choice': {
    'library': { 'Text': '去图书馆', 'Do': 'library' }
}}

// ✅ 正确
{'Choice': {
    'library': { 'Text': '去图书馆', 'Do': 'jump library' }
}}
```

### 错误3：跳转到不存在的标签
```javascript
// ❌ 错误 - 'library' 标签不存在
'Do': 'jump library'

// ✅ 正确 - 标签已定义
'Do': 'jump branch_a'  // 'branch_a' 标签存在于 script 中
```

### 错误4：括号不匹配
```javascript
// ❌ 错误 - 缺少右括号
'Start': [
    'dialog',
    'dialog'   // ❌ 缺少 ]
]

// ✅ 正确
'Start': [
    'dialog',
    'dialog'
]
```

## 📝 输出要求

请生成完整的、可直接运行的 script.js 代码：
1. 包含完整的角色定义
2. 包含完整的资源定义（使用占位符）
3. 包含完整的脚本内容
4. 确保所有跳转都指向存在的标签
5. 确保 Choice 键名都是英文
6. 确保所有跳转都有 'jump' 前缀
```

### 2.2 简化版提示词（用于快速生成）

```markdown
根据以下故事，生成 Monogatari 游戏脚本：

故事：[粘贴故事内容]

要求：
- 角色键名用英文（如 xm, xh）
- Choice 选项键名用英文
- 跳转加 'jump' 前缀
- 场景用纯色占位（如 #f5f5dc）
- 第一个标签叫 'Start'
- 以 'end' 结束

直接输出代码，不需要解释。
```

---

## 3. 自动化验证脚本

这个脚本用于检查生成的 script.js 是否有常见错误。

### 3.1 验证脚本代码

```javascript
/**
 * Monogatari 脚本验证工具
 * 用于检查 script.js 中的常见错误
 * 
 * 使用方法：
 *   node validator.js [script.js路径]
 * 
 * 或在浏览器控制台中运行
 */

const fs = require('fs');
const path = require('path');

class ScriptValidator {
    constructor(scriptContent) {
        this.content = scriptContent;
        this.errors = [];
        this.warnings = [];
        
        // 提取所有定义的标签
        this.labels = this.extractLabels();
        
        // 提取所有跳转引用的标签
        this.jumpTargets = this.extractJumpTargets();
        
        // 提取所有 Choice 键名
        this.choiceKeys = this.extractChoiceKeys();
    }
    
    extractLabels() {
        const labels = [];
        const regex = /'([^']+)':\s*\[/g;
        let match;
        while ((match = regex.exec(this.content)) !== null) {
            labels.push(match[1]);
        }
        return labels;
    }
    
    extractJumpTargets() {
        const targets = [];
        
        // 匹配 'jump xxx' 格式
        const jumpRegex = /'jump\s+(\w+)'/g;
        let match;
        while ((match = jumpRegex.exec(this.content)) !== null) {
            targets.push(match[1]);
        }
        
        // 匹配 'Do': 'jump xxx' 格式
        const doJumpRegex = /'Do':\s*'jump\s+(\w+)'/g;
        while ((match = doJumpRegex.exec(this.content)) !== null) {
            targets.push(match[1]);
        }
        
        return [...new Set(targets)]; // 去重
    }
    
    extractChoiceKeys() {
        const keys = [];
        
        // 匹配 Choice 块中的键名
        // {'Choice': {'key': {...}}}
        const choiceRegex = /'Choice':\s*\{[\s\S]*?\}/g;
        const choiceBlocks = this.content.match(choiceRegex) || [];
        
        choiceBlocks.forEach(block => {
            // 提取键名（在 'Choice': { 之后的键）
            const keyRegex = /'([^']+)':\s*\{/g;
            let keyMatch;
            while ((keyMatch = keyRegex.exec(block)) !== null) {
                keys.push(keyMatch[1]);
            }
        });
        
        return keys;
    }
    
    checkChineseChoiceKeys() {
        const chineseRegex = /[\u4e00-\u9fa5]/;
        
        this.choiceKeys.forEach(key => {
            if (chineseRegex.test(key)) {
                this.errors.push({
                    type: 'CHOICE_KEY_CHINESE',
                    message: `Choice 选项使用了中文键名: '${key}'`,
                    fix: `将键名改为英文，如: '${this.toEnglish(key)}'`
                });
            }
        });
    }
    
    checkMissingJumpPrefix() {
        // 查找 Do: 后面没有 jump 的情况
        const doRegex = /'Do':\s*'([^']+)'/g;
        let match;
        
        while ((match = doRegex.exec(this.content)) !== null) {
            const value = match[1];
            // 排除已经是 jump 开头的
            if (!value.startsWith('jump ') && !value.startsWith('jump')) {
                // 但如果是 'end' 则跳过
                if (value !== 'end') {
                    this.errors.push({
                        type: 'MISSING_JUMP_PREFIX',
                        message: `跳转缺少 'jump' 前缀: 'Do': '${value}'`,
                        fix: `改为: 'Do': 'jump ${value}'`
                    });
                }
            }
        }
    }
    
    checkUndefinedLabels() {
        this.jumpTargets.forEach(target => {
            if (!this.labels.includes(target) && target !== 'end') {
                this.errors.push({
                    type: 'UNDEFINED_LABEL',
                    message: `跳转到未定义的标签: '${target}'`,
                    fix: `在 monogatari.script 中添加 '${target}': [...] 标签`
                });
            }
        });
    }
    
    checkUnusedLabels() {
        const usedLabels = new Set(this.jumpTargets);
        usedLabels.add('Start'); // Start 通常是入口，不警告
        
        this.labels.forEach(label => {
            if (!usedLabels.has(label)) {
                this.warnings.push({
                    type: 'UNUSED_LABEL',
                    message: `定义了但未使用的标签: '${label}'`,
                    fix: `检查是否需要跳转到此标签，或删除未使用的定义`
                });
            }
        });
    }
    
    checkBracketMatching() {
        const stack = [];
        const pairs = { '{': '}', '[': ']', '(': ')' };
        const openBrackets = Object.keys(pairs);
        
        for (let i = 0; i < this.content.length; i++) {
            const char = this.content[i];
            
            if (openBrackets.includes(char)) {
                stack.push({ char, index: i });
            } else if (Object.values(pairs).includes(char)) {
                if (stack.length === 0) {
                    this.errors.push({
                        type: 'UNMATCHED_BRACKET',
                        message: `多余的闭括号 at position ${i}: '${char}'`,
                        fix: '检查括号是否匹配'
                    });
                } else {
                    const last = stack.pop();
                    if (pairs[last.char] !== char) {
                        this.errors.push({
                            type: 'MISMATCHED_BRACKET',
                            message: `括号不匹配: '${last.char}' at ${last.index} 需要 '${pairs[last.char]}' 但找到了 '${char}' at ${i}`,
                            fix: '确保开括号和闭括号类型一致'
                        });
                    }
                }
            }
        }
        
        // 检查未闭合的括号
        stack.forEach(item => {
            this.errors.push({
                type: 'UNCLOSED_BRACKET',
                message: `未闭合的括号: '${item.char}' at ${item.index}`,
                fix: `添加对应的闭括号 '${pairs[item.char]}'`
            });
        });
    }
    
    checkSyntaxErrors() {
        // 检查常见语法错误
        
        // 1. 缺少逗号
        const missingCommaRegex = /'[^']+'\s*\n\s*'/g;
        let match;
        while ((match = missingCommaRegex.exec(this.content)) !== null) {
            // 这可能是正常的数组元素，不一定是错误
            // 需要更复杂的逻辑来准确判断
        }
        
        // 2. 检查 function 后面是否有正确的括号
        const functionWithoutParens = /function\s+\{/g;
        while ((match = functionWithoutParens.exec(this.content)) !== null) {
            this.warnings.push({
                type: 'SYNTAX_CHECK',
                message: `检查 function 语法 at position ${match.index}`,
                fix: '确保 function 定义正确'
            });
        }
    }
    
    checkRequiredComponents() {
        // 检查是否定义了 Start 标签
        if (!this.labels.includes('Start')) {
            this.errors.push({
                type: 'MISSING_START_LABEL',
                message: '缺少 Start 标签',
                fix: "添加 'Start': [...] 作为游戏入口"
            });
        }
        
        // 检查是否以 end 结束
        const hasEnd = /'end'/.test(this.content);
        if (!hasEnd) {
            this.warnings.push({
                type: 'MISSING_END',
                message: '脚本没有以 end 结束',
                fix: "确保游戏以 'end' 结束"
            });
        }
    }
    
    toEnglish(chinese) {
        // 简单的中英文映射（可以扩展）
        const map = {
            '去图书馆': 'library',
            '去食堂': 'canteen',
            '回家': 'home',
            '商店': 'shop',
            '是': 'yes',
            '否': 'no',
            '好': 'ok',
            '继续': 'continue',
            '开始': 'start'
        };
        return map[chinese] || 'option';
    }
    
    validate() {
        this.checkChineseChoiceKeys();
        this.checkMissingJumpPrefix();
        this.checkUndefinedLabels();
        this.checkUnusedLabels();
        this.checkBracketMatching();
        this.checkRequiredComponents();
        
        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            stats: {
                labelsFound: this.labels.length,
                jumpsFound: this.jumpTargets.length,
                choiceKeysFound: this.choiceKeys.length
            }
        };
    }
    
    printReport() {
        const result = this.validate();
        
        console.log('\n========== Monogatari 脚本验证报告 ==========\n');
        
        console.log(`📊 统计信息:`);
        console.log(`   - 定义的标签: ${result.stats.labelsFound}`);
        console.log(`   - 跳转引用: ${result.stats.jumpsFound}`);
        console.log(`   - Choice 选项: ${result.stats.choiceKeysFound}`);
        
        if (result.errors.length > 0) {
            console.log(`\n❌ 错误 (${result.errors.length} 个):`);
            result.errors.forEach((err, i) => {
                console.log(`\n   ${i + 1}. [${err.type}]`);
                console.log(`      ${err.message}`);
                console.log(`      💡 修复: ${err.fix}`);
            });
        }
        
        if (result.warnings.length > 0) {
            console.log(`\n⚠️  警告 (${result.warnings.length} 个):`);
            result.warnings.forEach((warn, i) => {
                console.log(`\n   ${i + 1}. [${warn.type}]`);
                console.log(`      ${warn.message}`);
                console.log(`      💡 建议: ${warn.fix}`);
            });
        }
        
        if (result.errors.length === 0 && result.warnings.length === 0) {
            console.log('\n✅ 没有发现问题！脚本看起来是正确的。');
        } else if (result.errors.length === 0) {
            console.log('\n✅ 没有严重错误！只有一些警告。');
        } else {
            console.log('\n❌ 请修复以上错误后再运行游戏。');
        }
        
        console.log('\n=================================================\n');
        
        return result;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScriptValidator;
}

// 如果直接在命令行运行
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('使用方法: node validator.js <script.js路径>');
        console.log('示例: node validator.js ./dist/js/script.js');
        process.exit(1);
    }
    
    const filePath = path.resolve(args[0]);
    
    if (!fs.existsSync(filePath)) {
        console.log(`错误: 文件不存在: ${filePath}`);
        process.exit(1);
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const validator = new ScriptValidator(content);
    const result = validator.printReport();
    
    process.exit(result.isValid ? 0 : 1);
}
```

### 3.2 使用方法

```bash
# 1. 保存验证脚本
# 将上面的代码保存为 validator.js

# 2. 运行验证
node validator.js ./dist/js/script.js

# 3. 查看输出
# ========== Monogatari 脚本验证报告 ==========
#
# 📊 统计信息:
#    - 定义的标签: 6
#    - 跳转引用: 5
#    - Choice 选项: 4
#
# ❌ 错误 (1 个):
#
#    1. [CHOICE_KEY_CHINESE]
#       Choice 选项使用了中文键名: '去图书馆'
#       💡 修复: 将键名改为英文，如: 'library'
#
# ❌ 请修复以上错误后再运行游戏。
```

---

## 4. 完整示例

### 4.1 输入故事

```
图书馆门口的故事

下午四点半，阳光正好。今天是星期五，刚放学不久。
小明背着书包，走向学校的图书馆。他是一名高三学生，成绩优异。
就在这时，他看到了小红从图书馆走出来。

小明说："小红！这么巧！"
小红回答："是啊，我来借几本书。"
小明问："你去图书馆做什么？"

选择：
1. 邀请她一起去借书
2. 问她是去吃饭还是学习
```

### 4.2 AI 生成的脚本

```javascript
/* global monogatari */

// 角色定义
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

// 资源定义（占位）
monogatari.assets ('scenes', {
    campus: '#e8f5e9',  // 绿色 - 校园
    library: '#f5f5dc'  // 米色 - 图书馆
});

monogatari.assets ('music', {
    bgm_1: 'placeholder.mp3'  // TODO: 替换为实际音乐
});

// 脚本
monogatari.script ({
    'Start': [
        'show scene campus',
        'centered 下午四点半，阳光正好。',
        'centered 今天是星期五，刚放学不久。',
        'xm 小明背着书包，走向学校的图书馆。',
        'centered 他是一名高三学生，成绩优异。',
        'centered 就在这时，他看到了小红从图书馆走出来。',
        'xm 小红！这么巧！',
        'xh 是啊，我来借几本书。',
        'xm 你去图书馆做什么？',
        {'Choice': {
            'Dialog': 'xm 你想去哪里？',
            'invite': {
                'Text': '邀请她一起去借书',
                'Do': 'jump invite_library'
            },
            'ask': {
                'Text': '问她是去吃饭还是学习',
                'Do': 'jump ask_question'
            }
        }}
    ],

    'invite_library': [
        'show scene library',
        'xm 一起去借书吧！',
        'xh 好啊！',
        'xm 我听说新进了一批书。',
        'xh 真的吗？太好了！',
        'centered 两人一起走进了图书馆。',
        'centered 结局A：一起去图书馆学习',
        'end'
    ],

    'ask_question': [
        'xm 你现在是去吃饭还是学习？',
        'xh 我准备去食堂吃饭。',
        'xm 原来如此！',
        'xh 你呢？',
        'xm 我去图书馆。',
        'centered 结局B：各自分开行动',
        'end'
    ]
});
```

---

## 附录：快速参考卡

### 对话转换速查

| 原文类型 | 转换格式 | 示例 |
|---------|---------|------|
| 旁白 | `'centered 内容'` | `'centered 天下着雨'` |
| 对话 | `'角色键名 台词'` | `'xm 你好！'` |
| 选择 | `{'Choice': {...}}` | 见上文示例 |
| 跳转 | `'jump 标签名'` | `'jump chapter1'` |

### 常见错误速查

| 错误类型 | 错误示例 | 正确写法 |
|---------|---------|---------|
| 中文键名 | `'去图书馆': {...}` | `'library': {...}` |
| 缺少jump | `'Do': 'library'` | `'Do': 'jump library'` |
| 未定义标签 | `jump nowhere` | `jump branch_a` |
| 括号不匹配 | `[...` | `[...` |

---

*文档更新时间: 2026-04-23*
