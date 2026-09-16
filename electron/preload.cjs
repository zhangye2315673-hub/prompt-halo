const {contextBridge,ipcRenderer}=require('electron');
function subscribe(channel,handler){const listener=(_event,data)=>handler(data);ipcRenderer.on(channel,listener);return()=>ipcRenderer.removeListener(channel,listener);}
contextBridge.exposeInMainWorld('promptHalo',{
  backupLibrary:list=>ipcRenderer.sendSync('prompt-halo:backup',list),
  confirmDiscard:()=>ipcRenderer.invoke('prompt-halo:discard'),
  onLibrary:handler=>subscribe('prompt-halo:library',handler),
  libraryAction:(action,list)=>ipcRenderer.invoke('prompt-halo:library-action',action,list),
  setDirty:value=>ipcRenderer.send('prompt-halo:dirty',value),
  insertExternal:(text,id)=>ipcRenderer.invoke('prompt-halo:insert',text,id),
  toggle:()=>ipcRenderer.invoke('prompt-halo:toggle'),
  hideOverlay:()=>ipcRenderer.invoke('prompt-halo:hide-overlay'),
  acquireKeyboard:()=>ipcRenderer.invoke('prompt-halo:keyboard'),
  diagnostics:()=>ipcRenderer.invoke('prompt-halo:diagnostics'),
  onOverlayShow:handler=>subscribe('prompt-halo:show',handler),
  onTargetState:handler=>subscribe('prompt-halo:target',handler),
  onOverlayHide:handler=>subscribe('prompt-halo:hide',handler),
  onOverlayDismiss:handler=>subscribe('prompt-halo:dismiss',handler),
  completeDismissal:id=>ipcRenderer.invoke('prompt-halo:dismissed',id)
});
