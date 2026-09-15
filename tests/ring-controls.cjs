const {app,BrowserWindow,ipcMain}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const qaDir=fs.mkdtempSync(path.join(os.tmpdir(),'halo-ring-controls-'));
app.setPath('userData',path.join(qaDir,'profile'));
let win,inserts=0;const errors=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 ipcMain.handle('test:close',()=>win.webContents.send('test:hide'));
 ipcMain.handle('test:insert',()=>{inserts++;return {ok:false,reason:'isolated test'};});
 ipcMain.handle('test:keyboard',()=>({ok:true}));
 win=new BrowserWindow({show:false,width:860,height:600,frame:false,transparent:true,alwaysOnTop:true,webPreferences:{preload:path.join(__dirname,'renderer-menu-preload.cjs'),contextIsolation:true,backgroundThrottling:false}});
 win.webContents.on('console-message',e=>{if(e.level==='error')errors.push(e.message);});
 const js=s=>win.webContents.executeJavaScript(s);
 const until=async s=>{for(let i=0;i<100;i++){if(await js(s))return;await delay(20);}throw Error('Timed out: '+s);};
 const point=async selector=>js(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(el.closest('.prompt-editor'))el.scrollIntoView({block:'nearest'});const r=el.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()`);
 const move=async p=>{win.focus();await delay(60);win.webContents.sendInputEvent({type:'mouseMove',...p});await delay(180);};
 const click=async p=>{await move(p);win.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...p});win.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...p});await delay(35);};
 const show=async()=>{win.webContents.send('test:show',{sessionId:'test',phase:'ready'});await until("halo.classList.contains('show') && rayMenu.isOpen");};
 const healthy=async visible=>{
  await delay(260);
  assert(await js("halo.classList.contains('show') && rayMenu.isOpen && !!rayMenu.shadowRoot.querySelector('.ray-menu-container:not([data-closing])')"),'inner menu remains open');
  assert.equal(await js("!outerRayMenu.hidden"),visible);
  assert.equal(await js("$('outerToggle').getAttribute('aria-pressed')"),String(visible));
 };
 const shot=async name=>{const file=path.join(qaDir,name+'.png');fs.writeFileSync(file,(await win.webContents.capturePage()).toPNG());console.log('SCREENSHOT '+file);};
 await win.loadFile(path.join(__dirname,'../index.html'));
 win.setIgnoreMouseEvents(true);win.show();win.focus();
 await until("typeof rayMenu.open==='function'");await show();await delay(250);await healthy(false);
 const initialInner=await js("rayMenu.items.map(p=>p.id)");await shot('startup-inner-only');
 assert.equal(await js("outerRayMenu.shadowRoot.querySelectorAll('.ray-menu-arc').length"),12);
 assert.equal(await js("rayMenu.shadowRoot.querySelectorAll('.ray-menu-arc').length"),6);
 const geometry=await js("({inner:+rayMenu.getAttribute('radius'),hole:+rayMenu.getAttribute('inner-radius'),outerInner:+outerRayMenu.getAttribute('inner-radius'),outer:+outerRayMenu.getAttribute('radius')})");
 assert(Math.abs(geometry.outerInner-geometry.inner-8)<.001);
 assert(Math.abs((geometry.outer-geometry.outerInner)-(geometry.inner-geometry.hole))<.001);
 const center=await point('.center-split'),add={x:center.x-16,y:center.y},toggle={x:center.x+16,y:center.y};
 const glyphs=await js("Array.from(document.querySelectorAll('.center-glyph')).map(el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,width:r.width,height:r.height}})");
 assert.deepEqual(glyphs,[{...add,width:14,height:14},{...toggle,width:14,height:14}],'small icons centered in each half');
 const rounded=()=>js("[rayMenu,outerRayMenu].every(menu=>Array.from(menu.shadowRoot.querySelectorAll('.ray-menu-arc')).every(p=>(p.getAttribute('d').match(/Q/g)||[]).length===4))");
 assert(await rounded(),'four rounded corners on every inner and outer slot');
 const sideGeometry=await js(`(()=>{return [rayMenu,outerRayMenu].flatMap(menu=>{const radius=+menu.getAttribute('radius'),c=radius+20,arcs=[...menu.shadowRoot.querySelectorAll('.ray-menu-arc')];return arcs.flatMap((p,i)=>{const commands=[...p.getAttribute('d').matchAll(/([MLAQZ])([^MLAQZ]*)/g)].map(m=>({cmd:m[1],n:(m[2].match(/-?\\d*\\.?\\d+(?:e[+-]?\\d+)?/gi)||[]).map(Number)}));const qs=commands.filter(q=>q.cmd==='Q'),ls=commands.filter(q=>q.cmd==='L');return [[qs[0].n.slice(2),ls[0].n,-Math.PI/2+(i+1)*2*Math.PI/arcs.length],[qs[2].n.slice(2),ls[1].n,-Math.PI/2+i*2*Math.PI/arcs.length]].map(([a,b,angle])=>{const n=[-Math.sin(angle),Math.cos(angle)];return {offsetA:(a[0]-c)*n[0]+(a[1]-c)*n[1],offsetB:(b[0]-c)*n[0]+(b[1]-c)*n[1]};});});});})()`);
 for(const edge of sideGeometry){assert(Math.abs(edge.offsetA-edge.offsetB)<1e-6,'straight side parallel to shared boundary');assert(Math.abs(Math.abs(edge.offsetA)-4)<1e-6,'each side is offset by half the 8px gap');}

 assert.equal(await js(`document.elementFromPoint(${add.x},${add.y}).closest('button')?.id`),'centerAdd');
 assert.equal(await js(`document.elementFromPoint(${toggle.x},${toggle.y}).closest('button')?.id`),'outerToggle');
 assert(await js(`!document.elementFromPoint(${center.x},${center.y}).closest('.center-half')`),'center split is a real gap');
 assert(await js(`!document.elementFromPoint(${center.x-36},${center.y}).closest('.center-half')`),'8px clearance to the inner ring');
 await move({x:center.x+80,y:center.y});
 assert.equal(await js("rayMenu.shadowRoot.querySelectorAll('.ray-menu-arc[data-hovered=true]').length"),1,JSON.stringify(await js("({pointer:rayMenu._pointerPosition,position:rayMenu._position,config:rayMenu._config,isOpen:rayMenu.isOpen,html:halo.className})")));
 assert.equal(await js("outerRayMenu.shadowRoot.querySelectorAll('.ray-menu-arc[data-hovered=true]').length"),0);
 await click(toggle);await healthy(true);
 await move({x:center.x+160,y:center.y});
 assert.equal(await js("rayMenu.shadowRoot.querySelectorAll('.ray-menu-arc[data-hovered=true]').length"),0);
 assert.equal(await js("outerRayMenu.shadowRoot.querySelectorAll('.ray-menu-arc[data-hovered=true]').length"),1);
 const visited=new Set();
 for(let i=0;i<12;i++){
  const angle=-Math.PI/2+(i+.5)*Math.PI/6;
  await move({x:Math.round(center.x+160*Math.cos(angle)),y:Math.round(center.y+160*Math.sin(angle))});
  visited.add(await js("outerRayMenu.shadowRoot.querySelector('.ray-menu-arc[data-hovered=true]')?.getAttribute('data-index')"));
  assert.equal(await js("rayMenu.shadowRoot.querySelectorAll('.ray-menu-arc[data-hovered=true]').length"),0);
  await move(add);
  assert.equal(await js("outerRayMenu.shadowRoot.querySelectorAll('.ray-menu-arc[data-hovered=true]').length"),0);
 }
 assert.equal(visited.size,12,'all 12 outer slots can be selected independently');
 await click({x:center.x+160,y:center.y});await healthy(true);assert.equal(inserts,0,'outer slot must not invoke an inner prompt');
 await move({x:5,y:5});
 const styles=await js("(()=>{const props=['fill','stroke','strokeWidth','opacity'];return [document.querySelector('.center-slot'),rayMenu.shadowRoot.querySelector('.ray-menu-arc')].map(el=>props.map(p=>getComputedStyle(el)[p]));})()");
 assert.equal(styles[0][3],'0.16','center shape is faint at rest');
 assert.equal(styles[1][3],'1','inner slots remain opaque');
 assert(await js("Array.from(document.querySelectorAll('.center-glyph')).every(el=>getComputedStyle(el).opacity==='0.12')"),'center glyphs barely visible at rest');
 assert(await js("$('slotEdit').hidden"),'no edit button outside a slot');
 const editableSlots=new Set(),editCorners=[];
 for(let i=0;i<6;i++){
  const angle=-Math.PI/2+(i+.5)*Math.PI/3;
  await move({x:Math.round(center.x+78*Math.cos(angle)),y:Math.round(center.y+78*Math.sin(angle))});
  await until("!$('slotEdit').hidden");const id=await js("$('slotEdit').dataset.promptId");editableSlots.add(id);
  const corner=await point('#slotEdit');editCorners.push(corner);await move(corner);
  assert.equal(await js("!$('slotEdit').hidden && $('slotEdit').dataset.promptId"),id,'each corner is reachable');
 }
 assert.equal(editableSlots.size,6,'all six prompt slots expose their own pencil');
 for(let i=0;i<3;i++){
  assert(Math.abs(editCorners[i].x+editCorners[5-i].x-2*center.x)<=1,'opposite corners mirror horizontally');
  assert(Math.abs(editCorners[i].y-editCorners[5-i].y)<=1,'opposite corners share the same height');
 }
 await move({x:center.x,y:center.y-78});await until("!$('slotEdit').hidden");
 const selectedId=await js("$('slotEdit').dataset.promptId");
 const selectedTitle=await js("prompts.find(p=>p.id===$('slotEdit').dataset.promptId).title");
 const editPoint=await point('#slotEdit');await move(editPoint);
 assert.equal(await js("$('slotEdit').dataset.promptId"),selectedId,'moving onto pencil retains the target');
 assert(await js("!$('slotEdit').hidden"),'pencil remains reachable');
 await shot('slot-edit-hover');
 const beforeEdit=await js("({ids:rayMenu.items.map(p=>p.id),view:{...view},pivot:{...pivot},radius:rayMenu.getAttribute('radius')})");
 await click(editPoint);await until("!editor.hidden");
 assert.equal(await js("$('titleInput').value"),selectedTitle,'pencil opens the highlighted prompt');
 assert.equal(inserts,0,'pencil never inserts a prompt');
 await js("$('contentInput').value+=' 编辑保存回归';");
 await click(await point('#savePromptBtn'));await until("editor.hidden");await healthy(true);
 const afterEdit=await js("({ids:rayMenu.items.map(p=>p.id),view:{...view},pivot:{...pivot},radius:rayMenu.getAttribute('radius')})");
 assert.deepEqual(afterEdit,beforeEdit,'editing returns to the same six slots, view and geometry');
 assert.equal(await js("rayMenu.shadowRoot.querySelectorAll('.ray-menu-arc').length"),6);
 await shot('edit-saved-ring');
 await move({x:center.x+160,y:center.y});assert(await js("$('slotEdit').hidden"),'empty outer slot has no stale edit action');
 await move({x:5,y:5});
 // Render against dense high-contrast text to catch desktop content bleeding through slots.
 await js(`(()=>{const bg=document.createElement('div');bg.id='qaDenseBackdrop';bg.style.cssText='position:fixed;inset:0;z-index:-1;background:#111;color:white;font:18px/24px sans-serif;pointer-events:none;overflow:hidden';bg.textContent='背景文字 Background 123456789 内容密集的聊天页面 '.repeat(500);document.body.prepend(bg);})()`);
 assert(await js("[rayMenu,outerRayMenu].every(menu=>Array.from(menu.shadowRoot.querySelectorAll('.ray-menu-arc')).every(el=>{const s=getComputedStyle(el);return s.opacity==='1'&&s.fill.startsWith('rgb(')}))"),'idle slots fully shield background text');
 await shot('dense-text-idle');await move({x:center.x+80,y:center.y});
 assert(await js("(()=>{const s=getComputedStyle(rayMenu.shadowRoot.querySelector('.ray-menu-arc[data-hovered=true]'));return s.opacity==='1'&&s.fill.startsWith('rgb(')})()"),'highlighted slot fully shields background text');
 await shot('dense-text-selected');await js("document.getElementById('qaDenseBackdrop').remove()");await move({x:5,y:5});
 await shot('idle');await move(add);await shot('center-hover');
 assert(await js("getComputedStyle(document.querySelector('#centerAdd .center-glyph')).opacity==='1' && getComputedStyle(document.querySelector('#outerToggle .center-glyph')).opacity==='0.12'"),'only hovered center control becomes clear');
 const activeStyles=await js("(()=>{const s=getComputedStyle(document.querySelector('.center-slot'));return [s.fill,s.stroke,s.strokeWidth,s.opacity]})()");
 await move({x:center.x+80,y:center.y});
 assert.deepEqual(activeStyles,await js("(()=>{const s=getComputedStyle(rayMenu.shadowRoot.querySelector('.ray-menu-arc[data-hovered=true]'));return [s.fill,s.stroke,s.strokeWidth,s.opacity]})()"),'center and inner hover styles match');
 for(let i=0;i<3;i++){await click(toggle);await healthy(false);await click(toggle);await healthy(true);}
 await click(toggle);await healthy(false);await shot('outer-hidden');
 // Close/reopen before the old component animation timeout would have fired.
 win.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});await delay(20);await show();await healthy(false);
 await click(toggle);await healthy(true);
 await click(add);await until("!editor.hidden");
 assert(await js("getComputedStyle($('centerAdd')).display!=='none' && getComputedStyle(document.querySelector('.center-split')).display==='none'"));
 await click(await point('#editorCancel'));await until("editor.hidden");await healthy(true);
 await click(add);await until("!editor.hidden");
 await click(await point('#titleInput'));
 await until("document.activeElement.id==='titleInput'");await win.webContents.insertText('新增回归');
 await js("$('contentInput').value=Array.from({length:20},(_,i)=>(i+1)+' · 保持角色的姿态、构图和服装细节，让光影更自然。').join('\\n');");
 const editorLayout=await js("(()=>{const e=editor.getBoundingClientRect(),body=$('contentInput').getBoundingClientRect(),save=$('savePromptBtn').getBoundingClientRect();return {width:e.width,bodyHeight:body.height,visible:save.bottom<=innerHeight&&e.top>=0,fields:editor.querySelectorAll('input,textarea,select').length}})()");
 assert.equal(editorLayout.fields,2,'only title and description fields');
 assert(editorLayout.width>=660 && editorLayout.bodyHeight>=280 && editorLayout.visible,'larger body and visible save button');
 assert(await js("!$('categoryInput') && !$('favoriteToggle') && !$('suffixInput')"));
 await shot('editor-filled');
 await click(await point('#savePromptBtn'));await until("editor.hidden && prompts.some(p=>p.title==='新增回归')");await healthy(true);
 assert(await js("Array.from(outerRayMenu.shadowRoot.querySelectorAll('.ray-menu-label')).some(el=>el.textContent.includes('新增回归'))"),'seventh prompt appears in the outer ring');
 assert.deepEqual(await js("rayMenu.items.map(p=>p.id)"),initialInner,'new prompt never displaces inner slots');
 assert(await js("JSON.parse(localStorage.getItem(STORAGE)).some(p=>p.title==='新增回归')"));
 assert(await rounded(),'rounded corners survive saving and rerendering');
 // Existing metadata is retained when only title/description are edited.
 const original=await js("JSON.parse(JSON.stringify(prompts.find(p=>p.id==='p1')))");
 await js("openEditor(prompts.find(p=>p.id==='p1'))");await until("!editor.hidden");
 await js("$('titleInput').value='编辑回归';$('contentInput').value='修改后的描述';");
 await click(await point('#savePromptBtn'));await until("editor.hidden");
 const edited=await js("JSON.parse(localStorage.getItem(STORAGE)).find(p=>p.id==='p1')");
 assert.equal(edited.title,'编辑回归');assert.equal(edited.content,'修改后的描述');
 for(const key of ['category','tags','suffixes','favorite','appendSuffix','uses'])assert.deepEqual(edited[key],original[key],key+' preserved');
 await healthy(true);
 assert.equal(inserts,0,'center/editor must never insert a prompt');
 // The new outer slot can be highlighted, edited and invoked independently.
 const outerPoint={x:Math.round(center.x+160*Math.cos(-Math.PI/2+Math.PI/12)),y:Math.round(center.y+160*Math.sin(-Math.PI/2+Math.PI/12))};
 await move(outerPoint);await until("!$('slotEdit').hidden");
 assert.equal(await js("prompts.find(p=>p.id===$('slotEdit').dataset.promptId).title"),'新增回归');
 await click(await point('#slotEdit'));await until("!editor.hidden");
 assert.equal(await js("$('titleInput').value"),'新增回归');
 await js("$('titleInput').value='外圈编辑';");await click(await point('#savePromptBtn'));await until("editor.hidden");await healthy(true);
 assert.deepEqual(await js("rayMenu.items.map(p=>p.id)"),initialInner);
 await shot('outer-prompt-saved');
 await click(outerPoint);await until("!$('haloHint').hidden");assert.equal(inserts,1,'outer slot invokes once');
 await show();await healthy(false);
 assert.deepEqual(await js("rayMenu.items.map(p=>p.id)"),initialInner,'usage and reload preserve inner slots');
 await click(toggle);await healthy(true);
 assert.equal(await js("outerRayMenu.items[0].label"),'外圈编辑','outer edit persists after reopening');

 // Saving while the outer ring is hidden never opens it automatically.
 await click(toggle);await healthy(false);await click(add);await until("!editor.hidden");
 await js("$('titleInput').value='外圈第二条';$('contentInput').value='隐藏外圈时新增';");
 await click(await point('#savePromptBtn'));await until("editor.hidden");await healthy(false);
 assert.deepEqual(await js("rayMenu.items.map(p=>p.id)"),initialInner);
 await click(toggle);await healthy(true);
 assert.equal(await js("outerRayMenu.items.filter(p=>p.type==='prompt').length"),2);
 assert.equal(await js("prompts.find(p=>p.id===outerRayMenu.items[1].id).title"),'外圈第二条');
 // Inner selection still reaches the existing insertion bridge exactly once.
 await click({x:center.x,y:center.y-78});await until("!$('haloHint').hidden");assert.equal(inserts,2);
 assert.deepEqual(errors,[]);
 console.log('PASS: real renderer pointer clicks, split spacing/styles, exclusive hover, repeated outer toggle, close/reopen, add/cancel/save, localStorage, stable inner slots, hidden startup, outer add/edit/invocation');
 app.exit(0);
}).catch(e=>{console.error(e);app.exit(1);});
