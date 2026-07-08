// Builds a self-contained catalog page (index.html) with embedded thumbnails.
import sharp from '/home/user/-/node_modules/sharp/lib/index.js';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const thumbDir = '/home/user/-/content/thumbnails';
async function dataURI(file) {
  const buf = await sharp(path.join(thumbDir, file))
    .resize({ width: 760, withoutEnlargement: true })
    .jpeg({ quality: 74, mozjpeg: true })
    .toBuffer();
  return 'data:image/jpeg;base64,' + buf.toString('base64');
}

const series = [
  {
    key: 'm', num: '壱', name: '明智光秀', accent: '#6f9fd8', crest: 'kikyo',
    logline: '「主殺し」の汚名を着た男の、本当の生涯。出自不明、生年不詳——史料だけをたどると、通説とはまるで違う光秀が現れる。',
    eps: [
      { no: '第一回', title: '謎だらけの前半生 — 光秀はどこから来たのか', free: true, file: 'mitsuhide-ep1.png' },
      { no: '第二回', title: '異例の大出世 — 信長がほれ込んだ男', free: false, file: 'mitsuhide-ep2.png' },
      { no: '第三回', title: '本能寺への道 — 謀反の動機、諸説を検証する', free: false, file: 'mitsuhide-ep3.png' },
      { no: '第四回', title: '山崎のあと — 天海伝説と明智の血のゆくえ', free: false, file: 'mitsuhide-ep4.png' },
    ],
  },
  {
    key: 'k', num: '弐', name: '黒田官兵衛', accent: '#a99bde', crest: 'fuji',
    logline: '天下人・秀吉が「わしの次に天下を取る」と恐れた軍師。有岡城の土牢を生き延び、一度だけ天下に手を伸ばした男の生涯。',
    eps: [
      { no: '第一回', title: '藤の花を見た男 — 姫路の若き軍師と有岡城の土牢', free: true, file: 'kanbei-ep1.png' },
      { no: '第二回', title: '御運が開けましたな — 天下を動かした一言', free: false, file: 'kanbei-ep2.png' },
      { no: '第三回', title: '恐れられた才 — 天下人が警戒した男', free: false, file: 'kanbei-ep3.png' },
      { no: '第四回', title: 'もうひとつの関ヶ原 — 九州での大博打', free: false, file: 'kanbei-ep4.png' },
    ],
  },
];

function crestSVG(kind, color) {
  if (kind === 'kikyo') {
    let p = '';
    for (let i = 0; i < 5; i++)
      p += `<path d="M100,98 C84,64 86,40 100,15 C114,40 116,64 100,98 Z" fill="${color}" transform="rotate(${i * 72} 100 100)"/>`;
    return `<svg viewBox="0 0 200 200" aria-hidden="true">${p}<circle cx="100" cy="100" r="12" fill="none" stroke="${color}" stroke-width="4"/></svg>`;
  }
  // fuji
  function cluster(x, s) {
    let g = `<g transform="translate(${x},20) scale(${s})">`;
    let y = 12, r = 15;
    for (let i = 0; i < 6; i++) { const dx = (i % 2 ? 1 : -1) * (6 - i * 0.6); g += `<circle cx="${dx}" cy="${y}" r="${r}" fill="${color}"/>`; y += r * 1.35; r *= 0.86; }
    return g + '</g>';
  }
  return `<svg viewBox="0 0 200 200" aria-hidden="true">${cluster(70, 1)}${cluster(110, 1.22)}${cluster(150, 0.85)}</svg>`;
}

const imgCache = {};
for (const s of series) for (const e of s.eps) imgCache[e.file] = await dataURI(e.file);

function epCard(s, e) {
  const badge = e.free
    ? '<span class="badge free">無料</span>'
    : '<span class="badge paid">¥300</span>';
  const cta = e.free ? '読む' : '購入する';
  return `
        <article class="ep reveal">
          <div class="ep-poster"><img src="${imgCache[e.file]}" alt="${s.name} ${e.no}「${e.title}」のアイキャッチ画像" /></div>
          <div class="ep-body">
            <div class="ep-row">
              <span class="ep-no">${e.no}</span>
              ${badge}
            </div>
            <h3 class="ep-title">${e.title}</h3>
            <span class="ep-cta" role="link" tabindex="0">${cta}<span class="arw" aria-hidden="true">→</span></span>
          </div>
        </article>`;
}

function seriesSection(s) {
  return `
    <section class="series reveal" style="--accent:${s.accent}">
      <div class="series-head">
        <div class="series-rail">
          <span class="crest">${crestSVG(s.crest, s.accent)}</span>
          <span class="series-vt">${s.name}</span>
        </div>
        <div class="series-intro">
          <p class="kicker"><span class="kanji">其の${s.num}</span><span class="dot">◦</span>全四回</p>
          <h2 class="series-name">${s.name}</h2>
          <p class="logline">${s.logline}</p>
        </div>
      </div>
      <div class="ep-grid">
        ${s.eps.map((e) => epCard(s, e)).join('')}
      </div>
    </section>`;
}

const html = `<title>戦国クロニクル — 作品一覧</title>
<style>
  :root{
    --paper:#efe6d4; --bg:#efe6d4; --panel:#e6d9bf; --panel-edge:rgba(42,35,24,.10);
    --ink:#2a2318; --ink-soft:#6a5f49; --ink-faint:#8a7d63;
    --line:rgba(42,35,24,.18); --gold:#9c7726; --gold-bright:#b78f38;
    --vermilion:#b23a2e; --shadow:0 18px 46px -22px rgba(40,28,10,.5);
    --serif:"Hiragino Mincho ProN","Yu Mincho","YuMincho","Noto Serif JP","Shippori Mincho","MS PMincho",serif;
    --sans:"Hiragino Sans","Yu Gothic","YuGothic","Noto Sans JP","Meiryo",sans-serif;
  }
  @media (prefers-color-scheme:dark){
    :root{
      --paper:#14110b; --bg:#14110b; --panel:#1d1810; --panel-edge:rgba(241,233,216,.08);
      --ink:#f1e9d7; --ink-soft:#bcae92; --ink-faint:#8d8168;
      --line:rgba(241,233,216,.14); --gold:#c9a24b; --gold-bright:#dcb75d;
      --vermilion:#c04434; --shadow:0 22px 54px -24px rgba(0,0,0,.7);
    }
  }
  :root[data-theme="light"]{
    --paper:#efe6d4; --bg:#efe6d4; --panel:#e6d9bf; --panel-edge:rgba(42,35,24,.10);
    --ink:#2a2318; --ink-soft:#6a5f49; --ink-faint:#8a7d63;
    --line:rgba(42,35,24,.18); --gold:#9c7726; --gold-bright:#b78f38;
    --vermilion:#b23a2e; --shadow:0 18px 46px -22px rgba(40,28,10,.5);
  }
  :root[data-theme="dark"]{
    --paper:#14110b; --bg:#14110b; --panel:#1d1810; --panel-edge:rgba(241,233,216,.08);
    --ink:#f1e9d7; --ink-soft:#bcae92; --ink-faint:#8d8168;
    --line:rgba(241,233,216,.14); --gold:#c9a24b; --gold-bright:#dcb75d;
    --vermilion:#c04434; --shadow:0 22px 54px -24px rgba(0,0,0,.7);
  }
  *{box-sizing:border-box;}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);
    line-height:1.75;-webkit-font-smoothing:antialiased;
    background-image:
      radial-gradient(120% 80% at 82% -8%, color-mix(in srgb, var(--gold) 12%, transparent), transparent 60%),
      radial-gradient(90% 60% at 8% 108%, color-mix(in srgb, var(--vermilion) 8%, transparent), transparent 55%);
    background-attachment:fixed;}
  .wrap{max-width:1120px;margin:0 auto;padding:0 28px;}
  a{color:inherit;}

  /* ---- hero ---- */
  header.hero{position:relative;padding:96px 0 60px;}
  .hero-inner{max-width:1120px;margin:0 auto;padding:0 28px;}
  .brandmark{font-family:var(--serif);font-size:clamp(52px,9vw,108px);line-height:1.04;
    letter-spacing:.12em;text-indent:.12em;margin:0;font-weight:600;
    text-wrap:balance;}
  .romaji{display:block;font-family:var(--sans);font-size:clamp(11px,1.5vw,14px);
    letter-spacing:.62em;text-indent:.62em;color:var(--gold);margin-bottom:22px;font-weight:600;}
  .tagline{font-family:var(--serif);font-size:clamp(19px,2.6vw,27px);color:var(--ink-soft);
    margin:26px 0 0;letter-spacing:.06em;text-wrap:balance;max-width:24em;}
  .hero-rule{height:1px;background:linear-gradient(90deg,var(--gold),transparent);margin:40px 0 0;}

  /* ---- how it works ---- */
  .how{padding:40px 0 8px;}
  .how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
  .how-card{background:var(--panel);border:1px solid var(--panel-edge);padding:24px 24px 26px;
    border-radius:2px;position:relative;}
  .how-step{font-family:var(--serif);font-size:13px;letter-spacing:.4em;text-indent:.4em;
    color:var(--gold);margin:0 0 12px;}
  .how-card h3{margin:0 0 8px;font-size:20px;letter-spacing:.03em;}
  .how-card p{margin:0;color:var(--ink-soft);font-size:14.5px;line-height:1.7;}
  .how-card .price{color:var(--ink);font-weight:600;}

  /* ---- series ---- */
  main{padding:36px 0 0;}
  .series{padding:56px 0;border-top:1px solid var(--line);}
  .series-head{display:grid;grid-template-columns:auto 1fr;gap:38px;align-items:center;margin-bottom:36px;}
  .wrap>.series:first-child{border-top:none;}
  .series-rail{display:flex;flex-direction:column;align-items:center;gap:16px;
    padding-right:34px;border-right:1px solid var(--line);}
  .crest{width:64px;height:64px;display:block;opacity:.92;}
  .crest svg{width:100%;height:100%;display:block;}
  .series-vt{writing-mode:vertical-rl;font-family:var(--serif);font-weight:600;
    font-size:clamp(30px,4.4vw,46px);letter-spacing:.18em;color:var(--ink);
    text-shadow:0 1px 0 color-mix(in srgb,var(--accent) 40%,transparent);}
  .kicker{display:flex;align-items:center;gap:12px;margin:0 0 10px;
    font-family:var(--serif);letter-spacing:.34em;color:var(--gold);font-size:14px;}
  .kicker .dot{color:var(--accent);}
  .series-name{display:none;}
  .logline{margin:6px 0 0;font-size:clamp(16px,2vw,19px);line-height:1.9;color:var(--ink-soft);
    max-width:34em;letter-spacing:.03em;border-left:3px solid var(--accent);padding-left:20px;}

  .ep-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}
  .ep{background:var(--panel);border:1px solid var(--panel-edge);border-radius:3px;overflow:hidden;
    display:flex;flex-direction:column;transition:transform .28s ease,box-shadow .28s ease;}
  .ep:hover{transform:translateY(-5px);box-shadow:var(--shadow);}
  .ep-poster{aspect-ratio:1280/670;overflow:hidden;background:#0c0a07;
    border-bottom:1px solid var(--panel-edge);}
  .ep-poster img{width:100%;height:100%;object-fit:cover;display:block;}
  .ep-body{padding:16px 17px 18px;display:flex;flex-direction:column;gap:11px;flex:1;}
  .ep-row{display:flex;align-items:center;justify-content:space-between;gap:8px;}
  .ep-no{font-family:var(--serif);font-size:14px;letter-spacing:.24em;color:var(--gold);}
  .badge{font-size:12.5px;letter-spacing:.12em;padding:4px 11px;border-radius:2px;
    font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;}
  .badge.free{background:var(--vermilion);color:#fff;}
  .badge.paid{border:1px solid var(--gold);color:var(--gold);}
  .ep-title{margin:0;font-size:15.5px;line-height:1.6;letter-spacing:.02em;font-weight:600;flex:1;}
  .ep-cta{align-self:flex-start;font-size:14px;letter-spacing:.08em;color:var(--ink);
    cursor:pointer;display:inline-flex;align-items:center;gap:7px;
    border-bottom:1px solid var(--accent);padding-bottom:2px;transition:gap .2s ease;}
  .ep-cta .arw{color:var(--accent);}
  .ep-cta:hover{gap:12px;}
  .ep-cta:focus-visible{outline:2px solid var(--accent);outline-offset:4px;}

  /* ---- magazine / footer ---- */
  .mag{margin:20px 0 0;padding:52px 0;border-top:1px solid var(--line);}
  .mag-card{background:
      linear-gradient(120deg, color-mix(in srgb,var(--gold) 16%,var(--panel)), var(--panel));
    border:1px solid var(--gold);border-radius:3px;padding:40px 44px;
    display:grid;grid-template-columns:1fr auto;gap:30px;align-items:center;}
  .mag-card h2{font-family:var(--serif);font-size:clamp(24px,3.4vw,34px);margin:0 0 10px;letter-spacing:.06em;}
  .mag-card p{margin:0;color:var(--ink-soft);max-width:40em;font-size:15px;}
  .mag-price{text-align:right;white-space:nowrap;}
  .mag-price .yen{font-family:var(--serif);font-size:clamp(34px,5vw,48px);color:var(--ink);
    font-variant-numeric:tabular-nums;letter-spacing:.02em;}
  .mag-price .per{color:var(--ink-soft);font-size:15px;}
  .mag-cta{display:inline-block;margin-top:12px;background:var(--vermilion);color:#fff;
    padding:12px 26px;border-radius:2px;letter-spacing:.14em;font-size:14px;font-weight:600;
    cursor:pointer;}
  .mag-cta:focus-visible{outline:2px solid var(--gold);outline-offset:3px;}

  footer{padding:44px 0 72px;border-top:1px solid var(--line);color:var(--ink-faint);}
  .foot-grid{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;align-items:baseline;}
  .foot-brand{font-family:var(--serif);letter-spacing:.2em;color:var(--ink-soft);font-size:15px;}
  .foot-note{font-size:12.5px;line-height:1.9;max-width:40em;}
  .next{font-size:13px;color:var(--gold);letter-spacing:.06em;margin-top:2px;}

  /* ---- reveal ---- */
  .reveal{opacity:0;transform:translateY(16px);transition:opacity .7s ease,transform .7s ease;}
  .reveal.in{opacity:1;transform:none;}
  @media (prefers-reduced-motion:reduce){
    .reveal{opacity:1;transform:none;transition:none;}
    .ep{transition:none;}
  }

  /* ---- responsive ---- */
  @media (max-width:900px){
    .how-grid{grid-template-columns:1fr;}
    .ep-grid{grid-template-columns:repeat(2,1fr);}
    .mag-card{grid-template-columns:1fr;}
    .mag-price{text-align:left;}
  }
  @media (max-width:620px){
    header.hero{padding:64px 0 40px;}
    .series-head{grid-template-columns:1fr;gap:22px;}
    .series-rail{flex-direction:row;justify-content:flex-start;border-right:none;
      border-bottom:1px solid var(--line);padding:0 0 18px;gap:18px;}
    .series-vt{writing-mode:horizontal-tb;}
    .ep-grid{grid-template-columns:1fr;}
  }
</style>

<header class="hero">
  <div class="hero-inner">
    <span class="romaji">SENGOKU CHRONICLE</span>
    <h1 class="brandmark">戦国クロニクル</h1>
    <p class="tagline">放送ではわからない、その生涯を。<br/>史料でたどる戦国武将の連載読み物。</p>
    <div class="hero-rule"></div>
  </div>
</header>

<div class="wrap">
  <section class="how">
    <div class="how-grid">
      <div class="how-card reveal">
        <p class="how-step">読み方 一</p>
        <h3>第1回は無料</h3>
        <p>各武将シリーズの第1回は<span class="price">無料公開</span>。まずは気になる武将から、ためし読みを。</p>
      </div>
      <div class="how-card reveal">
        <p class="how-step">読み方 二</p>
        <h3>続きは1話 ¥300</h3>
        <p>第2回以降は1話 <span class="price">¥300</span>。3話まとめ買いは <span class="price">¥700</span> でお得に。</p>
      </div>
      <div class="how-card reveal">
        <p class="how-step">読み方 三</p>
        <h3>月額でまるごと</h3>
        <p>月額マガジン <span class="price">¥500/月</span> なら、公開中のシリーズを新着からまとめて。</p>
      </div>
    </div>
  </section>

  <main>
    ${series.map(seriesSection).join('')}
  </main>

  <section class="mag">
    <div class="mag-card reveal">
      <div>
        <h2>月額マガジン「戦国クロニクル」</h2>
        <p>新シリーズを毎回いち早く。公開中の全話が読み放題で、次回作は<strong>竹中半兵衛</strong>——官兵衛と並び称された、もう一人の名軍師です。</p>
      </div>
      <div class="mag-price">
        <div><span class="yen">¥500</span><span class="per"> / 月</span></div>
        <span class="mag-cta" role="link" tabindex="0">購読する</span>
      </div>
    </div>
  </section>

  <footer>
    <div class="foot-grid">
      <div>
        <div class="foot-brand">戦国クロニクル製作</div>
        <div class="next">次回シリーズ ── 竹中半兵衛</div>
      </div>
      <p class="foot-note">本連載は史料・歴史研究にもとづくオリジナルコンテンツです。特定の放送番組とは関係ありません。掲載の家紋図案・アイキャッチはすべて自作で、番組の映像・ロゴ・写真は使用していません。</p>
    </div>
  </footer>
</div>

<script>
  (function(){
    var els=document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches){
      els.forEach(function(e){e.classList.add('in');});return;
    }
    var io=new IntersectionObserver(function(ents){
      ents.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});
    },{threshold:.12});
    els.forEach(function(e){io.observe(e);});
  })();
</script>`;

writeFileSync('/home/user/-/content/catalog/index.html', html);
console.log('wrote index.html', (Buffer.byteLength(html) / 1024).toFixed(0) + 'KB');
