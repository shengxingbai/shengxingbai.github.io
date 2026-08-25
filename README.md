# 个人学术主页（GitHub Pages 静态站点）

一个基于 **Jekyll + GitHub Pages** 的个人网站，包含三大核心模块：

- **简历**：教育背景、工作经历、专业技能
- **博客**：Markdown 文章发布，支持分类标签与列表筛选
- **荣誉**：奖项、证书、主要成就展示

风格简洁学术，响应式布局，纯静态、易维护、提交即自动发布。

---

## 目录结构

```
.
├── _config.yml          # 站点配置（标题、作者、链接规则等）
├── _layouts/            # 页面模板（default / post）
├── _includes/           # 公共片段（header / footer）
├── _posts/              # 博客文章（Markdown，按日期命名）
├── assets/
│   ├── css/style.css    # 学术风格样式（响应式）
│   └── js/main.js       # 移动端导航 + 分类筛选
├── index.html           # 首页
├── resume.html          # 简历
├── blog.html            # 博客列表
├── honors.html          # 荣誉
├── Gemfile              # 本地预览依赖（可选）
└── README.md
```

---

## 一、本地预览（可选）

需要本地安装 [Ruby](https://www.ruby-lang.org/) 与 Bundler：

```bash
gem install jekyll bundler
bundle install
bundle exec jekyll serve
```

然后访问 http://localhost:4000 。

> 即使不安装 Ruby，也能直接推送到 GitHub 发布——GitHub Pages 会在云端自动构建。

---

## 二、部署到 GitHub Pages

### 1. 创建仓库

- **用户/组织站点**：新建仓库，名称必须为 `<你的用户名>.github.io`（例如 `octocat.github.io`）。
- **项目站点**：新建任意名称仓库（如 `my-site`），之后在 `_config.yml` 中将 `baseurl` 改为 `/my-site`。

### 2. 提交并推送

```bash
git init
git add .
git commit -m "init: 个人学术主页"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

### 3. 开启 Pages

进入仓库 **Settings → Pages**：
- Source 选择 **Deploy from a branch**
- Branch 选择 **main**（用户站点也可选 `/root`；项目站点按需选择）
- 保存后等待 1–2 分钟

访问 `https://<用户名>.github.io`（或 `https://<用户名>.github.io/<仓库名>`）即可看到站点。
之后每次 `git push`，网站都会自动重新构建发布。

---

## 三、如何替换为自己的内容

| 想改什么 | 改哪里 |
| -------- | ------ |
| 站点标题 / 作者 | `_config.yml` 的 `title`、`author` |
| 首页简介、头像首字 | `index.html` |
| 教育 / 工作 / 技能 | `resume.html` |
| 奖项 / 证书 / 成就 | `honors.html` |
| 新增博客文章 | 在 `_posts/` 新建 `YYYY-MM-DD-标题.md`，写好 front matter 与正文 |
| 配色 / 字体 | `assets/css/style.css` 顶部的 CSS 变量 |
| 导航菜单 | `_includes/header.html` |

### 写一篇新文章

在 `_posts/` 新建文件，命名 `2024-08-25-my-post.md`：

```markdown
---
layout: post
title: 文章标题
date: 2024-08-25
categories: [随笔]
---

这里是正文，支持 **Markdown** 语法。
```

分类（categories）会出现在博客列表的筛选器里，可自由新增。

---

## 四、自定义域名（可选）

若你有自己的域名：
1. 在仓库 Settings → Pages → Custom domain 填写域名；
2. 在域名服务商处添加 CNAME 解析指向 `<用户名>.github.io`；
3. 可在仓库根目录放置 `CNAME` 文件写入你的域名（避免被覆盖）。

---

## 许可证

站点框架可自由使用与修改；其中的示例内容请替换为你自己的信息。
