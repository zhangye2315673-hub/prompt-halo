const { app, BrowserWindow, screen } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { spawn, execFile } = require('node:child_process');
const { promisify } = require('node:util');
const run = promisify(execFile);
const scratch = fs.mkdtempSync(path.join(os.tmpdir(),'halo-native-test-'));
app.setPath('userData',path.join(scratch,'app'));
const api=require('./main.cjs');
let receiver;
const useChrome=process.argv.includes('--chrome');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(check, message, timeout=6000){const end=Date.now()+timeout;while(!(await check())){if(Date.now()>end)throw Error(message);await wait(35);}}
const driver=(...args)=>run('powershell.exe',['-NoProfile','-NonInteractive','-File',path.join(__dirname,'../tests/native-driver.ps1'),...args],{windowsHide:true});
async function test(){
 await app.whenReady();
 await until(()=>BrowserWindow.getAllWindows().length===1,'windows');
 const windows=BrowserWindow.getAllWindows();
 await until(()=>windows.every(w=>!w.webContents.isLoading()),'load');
 const overlay=windows.find(w=>w.webContents.getURL().endsWith('#overlay'));
 const resultFile=path.join(scratch,'receiver.json');
 receiver=spawn(useChrome?'C:/Program Files/nodejs/node.exe':process.execPath,[path.join(__dirname,useChrome?'../tests/chrome-receiver.cjs':'external-receiver.cjs')],{windowsHide:true,env:{...process.env,PROMPT_HALO_RECEIVER_RESULT:resultFile},stdio:['ignore','ignore','pipe']});
 receiver.stderr.on('data',()=>{});
 function data(){try{return JSON.parse(fs.readFileSync(resultFile,'utf8'));}catch{return {};}}
 await until(()=>data().ready,'receiver ready');
 let receiverInfo=data();
 if(useChrome){
  const out=await driver('-Action','test-title','-Title',receiverInfo.title);
  receiverInfo=JSON.parse(out.stdout.trim());
 }else{await driver('-Action','focus','-Handle',String(receiverInfo.pid));}
 await until(async()=>{const state=await api.getForegroundState();return state.pid===receiverInfo.pid&&state.hwnd===receiverInfo.hwnd;},'test setup: unrelated app is foreground, no input attempted');
 const receiverHwnd=receiverInfo.hwnd;
 const hold=process.argv.includes('--hold')?'650':'100';
 await driver('-Action','summon','-Handle',receiverHwnd,'-HoldMs',hold);
 await until(()=>overlay.isVisible(),'real hotkey did not show overlay');
 await until(()=>api.getDiagnostics().some(e=>e.stage==='target-captured'),'target capture did not complete');
 const captured=api.getDiagnostics().filter(e=>e.stage==='target-captured').at(-1);
 if(!captured||captured.hwnd!==receiverHwnd)throw Error('test interrupted during hotkey: wrong receiver captured, no selection attempted');
 await until(()=>overlay.webContents.executeJavaScript("document.querySelector('#halo').classList.contains('show')"),'halo paint');
 async function click(selector){const r=await overlay.webContents.executeJavaScript(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);const b=overlay.getContentBounds(); const p=screen.dipToScreenPoint({x:Math.round(b.x+r.x),y:Math.round(b.y+r.y)});await driver('-Action','click','-Handle',overlay.getNativeWindowHandle().readBigUInt64LE().toString(),'-X',String(p.x),'-Y',String(p.y));}
 const blurBaseline=data().blurs;
 const search=process.argv.includes('--search');
 if(search){
  await click('[data-action="search"]');
  await until(()=>overlay.isFocused(),'search did not get keyboard focus');
  await until(()=>overlay.webContents.executeJavaScript("document.activeElement?.id==='haloSearch'"),'search field not ready');
  overlay.webContents.sendInputEvent({type:'char',keyCode:'2'});
  await until(()=>overlay.webContents.executeJavaScript("document.querySelector('#haloSearch').value==='2'"),'search digit used as shortcut');
  overlay.webContents.sendInputEvent({type:'keyDown',keyCode:'Backspace'});
  overlay.webContents.sendInputEvent({type:'keyUp',keyCode:'Backspace'});
 }else{
  await click('[data-action="recent"]');
  if(![receiverHwnd,overlay.getNativeWindowHandle().readBigUInt64LE().toString()].includes((await api.getForegroundState()).hwnd))throw Error('unrelated window foreground; abort test');
 }
 await until(()=>overlay.webContents.executeJavaScript("!!document.querySelector('#haloPanel [data-prompt]')"),'recent menu');
 const expected=await overlay.webContents.executeJavaScript("(()=>{const p=prompts.find(p=>p.id===document.querySelector('#haloPanel [data-prompt]').dataset.prompt);return p.content+'\\n\\n'+p.suffixes.join(', ')})()");
 if((useChrome && (data().value!=='BEFOREAFTER'||data().pastes!==0))||(!useChrome && data().value!==''))throw Error('test interrupted: receiver text changed before menu selection; abort '+JSON.stringify(data()));
 await click('#haloPanel [data-prompt]');
 await until(()=>data().value===(useChrome?'BEFORE'+expected+'AFTER':expected),'target does not exactly match expected result').catch(error=>{throw Error(error.message+'; fixture='+JSON.stringify(data()));});
 if((await api.getForegroundState()).hwnd!==receiverHwnd)throw Error('original target was not restored');
 if(useChrome && (data().pastes!==1||data().other!=='DO NOT CHANGE'))throw Error('duplicate paste or wrong input');
 if(overlay.isVisible())throw Error('overlay still visible');
 await driver('-Action','summon','-Handle',receiverHwnd);
 await until(()=>overlay.isVisible(),'reopen failed');
 await driver('-Action','escape','-Handle',receiverHwnd);
 await until(()=>!overlay.isVisible(),'Escape did not close');
 if(useChrome && data().pastes!==1)throw Error('Escape inserted content');
 console.log(JSON.stringify({ok:true,reopened:true,escape:true,realHotkey:true,realMouse:true,chrome:useChrome,search,holdMs:Number(hold),chars:data().value.length,diagnostics:api.getDiagnostics()}));
}
test().then(()=>cleanup(0),e=>{console.error(e.message,JSON.stringify(api.getDiagnostics()));cleanup(1)});
async function cleanup(code){if(receiver){try{await run('taskkill.exe',['/PID',String(receiver.pid),'/T','/F'],{windowsHide:true});}catch{}} app.exit(code);}
