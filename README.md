# QEA CueRing｜词环

**把常用提示词，放到鼠标身边。**  
**Your everyday prompts, one shortcut away.**

为游戏原画与视觉创作工作流设计的 Windows 桌面提示词圆环。按 **Ctrl + Alt + Q** 呼出，选择提示词，写入原来的输入框。

A Windows radial prompt menu for game concept art and visual creation. Press **Ctrl + Alt + Q**, choose a prompt, and insert it into the input field you were using.

[中文说明](#中文说明) · [English](#english) · [下载 / Downloads](https://github.com/zhangye2315673-hub/prompt-halo/releases)

## 界面预览 · Preview

![QEA CueRing 词环：六个提示词扇区、中心操作按钮与绿色悬停反馈 / Six prompt sectors, center controls, and green hover feedback](docs/images/cue-ring-preview.png)

实际界面截图：深灰紫底色、亮绿选中反馈，常用操作集中在圆环内。  
Actual application screenshot: charcoal-purple sectors, bright green hover feedback, and controls within the ring.

## 中文说明

### 能做什么

- **快捷调用**：在目标输入框放置光标，按快捷键呼出圆环，点击扇区调用提示词。
- **集中编辑**：点击中心的笔，再选择扇区，编辑对应内容。
- **扩展词库**：通过中心按钮新增提示词、切换外圈。
- **本地保存**：提示词保存在本机，支持导入、导出和历史备份恢复。
- **减少误操作**：编辑未保存时提供确认；调用时保留目标窗口与焦点校验。

### 下载与启动

前往 **[GitHub Releases](https://github.com/zhangye2315673-hub/prompt-halo/releases)**，在附件中选择：

| 下载文件 | 使用方式 |
| --- | --- |
| `QEA-CueRing-…-windows-x64-setup.exe` | 安装一次，以后从桌面或开始菜单打开。 |
| `QEA-CueRing-…-windows-x64.zip` | 完整解压一次，双击文件夹内的 `QEA CueRing.exe`。 |

免安装版需要保留整个文件夹，不能只移动 EXE。GitHub 自动提供的 **Source code** 压缩包是源码，不是应用程序。

### 快速上手

1. 在你要输入文字的位置放置光标。
2. 按 **Ctrl + Alt + Q** 呼出圆环。
3. 点击所需提示词扇区，内容写入原输入框。
4. 按 **Esc** 关闭圆环。

中心按钮分别用于**新增、编辑、外圈切换**。托盘右键提供**打开圆环、导出词库、导入词库、恢复历史备份、退出**。

### 数据、更新与故障

- 个人词库位于 `%APPDATA%/prompt-halo`，安装版与免安装版共用这一目录。
- 自动备份位于其下的 `library-backups`，保留最近十份。分享导出文件前，请检查其中的提示词内容。
- 更新前先从托盘退出旧版。免安装版解压到新的空文件夹，安装版沿用原安装路径。
- 普通使用无需安装 Node.js、npm 或 Python。输入助手使用系统 Windows PowerShell 和 .NET/UIAutomation。
- 快捷键被占用时，可先从托盘打开；关闭冲突程序后重启。
- 启动失败会显示错误和 `startup-error.txt` 路径。反馈问题请附版本、Windows 版本、操作步骤和错误信息。

## English

### Features

- **Quick access** — Focus an input field, summon the ring, and click a sector to insert a prompt.
- **In-ring editing** — Click the center pen, then select a sector to edit its prompt.
- **Expandable library** — Add prompts and toggle the outer ring using the center controls.
- **Local storage** — Keep prompts on your computer, with import, export, and backup recovery.
- **Editing safeguards** — Confirm unsaved changes before closing; insertion checks the original target window and focus.

### Download and launch

Open **[GitHub Releases](https://github.com/zhangye2315673-hub/prompt-halo/releases)** and choose an attached application package:

| File | How to use |
| --- | --- |
| `QEA-CueRing-…-windows-x64-setup.exe` | Install once, then launch from the desktop or Start menu. |
| `QEA-CueRing-…-windows-x64.zip` | Extract the entire archive once and run `QEA CueRing.exe` inside. |

Keep the entire extracted folder together. The EXE requires its accompanying files. GitHub's automatic **Source code** archives contain the source, not a ready-to-run application.

### Quick start

1. Place the cursor in the input field you want to use.
2. Press **Ctrl + Alt + Q** to open the ring.
3. Click a prompt sector to insert its text into that field.
4. Press **Esc** to close the ring.

The center controls provide **Add, Edit, and Toggle outer ring**. Right-click the tray icon to **open the ring, export or import your library, restore a backup, or quit**.

### Data, updates, and troubleshooting

- Personal data lives in `%APPDATA%/prompt-halo`. Installed and ZIP versions share this directory.
- The `library-backups` subfolder keeps the ten most recent automatic backups. Review exported prompt content before sharing it.
- Quit the existing app before updating. Extract ZIP updates into a new empty folder; use the existing installation path for installer updates.
- Regular use does not require Node.js, npm, or Python. The input helper uses Windows PowerShell and .NET/UIAutomation.
- If another app occupies the shortcut, use the tray menu, resolve the conflict, and restart CueRing.
- Startup errors show a message and the location of `startup-error.txt`. When reporting a problem, include the app version, Windows version, reproduction steps, and error message.

## 开发与构建 · Development

```powershell
npm ci
npm run desktop
npm run build:win
npm run build:release
```

- `build:win`：更新 `release/win-unpacked` 目录版。 / Builds the unpacked application directory.
- `build:release`：生成 Windows 安装包。 / Builds the Windows installer.
- 构建前退出应用。 / Quit the app before building.

### 检查 · Checks

```powershell
npm run test:input-contract
npm run test:menu
node tests/library.cjs
node tests/dirty-close.cjs
```

自动检查用于保护输入实现、菜单生命周期和词库逻辑；目标应用中的实际输入仍需实机验证。  
Automated checks cover input implementation safeguards, menu lifecycle, and library logic. Actual insertion into target applications requires native testing.

## 许可与说明 · Licensing and notes

项目尚未选定开源许可证。第三方声明见 [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt)；分发应用时保留随包提供的 Electron 与 Chromium 许可文件。  
An open-source license has not yet been selected for this project. See [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt) for third-party notices, and retain the bundled Electron and Chromium license files when redistributing the application.

[版本说明 / Release notes](docs/release-0.2.0.md)
