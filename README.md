# MindMirror (心镜)

<div align="center">

> 不给你答案，给你看一场内心对话。

</div>

MindMirror 是一个由 AI 驱动的**双角色辩论剧场**。你可以设定一个议题、选择两个"心声"角色（或自定义），并为他们赋予各自的**立场**——然后看着两个 AI 角色在你面前展开一场有深度、有交锋的对话。

---

## 核心功能

- **双 AI 流式对话** — 两个角色基于各自的人格设定和立场，通过 DeepSeek API 进行多轮辩论，流式输出逐字呈现
- **自定义角色（心声）** — 不局限于预设角色，你可以创建自己的角色（名字 + Soul 性格描述）
- **自定义立场** — 为每个角色指定独立立场（如"正方：AI 应该开源" vs "反方：AI 应该闭源"），让对话有真正的交锋
- **半自动对话流程** — 手动触发每轮发言（最多 10 轮），可在对话中随时插话改变讨论方向
- **用户自配 API Key** — 可在前端自行填入 DeepSeek API Key
- **观点摘要** — 对话结束后自动提炼核心论点
- **对话历史保存** — localStorage 持久化，刷新不丢失

## 技术栈

- **框架：** Next.js (App Router) + TypeScript
- **样式：** Tailwind CSS
- **AI 引擎：** DeepSeek API（流式输出）
- **部署：** Vercel

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

> **注意：** 需要自行填入 DeepSeek API Key（在应用前端界面中配置）。

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页（品牌展示 + 历史对话列表）
│   ├── layout.tsx            # 布局
│   ├── globals.css           # 主题样式（暖色调剧场风格）
│   ├── api/chat/route.ts     # DeepSeek API 代理
│   └── stage/
│       ├── new/page.tsx      # 新建对话（选角 + 填写立场）
│       └── [id]/page.tsx     # 对话剧场（核心交互页）
└── lib/
    ├── types.ts              # 类型定义
    ├── store.ts              # localStorage 操作
    ├── preset-voices.ts      # 预设角色
    └── llm.ts                # LLM 调用封装
```
