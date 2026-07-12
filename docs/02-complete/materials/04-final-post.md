# 最终参赛帖

> **状态：** 全部材料已就绪，可直接发布

---

## 基本信息

- **标签：** `生活娱乐`
- **标题：** 生活娱乐 · 心镜 MindMirror —— 把脑袋里的小人具像化

---

## 正文

### 1. Demo 简介

> ❓ 你是否也曾在深夜纠结一个问题 —— 脑子里两个声音来回拉扯，
> 一个说冲，一个说稳，但就是做不了决定？
>
> MindMirror 不给你答案。它让你心里那两个声音，在你面前好好吵一架。

**一句话：** 你告诉它你在纠结什么，它让两个代表你内心不同声音的 AI 小人在你面前对话、争论、互相反驳。你在旁边看着——看完，你心里自然有了答案。

**产品形态：** 轻量级 AI 对话 Web 应用（浏览器打开即用，无需下载）

**核心功能一览：**

**① 首页 & 历史记录**
打开即见品牌氛围页，展示已有的"心镜剧场"列表。每一个舞台都是一次内心探索的记录。
![首页](../screenshots/01-demo-display/01-home.png)

**② 自定义角色（心声）**
不局限于预设角色。你可以创建属于自己的"心声"——设定名字和 Soul 性格描述，让内心对话真正属于你。
![创建心声](../screenshots/01-demo-display/02-create-voice.png)
所有自定义角色统一管理，随时选用。
![心声管理](../screenshots/01-demo-display/03-voices-manage.png)

**③ 新建对话——搭一座舞台**
选择议题、挑选角色、填写各自的立场——然后点击"召唤·让他们聊聊"，一场内心戏剧就此开幕。
![新建舞台](../screenshots/01-demo-display/04-new-stage.png)

**④ 双 AI 对话剧场**
两个带着独立人格设定和立场的 AI 在你面前自动对话、互相反驳。理性先生说"算一笔账"，冲动崽说"人生又不是 Excel"。你来我往中，每个角度、每个观点、每次反驳都清晰呈现。
![对话剧场](../screenshots/01-demo-display/05-stage-conversation.png)

**⑤ 观点摘要（心路窗口）**
对话结束后，系统自动提炼双方的核心观点，帮你回顾这场"内心辩论"的关键交锋点。
![心路窗口](../screenshots/01-demo-display/06-mind-window.png)

---

### 2. Demo 创作思路

**灵感来源：**

我自己就是经常纠结的人。问了很多 AI 工具，它们都直接告诉我"选 A 吧"，但我关掉屏幕后还是不踏实。后来我发现，真正让我想通的方式不是得到一个答案，而是让心里两个声音好好吵一架。看着它们对话、反驳、碰撞，我自然就知道我更认可谁了。

**想解决的问题：**

市面上所有 AI 工具都在做同一件事——替你回答。但当你犹豫的时候，你需要的不是别人替你选，你需要看清楚自己到底怎么想。

**为什么做这个方向：**

这是一个缝隙。所有人都在争着"给答案"，没人做"让答案自己浮现"这件事。而且这件事必须用 AI 做——每个小人的性格、知识、回应方式，来自于独立的 LLM 调用，没有 AI 就没有这种"两个独立人格真实碰撞"的效果。

---

### 3. 体验地址

> 🔗 **在线体验：** [https://mind-mirror.xiao-pang.cn/](https://mind-mirror.xiao-pang.cn/)
>
> 部署于 Vercel，通过腾讯云域名解析，国内可正常访问。

---

### 4. TRAE 实践过程

MindMirror 从创意到可运行的 Demo，完全基于 **TRAE IDE** 完成。以下是整个开发过程的完整记录。

**技术栈：** Next.js + TypeScript + DeepSeek API + Vercel 部署

---

#### 🎭 阶段零：人与 AI 的高效协作模式

这两张截图展示的是本次参赛过程本身——我们如何通过 TRAE IDE 的 AI 助手高效协作。

用户向 AI 提出需求——研究比赛要求、搭建文件夹结构、撰写材料清单。不需要写代码，只需要说清楚"要什么"。
![collab-input](../screenshots/02-trae-process/04-collab-input.png)

AI 完成工作后反馈结果——展示完整的文件夹结构、分工说明，并明确告诉用户下一步需要配合什么。
![collab-output](../screenshots/02-trae-process/05-collab-output.png)

这种协作模式贯穿了整个 MindMirror 的开发——用户提出想法和需求，TRAE 的 AI 负责将其落地为可运行的代码和文档。

> 🔗 Session ID：`940103ad2152fa18901119f371e4fa2f_6a3cf529acdaf5a921967d90.6a3cf6f7acdaf5a921967d92.6a3cf6f74eb10067cf861e02`

---

#### 🚀 阶段一：使用 TRAE 初始化 Next.js 项目

通过简单的对话，TRAE 自动完成了 Next.js 项目初始化配置（TypeScript + Tailwind CSS + App Router + ESLint）。
![nextjs-init](../screenshots/02-trae-process/06-nextjs-init.png)

> 🔗 Session ID：`fd71bd967fba172f9a3943371c477b9a_6a3cd406acdaf5a9219679c0.6a3ce29eacdaf5a921967c49.6a3ce29d4eb10067cf861df8`

---

#### ⚡ 阶段二：一次对话完成核心功能开发

在一段持续对话中，TRAE 一次性完成了从对话引擎到 UI 界面的全部核心功能开发：

| 功能 | 说明 |
|------|------|
| 首页 | 品牌展示 + 历史对话列表 + 删除 |
| 新建对话 | 输入题目/背景 + 选角 + 自定义小人 |
| 双 AI 流式对话 | DeepSeek API 流式输出，打字机效果 |
| 半自动对话流程 | 手动触发每轮发言，最多 10 轮 |
| 用户插话 | 对话中可随时输入，改变方向 |
| 对话历史保存 | localStorage，刷新不丢失 |
| 观点摘要 | 结束后自动提炼核心论点 |
| 暖色调 UI | 圆角卡片、极简文字优先的剧场风格 |

![core-demo-complete](../screenshots/02-trae-process/07-core-demo-complete.png)
>TRAE 的 Agent 完成开发后输出的完成总结。

> 🔗 Session ID：`a376bd889a7317b644f6b30f79433322_6a3ce682acdaf5a921967c92.6a3ce8e0acdaf5a921967ce3.6a3ce8e04eb10067cf861e00`

---

#### 🔧 阶段三：迭代优化——自定义角色与 API 配置

在核心功能跑通后，我们继续通过 TRAE 迭代了自定义角色功能和用户自行配置 API Key 的能力。
![optimization-custom-voice](../screenshots/02-trae-process/08-optimization-custom-voice.png)
>TRAE 对话界面与产品 Web 界面同屏展示。

> 🔗 Session ID：`ef96f62f136566df569817437df41df3_6a3ce682acdaf5a921967c92.6a3d285cacdaf5a921967e12.6a3d285c4eb10067cf861e04`

---

#### 🎯 阶段四：对话核心升级——为角色赋予"立场"

我们创建了名为 "04-conversation-feature" 的 Agent，专门开发让每个角色拥有独立"立场"描述的能力。Agent 自动制定了 6 步执行计划并逐项完成：

| 步骤 | 文件 | 变更内容 |
|------|------|---------|
| 1. 更新类型定义 | `src/lib/types.ts` | 给 Stage 添加 `stances` 字段 |
| 2. 增强 LLM 提示词 | `src/lib/llm.ts` | system prompt 中加入立场描述 |
| 3. 重写新建对话页 | `src/app/stage/new/page.tsx` | 新表单：背景 + 两个角色立场 |
| 4. 更新对话页面 | `src/app/stage/[id]/page.tsx` | 角色卡片显示立场 |
| 5. 适配历史记录 | `src/app/page.tsx` | 兼容旧数据 |
| 6. 启动验证 | dev server | 零诊断错误 |

在随后的迭代中，同一个 Agent 继续参与了**架构设计讨论**，帮我们梳理了每幕对话的内部流程、立场卡编译方案，并引入了**"章"(Chapter) 概念**——4 幕 = 1 章，每章结束时 API 自动做阶段性总结。

> 🔗 Session ID（实现）：`f47dc8b81ef31ebc6c19022192165af5_6a40d37f8cfefe90f2d0b739.6a40e0cc8cfefe90f2d0b848.6a40e0cb2da9086c0a4ec323`
> 🔗 Session ID（架构设计）：`4e7c2c60e7b6e2fe5081e6b714ddf0a9_6a40d37f8cfefe90f2d0b739.6a43c62997b57fc3d906e2f3.6a43c6286eb4440d88f2ef2a`
> 🔗 Session ID（迭代优化）：`236e54b4bf00fda24efaa7741528c2d0_6a40d37f8cfefe90f2d0b739.6a43cae697b57fc3d906e358.6a43cae56eb4440d88f2ef2c`

---

#### 🖥️ 阶段五：部署上线

使用 TRAE IDE 完成开发后，项目部署到 Vercel，通过腾讯云域名解析。

> 🔗 **体验地址：** [https://mind-mirror.xiao-pang.cn/](https://mind-mirror.xiao-pang.cn/)

---

#### 💡 阶段六：用 TRAE 做设计咨询——UI/UX 方案研讨

TRAE 的能力不限于生成代码。我们专门创建了名为 "03-UI-design" 的 Agent，让其以资深 UI 设计师的身份，对 MindMirror 的视觉设计进行系统分析，给出了 **7 大建议方向**：

| 建议 | 核心洞察 |
|------|---------|
| 强化"剧场"隐喻 | 用户不是在"使用工具"，而是在"观看内心戏剧" |
| 建立心镜独有的视觉氛围 | 渐变背景 + 光影层次 + 玻璃拟态 |
| 色彩体系情感化升级 | 暖色主调 + "暮色"深蓝灰氛围 |
| 字体作为情绪载体 | 手写感/宋体，让阅读像"看剧本" |
| 对话页面"剧场化"重构 | 分栏剧本式对白 |
| 动效作为情绪延伸 | 入场动画像"演员走上舞台" |
| 首页第一印象重塑 | 品牌标语更有视觉分量 |

> 🔗 Session ID：`b7d19b07c40c8cc92317ac01893f78f6_6a3d2ad0acdaf5a921967ece.6a40bf768cfefe90f2d0b4d5.6a40bf752da9086c0a4ec308`

---

### 5. 报名帖链接

> 报名帖：[心镜 MindMirror —— 把脑袋里的小人具像化](https://forum.trae.cn/t/topic/22549)
>
> GitHub 仓库：https://github.com/Ing-la/mind-mirror

---

### 使用的 TRAE 能力总结

| 能力 | 用途 |
|------|------|
| AI 对话生成代码 | 从设计文档直接生成可运行原型 |
| 连续对话+上下文理解 | 反复迭代对话节奏和角色响应风格 |
| 代码解释与调试 | 理解和修复运行中的问题 |
| 文件级代码生成 | 一次生成完整的组件/页面代码 |
| 角色扮演设计咨询 | 让 AI 以设计师身份进行系统性的 UI/UX 方案研讨 |
| 架构设计讨论 | 与 AI 共同推演系统架构、设计决策 |

---

> **全部材料：** 本参赛帖涉及的截图、Session ID、过程文档等完整材料均可在 GitHub 仓库查看。
> 项目完全基于 TRAE IDE 开发，从创意到上线未使用其他开发工具。
