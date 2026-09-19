[简体中文](README.md) | [繁體中文](README_zh-HK.md) | **English**

<!-- markdownlint-disable -->

<div align="center">

<img src="./src-tauri/icons/icon.png" width="120" alt="Floral Notepaper Icon">

# Floral Notepaper

A lightweight, elegant, and modern sticky note app for your desktop<br>
Built with Tauri 2 + React

[Report an Issue](https://github.com/Deepis666/floral-notepaper-S/issues) · [Changelog](https://github.com/Deepis666/floral-notepaper-S/releases) <br>
[Quick Start](#quick-start) · [Fork Differences](#differences-from-the-upstream-version) · [Building from Source](#building-from-source)

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
> This repository is a **personal fork** of [the upstream Floral Notepaper (Achilng/floral-notepaper)](https://github.com/Achilng/floral-notepaper), now synced with upstream v1.2.0 and extended with the changes below; download channels, contributors and sponsors still refer to the original project.

## Differences from the Upstream Version

All changes unique to this fork (since v1.2.1, rebased onto upstream v1.2.0):

### 🖼️ Image Fixes & Enhancements

- Fixed silently broken image paste / drag & drop on Windows (traverses both `DataTransfer.items` and `files`, falling back to extension-based detection when the MIME type is missing)
- Notepad floating windows also accept dropped images; dropping an image with no note open creates one automatically, with a toast hint

### 📊 Mermaid Diagram Support

- Markdown preview renders `mermaid` code blocks (lazy-loaded, follows the theme, degrades gracefully on syntax errors, in a separate chunk so first paint stays fast)
- Editor toolbar button inserts a mermaid fenced block in one click; selected text is wrapped directly into diagram code

### 🗒️ Notepad Experience

- **No more empty notepads**: a shortcut-opened notepad with no content is no longer persisted on save/close; a bound note cleared to blank is deleted on save; empty notepads cannot be pinned to a tile
- **Note history shortcut**: a third global shortcut, "Open note history" (unset by default, recordable in settings), summons the notepad window straight into the history list
- **Configurable always-on-top**: new "Keep notepad window on top" setting (on by default, so it does not cover full-screen games); a pin toggle in the notepad header applies instantly and persists; tile windows follow suit and all windows stay in sync

### 🎨 Background Image Readability

- New "Content shade" setting (default 35%): with a custom background image, a translucent theme-paper panel is layered over the content area so text and toolbars stay readable while the image is never fogged out; 0–90% adjustable, adapts to light/dark themes automatically, inactive without a background image

### 🛡️ Stability

- **Data directory self-healing**: when the recorded data directory has been deleted or moved (leftover uninstall paths, manual moves, lost drive letters), the app falls back to a former location that still holds data or to the default directory and repairs the config, instead of crashing at startup

## Why Floral Notepaper

Most note-taking or sticky note apps out there are either bloated and steep to learn, or dated and long abandoned. Floral Notepaper was built to be different — quick to summon, light to use, and a pleasure to look at.

## Features

- **Markdown Editing & Preview** — Full GitHub Flavored Markdown support with seamless toggling between edit and preview modes

  ![Main window screenshot](Docs/images/主窗口截图.png)

- **Quick Note** — Summon a note window instantly from the system tray or via a global hotkey (default: `Ctrl+Space`)

  ![Multi-window example](Docs/images/小窗多开示例.gif)

- **Pin Mode** — Pin a note to a fixed spot on your desktop for quick reference and easy copying

  ![Pin mode example](Docs/images/AI绘画截图.png)

- **Import & Export** — Import and export notes as `.md` files

## Use Cases

- Use it as an always-visible clipboard to stash and copy text on the fly
- Jot things down while gaming or watching videos
- Capture a quick thought or burst of inspiration
- Keep a to-do list right on your desktop

## Quick Start

### Download

> [!NOTE]
> Installers for this fork are published on this repository's [Releases page](https://github.com/Deepis666/floral-notepaper-S/releases); the upstream channels below (MirrorChyan / Microsoft Store, etc.) only apply to the original app.

#### Via MirrorChyan

> [!TIP]
> If you have trouble accessing GitHub or experience slow downloads, try downloading Floral Notepaper via MirrorChyan.<br>
> Downloading via MirrorChyan also helps support the developer — see the [MirrorChyan website](https://mirrorchyan.com/) for details.

| Platform | Arch                    | Download                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows  | x64                     | [![Windows x64 Setup](https://img.shields.io/badge/Setup-x64-blue?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI%2BPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGgyNDJ2MjQySDB6TTI3MCAwaDI0MnYyNDJIMjcwek0wIDI3MGgyNDJ2MjQySDB6TTI3MCAyNzBoMjQydjI0MkgyNzB6Ii8%2BPC9zdmc%2B)](https://mirrorchyan.com/zh/projects?rid=floral&os=windows&arch=x64&channel=stable)           |
| Windows  | AArch64                 | [![Windows AArch64 Setup](https://img.shields.io/badge/Setup-AArch64-blue?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI%2BPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGgyNDJ2MjQySDB6TTI3MCAwaDI0MnYyNDJIMjcwek0wIDI3MGgyNDJ2MjQySDB6TTI3MCAyNzBoMjQydjI0MkgyNzB6Ii8%2BPC9zdmc%2B)](https://mirrorchyan.com/zh/projects?rid=floral&os=windows&arch=arm64&channel=stable) |
| macOS    | AArch64 (Apple Silicon) | [![macOS Apple Silicon](https://img.shields.io/badge/DMG-Apple%20Silicon-%23000000.svg?logo=apple)](https://mirrorchyan.com/zh/projects?rid=floral&os=macos&channel=stable&arch=arm64)                                                                                                                                                                                                                                                                                       |
| macOS    | x64 (Intel)             | [![macOS Intel](https://img.shields.io/badge/DMG-Intel%20X64-%2300A9E0.svg?logo=apple)](https://mirrorchyan.com/zh/projects?rid=floral&os=macos&channel=stable&arch=x64)                                                                                                                                                                                                                                                                                                     |

#### Via GitHub

Head over to the [Releases page](https://github.com/Achilng/floral-notepaper/releases/latest) to download.

##### Download Reference

| Platform | Arch                    | Type                    | Filename                                 |
| -------- | ----------------------- | ----------------------- | ---------------------------------------- |
| Windows  | x64                     | Installer (Recommended) | floral-notepaper_x.y.z_x64-setup.exe     |
| Windows  | x64                     | Portable                | floral-notepaper_x.y.z.exe               |
| Windows  | x64                     | MSIX Package            | floral-notepaper_x.y.z_x64.msix          |
| Windows  | AArch64                 | Installer (Recommended) | floral-notepaper_x.y.z_aarch64-setup.exe |
| Windows  | AArch64                 | MSIX Package            | floral-notepaper_x.y.z_aarch64.msix      |
| macOS    | AArch64 (Apple Silicon) | DMG                     | floral-notepaper_x.y.z_aarch64.dmg       |
| macOS    | x64 (Intel)             | DMG                     | floral-notepaper_x.y.z_x64.dmg           |

#### Via Microsoft Store

Download Floral Notepaper from the [Microsoft Store](https://apps.microsoft.com/detail/9NRCC0ZSG81R)

> Note: MSIX installs (from the Microsoft Store or sideloaded .msix files) do not support in-app updates. Get the latest version from the Microsoft Store or GitHub Releases.

<!-- markdownlint-disable -->

<a href="https://apps.microsoft.com/detail/9NRCC0ZSG81R?referrer=appbadge&mode=full" target="_blank"  rel="noopener noreferrer">
	<img src="https://get.microsoft.com/images/en-us%20dark.svg" width="200"/>
</a>

<!-- markdownlint-restore -->

#### macOS Installation Guidance

If you encounter installation issues, please refer to:

- Wiki: [macOS Installation Guidance](https://github.com/Achilng/floral-notepaper/wiki/macOS-%E5%AE%89%E8%A3%85%E6%8C%87%E5%BC%95-%7C-macOS-Installation-Guidance)
- Or video (Bilibili): [Mac云课堂 - Installing software on Mac means learning to wrestle with Apple](https://www.bilibili.com/video/BV1tg411t7hN)

### Building from Source

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md).

## Star History

[![Star History Chart](https://star-history.dera.page/svg?repos=Achilng/floral-notepaper&type=Date&legend=top-left)](https://star-history.dera.page/#Achilng/floral-notepaper&Date)

## 🌟 Contributors

[![contrib.rocks](https://contrib.rocks/image?repo=Achilng/floral-notepaper&max=1000)](https://contrib.rocks/image?repo=Achilng/floral-notepaper&max=1000)

## Sponsors

<!-- markdownlint-disable -->

| <img src="https://signpath.org/assets/favicon.png" alt="SignPath Logo" width=50> | Free code signing provided by [SignPath.io](https://signpath.io), certificate by [SignPath Foundation](https://signpath.org/) |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |

<!-- markdownlint-restore -->

## License

[MIT](LICENSE)
