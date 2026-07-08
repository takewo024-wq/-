// Converts the article markdown into note.com paste-ready .txt files.
// Strips markdown syntax note can't parse, drops internal credits/H1,
// inserts a paywall marker for paid articles, and prepends a formatting memo.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const base = '/home/user/-/content';
const out = base + '/note-ready';
mkdirSync(out, { recursive: true });

const articles = [
  { file: 'mitsuhide/ep1-free.md', slug: 'mitsuhide-ep1', img: 'mitsuhide-ep1.png', paid: false,
    title: '【第1回】謎だらけの前半生 — 光秀はどこから来たのか' },
  { file: 'mitsuhide/ep2-paid.md', slug: 'mitsuhide-ep2', img: 'mitsuhide-ep2.png', paid: true,
    title: '【第2回】異例の大出世 — 信長がほれ込んだ男' },
  { file: 'mitsuhide/ep3-paid.md', slug: 'mitsuhide-ep3', img: 'mitsuhide-ep3.png', paid: true,
    title: '【第3回】本能寺への道 — 謀反の動機、諸説を検証する' },
  { file: 'mitsuhide/ep4-paid.md', slug: 'mitsuhide-ep4', img: 'mitsuhide-ep4.png', paid: true,
    title: '【第4回】山崎のあと — 天海伝説と明智の血のゆくえ' },
  { file: 'kanbei/ep1-free.md', slug: 'kanbei-ep1', img: 'kanbei-ep1.png', paid: false,
    title: '【第1回】藤の花を見た男 — 姫路の若き軍師と有岡城の土牢' },
  { file: 'kanbei/ep2-paid.md', slug: 'kanbei-ep2', img: 'kanbei-ep2.png', paid: true,
    title: '【第2回】御運が開けましたな — 天下を動かした一言' },
  { file: 'kanbei/ep3-paid.md', slug: 'kanbei-ep3', img: 'kanbei-ep3.png', paid: true,
    title: '【第3回】恐れられた才 — 天下人が警戒した男' },
  { file: 'kanbei/ep4-paid.md', slug: 'kanbei-ep4', img: 'kanbei-ep4.png', paid: true,
    title: '【第4回】もうひとつの関ヶ原 — 九州での大博打' },
];

const PAYWALL = '━━━━━━━━━━ ここから下を「有料エリア」に設定 ━━━━━━━━━━';

function strip(s) {
  return s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1');
}

const skipped = [];
for (const a of articles) {
  if (!existsSync(`${base}/${a.file}`)) { skipped.push(a.title); continue; }
  const raw = readFileSync(`${base}/${a.file}`, 'utf8').split('\n');
  const headings = [];
  const quotes = [];
  const body = [];
  let hrSeen = 0;
  let paywallDone = false;

  for (let line of raw) {
    if (/^#\s/.test(line)) continue;               // drop H1 title
    if (/^\(執筆:/.test(line)) continue;            // drop internal credit
    if (/^---\s*$/.test(line)) {                    // horizontal rules
      hrSeen++;
      if (a.paid && hrSeen === 2 && !paywallDone) { // paywall after あらすじ
        body.push('', PAYWALL, '');
        paywallDone = true;
      }
      continue;
    }
    if (/^#{2,3}\s/.test(line)) {                   // headings -> plain line
      const t = strip(line.replace(/^#{2,3}\s/, '').trim());
      headings.push(t);
      body.push(t);
      continue;
    }
    if (/^>\s?/.test(line)) {                        // quotes
      const t = strip(line.replace(/^>\s?/, '').trim());
      quotes.push(t);
      body.push(t);
      continue;
    }
    if (/^-\s/.test(line)) { body.push('・' + strip(line.replace(/^-\s/, ''))); continue; }
    body.push(strip(line));
  }

  // collapse 3+ blank lines to max 1 blank
  const cleaned = [];
  for (const l of body) {
    if (l.trim() === '' && cleaned.length && cleaned[cleaned.length - 1].trim() === '') continue;
    cleaned.push(l);
  }
  while (cleaned.length && cleaned[0].trim() === '') cleaned.shift();
  while (cleaned.length && cleaned[cleaned.length - 1].trim() === '') cleaned.pop();

  const memo = [
    '════════ note入稿メモ(この枠は貼り付けない) ════════',
    `タイトル欄        : ${a.title}`,
    `見出し画像        : content/thumbnails/${a.img}`,
    `価格              : ${a.paid ? '¥300(有料note)' : '無料'}`,
    '',
    '貼り付け後にツールバーで整える箇所:',
    `  ・「見出し」に設定する行(本文中に上から順): ${headings.map((h) => `「${h}」`).join(' / ')}`,
    quotes.length ? `  ・「引用」に設定する行: ${quotes.map((q) => `「${q.slice(0, 18)}…」`).join(' / ')}` : '  ・引用にする箇所: なし',
    a.paid ? '  ・「ここから下を有料エリアに設定」の行で〈有料ライン〉を挿入し、その目印行は削除' : '  ・全文無料。最後に有料回への導線あり',
    '════════════════════════════════════════════',
    '',
    '▼▼▼ ここから下を本文にコピー ▼▼▼',
    '',
  ].join('\n');

  writeFileSync(`${out}/${a.slug}.txt`, memo + cleaned.join('\n') + '\n');
  console.log('wrote', a.slug + '.txt', `(見出し${headings.length} / 引用${quotes.length})`);
}
if (skipped.length) console.log('\n未執筆のためスキップ:\n  - ' + skipped.join('\n  - '));
