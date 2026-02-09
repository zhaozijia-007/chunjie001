/**
 * 2026 马年春联生成 API (完整独立版)
 * 集成了专业提示词，修复了 500 报错，无需外部依赖
 */

// --- 1. 常量与工具 ---
const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/api/v1';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// 简单的日期格式化
function getSimpleBirthDesc(birth) {
  if (!birth || !birth.year) return '';
  return `${birth.year}年${birth.month}月${birth.day}日${birth.hour || ''}时`;
}

// --- 2. Cloudflare Pages 核心逻辑 ---

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // [检查] 必须从 env 里获取 Key
  const apiKey = env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: '后台未配置 DASHSCOPE_API_KEY，请检查 Cloudflare 设置' }, 500);
  }

  // [解析] 请求体
  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: '请求格式错误' }, 400);
  }
  const { birth, wish, script } = body;
  const useTraditional = script === 'tc';

  // --- 3. 核心提示词 (这里就是你要的那个专业版！) ---

  const birthText = getSimpleBirthDesc(birth);
  const wishText = Array.isArray(wish) ? wish.join('、') : (wish || '万事如意, 阖家幸福');

  const scriptInstruction = useTraditional
    ? '\n\n【重要】輸出語言：必須使用**繁體中文（Traditional Chinese）**，上聯、下聯、橫批、斗方、reasoning 全部用繁體字，不可出現簡體。'
    : '';

  const prompt = `【輸出要求】${useTraditional ? '本條春聯必須全部使用繁體中文（Traditional Chinese）書寫，每個字都是繁體，不可用簡體。' : '使用簡體中文。'}

# Role
你是一位精通中国传统国学、命理学与对联格律的文学大师。
请根据用户提供的生辰八字（可选）与愿望，创作一副符合 **2026 丙午马年（火马年）** 流年运势的定制春联。

# Context (流年背景)
- **年份**: 2026 年（农历丙午年）。
- **生肖**: 马（火马）。
- **五行**: 天干丙火，地支午火，纳音天河水。
- **吉象**: 龙马精神、万马奔腾、蒸蒸日上、红红火火、马到成功。

# User Input (用户信息)
- **用户生辰**: ${birthText || '用户未提供，请忽略此项'}
- **核心愿望**: ${wishText}
- **附加要求**: 必须喜庆、吉祥，避开生僻字。

# Constraints (格律严选)
1. **字数**: 上联 7 字，下联 7 字，横批 4 字。
2. **格律**: 必须严格遵守"**仄起平收**"：
   - 上联最后一个字必须是**仄声**（三声或四声）。
   - 下联最后一个字必须是**平声**（一声或二声）。
3. **对仗**: 词性要工整（天对地，雨对风，大陆对长空）。
4. **内容**: 上下联必须融入"马"、"午"、"丙火"、"腾飞"等 2026 年流年意象。
5. **斗方**: 给出一个单字（如：福、顺、满、吉），适合贴在门中间。${scriptInstruction}

# Output Format (严格 JSON)
请仅返回一个纯 JSON 对象，**严禁**包含 Markdown 代码块标记（如 \`\`\`json），也不要多嘴解释，格式如下：
{
  "upper": "上联内容",
  "lower": "下联内容",
  "banner": "横批",
  "fu": "斗方",
  "reasoning": "解析：说明如何结合了用户愿望与马年运势（50字内）"
}`;

  // --- 4. 调用阿里云 AI ---
  try {
    const resp = await fetch(`${DASHSCOPE_BASE}/services/aigc/text-generation/generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-DashScope-WorkSpace': 'text-generation'
      },
      body: JSON.stringify({
        model: 'qwen-turbo', // 使用通义千问模型
        input: {
          messages: [
            { role: 'user', content: prompt }
          ]
        },
        parameters: {
          result_format: 'message',
          temperature: 0.7 // 稍微有点创造力，但别太飞
        }
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return jsonResponse({ error: `AI 调用失败: ${resp.status}`, details: errText }, 500);
    }

    const data = await resp.json();
    const content = data.output?.choices?.[0]?.message?.content || '';

    // [清洗] 尝试提取纯 JSON (防止 AI 废话)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let result = {};
    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch (e) {
        result = { error: 'AI 返回了坏掉的 JSON', raw: content };
      }
    } else {
      result = { error: 'AI 没返回 JSON', raw: content };
    }

    return jsonResponse(result);

  } catch (err) {
    return jsonResponse({ error: 'Worker 内部错误', message: err.message }, 500);
  }
}
