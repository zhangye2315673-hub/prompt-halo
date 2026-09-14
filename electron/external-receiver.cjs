const { app, BrowserWindow } = require('electron');
const path = require('node:path'); const fs = require('node:fs'); const os = require('node:os'); app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-halo-receiver-')));
let win;
function reply(value) { process.stdout.write(JSON.stringify(value) + '\n'); }
const resultFile = process.env.PROMPT_HALO_RECEIVER_RESULT;
app.whenReady().then(async () => {
  win = new BrowserWindow({ width: 600, height: 240, show: true, backgroundColor: '#ffffff', webPreferences: { contextIsolation: true, nodeIntegration: false } });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent('<textarea id="target" autofocus style="width:560px;height:180px"></textarea>'));
  win.show(); win.focus();
  await win.webContents.executeJavaScript("document.querySelector('#target').focus(); document.querySelector('#target').value='';");
  const ready = { ready: true, pid: process.pid, hwnd: win.getNativeWindowHandle().readBigUInt64LE().toString() }; reply(ready); if (resultFile) require('node:fs').writeFileSync(resultFile, JSON.stringify({ ...ready, value: '' })); setInterval(async () => { if (!resultFile || !win || win.isDestroyed()) return; try { const value = await win.webContents.executeJavaScript("document.querySelector('#target').value"); require('node:fs').writeFileSync(resultFile, JSON.stringify({ ...ready, value })); } catch {} }, 80);
});
