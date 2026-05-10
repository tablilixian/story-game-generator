#!/usr/bin/env node

/**
 * 智谱AI GLM-4 Flash API密钥详细测试脚本
 * 测试API密钥: 73f191ee02eb4060a588208a02dae319.6clDepy7o222YQy0
 */

const API_KEY = '73f191ee02eb4060a588208a02dae319.6clDepy7o222YQy0';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

async function testBasicFunctionality() {
    console.log('🧪 测试1: 基础功能测试\n');
    
    const testCases = [
        {
            name: '简单问答',
            prompt: '请用一句话介绍你自己',
            expected: '自我介绍'
        },
        {
            name: '中文理解',
            prompt: '中国的首都是哪里？',
            expected: '北京'
        },
        {
            name: '英文理解',
            prompt: 'What is the capital of France?',
            expected: 'Paris'
        },
        {
            name: '逻辑推理',
            prompt: '如果今天是星期一，那么三天后是星期几？',
            expected: '星期四'
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'glm-4-flash',
                    messages: [{ role: 'user', content: testCase.prompt }],
                    max_tokens: 50,
                    temperature: 0.1
                })
            });

            if (response.ok) {
                const data = await response.json();
                const answer = data.choices[0].message.content;
                
                console.log(`✅ ${testCase.name}: 成功`);
                console.log(`   问题: ${testCase.prompt}`);
                console.log(`   回答: ${answer}`);
                console.log(`   Token使用: ${data.usage?.total_tokens || '未知'}\n`);
                passed++;
            } else {
                console.log(`❌ ${testCase.name}: 失败 - ${response.status}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${testCase.name}: 错误 - ${error.message}`);
            failed++;
        }
    }

    return { passed, failed };
}

async function testLongContext() {
    console.log('🧪 测试2: 长上下文测试\n');
    
    // 创建一个较长的上下文
    const longPrompt = `请根据以下故事内容回答问题：

从前有一个小村庄，村里住着一位聪明的老人。老人每天都会在村口的大树下给孩子们讲故事。

有一天，老人讲了一个关于勇敢的小兔子的故事：小兔子为了拯救被狼抓走的朋友，独自前往危险的森林。

在森林里，小兔子遇到了各种困难，但它凭借智慧和勇气最终成功救出了朋友。

问题：小兔子为什么要去森林？`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'glm-4-flash',
                messages: [{ role: 'user', content: longPrompt }],
                max_tokens: 100,
                temperature: 0.1
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ 长上下文测试: 成功');
            console.log(`   问题长度: ${longPrompt.length} 字符`);
            console.log(`   回答: ${data.choices[0].message.content}`);
            console.log(`   Token使用: ${data.usage?.total_tokens || '未知'}\n`);
            return true;
        } else {
            console.log('❌ 长上下文测试: 失败');
            return false;
        }
    } catch (error) {
        console.log('❌ 长上下文测试: 错误');
        return false;
    }
}

async function testConcurrentRequests() {
    console.log('🧪 测试3: 并发请求测试\n');
    
    const requests = [
        '今天天气怎么样？',
        '请写一首关于春天的短诗',
        '解释一下什么是人工智能',
        '推荐一本好书'
    ];

    const promises = requests.map((prompt, index) => 
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'glm-4-flash',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 50,
                temperature: 0.1
            })
        })
    );

    try {
        const results = await Promise.allSettled(promises);
        
        let successCount = 0;
        let errorCount = 0;
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.ok) {
                successCount++;
                console.log(`✅ 请求${index + 1}: 成功`);
            } else {
                errorCount++;
                console.log(`❌ 请求${index + 1}: 失败`);
            }
        });

        console.log(`\n📊 并发测试结果: ${successCount} 成功, ${errorCount} 失败\n`);
        return { successCount, errorCount };
    } catch (error) {
        console.log('❌ 并发测试: 错误');
        return { successCount: 0, errorCount: requests.length };
    }
}

async function main() {
    console.log('='.repeat(70));
    console.log('🧪 智谱AI GLM-4 Flash API密钥详细测试报告');
    console.log('='.repeat(70));
    console.log('🔑 API密钥:', API_KEY.substring(0, 15) + '...');
    console.log('🌐 测试时间:', new Date().toLocaleString());
    console.log('='.repeat(70) + '\n');

    // 测试1: 基础功能
    const basicResult = await testBasicFunctionality();
    
    // 测试2: 长上下文
    const longContextResult = await testLongContext();
    
    // 测试3: 并发请求
    const concurrentResult = await testConcurrentRequests();

    // 总结报告
    console.log('='.repeat(70));
    console.log('📋 详细测试总结');
    console.log('='.repeat(70));
    
    console.log('📊 基础功能测试:');
    console.log(`   ✅ 通过: ${basicResult.passed} 项`);
    console.log(`   ❌ 失败: ${basicResult.failed} 项`);
    
    console.log('\n📊 长上下文测试:');
    console.log(`   ${longContextResult ? '✅ 通过' : '❌ 失败'}`);
    
    console.log('\n📊 并发请求测试:');
    console.log(`   ✅ 成功: ${concurrentResult.successCount} 个请求`);
    console.log(`   ❌ 失败: ${concurrentResult.errorCount} 个请求`);
    
    const totalTests = basicResult.passed + basicResult.failed + 1 + 1;
    const passedTests = basicResult.passed + (longContextResult ? 1 : 0) + (concurrentResult.successCount > 0 ? 1 : 0);
    
    console.log('\n🎯 总体评估:');
    console.log(`   测试覆盖率: ${totalTests} 个测试项`);
    console.log(`   通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 优秀！API密钥功能完整，性能稳定！');
        console.log('💡 建议: 可以在WL-AI-Director中放心使用');
    } else if (passedTests >= totalTests * 0.7) {
        console.log('\n👍 良好！API密钥基本功能正常！');
        console.log('💡 建议: 可以正常使用，注意观察异常情况');
    } else {
        console.log('\n⚠️ 一般！API密钥存在部分问题！');
        console.log('💡 建议: 检查网络连接和API配额');
    }
    
    console.log('='.repeat(70));
}

// 执行测试
main().catch(console.error);