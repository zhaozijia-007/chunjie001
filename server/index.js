import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

const app = express()
app.use(cors())
app.use(express.json())

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
const BAZI_AGENT_ID = process.env.BAZI_APP_ID || 'fc18781954cc4f6b82a4533ac88a10c1'

const WISH_LABELS = { career: '事业', wealth: '财运', fame: '名声', romance: '桃花' }
const HORSE_2026 = {
  year: '丙午',
  liunian: '丙午火馬年',
  sanhe: '寅午戌（虎马狗三合）',
  liuhe: '午未（马羊六合）',
  wuxing: '火',
}

function buildBirthDesc(birth, birthPlace) {
  const parts = []
  if (birth?.year && birth?.month && birth?.day) {
    parts.push(`生于${birth.year}年${birth.month}月${birth.day}日`)
    if (birth.hour != null && birth.hour !== '') parts.push(`${birth.hour}时`)
  }
  if (birthPlace) parts.push(`出生地：${birthPlace}`)
  if (birth?.gender) parts.push(`性别：${birth.gender === 'female' ? '女' : '男'}`)
  return parts.length ? parts.join('，') : '未提供'
}

async function fetchBaziFromAgent(birth, birthPlace) {
  if (!DASHSCOPE_API_KEY) return null
  try {
    const birthStr = `公历${birth.year}年${birth.month}月${birth.day}日`
    const hourStr = birth.hour != null && birth.hour !== '' ? `${birth.hour}时` : "（时辰未知，请按午时推算）"
    const genderStr = birth?.gender === 'female' ? '女' : '男'
    const placeStr = birthPlace ? `，出生地${birthPlace}` : ''
    const prompt = `请为以下信息进行八字排盘，输出四柱、日主、五行、贵人、文昌、桃花等核心信息，简要概括即可：${birthStr}${hourStr}，${genderStr}${placeStr}`
    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${BAZI_AGENT_ID}/completion`
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify({
        input: { prompt },
        parameters: {},
        debug: {},
      }),
    })
    const data = await r.json()
    if (data.code && data.code !== 200) {
      console.error('Bazi agent error:', data.message || data.code)
      return null
    }
    const text = data?.output?.text
      || data?.output?.choices?.[0]?.message?.content
      || data?.output?.output
      || (typeof data?.output === 'string' ? data.output : null)
    if (text && typeof text === 'string') return text.trim()
  } catch (e) {
    console.error('Bazi agent call failed:', e.message)
  }
  return null
}

app.post('/api/generate-couplet', async (req, res) => {
  const { keywords } = req.body || {}

  if (!DASHSCOPE_API_KEY) {
    return res.status(500).json({
      error: 'API Key 未配置',
      hint: '请在项目根目录创建 .env 文件，添加 DASHSCOPE_API_KEY=你的百炼API密钥',
    })
  }

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
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256,
      }),
    })

    const data = await resp.json()

    if (data.error) {
      return res.status(400).json({
        error: data.error.message || 'API 调用失败',
      })
    }

    const content = data.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({
        error: '无法解析 AI 返回内容',
        raw: content.slice(0, 200),
      })
    }

    const parsed = JSON.parse(jsonMatch[0])
    const result = {
      upper: String(parsed.upper || '').slice(0, 14),
      lower: String(parsed.lower || '').slice(0, 14),
      banner: String(parsed.banner || '').slice(0, 8),
      fu: String(parsed.fu || '福').slice(0, 2) || '福',
    }

    return res.json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      error: err.message || '服务器错误',
    })
  }
})

app.post('/api/generate-personalized-couplet', async (req, res) => {
  const { birth, birthPlace, wish } = req.body || {}

  if (!DASHSCOPE_API_KEY) {
    return res.status(500).json({
      error: 'API Key 未配置',
      hint: '请在项目根目录创建 .env 文件，添加 DASHSCOPE_API_KEY=你的百炼API密钥',
    })
  }

  if (!birth?.year || !birth?.month || !birth?.day) {
    return res.status(400).json({ error: '请提供完整的出生年月日' })
  }

  const birthDesc = buildBirthDesc(birth, birthPlace)
  const baziResult = await fetchBaziFromAgent(birth, birthPlace)
  const baziSection = baziResult
    ? `【八字排盘（百炼 Agent）】\n${baziResult}`
    : `【个人生辰信息】${birthDesc}`

  const wishText = Array.isArray(wish) && wish.length
    ? wish.map((w) => WISH_LABELS[w] || w).join('、')
    : (WISH_LABELS[wish] || wish || '吉祥如意')

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
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
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
      return res.status(resp.ok ? 400 : 500).json({
        error: apiError || `API 请求失败 (${resp.status})`,
        hint: !DASHSCOPE_API_KEY ? '请配置 DASHSCOPE_API_KEY 环境变量' : undefined,
      })
    }

    const content = data.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({
        error: 'AI 返回格式异常',
        hint: content?.slice(0, 100) ? `返回内容: ${content.slice(0, 100)}...` : undefined,
      })
    }

    const parsed = JSON.parse(jsonMatch[0])
    const result = {
      upper: String(parsed.upper || '').slice(0, 14),
      lower: String(parsed.lower || '').slice(0, 14),
      banner: String(parsed.banner || '').slice(0, 8),
      fu: String(parsed.fu || '福').slice(0, 2) || '福',
      reasoning: parsed.reasoning ? String(parsed.reasoning).slice(0, 300) : null,
    }
    return res.json(result)
  } catch (err) {
    console.error(err)
    const msg = err.message || '服务器错误'
    const hint =
      err.cause?.message ||
      (String(msg).includes('fetch') || err.code === 'ECONNREFUSED'
        ? '本地请运行 npm run dev:all 启动 API'
        : undefined)
    return res.status(500).json({ error: msg, hint })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API 服务运行于 http://localhost:${PORT}`)
})
