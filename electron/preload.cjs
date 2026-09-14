const {contextBridge,ipcRenderer}=require('electron');
function subscribe(channel,handler){const listener=(_event,data)=>handler(data);ipcRenderer.on(channel,listener);return()=>ipcRenderer.removeListener(channel,listener);}
contextBridge.exposeInMainWorld('promptHalo',{
  insertExternal:(text,id)=>ipcRenderer.invoke('prompt-halo:insert',text,id),
  toggle:()=>ipcRenderer.invoke('prompt-halo:toggle'),
  hideOverlay:()=>ipcRenderer.invoke('prompt-halo:hide-overlay'),
  acquireKeyboard:()=>ipcRenderer.invoke('prompt-halo:keyboard'),
  diagnostics:()=>ipcRenderer.invoke('prompt-halo:diagnostics'),
  openLibrary:()=>ipcRenderer.invoke('prompt-halo:open-library'),
  onOverlayShow:handler=>subscribe('prompt-halo:show',handler),
  onTargetState:handler=>subscribe('prompt-halo:target',handler),
  onOverlayHide:handler=>subscribe('prompt-halo:hide',handler)
});
