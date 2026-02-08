import {
  DASHSCOPE_BASE,
  WISH_LABELS,
  HORSE_2026,
  buildBirthDesc,
  fetchBaziFromAgent,
  jsonResponse,
  corsPreflight,
} from '../_lib.js'

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
  const { birth, birthPlace, wish } = body
  if (!birth?.year || !birth?.month || !birth?.day) {
    return jsonResponse({ error: '请提供完整的出生年月日' }, 400)
  }

  const birthDesc = buildBirthDesc(birth, birthPlace)
  const baziResult = await fetchBaziFromAgent(birth, birthPlace, env)
  const baziSection = baziResult
    ? `【八字排盘（百炼 Agent）】\n${baziResult}`
    : `【个人生辰信息】${birthDesc}`

  const wishText =
    Array.isArray(wish) && wish.length
      ? wish.map((w) => WISH_LABELS[w] || w).join('、')
      : WISH_LABELS[wish] || wish || '吉祥如意'

  const prompt = `你是精通中国传统命理与春联的专家。请根据以下信息，创作一副贴合 2026 丙午马年流年、三合六合及个人八字风水的定制春联。

【2026 马年流年】
- 流年：${HORSE_2026.liunian}，五行属${HORSE_2026.wuxing}
- 三合贵人：${HORSE_2026.sanhe}
- 六合贵人：${HORSE_2026.liuhe}

${baziSection}

【2026 年愿望】${wishText}

要求：
- 上联、下联各 7 个汉字，融入马年三合六合、流年吉象及个人愿望
- 横批 4 个汉字
- 福字或斗方 1 字（福、春、喜、吉等）
- 使用传统术语如贵人、文昌、桃花、旺运等意象
- 以文字之力助其趋吉避凶、心想事成

请严格按以下 JSON 格式回复，不要包含其他说明：
{
  "upper":"上联内容",
  "lower":"下联内容",
  "banner":"横批内容",
  "fu":"福或春等",
  "reasoning":"生成依据与思路：简要说明八字排盘要点、马年流年吉象、三合六合贵人如何对应，以及如何结合愿望融入春联（80字以内）"
}`

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
          hint: !key ? '请配置 DASHSCOPE_API_KEY 环境变量' : undefined,
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
    const msg = err.message || '服务器错误'
    return jsonResponse({ error: msg }, 500)
  }
}
