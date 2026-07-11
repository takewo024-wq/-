// ===================== サーバー保存（全員で共有） =====================
// localStorage ではなくサーバー(SQLite)に保存する。起動時に全データを読み込み、
// 変更は差分(upsert/delete)としてサーバーへ送信する。8秒ごとに他の職員の更新も取り込む。
let _storageOK = true;
const _COLLECTION = { isp_users:'users', isp_diaries:'diaries', isp_goals:'goals', isp_reviews:'reviews' };
let _cache = { users:[], diaries:[], goals:[], reviews:[] };
let _baseline = { users:[], diaries:[], goals:[], reviews:[] };
function _clone(x){ return JSON.parse(JSON.stringify(x)); }

function _read(key){ return _clone(_cache[_COLLECTION[key]] || []); }
function _write(key, v){
  const col = _COLLECTION[key];
  _cache[col] = _clone(v);
  const base = _baseline[col] || [];
  const baseById = new Map(base.map(r => [r.id, JSON.stringify(r)]));
  const upserts = [];
  const newIds = new Set();
  (v || []).forEach(r => {
    if (!r || r.id == null) return;
    newIds.add(r.id);
    if (baseById.get(r.id) !== JSON.stringify(r)) upserts.push(r);
  });
  const deletes = base.filter(r => !newIds.has(r.id)).map(r => r.id);
  if (upserts.length === 0 && deletes.length === 0) return;
  _baseline[col] = _clone(v);
  fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection: col, upserts, deletes })
  }).then(res => { if (!res.ok) throw new Error('save failed ' + res.status); })
    .catch(err => {
      console.error(err);
      if (_storageOK) {
        _storageOK = false;
        alert('⚠ サーバーへの保存に失敗しました。\n\nネットワーク接続を確認してください。' +
          'この画面の入力は一時的に表示されていますが、保存されていない可能性があります。');
      }
    });
}

const DB = {
  get users() { return _read('isp_users'); },
  set users(v) { _write('isp_users', v); },
  get diaries() { return _read('isp_diaries'); },
  set diaries(v) { _write('isp_diaries', v); },
  get goals() { return _read('isp_goals'); },
  set goals(v) { _write('isp_goals', v); },
  get reviews() { return _read('isp_reviews'); },
  set reviews(v) { _write('isp_reviews', v); },
};

let currentPage = 'users';
let selectedUserId = null;
let editingId = null;
let diaryRating = '';

// ===================== ページ切替 =====================
function showPage(page) {
  currentPage = page;
  document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
  const menuMap = { users: 0, goals: 1, diary: 2, pickup: 3, review: 4, nextplan: 5 };
  document.querySelectorAll('.menu-item')[menuMap[page]].classList.add('active');

  const titles = { users: '利用者一覧', diary: '支援日誌', goals: '支援目標', review: '振り返り・評価', pickup: '有効支援ピックアップ', nextplan: '次期計画策定' };
  document.getElementById('page-title').textContent = titles[page];

  renderPage(page);
}

function renderPage(page) {
  const c = document.getElementById('main-content');
  const actions = document.getElementById('topbar-actions');
  if (page === 'users') {
    actions.innerHTML = `<button class="btn primary" onclick="openAddUserModal()">＋ 利用者追加</button>`;
    renderUsers(c);
  } else if (!selectedUserId) {
    c.innerHTML = `<div class="empty-state"><div class="icon">👆</div><p>左の「利用者一覧」から対象者を選択してください</p></div>`;
    actions.innerHTML = '';
  } else if (page === 'diary') {
    actions.innerHTML = `<button class="btn primary" onclick="openAddDiaryModal()">＋ 日誌追加</button>`;
    renderDiary(c);
  } else if (page === 'pickup') {
    actions.innerHTML = `<button class="btn" onclick="window.print()">🖨 印刷</button>`;
    renderPickup(c);
  } else if (page === 'goals') {
    actions.innerHTML = `<button class="btn primary" onclick="openAddGoalModal()">＋ 目標追加</button>`;
    renderGoals(c);
  } else if (page === 'review') {
    actions.innerHTML = `<button class="btn primary" onclick="openAddReviewModal()">＋ 振り返り追加</button>`;
    renderReview(c);
  } else if (page === 'nextplan') {
    actions.innerHTML = `<button class="btn" onclick="window.print()">🖨 印刷</button>`;
    renderNextPlan(c);
  }
}

// ===================== 利用者 =====================
function renderUsers(c) {
  const users = DB.users;
  let search = '';
  c.innerHTML = `
    <div class="search-bar">
      <input type="text" id="user-search" placeholder="🔍 氏名・サービス種別で検索..." oninput="filterUsers(this.value)">
    </div>
    <div class="user-grid" id="user-grid">${renderUserCards(users, selectedUserId)}</div>
  `;
}

function renderUserCards(users, selectedId) {
  if (!users.length) return `<div class="empty-state" style="grid-column:1/-1"><div class="icon">👥</div><p>利用者を追加してください</p></div>`;
  return users.map(u => {
    const initial = u.name ? u.name[0] : '?';
    return `<div class="user-card ${u.id === selectedId ? 'selected' : ''}" onclick="selectUser('${u.id}')">
      <div class="user-avatar">${initial}</div>
      <div class="user-name">${esc(u.name)}</div>
      <div class="user-meta">${esc(u.service || '—')} ${u.level ? '/ ' + esc(u.level) : ''}</div>
      <div style="margin-top:8px; display:flex; gap:6px; justify-content:flex-end;">
        <button class="btn" style="padding:3px 8px;font-size:11px" onclick="event.stopPropagation(); openEditUserModal('${u.id}')">編集</button>
        <button class="btn danger" style="padding:3px 8px;font-size:11px" onclick="event.stopPropagation(); deleteUser('${u.id}')">削除</button>
      </div>
    </div>`;
  }).join('');
}

function filterUsers(q) {
  const users = DB.users.filter(u => !q || u.name.includes(q) || (u.service && u.service.includes(q)));
  document.getElementById('user-grid').innerHTML = renderUserCards(users, selectedUserId);
}

function selectUser(id) {
  selectedUserId = id;
  renderPage(currentPage);
}

function openAddUserModal() { editingId = null; clearUserForm(); document.getElementById('user-modal-title').textContent = '利用者追加'; openModal('user-modal'); }
function openEditUserModal(id) {
  editingId = id;
  const u = DB.users.find(x => x.id === id);
  if (!u) return;
  document.getElementById('user-modal-title').textContent = '利用者編集';
  document.getElementById('u-name').value = u.name || '';
  document.getElementById('u-kana').value = u.kana || '';
  document.getElementById('u-birth').value = u.birth || '';
  document.getElementById('u-gender').value = u.gender || '';
  document.getElementById('u-level').value = u.level || '';
  document.getElementById('u-service').value = u.service || '';
  document.getElementById('u-office').value = u.office || '';
  document.getElementById('u-memo').value = u.memo || '';
  openModal('user-modal');
}
function clearUserForm() {
  ['u-name','u-kana','u-birth','u-gender','u-level','u-service','u-office','u-memo'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
}
function saveUser() {
  const name = document.getElementById('u-name').value.trim();
  if (!name) { alert('氏名を入力してください'); return; }
  const users = DB.users;
  const data = {
    name, kana: v('u-kana'), birth: v('u-birth'), gender: v('u-gender'),
    level: v('u-level'), service: v('u-service'), office: v('u-office'), memo: v('u-memo')
  };
  if (editingId) {
    const i = users.findIndex(x => x.id === editingId);
    if (i >= 0) users[i] = { ...users[i], ...data };
  } else {
    users.push({ id: uid(), ...data });
  }
  DB.users = users;
  closeModal('user-modal');
  renderPage(currentPage);
}
function deleteUser(id) {
  if (!confirm('この利用者と関連する全データを削除しますか？')) return;
  DB.users = DB.users.filter(u => u.id !== id);
  DB.diaries = DB.diaries.filter(d => d.userId !== id);
  DB.goals = DB.goals.filter(g => g.userId !== id);
  DB.reviews = DB.reviews.filter(r => r.userId !== id);
  if (selectedUserId === id) selectedUserId = null;
  renderPage(currentPage);
}

// ===================== 支援日誌 =====================
function renderDiary(c) {
  const user = DB.users.find(u => u.id === selectedUserId);
  const diaries = DB.diaries.filter(d => d.userId === selectedUserId).sort((a,b) => b.date.localeCompare(a.date));
  c.innerHTML = `
    <div class="breadcrumb"><a onclick="showPage('users')">利用者一覧</a> › <span>${esc(user?.name || '')}</span> › 支援日誌</div>
    <div class="diary-list">${diaries.length ? diaries.map(renderDiaryItem).join('') : '<div class="empty-state"><div class="icon">📝</div><p>支援日誌がまだありません</p></div>'}</div>
  `;
}
function renderDiaryItem(d) {
  const ratingMap = { good: ['green','✓ 良好'], mid: ['amber','△ 普通'], bad: ['red','✗ 要支援'] };
  const [tagClass, tagLabel] = ratingMap[d.rating] || ['',''];
  const isPickup = !!d.pickup;
  return `<div class="diary-item" onclick="openEditDiaryModal('${d.id}')">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div class="diary-date">${d.date}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <button class="pickup-btn ${isPickup?'on':''}" onclick="event.stopPropagation();togglePickup('${d.id}')">${isPickup?'⭐ ピックアップ中':'☆ ピックアップ'}</button>
        <div style="font-size:11px;color:#999">${esc(d.staff || '')} / ${esc(d.attend || '参加')}</div>
      </div>
    </div>
    <div class="diary-summary">${esc(d.content || '').substring(0,80)}${(d.content||'').length>80?'…':''}</div>
    ${d.condition ? `<div style="font-size:12px;color:#666;margin-top:4px">様子: ${esc(d.condition).substring(0,60)}</div>` : ''}
    <div class="diary-tags">
      ${tagLabel ? `<span class="tag ${tagClass}">${tagLabel}</span>` : ''}
      ${d.note ? `<span class="tag">申し送りあり</span>` : ''}
    </div>
  </div>`;
}

function togglePickup(id) {
  const diaries = DB.diaries;
  const i = diaries.findIndex(d => d.id === id);
  if (i < 0) return;
  diaries[i].pickup = !diaries[i].pickup;
  diaries[i].pickupMemo = diaries[i].pickupMemo || '';
  DB.diaries = diaries;
  renderPage('diary');
}
function populateDiaryGoalSelect(selectedGoalId) {
  const sel = document.getElementById('d-goal');
  if (!sel) return;
  const goals = DB.goals.filter(g => g.userId === selectedUserId);
  sel.innerHTML = '<option value="">— 目標を選択（任意）—</option>' +
    goals.map(g => `<option value="${g.id}"${g.id === selectedGoalId ? ' selected' : ''}>${esc(g.short.substring(0,30))}${g.short.length > 30 ? '…' : ''}</option>`).join('');
}
function openAddDiaryModal() {
  editingId = null;
  clearDiaryForm();
  document.getElementById('diary-modal-title').textContent = '支援日誌 記録';
  document.getElementById('diary-delete-btn').style.display = 'none';
  document.getElementById('d-date').value = today();
  populateDiaryGoalSelect('');
  openModal('diary-modal');
}
function openEditDiaryModal(id) {
  editingId = id;
  const d = DB.diaries.find(x => x.id === id);
  if (!d) return;
  document.getElementById('diary-modal-title').textContent = '支援日誌 編集';
  document.getElementById('diary-delete-btn').style.display = '';
  document.getElementById('d-date').value = d.date || '';
  document.getElementById('d-staff').value = d.staff || '';
  document.getElementById('d-attend').value = d.attend || '参加';
  document.getElementById('d-content').value = d.content || '';
  document.getElementById('d-condition').value = d.condition || '';
  document.getElementById('d-note').value = d.note || '';
  setRating(d.rating || '');
  populateDiaryGoalSelect(d.goalId || '');
  openModal('diary-modal');
}
function clearDiaryForm() {
  ['d-date','d-staff','d-attend','d-goal','d-content','d-condition','d-note'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  setRating('');
}
function setRating(val) {
  diaryRating = val;
  document.querySelectorAll('#d-rating-sel .rating-btn').forEach(btn => {
    btn.className = 'rating-btn';
    const bv = btn.getAttribute('data-val');
    if (bv === val) {
      if (val === 'good') btn.classList.add('active-good');
      else if (val === 'mid') btn.classList.add('active-mid');
      else if (val === 'bad') btn.classList.add('active-bad');
    }
  });
}
function saveDiary() {
  const date = document.getElementById('d-date').value;
  if (!date) { alert('日付を入力してください'); return; }
  const diaries = DB.diaries;
  const data = {
    userId: selectedUserId, date, staff: v('d-staff'), attend: v('d-attend'),
    goalId: v('d-goal'),
    content: v('d-content'), condition: v('d-condition'), note: v('d-note'), rating: diaryRating
  };
  if (editingId) {
    const i = diaries.findIndex(x => x.id === editingId);
    if (i >= 0) diaries[i] = { ...diaries[i], ...data };
  } else {
    diaries.push({ id: uid(), ...data });
  }
  DB.diaries = diaries;
  closeModal('diary-modal');
  renderPage('diary');
}
function deleteDiary() {
  if (!confirm('この日誌を削除しますか？')) return;
  DB.diaries = DB.diaries.filter(d => d.id !== editingId);
  closeModal('diary-modal');
  renderPage('diary');
}

// ===================== 支援目標 =====================
function renderGoals(c) {
  const user = DB.users.find(u => u.id === selectedUserId);
  const goals = DB.goals.filter(g => g.userId === selectedUserId).sort((a,b) => (b.start||'').localeCompare(a.start||''));
  c.innerHTML = `
    <div class="breadcrumb"><a onclick="showPage('users')">利用者一覧</a> › <span>${esc(user?.name || '')}</span> › 支援目標</div>
    ${goals.length ? goals.map(renderGoalItem).join('') : '<div class="empty-state"><div class="icon">🎯</div><p>支援目標がまだありません</p></div>'}
  `;
}
function renderGoalItem(g) {
  const { prog, isAuto, linkedCount } = getDisplayProgress(g);
  const p = Math.min(100, Math.max(0, prog));
  const barColor = p >= 80 ? '#16a34a' : p >= 50 ? '#d97706' : '#1a56db';
  return `<div class="goal-item" onclick="openEditGoalModal('${g.id}')">
    <div class="goal-header">
      <div>
        ${g.long ? `<div style="font-size:13px;font-weight:700;color:#2c2c2a;margin-bottom:4px">長期目標: ${esc(g.long).substring(0,60)}${g.long.length>60?'…':''}</div>` : ''}
        ${g.longSupport ? `<div class="goal-detail" style="color:#999;font-size:11px">長期手立て: ${esc(g.longSupport)}</div>` : ''}
        <div class="goal-title">短期目標: ${esc(g.short)}</div>
        ${g.support ? `<div class="goal-detail">短期手立て: ${esc(g.support)}</div>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:16px">
        <div style="font-size:20px;font-weight:700;color:${barColor}">${p}%</div>
        ${isAuto ? `<div style="font-size:10px;color:#1a56db">📊 日誌${linkedCount}件から算出</div>` : `<div style="font-size:10px;color:#aaa">手動設定</div>`}
        ${g.staff ? `<div style="font-size:11px;color:#888">${esc(g.staff)}</div>` : ''}
      </div>
    </div>
    <div class="progress-bar-bg"><div class="progress-bar" style="width:${p}%;background:${barColor}"></div></div>
    ${(g.start || g.end) ? `<div class="goal-period">📅 ${esc(g.start||'')} 〜 ${esc(g.end||'')}</div>` : ''}
  </div>`;
}
function openAddGoalModal() {
  editingId = null;
  clearGoalForm();
  document.getElementById('goal-modal-title').textContent = '支援目標 設定';
  document.getElementById('goal-delete-btn').style.display = 'none';
  openModal('goal-modal');
}
function openEditGoalModal(id) {
  editingId = id;
  const g = DB.goals.find(x => x.id === id);
  if (!g) return;
  document.getElementById('goal-modal-title').textContent = '支援目標 編集';
  document.getElementById('goal-delete-btn').style.display = '';
  document.getElementById('g-long').value = g.long || '';
  document.getElementById('g-long-support').value = g.longSupport || '';
  document.getElementById('g-short').value = g.short || '';
  document.getElementById('g-support').value = g.support || '';
  document.getElementById('g-start').value = g.start || '';
  document.getElementById('g-end').value = g.end || '';
  document.getElementById('g-staff').value = g.staff || '';
  document.getElementById('g-progress').value = g.progress || 0;
  document.getElementById('g-memo').value = g.memo || '';
  openModal('goal-modal');
}
function clearGoalForm() {
  ['g-long','g-long-support','g-short','g-support','g-start','g-end','g-staff','g-progress','g-memo'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  document.getElementById('g-progress').value = 0;
}
function saveGoal() {
  const short = document.getElementById('g-short').value.trim();
  if (!short) { alert('短期目標を入力してください'); return; }
  const goals = DB.goals;
  const data = {
    userId: selectedUserId, long: v('g-long'), longSupport: v('g-long-support'), short, support: v('g-support'),
    start: v('g-start'), end: v('g-end'), staff: v('g-staff'),
    progress: parseInt(v('g-progress')) || 0, memo: v('g-memo')
  };
  if (editingId) {
    const i = goals.findIndex(x => x.id === editingId);
    if (i >= 0) goals[i] = { ...goals[i], ...data };
  } else {
    goals.push({ id: uid(), ...data });
  }
  DB.goals = goals;
  closeModal('goal-modal');
  renderPage('goals');
}
function deleteGoal() {
  if (!confirm('この目標を削除しますか？')) return;
  DB.goals = DB.goals.filter(g => g.id !== editingId);
  closeModal('goal-modal');
  renderPage('goals');
}

// ===================== ピックアップ一覧 =====================
function renderPickup(c) {
  const user = DB.users.find(u => u.id === selectedUserId);
  const allPickups = DB.diaries.filter(d => d.userId === selectedUserId && d.pickup)
    .sort((a, b) => a.date.localeCompare(b.date));

  const filterVal = document.getElementById('pickup-filter') ? document.getElementById('pickup-filter').value : '';
  const filtered = filterVal ? allPickups.filter(d => d.rating === filterVal) : allPickups;

  c.innerHTML = `
    <div class="breadcrumb"><a onclick="showPage('users')">利用者一覧</a> › <span>${esc(user?.name || '')}</span> › 有効支援ピックアップ</div>
    <div class="card">
      <div class="card-header">
        <h3>⭐ 有効な支援 一覧表 <span style="font-weight:400;color:#888;font-size:12px">— ${esc(user?.name||'')} さん</span></h3>
        <div style="display:flex;gap:8px;align-items:center">
          <select id="pickup-filter" style="font-size:12px;padding:4px 8px;border:1px solid #ddd;border-radius:6px" onchange="renderPickup(document.getElementById('main-content'))">
            <option value="">すべて</option>
            <option value="good" ${filterVal==='good'?'selected':''}>✓ 良好のみ</option>
            <option value="mid" ${filterVal==='mid'?'selected':''}>△ 普通のみ</option>
            <option value="bad" ${filterVal==='bad'?'selected':''}>✗ 要支援のみ</option>
          </select>
          <span style="font-size:12px;color:#888">${filtered.length}件</span>
        </div>
      </div>
      <div class="card-body" style="padding:0;overflow-x:auto">
        ${filtered.length ? `
        <table class="pickup-table">
          <thead>
            <tr>
              <th style="width:100px">日付</th>
              <th style="width:80px">担当者</th>
              <th>支援内容・活動</th>
              <th>本人の様子・反応</th>
              <th style="width:80px">評価</th>
              <th>申し送り・課題</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(d => {
              const ratingMap = { good: ['#f0fdf4','#166534','✓ 良好'], mid: ['#fffbeb','#92400e','△ 普通'], bad: ['#fff5f5','#991b1b','✗ 要支援'] };
              const [bg, col, label] = ratingMap[d.rating] || ['#fff','#888','—'];
              return `<tr>
                <td style="white-space:nowrap;font-weight:600;color:#1a56db">${esc(d.date)}</td>
                <td style="white-space:nowrap">${esc(d.staff||'—')}</td>
                <td>${esc(d.content||'')}</td>
                <td>${esc(d.condition||'')}</td>
                <td style="text-align:center"><span style="background:${bg};color:${col};border-radius:10px;padding:2px 8px;font-size:11px;white-space:nowrap">${label}</span></td>
                <td>${esc(d.note||'')}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>` : `<div class="empty-state"><div class="icon">⭐</div><p>支援日誌から「⭐ ピックアップ」ボタンで有効な支援を選んでください</p></div>`}
      </div>
    </div>
    ${filtered.length ? `<div style="font-size:11px;color:#aaa;margin-top:8px;text-align:right">印刷ボタンで一覧表を印刷できます</div>` : ''}
  `;
}

// ===================== 次期計画策定 =====================
function renderNextPlan(c) {
  const user = DB.users.find(u => u.id === selectedUserId);
  const diaries = DB.diaries.filter(d => d.userId === selectedUserId);
  const goals = DB.goals.filter(g => g.userId === selectedUserId);
  const reviews = DB.reviews.filter(r => r.userId === selectedUserId).sort((a,b) => (b.date||'').localeCompare(a.date||''));
  const pickups = diaries.filter(d => d.pickup).sort((a,b) => a.date.localeCompare(b.date));
  const latestReview = reviews[0] || null;
  const goodCount = diaries.filter(d => d.rating === 'good').length;
  const badCount = diaries.filter(d => d.rating === 'bad').length;
  const avgProgress = goals.length ? Math.round(goals.reduce((s,g) => s + getDisplayProgress(g).prog, 0) / goals.length) : 0;

  const ovMap = { A:'A: 目標達成', B:'B: おおむね達成', C:'C: 一部達成', D:'D: 未達成', E:'E: 継続検討' };
  const ovColor = { A:'#16a34a', B:'#16a34a', C:'#d97706', D:'#dc2626', E:'#1a56db' };

  c.innerHTML = `
    <div class="breadcrumb"><a onclick="showPage('users')">利用者一覧</a> › <span>${esc(user?.name||'')}</span> › 次期計画策定</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <!-- 左: 評価サマリー -->
      <div class="card">
        <div class="card-header"><h3>📊 今期の評価サマリー</h3></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
            <div style="text-align:center;background:#f8f8f5;border-radius:8px;padding:10px">
              <div style="font-size:22px;font-weight:700;color:#1a56db">${diaries.length}</div>
              <div style="font-size:11px;color:#888">支援記録数</div>
            </div>
            <div style="text-align:center;background:#f0fdf4;border-radius:8px;padding:10px">
              <div style="font-size:22px;font-weight:700;color:#16a34a">${goodCount}</div>
              <div style="font-size:11px;color:#888">良好評価</div>
            </div>
            <div style="text-align:center;background:#fff5f5;border-radius:8px;padding:10px">
              <div style="font-size:22px;font-weight:700;color:#dc2626">${badCount}</div>
              <div style="font-size:11px;color:#888">要支援</div>
            </div>
          </div>
          <div style="font-size:12px;font-weight:600;color:#666;margin-bottom:8px">目標達成状況</div>
          ${goals.length ? goals.map(g => {
            const { prog, isAuto, linkedCount } = getDisplayProgress(g);
            const p = Math.min(100,Math.max(0,prog));
            const col = p>=80?'#16a34a':p>=50?'#d97706':'#1a56db';
            return `<div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
                <span style="color:#444">${esc(g.short)}</span>
                <span style="font-weight:600;color:${col}">${p}% ${isAuto ? `<span style="font-size:10px;color:#1a56db;font-weight:400">日誌${linkedCount}件</span>` : ''}</span>
              </div>
              <div class="progress-bar-bg"><div class="progress-bar" style="width:${p}%;background:${col}"></div></div>
            </div>`;
          }).join('') : '<div style="font-size:12px;color:#aaa">目標が設定されていません</div>'}
          ${goals.length ? `<div style="font-size:12px;color:#888;margin-top:8px;text-align:right">平均達成度: <strong style="color:#1a56db">${avgProgress}%</strong></div>` : ''}
          ${latestReview ? `
            <div style="margin-top:14px;padding-top:12px;border-top:1px solid #eee">
              <div style="font-size:11px;font-weight:600;color:#888;margin-bottom:4px">最新振り返り（${esc(latestReview.date)}）</div>
              ${latestReview.overall ? `<div style="font-size:12px;font-weight:600;color:${ovColor[latestReview.overall]||'#444'};margin-bottom:4px">総合評価: ${ovMap[latestReview.overall]||''}</div>` : ''}
              ${latestReview.staffNote ? `<div style="font-size:12px;color:#555;line-height:1.6">${esc(latestReview.staffNote)}</div>` : ''}
            </div>` : ''}
        </div>
      </div>

      <!-- 右: 次期課題 & ピックアップ -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-header"><h3>📌 次期への引き継ぎ事項</h3></div>
          <div class="card-body">
            ${latestReview?.nextNote ? `<div style="font-size:13px;color:#333;line-height:1.7;white-space:pre-wrap">${esc(latestReview.nextNote)}</div>` : '<div style="font-size:12px;color:#aaa">振り返り記録の「次期計画への引き継ぎ・課題」が表示されます</div>'}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>⭐ 有効支援 (${pickups.length}件)</h3></div>
          <div class="card-body" style="max-height:180px;overflow-y:auto;padding:0">
            ${pickups.length ? pickups.map(d => `
              <div style="padding:8px 14px;border-bottom:1px solid #eee;font-size:12px">
                <div style="color:#1a56db;font-weight:600;margin-bottom:2px">${esc(d.date)}</div>
                <div style="color:#444">${esc((d.content||'').substring(0,60))}${(d.content||'').length>60?'…':''}</div>
              </div>`).join('') : '<div style="padding:14px;font-size:12px;color:#aaa">ピックアップされた支援がありません</div>'}
          </div>
        </div>
      </div>
    </div>

    <!-- 次期目標入力フォーム -->
    <div class="card">
      <div class="card-header">
        <h3>🎯 次期支援目標 作成</h3>
        <div style="font-size:12px;color:#888">入力後「目標として保存」で支援目標に追加されます</div>
      </div>
      <div class="card-body">
        <div class="form-row single">
          <div class="form-group"><label>長期目標（次期）</label><textarea id="np-long" rows="2" placeholder="次期の長期目標（半年〜1年）を入力"></textarea></div>
        </div>
        <div class="form-row single">
          <div class="form-group"><label>短期目標（次期） *</label><textarea id="np-short" rows="2" placeholder="次期の短期目標（3〜6ヶ月）を入力"></textarea></div>
        </div>
        <div class="form-row single">
          <div class="form-group"><label>支援内容・手立て</label><textarea id="np-support" rows="3" placeholder="目標達成に向けた具体的な支援内容・方法"></textarea></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>計画開始日</label><input type="date" id="np-start"></div>
          <div class="form-group"><label>計画終了日</label><input type="date" id="np-end"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>担当職員</label><input type="text" id="np-staff" placeholder="担当者名"></div>
          <div class="form-group"><label>備考</label><input type="text" id="np-memo" placeholder="その他、特記事項"></div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:8px">
          <button class="btn primary" style="padding:9px 24px" onclick="saveNextPlanGoal()">＋ 目標として保存</button>
        </div>
      </div>
    </div>
  `;
  addVoiceBtns(c);
}

function addVoiceBtns(container) {
  if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) return;
  container.querySelectorAll('textarea:not(.voice-done)').forEach(ta => {
    ta.classList.add('voice-done');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'voice-btn';
    btn.title = '音声入力';
    btn.textContent = '🎤';
    btn.setAttribute('onclick', `toggleVoice('${ta.id}', this)`);
    ta.insertAdjacentElement('afterend', btn);
    const fg = ta.closest('.form-group');
    if (fg) fg.classList.add('has-voice');
  });
}

function saveNextPlanGoal() {
  const short = document.getElementById('np-short').value.trim();
  if (!short) { alert('短期目標を入力してください'); return; }
  const goals = DB.goals;
  goals.push({
    id: uid(),
    userId: selectedUserId,
    long: document.getElementById('np-long').value.trim(),
    short,
    support: document.getElementById('np-support').value.trim(),
    start: document.getElementById('np-start').value,
    end: document.getElementById('np-end').value,
    staff: document.getElementById('np-staff').value.trim(),
    memo: document.getElementById('np-memo').value.trim(),
    progress: 0
  });
  DB.goals = goals;
  alert('次期目標を保存しました。「支援目標」ページで確認できます。');
  ['np-long','np-short','np-support','np-start','np-end','np-staff','np-memo'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
}

// ===================== 振り返り =====================
function renderReview(c) {
  const user = DB.users.find(u => u.id === selectedUserId);
  const reviews = DB.reviews.filter(r => r.userId === selectedUserId).sort((a,b) => (b.date||'').localeCompare(a.date||''));
  const diaries = DB.diaries.filter(d => d.userId === selectedUserId);
  const goals = DB.goals.filter(g => g.userId === selectedUserId);
  const goodCount = diaries.filter(d => d.rating === 'good').length;
  const midCount = diaries.filter(d => d.rating === 'mid').length;
  const badCount = diaries.filter(d => d.rating === 'bad').length;
  const avgProgress = goals.length ? Math.round(goals.reduce((s,g) => s + getDisplayProgress(g).prog, 0) / goals.length) : 0;

  c.innerHTML = `
    <div class="breadcrumb"><a onclick="showPage('users')">利用者一覧</a> › <span>${esc(user?.name || '')}</span> › 振り返り・評価</div>
    <div class="review-grid" style="margin-bottom:20px">
      <div class="review-stat"><div class="num">${diaries.length}</div><div class="label">支援日誌 記録数</div></div>
      <div class="review-stat"><div class="num" style="color:#1a56db">${avgProgress}%</div><div class="label">目標平均達成度</div></div>
      <div class="review-stat"><div class="num" style="color:#16a34a">${goodCount}</div><div class="label">良好評価 回数</div></div>
      <div class="review-stat"><div class="num" style="color:#991b1b">${badCount}</div><div class="label">要支援評価 回数</div></div>
    </div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><h3>目標別達成状況</h3></div>
      <div class="card-body">
        ${goals.length ? goals.map(g => {
          const { prog, isAuto, linkedCount } = getDisplayProgress(g);
          const p = Math.min(100, Math.max(0, prog));
          const barColor = p >= 80 ? '#16a34a' : p >= 50 ? '#d97706' : '#1a56db';
          return `<div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
              <span>${esc(g.short)}</span>
              <span style="font-weight:600;color:${barColor}">${p}% ${isAuto ? `<span style="font-size:10px;color:#1a56db;font-weight:400">日誌${linkedCount}件</span>` : ''}</span>
            </div>
            <div class="progress-bar-bg"><div class="progress-bar" style="width:${p}%;background:${barColor}"></div></div>
            ${(g.start||g.end)?`<div style="font-size:11px;color:#888;margin-top:2px">${esc(g.start||'')} 〜 ${esc(g.end||'')}</div>`:''}
          </div>`;
        }).join('') : '<div style="color:#aaa;font-size:13px">目標が設定されていません</div>'}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>振り返り・評価記録</h3></div>
      <div class="card-body" style="padding:0">
        ${reviews.length ? reviews.map(r => {
          const ovMap = { A:'✓ 目標達成', B:'◎ おおむね達成', C:'△ 一部達成', D:'✗ 未達成', E:'→ 継続検討' };
          const ovColor = { A:'green', B:'green', C:'amber', D:'red', E:'' };
          return `<div style="padding:14px 18px;border-bottom:1px solid #eee;cursor:pointer" onclick="openEditReviewModal('${r.id}')">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <div><span class="date-badge">${r.date||''}</span> <span style="font-size:12px;color:#888;margin-left:8px">${esc(r.period||'')}</span></div>
              ${r.overall?`<span class="tag ${ovColor[r.overall]||''}">${ovMap[r.overall]||r.overall}</span>`:''}
            </div>
            ${r.staffNote?`<div style="font-size:13px;color:#444">${esc(r.staffNote.substring(0,80))}${r.staffNote.length>80?'…':''}</div>`:''}
            ${r.evaluator?`<div style="font-size:11px;color:#888;margin-top:4px">評価者: ${esc(r.evaluator)}</div>`:''}
          </div>`;
        }).join('') : '<div style="padding:20px;text-align:center;color:#aaa;font-size:13px">振り返り記録がまだありません</div>'}
      </div>
    </div>
  `;
}
function openAddReviewModal() {
  editingId = null;
  clearReviewForm();
  document.getElementById('review-delete-btn').style.display = 'none';
  document.getElementById('rv-date').value = today();
  openModal('review-modal');
}
function openEditReviewModal(id) {
  editingId = id;
  const r = DB.reviews.find(x => x.id === id);
  if (!r) return;
  document.getElementById('review-delete-btn').style.display = '';
  document.getElementById('rv-date').value = r.date || '';
  document.getElementById('rv-period').value = r.period || '';
  document.getElementById('rv-self').value = r.selfNote || '';
  document.getElementById('rv-staff').value = r.staffNote || '';
  document.getElementById('rv-next').value = r.nextNote || '';
  document.getElementById('rv-overall').value = r.overall || '';
  document.getElementById('rv-evaluator').value = r.evaluator || '';
  openModal('review-modal');
}
function clearReviewForm() {
  ['rv-date','rv-period','rv-self','rv-staff','rv-next','rv-overall','rv-evaluator'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
}
function saveReview() {
  const date = document.getElementById('rv-date').value;
  if (!date) { alert('評価日を入力してください'); return; }
  const reviews = DB.reviews;
  const data = {
    userId: selectedUserId, date, period: v('rv-period'),
    selfNote: v('rv-self'), staffNote: v('rv-staff'), nextNote: v('rv-next'),
    overall: v('rv-overall'), evaluator: v('rv-evaluator')
  };
  if (editingId) {
    const i = reviews.findIndex(x => x.id === editingId);
    if (i >= 0) reviews[i] = { ...reviews[i], ...data };
  } else {
    reviews.push({ id: uid(), ...data });
  }
  DB.reviews = reviews;
  closeModal('review-modal');
  renderPage('review');
}
function deleteReview() {
  if (!confirm('この振り返り記録を削除しますか？')) return;
  DB.reviews = DB.reviews.filter(r => r.id !== editingId);
  closeModal('review-modal');
  renderPage('review');
}

// ===================== ユーティリティ =====================
function exportData() {
  const data = { users: DB.users, diaries: DB.diaries, goals: DB.goals, reviews: DB.reviews };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '個別支援データ_' + today() + '.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 1000);
}
function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.users || !data.diaries) { alert('形式が正しくありません'); return; }
      const exU = new Set(DB.users.map(u => u.id));
      const exD = new Set(DB.diaries.map(d => d.id));
      const exG = new Set(DB.goals.map(g => g.id));
      const exR = new Set(DB.reviews.map(r => r.id));
      DB.users = [...DB.users, ...data.users.filter(u => !exU.has(u.id))];
      DB.diaries = [...DB.diaries, ...data.diaries.filter(d => !exD.has(d.id))];
      DB.goals = [...DB.goals, ...(data.goals || []).filter(g => !exG.has(g.id))];
      DB.reviews = [...DB.reviews, ...(data.reviews || []).filter(r => !exR.has(r.id))];
      input.value = '';
      alert('インポートしました。利用者: +' + data.users.filter(u => !exU.has(u.id)).length +
        '件、日誌: +' + data.diaries.filter(d => !exD.has(d.id)).length + '件');
      renderPage(currentPage);
    } catch (err) { alert('読み込みエラー: ' + err.message); }
  };
  reader.readAsText(file);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function v(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function today() { return new Date().toISOString().slice(0,10); }

// 紐付いた日誌の評価から達成度を自動計算（良好=100, 普通=50, 要支援=0 の平均）
// 評価が代表的でない場合は null を返す（→手動値にフォールバック）。
// ・評価済みが0件
// ・評価済みが紐付け日誌の過半数に満たない（例: 有効支援だけ「良好」を付けた状態だと
//   全部良好＝100%という偏った値になり実態を表さないため、自動計算しない）
function calcGoalProgress(goalId) {
  const linked = DB.diaries.filter(d => d.goalId === goalId);
  const rated = linked.filter(d => d.rating);
  if (!rated.length) return null;
  if (rated.length * 2 < linked.length) return null; // 評価が過半数未満なら代表性なしとみなす
  const score = { good: 100, mid: 50, bad: 0 };
  return Math.round(rated.reduce((s, d) => s + (score[d.rating] || 0), 0) / rated.length);
}
// 自動計算値があればそちら、なければ手動設定値
function getDisplayProgress(g) {
  const auto = calcGoalProgress(g.id);
  return { prog: auto !== null ? auto : (parseInt(g.progress) || 0), isAuto: auto !== null,
           linkedCount: DB.diaries.filter(d => d.goalId === g.id && d.rating).length };
}

document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

// ===================== 音声入力 =====================
(function setupVoice() {
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // 音声認識非対応ブラウザでは、HTMLに直書きされたマイクボタンを消す（押してもエラーになるため）
      document.querySelectorAll('.voice-btn').forEach(b => b.style.display = 'none');
      return;
    }

    let recog = null;
    let activeBtn = null;
    let activeTarget = null;
    let baseText = '';       // 録音開始時点のテキスト
    let manualStop = false;  // ユーザーが停止ボタンを押したか
    let fileWarned = false;  // file:// 警告は一度だけ

    function stopRecog() {
      manualStop = true;
      if (recog) { try { recog.onend = null; recog.stop(); } catch(e){} recog = null; }
      if (activeBtn) { activeBtn.classList.remove('recording'); activeBtn.textContent = '🎤'; }
      activeBtn = null; activeTarget = null;
    }

    function startRecog() {
      recog = new SpeechRecognition();
      recog.lang = 'ja-JP';
      recog.continuous = true;
      recog.interimResults = true;  // 途中経過もリアルタイム表示
      recog.onresult = e => {
        let finalText = '';
        let interim = '';
        for (let i = 0; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText += t;
          else interim += t;
        }
        if (finalText) {
          baseText = baseText + (baseText && !baseText.endsWith('\n') ? '\n' : '') + finalText;
        }
        const sep = baseText && !baseText.endsWith('\n') ? '\n' : '';
        activeTarget.value = baseText + (interim ? sep + interim : '');
      };
      recog.onerror = ev => {
        const err = ev && ev.error ? ev.error : '';
        // no-speech / aborted は無視して聞き続ける（onend で自動再開）
        if (err === 'no-speech' || err === 'aborted') return;
        const handled = activeBtn;
        stopRecog();
        let msg;
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          msg = 'マイクの使用が許可されていません。\n\n' +
            '・ブラウザのアドレスバーのマイクアイコンから「許可」してください。\n' +
            '・ファイルを直接開いている場合（file://）は許可ダイアログが出ません。' +
            'ローカルサーバー経由か https で開いてください。';
        } else if (err === 'network') {
          msg = '音声認識サーバーに接続できませんでした。\n\n' +
            'インターネット接続を確認のうえ、http(s) 経由で開いてください。';
        } else if (err === 'audio-capture') {
          msg = 'マイクが見つかりません。Windowsのサウンド設定で入力マイクと音量を確認してください。';
        } else {
          msg = '音声入力でエラーが発生しました（' + (err || '不明') + '）。';
        }
        if (handled) alert('🎤 ' + msg);
      };
      recog.onend = () => {
        // 停止ボタンを押していなければ自動で再開（無音タイムアウト対策）
        if (!manualStop && activeBtn) {
          try { recog.start(); } catch(e) { setTimeout(() => { if (!manualStop && activeBtn) startRecog(); }, 300); }
        }
      };
      recog.start();
    }

    window.toggleVoice = function(targetId, btn) {
      try {
        if (activeBtn === btn) { stopRecog(); return; }
        stopRecog();
        const el = document.getElementById(targetId);
        if (!el) return;
        manualStop = false;
        activeBtn = btn; activeTarget = el;
        baseText = el.value;
        btn.classList.add('recording'); btn.textContent = '⏹';
        if (location.protocol === 'file:' && !fileWarned) {
          fileWarned = true;
          alert('🎤 ファイルを直接開いている（file://）ため、音声入力が動作しない場合があります。\n\n' +
            'うまくいかないときは、ローカルサーバー経由か https でこのページを開いてください。');
        }
        startRecog();
      } catch(e) {
        stopRecog();
        alert('🎤 音声入力を開始できませんでした: ' + (e && e.message ? e.message : e));
      }
    };

    // モーダル内の全テキストエリアにマイクボタンを追加
    document.querySelectorAll('.modal textarea').forEach(ta => {
      try {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'voice-btn';
        btn.title = '音声入力';
        btn.textContent = '🎤';
        btn.setAttribute('onclick', `toggleVoice('${ta.id}', this)`);
        if (ta.nextElementSibling && ta.nextElementSibling.classList.contains('voice-btn')) return;
        ta.insertAdjacentElement('afterend', btn);
        const fg = ta.closest('.form-group');
        if (fg) fg.classList.add('has-voice');
      } catch(e) {}
    });
  } catch(e) {}
})();

// ===================== 起動・同期 =====================
async function _loadFromServer(){
  const res = await fetch('/api/data', { cache: 'no-store' });
  if (!res.ok) throw new Error('load failed ' + res.status);
  const data = await res.json();
  return {
    users: Array.isArray(data.users) ? data.users : [],
    diaries: Array.isArray(data.diaries) ? data.diaries : [],
    goals: Array.isArray(data.goals) ? data.goals : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
  };
}
async function _bootstrap(){
  try {
    _cache = await _loadFromServer();
    _baseline = _clone(_cache);
  } catch (e) {
    console.error(e);
    alert('⚠ サーバーからデータを読み込めませんでした。ページを再読み込みしてください。');
  }
  renderPage('users');
  _startPolling();
}
function _startPolling(){
  setInterval(async () => {
    // 入力中(モーダル表示中)は他者の更新で画面を書き換えない
    if (document.querySelector('.modal-overlay.open')) return;
    try {
      const next = await _loadFromServer();
      if (JSON.stringify(next) === JSON.stringify(_cache)) return; // 変化なし
      _cache = next;
      _baseline = _clone(next);
      // 選択中の利用者が消えていたら選択解除
      if (selectedUserId && !_cache.users.some(u => u.id === selectedUserId)) selectedUserId = null;
      renderPage(currentPage);
    } catch (e) { /* 一時的な失敗は無視して次回に任せる */ }
  }, 8000);
}

_bootstrap();
