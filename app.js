// ══════════════════════════════════════════════════
//  APP.JS — Future Academy v3
// ══════════════════════════════════════════════════

let currentPage = 'home';
let adminUnlocked = false;
let adminTab = 'players';
let playerFormRating = 3;
let selectedIcon = '🔔';
let posFilter = 'الكل';
let selectedPlayerId = null;

// ─── Navigation ──────────────────────────────────────────────────────────────
function navigate(page) {
  if (page === 'admin' && !adminUnlocked) {
    currentPage = 'admin_gate';
    document.querySelectorAll('.nav-btn, .side-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.admin-btn')?.classList.add('active');
    document.getElementById('mainContent').innerHTML = renderAdminGate();
    window.scrollTo({ top:0, behavior:'smooth' });
    return;
  }
  currentPage = page;
  document.querySelectorAll('.nav-btn, .side-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });
  document.querySelector('.admin-btn')?.classList.toggle('active', page === 'admin');
  render();
  window.scrollTo({ top:0, behavior:'smooth' });
}

function toggleMobile() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// ─── Admin Gate ──────────────────────────────────────────────────────────────
function renderAdminGate() {
  return `
  <div class="gate-wrap">
    <div class="gate-box">
      <div class="gate-icon">🔐</div>
      <h2>لوحة الإدارة</h2>
      <p>أدخل كلمة المرور للمتابعة</p>
      <div class="gate-input-row">
        <input class="form-input gate-input" type="password" id="gatePass"
               placeholder="كلمة المرور..."
               onkeydown="if(event.key==='Enter')checkAdminPassword()" />
        <button class="btn-save" onclick="checkAdminPassword()">دخول</button>
      </div>
      <div class="gate-error" id="gateError" style="display:none">❌ كلمة المرور غير صحيحة</div>
    </div>
  </div>`;
}

function checkAdminPassword() {
  const val = document.getElementById('gatePass')?.value;
  if (val === ADMIN_PASSWORD) {
    adminUnlocked = true;
    navigate('admin');
  } else {
    const err = document.getElementById('gateError');
    if (err) { err.style.display = 'block'; setTimeout(() => err.style.display='none', 2500); }
  }
}

function lockAdmin() {
  adminUnlocked = false;
  navigate('home');
  toast('تم تسجيل الخروج من الإدارة');
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  t.innerHTML = `<span>${icon}</span><span>${msg}</span><span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function openModal(title, bodyHtml) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// ─── Render ──────────────────────────────────────────────────────────────────
function render() {
  const main = document.getElementById('mainContent');
  const s = getState();
  document.getElementById('bellDot').classList.toggle('show', s.news.length > 0);

  switch (currentPage) {
    case 'home':     main.innerHTML = renderHome(s);     break;
    case 'players':  main.innerHTML = renderPlayers(s);  bindPlayers(s); break;
    case 'training': main.innerHTML = renderTraining(s); break;
    case 'news':     main.innerHTML = renderNews(s);     break;
    case 'admin':    main.innerHTML = renderAdmin(s);    bindAdmin(s);   break;
    default:         main.innerHTML = renderHome(s);
  }
}

// ══════════════════════════════════════════════════
//  HOME
// ══════════════════════════════════════════════════
function renderHome(s) {
  const weekly = s.weeklyTop.map(id => s.players.find(p => p.id === id)).filter(Boolean);
  const ov = s.siteStatsOverride || {};

  return `
  <div class="hero">
    <div class="hero-bg1"></div><div class="hero-bg2"></div>
    <div class="hero-deco1">⚽</div><div class="hero-deco2">🏆</div>
    <div class="hero-inner">
      <div>
        <div class="hero-tag">${ov.hero_tag || '🏆 أكاديمية كرة قدم احترافية'}</div>
        <h1>FUTURE<br><span>ACADEMY</span></h1>
        <p>${ov.hero_text || 'منصة إدارة متكاملة للاعبين، التمارين، الخطط التكتيكية، والأخبار.'}</p>
        <div class="hero-btns">
          <button class="btn-primary" onclick="navigate('players')">👥 عرض اللاعبين</button>
          <button class="btn-outline" onclick="navigate('admin')">⚙️ دخول الإدارة</button>
        </div>
      </div>
      <div class="hero-card">
        <div class="hero-card-logo">⚽</div>
        <div class="hero-card-title">FUTURE ACADEMY</div>
        <div class="hero-card-sub">TRAIN • ANALYZE • WIN</div>
        <div class="hero-mini-stats">
          <div class="hero-mini-stat"><div class="val">${ov.players_val || s.players.length}</div><div class="lbl">${ov.players_lbl || 'لاعب'}</div></div>
          <div class="hero-mini-stat"><div class="val" style="color:#10b981">${ov.sessions_val || s.training.length}</div><div class="lbl">${ov.sessions_lbl || 'تمرين'}</div></div>
        </div>
      </div>
    </div>
  </div>

  <div class="stats-grid">
    ${buildStatCards(s)}
  </div>

  ${weekly.length ? `
  <div class="weekly-section">
    <div class="section-header">
      <div>
        <div style="font-size:11px;font-weight:900;color:#f59e0b;letter-spacing:2px;margin-bottom:4px;">⭐ WEEKLY AWARDS</div>
        <h2>أفضل 3 لاعبين في الأسبوع</h2>
      </div>
      <button class="see-all" onclick="navigate('players')">عرض الكل ←</button>
    </div>
    <div class="weekly-cards">
      ${weekly.map((p, i) => `
        <div class="weekly-card-wrap">
          ${i === 0 ? '<div class="crown-badge">👑</div>' : ''}
          ${buildPlayerCard(p, false, i)}
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  ${s.news.length ? `
  <div style="margin-bottom:28px">
    <div class="section-header">
      <h2>📰 آخر الأخبار</h2>
      <button class="see-all" onclick="navigate('news')">عرض الكل ←</button>
    </div>
    <div class="news-grid">
      ${s.news.slice(0,3).map(n => newsCard(n)).join('')}
    </div>
  </div>` : ''}

  ${s.training.length ? `
  <div>
    <div class="section-header">
      <h2>💪 جدول التمارين القادم</h2>
      <button class="see-all" onclick="navigate('training')">التفاصيل ←</button>
    </div>
    <div class="training-quick-grid">
      ${s.training.slice(0,4).map(t => `
        <div class="training-quick-item">
          <div class="training-quick-icon" style="background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.25)">💪</div>
          <div style="flex:1;min-width:0">
            <div class="training-quick-day">${t.day}</div>
            <div class="training-quick-focus">${t.focus}</div>
          </div>
          <div class="training-quick-time" style="background:rgba(16,185,129,.1);color:#10b981;border:1px solid rgba(16,185,129,.2)">${t.time}</div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}
  `;
}

function statCard(icon, label, val, color) {
  return `
  <div class="stat-card" style="border-color:${color}18">
    <div class="stat-card-icon" style="background:${color}18;border:1px solid ${color}28">${icon}</div>
    <div class="stat-card-val" style="color:${color}">${val}</div>
    <div class="stat-card-lbl">${label}</div>
  </div>`;
}

function newsCard(n) {
  const colors = {'📅':'#38bdf8','🏆':'#f59e0b','🔔':'#10b981','📰':'#a78bfa','⭐':'#f59e0b'};
  const c = colors[n.icon] || '#38bdf8';
  return `
  <div class="news-card" style="border-color:${c}20">
    <div class="news-card-icon" style="background:${c}15;border:1px solid ${c}25">${n.icon}</div>
    <h3>${n.title}</h3>
    <p>${n.text}</p>
    ${n.date ? `<div class="news-date">📅 ${n.date}</div>` : ''}
  </div>`;
}

// ─── FIFA Player Card ─────────────────────────────────────────────────────────
function buildPlayerCard(p, small = false, rank) {
  const cfg = posCfg(p.position);
  const score = calcScore(p);
  const w = small ? 130 : 175;
  const h = small ? 200 : 280;
  const imgH = small ? 78 : 108;
  const imgW = small ? 96 : 132;
  const scoreSz = small ? 22 : 30;
  const badgeSz = small ? 9 : 11;
  const nameSz  = small ? 11 : 14;
  const statSz  = small ? 9 : 11;

  const stars = Array.from({length:5}).map((_,i) =>
    `<span class="card-star${i < p.rating ? ' on' : ''}">${i < p.rating ? '★' : '☆'}</span>`
  ).join('');

  // 6 stats in 3 columns
  const statEntries = Object.entries(p.stats || {}).slice(0, 6);
  const statHtml = statEntries.map(([k,v]) => `
    <div class="card-stat" style="background:${cfg.color}14">
      <div class="card-stat-val" style="color:${cfg.color};font-size:${statSz+3}px">${v}</div>
      <div class="card-stat-lbl" style="font-size:${statSz-1}px">${(STAT_LABELS[k]||k).slice(0,4)}</div>
    </div>
  `).join('');

  return `
  <div class="player-card${small?' small':''}"
    style="background:${cfg.cardBg};border:1px solid ${cfg.color}28;width:${w}px;min-height:${h}px;box-shadow:0 8px 32px ${cfg.glow}"
    onclick="selectPlayer(${p.id})"
  >
    <div class="card-shimmer"></div>
    <div class="card-glow-top" style="background:radial-gradient(ellipse at 50% 0%,${cfg.color}28,transparent 70%)"></div>
    ${rank !== undefined ? `<div class="card-rank-badge" style="background:${cfg.color}">${rank===0?'👑':rank+1}</div>` : ''}
    <div class="card-top">
      <div>
        <div class="card-score" style="color:${cfg.color};font-size:${scoreSz}px">${score}</div>
        <div class="card-badge" style="color:${cfg.color};font-size:${badgeSz}px">${cfg.badge}</div>
      </div>
      <div class="card-num" style="color:${cfg.color}">#${p.number||p.id}</div>
    </div>
    <div class="card-img-wrap">
      <div class="card-img" style="width:${imgW}px;height:${imgH}px">
        <img src="${p.image||'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=200&q=60'}"
             onerror="this.src='https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=200&q=60'"
             alt="${p.name}" />
      </div>
    </div>
    <div class="card-divider" style="background:linear-gradient(90deg,transparent,${cfg.color}55,transparent)"></div>
    <div class="card-name" style="font-size:${nameSz}px">${p.name}</div>
    <div class="card-stars" style="color:${cfg.color}">${stars}</div>
    <div class="card-stats card-stats-6">${statHtml}</div>
    <div class="card-bottom-line" style="color:${cfg.color}"></div>
  </div>`;
}

// ══════════════════════════════════════════════════
//  PLAYERS
// ══════════════════════════════════════════════════
function renderPlayers(s) {
  const filters = ['الكل','حارس مرمى','مدافع','وسط ملعب','مهاجم'];
  const filtered = s.players.filter(p => posFilter === 'الكل' || p.position === posFilter);
  const selPlayer = selectedPlayerId
    ? s.players.find(p => p.id === selectedPlayerId)
    : (s.players[0] || null);
  const cfg = selPlayer ? posCfg(selPlayer.position) : null;

  return `
  <div class="section-title">
    <div class="section-tag">👥 Future Academy</div>
    <h2>اللاعبون</h2>
    <p>بطاقات، تقييمات وإحصائيات كاملة.</p>
  </div>

  <div class="search-bar">
    <span>🔍</span>
    <input id="playerSearch" placeholder="ابحث عن لاعب..." oninput="filterPlayers()" />
  </div>

  <div class="pos-filters">
    ${filters.map(f => {
      const c = posCfg(f)?.color || '#38bdf8';
      return `<button class="pos-filter${posFilter===f?' active':''}"
        style="${posFilter===f?`color:${c};background:${c}18;border-color:${c}40`:''}"
        onclick="setPosFilter('${f}')">${f}</button>`;
    }).join('')}
  </div>

  <div class="cards-grid" id="cardsGrid">
    ${filtered.map(p => buildPlayerCard(p, false)).join('')}
  </div>

  ${selPlayer ? `
  <div class="player-info-panel" style="background:linear-gradient(160deg,#0a0e1a,#0f1629);border:1px solid ${cfg.color}28;box-shadow:0 8px 32px ${cfg.glow}18;border-radius:20px;padding:24px;margin-top:8px">
    <div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start">
      <img class="player-info-img" style="width:140px;height:140px;border-radius:14px;object-fit:cover;object-position:top"
           src="${selPlayer.image}"
           onerror="this.src='https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=500&q=80'"
           alt="${selPlayer.name}"/>
      <div>
        <div class="player-info-name">${selPlayer.name}</div>
        <div style="margin-top:6px">
          <span class="player-pos-tag" style="background:${cfg.color}18;color:${cfg.color};border:1px solid ${cfg.color}35">${cfg.badge}</span>
          <span class="player-info-pos"> ${selPlayer.position} · ${selPlayer.age} سنة · #${selPlayer.number||selPlayer.id}</span>
        </div>
        <div style="margin-top:8px">${starsHtml(selPlayer.rating, cfg.color)}</div>
        ${selPlayer.notes ? `<div class="player-notes">💬 ${selPlayer.notes}</div>` : ''}
      </div>
    </div>
    <div class="player-stats-grid" style="margin-top:18px">
      ${Object.entries(selPlayer.stats||{}).map(([k,v]) => {
        const lbl = STAT_LABELS[k] || k;
        const pct = Math.min(100, v); // already 0-100
        return `<div class="player-stat-item" style="background:${cfg.color}10;border:1px solid ${cfg.color}20">
          <div class="player-stat-val" style="color:${cfg.color}">${v}</div>
          <div class="player-stat-bar-wrap"><div class="player-stat-bar" style="width:${pct}%;background:${cfg.color}"></div></div>
          <div class="player-stat-lbl">${lbl}</div>
        </div>`;
      }).join('')}
    </div>
  </div>` : `<div class="empty-state"><div class="empty-state-icon">👥</div><p>لا يوجد لاعبون</p></div>`}
  `;
}

function bindPlayers(s) {}

function selectPlayer(id) { selectedPlayerId = id; render(); }
function setPosFilter(f) { posFilter = f; render(); }

function filterPlayers() {
  const q = document.getElementById('playerSearch')?.value?.toLowerCase() || '';
  const s = getState();
  const filtered = s.players.filter(p =>
    (posFilter === 'الكل' || p.position === posFilter) &&
    `${p.name} ${p.position}`.toLowerCase().includes(q)
  );
  document.getElementById('cardsGrid').innerHTML = filtered.map(p => buildPlayerCard(p, false)).join('');
}

// ══════════════════════════════════════════════════
//  TRAINING
// ══════════════════════════════════════════════════
const DAY_COLORS = { 'الأحد':'#38bdf8','الاثنين':'#10b981','الثلاثاء':'#a78bfa','الأربعاء':'#f59e0b','الخميس':'#ef4444','الجمعة':'#10b981','السبت':'#f97316' };

function renderTraining(s) {
  return `
  <div class="section-title">
    <div class="section-tag">💪 Future Academy</div>
    <h2>التمارين والخطط</h2>
    <p>الجدول الأسبوعي واللوحة التكتيكية التفاعلية.</p>
  </div>
  <div class="training-grid">
    <div>
      <h3 style="font-size:15px;font-weight:900;color:#94a3b8;margin-bottom:14px">📅 الجدول الأسبوعي</h3>
      <div class="schedule-list">
        ${s.training.length ? s.training.map(t => {
          const c = DAY_COLORS[t.day] || '#38bdf8';
          return `<div class="schedule-item" style="background:linear-gradient(135deg,#0f1629,#141e33);border:1px solid ${c}18">
            <div class="schedule-icon" style="background:${c}12;border:1px solid ${c}25">💪</div>
            <div style="flex:1;min-width:0">
              <div class="schedule-day">${t.day}</div>
              <div class="schedule-focus">${t.focus}</div>
            </div>
            <div class="schedule-time" style="background:${c}12;color:${c};border:1px solid ${c}22">${t.time}</div>
          </div>`;
        }).join('') : '<div class="empty-state"><div class="empty-state-icon">📅</div><p>لا يوجد تمارين</p></div>'}
      </div>
    </div>
    <div class="tactic-panel">
      <div class="tactic-controls">
        <div>
          <h3 style="font-size:15px;font-weight:900;color:#94a3b8">🏴 التشكيلة الحالية: ${s.formationName||'مخصصة'}</h3>
          ${s.formationDay ? `<div style="margin-top:4px;font-size:12px;color:${DAY_COLORS[s.formationDay]||'#64748b'}">📅 يوم التنفيذ: ${s.formationDay}</div>` : ''}
        </div>
        <button class="tactic-anim-btn${s.formationAnimated?' on':''}" onclick="onToggleAnim()">
          ${s.formationAnimated ? '⏸ إيقاف' : '▶ تحريك'}
        </button>
      </div>
      ${buildField(s)}
      <div class="tactic-legend">
        ${[['GK','حارس','#f59e0b'],['DEF','مدافع','#3b82f6'],['MID','وسط','#10b981'],['FWD','مهاجم','#ef4444']].map(([p,n,c]) => `
          <div class="legend-item" style="background:${c}10;border:1px solid ${c}18">
            <div class="legend-dot" style="background:${c}"></div>
            <div><div class="legend-pos" style="color:${c}">${p}</div><div class="legend-name">${n}</div></div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function buildField(s) {
  const slots = s.formationSlots || defaultFormationSlots();
  const animated = s.formationAnimated;
  const players = s.players;

  const rows = slots.map((line, li) => {
    const dots = line.map((slot, si) => {
      const pos = slot.pos || 'CM';
      const c = POS_FIELD_COLORS[pos] || '#38bdf8';
      const delay = (li * line.length + si) * 0.18;
      const assignedPlayer = slot.pid ? players.find(p => p.id === slot.pid) : null;
      const firstName = assignedPlayer ? assignedPlayer.name.split(' ')[0] : pos;
      const label = firstName.length > 6 ? firstName.slice(0,6)+'.' : firstName;
      return `<div class="field-player">
        <div class="field-dot${animated?' animated':''}" title="${assignedPlayer?assignedPlayer.name:pos}"
          style="background:radial-gradient(circle at 35% 35%,${c},${c}88);border:2px solid ${c};box-shadow:0 0 ${animated?20:10}px ${c}55;animation-delay:${delay}s;font-size:${assignedPlayer?'6px':'9px'}">${label}</div>
        <div class="field-shadow" style="background:${c};animation-delay:${delay}s"></div>
      </div>`;
    }).join('');
    return `<div class="field-line">${dots}</div>`;
  }).join('');

  return `
  <div class="field">
    <svg class="field-svg" viewBox="0 0 400 500" preserveAspectRatio="none">
      <line x1="0" y1="250" x2="400" y2="250" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <circle cx="200" cy="250" r="50" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
      <circle cx="200" cy="250" r="4" fill="rgba(255,255,255,0.4)"/>
      <rect x="100" y="0" width="200" height="80" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
      <rect x="150" y="0" width="100" height="38" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" fill="none"/>
      <rect x="100" y="420" width="200" height="80" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
      <rect x="150" y="462" width="100" height="38" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" fill="none"/>
    </svg>
    <div class="field-players">${rows}</div>
    <div class="field-formation-label">${s.formationName||''}</div>
  </div>`;
}

function onToggleAnim() { toggleAnimation(); render(); }

// ══════════════════════════════════════════════════
//  NEWS
// ══════════════════════════════════════════════════
function renderNews(s) {
  return `
  <div class="section-title">
    <div class="section-tag">📰 Future Academy</div>
    <h2>الأخبار والإعلانات</h2>
    <p>آخر تحديثات الأكاديمية والمواعيد.</p>
  </div>
  ${s.news.length ? `
  <div class="news-page-grid">
    ${s.news.map(n => {
      const colors = {'📅':'#38bdf8','🏆':'#f59e0b','🔔':'#10b981','📰':'#a78bfa','⭐':'#f59e0b'};
      const c = colors[n.icon] || '#38bdf8';
      return `<div class="news-big-card" style="background:linear-gradient(160deg,#0f1629,#141e33);border:1px solid ${c}18">
        <div class="news-big-icon" style="background:${c}15;border:1px solid ${c}28">${n.icon}</div>
        <div>
          <h3>${n.title}</h3>
          <p>${n.text}</p>
          ${n.date ? `<div style="font-size:11px;color:#475569;margin-top:8px">📅 ${n.date}</div>` : ''}
        </div>
      </div>`;
    }).join('')}
  </div>` : '<div class="empty-state"><div class="empty-state-icon">📰</div><p>لا توجد أخبار</p></div>'}`;
}

// ══════════════════════════════════════════════════
//  ADMIN
// ══════════════════════════════════════════════════
function renderAdmin(s) {
  const tabs = [
    {id:'players',   label:'👥 اللاعبون'},
    {id:'weekly',    label:'🏆 أفضل الأسبوع'},
    {id:'news',      label:'📰 الأخبار'},
    {id:'training',  label:'💪 التمارين'},
    {id:'formation', label:'🏴 الخطط'},
    {id:'siteStats', label:'📊 إحصائيات الواجهة'},
  ];

  return `
  <div class="section-title">
    <div class="section-tag">⚙️ Future Academy</div>
    <h2>لوحة الإدارة</h2>
    <p>أضف وعدّل واحذف كل شيء — التغييرات تظهر فوراً.</p>
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
    <div class="admin-live-badge"><div class="live-dot"></div> التغييرات تُحفظ تلقائياً</div>
    <button onclick="lockAdmin()" style="padding:8px 18px;border-radius:12px;font-size:12px;font-weight:900;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;cursor:pointer;">🔒 تسجيل الخروج</button>
  </div>
  <div class="admin-tabs">
    ${tabs.map(t => `<button class="admin-tab${adminTab===t.id?' active':''}" onclick="switchAdminTab('${t.id}')">${t.label}</button>`).join('')}
  </div>
  <div id="adminSections">
    ${renderAdminPlayers(s)}
    ${renderAdminWeekly(s)}
    ${renderAdminNews(s)}
    ${renderAdminTraining(s)}
    ${renderAdminFormation(s)}
    ${renderAdminSiteStats(s)}
  </div>`;
}

function bindAdmin(s) { showAdminTab(adminTab); }

function switchAdminTab(tab) {
  adminTab = tab;
  render();
}

function showAdminTab(tab) {
  document.querySelectorAll('.admin-section').forEach(el => {
    el.classList.toggle('active', el.dataset.section === tab);
  });
}

// ─── Admin: Players ───────────────────────────────────────────────────────────
function renderAdminPlayers(s) {
  return `
  <div class="admin-section${adminTab==='players'?' active':''}" data-section="players">
    <button class="btn-primary" style="margin-bottom:16px" onclick="openPlayerModal(null)">➕ إضافة لاعب جديد</button>
    <div class="admin-list">
      ${s.players.map(p => {
        const c = posCfg(p.position).color;
        return `<div class="admin-list-item" style="border-color:${c}18">
          <img class="admin-list-item-img" src="${p.image}"
               onerror="this.src='https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=200&q=60'"
               alt="${p.name}"/>
          <div class="admin-list-item-info">
            <div class="admin-list-item-name">${p.name}</div>
            <div class="admin-list-item-sub" style="color:${c}">${p.position} · #${p.number||p.id}</div>
            <div>${starsHtml(p.rating, c)}</div>
          </div>
          <div class="admin-list-actions">
            <button class="btn-edit" onclick="openPlayerModal(${p.id})">✏️</button>
            <button class="btn-del" onclick="confirmDeletePlayer(${p.id})">🗑️</button>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ─── Admin: Weekly ────────────────────────────────────────────────────────────
function renderAdminWeekly(s) {
  const medals = ['👑','🥈','🥉'];
  const previewPlayers = s.weeklyTop.map(id => s.players.find(p => p.id === id)).filter(Boolean);
  return `
  <div class="admin-section${adminTab==='weekly'?' active':''}" data-section="weekly">
    <p style="color:#64748b;font-size:13px;margin-bottom:16px">اختر 3 لاعبين يظهرون في الصفحة الرئيسية كأفضل لاعبي الأسبوع.</p>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
      ${[0,1,2].map(i => `
        <div class="weekly-admin-row">
          <div class="weekly-rank-icon" style="background:${i===0?'rgba(245,158,11,.15)':i===1?'rgba(148,163,184,.1)':'rgba(180,83,9,.1)'}">${medals[i]}</div>
          <select class="form-input" style="flex:1" onchange="onWeeklyChange(${i}, this.value)">
            <option value="">-- اختر لاعباً --</option>
            ${s.players.map(p => `<option value="${p.id}"${s.weeklyTop[i]===p.id?' selected':''}>${p.name} - ${p.position}</option>`).join('')}
          </select>
        </div>
      `).join('')}
    </div>
    ${previewPlayers.length ? `
    <p style="font-size:11px;color:#475569;font-weight:700;letter-spacing:1px;margin-bottom:12px">معاينة البطاقات</p>
    <div class="weekly-admin-preview">
      ${previewPlayers.map((p, i) => buildPlayerCard(p, true, i)).join('')}
    </div>` : ''}
  </div>`;
}

// ─── Admin: News ─────────────────────────────────────────────────────────────
function renderAdminNews(s) {
  const icons = ['📅','🏆','🔔','📰','⭐','🛡️'];
  return `
  <div class="admin-section${adminTab==='news'?' active':''}" data-section="news">
    <div class="admin-form-box">
      <h4 id="newsFormTitle">➕ إضافة إعلان جديد</h4>
      <input type="hidden" id="newsEditId" />
      <div class="form-grid">
        <div class="form-field full"><div class="form-label">العنوان *</div><input class="form-input" id="newsTitle" placeholder="عنوان الإعلان..." /></div>
        <div class="form-field full"><div class="form-label">النص</div><textarea class="form-input" id="newsText" placeholder="تفاصيل الإعلان..."></textarea></div>
        <div class="form-field full">
          <div class="form-label">الأيقونة</div>
          <div class="icon-picker">
            ${icons.map(ic => `<button class="icon-pick-btn${selectedIcon===ic?' active':''}" onclick="pickIcon('${ic}')">${ic}</button>`).join('')}
          </div>
        </div>
      </div>
      <div class="form-btns">
        <button class="btn-save" onclick="saveNews()">حفظ الإعلان</button>
        <button class="btn-cancel" id="newsCancelBtn" style="display:none" onclick="cancelNewsEdit()">إلغاء</button>
      </div>
    </div>
    <div class="admin-list">
      ${s.news.map(n => `
        <div class="admin-list-item">
          <div style="font-size:26px">${n.icon}</div>
          <div class="admin-list-item-info">
            <div class="admin-list-item-name">${n.title}</div>
            <div class="admin-list-item-sub">${n.text}</div>
          </div>
          <div class="admin-list-actions">
            <button class="btn-edit" onclick="editNews(${n.id})">✏️</button>
            <button class="btn-del" onclick="deleteNewsItem(${n.id})">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// ─── Admin: Training ──────────────────────────────────────────────────────────
function renderAdminTraining(s) {
  return `
  <div class="admin-section${adminTab==='training'?' active':''}" data-section="training">
    <div class="admin-form-box">
      <h4 id="trainingFormTitle">➕ إضافة تمرين</h4>
      <input type="hidden" id="trainingEditId" />
      <div class="form-grid">
        <div class="form-field"><div class="form-label">اليوم *</div><input class="form-input" id="trainingDay" placeholder="الأحد" /></div>
        <div class="form-field"><div class="form-label">الوقت</div><input class="form-input" id="trainingTime" placeholder="6:30 PM" /></div>
        <div class="form-field full"><div class="form-label">التركيز</div><input class="form-input" id="trainingFocus" placeholder="لياقة + تحكم بالكرة" /></div>
      </div>
      <div class="form-btns">
        <button class="btn-save" onclick="saveTrainingItem()">حفظ</button>
        <button class="btn-cancel" id="trainingCancelBtn" style="display:none" onclick="cancelTrainingEdit()">إلغاء</button>
      </div>
    </div>
    <div class="admin-list">
      ${s.training.map(t => `
        <div class="admin-list-item">
          <div style="font-size:26px">💪</div>
          <div class="admin-list-item-info">
            <div class="admin-list-item-name">${t.day} <span style="color:#38bdf8;font-size:12px">· ${t.time}</span></div>
            <div class="admin-list-item-sub">${t.focus}</div>
          </div>
          <div class="admin-list-actions">
            <button class="btn-edit" onclick="editTraining(${t.id})">✏️</button>
            <button class="btn-del" onclick="deleteTrainingItem(${t.id})">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// ─── Admin: Formation (Full Custom) ──────────────────────────────────────────
function renderAdminFormation(s) {
  const slots = s.formationSlots || defaultFormationSlots();
  const players = s.players;

  const lineEditors = slots.map((line, li) => `
    <div class="formation-line-editor">
      <div class="formation-line-header">
        <span style="font-size:12px;font-weight:900;color:#94a3b8">الصف ${li + 1}</span>
        <div style="display:flex;gap:6px">
          <button class="fmt-btn fmt-btn-add" onclick="fmtAddSlot(${li})">+ مركز</button>
          ${slots.length > 1 ? `<button class="fmt-btn fmt-btn-del" onclick="fmtRemoveLine(${li})">حذف الصف</button>` : ''}
        </div>
      </div>
      <div class="formation-slots-row">
        ${line.map((slot, si) => {
          const c = POS_FIELD_COLORS[slot.pos] || '#38bdf8';
          const assignedPlayer = slot.pid ? players.find(p => p.id === slot.pid) : null;
          return `
          <div class="formation-slot-card" style="border-color:${c}40">
            <input class="formation-pos-input" value="${slot.pos}"
                   style="border-bottom-color:${c}"
                   onchange="fmtUpdatePos(${li},${si},this.value)"
                   title="اسم المركز (مثال: GK, ST, CM)" />
            <select class="formation-player-sel" onchange="fmtAssignPlayer(${li},${si},this.value)">
              <option value="">— لاعب —</option>
              ${players.map(p => `<option value="${p.id}"${slot.pid===p.id?' selected':''}>${p.name}</option>`).join('')}
            </select>
            ${line.length > 1 ? `<button class="formation-slot-del" onclick="fmtRemoveSlot(${li},${si})">✕</button>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>
  `).join('');

  return `
  <div class="admin-section${adminTab==='formation'?' active':''}" data-section="formation">
    <div class="admin-form-box">
      <h4>⚽ إعدادات التشكيلة الحالية</h4>

      <div class="form-grid" style="margin-bottom:16px">
        <div class="form-field">
          <div class="form-label">اسم التشكيلة</div>
          <input class="form-input" id="fmtNameInput" value="${s.formationName||''}" placeholder="مثال: 4-3-3 مخصصة" />
        </div>
        <div class="form-field">
          <div class="form-label">📅 يوم تنفيذ الخطة</div>
          <select class="form-input" id="fmtDayInput">
            <option value="">-- اختر اليوم --</option>
            ${['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'].map(d =>
              `<option value="${d}"${s.formationDay===d?' selected':''}>${d}</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
        <button class="btn-save" onclick="fmtSaveName();fmtSaveDay()">💾 حفظ الإعدادات</button>
        <button onclick="fmtSavePlan()"
          style="padding:10px 18px;border-radius:12px;font-size:13px;font-weight:900;cursor:pointer;background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.35);color:#a78bfa">
          ⭐ حفظ كخطة محفوظة
        </button>
      </div>

      <div class="form-field" style="margin-bottom:16px">
        <div class="form-label">تحميل تشكيلة جاهزة</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
          ${Object.keys(FORMATION_PRESETS).map(f => `
            <button onclick="fmtLoadPreset('${f}')"
              style="padding:8px 16px;border-radius:10px;font-size:13px;font-weight:900;cursor:pointer;
                     background:${s.formationName===f?'rgba(56,189,248,.18)':'rgba(255,255,255,.04)'};
                     border:1px solid ${s.formationName===f?'rgba(56,189,248,.45)':'rgba(255,255,255,.1)'};
                     color:${s.formationName===f?'#38bdf8':'#64748b'}">${f}</button>
          `).join('')}
        </div>
      </div>

      <div class="form-field" style="margin-bottom:0">
        <div class="form-label">حركة اللاعبين</div>
        <button onclick="onToggleAnim()" style="margin-top:8px;padding:10px 20px;border-radius:12px;font-size:13px;font-weight:900;cursor:pointer;transition:.2s;
          background:${s.formationAnimated?'rgba(16,185,129,.15)':'rgba(255,255,255,.04)'};
          border:1px solid ${s.formationAnimated?'rgba(16,185,129,.4)':'rgba(255,255,255,.1)'};
          color:${s.formationAnimated?'#10b981':'#64748b'}">
          ${s.formationAnimated ? '⏸ إيقاف الحركة' : '▶ تفعيل الحركة'}
        </button>
      </div>
    </div>

    <!-- Saved plans list -->
    ${s.savedFormations && s.savedFormations.length ? `
    <div style="margin-bottom:20px">
      <h4 style="font-size:14px;font-weight:900;color:#94a3b8;margin-bottom:12px">⭐ الخطط المحفوظة</h4>
      <div class="admin-list">
        ${s.savedFormations.map(plan => {
          const dc = DAY_COLORS[plan.day] || '#64748b';
          return `<div class="admin-list-item" style="border-color:rgba(167,139,250,.15)">
            <div style="font-size:26px">🏴</div>
            <div class="admin-list-item-info">
              <div class="admin-list-item-name">${plan.name}</div>
              <div class="admin-list-item-sub">
                ${plan.day && plan.day!=='—' ? `<span style="color:${dc};background:${dc}15;padding:2px 8px;border-radius:6px;font-size:11px">📅 ${plan.day}</span>` : ''}
                <span style="color:#64748b;font-size:11px;margin-right:6px">${plan.slots.length} صفوف · ${plan.slots.reduce((a,l)=>a+l.length,0)} مركز</span>
              </div>
            </div>
            <div class="admin-list-actions">
              <button class="btn-edit" onclick="fmtActivatePlan(${plan.id})" title="تحميل وتفعيل">▶</button>
              <button class="btn-del" onclick="fmtDeletePlan(${plan.id})">🗑️</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}

    <!-- Line editor -->
    <div class="formation-editor">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <h4 style="font-size:14px;font-weight:900;color:#94a3b8">✏️ تعديل الصفوف والمراكز</h4>
        <button class="fmt-btn fmt-btn-add" onclick="fmtAddLine()">+ إضافة صف</button>
      </div>
      ${lineEditors}
    </div>

    <!-- Field preview -->
    <div style="margin-top:20px">
      <h4 style="font-size:14px;font-weight:900;color:#94a3b8;margin-bottom:12px">👀 معاينة الملعب</h4>
      ${buildField(s)}
    </div>
  </div>`;
}

// Formation action handlers
function fmtAddLine()                { addFormationLine();              render(); }
function fmtRemoveLine(li)           { removeFormationLine(li);         render(); }
function fmtAddSlot(li)              { addSlotToLine(li);               render(); }
function fmtRemoveSlot(li,si)        { removeSlotFromLine(li,si);       render(); }
function fmtUpdatePos(li,si,val)     { updateSlotPos(li, si, val.trim().toUpperCase()||'CM'); /* no full re-render needed */ }
function fmtAssignPlayer(li,si,val)  { assignPlayerToSlot(li, si, val ? Number(val) : null); /* no full re-render */ }
function fmtSaveName() {
  const v = document.getElementById('fmtNameInput')?.value?.trim();
  if (v) { setFormationName(v); }
}
function fmtSaveDay() {
  const v = document.getElementById('fmtDayInput')?.value;
  setFormationDay(v || '');
  toast('تم حفظ الإعدادات ✅');
  render();
}
function fmtLoadPreset(key)          { loadPresetFormation(key); toast(`تم تحميل تشكيلة ${key} ✅`); render(); }

// ══════════════════════════════════════════════════
//  ADMIN ACTIONS
// ══════════════════════════════════════════════════

// ─── Player Modal ─────────────────────────────────────────────────────────────
function openPlayerModal(id) {
  const s = getState();
  const p = id ? s.players.find(x => x.id === id) : null;
  playerFormRating = p ? p.rating : 3;

  const posOptions = Object.keys(POS_CFG).map(pos =>
    `<option value="${pos}"${p?.position===pos?' selected':''}>${pos}</option>`
  ).join('');

  const defaultStats = p ? p.stats : { stamina:75, shot:70, pass:72, speed:74, skills:70, chemistry:75 };

  const statFields = Object.entries(STAT_LABELS).map(([key, label]) => `
    <div class="form-field">
      <div class="form-label">${label} <span style="color:#475569;font-size:10px">(0-100)</span></div>
      <input class="form-input" id="stat_${key}" type="number" min="0" max="100" value="${defaultStats[key]||0}"
             oninput="this.value=Math.min(100,Math.max(0,this.value||0));updatePlayerPreview()" />
    </div>`).join('');

  openModal(p ? 'تعديل لاعب' : 'إضافة لاعب جديد', `
    <div id="playerCardPreview" style="display:flex;justify-content:center;margin-bottom:12px"></div>
    <div class="form-grid">
      <div class="form-field"><div class="form-label">الاسم *</div><input class="form-input" id="pName" value="${p?.name||''}" placeholder="عمر أحمد" oninput="updatePlayerPreview()" /></div>
      <div class="form-field"><div class="form-label">رقم القميص</div><input class="form-input" id="pNumber" type="number" value="${p?.number||''}" placeholder="9" /></div>
      <div class="form-field"><div class="form-label">المركز</div><select class="form-input" id="pPos" onchange="updatePlayerPreview()">${posOptions}</select></div>
      <div class="form-field"><div class="form-label">العمر</div><input class="form-input" id="pAge" type="number" value="${p?.age||''}" placeholder="14" /></div>
      <div class="form-field full">
        <div class="form-label">صورة اللاعب</div>
        <div class="img-upload-wrap">
          <div class="img-upload-preview" id="imgPreviewWrap">
            ${p?.image ? `<img id="imgPreviewThumb" src="${p.image}" alt="preview" />` : `<div class="img-upload-placeholder" id="imgPreviewThumb">📷</div>`}
          </div>
          <div class="img-upload-controls">
            <label class="btn-upload" for="pImgFile">📂 رفع صورة من الجهاز</label>
            <input type="file" id="pImgFile" accept="image/*" style="display:none" onchange="onImgFileChange(this)" />
            <div class="img-upload-or">أو</div>
            <input class="form-input" id="pImg" value="${p?.image||''}" placeholder="رابط https://..." oninput="onImgUrlChange(this.value)" />
          </div>
        </div>
        <input type="hidden" id="pImgData" value="${p?.image||''}" />
      </div>
      <div class="form-field full">
        <div class="form-label">التقييم</div>
        <div class="stars-row" id="modalStars">${buildStarsPicker(playerFormRating)}</div>
      </div>
      <div class="form-field full"><div class="form-label">ملاحظات</div><textarea class="form-input" id="pNotes" placeholder="ملاحظات المدرب...">${p?.notes||''}</textarea></div>
      ${statFields}
    </div>
    <input type="hidden" id="pEditId" value="${id||''}" />
    <div class="form-btns" style="margin-top:16px">
      <button class="btn-save" onclick="savePlayerModal()">حفظ اللاعب</button>
      <button class="btn-cancel" onclick="closeModal()">إلغاء</button>
    </div>
  `);

  setTimeout(() => updatePlayerPreview(), 50);
}

function buildStarsPicker(val) {
  return Array.from({length:5}).map((_,i) =>
    `<span class="star-btn${i<val?' on':''}" onclick="setPlayerRating(${i+1})">★</span>`
  ).join('');
}

function setPlayerRating(v) {
  playerFormRating = v;
  const row = document.getElementById('modalStars');
  if (row) row.innerHTML = buildStarsPicker(v);
  updatePlayerPreview();
}

function updatePlayerPreview() {
  const wrap = document.getElementById('playerCardPreview');
  if (!wrap) return;
  const name = document.getElementById('pName')?.value || '';
  const pos  = document.getElementById('pPos')?.value  || 'مهاجم';
  const img  = document.getElementById('pImgData')?.value || '';
  if (!name) { wrap.innerHTML = ''; return; }
  const stats = {};
  Object.keys(STAT_LABELS).forEach(k => {
    const el = document.getElementById(`stat_${k}`);
    stats[k] = el ? (Number(el.value)||0) : 70;
  });
  const fake = { id:0, name, position:pos, age:14, rating:playerFormRating, number:'', image:img, stats };
  wrap.innerHTML = buildPlayerCard(fake, false);
}

function savePlayerModal() {
  const id   = document.getElementById('pEditId')?.value;
  const name = document.getElementById('pName')?.value?.trim();
  if (!name) { toast('الاسم مطلوب', 'error'); return; }

  const stats = {};
  Object.keys(STAT_LABELS).forEach(k => {
    const el = document.getElementById(`stat_${k}`);
    stats[k] = el ? Math.min(100, Math.max(0, Number(el.value)||0)) : 70;
  });

  const data = {
    name,
    position: document.getElementById('pPos')?.value || 'مهاجم',
    age:      Number(document.getElementById('pAge')?.value)    || 14,
    number:   Number(document.getElementById('pNumber')?.value) || 0,
    image:    document.getElementById('pImgData')?.value || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=500&q=80',
    rating:   playerFormRating,
    notes:    document.getElementById('pNotes')?.value || '',
    stats,
  };

  if (id) {
    updatePlayer({ ...data, id: Number(id) });
    toast('تم تحديث بيانات اللاعب ✅');
  } else {
    addPlayer(data);
    toast('تمت إضافة اللاعب بنجاح ✅');
  }
  closeModal();
  render();
}

function confirmDeletePlayer(id) {
  if (confirm('هل أنت متأكد من حذف هذا اللاعب؟')) {
    deletePlayer(id);
    toast('تم حذف اللاعب', 'error');
    render();
  }
}

// ─── Weekly ───────────────────────────────────────────────────────────────────
function onWeeklyChange(index, val) {
  const s = getState();
  const next = [...s.weeklyTop];
  next[index] = Number(val);
  setWeeklyTop(next);
  toast('تم تحديث أفضل لاعبي الأسبوع ✅');
  render();
}

// ─── News ─────────────────────────────────────────────────────────────────────
function pickIcon(ic) { selectedIcon = ic; render(); }

function saveNews() {
  const id    = document.getElementById('newsEditId')?.value;
  const title = document.getElementById('newsTitle')?.value?.trim();
  if (!title) { toast('العنوان مطلوب', 'error'); return; }
  const data = { title, text: document.getElementById('newsText')?.value||'', icon: selectedIcon };
  if (id) { updateNews({ ...data, id:Number(id), date: getState().news.find(n=>n.id===Number(id))?.date }); toast('تم تحديث الإعلان ✅'); }
  else    { addNews(data); toast('تمت إضافة الإعلان ✅'); }
  selectedIcon = '🔔'; render();
}

function editNews(id) {
  const n = getState().news.find(x => x.id === id); if (!n) return;
  selectedIcon = n.icon || '🔔'; render();
  setTimeout(() => {
    if (document.getElementById('newsEditId')) {
      document.getElementById('newsEditId').value = id;
      document.getElementById('newsTitle').value = n.title;
      document.getElementById('newsText').value = n.text;
      document.getElementById('newsFormTitle').textContent = '✏️ تعديل إعلان';
      document.getElementById('newsCancelBtn').style.display = 'inline-flex';
    }
  }, 0);
}

function cancelNewsEdit() {
  document.getElementById('newsEditId').value='';
  document.getElementById('newsTitle').value='';
  document.getElementById('newsText').value='';
  document.getElementById('newsFormTitle').textContent='➕ إضافة إعلان جديد';
  document.getElementById('newsCancelBtn').style.display='none';
  selectedIcon='🔔'; render();
}

function deleteNewsItem(id) {
  if (confirm('حذف هذا الإعلان؟')) { deleteNews(id); toast('تم الحذف','error'); render(); }
}

// ─── Training ─────────────────────────────────────────────────────────────────
function saveTrainingItem() {
  const id  = document.getElementById('trainingEditId')?.value;
  const day = document.getElementById('trainingDay')?.value?.trim();
  if (!day) { toast('اليوم مطلوب','error'); return; }
  const data = { day, time:document.getElementById('trainingTime')?.value||'', focus:document.getElementById('trainingFocus')?.value||'' };
  if (id) { updateTraining({...data,id:Number(id)}); toast('تم التحديث ✅'); }
  else    { addTraining(data); toast('تمت الإضافة ✅'); }
  cancelTrainingEdit();
}

function editTraining(id) {
  const t = getState().training.find(x=>x.id===id); if(!t) return;
  document.getElementById('trainingEditId').value = id;
  document.getElementById('trainingDay').value = t.day;
  document.getElementById('trainingTime').value = t.time;
  document.getElementById('trainingFocus').value = t.focus;
  document.getElementById('trainingFormTitle').textContent='✏️ تعديل تمرين';
  document.getElementById('trainingCancelBtn').style.display='inline-flex';
}

function cancelTrainingEdit() {
  document.getElementById('trainingEditId').value='';
  document.getElementById('trainingDay').value='';
  document.getElementById('trainingTime').value='';
  document.getElementById('trainingFocus').value='';
  document.getElementById('trainingFormTitle').textContent='➕ إضافة تمرين';
  document.getElementById('trainingCancelBtn').style.display='none';
  render();
}

function deleteTrainingItem(id) {
  if(confirm('حذف هذا التمرين؟')){ deleteTraining(id); toast('تم الحذف','error'); render(); }
}

// ══════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════
function starsHtml(val, color='#38bdf8') {
  return `<div class="stars-row" style="margin-top:4px">` +
    Array.from({length:5}).map((_,i) =>
      `<span style="font-size:13px;color:${i<val?color:'#334155'}">${i<val?'★':'☆'}</span>`
    ).join('') + `</div>`;
}

// ══════════════════════════════════════════════════
//  IMAGE UPLOAD HANDLERS
// ══════════════════════════════════════════════════
function onImgFileChange(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    document.getElementById('pImgData').value = dataUrl;
    document.getElementById('pImg').value = '';
    const thumb = document.getElementById('imgPreviewThumb');
    if (thumb) { thumb.outerHTML = `<img id="imgPreviewThumb" src="${dataUrl}" alt="preview" />`; }
    updatePlayerPreview();
  };
  reader.readAsDataURL(file);
}

function onImgUrlChange(url) {
  document.getElementById('pImgData').value = url;
  const thumb = document.getElementById('imgPreviewThumb');
  if (thumb && url) { thumb.outerHTML = `<img id="imgPreviewThumb" src="${url}" alt="preview" />`; }
  updatePlayerPreview();
}

// ══════════════════════════════════════════════════
//  SAVED FORMATION PLANS
// ══════════════════════════════════════════════════
function fmtSavePlan() {
  const name = document.getElementById('fmtNameInput')?.value?.trim();
  const day  = document.getElementById('fmtDayInput')?.value?.trim();
  if (!name) { toast('أدخل اسم الخطة', 'error'); return; }
  const s = getState();
  const plan = {
    name,
    day: day || '—',
    slots: JSON.parse(JSON.stringify(s.formationSlots)),
  };
  addFormationPlan(plan);
  toast(`تم حفظ خطة "${name}" ✅`);
  render();
}

function fmtDeletePlan(id) {
  if (confirm('حذف هذه الخطة المحفوظة؟')) {
    deleteFormationPlan(id);
    toast('تم الحذف', 'error');
    render();
  }
}

function fmtActivatePlan(id) {
  const s = getState();
  const plan = s.savedFormations.find(f => f.id === id);
  if (!plan) return;
  setFormationSlots(JSON.parse(JSON.stringify(plan.slots)));
  setFormationName(plan.name);
  toast(`تم تحميل خطة "${plan.name}" ✅`);
  render();
}

// ══════════════════════════════════════════════════
//  ADMIN: SITE STATS (manual override)
// ══════════════════════════════════════════════════
function renderAdminSiteStats(s) {
  const ov = s.siteStatsOverride || {};
  return `
  <div class="admin-section${adminTab==='siteStats'?' active':''}" data-section="siteStats">
    <div class="admin-form-box">
      <h4>📊 تخصيص إحصائيات الواجهة الرئيسية</h4>
      <p style="color:#64748b;font-size:13px;margin-bottom:16px">
        بإمكانك تحديد نصوص وأرقام مختلفة تظهر في بطاقات الواجهة الرئيسية بدلاً من القيم التلقائية.
        اتركها فارغة لاستخدام القيم الحقيقية.
      </p>
      <div class="form-grid">
        <div class="form-field">
          <div class="form-label">👥 عدد اللاعبين (العنوان)</div>
          <input class="form-input" id="ov_players_val" placeholder="${s.players.length} (تلقائي)" value="${ov.players_val||''}" />
        </div>
        <div class="form-field">
          <div class="form-label">👥 تسمية بطاقة اللاعبين</div>
          <input class="form-input" id="ov_players_lbl" placeholder="لاعب مسجل (تلقائي)" value="${ov.players_lbl||''}" />
        </div>
        <div class="form-field">
          <div class="form-label">📅 عدد الجلسات (العنوان)</div>
          <input class="form-input" id="ov_sessions_val" placeholder="${s.training.length} (تلقائي)" value="${ov.sessions_val||''}" />
        </div>
        <div class="form-field">
          <div class="form-label">📅 تسمية بطاقة الجلسات</div>
          <input class="form-input" id="ov_sessions_lbl" placeholder="جلسة تمرين (تلقائي)" value="${ov.sessions_lbl||''}" />
        </div>
        <div class="form-field">
          <div class="form-label">📰 عدد الإعلانات (العنوان)</div>
          <input class="form-input" id="ov_news_val" placeholder="${s.news.length} (تلقائي)" value="${ov.news_val||''}" />
        </div>
        <div class="form-field">
          <div class="form-label">📰 تسمية بطاقة الأخبار</div>
          <input class="form-input" id="ov_news_lbl" placeholder="إعلان (تلقائي)" value="${ov.news_lbl||''}" />
        </div>
        <div class="form-field">
          <div class="form-label">🏴 قيمة التشكيلة</div>
          <input class="form-input" id="ov_formation_val" placeholder="${s.formationName||'—'} (تلقائي)" value="${ov.formation_val||''}" />
        </div>
        <div class="form-field">
          <div class="form-label">🏴 تسمية بطاقة التشكيلة</div>
          <input class="form-input" id="ov_formation_lbl" placeholder="التشكيلة (تلقائي)" value="${ov.formation_lbl||''}" />
        </div>
        <div class="form-field full">
          <div class="form-label">💬 نص Hero الرئيسي (اختياري)</div>
          <input class="form-input" id="ov_hero_text" placeholder="منصة إدارة متكاملة..." value="${ov.hero_text||''}" />
        </div>
        <div class="form-field full">
          <div class="form-label">🏷️ عنوان Hero</div>
          <input class="form-input" id="ov_hero_tag" placeholder="🏆 أكاديمية كرة قدم احترافية (تلقائي)" value="${ov.hero_tag||''}" />
        </div>
      </div>
      <div class="form-btns">
        <button class="btn-save" onclick="saveSiteStats()">💾 حفظ التخصيصات</button>
        <button class="btn-cancel" onclick="resetSiteStats()">↩️ إعادة الضبط</button>
      </div>
    </div>
    <div style="margin-top:20px;padding:16px;background:rgba(56,189,248,.05);border:1px solid rgba(56,189,248,.15);border-radius:14px">
      <div style="font-size:11px;font-weight:900;color:#38bdf8;letter-spacing:1px;margin-bottom:10px">👀 معاينة البطاقات</div>
      <div class="stats-grid" style="margin-bottom:0">
        ${buildStatCards(s)}
      </div>
    </div>
  </div>`;
}

function buildStatCards(s) {
  const ov = s.siteStatsOverride || {};
  return [
    { icon:'👥', val: ov.players_val   || s.players.length,    lbl: ov.players_lbl   || 'لاعب مسجل',    color:'#38bdf8' },
    { icon:'📅', val: ov.sessions_val  || s.training.length,   lbl: ov.sessions_lbl  || 'جلسة تمرين',   color:'#10b981' },
    { icon:'📰', val: ov.news_val      || s.news.length,       lbl: ov.news_lbl      || 'إعلان',         color:'#a78bfa' },
    { icon:'🏴', val: ov.formation_val || s.formationName||'—',lbl: ov.formation_lbl || 'التشكيلة',      color:'#f59e0b' },
  ].map(c => statCard(c.icon, c.lbl, c.val, c.color)).join('');
}

function saveSiteStats() {
  const ov = {
    players_val:   document.getElementById('ov_players_val')?.value.trim(),
    players_lbl:   document.getElementById('ov_players_lbl')?.value.trim(),
    sessions_val:  document.getElementById('ov_sessions_val')?.value.trim(),
    sessions_lbl:  document.getElementById('ov_sessions_lbl')?.value.trim(),
    news_val:      document.getElementById('ov_news_val')?.value.trim(),
    news_lbl:      document.getElementById('ov_news_lbl')?.value.trim(),
    formation_val: document.getElementById('ov_formation_val')?.value.trim(),
    formation_lbl: document.getElementById('ov_formation_lbl')?.value.trim(),
    hero_text:     document.getElementById('ov_hero_text')?.value.trim(),
    hero_tag:      document.getElementById('ov_hero_tag')?.value.trim(),
  };
  setSiteStatsOverride(ov);
  toast('تم حفظ تخصيصات الواجهة ✅');
  render();
}

function resetSiteStats() {
  setSiteStatsOverride({});
  toast('تم إعادة الضبط');
  render();
}

// ══════════════════════════════════════════════════
//  FOOTER
// ══════════════════════════════════════════════════
document.body.insertAdjacentHTML('beforeend', `
  <footer>
    <strong>FUTURE ACADEMY</strong> &nbsp;·&nbsp; Football Management System &nbsp;·&nbsp; ${new Date().getFullYear()}
  </footer>
`);

// ══════════════════════════════════════════════════
//  INIT — wait for Supabase/localStorage to load
// ══════════════════════════════════════════════════
if (window._dataReady) {
  navigate('home');
} else {
  window._onDataReady = function() { navigate('home'); };
}
