#!/usr/bin/env node

/**
 * 智谱AI GLM-4 Flash API密钥测试脚本
 * 测试API密钥: 73f191ee02eb4060a588208a02dae319.6clDepy7o222YQy0
 */

const API_KEY = '73f191ee02eb4060a588208a02dae319.6clDepy7o222YQy0';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

async function testGLM4API() {
    console.log('🔍 开始测试智谱AI GLM-4 Flash API密钥...\n');
    
    const testPayload = {
        model: 'glm-4-flash',
        messages: [
            {
                role: 'user',
                content: '请用一句话介绍你自己'
            }
        ],
        max_tokens: 100,
        temperature: 0.7
    };

    try {
        console.log('📡 发送API请求...');
        console.log('🔑 API密钥:', API_KEY.substring(0, 10) + '...');
        console.log('🌐 API端点:', API_URL);
        console.log('🤖 测试模型: glm-4-flash\n');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(testPayload)
        });

        console.log('📊 响应状态:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API密钥测试成功！\n');
            console.log('📝 模型回复:');
            console.log('   ', data.choices[0].message.content);
            console.log('\n📈 使用统计:');
            console.log('   - 输入token数:', data.usage?.prompt_tokens || '未知');
            console.log('   - 输出token数:', data.usage?.completion_tokens || '未知');
            console.log('   - 总token数:', data.usage?.total_tokens || '未知');
            
            return {
                success: true,
                status: response.status,
                data: data
            };
        } else {
            const errorText = await response.text();
            console.log('❌ API密钥测试失败！\n');
            console.log('📋 错误详情:');
            console.log('   状态码:', response.status);
            console.log('   错误信息:', errorText);
            
            // 常见错误分析
            if (response.status === 401) {
                console.log('💡 可能原因: API密钥无效或已过期');
            } else if (response.status === 403) {
                console.log('💡 可能原因: 权限不足或配额用尽');
            } else if (response.status === 429) {
                console.log('💡 可能原因: 请求频率超限');
            } else if (response.status === 500) {
                console.log('💡 可能原因: 服务器内部错误');
            }
            
            return {
                success: false,
                status: response.status,
                error: errorText
            };
        }
        
    } catch (error) {
        console.log('❌ 网络请求失败！\n');
        console.log('📋 错误详情:');
        console.log('   错误类型:', error.name);
        console.log('   错误信息:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.log('💡 可能原因: 网络连接问题或DNS解析失败');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 可能原因: 服务器拒绝连接');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('💡 可能原因: 请求超时');
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}

// 运行测试
async function main() {
    console.log('='.repeat(60));
    console.log('🧪 智谱AI GLM-4 Flash API密钥测试工具');
    console.log('='.repeat(60));
    
    const result = await testGLM4API();
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 测试总结:');
    console.log('='.repeat(60));
    
    if (result.success) {
        console.log('✅ API密钥状态: 有效');
        console.log('✅ 连接状态: 正常');
        console.log('✅ 模型响应: 正常');
        console.log('\n🎉 恭喜！API密钥可以正常使用！');
    } else {
        console.log('❌ API密钥状态: 无效或存在问题');
        console.log('❌ 连接状态: 失败');
        console.log('\n💡 建议检查:');
        console.log('   1. API密钥是否正确复制');
        console.log('   2. 网络连接是否正常');
        console.log('   3. 账户是否有足够的配额');
        console.log('   4. 密钥是否已过期');
    }
    
    console.log('='.repeat(60));
}

// 执行主函数
main().catch(console.error);