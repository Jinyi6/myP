# 本地部署指南（VibeMD）

## 环境要求

- Node.js 18+（推荐 20）
- npm（随 Node.js 一起安装）
- 可选：Playwright 浏览器（用于导出 PDF）

## 安装依赖

```bash
npm install
```

## 环境变量

```bash
export OPENAI_API_KEY=你的OpenAI密钥
export OPENAI_MODEL=gpt-4o-mini
```

## 启动开发服务器

```bash
npm run dev
```

浏览器打开 http://localhost:3000

## 生产构建

```bash
npm run build
npm run start
```

## 健康检查

```bash
curl http://localhost:3000/api/health
```

## PDF 导出依赖（可选）

```bash
npx playwright install chromium
```

## 数据目录

- SQLite 数据库和导出文件默认保存在 `~/.vibemd/`。
