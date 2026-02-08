import { DASHSCOPE_BASE, jsonResponse, corsPreflight } from '../_lib.js'

export async function onRequestOptions() {
  return corsPreflight()
}

export async function onRequestPost(context) {
  const { request, env } = context
  const key = env.DASHSCOPE_API_KEY
  if (!key) {
    return jsonResponse(
      { error: 'API Key 未配置', hint: '请在 Cloudflare 项目设置中添加 DASHSCOPE_API_KEY 环境变量' },
      500
    )
  }
  let body = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const keywords = body.keywords
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
      return jsonResponse({ error: data.error.message || 'API 调用失败' }, 400)
    }
    const content = data.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return jsonResponse({ error: '无法解析 AI 返回内容', raw: content.slice(0, 200) }, 500)
    }
    const parsed = JSON.parse(jsonMatch[0])
    const result = {
      upper: String(parsed.upper || '').slice(0, 14),
      lower: String(parsed.lower || '').slice(0, 14),
      banner: String(parsed.banner || '').slice(0, 8),
      fu: String(parsed.fu || '福').slice(0, 2) || '福',
    }
    return jsonResponse(result)
  } catch (err) {
    return jsonResponse({ error: err.message || '服务器错误' }, 500)
  }
}
