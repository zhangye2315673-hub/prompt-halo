const http=require('node:http');
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');const {spawn}=require('node:child_process');
const resultFile=process.env.PROMPT_HALO_RECEIVER_RESULT;
let current={};let chrome;const title='Halo local input regression '+require('node:crypto').randomUUID();
const server=http.createServer((req,res)=>{
 if(req.method==='POST'){let body='';req.on('data',b=>body+=b);req.on('end',()=>{try{current={...JSON.parse(body),ready:true,pid:chrome.pid,title};fs.writeFileSync(resultFile,JSON.stringify(current));res.end('ok');}catch{res.writeHead(400);res.end();}});return;}
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.end(`<!doctype html><title>${title}</title><style>body{font:18px system-ui;padding:30px}#target{border:2px solid #185;height:160px;white-space:pre-wrap}textarea{width:95%;height:60px}</style><p>Local contenteditable input. No messages are sent.</p><textarea id="other">DO NOT CHANGE</textarea><div id="target" role="textbox" contenteditable="true">BEFOREAFTER</div><script>
 let pastes=0, inputs=0, blurs=0; let keys=[];const t=document.querySelector('#target');
 t.addEventListener('keydown',e=>{keys.push({key:e.key,ctrl:e.ctrlKey,alt:e.altKey,shift:e.shiftKey});keys=keys.slice(-12)});t.addEventListener('paste',()=>pastes++);t.addEventListener('input',()=>inputs++);window.addEventListener('blur',()=>blurs++);
 t.focus();const r=document.createRange();r.setStart(t.firstChild,6);r.collapse(true);const s=getSelection();s.removeAllRanges();s.addRange(r);
 setInterval(()=>fetch('/result',{method:'POST',body:JSON.stringify({value:t.innerText,other:document.querySelector('#other').value,pastes,inputs,blurs,keys,focused:document.activeElement===t})}),80);
 </script>`);
});
server.listen(0,'127.0.0.1',()=>{
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'halo-chrome-test-'));
 chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',[`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check',`--app=http://127.0.0.1:${server.address().port}`,'--window-size=700,430'],{windowsHide:false,stdio:'ignore'});
 chrome.on('exit',()=>server.close(()=>process.exit(0)));
});
process.on('exit',()=>chrome?.kill());
