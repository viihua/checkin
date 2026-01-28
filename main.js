// 添加 fetch 支持
import fetch from 'node-fetch';

const glados = async () => {
  const cookie = process.env.GLADOS
  if (!cookie) {
    console.log('GLADOS cookie not set')
    return
  }
  
  try {
    const headers = {
      'cookie': cookie,
      'referer': 'https://glados.cloud/console/checkin',
      'user-agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
    }
    
    const checkin = await fetch('https://glados.cloud/api/user/checkin', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: '{"token":"glados.one"}',
    }).then((r) => r.json())
    
    const status = await fetch('https://glados.cloud/api/user/status', {
      method: 'GET',
      headers,
    }).then((r) => r.json())
    
    console.log('签到成功:', checkin.message)
    console.log('剩余天数:', status.data.leftDays)
    
    return [
      'Checkin OK',
      `${checkin.message}`,
      `Left Days ${Number(status.data.leftDays)}`,
    ]
  } catch (error) {
    console.log('签到错误:', error)
    return [
      'Checkin Error',
      `${error}`,
      `<${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}>`,
    ]
  }
}

const notify = async (contents) => {
  const token = process.env.NOTIFY
  if (!token || !contents) {
    console.log('通知跳过: token或内容为空')
    return
  }
  
  try {
    await fetch(`https://www.pushplus.plus/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token,
        title: contents[0],
        content: contents.join('<br>'),
        template: 'markdown',
      }),
    })
    console.log('通知发送成功')
  } catch (error) {
    console.log('通知发送失败:', error)
  }
}

const main = async () => {
  const result = await glados()
  await notify(result)
}

main()
