import fs from 'node:fs';
const html = fs.readFileSync('/root/.claude/uploads/cb2c4621-a360-5212-8435-c4dad54e9493/d87a0cd3-______.html','utf8');
const m = html.match(/<style>([\s\S]*?)<\/style>/);
if(!m){ console.error('no style'); process.exit(1); }
fs.writeFileSync('src/app/isp.css', '/* Ported from the original standalone HTML (個別支援計画管理). */\n' + m[1].trim() + '\n');
console.log('isp.css bytes:', m[1].length);
