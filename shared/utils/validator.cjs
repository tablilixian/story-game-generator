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
        
        this.labels = this.extractLabels();
        this.jumpTargets = this.extractJumpTargets();
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
        
        const jumpRegex = /'jump\s+(\w+)'/g;
        let match;
        while ((match = jumpRegex.exec(this.content)) !== null) {
            targets.push(match[1]);
        }
        
        const doJumpRegex = /'Do':\s*'jump\s+(\w+)'/g;
        while ((match = doJumpRegex.exec(this.content)) !== null) {
            targets.push(match[1]);
        }
        
        return [...new Set(targets)];
    }
    
    extractChoiceKeys() {
        const keys = [];
        
        const choiceRegex = /'Choice':\s*\{[\s\S]*?\}/g;
        const choiceBlocks = this.content.match(choiceRegex) || [];
        
        choiceBlocks.forEach(block => {
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
        const doRegex = /'Do':\s*'([^']+)'/g;
        let match;
        
        while ((match = doRegex.exec(this.content)) !== null) {
            const value = match[1];
            if (!value.startsWith('jump ') && !value.startsWith('jump')) {
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
        usedLabels.add('Start');
        
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
        
        let inString = false;
        let stringChar = '';
        
        for (let i = 0; i < this.content.length; i++) {
            const char = this.content[i];
            const prevChar = i > 0 ? this.content[i - 1] : '';
            
            if ((char === '"' || char === "'") && prevChar !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                }
                continue;
            }
            
            if (inString) continue;
            
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
        
        stack.forEach(item => {
            this.errors.push({
                type: 'UNCLOSED_BRACKET',
                message: `未闭合的括号: '${item.char}' at ${item.index}`,
                fix: `添加对应的闭括号 '${pairs[item.char]}'`
            });
        });
    }
    
    checkRequiredComponents() {
        if (!this.labels.includes('Start')) {
            this.errors.push({
                type: 'MISSING_START_LABEL',
                message: '缺少 Start 标签',
                fix: "添加 'Start': [...] 作为游戏入口"
            });
        }
        
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
        const map = {
            '去图书馆': 'library',
            '去食堂': 'canteen',
            '回家': 'home',
            '商店': 'shop',
            '是': 'yes',
            '否': 'no',
            '好': 'ok',
            '继续': 'continue',
            '开始': 'start',
            '是的': 'yes',
            '我正准备走': 'leave',
            '一起去图书馆学习': 'library',
            '你去食堂，我去图书馆': 'separate'
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScriptValidator;
}

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
