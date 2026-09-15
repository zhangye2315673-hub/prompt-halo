const { app, BrowserWindow, globalShortcut, clipboard, ipcMain, screen, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { WindowsInput } = require('./windows-input.cjs');
const buildFiles = ['main.cjs','preload.cjs','windows-input.cjs','windows-input.cs','windows-input.ps1','../app.js','../style.css'];
const build = crypto.createHash('sha256').update(buildFiles.map(f => fs.readFileSync(path.join(__dirname,f))).join('')).digest('hex').slice(0,12);
const diagnosticFile = path.join(app.getPath('userData'), 'input-diagnostics.json');
let haloWindow, tray, inputService, ready, devWatcher, devReloadTimer;
let startupReady=false;
let session = null, opening = false, injecting = false, quitting = false, monitor = null;
let diagnosticEvents = [];
let diagnosticTimer;
const handle = win => win?.getNativeWindowHandle().readBigUInt64LE().toString();
function trace(stage, data = {}) {
  diagnosticEvents.push({time:new Date().toISOString(),stage,...data});
  diagnosticEvents = diagnosticEvents.slice(-60);
  // Bounded local diagnostic metadata. No prompt text, clipboard contents or window titles.
  clearTimeout(diagnosticTimer);
  diagnosticTimer=setTimeout(()=>{fs.promises.mkdir(path.dirname(diagnosticFile),{recursive:true}).then(()=>fs.promises.writeFile(diagnosticFile,JSON.stringify({build,pid:process.pid,events:diagnosticEvents},null,2))).catch(()=>{});},100);
}
function failure(reason) {
  trace('failed',{reason});
  tray?.displayBalloon({title:'Prompt Halo 未完成输入',content:reason,iconType:'error'});
  return {ok:false,reason};
}
const locked = app.requestSingleInstanceLock();
if (!locked) app.quit();
function createTrayIcon() {
  const size = 16;
  const pixels = Buffer.alloc(size * size * 4, 0);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const dx = x - 7.5; const dy = y - 7.5; const d = Math.sqrt(dx * dx + dy * dy);
    const alpha = d > 5.7 && d < 7.2 ? 255 : d < 3.1 ? 255 : 0;
    const i = (y * size + x) * 4;
    pixels[i] = 125; pixels[i + 1] = 226; pixels[i + 2] = 189; pixels[i + 3] = alpha;
  }
  return nativeImage.createFromBitmap(pixels, { width: size, height: size });
}

function createWindows() {
  const webPreferences = {preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,backgroundThrottling:false};
  haloWindow = new BrowserWindow({width:860,height:600,transparent:true,frame:false,resizable:false,movable:false,alwaysOnTop:true,skipTaskbar:true,hasShadow:false,show:false,backgroundColor:'#00000000',focusable:true,webPreferences});
  haloWindow.on('close',e=>{if(!quitting){e.preventDefault();hideHalo('close');}});
  // Screenshot overlays temporarily take focus. Blur alone is not dismissal;
  // explicit close/outside-click and the accepted paste ownership checks remain.
  haloWindow.on('blur',()=>{if(session && !injecting)trace('blur-retained');});
  haloWindow.webContents.on?.('did-finish-load',()=>{
    if(session)haloWindow.webContents.send('prompt-halo:show',{sessionId:session.id,phase:session.phase,build});
  });
  return haloWindow.loadFile(path.join(__dirname,'../index.html'),{hash:'overlay'});
}
function watchDevFiles(){
  if(process.env?.NODE_ENV==='production')return;
  const root=path.join(__dirname,'..');
  devWatcher=fs.watch(root,{persistent:false},(_,file)=>{
    if(!file || !/^(app|style|index)\.((js|css|html))$/.test(String(file)) || injecting)return;
    clearTimeout(devReloadTimer);devReloadTimer=setTimeout(()=>{if(!haloWindow?.isDestroyed())haloWindow.webContents.reloadIgnoringCache();},120);
  });
}
function positionHalo() {
  const point=screen.getCursorScreenPoint(), b=screen.getDisplayNearestPoint(point).workArea;
  haloWindow.setPosition(Math.round(Math.max(b.x,Math.min(point.x-430,b.x+b.width-860))),Math.round(Math.max(b.y,Math.min(point.y-300,b.y+b.height-600))));
}
function stopMonitor(){clearTimeout(monitor);monitor=null;}
function pollOutside() {
  stopMonitor();
  if(!session || injecting)return;
  const active=session;
  monitor=setTimeout(async()=>{
    try {
      const state=await inputService.request('state');
      if(active!==session)return;
      const p=screen.getCursorScreenPoint(),b=haloWindow.getBounds();
      const outside=p.x<b.x||p.y<b.y||p.x>=b.x+b.width||p.y>=b.y+b.height;
      if(state.leftButton && outside){hideHalo('outside-click');return;}
    } catch(error){trace('monitor-error',{reason:error.message});}
    pollOutside();
  },80);
}
function updateTarget(active, phase, reason='') {
  if(session!==active)return;
  active.phase=phase;active.reason=reason;
  haloWindow.webContents.send('prompt-halo:target',{sessionId:active.id,phase,reason,processName:active.target?.processName||''});
}
function raiseHalo() {
  if(haloWindow.isMinimized())haloWindow.restore();
  haloWindow.setAlwaysOnTop(true,'screen-saver');
  haloWindow.showInactive();
  // Showing an already-visible window does not repair its native z-order.
  haloWindow.moveTop();
}
async function showHalo() {
  if(opening || injecting)return;
  if(session){
    // An explicit summon also repairs a hidden/minimized window, preserving the
    // captured target and unsaved editor instead of treating it as toggle-close.
    raiseHalo();
    trace('reshown');return;
  }
  opening=true;
  const started=performance.now();
  try {
    if(!startupReady) await ready;
    const active={id:crypto.randomUUID(),target:null,keyboard:false,phase:'checking'};
    session=active;
    const capture=inputService.request('state');
    positionHalo();
    haloWindow.webContents.send('prompt-halo:show',{sessionId:active.id,phase:'checking',build});
    raiseHalo();
    globalShortcut.register('Escape',()=>hideHalo('escape'));
    trace('opened',{nonactivating:true,showRequestedMs:Math.round(performance.now()-started)});
    // No menu lifetime or cancellation depends on the accessibility request.
    active.capture=capture.then(target=>{
      if(session!==active)return;
      active.target=target;
      trace('target-captured',{hwnd:target.hwnd,pid:target.pid,focus:target.focus,processName:target.processName,editorConfirmed:!!target.editorToken,sessionId:active.id,captureMs:Math.round(performance.now()-started)});
      const valid=target.hwnd!=='0' && target.hwnd!==handle(haloWindow);
      updateTarget(active,valid?'ready':'blocked',valid?'':'未确认网页输入框：可以浏览词库；请关闭后点击聊天框再呼出。');
      pollOutside();
    },error=>{
      if(session!==active)return;
      updateTarget(active,'blocked','输入服务未就绪：可继续浏览，点击中央 × 或 Esc 关闭。');
      trace('capture-failed',{reason:error.message});
    });
  } catch(error){failure(error.message);} finally{opening=false;}
}
function hideVisuals() {
  stopMonitor();globalShortcut.unregister('Escape');
  haloWindow?.hide();haloWindow?.webContents.send('prompt-halo:hide');
  haloWindow?.setFocusable(true);
}
function hideHalo(reason='cancel') {
  trace('closed',{reason});session=null;hideVisuals();
}
async function toggleHalo(){if(haloWindow?.isVisible?.()&&!haloWindow?.isMinimized?.())hideHalo('toggle');else await showHalo();}
async function acquireKeyboard() {
  const active=session;
  if(!active)return {ok:false,reason:'菜单已关闭'};
  if(active.phase==='checking')return {ok:false,reason:'正在检查输入目标，请稍候再点击搜索'};
  active.keyboard=true;haloWindow.setFocusable(true);haloWindow.focus();
  trace('search-focused');return {ok:true};
}
async function pasteIntoPreviousApp(text, sessionId) {
  if(injecting)return {ok:false,reason:'输入正在处理中'};
  const active=session;
  if(!active || active.id!==sessionId)return {ok:false,reason:'这次菜单已失效，请重新呼出'};
  if(active.phase!=='ready')return {ok:false,keepOpen:true,reason:active.phase==='checking'?'正在检查输入目标，请稍候再选择':active.reason};
  if(typeof text!=='string'||!text.length||text.length>20000)return {ok:false,keepOpen:true,reason:'提示词为空或超过 20000 字符'};
  injecting=true;session=null;
  trace('selected',{chars:text.length,sessionId});stopMonitor();
  try {
    // Inspect while the menu is still visible: hiding it can activate a third window.
    const current=await inputService.request('state');
    const fromMenu=current.hwnd===handle(haloWindow);
    const fromTarget=current.hwnd===active.target.hwnd;
    trace('restore-request',{fromHwnd:current.hwnd,targetHwnd:active.target.hwnd,fromMenu});
    if(!fromMenu && !fromTarget)return failure('已切换到其他应用，已取消输入。');
    if(fromTarget && current.focus!==active.target.focus)return failure('原窗口的输入控件已改变，已取消输入。');
    // Keep ownership until Windows has explicitly restored the captured target.
    const restored=await inputService.request('activate',{hwnd:active.target.hwnd,pid:active.target.pid,focus:active.target.focus});
    if(!restored.ok)return failure('未能恢复原输入窗口，已取消输入。');
    hideVisuals();
    const confirmed=await inputService.request('state');
    if(confirmed.hwnd!==active.target.hwnd || confirmed.focus!==active.target.focus)return failure('恢复后焦点再次改变，已取消输入。');
    clipboard.writeText(text);
    const result=await inputService.request('paste',{hwnd:active.target.hwnd,pid:active.target.pid,focus:active.target.focus});
    trace('input-result',{...result,nativeStage:result.stage,stage:'input-result'});
    if(!result.ok)return failure('目标窗口未接受输入，请重新点击目标输入框后重试。');
    return {ok:true,mode:'clipboard-paste',verified:false};
  } catch(error){return failure(error.message);} finally{hideVisuals();injecting=false;}
}
function createTray() {
  tray=new Tray(createTrayIcon());tray.setToolTip('Prompt Halo · '+build);
  tray.setContextMenu(Menu.buildFromTemplate([
    {label:'打开圆环 · 分类中可新增提示词',click:showHalo},
    {label:'呼出 Halo',click:showHalo},
    {label:'打开输入诊断',click:()=>shell.openPath(diagnosticFile)},
    {label:'版本 '+build,enabled:false},
    {type:'separator'},
    {label:'退出 Prompt Halo',click:()=>app.quit()}
  ]));tray.on('click',toggleHalo);
}
if(locked){
  ready=app.whenReady().then(async()=>{
    inputService=new WindowsInput();
    ipcMain.handle('prompt-halo:insert',(e,text,id)=>e.sender===haloWindow?.webContents?pasteIntoPreviousApp(text,id):{ok:false,reason:'请从目标应用中呼出菜单'});
    ipcMain.handle('prompt-halo:toggle',toggleHalo);
    ipcMain.handle('prompt-halo:hide-overlay',()=>hideHalo());
    ipcMain.handle('prompt-halo:keyboard',acquireKeyboard);
    ipcMain.handle('prompt-halo:diagnostics',()=>({build,pid:process.pid,path:diagnosticFile,events:diagnosticEvents}));

    await Promise.all([createWindows(),inputService.ready]);watchDevFiles();createTray();
    const shortcut=globalShortcut.register('Ctrl+Alt+Q',toggleHalo);
    startupReady=true;
    trace('ready',{shortcut,accelerator:'Ctrl+Alt+Q',helperReady:true,build});
    if(!shortcut)failure('Ctrl + Alt + Q 被其他程序占用，可从托盘呼出。');
  });
  ready.catch(e=>{console.error('Halo startup failed:',e.message);app.exit(1);});
  app.on('second-instance',()=>{showHalo();});
}
app.on('before-quit',()=>{quitting=true;stopMonitor();devWatcher?.close();clearTimeout(devReloadTimer);});
app.on('will-quit',()=>{globalShortcut.unregisterAll();inputService?.stop();});
app.on('window-all-closed',()=>{});
module.exports={showHalo,hideHalo,toggleHalo,pasteIntoPreviousApp,getForegroundState:()=>inputService?.request('state'),getDiagnostics:()=>diagnosticEvents};






