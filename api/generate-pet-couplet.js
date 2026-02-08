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

  const { petType, wish } = req.body || {}
  const pet = String(petType || '猫').slice(0, 10)
  const wishStr = String(wish || '暴富').slice(0, 20)

  const prompt = `You are a creative copywriter for Gen Z. You specialize in writing funny, cute Chinese New Year couplets for pets.

**CRITICAL: The user's pet type is "${pet}". You MUST use this pet and ONLY this pet in your couplet.**
- If pet is 狗: use 狗/汪/旺/犬 etc. Do NOT use 猫.
- If pet is 猫: use 猫/喵 etc. Do NOT use 狗.
- If pet is 乌龟: use 龟/稳/寿 etc.
- If pet is 仓鼠: use 鼠/囤/粮 etc.

**Constraints:**
1. **Length**: Strictly **4 characters** per scroll (Left/Right). Short and punchy.
2. **Tone**: Cute, humorous, using homophones (e.g., '汪'='旺', '喵'='妙', '肥'='富').
3. **English**: Provide a 1-word English translation or sound effect for each scroll (e.g., 'Rich', 'Meow', 'Buff').
4. **Structure**:
   - Top Scroll (横批): 4 characters.
   - Left Scroll (上联): 4 characters.
   - Right Scroll (下联): 4 characters.
   - Center Character (斗方): 1 character (e.g., 胖, 喵, 旺, 财).

**Example for 猫 (JSON only):**
{"top":{"text":"人喵共旺","en":"All Rich"},"left":{"text":"猫肥家润","en":"Fat Cat"},"right":{"text":"粮满罐盈","en":"Full Jar"},"center":{"text":"吉","en":"Luck"}}

**Example for 狗:**
{"top":{"text":"犬吠迎春","en":"Woof"},"left":{"text":"狗壮家兴","en":"Buff Dog"},"right":{"text":"汪财旺福","en":"Rich"},"center":{"text":"旺","en":"Luck"}}

**User Input:**
- Pet type: ${pet} (you MUST use this pet)
- Wish: ${wishStr}

Generate a pet couplet in the exact JSON format above.`

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
        temperature: 0.8,
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
    const rawJson = jsonMatch[0].replace(/'/g, '"')
    const parsed = JSON.parse(rawJson)
    const top = parsed.top || {}
    const left = parsed.left || {}
    const right = parsed.right || {}
    const center = parsed.center || {}
    const result = {
      banner: String(top.text || '').slice(0, 4),
      bannerEn: String(top.en || '').slice(0, 20),
      upper: String(left.text || '').slice(0, 4),
      upperEn: String(left.en || '').slice(0, 20),
      lower: String(right.text || '').slice(0, 4),
      lowerEn: String(right.en || '').slice(0, 20),
      fu: String(center.text || '福').slice(0, 1) || '福',
      fuEn: String(center.en || '').slice(0, 20),
    }
    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || '服务器错误' })
  }
}
