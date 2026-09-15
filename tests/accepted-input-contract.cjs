// Guards the user-accepted native input implementation during UI-only changes.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),contract=require('./accepted-input-contract.json');
for(const [file,hash] of Object.entries(contract.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n')).digest('hex'),hash,file+' changed: input revalidation required');
const source=fs.readFileSync(path.join(root,'electron/main.cjs'),'utf8').replace(/\r\n/g,'\n');
assert.equal(source.split('async function pasteIntoPreviousApp')[1].split('function createTray')[0],contract.pasteFunction,'Focus restoration / paste implementation changed');
assert(source.includes('focusable:true')&&source.includes('haloWindow.showInactive()'),'Keep accepted window focus behavior');
console.log('PASS: accepted native service and restore/check/paste function unchanged');
