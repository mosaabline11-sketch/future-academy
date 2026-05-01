// ══════════════════════════════════════════════════
//  DATA.JS — Future Academy v3 + Supabase
// ══════════════════════════════════════════════════

const ADMIN_PASSWORD = 'FA2025'; // ← غيّر كلمة المرور هنا
const STORAGE_KEY    = 'future_academy_v3'; // localStorage backup

// ─── Supabase Config ──────────────────────────────
const SUPABASE_URL  = 'https://vuuzrtklxldokxdsfgkk.supabase.co';
const SUPABASE_ANON = 'sb_publishable_xPAkIv26oZw0pW_y9t1opA_teNG5F3n';
// ─────────────────────────────────────────────────

const USE_SUPABASE = SUPABASE_ANON !== 'YOUR_ANON_KEY_HERE';

// ─── REST Helper ─────────────────────────────────
async function sb(table, method, body, filter, extra) {
  method = method || 'GET'; filter = filter || ''; extra = extra || {};
  try {
    const headers = {
      'apikey': SUPABASE_ANON,
      'Authorization': 'Bearer ' + SUPABASE_ANON,
      'Content-Type': 'application/json',
    };
    if (method === 'POST')  headers['Prefer'] = 'return=representation';
    if (method === 'PATCH') headers['Prefer'] = 'return=representation';
    Object.assign(headers, extra);

    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + filter, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : null,
    });
    if (!res.ok) { console.warn('[SB] ' + method + ' ' + table + filter + ' ->', res.status); return null; }
    const text = await res.text();
    return text ? JSON.parse(text) : true;
  } catch(e) { console.warn('[SB] error:', e.message); return null; }
}

// ─── Row Mappers ─────────────────────────────────
function playerToRow(p) {
  return {
    name: p.name, position: p.position, age: p.age||14,
    rating: p.rating||3, number: p.number||0, image: p.image||'', notes: p.notes||'',
    stamina:   (p.stats && p.stats.stamina)   != null ? p.stats.stamina   : 75,
    shot:      (p.stats && p.stats.shot)      != null ? p.stats.shot      : 70,
    pass:      (p.stats && p.stats.pass)      != null ? p.stats.pass      : 72,
    speed:     (p.stats && p.stats.speed)     != null ? p.stats.speed     : 74,
    skills:    (p.stats && p.stats.skills)    != null ? p.stats.skills    : 70,
    chemistry: (p.stats && p.stats.chemistry) != null ? p.stats.chemistry : 75,
  };
}

function rowToPlayer(r) {
  return {
    id: r.id, name: r.name, position: r.position, age: r.age,
    rating: r.rating, number: r.number, image: r.image||'', notes: r.notes||'',
    stats: { stamina:r.stamina, shot:r.shot, pass:r.pass, speed:r.speed, skills:r.skills, chemistry:r.chemistry },
  };
}

function slotsToRows(slots) {
  var rows = [];
  slots.forEach(function(line, li) {
    line.forEach(function(slot, si) {
      rows.push({ line_index:li, slot_index:si, pos:slot.pos||'CM', player_id:slot.pid||null });
    });
  });
  return rows;
}

function rowsToSlots(rows) {
  if (!rows || !rows.length) return defaultFormationSlots();
  var maxLine = Math.max.apply(null, rows.map(function(r){ return r.line_index; }));
  var slots = [];
  for (var li = 0; li <= maxLine; li++) {
    var lineRows = rows.filter(function(r){ return r.line_index === li; })
                       .sort(function(a,b){ return a.slot_index - b.slot_index; });
    if (!lineRows.length) lineRows = [{ pos:'CM', player_id:null }];
    slots.push(lineRows.map(function(r){ return { pos:r.pos, pid:r.player_id||null }; }));
  }
  return slots;
}

// ─── Labels & Config ─────────────────────────────
const STAT_LABELS = { stamina:'لياقة', shot:'تسديد', pass:'تمرير', speed:'سرعة', skills:'مهارات', chemistry:'تآلف' };

const POS_CFG = {
  'حارس مرمى': { badge:'GK',  color:'#f59e0b', glow:'rgba(245,158,11,.5)',  cardBg:'linear-gradient(160deg,#1a0a00,#2d1400,#1a0a00)' },
  'مدافع':     { badge:'DEF', color:'#3b82f6', glow:'rgba(59,130,246,.5)',  cardBg:'linear-gradient(160deg,#00081a,#001030,#00081a)' },
  'وسط ملعب':  { badge:'MID', color:'#10b981', glow:'rgba(16,185,129,.5)',  cardBg:'linear-gradient(160deg,#001a0d,#002a15,#001a0d)' },
  'مهاجم':     { badge:'FWD', color:'#ef4444', glow:'rgba(239,68,68,.5)',   cardBg:'linear-gradient(160deg,#1a0000,#2d0000,#1a0000)' },
};

const POS_FIELD_COLORS = {
  GK:'#f59e0b', LB:'#3b82f6', RB:'#3b82f6', CB:'#3b82f6',
  LWB:'#3b82f6', RWB:'#3b82f6', CM:'#10b981', CDM:'#10b981',
  CAM:'#10b981', LM:'#10b981', RM:'#10b981', LW:'#ef4444',
  RW:'#ef4444', ST:'#ef4444', SS:'#ef4444', CF:'#ef4444',
};

const FORMATION_PRESETS = {
  '4-3-3':  [['GK'],['LB','CB','CB','RB'],['CM','CDM','CM'],['LW','ST','RW']],
  '4-4-2':  [['GK'],['LB','CB','CB','RB'],['LM','CM','CM','RM'],['ST','ST']],
  '3-5-2':  [['GK'],['CB','CB','CB'],['LM','CM','CDM','CM','RM'],['ST','ST']],
  '4-2-3-1':[['GK'],['LB','CB','CB','RB'],['CDM','CDM'],['LW','CAM','RW'],['ST']],
  '5-3-2':  [['GK'],['LWB','CB','CB','CB','RWB'],['CM','CDM','CM'],['ST','ST']],
  '4-1-4-1':[['GK'],['LB','CB','CB','RB'],['CDM'],['LM','CM','CM','RM'],['ST']],
};

function presetToSlots(arr) { return arr.map(function(line){ return line.map(function(pos){ return {pos:pos,pid:null}; }); }); }
function defaultFormationSlots() { return presetToSlots(FORMATION_PRESETS['4-3-3']); }

// ─── State ────────────────────────────────────────
var STATE = null;

function lsLoad() { try { var r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):null; } catch(e){ return null; } }
function lsSave() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); } catch(e){} }

// ─── Loading screen ───────────────────────────────
function showLoading() {
  var div = document.createElement('div');
  div.id = 'appLoader';
  div.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#050816;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;font-family:Cairo,sans-serif';
  div.innerHTML = '<div style="font-size:52px;animation:spin 1s linear infinite">⚽</div>'
    + '<div style="font-family:\'Bebas Neue\',cursive;font-size:28px;color:#38bdf8;letter-spacing:3px">FUTURE ACADEMY</div>'
    + '<div style="font-size:13px;color:#475569">' + (USE_SUPABASE ? 'جاري الاتصال بقاعدة البيانات...' : 'جاري التحميل...') + '</div>'
    + '<style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
  document.body.appendChild(div);
}
function hideLoading() { var el=document.getElementById('appLoader'); if(el) el.remove(); }

// ─── INIT ─────────────────────────────────────────
async function loadState() {
  showLoading();

  if (USE_SUPABASE) {
    try {
      var results = await Promise.all([
        sb('players',          'GET', null, '?select=*&order=id'),
        sb('news',             'GET', null, '?select=*&order=id.desc'),
        sb('training',         'GET', null, '?select=*&order=id'),
        sb('weekly_top',       'GET', null, '?select=*&order=rank'),
        sb('formation_config', 'GET', null, '?select=*&id=eq.1'),
        sb('formation_slots',  'GET', null, '?select=*&order=line_index,slot_index'),
      ]);

      var playersRows=results[0], newsRows=results[1], trainingRows=results[2],
          weeklyRows=results[3], fmtCfgRows=results[4], fmtSlotRows=results[5];

      var ls = lsLoad() || {};

      STATE = {
        players:   (playersRows  ||[]).map(rowToPlayer),
        news:      (newsRows     ||[]).map(function(r){ return {id:r.id,title:r.title,text:r.text,icon:r.icon,date:r.date}; }),
        training:  (trainingRows ||[]).map(function(r){ return {id:r.id,day:r.day,focus:r.focus,time:r.time}; }),
        weeklyTop: (weeklyRows   ||[]).filter(function(r){ return r.player_id; }).map(function(r){ return r.player_id; }),
        formationSlots:    rowsToSlots(fmtSlotRows||[]),
        formationName:     (fmtCfgRows&&fmtCfgRows[0] ? fmtCfgRows[0].name    : null) || '4-3-3',
        formationAnimated: (fmtCfgRows&&fmtCfgRows[0] ? fmtCfgRows[0].animated: false),
        formationDay:      ls.formationDay      || '',
        savedFormations:   ls.savedFormations   || [],
        siteStatsOverride: ls.siteStatsOverride || {},
      };

      if (!STATE.formationSlots || !STATE.formationSlots.length) STATE.formationSlots = defaultFormationSlots();
      lsSave();
      console.log('[SB] loaded OK — players:', STATE.players.length);

    } catch(e) {
      console.warn('[SB] load failed, using localStorage:', e);
      _loadFromLS();
    }
  } else {
    _loadFromLS();
  }

  hideLoading();
}

function _loadFromLS() {
  var ls = lsLoad();
  if (ls) {
    STATE = Object.assign({ players:[], news:[], training:[], weeklyTop:[], formationSlots:null,
      formationName:'4-3-3', formationDay:'', formationAnimated:false, savedFormations:[], siteStatsOverride:{} }, ls);
  } else {
    STATE = { players:[], news:[], training:[], weeklyTop:[], formationSlots:null,
      formationName:'4-3-3', formationDay:'', formationAnimated:false, savedFormations:[], siteStatsOverride:{} };
  }
  if (!STATE.formationSlots || !Array.isArray(STATE.formationSlots) || !STATE.formationSlots.length)
    STATE.formationSlots = defaultFormationSlots();
}

function saveState() { lsSave(); }
function getState()  { return STATE; }
function nextId(arr) { return arr.length ? Math.max.apply(null, arr.map(function(x){ return x.id; })) + 1 : 1; }

// ══════════════════════════════════════════════════
//  PLAYERS
// ══════════════════════════════════════════════════
async function addPlayer(data) {
  if (USE_SUPABASE) {
    var result = await sb('players', 'POST', playerToRow(data));
    STATE.players.push(result&&result[0] ? rowToPlayer(result[0]) : Object.assign({}, data, {id:nextId(STATE.players)}));
  } else {
    STATE.players.push(Object.assign({}, data, {id:nextId(STATE.players)}));
  }
  saveState();
}

async function updatePlayer(data) {
  var i = STATE.players.findIndex(function(p){ return p.id===data.id; });
  if (i>-1) STATE.players[i] = data;
  saveState();
  if (USE_SUPABASE) await sb('players','PATCH',playerToRow(data),'?id=eq.'+data.id);
}

async function deletePlayer(id) {
  STATE.players    = STATE.players.filter(function(p){ return p.id!==id; });
  STATE.weeklyTop  = STATE.weeklyTop.filter(function(x){ return x!==id; });
  STATE.formationSlots.forEach(function(line){ line.forEach(function(slot){ if(slot.pid===id) slot.pid=null; }); });
  saveState();
  if (USE_SUPABASE) await sb('players','DELETE',null,'?id=eq.'+id);
}

// ══════════════════════════════════════════════════
//  NEWS
// ══════════════════════════════════════════════════
async function addNews(data) {
  var today = new Date().toISOString().split('T')[0];
  if (USE_SUPABASE) {
    var result = await sb('news','POST',{title:data.title,text:data.text,icon:data.icon,date:today});
    if (result&&result[0]) {
      STATE.news.unshift({id:result[0].id,title:result[0].title,text:result[0].text,icon:result[0].icon,date:result[0].date});
    } else STATE.news.unshift(Object.assign({},data,{id:nextId(STATE.news),date:today}));
  } else {
    STATE.news.unshift(Object.assign({},data,{id:nextId(STATE.news),date:today}));
  }
  saveState();
}

async function updateNews(data) {
  var i = STATE.news.findIndex(function(n){ return n.id===data.id; });
  if (i>-1) STATE.news[i] = data;
  saveState();
  if (USE_SUPABASE) await sb('news','PATCH',{title:data.title,text:data.text,icon:data.icon},'?id=eq.'+data.id);
}

async function deleteNews(id) {
  STATE.news = STATE.news.filter(function(n){ return n.id!==id; });
  saveState();
  if (USE_SUPABASE) await sb('news','DELETE',null,'?id=eq.'+id);
}

// ══════════════════════════════════════════════════
//  TRAINING
// ══════════════════════════════════════════════════
async function addTraining(data) {
  if (USE_SUPABASE) {
    var result = await sb('training','POST',{day:data.day,focus:data.focus,time:data.time});
    if (result&&result[0]) STATE.training.push({id:result[0].id,day:result[0].day,focus:result[0].focus,time:result[0].time});
    else STATE.training.push(Object.assign({},data,{id:nextId(STATE.training)}));
  } else {
    STATE.training.push(Object.assign({},data,{id:nextId(STATE.training)}));
  }
  saveState();
}

async function updateTraining(data) {
  var i = STATE.training.findIndex(function(t){ return t.id===data.id; });
  if (i>-1) STATE.training[i] = data;
  saveState();
  if (USE_SUPABASE) await sb('training','PATCH',{day:data.day,focus:data.focus,time:data.time},'?id=eq.'+data.id);
}

async function deleteTraining(id) {
  STATE.training = STATE.training.filter(function(t){ return t.id!==id; });
  saveState();
  if (USE_SUPABASE) await sb('training','DELETE',null,'?id=eq.'+id);
}

// ══════════════════════════════════════════════════
//  WEEKLY TOP
// ══════════════════════════════════════════════════
async function setWeeklyTop(arr) {
  STATE.weeklyTop = arr;
  saveState();
  if (USE_SUPABASE) {
    var rows = [1,2,3].map(function(rank){ return {rank:rank, player_id:arr[rank-1]||null}; });
    await sb('weekly_top','POST',rows,'',{'Prefer':'resolution=merge-duplicates,return=minimal'});
  }
}

// ══════════════════════════════════════════════════
//  FORMATION
// ══════════════════════════════════════════════════
async function _syncSlots() {
  if (!USE_SUPABASE) return;
  await sb('formation_slots','DELETE',null,'?id=gt.0');
  var rows = slotsToRows(STATE.formationSlots);
  if (rows.length) await sb('formation_slots','POST',rows,'',{'Prefer':'return=minimal'});
}
async function _syncConfig() {
  if (!USE_SUPABASE) return;
  await sb('formation_config','PATCH',{name:STATE.formationName,animated:STATE.formationAnimated},'?id=eq.1');
}

function setFormationSlots(slots)  { STATE.formationSlots=slots; saveState(); _syncSlots(); }
function setFormationName(n)       { STATE.formationName=n; saveState(); _syncConfig(); }
function setFormationDay(d)        { STATE.formationDay=d; saveState(); }
function toggleAnimation()         { STATE.formationAnimated=!STATE.formationAnimated; saveState(); _syncConfig(); }

function assignPlayerToSlot(li,si,pid) {
  if (STATE.formationSlots[li] && STATE.formationSlots[li][si]!==undefined) {
    STATE.formationSlots[li][si].pid=pid; saveState(); _syncSlots();
  }
}
function updateSlotPos(li,si,pos) {
  if (STATE.formationSlots[li] && STATE.formationSlots[li][si]!==undefined) {
    STATE.formationSlots[li][si].pos=pos; saveState(); _syncSlots();
  }
}
function addFormationLine()        { STATE.formationSlots.push([{pos:'CM',pid:null}]); saveState(); _syncSlots(); }
function removeFormationLine(li)   { if(STATE.formationSlots.length>1) STATE.formationSlots.splice(li,1); saveState(); _syncSlots(); }
function addSlotToLine(li)         { if(STATE.formationSlots[li]) STATE.formationSlots[li].push({pos:'CM',pid:null}); saveState(); _syncSlots(); }
function removeSlotFromLine(li,si) { if(STATE.formationSlots[li]&&STATE.formationSlots[li].length>1) STATE.formationSlots[li].splice(si,1); saveState(); _syncSlots(); }
function loadPresetFormation(key)  {
  var preset=FORMATION_PRESETS[key]; if(!preset) return;
  STATE.formationSlots=presetToSlots(preset); STATE.formationName=key;
  saveState(); _syncSlots(); _syncConfig();
}

// ─── Saved Plans (localStorage) ──────────────────
function addFormationPlan(data) {
  if (!STATE.savedFormations) STATE.savedFormations=[];
  STATE.savedFormations.push(Object.assign({},data,{id:nextId(STATE.savedFormations)}));
  saveState();
}
function deleteFormationPlan(id) {
  STATE.savedFormations=(STATE.savedFormations||[]).filter(function(f){ return f.id!==id; });
  saveState();
}

// ─── Site Stats Override (localStorage) ──────────
function setSiteStatsOverride(ov) { STATE.siteStatsOverride=ov; saveState(); }

// ─── Helpers ─────────────────────────────────────
function posCfg(pos) { return POS_CFG[pos] || POS_CFG['مهاجم']; }
function calcScore(p) {
  var vals = Object.values(p.stats||{});
  if (!vals.length) return 60;
  return Math.min(100, Math.max(40, Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length)));
}

// ─── Boot ─────────────────────────────────────────
window._dataReady   = false;
window._onDataReady = null;

loadState().then(function() {
  window._dataReady = true;
  if (typeof window._onDataReady === 'function') window._onDataReady();
});
