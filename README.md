<!-- markdownlint-disable -->

**简体中文** | [繁體中文](README_zh-HK.md) | [English](README_en-US.md)

<div align="center">

<img src="./src-tauri/icons/icon.png" width="120" alt="花笺图标">

# 花笺 Floral Notepaper

轻量、优雅、现代化的本地便签工具<br>
基于 Tauri 2 + React 构建

[反馈问题](https://github.com/Deepis666/floral-notepaper-S/issues) · [更新日志](https://github.com/Deepis666/floral-notepaper-S/releases) <br>
[快速开始](#快速开始) · [改版区别](#改版与原版区别) · [构建指南](#从源码构建)

[![Version](https://img.shields.io/github/v/release/Achilng/floral-notepaper)](https://github.com/Achilng/floral-notepaper/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Stars](https://img.shields.io/github/stars/Achilng/floral-notepaper?color=ffcb47&labelColor=black)</br>
![React 19](https://img.shields.io/badge/React-19-blue?logo=react)
![Tauri v2](https://img.shields.io/badge/Tauri-v2-%2324C8D8?logo=tauri)
![Rust Edition 2021](https://img.shields.io/badge/Rust-2021-%23000000?logo=rust)<br>
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Achilng/floral-notepaper)

</div>

<!-- markdownlint-restore -->

---

> [!IMPORTANT]
> 本仓库是 [花笺原版（Achilng/floral-notepaper）](https://github.com/Achilng/floral-notepaper) 的**个人改版**，在保留原版全部功能的基础上进行了以下修改与增强；原版的下载渠道、贡献者与赞助信息均仍指向原项目。

## 改版与原版区别

以下为本改版相对原版的全部改动（基线：原版 v1.1.0）：

### 🖼️ 图片功能修复与增强（v1.1.1）

- 修复 Windows 剪贴板粘贴 / 拖拽图片静默失效的问题（同时遍历 `DataTransfer.items` 与 `files`，MIME 缺失时按扩展名回退识别）
- 便签浮窗同样支持拖入图片；无笔记时拖入图片自动创建笔记，拖入时给出提示

### 📊 Mermaid 图表支持（v1.1.1）

- Markdown 预览支持渲染 `mermaid` 代码块（懒加载、主题跟随、语法错误降级提示，独立 chunk 不拖慢首屏）
- 编辑工具栏新增一键插入 mermaid 围栏块按钮，选中文本时直接包成图代码

### 🗒️ 便签体验优化（v1.1.2）

- **空便签不再残留**：快捷键呼出的便签若无内容，保存/关闭不再落库；已绑定笔记被清空后保存时自动删除；空便签不可钉为磁贴
- **历史便签快捷键**：新增第三个全局快捷键“打开历史便签”（默认未设置，可在设置中录制），按下即呼出便签窗口并直接展示历史笔记列表
- **置顶可配置**：新增“便签窗口置顶”设置（默认开启，游戏全屏时不遮挡），便签窗口头部新增置顶切换按钮即时生效并持久化，磁贴窗口同步遵循，多窗口间状态自动同步

### 🎨 背景图可读性优化（v1.1.2）

- 新增“内容蒙版”设置（默认 35%）：设置自定义背景图时，向内容区叠加一层主题纸色半透明面板，正文与工具栏清晰可读，而图片不被整体蒙灰；强度 0–90% 可调，明暗主题自动适配，无背景图时不生效

### 🛡️ 稳定性（v1.1.2）

- **数据目录失效自愈**：配置中记录的数据目录被删除或移动（如卸载残留、手动搬移、盘符失效）时，自动回退到仍含数据的旧位置或默认目录并写回配置，不再导致应用启动崩溃

## 为什么选择花笺

市面上现有的笔记或便签软件，要么功能繁重、上手门槛高，要么界面陈旧、久未更新。花笺因此而生，其特点是轻便、随呼随用，同时提供现代化的界面与舒适的编辑体验。

## 功能特点

- **Markdown 编辑与预览** — 支持 GitHub Flavored Markdown 语法，实时切换编辑和预览模式

  ![主窗口截图](Docs/images/主窗口截图.png)

- **快捷便签** — 通过托盘或全局快捷键（默认 `Ctrl+Space`）随时唤出便签窗口

  ![小窗多开示例](Docs/images/小窗多开示例.gif)

- **磁贴模式** — 将笔记固定在桌面某处，以便快速查阅和复制

  ![磁贴示例](Docs/images/AI绘画截图.png)

- **导入导出** — 支持 `.md` 文件的导入和导出

## 应用场景

- 当作随时可见的剪贴板，快速暂存和复制文本
- 游戏、看视频时随手记点东西
- 临时记录思路或灵感
- 桌面待办清单

## 快速开始

### 下载安装

> [!NOTE]
> 本改版的安装包以本仓库 [Releases 页](https://github.com/Deepis666/floral-notepaper-S/releases) 发布为准；以下原项目渠道仅适用于原版花笺。

#### 通过Mirror酱下载

> [!TIP]
> 如您的网络不便访问 GitHub，或下载速度过慢，您可以尝试通过Mirror酱下载花笺<br>
> 此外，您也可以通过使用Mirror酱下载花笺来赞助花笺的开发者，详见[Mirror酱官网](https://mirrorchyan.com/)

| 系统    | 架构                    | 下载链接                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Windows | x64                     | [![Windows x64 Setup](https://img.shields.io/badge/Setup-x64-blue?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI%2BPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGgyNDJ2MjQySDB6TTI3MCAwaDI0MnYyNDJIMjcwek0wIDI3MGgyNDJ2MjQySDB6TTI3MCAyNzBoMjQydjI0MkgyNzB6Ii8%2BPC9zdmc%2B)](https://mirrorchyan.com/zh/projects?rid=floral&os=windows&arch=x64&channel=stable) |
| macOS   | AArch64 (Apple Silicon) | [![macOS Apple Silicon](https://img.shields.io/badge/DMG-Apple%20Silicon-%23000000.svg?logo=apple)](https://mirrorchyan.com/zh/projects?rid=floral&os=macos&channel=stable&arch=arm64)                                                                                                                                                                                                                                                                             |
| macOS   | x64 (Intel)             | [![macOS Apple Silicon](https://img.shields.io/badge/DMG-Intel%20X64-%2300A9E0.svg?logo=apple)](https://mirrorchyan.com/zh/projects?rid=floral&os=macos&channel=stable&arch=x64)                                                                                                                                                                                                                                                                                   |

#### 通过 GitHub 下载

请前往 [Release 页](https://github.com/Achilng/floral-notepaper/releases/latest) 下载花笺

##### 下载参考

| 系统    | 架构                    | 类型     | 文件名                                  |
| ------- | ----------------------- | -------- | --------------------------------------- |
| Windows | x64                     | 安装程序 | floral-notepaper\_版本号\_x64-setup.exe |
| Windows | x64                     | 便携版   | floral-notepaper\_版本号.exe            |
| macOS   | AArch64 (Apple Silicon) | DMG      | floral-notepaper\_版本号\_aarch64.dmg   |
| macOS   | x64 (Intel)             | DMG      | floral-notepaper\_版本号\_x64.dmg       |

#### macOS 版安装指引

如遇安装问题，请参考：

- Wiki 中的 [macOS 安装指引](https://github.com/Achilng/floral-notepaper/wiki/macOS-%E5%AE%89%E8%A3%85%E6%8C%87%E5%BC%95-%7C-macOS-Installation-Guidance)
- 或视频（Bilibili）：[Mac云课堂 - 在 Mac 上装软件，要学会和苹果斗智斗勇](https://www.bilibili.com/video/BV1tg411t7hN)

### 从源码构建

请参考 [CONTRIBUTING.md](CONTRIBUTING.md)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Achilng/floral-notepaper&type=Date&legend=top-left)](https://star-history.com/#Achilng/floral-notepaper&Date)

## 🌟 贡献者

[![contrib.rocks](https://contrib.rocks/image?repo=Achilng/floral-notepaper&max=1000)](https://contrib.rocks/image?repo=Achilng/floral-notepaper&max=1000)

## Sponsors

<!-- markdownlint-disable -->

| <img src="https://signpath.org/assets/favicon.png" alt="SignPath Logo" width=50> | Free code signing provided by [SignPath.io](https://signpath.io), certificate by [SignPath Foundation](https://signpath.org/) |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |

<!-- markdownlint-restore -->

## 许可证

[MIT](LICENSE)
