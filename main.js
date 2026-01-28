const glados = async () => {
  const cookie = process.env.GLADOS
  if (!cookie) return
  try {
    const headers = {
      'cookie': cookie,
      'referer': 'https://glados.cloud/console/checkin',
      'user-agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
    }
    const checkin = await fetch('https://glados.cloud/api/user/checkin', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: '{"token":"glados.cloud"}',
    }).then((r) => r.json())
    const status = await fetch('https://glados.cloud/api/user/status', {
      method: 'GET',
      headers,
    }).then((r) => r.json())
    return [
      '签到成功！',
      `获得积分：${Number(checkin.points)}`,
      `剩余天数：${Number(status.data.leftDays)}`,
      `返回信息：${checkin.message}`,
    ]
  } catch (error) {
    return [
      '签到错误！❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌',
      `错误信息：${error}`,
      `仓库地址：<${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}>`,
    ]
  }
}

const notify = async (contents) => {
  const token = process.env.NOTIFY
  if (!token || !contents) return
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
}

const main = async () => {
  await notify(await glados())
}

main()
