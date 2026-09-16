const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const MAX_PROMPTS = 18;
const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 20000;
const BACKUP_LIMIT = 10;
const LIBRARY_FORMAT = 'prompt-halo-library';
const LIBRARY_VERSION = 1;

function validate(raw) {
  if (!Array.isArray(raw) && (raw?.format !== LIBRARY_FORMAT || raw?.version !== LIBRARY_VERSION)) {
    throw Error('不支持的词库文件版本');
  }

  const list = Array.isArray(raw) ? raw : raw?.prompts;
  if (!Array.isArray(list) || list.length > MAX_PROMPTS) {
    throw Error('词库必须是最多 18 条提示词的列表');
  }

  const ids = new Set();
  const slots = new Set();
  return list.map((prompt, index) => {
    if (!prompt || typeof prompt !== 'object' ||
        typeof prompt.id !== 'string' || !prompt.id || ids.has(prompt.id) ||
        typeof prompt.title !== 'string' || !prompt.title.trim() || prompt.title.length > MAX_TITLE_LENGTH ||
        typeof prompt.content !== 'string' || !prompt.content.trim()) {
      throw Error('第 ' + (index + 1) + ' 条的标题、正文或标识无效');
    }
    if (prompt.suffixes !== undefined &&
        (!Array.isArray(prompt.suffixes) || prompt.suffixes.some(suffix => typeof suffix !== 'string'))) {
      throw Error('后缀格式无效');
    }
    const suffix = prompt.appendSuffix !== false && prompt.suffixes?.length
      ? '\n\n' + prompt.suffixes.join(', ')
      : '';
    if ((prompt.content + suffix).length > MAX_CONTENT_LENGTH) {
      throw Error('单条内容超过 20000 字符');
    }

    const slot = prompt.slotOrder ?? index;
    if (!Number.isInteger(slot) || slot < 0 || slot >= MAX_PROMPTS || slots.has(slot)) {
      throw Error('扇区位置重复或超出 18 个位置');
    }
    ids.add(prompt.id);
    slots.add(slot);
    return { ...prompt, slotOrder: slot };
  });
}

function merge(current, incoming) {
  const result = validate(current);
  const extra = validate(incoming);
  const indexById = new Map(result.map((prompt, index) => [prompt.id, index]));
  const occupiedSlots = new Set(result.map(prompt => prompt.slotOrder));

  for (const prompt of extra) {
    const index = indexById.get(prompt.id);
    if (index !== undefined) {
      // Updating content must not move an existing prompt to another sector.
      result[index] = { ...prompt, slotOrder: result[index].slotOrder };
      continue;
    }

    let slot = 0;
    while (occupiedSlots.has(slot)) slot++;
    if (slot >= MAX_PROMPTS) {
      throw Error('合并后超过 18 条，请减少条目或选择替换');
    }
    occupiedSlots.add(slot);
    indexById.set(prompt.id, result.length);
    result.push({ ...prompt, slotOrder: slot });
  }
  return validate(result);
}

function backup(dir, list) {
  validate(list);
  fs.mkdirSync(dir, { recursive: true });
  const body = JSON.stringify({ format: LIBRARY_FORMAT, version: LIBRARY_VERSION, prompts: list }, null, 2);
  const digest = crypto.createHash('sha256').update(body).digest('hex');
  const file = path.join(dir, Date.now() + '-' + digest.slice(0, 12) + '.json');
  const temp = file + '.tmp';
  // Publish the complete backup before pruning older snapshots.
  fs.writeFileSync(temp, body, 'utf8');
  fs.renameSync(temp, file);

  const files = fs.readdirSync(dir)
    .filter(name => /^\d+-[a-f0-9]+\.json$/.test(name))
    .sort()
    .reverse();
  for (const name of files.slice(BACKUP_LIMIT)) {
    fs.unlinkSync(path.join(dir, name));
  }
  return file;
}

module.exports = { validate, merge, backup };
