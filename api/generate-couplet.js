import { DASHSCOPE_BASE } from './lib.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.DASHSCOPE_API_KEY
  if (!key) {
    return res.status(500).json({
      error: 'API Key 未配置',
      hint: '请在 Vercel 项目设置中添加 DASHSCOPE_API_KEY 环境变量',
    })
  }

  const { keywords } = req.body || {}
  const prompt = `你是一位精通中国传统文化的春联创作专家。请根据用户提供的关键词，创作一副新春对联。

要求：
- 上联、下联各 7 个汉字
- 横批 4 个汉字
- 福字或中心斗方为 1 个汉字（可为福、春、喜、吉等）

请严格按以下 JSON 格式回复，不要包含其他说明文字：
{"upper":"上联内容","lower":"下联内容","banner":"横批内容","fu":"福或春等"}

用户关键词：${keywords || '新春吉祥'}`

  try {
    const resp = await fetch(`${DASHSCOPE_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256,
      }),
    })
    const data = await resp.json()
    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'API 调用失败' })
    }
    const content = data.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({ error: '无法解析 AI 返回内容', raw: content.slice(0, 200) })
    }
    const parsed = JSON.parse(jsonMatch[0])
    const result = {
      upper: String(parsed.upper || '').slice(0, 14),
      lower: String(parsed.lower || '').slice(0, 14),
      banner: String(parsed.banner || '').slice(0, 8),
      fu: String(parsed.fu || '福').slice(0, 2) || '福',
    }
    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || '服务器错误' })
  }
}
