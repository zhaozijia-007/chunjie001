// 用于解锁 Cloudflare Pages 的「环境变量」配置
// 访问 /api/chat 可检测后端是否连通、Key 是否已配置
export async function onRequest(context) {
  const apiKey = context.env.MY_AI_KEY
  const dashScopeKey = context.env.DASHSCOPE_API_KEY
  return new Response(
    JSON.stringify({
      message: '后端连通了！',
      MY_AI_KEY: apiKey ? '已配置' : '未配置',
      DASHSCOPE_API_KEY: dashScopeKey ? '已配置' : '未配置',
    }),
    {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    }
  )
}
