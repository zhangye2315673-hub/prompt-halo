const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function validate(raw){
 if(!Array.isArray(raw)&&(raw?.format!=="prompt-halo-library"||raw?.version!==1))throw Error("不支持的词库文件版本");
 const list=Array.isArray(raw)?raw:raw?.prompts;
 if(!Array.isArray(list)||list.length>18)throw Error('词库必须是最多 18 条提示词的列表');
 const ids=new Set(),slots=new Set();
 return list.map((p,i)=>{
  if(!p||typeof p!=='object'||typeof p.id!=='string'||!p.id||ids.has(p.id)||typeof p.title!=='string'||!p.title.trim()||p.title.length>100||typeof p.content!=='string'||!p.content.trim())throw Error('第 '+(i+1)+' 条的标题、正文或标识无效');
  if(p.suffixes!==undefined&&(!Array.isArray(p.suffixes)||p.suffixes.some(s=>typeof s!=='string')))throw Error('后缀格式无效');
  if((p.content+(p.appendSuffix!==false&&p.suffixes?.length?'\n\n'+p.suffixes.join(', '):'')).length>20000)throw Error('单条内容超过 20000 字符');
  const slot=p.slotOrder??i;if(!Number.isInteger(slot)||slot<0||slot>=18||slots.has(slot))throw Error('扇区位置重复或超出 18 个位置');
  ids.add(p.id);slots.add(slot);return {...p,slotOrder:slot};
 });
}
function merge(current,incoming){const result=validate(current),extra=validate(incoming);for(const p of extra){const index=result.findIndex(x=>x.id===p.id);if(index>=0)result[index]={...p,slotOrder:result[index].slotOrder};else{const slot=Array.from({length:18},(_,i)=>i).find(i=>!result.some(x=>x.slotOrder===i));if(slot===undefined)throw Error('合并后超过 18 条，请减少条目或选择替换');result.push({...p,slotOrder:slot});}}return validate(result);}
function backup(dir,list){validate(list);fs.mkdirSync(dir,{recursive:true});const body=JSON.stringify({format:'prompt-halo-library',version:1,prompts:list},null,2);const digest=crypto.createHash('sha256').update(body).digest('hex');const name=Date.now()+'-'+digest.slice(0,12)+'.json';const file=path.join(dir,name);const temp=file+'.tmp';fs.writeFileSync(temp,body,'utf8');fs.renameSync(temp,file);const files=fs.readdirSync(dir).filter(n=>/^\d+-[a-f0-9]+\.json$/.test(n)).sort().reverse();for(const n of files.slice(10))fs.unlinkSync(path.join(dir,n));return file;}
module.exports={validate,merge,backup};
