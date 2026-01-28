const glados = async () => {
  const cookie = process.env.GLADOS
  console.log('GLADOS Cookie length:', cookie?.length || 0)
  
  if (!cookie) {
    console.log('GLADOS Cookie 未设置')
    return ['错误', 'GLADOS Cookie 未设置']
  }
  
  try {
    const headers = {
      'cookie': cookie,
      'referer': 'https://glados.cloud/console/checkin',
      'user-agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
    }
    
    console.log('开始签到...')
    const checkin = await fetch('https://glados.cloud/api/user/checkin', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: '{"token":"glados.one"}',
    }).then((r) => r.json())
    
    console.log('签到响应:', JSON.stringify(checkin))
    
    const status = await fetch('https://glados.cloud/api/user/status', {
      method: 'GET',
      headers,
    }).then((r) => r.json())
    
    console.log('状态响应:', JSON.stringify(status))
    
    return [
      'Checkin OK',
      `${checkin.message}`,
      `Left Days ${Number(status.data.leftDays)}`,
    ]
  } catch (error) {
    console.error('发生错误:', error)
    return [
      'Checkin Error',
      `${error.message || error}`,
      `<${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}>`,
    ]
  }
}

const notify = async (contents) => {
  console.log('通知内容:', contents)
  const token = process.env.NOTIFY
  console.log('NOTIFY Token length:', token?.length || 0)
  
  if (!token) {
    console.log('NOTIFY Token 未设置')
    return
  }
  
  if (!contents) {
    console.log('通知内容为空')
    return
  }
  
  try {
    console.log('发送通知到PushPlus...')
    const response = await fetch(`https://www.pushplus.plus/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token,
        title: contents[0],
        content: contents.join('<br>'),
        template: 'markdown',
      }),
    })
    
    const result = await response.json()
    console.log('PushPlus响应:', JSON.stringify(result))
    
    if (result.code === 200) {
      console.log('通知发送成功')
    } else {
      console.log('通知发送失败:', result.msg)
    }
  } catch (error) {
    console.error('发送通知时出错:', error)
  }
}
