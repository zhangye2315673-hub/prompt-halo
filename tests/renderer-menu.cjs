const {app,BrowserWindow,ipcMain}=require('electron');
const assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os'),fs=require('node:fs');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'halo-renderer-menu-')));
let win,blocked=true,inserts=0,closes=0;const errors=[];
app.whenReady().then(async()=>{
 ipcMain.handle('test:close',()=>{closes++;win.webContents.send('test:hide');});
 ipcMain.handle('test:insert',(_,text,id)=>{assert.equal(id,'test');if(blocked)return {ok:false,keepOpen:true,reason:'网页编辑框未确认'};inserts++;assert(text.length>0);win.webContents.send('test:hide');return {ok:true};});
 ipcMain.handle('test:keyboard',()=>({ok:false,reason:'请使用分类选择'}));
 win=new BrowserWindow({show:false,width:560,height:360,webPreferences:{preload:path.join(__dirname,'renderer-menu-preload.cjs'),contextIsolation:true,backgroundThrottling:false}});
 win.webContents.on('console-message',(_,level,message)=>{if(level===3)errors.push(message);});
 await win.loadFile(path.join(__dirname,'../index.html'),{hash:'overlay'});
 const js=s=>win.webContents.executeJavaScript(s);
 async function until(s){for(let i=0;i<60;i++){if(await js(s))return;await new Promise(r=>setTimeout(r,25));}throw Error('renderer condition failed: '+s);}
 const show=async()=>{win.webContents.send('test:show',{sessionId:'test'});await until("document.querySelector('#halo').classList.contains('show')");};
 await show();await js("document.querySelector('[data-action=recent]').click()");await until("!!document.querySelector('#haloPanel [data-prompt]')");
 await js("document.querySelector('#haloPanel [data-prompt]').click()");await until("document.querySelector('#haloHint').textContent==='网页编辑框未确认'");assert(await js("document.querySelector('#halo').classList.contains('show')"));
 await js("document.querySelector('#haloCenter').click()");await until("!document.querySelector('#halo').classList.contains('show')");assert.equal(closes,1);
 await show();await js("document.querySelector('[data-action=category]').click()");await until("!!document.querySelector('#haloPanel [data-category]')");await js("document.querySelector('#haloPanel [data-category]').click()");await until("!!document.querySelector('#haloPanel [data-prompt]')");
 blocked=false;await js("document.querySelector('#haloPanel [data-prompt]').click()");await until("!document.querySelector('#halo').classList.contains('show')");assert.equal(inserts,1);
 await show();await js("document.querySelector('[data-action=search]').click()");await until("document.querySelector('#haloHint').textContent==='请使用分类选择'");assert(await js("document.activeElement.id!=='haloSearch'"));
 await js("document.querySelector('#haloCenter').click()");await until("!document.querySelector('#halo').classList.contains('show')");assert.equal(closes,2);assert.deepEqual(errors,[]);
 console.log('PASS: actual renderer recent/category/leaf click, blocked selection remains visible, center closes, selection hides, denied search does not focus');app.exit(0);
}).catch(e=>{console.error(e);app.exit(1);});
