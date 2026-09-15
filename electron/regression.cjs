const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { spawn } = require('node:child_process');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-halo-regression-')));
const mainApi = require('./main.cjs');
function fail(message) { throw new Error(message); }
async function wait(ms = 50) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function until(check, timeout = 6000) { const end = Date.now() + timeout; while (!(await check())) { if (Date.now() > end) fail('Timed out'); await wait(30); } }
async function main() {
  await app.whenReady();
  await until(() => BrowserWindow.getAllWindows().length === 1);
  const haloWindows = BrowserWindow.getAllWindows();
  await until(() => haloWindows.every(w => !w.webContents.isLoading()));
  const overlay = haloWindows.find(w => w.getSize()[0] === 560);
  const resultFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-halo-receiver-result-')), 'result.json');
  const receiver = spawn(process.execPath, [path.join(__dirname, 'external-receiver.cjs')], { windowsHide: false, env: { ...process.env, PROMPT_HALO_RECEIVER_RESULT: resultFile }, stdio: ['ignore', 'pipe', 'pipe'] });
  let receiverStderr = ''; receiver.stderr.on('data', data => { receiverStderr += String(data); });
  await until(() => fs.existsSync(resultFile), 3000);
  const receiverInfo = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  await until(async () => (await mainApi.getForegroundState())?.pid === receiverInfo.pid);
  const foreground = await mainApi.getForegroundState();
  if (foreground.hwnd !== receiverInfo.hwnd) fail(`focus window mismatch: ${JSON.stringify({ foreground, receiverInfo })}`);
  if (haloWindows.some(w => w.isVisible())) fail('Prompt Halo window visible before summon');
  await mainApi.showHalo();
  await until(() => overlay.isVisible());
  const evalInOverlay = code => overlay.webContents.executeJavaScript(code);
  await until(() => evalInOverlay("document.querySelector('#halo').classList.contains('show')"));
  await evalInOverlay("document.querySelector('#halo .action-right').click()");
  await evalInOverlay("document.querySelector('#haloPanel [data-category=\\\"图像编辑\\\"]').click()");
  await evalInOverlay("document.querySelector('#haloPanel [data-prompt]').click()");
  await until(() => !overlay.isVisible());
  await until(() => fs.existsSync(resultFile), 2500).catch(error => { throw new Error(`${error.message}; receiverStderr=${receiverStderr}; receiverInfo=${JSON.stringify(receiverInfo)}`); });
  await until(() => { try { const data = JSON.parse(fs.readFileSync(resultFile, 'utf8')); return typeof data.value === 'string' && data.value.length > 0; } catch { return false; } }, 3000).catch(error => { throw new Error(`${error.message}; receiverStderr=${receiverStderr}; result=${fs.readFileSync(resultFile, 'utf8')}`); });
  const value = JSON.parse(fs.readFileSync(resultFile, 'utf8')).value;
  if (!value || !value.includes('cinematic character key art')) fail(`external target did not receive prompt: ${JSON.stringify(value)}`);
  console.log(JSON.stringify({ ok: true, crossProcess: true, startsHidden: true, injectedChars: value.length, closesAfterInsert: true }));
  receiver.kill(); app.quit(); setTimeout(() => process.exit(0), 250);
}
main().catch(error => { console.error(error.stack || error); app.exit(1); setTimeout(() => process.exit(1), 250); });
