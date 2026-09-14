const seedPrompts = [
  { id: 'p1', title: '电影感角色立绘', category: '图像编辑', tags: ['角色', '电影感'], favorite: true, uses: 42, updated: '刚刚', content: 'Create a cinematic character key art of {subject}, three-quarter view, expressive silhouette, dramatic rim light, rich material details, subtle atmospheric perspective, production concept art quality.', suffixes: ['no text', 'clean silhouette'] },
  { id: 'p2', title: '统一为暗黑奇幻风格', category: '风格迁移', tags: ['风格', '氛围'], favorite: true, uses: 31, updated: '今天 09:42', content: 'Transform the image into a dark fantasy concept art style. Keep the original composition and character identity, add moody volumetric lighting, worn textures, deep charcoal shadows and restrained crimson accents.', suffixes: ['high detail', 'no watermark'] },
  { id: 'p3', title: '补全画面边缘', category: '补图裁剪', tags: ['补图', '构图'], favorite: false, uses: 18, updated: '昨天', content: 'Extend the canvas naturally on all sides. Continue the existing perspective, lighting direction and texture language. Do not introduce new focal subjects; preserve the visual hierarchy and blend the seams invisibly.', suffixes: ['seamless', 'match original'] },
  { id: 'p4', title: '材质细节增强', category: '图像编辑', tags: ['材质', '细节'], favorite: false, uses: 24, updated: '周一', content: 'Enhance the material read of {subject}: sharpen edge definition, surface breakup and believable micro texture while preserving the original shape, palette and lighting design.', suffixes: ['controlled contrast'] },
  { id: 'p5', title: '正面转三分之二侧脸', category: '转向与姿态', tags: ['转向', '角色'], favorite: false, uses: 12, updated: '03 / 18', content: 'Rotate {subject} into a natural three-quarter view facing left. Preserve facial identity, hairstyle, costume details and proportions. Keep the camera at the same height and lens feel.', suffixes: ['anatomically correct'] },
  { id: 'p6', title: '柔和晨光氛围', category: '氛围与光影', tags: ['光影', '色调'], favorite: false, uses: 9, updated: '03 / 16', content: 'Re-light the scene with soft early morning light, cool ambient shadows and a warm directional key. Keep contrast gentle, colors nuanced and the atmosphere calm but dimensional.', suffixes: ['subtle grain'] }
];
const categories = [
  { name: '全部提示词', icon: '⌘' }, { name: '最近使用', icon: '↺' }, { name: '收藏', icon: '☆' }, { name: '图像编辑', icon: '◫' }, { name: '风格迁移', icon: '◈' }, { name: '补图裁剪', icon: '□' }, { name: '转向与姿态', icon: '↗' }, { name: '氛围与光影', icon: '◌' }
];
let prompts = JSON.parse(localStorage.getItem('prompt-halo-prompts') || 'null') || seedPrompts;
let selectedId = prompts[0]?.id || null;
let selectedCategory = '全部提示词';
let lastInserted = localStorage.getItem('prompt-halo-last') || '';
let sortRecent = true;
let toastTimer;
let nativeSessionId = null;
let insertionPending = false;
const nativeOverlay = location.hash === '#overlay' && !!window.promptHalo;
let gesture = { active: false, startX: 0, startY: 0, target: null, altSpace: false };

const $ = (id) => document.getElementById(id);
const promptGrid = $('promptGrid');
const categoryNav = $('categoryNav');
const searchInput = $('searchInput');
const demoInput = $('demoInput');
const halo = $('halo');
const haloBackdrop = $('haloBackdrop');
const haloPanel = $('haloPanel');

function persist() { localStorage.setItem('prompt-halo-prompts', JSON.stringify(prompts)); }
function getSelected() { return prompts.find(p => p.id === selectedId) || prompts[0]; }
function categoryCount(name) { return name === '全部提示词' ? prompts.length : name === '最近使用' ? prompts.filter(p => p.uses > 0).length : prompts.filter(p => p.category === name || (name === '收藏' && p.favorite)).length; }
function renderCategories() {
  categoryNav.innerHTML = categories.map(c => `<button class="category-item ${selectedCategory === c.name ? 'active' : ''}" data-category="${c.name}"><span class="cat-label"><span class="cat-icon">${c.icon}</span>${c.name}</span><span class="count">${String(categoryCount(c.name)).padStart(2, '0')}</span></button>`).join('');
  categoryNav.querySelectorAll('.category-item').forEach(btn => btn.addEventListener('click', () => { selectedCategory = btn.dataset.category; renderCategories(); renderLibrary(); }));
}
function filteredPrompts() {
  const q = searchInput.value.trim().toLowerCase();
  let list = prompts.filter(p => selectedCategory === '全部提示词' || (selectedCategory === '最近使用' ? p.uses > 0 : selectedCategory === '收藏' ? p.favorite : p.category === selectedCategory));
  if (q) list = list.filter(p => [p.title, p.content, p.category, ...p.tags].join(' ').toLowerCase().includes(q));
  return list.sort((a, b) => sortRecent ? b.uses - a.uses : a.title.localeCompare(b.title, 'zh'));
}
function renderLibrary() {
  const list = filteredPrompts();
  $('libraryTitle').textContent = selectedCategory;
  $('promptCount').textContent = String(list.length).padStart(2, '0');
  $('resultHint').textContent = searchInput.value ? `匹配 ${list.length} 条提示词` : `显示 ${list.length} 条提示词`;
  const active = $('activeFilter');
  if (selectedCategory !== '全部提示词') { active.hidden = false; active.querySelector('b').textContent = selectedCategory; } else active.hidden = true;
  if (!list.length) { promptGrid.innerHTML = `<div class="empty-state"><div><div class="empty-symbol">＋</div><h3>还没有匹配的提示词</h3><p>试试换一个关键词，或新建一条可复用的工作流。</p></div></div>`; return; }
  promptGrid.innerHTML = list.map((p, i) => `<article class="prompt-card ${p.id === selectedId ? 'selected' : ''}" data-id="${p.id}" style="--index:${i}"><div class="card-top"><span class="card-category">${p.category}</span><button class="favorite ${p.favorite ? 'active' : ''}" data-favorite="${p.id}" aria-label="收藏">${p.favorite ? '★' : '☆'}</button></div><h3>${escapeHtml(p.title)}</h3><div class="prompt-preview">${escapeHtml(p.content)}</div><div class="card-meta"><span class="card-tags">${p.tags.slice(0,2).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</span><span>${p.uses} uses · ${p.updated}</span></div></article>`).join('');
  promptGrid.querySelectorAll('.prompt-card').forEach(card => { card.addEventListener('click', (e) => { if (e.target.closest('[data-favorite]')) return; selectedId = card.dataset.id; renderLibrary(); fillEditor(); }); card.addEventListener('dblclick', () => { selectedId = card.dataset.id; fillEditor(); $('titleInput').focus(); }); card.addEventListener('mousemove', e => { const r = card.getBoundingClientRect(); card.style.setProperty('--mx', `${((e.clientX-r.left)/r.width)*100}%`); card.style.setProperty('--my', `${((e.clientY-r.top)/r.height)*100}%`); }); });
  promptGrid.querySelectorAll('[data-favorite]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); const p = prompts.find(x => x.id === btn.dataset.favorite); p.favorite = !p.favorite; persist(); renderCategories(); renderLibrary(); if (p.id === selectedId) fillEditor(); }));
}
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fillEditor() {
  const p = getSelected(); if (!p) return;
  $('titleInput').value = p.title; $('contentInput').value = p.content; $('favoriteToggle').checked = !!p.favorite; $('charCount').textContent = `${p.content.length} chars`; $('categorySelect').innerHTML = `${p.category} <span>⌄</span>`;
  $('suffixStack').innerHTML = (p.suffixes || []).map((s, i) => `<span class="suffix-chip">${escapeHtml(s)}<button data-remove-suffix="${i}" aria-label="删除后缀">×</button></span>`).join('');
  $('suffixStack').querySelectorAll('[data-remove-suffix]').forEach(b => b.addEventListener('click', () => { p.suffixes.splice(Number(b.dataset.removeSuffix), 1); fillEditor(); }));
  $('editorMode').textContent = p.title ? '编辑提示词' : '新建提示词';
}
function saveEditor() { const p = getSelected(); if (!p) return; p.title = $('titleInput').value.trim() || '未命名提示词'; p.content = $('contentInput').value.trim(); p.favorite = $('favoriteToggle').checked; p.updated = '刚刚'; persist(); renderCategories(); renderLibrary(); fillEditor(); setHaloHint('点击分类选择；Space 轨迹为可选'); showToast('已保存更改', '提示词内容已更新'); }
function createPrompt() { const p = { id: 'p' + Date.now(), title: '未命名提示词', category: '图像编辑', tags: ['新建'], favorite: false, uses: 0, updated: '刚刚', content: 'Describe the desired result for {subject}…', suffixes: [] }; prompts.unshift(p); selectedId = p.id; selectedCategory = '全部提示词'; persist(); renderCategories(); renderLibrary(); fillEditor(); setHaloHint('点击分类选择；Space 轨迹为可选'); $('titleInput').focus(); }
async function injectPrompt(p) {
  if(!p || insertionPending)return;
  insertionPending=true;
  const suffix = ($('suffixToggle')?.checked ?? true) && p.suffixes?.length ? '\n\n'+p.suffixes.join(', ') : '';
  const text=p.content+suffix;
  const before=demoInput.value;
  try {
    if(nativeOverlay){
      const sessionId=nativeSessionId;
      // Hide renderer visuals only: the main process consumes the captured target atomically.
      const result=await window.promptHalo.insertExternal(text,sessionId);
      if(!result.ok){if(result.keepOpen)setHaloHint(result.reason);else showToast('未完成输入',result.reason);return;}
    } else {
      closeHalo();
      const start=demoInput.selectionStart, end=demoInput.selectionEnd;
      demoInput.setRangeText(text,start,end,'end');demoInput.focus();
      demoInput.classList.remove('injected');void demoInput.offsetWidth;demoInput.classList.add('injected');
    }
    p.uses+=1;p.updated='刚刚';lastInserted=text;
    localStorage.setItem('prompt-halo-last',text);
    localStorage.setItem('prompt-halo-last-id',p.id);
    persist();renderLibrary();$('lastUsedLabel').textContent=p.title.slice(0,13);
    if(!nativeOverlay)showToast('已插入演示输入框',p.title,()=>{demoInput.value=before;});
  } catch(error){showToast('未完成输入',error.message);}
  finally{insertionPending=false;}
}
function showToast(title, body, undo) { $('toastTitle').textContent = title; $('toastBody').textContent = body; $('toastUndo').style.display = undo ? 'block' : 'none'; $('toastUndo').onclick = () => { undo?.(); $('toast').classList.remove('show'); }; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 4200); }
function openHalo({ gestureMode = false } = {}) {
  haloPanel.classList.remove('show');
  haloPanel.innerHTML = '';
  haloBackdrop.classList.add('show');
  halo.classList.add('show');
  halo.setAttribute('aria-hidden','false');
  halo.classList.toggle('gesture-ready', gestureMode);
  if (gestureMode) setHaloHint('按住 SPACE，移动鼠标选择方向');
}
function setHaloHint(text) { const hint = $('haloHint'); if (hint) hint.textContent = text; }
function directionForDelta(dx, dy) {
  const distance = Math.hypot(dx, dy);
  if (distance < 36) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'category' : 'favorite';
  return dy > 0 ? 'search' : 'recent';
}
function highlightGestureTarget(target) {
  document.querySelectorAll('.halo-action').forEach(btn => btn.classList.toggle('gesture-target', btn.dataset.action === target));
  gesture.target = target;
  const labels = { recent: '最近使用', category: '图像编辑', search: '搜索提示词', favorite: '收藏提示词' };
  setHaloHint(target ? `松开 SPACE：${labels[target]}` : '移动鼠标选择方向');
}
function beginGesture({ altSpace = false } = {}) {
  const point = gesture.lastPoint || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  gesture.active = true; gesture.altSpace = altSpace; gesture.startX = point.x; gesture.startY = point.y; gesture.target = null;
  openHalo({ gestureMode: true });
  halo.classList.add('gesture-active');
  highlightGestureTarget(null);
}
function finishGesture() {
  if (!gesture.active) return;
  const action = gesture.target;
  gesture.active = false; gesture.altSpace = false; gesture.target = null;
  halo.classList.remove('gesture-active');
  document.querySelectorAll('.halo-action').forEach(btn => btn.classList.remove('gesture-target'));
  if (action) renderHaloPanel(action);
  else setHaloHint('点击圆环按钮，或再次按住 SPACE 选择');
}
function closeHalo({native=true} = {}) {
  gesture.active=false;gesture.target=null;
  halo.classList.remove('gesture-active','gesture-ready','show');
  document.querySelectorAll('.halo-action').forEach(btn=>btn.classList.remove('gesture-target'));
  haloBackdrop.classList.remove('show');haloPanel.classList.remove('show');
  halo.setAttribute('aria-hidden','true');
  if(nativeOverlay && native)window.promptHalo.hideOverlay();
}
function bindPanelPromptButtons() {
  haloPanel.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', () => {
      const prompt = prompts.find(item => item.id === button.dataset.prompt);
      if (prompt) injectPrompt(prompt);
    });
  });
}
function renderPromptPanel(title, list, icon = '↗') {
  haloPanel.innerHTML = `<div class="panel-title">${escapeHtml(title)}</div>${list.map((p, i) => `<button class="panel-item" data-prompt="${p.id}"><span>${icon}</span><span><b>${escapeHtml(p.title)}</b><small>${escapeHtml(p.category)}</small></span><kbd>${i + 1}</kbd></button>`).join('')}` || '<div class="panel-title">没有可用提示词</div>';
  positionPanel();
  haloPanel.classList.add('show');
  bindPanelPromptButtons();
}
function renderCategoryPromptPanel(category) {
  const list = prompts.filter(p => p.category === category).sort((a, b) => b.uses - a.uses);
  haloPanel.innerHTML = `<button class="panel-back" id="panelBack">← 所有分类</button><div class="panel-title">${escapeHtml(category)}</div>${list.map((p, i) => `<button class="panel-item" data-prompt="${p.id}"><span>↗</span><span><b>${escapeHtml(p.title)}</b><small>${escapeHtml(p.tags.join(' · '))}</small></span><kbd>${i + 1}</kbd></button>`).join('') || '<div class="panel-title">这个分类还没有提示词</div>'}`;
  positionPanel();
  haloPanel.classList.add('show');
  $('panelBack')?.addEventListener('click', () => renderHaloPanel('category'));
  bindPanelPromptButtons();
}
async function renderHaloPanel(action) {
  const sets = {
    recent: prompts.slice().sort((a, b) => b.uses - a.uses).slice(0, 4),
    favorite: prompts.filter(p => p.favorite).slice(0, 4)
  };
  if (action === 'search') {
    if(nativeOverlay){const access=await window.promptHalo.acquireKeyboard();if(!access.ok){setHaloHint(access.reason);return;}}
    haloPanel.innerHTML = `<div class="panel-title">COMMAND SEARCH</div><label class="search-box" style="width:100%"><span>⌕</span><input id="haloSearch" autofocus placeholder="输入关键词并回车…" /></label><div id="haloSearchResults"></div>`;
    positionPanel(); haloPanel.classList.add('show');
    const hs = $('haloSearch'); hs.focus(); hs.addEventListener('input', () => renderSearchResults(hs.value)); hs.addEventListener('keydown', e => { if(e.key==='Enter'&&!e.isComposing){e.preventDefault();haloPanel.querySelector('[data-prompt]')?.click();} if (e.key === 'Escape') closeHalo(); });
    renderSearchResults(''); return;
  }
  if (action === 'category') {
    const categoryItems = categories.slice(3).filter(c => prompts.some(p => p.category === c.name));
    haloPanel.innerHTML = `<div class="panel-title">按分类选择提示词</div>${categoryItems.map((c, i) => `<button class="panel-item" data-category="${escapeHtml(c.name)}"><span>◈</span><span><b>${escapeHtml(c.name)}</b><small>${categoryCount(c.name)} 条提示词</small></span><kbd>${i + 1}</kbd></button>`).join('')}`;
    positionPanel(); haloPanel.classList.add('show');
    haloPanel.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => renderCategoryPromptPanel(button.dataset.category)));
    return;
  }
  renderPromptPanel(action === 'recent' ? '最近使用' : '收藏提示词', sets[action] || []);
}
function renderSearchResults(q) { const res = prompts.filter(p => !q || [p.title,p.content,p.category,...p.tags].join(' ').toLowerCase().includes(q.toLowerCase())).slice(0,5); $('haloSearchResults').innerHTML = res.map((p,i) => `<button class="panel-item" data-prompt="${p.id}"><span>↗</span><span><b>${escapeHtml(p.title)}</b><small>${escapeHtml(p.category)}</small></span><kbd>${i+1}</kbd></button>`).join('') || '<div class="panel-title" style="margin-top:12px">没有匹配结果</div>'; $('haloSearchResults').querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>injectPrompt(prompts.find(p=>p.id===b.dataset.prompt)))); }
function positionPanel() { if (location.hash === '#overlay') { haloPanel.style.left = '294px'; haloPanel.style.top = '32px'; return; } const r = halo.getBoundingClientRect(); haloPanel.style.left = `${Math.min(window.innerWidth - 270, r.right + 16)}px`; haloPanel.style.top = `${Math.max(18, r.top + 6)}px`; }

$('haloLauncher').addEventListener('click', () => openHalo({ gestureMode: false })); $('newPromptBtn').addEventListener('click', createPrompt); $('savePromptBtn').addEventListener('click', saveEditor); $('duplicateBtn').addEventListener('click', () => { const p = getSelected(); if (!p) return; const copy = {...p, id:'p'+Date.now(), title:p.title+' · 副本', uses:0, updated:'刚刚'}; prompts.unshift(copy); selectedId=copy.id; persist(); renderCategories(); renderLibrary(); fillEditor(); setHaloHint('点击分类选择；Space 轨迹为可选'); showToast('已创建副本', '你可以继续调整这条提示词'); }); $('addSuffixBtn').addEventListener('click', () => { const p = getSelected(); const val = window.prompt('输入一个常用后缀'); if (val?.trim()) { p.suffixes = p.suffixes || []; p.suffixes.push(val.trim()); fillEditor(); } }); $('contentInput').addEventListener('input', e => $('charCount').textContent = `${e.target.value.length} chars`); $('favoriteToggle').addEventListener('change', () => { const p=getSelected(); if(p){p.favorite=$('favoriteToggle').checked; persist(); renderCategories(); renderLibrary();} }); $('sortBtn').addEventListener('click', () => { sortRecent = !sortRecent; $('sortBtn').innerHTML = `${sortRecent ? '最近使用' : '名称排序'} <span>↕</span>`; renderLibrary(); }); searchInput.addEventListener('input', renderLibrary); $('activeFilter').querySelector('button').addEventListener('click', () => { selectedCategory='全部提示词'; renderCategories(); renderLibrary(); }); $('settingsBtn').addEventListener('click', async () => { $('settingsModal').hidden=false; if(window.promptHalo){const info=await window.promptHalo.diagnostics();let box=$('inputDiagnostics');if(!box){box=document.createElement('pre');box.id='inputDiagnostics';box.style.cssText='font-size:10px;white-space:pre-wrap;max-height:230px;overflow:auto';document.querySelector('.modal-card').append(box);}box.textContent='运行版本：'+info.build+'\n诊断文件：'+info.path+'\n'+JSON.stringify(info.events.slice(-5),null,2);} }); $('modalClose').addEventListener('click', () => $('settingsModal').hidden = true); $('modalDone').addEventListener('click', () => $('settingsModal').hidden = true); haloBackdrop.addEventListener('click', closeHalo); $('closeEditorBtn').addEventListener('click', () => { selectedId = null; $('editorMode').textContent = '编辑提示词'; }); $('haloCenter').addEventListener('click', () => closeHalo()); document.querySelectorAll('.halo-action').forEach(btn => btn.addEventListener('click', () => renderHaloPanel(btn.dataset.action)));
document.addEventListener('pointermove', e => {
  gesture.lastPoint = { x: e.clientX, y: e.clientY };
  if (gesture.active) highlightGestureTarget(directionForDelta(e.clientX - gesture.startX, e.clientY - gesture.startY));
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeHalo(); $('settingsModal').hidden = true; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchInput.focus(); return; }
  if (!nativeOverlay && !window.promptHalo && e.ctrlKey && e.altKey && !e.shiftKey && e.code === 'KeyQ' && !e.repeat) { e.preventDefault(); if(halo.classList.contains('show'))closeHalo();else openHalo(); }
  if (e.code === 'Space' && !e.repeat && halo.classList.contains('show') && !gesture.active && !e.altKey && !e.ctrlKey && !e.shiftKey && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); beginGesture(); }
  if (!e.target.closest?.('input,textarea,[contenteditable=true]') && halo.classList.contains('show') && ['1','2','3','4','5','6'].includes(e.key)) { const btn=haloPanel.querySelectorAll('[data-prompt]')[Number(e.key)-1]; btn?.click(); }
});
document.addEventListener('keyup', e => { if (e.code === 'Space' && gesture.active) { e.preventDefault(); finishGesture(); } });
document.addEventListener('pointerdown', e => { if (location.hash === '#overlay' && halo.classList.contains('show') && !e.target.closest('.halo, .halo-panel')) closeHalo(); });
renderCategories(); renderLibrary(); fillEditor();
setHaloHint('点击分类，再点击提示词；Esc 取消');
if(nativeOverlay){
  document.documentElement.classList.add('overlay-mode');document.body.classList.add('overlay-mode');
  window.promptHalo.onOverlayShow(data=>{
    nativeSessionId=data.sessionId;
    try { const latest=JSON.parse(localStorage.getItem('prompt-halo-prompts'));if(Array.isArray(latest))prompts=latest;} catch {}
    openHalo();setHaloHint('正在检查输入目标 · 中央 × 或 Esc 关闭');
    $('lastUsedLabel').textContent='关闭菜单';
  });
  window.promptHalo.onTargetState?.(data=>{if(data.sessionId!==nativeSessionId||!halo.classList.contains('show'))return;setHaloHint(data.phase==='ready'?'输入到 '+data.processName+' · 中央 × 或 Esc 关闭':data.reason);});
  window.promptHalo.onOverlayHide(()=>closeHalo({native:false}));
}
