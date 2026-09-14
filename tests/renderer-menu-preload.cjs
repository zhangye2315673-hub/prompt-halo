const {contextBridge,ipcRenderer}=require('electron');
const sub=(name,cb)=>ipcRenderer.on(name,(_,v)=>cb(v));
contextBridge.exposeInMainWorld('promptHalo',{
 onOverlayShow:cb=>sub('test:show',cb),onOverlayHide:cb=>sub('test:hide',cb),onTargetState:cb=>sub('test:target',cb),
 hideOverlay:()=>ipcRenderer.invoke('test:close'),
 insertExternal:(text,id)=>ipcRenderer.invoke('test:insert',text,id),
 acquireKeyboard:()=>ipcRenderer.invoke('test:keyboard')
});
