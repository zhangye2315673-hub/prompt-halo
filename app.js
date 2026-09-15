const seedPrompts = [
  {
    "id": "p2",
    "title": "转风格",
    "category": "风格迁移",
    "tags": [
      "风格",
      "氛围"
    ],
    "favorite": true,
    "content": "图1作为风格参考图。\n图2作为需要转绘的原图。\n\n只修改图2的绘画风格，使其整体视觉效果接近图1。\n\n重点学习图1的：\n- 笔触质感\n- 绘画风格\n- 光影氛围\n- 颜色组织方式\n- 材质表现方式\n- 边缘处理方式\n- 画面精细度\n- 艺术完成度\n\n严格保持图2原有内容不变，包括：\n- 画面构图\n- 物体位置\n- 人物位置\n- 建筑结构\n- 场景布局\n- 相机角度\n- 透视关系\n- 物体大小比例\n- 主要轮廓\n\n让图2看起来像是由图1同样的画师、同样的绘画体系完成的作品。   \n\n让最终画面明显更接近图1的风格，而不是仅做轻微调色。  风格匹配要足够明显，重点体现在笔触、塑形、光影、色彩组织和氛围上。\n\n不要新增设计，不要删除原有主体，不要重构场景，不要改变画面叙事。\n\nImage 1 is the style reference.\nImage 2 is the source image to be restyled.\n\nChange ONLY the visual style of Image 2 so that it matches Image 1.\n\nMatch Image 1’s brushwork, rendering style, lighting mood, color logic, material rendering, edge treatment, level of detail, and overall finish.\n\nPreserve Image 2’s original composition, object placement, subject placement, architecture, scene layout, camera angle, perspective, scale, and major silhouettes.\n\nDo not redesign the scene.\nDo not add or remove important elements.\nDo not alter the visual structure of Image 2.",
    "suffixes": [
      "high detail",
      "no watermark"
    ],
    "slotOrder": 0,
    "uses": 0,
    "updated": ""
  },
  {
    "id": "p4",
    "title": "补齐",
    "category": "图像编辑",
    "tags": [
      "材质",
      "细节"
    ],
    "favorite": false,
    "content": "只重绘画面中的【上方 / 下方 / 周围】空白区域。\n\n根据现有中间画面自然延伸场景。\n\n延伸后的：\n\n建筑结构\n地面\n墙面\n天空\n光照\n透视\n材质\n\n必须和原场景自然连续。\n\n中间原有画面不要重新生成，不要改变原有内容。\n\nExtend ONLY into the empty areas.\n\nContinue the existing environment naturally with matching perspective, geometry, lighting, colors, materials, and visual style.\n\nPreserve the existing image content exactly as much as possible.\n\nDo not redesign the original scene.\nDo not move existing objects.\nDo not crop.\nDo not resize.\nDo not change canvas dimensions or aspect ratio.\n\nKeep the original central image unchanged.",
    "suffixes": [
      "controlled contrast"
    ],
    "slotOrder": 1,
    "uses": 0,
    "updated": ""
  },
  {
    "id": "p6",
    "title": "欧美卡通转绘",
    "category": "氛围与光影",
    "tags": [
      "光影",
      "色调"
    ],
    "favorite": false,
    "content": "参考图1的风格将图2进行转绘，欧美休闲模拟经营手游插画，游戏场景，减少植物和道具在画面中的的细节。风格更接近图1简单的造型结构。  \n精修型半立体数字厚涂，\n轻度3D渲染感，\n圆润饱满的卡通造型，\n无明显黑色描边，\n平滑渐变上色，\n高明度的配色， \n清透的冷暖对比，  \n晴朗自然柔和光照， \n强烈材质高光与边缘反光，\n干净光滑的表面质感，\n结构清晰，层次分明，\n整体颜色不发黄， 场景中的内容都出呈现原本的颜色。 \n商业宣传海报级完成度，\n热带海滨度假氛围，\n轻松、欢乐、甜美、精致。只修改风格。\nDo not crop.Do not resize.Do not change canvas dimensions.Maintain the exact original image aspect ratio and resolution.\n必须保持原始图像的精确长宽比和分辨率。输出图像的取景和构图必须与图像 2 完全一致。clean smooth texture  ，no grain，no noise，no tiling artifacts，no dirty texture，natural skin texture，high clarity，clean lighting",
    "suffixes": [
      "subtle grain"
    ],
    "slotOrder": 2,
    "uses": 0,
    "updated": ""
  },
  {
    "id": "p1",
    "title": "防破碎",
    "category": "图像编辑",
    "tags": [
      "角色",
      "电影感"
    ],
    "favorite": true,
    "content": "Clean Rendering Constraints\n\nUse broad readable shapes, large clean forms, and clear silhouettes.\n\nPrioritize simplified geometry, smooth continuous surfaces, and coherent visual structure.\n\nReduce unnecessary secondary details and high-frequency surface information.\n\nUse minimal fine texture.\n\nRepresent materials primarily through shape, value, color, lighting, and controlled texture rather than dense micro-detail.\n\nKeep edges smooth, stable, and clean.\n\nUse broad, coherent lighting and simple shadow shapes.\n\nMaintain clear visual hierarchy:\nhigh detail only where necessary,\nsimplified secondary elements,\ncleaner and quieter backgrounds.\n\nAvoid:\n\nfragmented textures\nbroken color patches\nexcessive micro-detail\nrepeating micro-patterns\nuniform micro-noise\nartificial grain\nspeckled highlights\nexcessive tiny decorations\nexcessive particles\nglitter\nunnecessary debris\nnoisy vegetation\ncellular or honeycomb-like textures\npixel-like broken textures\noversharpened edges\ncluttered surfaces\nrandom texture everywhere\n\nDo not add detail merely to make the image look more \"high resolution.\"\n\nKeep the final image clean, coherent, readable, visually unified, and structurally complete.",
    "suffixes": [
      "no text",
      "clean silhouette"
    ],
    "slotOrder": 3,
    "uses": 0,
    "updated": ""
  },
  {
    "id": "p5",
    "title": "删除局部",
    "category": "转向与姿态",
    "tags": [
      "转向",
      "角色"
    ],
    "favorite": false,
    "content": "只删除：\n\n【需要删除的物体】\n\n删除后自然补全被遮挡的背景，使补全区域与周围场景、材质、透视和光影完全协调。\n\n其他任何物体的位置、造型和大小都不要改变。\n\nRemove ONLY the specified object.\n\nNaturally reconstruct the background behind the removed object.\n\nPreserve the original composition, camera angle, perspective, lighting, shadows, surrounding objects, colors, and materials.\n\nDo not crop.\nDo not resize.\nDo not change canvas dimensions.\nDo not move any unrelated object.\n\nDo not change anything else.",
    "suffixes": [
      "anatomically correct"
    ],
    "slotOrder": 4,
    "uses": 0,
    "updated": ""
  },
  {
    "title": "万能局部编辑",
    "content": "只修改以下内容：\n\n【写你需要修改的内容】\n\n严格保持原图其他内容不变，包括：\n\n原始构图\n相机角度\n透视关系\n人物和道具的位置\n人物比例\n场景结构\n光照方向\n阴影关系\n原有材质\n原有配色\n原有绘画风格\n\nChange ONLY the requested elements.\n\nPreserve the original composition, camera angle, perspective, subject positions, proportions, scene geometry, lighting, shadows, colors, materials, and visual style.\n\nDo not crop.\nDo not resize.\nDo not change canvas dimensions.\nDo not move or redesign unrelated elements.\nDo not add any extra objects, text, logos, or decorations.\n\nKeep all unmentioned parts unchanged.",
    "category": "图像编辑",
    "tags": [],
    "suffixes": [],
    "favorite": false,
    "id": "p336516e8-4360-47f8-85cb-483bc7cbb435",
    "appendSuffix": true,
    "slotOrder": 5,
    "uses": 0,
    "updated": ""
  }
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
  try{const stored=localStorage.getItem(STORAGE);const parsed=stored===null?seedPrompts:JSON.parse(stored);if(!Array.isArray(parsed))throw Error();
  // Freeze the current visible ordering once so using a prompt cannot move it between rings.
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
 const loaded=loadPrompts();halo.inert=false;halo.className='halo show';halo.setAttribute('aria-hidden','false');editor.hidden=true;
 haloPanel.classList.remove('show');haloPanel.innerHTML='';rootPivot();view={kind:'home',page:0};outerEnabled=false;const toggle=$('outerToggle');toggle?.setAttribute('aria-pressed','false');toggle?.setAttribute('aria-label','开启外圈');toggle?.classList.remove('is-on');toggle?.querySelector('.center-glyph')?.classList.add('is-off');if(loaded){notify('');renderRadial();}
}
async function closeHalo({native=true,animate=true}={}){
 if(nativeOverlay&&native)return window.promptHalo.hideOverlay();
 const wasVisible=halo.classList.contains('show');
 epoch++;const closeEpoch=epoch;halo.inert=true;halo.setAttribute('aria-hidden','true');$('slotEdit').hidden=true;notify('');
 // Keep the rendered slots alive while they collapse; only input listeners stop.
 rayMenu?._removeGlobalListeners?.();outerRayMenu?._removeGlobalListeners?.();
 if(animate&&wasVisible){
  halo.classList.remove('show');halo.classList.add('closing');
  const exits=halo.getAnimations({subtree:true}).filter(a=>['halo-ring-out','halo-center-out','halo-editor-out'].includes(a.animationName));
  await Promise.allSettled(exits.map(a=>a.finished));
 }
 if(closeEpoch===epoch){halo.className='halo';haloPanel.classList.remove('show');editor.hidden=true;}
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
// SVG styling lives inside the component; page CSS cannot reach these paths.
let pointerPoint=null, directionAngle=0;
function decorateRing(menu){
 const svg=menu.shadowRoot.querySelector('.ray-menu-svg');if(!svg)return;
 const ns='http://www.w3.org/2000/svg';
 const defs=document.createElementNS(ns,'defs');
 defs.innerHTML=`<linearGradient id="halo-obsidian" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#302337"/><stop offset=".52" stop-color="#1c1724"/><stop offset="1" stop-color="#100f18"/></linearGradient><radialGradient id="halo-jade" cx=".65" cy=".25" r=".95"><stop stop-color="#28534e"/><stop offset=".5" stop-color="#26353b"/><stop offset="1" stop-color="#211a2e"/></radialGradient><linearGradient id="halo-edge"><stop stop-color="#ad83db" stop-opacity=".15"/><stop offset=".45" stop-color="#ad83db"/><stop offset=".7" stop-color="#79f2c7"/><stop offset="1" stop-color="#ddfff1"/></linearGradient>`;
 svg.prepend(defs);
 const radius=Number(menu.getAttribute('radius')),count=menu.items.length;
 menu.shadowRoot.querySelectorAll('.ray-menu-arc,.ray-menu-label').forEach(el=>{
  const index=Number(el.dataset.index),angle=(-90+(index+.5)*360/count)*Math.PI/180;
  el.style.setProperty('--sector-x',Math.cos(angle)*3+'px');el.style.setProperty('--sector-y',Math.sin(angle)*3+'px');
  el.style.setProperty('--sector-delay',index*28+'ms');
  el.style.setProperty('--sector-origin',`${radius+20}px ${radius+20}px`);
 });
 const edge=document.createElementNS(ns,'path');edge.classList.add('halo-active-edge');
 const r=radius-3,c=radius+20,a=12*Math.PI/180;
 edge.setAttribute('d',`M ${c+r*Math.cos(-a)} ${c+r*Math.sin(-a)} A ${r} ${r} 0 0 1 ${c+r*Math.cos(a)} ${c+r*Math.sin(a)}`);
 edge.style.transformOrigin=`${c}px ${c}px`;edge.style.opacity='0';svg.append(edge);
}
function neonHit(x,y){
 const distance=Math.hypot(x-pivot.x,y-pivot.y);
 const menu=outerEnabled&&distance>=Number(outerRayMenu.getAttribute('inner-radius'))?outerRayMenu:rayMenu;
 if(distance<Number(menu.getAttribute('inner-radius'))||distance>Number(menu.getAttribute('radius')))return null;
 const angle=(Math.atan2(y-pivot.y,x-pivot.x)*180/Math.PI+90+360)%360;
 return {menu,index:Math.min(menu.items.length-1,Math.floor(angle/360*menu.items.length))};
}
function resetNeonFeedback(){
 pointerPoint=null;$('centerDirection').classList.remove('is-active');
 for(const menu of [rayMenu,outerRayMenu]){menu.dataset.active='false';const edge=menu.shadowRoot?.querySelector('.halo-active-edge');if(edge)edge.style.opacity='0';}
}
function syncNeonFeedback(){
 if(!pointerPoint||!halo.classList.contains('show')||!editor.hidden||insertionPending)return;
 const hit=neonHit(pointerPoint.x,pointerPoint.y);
 for(const menu of [rayMenu,outerRayMenu]){
  const active=hit?.menu===menu;menu.dataset.active=String(active);
  menu.updateHoverFromPoint(active?pointerPoint.x:pivot.x,active?pointerPoint.y:pivot.y);
  const edge=menu.shadowRoot?.querySelector('.halo-active-edge');
  if(edge){edge.style.opacity=active?'1':'0';if(active){const target=-90+(hit.index+.5)*360/menu.items.length,old=Number(edge.dataset.angle||target);const next=old+((target-old+540)%360+360)%360-180;edge.dataset.angle=String(next);edge.style.transform=`rotate(${next}deg)`;}}
 }
 const direction=$('centerDirection');direction.classList.toggle('is-active',!!hit);
 if(hit){const arc=hit.menu.shadowRoot?.querySelector(`.ray-menu-arc[data-hovered=\"true\"]`);const index=Number(arc?.dataset.index??hit.index);const target=-90+(index+.5)*360/hit.menu.items.length;directionAngle+=((target-directionAngle+540)%360+360)%360-180;direction.style.setProperty('--direction-angle',directionAngle+'deg');}
}
function setPressed(menu,index,value){
 menu.shadowRoot?.querySelectorAll(`[data-index="${index}"]`).forEach(el=>el.dataset.pressed=String(value));
}
function clearPressed(){for(const menu of [rayMenu,outerRayMenu])menu.shadowRoot?.querySelectorAll('[data-pressed="true"]').forEach(el=>el.dataset.pressed='false');}
async function animatePromptSelection(id){
 const menu=[rayMenu,outerRayMenu].find(m=>!m.hidden&&m.items?.some(p=>p.id===id));if(!menu)return;
 const index=menu.items.findIndex(p=>p.id===id),arc=menu.shadowRoot.querySelector(`.ray-menu-arc[data-index="${index}"]`);
 setPressed(menu,index,true);
 if(arc&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const anim=arc.animate([{filter:'drop-shadow(0 0 9px #79f2c7)'},{filter:'drop-shadow(0 0 2px #79f2c7)'}],{duration:140,easing:'ease-out'});
  await anim.finished.catch(()=>{});
 }
 clearPressed();
}
function renderRadial(){
 $('slotEdit').hidden=true;
 if(rayMenu?.open){
  halo.classList.add('secondary');halo.classList.remove('editing');editor.hidden=true;haloPanel.classList.remove('show');
  const allItems=itemsForView();
  const items=allItems.slice(0,6).map(item=>({id:item.id,type:item.type,label:item.label,icon:item.icon,onSelect:()=>{const p=prompts.find(p=>p.id===item.id);if(p)injectPrompt(p);}}));
  const innerRadius=Math.min(175,Math.max(115,items.length*19.2));
  halo.style.setProperty('--aura-size',2*((outerEnabled?innerRadius*2-INNER_HOLE_RADIUS+RING_GAP:innerRadius)+8)+'px');
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
  roundMenuSlots(rayMenu);roundMenuSlots(outerRayMenu);
  decorateRing(rayMenu);decorateRing(outerRayMenu);resetNeonFeedback();return;
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
 halo.style.setProperty('--aura-size',2*(Number((outerEnabled?outerRayMenu:rayMenu).getAttribute('radius'))+8)+'px');
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
 const status=$('centerStatus');
 if(!halo.classList.contains('show')||halo.classList.contains('editing')||!rayMenu.isOpen){button.hidden=true;status?.classList.remove('has-value');if(status)status.textContent='';return;}
 const menu=outerEnabled&&outerRayMenu.getHoveredItem()?.type==='prompt'?outerRayMenu:rayMenu;
 const hovered=menu.getHoveredItem?.();
 if(status){const hp=hovered?.type==='prompt'&&prompts.find(p=>p.id===hovered.id);status.textContent=hp?.title||'';status.classList.toggle('has-value',!!hp);}

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
document.addEventListener('pointermove',e=>{pointerPoint={x:e.clientX,y:e.clientY};cancelAnimationFrame(slotEditFrame);slotEditFrame=requestAnimationFrame(()=>{syncNeonFeedback();syncSlotEdit();});},{passive:true});
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
 const selectedEpoch=epoch;
 await animatePromptSelection(p.id);
 if(epoch!==selectedEpoch){insertionPending=false;return;}
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
 editorReturn={...view};resetNeonFeedback();halo.classList.add('editing');haloPanel.classList.remove('show');editor.hidden=false;notify('');
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
document.addEventListener('pointerdown',e=>{
 if(e.button!==0||!halo.classList.contains('show')||!editor.hidden||e.target.closest('.center-split,.slot-edit'))return;
 const hit=neonHit(e.clientX,e.clientY);if(hit)setPressed(hit.menu,hit.index,true);
});
document.addEventListener('pointerup',()=>{if(!insertionPending)clearPressed();});
document.addEventListener('pointercancel',clearPressed);
for(const type of ['pointerdown','pointerup','click','keydown']){
 document.addEventListener(type,e=>{
  if(e.target.closest('.center-split,.prompt-editor,.slot-edit')){e.stopPropagation();return;}
  if(type==='click'&&halo.classList.contains('show')&&editor.hidden){
   const hit=neonHit(e.clientX,e.clientY);
   if(hit){e.stopPropagation();const p=prompts.find(p=>p.id===hit.menu.items[hit.index]?.id);if(p)injectPrompt(p);return;}
  }
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
 window.promptHalo.onOverlayHide(()=>closeHalo({native:false,animate:false}));
 window.promptHalo.onOverlayDismiss?.(async data=>{await closeHalo({native:false});window.promptHalo.completeDismissal(data.id);});
 window.promptHalo.onTargetState?.(data=>{if(data.sessionId!==nativeSessionId)return;phase=data.phase;if(phase==='blocked')notify(data.reason);});
}else{openHalo();}
import('./node_modules/ray-menu/dist/wc/ray-menu.mjs').then(async()=>{
 await Promise.all([rayMenu,outerRayMenu].map(menu=>new Promise((resolve,reject)=>{
  const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('ring-theme.css',document.baseURI).href;link.onload=resolve;link.onerror=reject;menu.shadowRoot.append(link);
 })));
 if(halo.classList.contains('show'))renderRadial();
}).catch(()=>notify('圆环样式加载失败，请重新打开应用。'));
