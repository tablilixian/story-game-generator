#!/usr/bin/env node

/**
 * 测试WL-AI-Director代理配置修复
 * 验证代理是否能正确转发到智谱AI API
 */

const API_KEY = '73f191ee02eb4060a588208a02dae319.6clDepy7o222YQy0';

async function testDirectAPI() {
    console.log('🧪 测试1: 直接调用智谱AI API\n');
    
    try {
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'glm-4-flash',
                messages: [{ role: 'user', content: '测试直接API调用' }],
                max_tokens: 50
            })
        });

        console.log('✅ 直接API调用: 成功');
        console.log(`   状态码: ${response.status}`);
        return true;
    } catch (error) {
        console.log('❌ 直接API调用: 失败');
        console.log(`   错误: ${error.message}`);
        return false;
    }
}

async function testProxyAPI() {
    console.log('🧪 测试2: 通过代理调用API\n');
    
    try {
        const response = await fetch('http://localhost:3005/bigmodel/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'glm-4-flash',
                messages: [{ role: 'user', content: '测试代理API调用' }],
                max_tokens: 50
            })
        });

        console.log('✅ 代理API调用: 成功');
        console.log(`   状态码: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`   模型回复: ${data.choices[0].message.content}`);
        }
        
        return true;
    } catch (error) {
        console.log('❌ 代理API调用: 失败');
        console.log(`   错误: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('🧪 WL-AI-Director 代理配置修复验证');
    console.log('='.repeat(60));
    
    // 测试直接API调用
    const directResult = await testDirectAPI();
    console.log('');
    
    // 测试代理API调用
    const proxyResult = await testProxyAPI();
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 测试总结');
    console.log('='.repeat(60));
    
    console.log('🔗 直接API调用:', directResult ? '✅ 正常' : '❌ 异常');
    console.log('🔗 代理API调用:', proxyResult ? '✅ 正常' : '❌ 异常');
    
    if (directResult && proxyResult) {
        console.log('\n🎉 完美！代理配置修复成功！');
        console.log('💡 WL-AI-Director现在可以正常使用AI功能了！');
    } else if (directResult && !proxyResult) {
        console.log('\n⚠️ 代理配置仍有问题！');
        console.log('💡 建议检查代理服务器是否正常运行');
    } else {
        console.log('\n❌ API密钥或网络连接有问题！');
        console.log('💡 建议检查API密钥和网络连接');
    }
    
    console.log('='.repeat(60));
}

main().catch(console.error);