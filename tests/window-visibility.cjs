const {app,BrowserWindow,ipcMain,screen}=require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawn,execFile}=require('node:child_process'),{promisify}=require('node:util');
const run=promisify(execFile),scratch=fs.mkdtempSync(path.join(os.tmpdir(),'halo-visibility-'));
app.setPath('userData',path.join(scratch,'profile'));process.env.NODE_ENV='production';
const api=require('../electron/main.cjs');let receiver,cover;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,msg){for(let i=0;i<160;i++){if(await fn())return;await wait(40);}throw Error(msg);}
const driver=(...args)=>run('powershell.exe',['-NoProfile','-NonInteractive','-File',path.join(__dirname,'native-driver.ps1'),...args],{windowsHide:true});
async function test(){
 await app.whenReady();await until(()=>BrowserWindow.getAllWindows().length===1&&api.getDiagnostics().some(e=>e.stage==='ready'),'app not ready');
 const overlay=BrowserWindow.getAllWindows()[0];
 const js=s=>overlay.webContents.executeJavaScript(s);
 const resultFile=path.join(scratch,'receiver.json');
 receiver=spawn(process.execPath,[path.join(__dirname,'../electron/external-receiver.cjs')],{windowsHide:true,env:{...process.env,PROMPT_HALO_RECEIVER_RESULT:resultFile},stdio:'ignore'});
 const data=()=>{try{return JSON.parse(fs.readFileSync(resultFile,'utf8'));}catch{return {};}};
 await until(()=>data().ready,'receiver not ready');
 await driver('-Action','focus','-Handle',String(data().pid));
 await until(async()=>(await api.getForegroundState()).hwnd===data().hwnd,'test receiver not foreground');
 await api.showHalo();await until(()=>api.getDiagnostics().some(e=>e.stage==='target-captured'),'target not captured');
 assert.equal(api.getDiagnostics().findLast(e=>e.stage==='target-captured').hwnd,data().hwnd);
 await until(()=>js("!!rayMenu.isOpen"),'renderer not open');
 await js('openEditor()');await until(()=>js('!editor.hidden'),'editor not ready');
 await js("$('titleInput').value='KEEP DRAFT';$('contentInput').value='KEEP CONTENT'");
 await until(()=>overlay.isFocused(),'editor not focused');
 const sessionId=await js('nativeSessionId');
 // Native window takes focus like a screenshot overlay; no synthetic blur event.
 cover=new BrowserWindow({width:320,height:100,x:0,y:0,alwaysOnTop:true,show:false,skipTaskbar:true});
 await cover.loadURL('data:text/html,<body style="background:%23252b34;color:white">Halo focus interruption test</body>');
 cover.show();cover.focus();await until(()=>cover.isFocused(),'focus interruption not established');
 await wait(350);assert(overlay.isVisible(),'blur hid the menu');
 // Force a real z-order regression: the visible overlay is behind an overlapping topmost window.
 const bounds=overlay.getBounds();cover.setBounds(bounds);cover.setAlwaysOnTop(true);cover.moveTop();
 const zScript=path.join(scratch,'z-order.ps1');
 fs.writeFileSync(zScript,`param([long]$Above,[long]$Below)
Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public class HaloZ { [DllImport("user32.dll")] public static extern IntPtr GetTopWindow(IntPtr p); [DllImport("user32.dll")] public static extern IntPtr GetWindow(IntPtr p,uint c); }'
$p=[HaloZ]::GetTopWindow([IntPtr]::Zero)
while($p -ne [IntPtr]::Zero){if($p.ToInt64() -eq $Above){'true';exit};if($p.ToInt64() -eq $Below){'false';exit};$p=[HaloZ]::GetWindow($p,2)}
throw 'windows missing'`);
 const inFront=async()=>{const r=await run('powershell.exe',['-NoProfile','-NonInteractive','-File',zScript,'-Above',overlay.getNativeWindowHandle().readBigUInt64LE().toString(),'-Below',cover.getNativeWindowHandle().readBigUInt64LE().toString()],{windowsHide:true});return r.stdout.trim()==='true';};
 assert(!(await inFront()),'fixture must place another window above Halo');
 await api.showHalo();
 assert(await inFront(),'explicit summon must raise Halo above the overlapping window');
 for(let i=0;i<4;i++){
  cover.moveTop();cover.focus();await until(()=>cover.isFocused(),'cover focus failed');
  await api.showHalo();assert(await inFront(),'repeated summon must restore z-order');
  assert(cover.isFocused(),'raising must not steal keyboard focus');
 }
 cover.hide();await wait(100);
 assert(await js("!editor.hidden && $('titleInput').value==='KEEP DRAFT'"),'draft lost after blur');
 overlay.minimize();await until(()=>overlay.isMinimized(),'minimize fixture failed');
 await api.toggleHalo();await until(()=>overlay.isVisible()&&!overlay.isMinimized(),'one summon did not recover minimized menu');
 overlay.hide();await api.showHalo();assert(overlay.isVisible(),'explicit show did not recover hidden menu');
 assert.equal(await js('nativeSessionId'),sessionId);assert(await js("$('titleInput').value==='KEEP DRAFT'"));
 await js("$('editorCancel').click()");await until(()=>js('editor.hidden && rayMenu.isOpen'),'cancel failed');
 overlay.focus();await until(async()=>(await api.getForegroundState()).hwnd===overlay.getNativeWindowHandle().readBigUInt64LE().toString(),'overlay not foreground');
 fs.writeFileSync(path.join(scratch,'recovered.png'),(await overlay.webContents.capturePage()).toPNG());
 const expected=await js("prompts[0].content+'\\n\\n'+prompts[0].suffixes.join(', ')");
 const result=await api.pasteIntoPreviousApp(expected,sessionId);assert(result.ok,JSON.stringify(result));
 await until(()=>data().value===expected,'external receiver text mismatch');
 assert.equal((await api.getForegroundState()).hwnd,data().hwnd);assert(!overlay.isVisible());
 console.log('PASS: repeated native z-order recovery without stealing focus; native focus interruption retains visible editor; minimize/hidden recovery keeps draft and target; actual external receiver text matches; original foreground restored');
 console.log('SCREENSHOT '+path.join(scratch,'recovered.png'));
}
test().then(()=>finish(0),e=>{console.error(e);finish(1);});
async function finish(code){cover?.destroy();if(receiver){try{await run('taskkill.exe',['/PID',String(receiver.pid),'/T','/F'],{windowsHide:true});}catch{}}app.exit(code);}
