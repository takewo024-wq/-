import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('/root/.claude/uploads/cb2c4621-a360-5212-8435-c4dad54e9493/d87a0cd3-______.html','utf8');
const m = html.match(/<script>([\s\S]*)<\/script>/);
if(!m){ console.error('no script'); process.exit(1); }
const code = m[1];

// localStorage backed by Map
const store = new Map();
const localStorage = {
  getItem: k => store.has(k) ? store.get(k) : null,
  setItem: (k,v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
};
const emptyList = { forEach(){}, length:0 };
const doc = {
  querySelectorAll: () => emptyList,
  getElementById: () => null,
  addEventListener(){},
  body:{ appendChild(){}, removeChild(){} },
  createElement: () => ({ setAttribute(){}, insertAdjacentElement(){}, classList:{add(){},remove(){}}, style:{}, click(){} }),
};
const win = {};
const sandbox = {
  localStorage, document: doc, window: win, navigator:{},
  alert(){}, confirm(){return true;}, console,
  location:{protocol:'http:'},
  setTimeout(){}, clearTimeout(){},
  Date, Math, JSON, Set, Map, Blob:function(){}, URL:{createObjectURL(){return '';},revokeObjectURL(){}}, FileReader:function(){},
  parseInt, parseFloat, isNaN,
};
win.SpeechRecognition = undefined;
win.webkitSpeechRecognition = undefined;
sandbox.window = sandbox; // some code uses window.x = fn
vm.createContext(sandbox);
try { vm.runInContext(code, sandbox, { filename: "app.js" }); } catch(e){ console.error("[ignored late error]", e.message); }

const out = {
  users: JSON.parse(store.get('isp_users')||'[]'),
  diaries: JSON.parse(store.get('isp_diaries')||'[]'),
  goals: JSON.parse(store.get('isp_goals')||'[]'),
  reviews: JSON.parse(store.get('isp_reviews')||'[]'),
};
fs.writeFileSync('data/seed.json', JSON.stringify(out,null,2));
console.log('users',out.users.length,'diaries',out.diaries.length,'goals',out.goals.length,'reviews',out.reviews.length);
console.log('user names:', out.users.map(u=>u.name).join(', '));
