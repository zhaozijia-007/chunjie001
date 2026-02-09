/**
 * 独立版流年春联 API（单文件、无 _lib 依赖）
 * 与「关键词」接口一致：使用 compatible-mode/v1/chat/completions，确保同一 Key 可跑通
 */

// 与关键词接口相同的 Base，保证测试环境能通
const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

function getSimpleBirthDesc(birth) {
  if (!birth) return '未提供'
  return `${birth.year}年${birth.month}月${birth.day}日出生`
}

const WISH_LABELS = { career: '事业', wealth: '财运', fame: '名声', romance: '桃花' }

export async function onRequestOptions() {
  return corsPreflight()
}

export async function onRequestPost(context) {
  const { request, env } = context
  const apiKey = env.DASHSCOPE_API_KEY
  if (!apiKey) {
    return jsonResponse(
      { error: 'API Key 未配置', hint: '请在 Cloudflare 后台检查变量名是否为 DASHSCOPE_API_KEY' },
      500
    )
  }

  let body = {}
  try {
    body = await request.json()
  } catch (e) {
    return jsonResponse({ error: '请求体 JSON 格式错误' }, 400)
  }

  const { birth, birthPlace, wish } = body
  if (!birth?.year || !birth?.month || !birth?.day) {
    return jsonResponse({ error: '请提供完整的出生年月日' }, 400)
  }

  const birthText = getSimpleBirthDesc(birth)
  const wishText =
    Array.isArray(wish) && wish.length
      ? wish.map((w) => WISH_LABELS[w] || w).join('、')
      : WISH_LABELS[wish] || wish || '吉祥如意'

  const prompt = `你是精通中国传统命理与春联的专家。请根据以下信息，创作一副贴合 2026 丙午马年流年、三合六合及个人八字风水的定制春联。

【个人生辰】${birthText}${birthPlace ? '，出生地：' + birthPlace : ''}
【2026 年愿望】${wishText}

要求：
- 上联、下联各 7 个汉字，融入马年三合六合、流年吉象及个人愿望
- 横批 4 个汉字
- 福字或斗方 1 字（福、春、喜、吉等）
- 使用传统术语如贵人、文昌、桃花、旺运等意象

请严格按以下 JSON 格式回复，不要包含其他说明：
{"upper":"上联内容","lower":"下联内容","banner":"横批内容","fu":"福或春等","reasoning":"生成依据与思路（80字以内）"}`

  try {
    const resp = await fetch(`${DASHSCOPE_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 512,
      }),
    })

    const data = await resp.json().catch(() => ({}))
    const apiError =
      data?.error?.message || data?.error?.code || data?.error || data?.message || data?.msg
    if (apiError || !resp.ok) {
      return jsonResponse(
        {
          error: apiError || `API 请求失败 (${resp.status})`,
          hint: !apiKey ? '请配置 DASHSCOPE_API_KEY 环境变量' : undefined,
        },
        resp.ok ? 400 : 500
      )
    }

    const content = data.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return jsonResponse(
        {
          error: 'AI 返回格式异常',
          hint: content?.slice(0, 100) ? `返回内容: ${content.slice(0, 100)}...` : undefined,
        },
        500
      )
    }

    const parsed = JSON.parse(jsonMatch[0])
    const result = {
      upper: String(parsed.upper || '').slice(0, 14),
      lower: String(parsed.lower || '').slice(0, 14),
      banner: String(parsed.banner || '').slice(0, 8),
      fu: String(parsed.fu || '福').slice(0, 2) || '福',
      reasoning: parsed.reasoning ? String(parsed.reasoning).slice(0, 300) : null,
    }
    return jsonResponse(result)
  } catch (err) {
    return jsonResponse({ error: '服务器内部错误', message: err.message }, 500)
  }
}
