console.log('=== 开始执行 GLaDOS 签到 ===');
console.log('当前时间:', new Date().toISOString());

// 检查环境变量
console.log('GLADOS 变量长度:', process.env.GLADOS?.length || 0);
console.log('NOTIFY 变量长度:', process.env.NOTIFY?.length || 0);

// 在 Node.js 18+ 中，fetch 是实验性功能，需要显式启用或使用 node-fetch
// 这里我们使用动态导入 node-fetch
const glados = async () => {
  console.log('🚀 进入 glados 函数');
  const cookie = process.env.GLADOS;
  
  if (!cookie) {
    console.log('❌ GLADOS Cookie 为空');
    return ['错误', 'GLADOS Cookie 未设置'];
  }
  
  try {
    // 动态导入 node-fetch
    const { default: fetch } = await import('node-fetch');
    
    const headers = {
      'cookie': cookie,
      'referer': 'https://glados.cloud/console/checkin',
      'user-agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
    };
    
    console.log('📤 发送签到请求...');
    const checkinResponse = await fetch('https://glados.cloud/api/user/checkin', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: '{"token":"glados.cloud"}',
    });
    
    console.log('📊 签到响应状态:', checkinResponse.status);
    const checkin = await checkinResponse.json();
    console.log('📊 签到响应数据:', JSON.stringify(checkin));
    
    console.log('📡 获取状态信息...');
    const statusResponse = await fetch('https://glados.cloud/api/user/status', {
      method: 'GET',
      headers,
    });
    
    console.log('📊 状态响应状态:', statusResponse.status);
    const status = await statusResponse.json();
    console.log('📊 状态响应数据:', JSON.stringify(status));
    
    const result = [
      '✅ Checkin OK',
      `📝 ${checkin.message}`,
      `⏳ Left Days ${Number(status.data.leftDays)}`,
    ];
    
    console.log('🎉 签到成功，返回结果:', result);
    return result;
    
  } catch (error) {
    console.log('❌ 签到过程中出错:', error.message);
    console.log('错误堆栈:', error.stack);
    return [
      '❌ Checkin Error',
      `错误: ${error.message}`,
      `<${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}>`,
    ];
  }
};

const notify = async (contents) => {
  console.log('📤 进入 notify 函数');
  console.log('📄 收到的内容:', contents);
  
  const token = process.env.NOTIFY;
  if (!token) {
    console.log('⚠️ NOTIFY Token 为空，跳过通知');
    return;
  }
  
  if (!contents) {
    console.log('⚠️ 通知内容为空，跳过通知');
    return;
  }
  
  try {
    // 动态导入 node-fetch
    const { default: fetch } = await import('node-fetch');
    
    console.log('🔄 发送 PushPlus 通知...');
    const response = await fetch(`https://www.pushplus.plus/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token,
        title: contents[0],
        content: contents.join('<br>'),
        template: 'markdown',
      }),
    });
    
    const result = await response.json();
    console.log('📊 PushPlus 响应:', JSON.stringify(result));
    
    if (result.code === 200) {
      console.log('✅ 通知发送成功');
    } else {
      console.log(`❌ 通知发送失败: ${result.msg || '未知错误'}`);
    }
  } catch (error) {
    console.log('❌ 发送通知时出错:', error.message);
  }
};

const main = async () => {
  try {
    console.log('🎬 开始执行主函数');
    const result = await glados();
    console.log('📋 glados 返回结果:', result);
    
    if (result) {
      await notify(result);
    } else {
      console.log('❌ glados 返回了 undefined 或 null');
    }
    
    console.log('🏁 程序执行完成');
  } catch (error) {
    console.log('🔥 主函数捕获到错误:', error);
    console.log('错误堆栈:', error.stack);
  }
};

// 执行主函数
main();
