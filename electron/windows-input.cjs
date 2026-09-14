const { spawn } = require('node:child_process');
const readline = require('node:readline');
const path = require('node:path');
class WindowsInput {
  constructor() {
    this.pending = new Map(); this.nextId = 1;
    this.ready = new Promise((resolve, reject) => { this.resolveReady = resolve; this.rejectReady = reject; });
    this.child = spawn('powershell.exe', ['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'windows-input.ps1')], { windowsHide: true, stdio: ['pipe','pipe','pipe'] });
    this.child.stderr.on('data', data => { this.lastStderr = String(data); });
    this.child.on('error', error => this.fail(error)); this.child.on('exit', () => this.fail(new Error('系统输入服务已退出')));
    readline.createInterface({ input: this.child.stdout }).on('line', line => { let msg; try { msg = JSON.parse(line); } catch { return; } if (msg.ready) { this.resolveReady(); return; } const item = this.pending.get(msg.id); if (!item) return; clearTimeout(item.timer); this.pending.delete(msg.id); if (msg.error) item.reject(new Error(msg.error)); else item.resolve(msg); });
    this.startTimer = setTimeout(() => this.fail(new Error('系统输入服务启动超时')), 10000); this.ready.then(() => clearTimeout(this.startTimer), () => clearTimeout(this.startTimer));
  }
  fail(error) { this.rejectReady(error); for (const item of this.pending.values()) { clearTimeout(item.timer); item.reject(error); } this.pending.clear(); }
  async request(action, args = {}) { await this.ready; if (this.child.exitCode !== null || this.child.killed) throw new Error('系统输入服务不可用'); return new Promise((resolve, reject) => { const id = this.nextId++; const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('系统输入操作超时')); }, 4000); this.pending.set(id, { resolve, reject, timer }); this.child.stdin.write(JSON.stringify({ ...args, action, id }) + '\n', error => { if (error) { clearTimeout(timer); this.pending.delete(id); reject(error); } }); }); }
  stop() { clearTimeout(this.startTimer); this.child.stdin.end(); this.child.kill(); }
}
module.exports = { WindowsInput };
