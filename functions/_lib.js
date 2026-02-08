export const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
export const WISH_LABELS = { career: '事业', wealth: '财运', fame: '名声', romance: '桃花' }
export const HORSE_2026 = {
  year: '丙午',
  liunian: '丙午火馬年',
  sanhe: '寅午戌（虎马狗三合）',
  liuhe: '午未（马羊六合）',
  wuxing: '火',
}

export function buildBirthDesc(birth, birthPlace) {
  const parts = []
  if (birth?.year && birth?.month && birth?.day) {
    parts.push(`生于${birth.year}年${birth.month}月${birth.day}日`)
    if (birth.hour != null && birth.hour !== '') parts.push(`${birth.hour}时`)
  }
  if (birthPlace) parts.push(`出生地：${birthPlace}`)
  if (birth?.gender) parts.push(`性别：${birth.gender === 'female' ? '女' : '男'}`)
  return parts.length ? parts.join('，') : '未提供'
}

export async function fetchBaziFromAgent(birth, birthPlace, env) {
  const key = env?.DASHSCOPE_API_KEY
  const baziId = env?.BAZI_APP_ID || 'fc18781954cc4f6b82a4533ac88a10c1'
  if (!key) return null
  try {
    const birthStr = `公历${birth.year}年${birth.month}月${birth.day}日`
    const hourStr = birth.hour != null && birth.hour !== '' ? `${birth.hour}时` : '（时辰未知，请按午时推算）'
    const genderStr = birth?.gender === 'female' ? '女' : '男'
    const placeStr = birthPlace ? `，出生地${birthPlace}` : ''
    const prompt = `请为以下信息进行八字排盘，输出四柱、日主、五行、贵人、文昌、桃花等核心信息，简要概括即可：${birthStr}${hourStr}，${genderStr}${placeStr}`
    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${baziId}/completion`
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ input: { prompt }, parameters: {}, debug: {} }),
    })
    const data = await r.json()
    if (data.code && data.code !== 200) return null
    const text =
      data?.output?.text ||
      data?.output?.choices?.[0]?.message?.content ||
      data?.output?.output ||
      (typeof data?.output === 'string' ? data.output : null)
    if (text && typeof text === 'string') return text.trim()
  } catch {}
  return null
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

export function corsPreflight() {
  return new Response(null, { status: 204, headers: CORS })
}
