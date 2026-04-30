// ══════════════════════════════════════════════════
//  DATA.JS — Future Academy v3
// ══════════════════════════════════════════════════

const STORAGE_KEY = 'future_academy_v3';
const ADMIN_PASSWORD = 'FA2025';   // ← غيّر كلمة المرور هنا

// ─── Stat labels (same for all positions) ────────────────────────────────────
const STAT_LABELS = {
  stamina:   'لياقة',
  shot:      'تسديد',
  pass:      'تمرير',
  speed:     'سرعة',
  skills:    'مهارات',
  chemistry: 'تآلف',
};

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

// Preset formations as templates (lines of position labels)
const FORMATION_PRESETS = {
  '4-3-3':  [['GK'],['LB','CB','CB','RB'],['CM','CDM','CM'],['LW','ST','RW']],
  '4-4-2':  [['GK'],['LB','CB','CB','RB'],['LM','CM','CM','RM'],['ST','ST']],
  '3-5-2':  [['GK'],['CB','CB','CB'],['LM','CM','CDM','CM','RM'],['ST','ST']],
  '4-2-3-1':[['GK'],['LB','CB','CB','RB'],['CDM','CDM'],['LW','CAM','RW'],['ST']],
  '5-3-2':  [['GK'],['LWB','CB','CB','CB','RWB'],['CM','CDM','CM'],['ST','ST']],
  '4-1-4-1':[['GK'],['LB','CB','CB','RB'],['CDM'],['LM','CM','CM','RM'],['ST']],
};

// Convert preset array to slot objects { pos, pid }
function presetToSlots(arr) {
  return arr.map(line => line.map(pos => ({ pos, pid: null })));
}

function defaultFormationSlots() {
  return presetToSlots(FORMATION_PRESETS['4-3-3']);
}

const DEFAULT_STATS = () => ({ stamina:75, shot:70, pass:72, speed:74, skills:70, chemistry:75 });

const DEFAULT_DATA = {
  players: [
    { id:1, name:'عمر أحمد',   position:'حارس مرمى', age:14, rating:4, number:1,
      image:'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=500&q=80',
      stats:{ stamina:82, shot:45, pass:60, speed:70, skills:65, chemistry:80 },
      notes:'رد فعل ممتاز ويحتاج تحسين الخروج على الكرات العرضية.' },
    { id:2, name:'يوسف خالد',  position:'مهاجم',     age:13, rating:5, number:9,
      image:'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=500&q=80',
      stats:{ stamina:88, shot:90, pass:72, speed:86, skills:84, chemistry:88 },
      notes:'إنهاء قوي للهجمات وتمركز ممتاز داخل منطقة الجزاء.' },
    { id:3, name:'آدم محمود',   position:'وسط ملعب',  age:14, rating:4, number:8,
      image:'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=500&q=80',
      stats:{ stamina:91, shot:68, pass:88, speed:78, skills:80, chemistry:85 },
      notes:'رؤية لعب ممتازة ويحتاج سرعة أعلى في اتخاذ القرار.' },
    { id:4, name:'مالك سامي',   position:'مدافع',     age:13, rating:3, number:5,
      image:'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=500&q=80',
      stats:{ stamina:79, shot:50, pass:65, speed:72, skills:62, chemistry:74 },
      notes:'قوي في الالتحامات ويحتاج تحسين التمرير تحت الضغط.' },
  ],
  news: [
    { id:1, title:'التمرين القادم',  text:'الأحد 6:30 مساءً - ملعب الأكاديمية', icon:'📅', date:'2025-04-27' },
    { id:2, title:'مباراة ودية',     text:'Future Academy ضد فريق الضيوف يوم الجمعة', icon:'🏆', date:'2025-04-25' },
    { id:3, title:'تحديث جديد',      text:'إضافة نظام النقاط الجديد للاعبين', icon:'🔔', date:'2025-04-20' },
  ],
  training: [
    { id:1, day:'الأحد',    focus:'لياقة + تحكم بالكرة',      time:'6:30 PM' },
    { id:2, day:'الثلاثاء', focus:'تكتيك 4-3-3 + ضغط عالي',   time:'6:00 PM' },
    { id:3, day:'الخميس',   focus:'مباريات مصغرة + حراس',     time:'7:00 PM' },
    { id:4, day:'الجمعة',   focus:'مباراة ودية',               time:'5:30 PM' },
  ],
  weeklyTop: [2, 3, 1],
  formationSlots: null,    // will be set in loadState
  formationName: '4-3-3',
  formationAnimated: false,
};

// ─── State singleton ─────────────────────────────────────────────────────────
let STATE = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      STATE = { ...DEFAULT_DATA, ...parsed };
    } else {
      STATE = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  } catch {
    STATE = JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
  // Ensure formationSlots is valid
  if (!STATE.formationSlots || !Array.isArray(STATE.formationSlots) || STATE.formationSlots.length === 0) {
    STATE.formationSlots = defaultFormationSlots();
  }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); } catch {}
}

function getState() { return STATE; }

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

// ─── Players ─────────────────────────────────────────────────────────────────
function addPlayer(data)    { STATE.players.push({ ...data, id: nextId(STATE.players) }); saveState(); }
function updatePlayer(data) { const i = STATE.players.findIndex(p => p.id === data.id); if (i > -1) STATE.players[i] = data; saveState(); }
function deletePlayer(id)   { STATE.players = STATE.players.filter(p => p.id !== id); STATE.weeklyTop = STATE.weeklyTop.filter(x => x !== id);
  // Clear formation assignments
  STATE.formationSlots.forEach(line => line.forEach(slot => { if (slot.pid === id) slot.pid = null; }));
  saveState(); }

// ─── News ─────────────────────────────────────────────────────────────────────
function addNews(data)    { STATE.news.unshift({ ...data, id: nextId(STATE.news), date: new Date().toISOString().split('T')[0] }); saveState(); }
function updateNews(data) { const i = STATE.news.findIndex(n => n.id === data.id); if (i > -1) STATE.news[i] = data; saveState(); }
function deleteNews(id)   { STATE.news = STATE.news.filter(n => n.id !== id); saveState(); }

// ─── Training ─────────────────────────────────────────────────────────────────
function addTraining(data)    { STATE.training.push({ ...data, id: nextId(STATE.training) }); saveState(); }
function updateTraining(data) { const i = STATE.training.findIndex(t => t.id === data.id); if (i > -1) STATE.training[i] = data; saveState(); }
function deleteTraining(id)   { STATE.training = STATE.training.filter(t => t.id !== id); saveState(); }

// ─── Weekly top ───────────────────────────────────────────────────────────────
function setWeeklyTop(arr) { STATE.weeklyTop = arr; saveState(); }

// ─── Formation ────────────────────────────────────────────────────────────────
function setFormationSlots(slots) { STATE.formationSlots = slots; saveState(); }
function setFormationName(n)      { STATE.formationName = n; saveState(); }
function toggleAnimation()        { STATE.formationAnimated = !STATE.formationAnimated; saveState(); }
function assignPlayerToSlot(li, si, pid) {
  if (STATE.formationSlots[li] && STATE.formationSlots[li][si] !== undefined) {
    STATE.formationSlots[li][si].pid = pid;
    saveState();
  }
}
function updateSlotPos(li, si, pos) {
  if (STATE.formationSlots[li] && STATE.formationSlots[li][si] !== undefined) {
    STATE.formationSlots[li][si].pos = pos;
    saveState();
  }
}
function addFormationLine()        { STATE.formationSlots.push([{ pos:'CM', pid:null }]); saveState(); }
function removeFormationLine(li)   { if (STATE.formationSlots.length > 1) STATE.formationSlots.splice(li, 1); saveState(); }
function addSlotToLine(li)         { if (STATE.formationSlots[li]) STATE.formationSlots[li].push({ pos:'CM', pid:null }); saveState(); }
function removeSlotFromLine(li,si) { if (STATE.formationSlots[li] && STATE.formationSlots[li].length > 1) STATE.formationSlots[li].splice(si, 1); saveState(); }
function loadPresetFormation(key)  {
  const preset = FORMATION_PRESETS[key];
  if (!preset) return;
  STATE.formationSlots = presetToSlots(preset);
  STATE.formationName = key;
  saveState();
}

// Helpers
function posCfg(pos) { return POS_CFG[pos] || POS_CFG['مهاجم']; }
function calcScore(p) {
  const vals = Object.values(p.stats || {});
  if (!vals.length) return 60;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.min(99, Math.max(40, Math.round(avg)));
}

loadState();
