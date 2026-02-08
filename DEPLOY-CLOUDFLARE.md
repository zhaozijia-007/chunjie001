# 发布到 Cloudflare Pages

本项目已适配 Cloudflare Pages：前端为 Vite 构建的静态站点，接口使用 Pages Functions（与 Vercel 的 `api/` 并存，部署到 Cloudflare 时使用 `functions/`）。

## 一、通过 Cloudflare Dashboard 部署（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 选择你的仓库（如 GitHub 上的 `chunjie001`）。
3. 配置构建：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: 留空或 `/`
   - **Deploy command**：**留空**（不要填 `npx wrangler deploy`）。留空后 Pages 会自动部署构建产物并启用 `functions/` 下的接口；若自定义了 deploy command，会报错且 `/api` 不可用。
4. 在 **Settings** → **Environment variables** 中为「Production」添加：
   - `DASHSCOPE_API_KEY`：百炼 API 密钥（必填）
   - `BAZI_APP_ID`：八字排盘 Agent ID（流年运势需要时填）
5. 点击 **Save and Deploy**，等待构建完成即可。

## 二、通过 Wrangler CLI 部署

```bash
# 安装
npm i -g wrangler

# 登录
wrangler login

# 在项目根目录构建并部署到 Pages
npm run build
wrangler pages deploy dist --project-name=春联生成器
```

环境变量需在 Dashboard 的 **Pages** → 你的项目 → **Settings** → **Environment variables** 中配置（同上一节）。

## 三、接口说明

部署后，以下接口会由 Pages Functions 提供（路径与现有前端请求一致）：

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/generate-couplet` | POST | 关键词生成春联 |
| `/api/generate-personalized-couplet` | POST | 八字流年生成春联 |
| `/api/generate-pet-couplet` | POST | 萌宠趣味生成春联 |

前端无需改代码，请求 `/api/...` 会由同一站点下的 Functions 处理。

## 四、若已设置「Deploy command: npx wrangler deploy」

项目内已包含 `wrangler.jsonc`（仅上传 `dist` 静态资源），下次构建时 `npx wrangler deploy` 会通过。但这样部署后 **不会** 启用 `functions/`，即 **/api 接口不可用**。若需要 AI 生成等接口，请按「一」将 **Deploy command 清空**，用 Pages 默认流程部署。

## 五、目录说明

- **Vercel**：使用根目录下 `api/*.js`（`req/res` 风格）。
- **Cloudflare**：使用 `functions/api/*.js`（Fetch 风格，`context.request` / `context.env`）。两套实现逻辑一致，可按部署目标选用。
