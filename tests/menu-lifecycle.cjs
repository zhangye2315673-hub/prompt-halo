const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../electron/main.cjs'),'utf8');
const tick=()=>new Promise(r=>setImmediate(r));
async function harness(){
 let capturing=true,current={hwnd:"99",focus:"99",leftButton:false};
 const windows=[], captures=[], calls=[], handlers=new Map(), ipcHandlers=new Map();
 class W {constructor(){this.visible=false;this.minimized=false;this.listeners=new Map();this.events=[];windows.push(this);this.webContents={send:(...args)=>this.events.push(args)};}on(name,fn){this.listeners.set(name,fn);}emit(name){this.listeners.get(name)?.();}isVisible(){return this.visible;}isMinimized(){return this.minimized;}restore(){this.minimized=false;}loadFile(){return Promise.resolve();}getNativeWindowHandle(){const b=Buffer.alloc(8);b.writeBigUInt64LE(BigInt(windows.indexOf(this)+1));return b;}setPosition(){}setFocusable(){}setAlwaysOnTop(){}moveTop(){}showInactive(){this.visible=true;}show(){this.visible=true;}hide(){this.visible=false;}focus(){}getBounds(){return {x:0,y:0,width:860,height:600};}}
 class Input {constructor(){this.ready=Promise.resolve();}request(action,args){calls.push({action,args});if(action==='state'&&capturing){capturing=false;return new Promise((resolve,reject)=>captures.push({resolve,reject}));}if(action==='state')return Promise.resolve(current);if(action==='activate'){current={hwnd:args.hwnd,focus:args.focus};return Promise.resolve({ok:true});}return Promise.resolve({ok:true,stage:'input-dispatched'});}stop(){}}
 const app={getPath:()=>__dirname,requestSingleInstanceLock:()=>true,whenReady:()=>Promise.resolve(),on(){},quit(){},exit(){}};
 const electron={app,BrowserWindow:W,globalShortcut:{register:(k,f)=>{handlers.set(k,f);return true;},unregister:k=>handlers.delete(k),unregisterAll(){}},ipcMain:{on:(name,fn)=>ipcHandlers.set(name,fn),handle:(name,fn)=>ipcHandlers.set(name,fn)},screen:{getCursorScreenPoint:()=>({x:100,y:100}),getDisplayNearestPoint:()=>({workArea:{x:0,y:0,width:1920,height:1080}})},Tray:class{setToolTip(){}setContextMenu(){}on(){}displayBalloon(){}},Menu:{buildFromTemplate:x=>x},nativeImage:{createFromPath(){return {resize(){return {};}}}},dialog:{showMessageBox:async()=>({response:0})},shell:{},clipboard:{writeText(){}}};
 const fakeFs={...fs,mkdirSync(){},writeFileSync(){},promises:{mkdir:async()=>{},writeFile:async()=>{}}};
 const context={require:n=>n==='electron'?electron:n===path.resolve(__dirname,'../electron/windows-input.cjs')?{WindowsInput:Input}:n==='node:fs'?fakeFs:n==='./library.cjs'?require('../electron/library.cjs'):require(n),__dirname:path.resolve(__dirname,'../electron'),module:{exports:{}},process:{pid:1},console,Buffer,performance,setTimeout:(f,n)=>{const t=setTimeout(f,n);t.unref();return t;},clearTimeout};
 vm.runInNewContext(source,context);for(let i=0;i<5;i++)await tick();
 return {api:context.module.exports,windows,captures,calls,handlers,ipcHandlers,captureNext(){capturing=true;},setForeground(value){current=value;}};
}
const native={hwnd:'99',pid:9,focus:'99',processName:'Weixin',editorToken:'native'};
const lastDismissal=h=>h.windows[0].events.filter(e=>e[0]==='prompt-halo:dismiss').at(-1)[1].id;
const finishExit=(h,id=lastDismissal(h))=>h.ipcHandlers.get('prompt-halo:dismissed')({sender:h.windows[0].webContents},id);
(async()=>{
 const h=await harness();const opened=h.api.showHalo();assert(h.windows[0].visible,"ready app must show synchronously inside hotkey callback");await tick();assert(h.windows[0].visible,'show must not wait for capture');
 h.captures[0].resolve({...native,processName:'chrome',editorToken:''});await opened;await tick();
 assert(h.windows[0].visible,'failed editor validation must leave menu open');h.api.hideHalo('test');
 h.captureNext();const pending=h.api.showHalo();await tick();h.api.hideHalo('escape');assert(h.windows[0].visible,'cancel keeps visual window until animation ends');
 const staleDismissal=lastDismissal(h);
 h.captureNext();const reopened=h.api.showHalo();await tick();assert(h.windows[0].visible,'reopen must not wait for stale capture');
 finishExit(h,staleDismissal);assert(h.windows[0].visible,'old exit completion cannot hide a reopened session');
 h.captures[1].resolve({...native,editorToken:''});await pending;await tick();assert(h.windows[0].visible,'stale result cannot close new session');
 h.captures[2].resolve(native);await reopened;await tick();
 const id=h.windows[0].events.filter(e=>e[0]==='prompt-halo:show').at(-1)[1].sessionId;
 h.setForeground({hwnd:'1',focus:'1'});
 const result=await h.api.pasteIntoPreviousApp('test',id);assert(result.ok,'native target can select');assert(!h.windows[0].visible,'successful selection hides menu');assert.equal(h.calls.filter(c=>c.action==='paste').length,1);
 assert(!(await h.api.pasteIntoPreviousApp('test',id)).ok,'stale selection rejected');
 h.captureNext();const failed=h.api.showHalo();await tick();h.captures[3].reject(Error('timeout'));await failed;await tick();assert(h.windows[0].visible,'service failure must not flash menu');h.api.hideHalo('escape');
 h.captureNext();await h.api.showHalo();await tick();h.captures[4].resolve(native);await tick();
 const stale=h.windows[0].events.filter(e=>e[0]==='prompt-halo:show').at(-1)[1].sessionId;
 h.setForeground({hwnd:'777',focus:'777'});const before=h.calls.filter(c=>c.action==='activate').length;
 assert(!(await h.api.pasteIntoPreviousApp('must not input',stale)).ok);assert.equal(h.calls.filter(c=>c.action==='activate').length,before,'unrelated app must not be restored or written');
 assert.equal(h.calls.filter(c=>c.action==='paste').length,1,'no second paste');
 // Screenshot overlays take keyboard focus without a user dismissing the menu.
 const captureCase=await harness();await captureCase.api.showHalo();await tick();
 captureCase.captures[0].resolve(native);await tick();
 await captureCase.ipcHandlers.get('prompt-halo:keyboard')();
 const window=captureCase.windows[0];
 const beforeEvents=window.events.length,beforeCalls=captureCase.calls.length;
 window.emit('blur');assert(window.visible,'temporary screenshot blur must retain menu');
 window.visible=false;await captureCase.api.showHalo();assert(window.visible,'explicit summon recovers hidden active session');
 window.minimized=true;await captureCase.api.toggleHalo();assert(window.visible&&!window.minimized,'hotkey recovers minimized menu in one press');
 assert.equal(window.events.length,beforeEvents,'recover preserves editor and renderer state');
 assert.equal(captureCase.calls.length,beforeCalls,'recover never recaptures target');
 const closed=captureCase.api.toggleHalo();assert(window.visible,'native toggle waits for rendered exit');
 await captureCase.ipcHandlers.get('prompt-halo:dismissed')({sender:{}},lastDismissal(captureCase));assert(window.visible,'foreign renderer cannot complete dismissal');
 finishExit(captureCase);await closed;assert(!window.visible,'visible menu hides once renderer finishes');
 captureCase.api.hideHalo('test-end');
 console.log('PASS: menu focus restores target; unrelated foreground rejected;  immediate display, blocked target remains open, cancel, reopen, stale capture, native selection, duplicate prevention, service failure; screenshot blur retention; hidden/minimized recovery');
})().catch(e=>{console.error(e);process.exitCode=1;});
