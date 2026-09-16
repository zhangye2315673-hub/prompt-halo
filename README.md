# QEA CueRing｜词环

为游戏原画工作流设计的 Windows 提示词圆环。按 **Ctrl + Alt + Q** 呼出，选择提示词后写入原输入框。

## 下载使用

在本仓库 **Releases** 下载应用，不要把 GitHub 的 Source code ZIP 当成应用安装包。

- **安装版**：下载 `QEA-CueRing-0.2.0-beta.1-windows-x64-setup.exe`，安装一次，以后从桌面或开始菜单打开。
- **免安装版**：下载 `QEA-CueRing-0.2.0-beta.1-windows-x64.zip`，完整解压一次，双击文件夹里的 `QEA CueRing.exe`。不要单独移动 EXE。
- 更新前从托盘退出旧版；免安装版解压到新的空文件夹。安装版按原路径更新。不要同时运行两个版本。

这是预发布测试版，目标为 Windows 10/11 x64；其他电脑尚未完成真实输入验收。EXE 暂未数字签名。不支持宣称 ARM、32 位和 Windows 7/8 兼容。

## 操作

1. 在目标输入框放置光标，按 Ctrl + Alt + Q。
2. 点击提示词扇区调用。Esc 关闭圆环。
3. 中心按钮用于新增、编辑和外圈开关。点击笔后再选扇区进行编辑。
4. 托盘右键提供打开圆环、导出词库、导入词库、恢复历史备份和退出。

## 数据及故障

- 个人词库保留在 `%APPDATA%/prompt-halo`，不随程序包分发。自动备份在该目录的 `library-backups`，保留最近十份。
- 安装版和免安装版使用同一个个人词库目录。卸载默认保留个人词库。
- 快捷键占用会给出提示，可从托盘打开；关闭冲突程序后重启。
- 正常使用无需安装 Node/npm/Python。输入助手依赖系统 Windows PowerShell、.NET/UIAutomation；企业策略限制脚本或动态编译时可能无法启动。
- 启动失败会显示错误和 `startup-error.txt` 路径。故障反馈请提供版本、Windows 版本、操作步骤及错误信息；不要公开完整个人词库。
- 避免向管理员权限运行的应用输入；请先在普通权限记事本或浏览器输入框验证。

## 开发与构建

```powershell
npm ci
npm run desktop
npm run build:win
npm run build:release
```

`build:win` 只更新 `release/win-unpacked`。`build:release` 生成安装包。构建前退出应用。

```powershell
npm run test:input-contract
npm run test:menu
node tests/library.cjs
node tests/dirty-close.cjs
```

隐藏渲染器检查使用独立临时词库。原生输入验收需在实际目标应用中确认文字写入，不能用 DOM 或剪贴板测试代替。

## 许可与发布范围

项目尚未选定开源许可证；本次发布不擅自授予额外的代码、品牌或素材再利用权限。第三方许可见 `THIRD-PARTY-NOTICES.txt`、`LICENSE.electron.txt` 和 `LICENSES.chromium.html`，分发时保留这些文件。

本次验收状态及限制见 `docs/release-0.2.0.md`。历史验收基线保留在 `baselines/`；`release/`、`node_modules/`、`_archive/` 和个人数据不提交源码仓库。
