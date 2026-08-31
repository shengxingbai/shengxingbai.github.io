---
layout: post
title: "Ollama 多卡 (4xRTX 2080Ti 12G) 部署实操笔记"
date: 2026-08-31
categories: [技术]
---


> **部署环境**: Ubuntu 18.04
> **核心思路**: 避开老旧 glibc，使用 Docker 容器化部署，强制四卡并行。

---

## 一、 环境检查

```bash
# 检查显卡驱动与CUDA版本（确认看到4张卡，且CUDA 12.4）
nvidia-smi

# 检查系统glibc版本
ldd --version
```

## 二、 安装 Docker（推荐使用系统自带版本）

```bash
# 卸载旧版本
sudo apt-get remove docker docker-engine docker.io containerd runc

# 更新源并安装
sudo apt-get update
sudo apt-get install docker.io

# 启动并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker
```

## 三、 配置当前用户权限

```bash
# 将当前用户加入docker组
sudo usermod -aG docker $USER

# 立即生效（或重新登录终端）
newgrp docker
```

## 四、 配置国内镜像加速（解决拉取超时）

```bash
# 写入加速器配置
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.m.daocloud.io",
    "https://mirror.baidubce.com"
  ]
}
EOF

# 重启 Docker 使配置生效
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 五、 安装 NVIDIA Container Toolkit（打通GPU）

```bash
# 添加 NVIDIA 源
distribution=$(. /etc/os-release;echo $ID$VERSION_ID) \
&& curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
&& curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

# 安装并配置
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

## 六、 验证 GPU 是否可被 Docker 识别

```bash
# 运行测试容器查看显卡
docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi
```

## 七、 启动 Ollama 并强制四卡并行

注意: 2080Ti 单卡12G，70B模型必须均摊显存。`OLLAMA_SCHED_SPREAD=1` 是关键参数。

```bash
# 清理可能残留的旧容器
docker rm -f ollama

# 正式启动容器（映射全部4张卡，显存均摊，模型持久化）
docker run -d --name ollama --gpus all \
  -e OLLAMA_SCHED_SPREAD=1 \
  -v ollama:/root/.ollama \
  -p 11434:11434 \
  ollama/ollama
```

## 八、 拉取并运行模型

```bash
# 运行 70B 模型（Q4量化约需38-40G显存，完美适配4x12G）
docker exec -it ollama ollama run llama3:70b
```

## 九、 对话测试与验证多卡状态

```bash
# 另开一个终端，查看4张显卡的占用情况（确认四张卡均有进程）
docker exec ollama nvidia-smi

# 查看 Ollama 实际识别情况（确认显示 4/4 GPU 或 100% GPU）
docker exec ollama ollama ps
```

交互界面进入后，输入以下内容测试：

> 写一首关于"四张 RTX 2080Ti 在 Linux 里跑大模型"的短诗。

```bash
# 若显存吃紧，可进入对话界面输入以下参数降低占用：
/set parameter num_ctx 2048

# 退出对话
/bye
```

## ⚠️ 常用错误修复速查

**1. 权限报错 (Permission denied)**

```bash
# 解决方法
newgrp docker
```

**2. 容器名称冲突 (Name is already in use)**

```bash
# 解决方法
docker rm -f ollama
```

**3. 拉取模型报错 (Error: pull model manifest: file does not exist)**

多试几次，或更换更小量化版本：

```bash
docker exec -it ollama ollama run llama3:70b-instruct-q2_K
```

**4. 容器自动退出 (Container is not running)**

```bash
# 查看崩溃日志
docker logs ollama
```

---

# cpolar 内网穿透及 WorkBuddy 配置完整笔记

> 适用环境：Ubuntu 服务器（Docker 运行 Ollama）+ 本地 Windows 电脑（WorkBuddy）

## 一、 cpolar 安装与配置

### 1. 注册与准备

- 访问 cpolar 官网（https://www.cpolar.com）注册账号。
- 登录后进入"验证"页面，复制你的专属 Authtoken（通常以 `eyJ...` 开头）。

### 2. 服务器安装与绑定

在服务器的终端中依次执行以下命令：

```bash
# 一键安装脚本
curl -L https://www.cpolar.com/static/downloads/install-release-cpolar.sh | sudo bash

# 绑定账号 Token（请替换为你自己的真实 Token）
cpolar authtoken 你的Authtoken

# 设置开机自启并启动服务
sudo systemctl enable cpolar
sudo systemctl start cpolar
```

### 3. 创建隧道

在浏览器中访问：http://localhost:9200（cpolar Web 管理界面）。

登录后，点击左侧菜单的"隧道管理" -> "创建隧道"。

填写以下配置：

- 隧道名称：ollama
- 协议：http （或 tcp）
- 本地地址：11434 （Ollama 的端口）
- 域名类型：随机域名 （免费版）

### 4. 获取公网地址

点击左侧菜单的"状态" -> "在线隧道列表"。

复制生成的公网地址（例如：`https://xxxx.r6.cpolar.top`）。

## 二、 WorkBuddy 配置大模型

### 1. 添加自定义模型

打开 WorkBuddy 客户端，进入"设置" -> "模型" -> "添加模型"，选择"自定义"。

### 2. 填写核心参数

| 配置项 | 填写内容 | 重要提示 |
| --- | --- | --- |
| API Base 地址 | `http://你的cpolar公网地址/v1` | 结尾必须加上 `/v1`，否则不兼容 |
| API Key | `ollama` | 本地服务无鉴权，随便填个字母即可 |
| 模型名称 | `llama3:70b` 或 `qwen2.5:7b` | 必须与服务器上 `ollama list` 显示的名字完全一致 |

### 3. 配置注意事项

- 免费版随机域名每 24 小时自动变化，需每天登录 cpolar 后台更新 WorkBuddy 的地址。
- 免费版带宽限制为 1Mbps，传输大文本时会卡顿。
- 公网暴露有安全隐患，建议配置 Nginx 反向代理密码，或尽量仅限自己使用。

## 三、 升级建议

如果觉得每次改地址太麻烦，可以购买 99 元/年的基础版。

基础版可以固定一个二级域名，带宽提升至 2Mbps，且支持 8 条隧道。

配置固定域名后，在 cpolar Web 后台保留域名，然后修改 `cpolar.yml` 配置文件即可永久生效。

## 四、 故障排查

- 报错 `Connection refused`：检查 cpolar 隧道是否在线，或公网地址是否已过期。
- 报错 `404 Not Found`：检查 API Base 地址末尾是否漏了 `/v1`。
- 报错模型不存在：检查模型名称是否与服务器端 `ollama list` 输出严格一致（区分大小写）。
