---
layout: post
title: 用 WorkBuddy 安装 ai-signal，每天把最新 AI 资讯推送到 QQ 邮箱
date: 2025-12-15
categories: [技术]
pinned: true
---

> 本文记录一次「把信息源自动化」的小实践：借助 WorkBuddy 安装开源项目 **ai-signal**，配置每日定时抓取 AI 一线动态，并通过 QQ 邮箱把整理好的日报推送到自己手里。

## 为什么想要一个 AI 日报

AI 领域的信息太碎了：X（Twitter）上的从业者、各路播客、Anthropic / OpenAI / DeepMind 的官方博客、arXiv 论文……分散在十几个地方，每天手动刷既费时又容易漏。

我想要的是：**每天一份、自动送达、只保留值得读的内容**。与其自己写爬虫，不如直接用现成的开源聚合器，再让 AI Agent 帮我做「总结 + 投递」。

## ai-signal 是什么

[ai-signal](https://github.com/Benboerba620/ai-signal) 是一个 **Agent-first** 的 AI 信息聚合项目，核心理念很巧妙：

- **中央只供料，不替你生成日报**。官方用 GitHub Actions 每天（北京时间约 06:00 全量抓取，工作日约 09:30 再做一次 arXiv 刷新）拉取播客、推文和论文，发布成一份 JSON。
- **真正的总结、翻译、格式定制，由你自己的 Agent 完成**。它追踪 15 个播客频道、29 位人物、19 个 X 账号、4 家博客和 arXiv 每日论文，覆盖面已经足够「一线」。
- **不需要内容侧的 API key**，clone 下来就能用。

## 用 WorkBuddy 一键安装

ai-signal 明确支持 WorkBuddy 的「自动安装」。我只在对话框里说了一句：

> 帮我安装 https://github.com/Benboerba620/ai-signal

WorkBuddy 自动完成了 clone、安装依赖（`pip install -r requirements.txt`，用户侧其实只需要 `httpx[socks]`）、并引导我初始化配置；随后立即生成了第一份日报。整个过程没敲命令、没找 API key。

手动方式也简单（供参考）：

```bash
git clone https://github.com/Benboerba620/ai-signal.git
cd ai-signal/scripts && pip install -r ../requirements.txt
```

> 国内 clone 慢的话，README 里给了镜像前缀：`https://gh-proxy.com/https://github.com/Benboerba620/ai-signal.git`。

## 让 Agent 每天定时抓取

中央的 feed 每天自动更新，我需要的是「我自己这边每天自动收」。在 WorkBuddy 里创建一条**每日定时任务（自动化）**即可，例如每天 08:00 触发一次「生成并发送 AI Signal 日报」。

要点：

- 定时任务建议给足超时（官方提示 ≥10 分钟，部分平台默认拉到 15 分钟，避免被杀死），可加 `--timeout-seconds 900` 一类参数；
- 抓取频率对齐中央节奏：上午 09:30 之后拿到的 arXiv 内容最全；
- 非持久化的 Agent 不适合自动收，用手动 `/ai-signal` 看日报即可。

## 把日报发送到 QQ 邮箱

ai-signal 的推送渠道包含 **邮件**（另外还有 Telegram / 飞书 / 聊天）。QQ 邮箱走 SMTP，关键参数是标准的：

| 项 | 值 |
|---|---|
| SMTP 服务器 | `smtp.qq.com` |
| 端口 | `465`（SSL/TLS）或 `587`（STARTTLS） |
| 用户名 | 你的完整 QQ 邮箱，如 `123456@qq.com` |
| 密码 | **授权码**，不是 QQ 密码 |
| 加密 | 必须开启 SSL/TLS |

> ⚠️ QQ 邮箱的「密码」是**授权码**：登录 QQ 邮箱网页端 → 设置 → 账户 → 开启 **POP3/SMTP 服务**，按提示发短信后会得到一串授权码，把它填进邮件配置，而不是你的 QQ 登录密码。

我把下面的邮件配置交给 WorkBuddy，让它把日报投递到我的邮箱：

```yaml
# ai-signal 邮件推送配置（提供给 WorkBuddy 的示例值）
email:
  smtp_host: smtp.qq.com
  smtp_port: 465
  smtp_secure: true          # 使用 SSL/TLS
  username: 你的QQ号@qq.com
  password: 你的授权码         # 邮箱设置 → 账户 → 开启 POP3/SMTP 获取
  to: 你的QQ号@qq.com          # 收件人，可与发件人相同
```

配置完成后，对 WorkBuddy 说「推送到邮件 / 推到 QQ 邮箱」，后续每次定时任务触发就会自动把整理好的日报发到收件箱。

## 效果与小结

打通之后，每天打开 QQ 邮箱就能看到一份由 Agent 生成、聚焦 AI 一线的中文日报——省去了自己四处刷信息的时间。

几个体会：

1. **Agent-first 的思路很省心**：抓取（中央）和总结（自己的 Agent）解耦，我只需要关心「怎么收、收到哪」。
2. **授权码是 QQ 邮箱最容易踩的坑**：端口、服务器都好查，唯独密码要换成授权码。
3. **定时任务的超时别设太短**：AI 总结 + 抓取一轮往往要几分钟，给够时间才稳。

如果你也想拥有一个不打扰、但每天都在线的 AI 资讯源，ai-signal + WorkBuddy + QQ 邮箱这套组合值得一试。
