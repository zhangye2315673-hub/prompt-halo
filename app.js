const seedPrompts = [
  { id: 'p1', title: '电影感角色立绘', category: '图像编辑', tags: ['角色', '电影感'], favorite: true, uses: 42, updated: '刚刚', content: 'Create a cinematic character key art of {subject}, three-quarter view, expressive silhouette, dramatic rim light, rich material details, subtle atmospheric perspective, production concept art quality.', suffixes: ['no text', 'clean silhouette'] },
  { id: 'p2', title: '统一为暗黑奇幻风格', category: '风格迁移', tags: ['风格', '氛围'], favorite: true, uses: 31, updated: '今天 09:42', content: 'Transform the image into a dark fantasy concept art style. Keep the original composition and character identity, add moody volumetric lighting, worn textures, deep charcoal shadows and restrained crimson accents.', suffixes: ['high detail', 'no watermark'] },
  { id: 'p3', title: '补全画面边缘', category: '补图裁剪', tags: ['补图', '构图'], favorite: false, uses: 18, updated: '昨天', content: 'Extend the canvas naturally on all sides. Continue the existing perspective, lighting direction and texture language. Do not introduce new focal subjects; preserve the visual hierarchy and blend the seams invisibly.', suffixes: ['seamless', 'match original'] },
  { id: 'p4', title: '材质细节增强', category: '图像编辑', tags: ['材质', '细节'], favorite: false, uses: 24, updated: '周一', content: 'Enhance the material read of {subject}: sharpen edge definition, surface breakup and believable micro texture while preserving the original shape, palette and lighting design.', suffixes: ['controlled contrast'] },
  { id: 'p5', title: '正面转三分之二侧脸', category: '转向与姿态', tags: ['转向', '角色'], favorite: false, uses: 12, updated: '03 / 18', content: 'Rotate {subject} into a natural three-quarter view facing left. Preserve facial identity, hairstyle, costume details and proportions. Keep the camera at the same height and lens feel.', suffixes: ['anatomically correct'] },
  { id: 'p6', title: '柔和晨光氛围', category: '氛围与光影', tags: ['光影', '色调'], favorite: false, uses: 9, updated: '03 / 16', content: 'Re-light the scene with soft early morning light, cool ambient shadows and a warm directional key. Keep contrast gentle, colors nuanced and the atmosphere calm but dimensional.', suffixes: ['subtle grain'] }
];
const $ = id => document.getElementById(id);
const halo=$('halo'), haloPanel=$('haloPanel'), editor=$('promptEditor'), rayMenu=$('rayMenu'), outerRayMenu=$('outerRayMenu');
const OUTER_SEGMENTS=12;
const RING_GAP=8, INNER_HOLE_RADIUS=40;
const STORAGE='prompt-halo-prompts', nativeOverlay=!!window.promptHalo;
let storageHealthy=true;
let prompts=[], nativeSessionId=null, insertionPending=false, phase='ready', epoch=0, layoutTestAdds=0, layoutHidden=0, outerEnabled=false;
let pivot={x:430,y:300}, view={kind:'home',page:0}, editorReturn=null;
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function loadPrompts(){
  try{const stored=localStorage.getItem(STORAGE);const parsed=stored===null?seedPrompts:JSON.parse(stored);if(!Array.isArray(parsed))throw Error();// Freeze the current visible ordering once so using a prompt cannot move it between rings.
  const ranked=parsed.slice().sort((a,b)=>(b.lastUsed||0)-(a.lastUsed||0)||(b.uses||0)-(a.uses||0));
  let nextSlot=Math.max(-1,...parsed.map(p=>Number.isInteger(p.slotOrder)?p.slotOrder:-1))+1;
  prompts=ranked.map(p=>Number.isInteger(p.slotOrder)?p:{...p,slotOrder:nextSlot++}).sort((a,b)=>a.slotOrder-b.slotOrder);storageHealthy=true;}
  catch{storageHealthy=false;notify('词库读取失败，已保留原始数据。请勿保存覆盖。');return false;}
  return true;
}
function persist(next=prompts){if(!storageHealthy){notify('词库读取失败，禁止覆盖原始数据。');return false;}try{localStorage.setItem(STORAGE,JSON.stringify(next));prompts=next;return true;}catch{notify('保存失败，本机存储不可用。内容仍留在编辑器中。');return false;}}
function notify(text){$('haloHint').textContent=text;$('haloHint').hidden=!text;}
function setPivot(point){
  // Fit the entire radial menu; retain the clicked center whenever space allows.
  const scale=Math.min(1,(innerWidth-32)/300,(innerHeight-32)/300);
  const halfX=175*scale+56,halfY=175*scale+16;
  pivot={x:Math.max(halfX+8,Math.min(innerWidth-halfX-8,point.x)),y:Math.max(halfY+8,Math.min(innerHeight-halfY-8,point.y))};
  halo.style.setProperty('--cx',pivot.x+'px');halo.style.setProperty('--cy',pivot.y+'px');
}
function rootPivot(){pivot={x:innerWidth/2,y:innerHeight/2};halo.style.setProperty('--cx',pivot.x+'px');halo.style.setProperty('--cy',pivot.y+'px');}
function openHalo(data={}){
 epoch++;nativeSessionId=data.sessionId??null;phase=data.phase??'ready';
 const loaded=loadPrompts();halo.className='halo show';halo.setAttribute('aria-hidden','false');editor.hidden=true;
 haloPanel.classList.remove('show');haloPanel.innerHTML='';rootPivot();view={kind:'home',page:0};outerEnabled=false;const toggle=$('outerToggle');toggle?.setAttribute('aria-pressed','false');toggle?.setAttribute('aria-label','开启外圈');toggle?.classList.remove('is-on');toggle?.querySelector('.center-glyph')?.classList.add('is-off');if(loaded){notify('');renderRadial();}
}
function closeHalo({native=true}={}){
 epoch++;halo.className='halo';halo.setAttribute('aria-hidden','true');haloPanel.classList.remove('show');editor.hidden=true;notify('');
 // Hide the host immediately; avoid a delayed component close erasing a reopened menu.
 rayMenu?._removeGlobalListeners?.();outerRayMenu?._removeGlobalListeners?.();
 if(nativeOverlay&&native)window.promptHalo.hideOverlay();
}
async function keyboard(){
 const token=epoch;
 if(nativeOverlay){const access=await window.promptHalo.acquireKeyboard();if(token!==epoch)return false;if(!access.ok){notify(access.reason);return false;}}
 return true;
}
function categoryNames(){return [...new Set(prompts.map(p=>p.category||'未分类'))];}
function itemsForView(){
 if(view.kind==='category')return [...categoryNames().map(c=>({label:c,category:c,icon:'◈',type:'category'})),{label:'新增提示词',type:'add',icon:'＋'}];
 let list=prompts.slice();
 if(view.kind==='favorite')list=list.filter(p=>p.favorite);
 if(view.kind==='prompts')list=list.filter(p=>(p.category||'未分类')===view.category);
 if(view.kind==='search'){const q=(view.query||'').toLowerCase();list=list.filter(p=>[p.title,p.content,p.category,...(p.tags||[])].join(' ').toLowerCase().includes(q));}
 list.sort((a,b)=>a.slotOrder-b.slotOrder);
 const result=list.map(p=>({label:Array.from(p.title||'').slice(0,4).join(''),icon:p.favorite?'☆':'↗',type:'prompt',id:p.id}));
 return result;
}
// Offset each shared radial boundary by half the gap: adjacent sides stay parallel.
function roundMenuSlots(menu){
 const outer=Number(menu.getAttribute('radius')),inner=Number(menu.getAttribute('inner-radius')),center=outer+20;
 const paths=menu.shadowRoot.querySelectorAll('.ray-menu-arc'),step=2*Math.PI/paths.length;
 const origin=Number(menu.getAttribute('start-angle'))*Math.PI/180,halfGap=RING_GAP/2,corner=5;
 const point=(r,a)=>[center+r*Math.cos(a),center+r*Math.sin(a)];
 const shift=(p,a,d)=>[p[0]+d*Math.cos(a),p[1]+d*Math.sin(a)];
 const xy=p=>p.join(' ');
 paths.forEach((path,i)=>{
  const start=origin+i*step,end=start+step;
  const os=start+Math.asin(halfGap/outer),oe=end-Math.asin(halfGap/outer);
  const ins=start+Math.asin(halfGap/inner),ine=end-Math.asin(halfGap/inner);
  const so=point(outer,os),eo=point(outer,oe),si=point(inner,ins),ei=point(inner,ine);
  const co=corner/outer,ci=Math.min(corner/inner,(ine-ins)/4);
  path.setAttribute('d',`M ${xy(point(outer,os+co))} A ${outer} ${outer} 0 ${oe-os-2*co>Math.PI?1:0} 1 ${xy(point(outer,oe-co))} Q ${xy(eo)} ${xy(shift(eo,end,-corner))} L ${xy(shift(ei,end,corner))} Q ${xy(ei)} ${xy(point(inner,ine-ci))} A ${inner} ${inner} 0 ${ine-ins-2*ci>Math.PI?1:0} 0 ${xy(point(inner,ins+ci))} Q ${xy(si)} ${xy(shift(si,start,corner))} L ${xy(shift(so,start,-corner))} Q ${xy(so)} ${xy(point(outer,os+co))} Z`);
 });
 menu.shadowRoot.querySelectorAll('.ray-menu-outer-ring,.ray-menu-inner-ring').forEach(node=>{node.style.stroke='none';});
}
function renderRadial(){
 $('slotEdit').hidden=true;
 if(rayMenu?.open){
  halo.classList.add('secondary');halo.classList.remove('editing');editor.hidden=true;haloPanel.classList.remove('show');
  const allItems=itemsForView();
  const items=allItems.slice(0,6).map(item=>({id:item.id,label:item.label,icon:item.icon,onSelect:()=>{const p=prompts.find(p=>p.id===item.id);if(p)injectPrompt(p);}}));
  const innerRadius=Math.min(175,Math.max(115,items.length*19.2));
  rayMenu.items=items;rayMenu.setAttribute('radius',String(innerRadius));rayMenu.setAttribute('inner-radius',String(INNER_HOLE_RADIUS));rayMenu.setAttribute('center-deadzone','34');
  rayMenu.setAttribute('infinite-threshold',String(innerRadius));
  const outerItems=allItems.slice(6,6+OUTER_SEGMENTS);
  outerRayMenu.items=Array.from({length:OUTER_SEGMENTS},(_,i)=>outerItems[i]||{id:'outer-'+i,label:'',icon:'',type:'placeholder'});
  // Both bands have exactly the same thickness, separated by the shared gap.
  outerRayMenu.setAttribute('radius',String(innerRadius*2-INNER_HOLE_RADIUS+RING_GAP));
  outerRayMenu.setAttribute('inner-radius',String(innerRadius+RING_GAP));outerRayMenu.setAttribute('center-deadzone','34');
  outerRayMenu.open(pivot.x,pivot.y);
  // Route outer clicks explicitly; never attach a second global selection handler.
  outerRayMenu._removeGlobalListeners();
  outerRayMenu.hidden=!outerEnabled;
  rayMenu.open(pivot.x,pivot.y);
  roundMenuSlots(rayMenu);roundMenuSlots(outerRayMenu);return;
 }
 halo.classList.add('secondary');halo.classList.remove('editing');editor.hidden=true;haloPanel.classList.add('show');
 const items=itemsForView();
 const query=view.query||'';
 haloPanel.innerHTML=`${view.kind==='search'?`<label class="search-anchor"><input id="haloSearch" type="search" placeholder="搜索提示词…" value="${escapeHtml(query)}" aria-label="搜索提示词"></label>`:''}<div id="radialItems"></div>`;
 const scale=Math.min(1,(innerWidth-32)/300,(innerHeight-32)/300);
 const pageItems=items;
 const count=pageItems.length;
 const radius=Math.max(60,Math.min(148,(count*104)/(Math.PI*2)))*scale;
 const positions=pageItems.map((_,i)=>{const angle=-Math.PI/2+i*2*Math.PI/count;return [Math.cos(angle)*radius/scale,Math.sin(angle)*radius/scale];});
 pageItems.forEach((item,i)=>{
  const b=document.createElement('button');b.className='radial-item'+(item.type==='add'?' add':'');
  const [x,y]=positions[i];
  b.style.left=(pivot.x+x*scale)+'px';b.style.top=(pivot.y+y*scale)+'px';
  b.innerHTML=`<span class="symbol">${item.icon}</span><b>${escapeHtml(item.label)}</b>`;
  b.title=item.label+(item.type==='prompt'?' · 右键编辑':'');
  if(item.type==='prompt'){
   b.dataset.prompt=item.id;b.onclick=()=>injectPrompt(prompts.find(p=>p.id===item.id));
   b.oncontextmenu=e=>{e.preventDefault();openEditor(prompts.find(p=>p.id===item.id));};
  }else if(item.type==='category'){
   b.dataset.category=item.category;b.onclick=()=>{view={kind:'prompts',category:item.category,page:0};renderRadial();};
  }else if(item.type==='add'){b.dataset.action='new';b.onclick=()=>{if(layoutHidden>0)layoutHidden--;else layoutTestAdds++;renderRadial();};
  }else if(item.type==='remove'){b.dataset.action='remove';b.onclick=()=>{const available=prompts.length+layoutTestAdds;if(available>2){if(layoutTestAdds>0)layoutTestAdds--;else layoutHidden=Math.min(prompts.length-2,layoutHidden+1);}renderRadial();};}
  $('radialItems').append(b);
 });
 if(!items.length){const label=document.createElement('div');label.className='empty-label';label.textContent=view.kind==='search'?'没有匹配的提示词':'暂无提示词';haloPanel.append(label);}
 if($('haloSearch')){
  $('haloSearch').oninput=e=>{if(e.isComposing)return;updateSearch(e.target.value);};
  $('haloSearch').oncompositionend=e=>updateSearch(e.target.value);
  $('haloSearch').onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();haloPanel.querySelector('[data-prompt]')?.click();}};
 }
}
function toggleOuter(){
 outerEnabled=!outerEnabled;
 outerRayMenu.hidden=!outerEnabled;
 const toggle=$('outerToggle');
 toggle?.setAttribute('aria-pressed',String(outerEnabled));
 toggle?.setAttribute('aria-label',outerEnabled?'关闭外圈':'开启外圈');
 toggle?.classList.toggle('is-on',outerEnabled);
 const glyph=toggle?.querySelector('.center-glyph');
 glyph?.classList.toggle('is-off',!outerEnabled);
}

function syncOuterHover(e){
 if(!halo.classList.contains('show')||halo.classList.contains('editing')||!outerRayMenu?.isOpen)return;
 const dx=e.clientX-pivot.x,dy=e.clientY-pivot.y;
 const distance=Math.hypot(dx,dy);
 const inOuter=outerEnabled&&distance>=Number(outerRayMenu.getAttribute('inner-radius'))&&distance<=Number(outerRayMenu.getAttribute('radius'));
 // Use the component's own angle mapping, including the centered top segment.
 outerRayMenu.updateHoverFromPoint(inOuter?e.clientX:pivot.x,inOuter?e.clientY:pivot.y);
}
// Keep the edit target tied to the currently highlighted slot, including its rounded corner.
function syncSlotEdit(){
 const button=$('slotEdit');
 if(!halo.classList.contains('show')||halo.classList.contains('editing')||!rayMenu.isOpen){button.hidden=true;return;}
 const menu=outerEnabled&&outerRayMenu.getHoveredItem()?.type==='prompt'?outerRayMenu:rayMenu;
 const arc=menu.shadowRoot?.querySelector('.ray-menu-arc[data-hovered="true"]');
 const item=arc&&menu.items[Number(arc.dataset.index)];
 const prompt=item&&prompts.find(p=>p.id===item.id);
 if(!prompt){button.hidden=true;return;}
 const radius=Number(menu.getAttribute('radius')),svgCenter=radius+20;
 const step=2*Math.PI/menu.items.length,start=Number(menu.getAttribute('start-angle'))*Math.PI/180+Number(arc.dataset.index)*step,end=start+step;
 const distance=radius-17,inset=Math.asin((RING_GAP/2+14)/distance);
 const angle=Math.cos((start+end)/2)>0?end-inset:start+inset;
 const svg=arc.ownerSVGElement,point=svg.createSVGPoint();
 point.x=svgCenter+distance*Math.cos(angle);point.y=svgCenter+distance*Math.sin(angle);
 const position=point.matrixTransform(svg.getScreenCTM());
 button.style.left=position.x+'px';button.style.top=position.y+'px';
 button.dataset.promptId=prompt.id;button.setAttribute('aria-label','编辑：'+prompt.title);button.hidden=false;
}
$('slotEdit').addEventListener('click',()=>{const p=prompts.find(p=>p.id===$('slotEdit').dataset.promptId);if(p)openEditor(p);});
// Component selection updates run on window; observe after those listeners finish.
let slotEditFrame=0;
document.addEventListener('pointermove',()=>{cancelAnimationFrame(slotEditFrame);slotEditFrame=requestAnimationFrame(syncSlotEdit);},{passive:true});
rayMenu?.addEventListener('ray-close',()=>{$('slotEdit').hidden=true;});
function focusSearch(){const input=$('haloSearch');if(input){input.focus();}}
function updateSearch(query){const start=$('haloSearch')?.selectionStart??query.length,end=$('haloSearch')?.selectionEnd??start;view.query=query;view.page=0;renderRadial();focusSearch();$('haloSearch').setSelectionRange(start,end);}
async function renderHaloPanel(action){
 if(insertionPending)return;
 if(action==='search'&&!await keyboard())return;
 const button=document.querySelector(`.root-ring [data-action="${action}"]`),r=button.getBoundingClientRect();
 setPivot({x:r.x+r.width/2,y:r.y+r.height/2});view={kind:action,page:0,query:''};notify('');renderRadial();if(action==='search')focusSearch();
}
async function injectPrompt(p){
 if(!p||insertionPending)return;
 insertionPending=true;
 const text=p.content+(p.appendSuffix!==false&&p.suffixes?.length?'\n\n'+p.suffixes.join(', '):'');
 try{
  if(nativeOverlay){
   const result=await window.promptHalo.insertExternal(text,nativeSessionId);
   if(!result.ok){notify(result.reason);return;}
  }else{notify('网页预览不能向其他软件输入，请启动桌面版。');return;}
  // The native service owns hiding, restoration, focus checks and single paste.
  const next=prompts.map(item=>item.id===p.id?{...item,uses:(item.uses||0)+1,lastUsed:Date.now(),updated:'刚刚'}:item);
  persist(next);localStorage.setItem('prompt-halo-last',text);localStorage.setItem('prompt-halo-last-id',p.id);
 }catch(e){notify(e.message);}finally{insertionPending=false;}
}
async function openEditor(existing){
 if(insertionPending||!await keyboard())return;
 if(!existing&&prompts.length>=18){notify('内外圈的 18 个格位已满，请编辑或删除已有提示词。');return;}
 const model=existing?{...existing}:{title:'',content:'',category:view.category||'未分类',tags:[],suffixes:[],favorite:false,appendSuffix:false,slotOrder:Math.max(-1,...prompts.map(p=>p.slotOrder))+1};
 $('slotEdit').hidden=true;
 editorReturn={...view};halo.classList.add('editing');haloPanel.classList.remove('show');editor.hidden=false;notify('');
 rayMenu?._removeGlobalListeners?.();
 editor.innerHTML=`<form id="editorForm"><div class="editor-heading"><h1>${existing?'编辑提示词':'新增提示词'}</h1><button type="button" id="editorCancel" aria-label="取消编辑" title="取消编辑"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg></button></div><div class="editor-title-field"><label for="titleInput">标题</label><input type="text" id="titleInput" required maxlength="100" value="${escapeHtml(model.title)}" placeholder="例如：统一角色光影" autocomplete="off"></div><div class="editor-content-field"><label for="contentInput">提示词描述</label><textarea id="contentInput" required placeholder="写下你想要使用的提示词…" spellcheck="false">${escapeHtml(model.content)}</textarea></div><div class="editor-footer"><p id="editorNote" class="editor-note" role="status" hidden></p><div class="editor-actions"><div>${existing?'<button type="button" id="deletePrompt" class="danger">删除</button> <button type="button" id="duplicatePrompt">复制</button>':''}</div><button type="submit" id="savePromptBtn" class="primary">保存</button></div></div></form>`;
 const note=text=>{const el=$('editorNote');el.textContent=text;el.hidden=!text;};
 // Editing the two visible fields preserves existing library metadata and input behavior.
 function readModel(){return {...model,id:existing?.id||'p'+crypto.randomUUID(),title:$('titleInput').value.trim(),content:$('contentInput').value,uses:model.uses||0,updated:'刚刚'};}
 $('editorForm').onsubmit=e=>{e.preventDefault();const p=readModel();if(!p.title||!p.content.trim()){note('请填写标题和提示词描述。');return;}if((p.content+(p.appendSuffix!==false&&p.suffixes?.length?'\n\n'+p.suffixes.join(', '):'')).length>20000){note('提示词内容不能超过 20000 字符。');return;}const next=existing?prompts.map(item=>item.id===p.id?p:item):[...prompts,p];if(!persist(next))return;view={...editorReturn};renderRadial();};
 $('editorCancel').onclick=()=>{view=editorReturn;renderRadial();};
 $('deletePrompt')?.addEventListener('click',()=>{const b=$('deletePrompt');if(b.dataset.confirm!=='yes'){b.dataset.confirm='yes';b.textContent='确认删除';note('再点一次删除此提示词，或点 × 取消。');return;}if(!persist(prompts.filter(p=>p.id!==existing.id)))return;view={...editorReturn};renderRadial();});
 $('duplicatePrompt')?.addEventListener('click',()=>{if(prompts.length>=18){note('内外圈的 18 个格位已满。');return;}const p=readModel();p.slotOrder=Math.max(-1,...prompts.map(p=>p.slotOrder))+1;p.id='p'+crypto.randomUUID();p.title=(p.title||'未命名提示词')+' · 副本';p.uses=0;p.lastUsed=0;if(persist([...prompts,p]))openEditor(p);});
 $('titleInput').focus();
}
document.querySelectorAll('.root-ring .halo-action').forEach(b=>b.onclick=()=>renderHaloPanel(b.dataset.action));
document.getElementById('centerAdd')?.addEventListener('click',()=>openEditor());
document.getElementById('outerToggle')?.addEventListener('click',toggleOuter);
// The component listens on window and treats any click at the center as close.
// Controls and editor events must finish here, before reaching those listeners.
for(const type of ['pointerdown','pointerup','click','keydown']){
 document.addEventListener(type,e=>{
  if(e.target.closest('.center-split,.prompt-editor,.slot-edit')){e.stopPropagation();return;}
  if((type==='click'||type==='pointerup')&&halo.classList.contains('show')){
   const distance=Math.hypot(e.clientX-pivot.x,e.clientY-pivot.y);
   if(distance<INNER_HOLE_RADIUS||distance>Number(rayMenu.getAttribute('radius'))){
    e.stopPropagation();
    if(type==='click'&&editor.hidden&&outerEnabled&&distance>=Number(outerRayMenu.getAttribute('inner-radius'))&&distance<=Number(outerRayMenu.getAttribute('radius'))){
     outerRayMenu.updateHoverFromPoint(e.clientX,e.clientY);
     const item=outerRayMenu.getHoveredItem(),p=item?.type==='prompt'&&prompts.find(p=>p.id===item.id);
     if(p)injectPrompt(p);
    }
   }
  }
 });
}
rayMenu?.addEventListener('ray-select',e=>{if(e.detail?.type==='prompt'){const p=prompts.find(p=>p.id===e.detail.id);if(p)injectPrompt(p);}});
document.addEventListener('pointerdown',e=>{if(halo.classList.contains('show')&&!e.target.closest('button,input,textarea,select,label,.prompt-editor,.center-split,ray-menu'))closeHalo();});
document.addEventListener('pointermove',syncOuterHover,{passive:true});
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();closeHalo();return;}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='n'){e.preventDefault();if(halo.classList.contains('show'))openEditor();return;}
 if(e.target.closest('input,textarea,select,[contenteditable]'))return;
 if(!nativeOverlay&&e.ctrlKey&&e.altKey&&e.code==='KeyQ'&&!e.repeat){e.preventDefault();halo.classList.contains('show')?closeHalo():openHalo();}
});
if(nativeOverlay){
 window.promptHalo.onOverlayShow(openHalo);
 window.promptHalo.onOverlayHide(()=>closeHalo({native:false}));
 window.promptHalo.onTargetState?.(data=>{if(data.sessionId!==nativeSessionId)return;phase=data.phase;if(phase==='blocked')notify(data.reason);});
}else{openHalo();}
import('./node_modules/ray-menu/dist/wc/ray-menu.mjs').then(()=>{
 for(const menu of [rayMenu,outerRayMenu]){
 const style=menu?.shadowRoot?.appendChild(document.createElement('style'));
 if(style)style.textContent='.ray-menu-arc{opacity:1!important;stroke-width:1!important}.ray-menu-label{background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;padding:4px 8px!important}.ray-menu-label[data-hovered="true"]{background:transparent!important;box-shadow:none!important;color:var(--ray-accent-text)!important}';
 }
 if(halo.classList.contains('show'))renderRadial();
}).catch(()=>{});
