# 吉语生联

在线春联生成器，新中式风格，支持 AI 关键词生成、八字流年个人定制、多种纸张样式与镶边图案。数据获国际导师支持：香港苏民峰、麦玲玲；新加坡滨海湾金沙陈军容、吴源良、陈俊元。

## 功能

- SKU 选择（家用款 / 气派款）
- 上联、下联、横批、福字内容编辑
- 字体颜色：金色 / 黑色
- 纸张样式：纯红、洒金、龙纹
- 镶边图案：祥云、回纹、莲花、万字纹
- AI 关键词生成（阿里百炼 API）
- 喜庆背景音乐
- 春节氛围背景 + 马年动态小马

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key（可选，用于 AI 生成）

复制 `.env.example` 为 `.env`，填入你的阿里百炼 API Key：

```bash
cp .env.example .env
# 编辑 .env，设置 DASHSCOPE_API_KEY=sk-xxxx
```

`.env` 已加入 `.gitignore`，不会提交到版本库，密钥仅保存在本地。

个人定制模式会调用百炼八字 Agent（应用 ID: fc18781954cc4f6b82a4533ac88a10c1）进行排盘，与阿里百炼共用同一 API Key。

## 部署上线（Vercel）

**方式一：通过 Vercel 网站**
1. 将项目推送到 [GitHub](https://github.com) 仓库
2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
3. 点击「Import Project」，选择该仓库
4. 在项目设置 → Environment Variables 中添加 `DASHSCOPE_API_KEY`（填入你的阿里百炼 API Key）
5. 点击 Deploy 完成部署

**方式二：通过 Vercel CLI**
```bash
npm i -g vercel
vercel login
cd 春联生成器
vercel
```
首次部署会提示输入环境变量，或稍后在 Vercel 控制台添加 `DASHSCOPE_API_KEY`。

### 3. 启动

**方式一：仅前端（AI 将使用随机预设对联）**
```bash
npm run dev
```

**方式二：前端 + API 服务（启用 AI 关键词生成）**
```bash
npm run dev:all
```

- 前端：http://localhost:5173
- API：http://localhost:3001

### 4. 背景音乐

应用会尝试加载 Pixabay 无版权春节音乐。若无法播放，可将 MP3 文件放入 `public/audio/cny.mp3` 作为备选。

## 技术栈

- React + TypeScript
- Tailwind CSS
- Vite
- Express（API 代理）
- 阿里百炼 DashScope（qwen-turbo）
