/* ============================================================
   PETAL DIARY — GIRLY AESTHETIC JOURNAL
   app.js — Full Application Logic
   ============================================================ */

// ─────────────────────────────────────
// 1. DATA & CONSTANTS
// ─────────────────────────────────────

const MONTH_THEMES = [
  { name:'January',   emoji:'❄️',  cls:'jan', label:'Winter Blues' },
  { name:'February',  emoji:'💕',  cls:'feb', label:'Love Season' },
  { name:'March',     emoji:'🌸',  cls:'mar', label:'Spring Florals' },
  { name:'April',     emoji:'🌷',  cls:'apr', label:'Spring Florals' },
  { name:'May',       emoji:'☀️',  cls:'may', label:'Soft Summer' },
  { name:'June',      emoji:'🌻',  cls:'jun', label:'Soft Summer' },
  { name:'July',      emoji:'🌴',  cls:'jul', label:'Bright Summer' },
  { name:'August',    emoji:'🌊',  cls:'aug', label:'Bright Summer' },
  { name:'September', emoji:'🍂',  cls:'sep', label:'Autumn Vibes' },
  { name:'October',   emoji:'🍁',  cls:'oct', label:'Autumn Vibes' },
  { name:'November',  emoji:'🎄',  cls:'nov', label:'Cozy Winter' },
  { name:'December',  emoji:'🎄',  cls:'dec', label:'Cozy Winter' },
];

const STICKERS = {
  flowers:  ['🌸','🌺','🌼','🌻','🌹','🌷','💐','🪷','🌿','🍀'],
  hearts:   ['💖','💕','💗','💓','💝','❤️','🩷','🫶','💞','💟'],
  stars:    ['⭐','🌟','✨','💫','🌙','☀️','🌈','🌠','🎇','🎆'],
  animals:  ['🐰','🐱','🐶','🐻','🐼','🦋','🐝','🦄','🐾','🐸'],
  sparkles: ['✨','💫','🌟','⚡','🔮','🪄','🎀','🎊','🎉','🌺'],
  bows:     ['🎀','🎁','🎈','🎗️','🪅','🎠','🧸','🪆','🎪','🏮'],
};

const QUOTES = [
  "You are enough. ✨",
  "Write your story, darling. 🌸",
  "Today is full of possibility. 💕",
  "Small steps lead to big dreams. 🌟",
  "Be the energy you want to see. ✨",
  "Your feelings are valid. 🌷",
  "Bloom where you are planted. 🌸",
  "Chase your dreams with glitter. 💫",
  "You glow differently when you're happy. 🌟",
  "Be your own kind of beautiful. 💖",
  "Good things take time. 🌿",
  "You deserve all the good things. 🌈",
];

const PET_STAGES = [
  { stage:0, icon:'🐣', name:'Baby Mochi',    minLv:0  },
  { stage:1, icon:'🐰', name:'Bunny Mochi',   minLv:3  },
  { stage:2, icon:'🌸', name:'Blossom Mochi', minLv:7  },
  { stage:3, icon:'🦋', name:'Flutter Mochi', minLv:15 },
  { stage:4, icon:'✨', name:'Celestial Mochi',minLv:25 },
];

const XP_PER_ENTRY    = 25;
const XP_PER_LEVEL    = 100;
const POMODORO_WORK   = 5 * 60;
const POMODORO_BREAK  = 5  * 60;

// ─────────────────────────────────────
// 2. STATE
// ─────────────────────────────────────

let state = {
  currentPage: 'journal',
  currentEntryId: null,
  calYear: new Date().getFullYear(),
  selectedMood: '😊',
  stickerCategory: 'flowers',
  pomodoroInterval: null,
  pomodoroSeconds: POMODORO_WORK,
  pomodoroRunning: false,
  pomodoroIsWork: true,
  pomodoroTotalSeconds: POMODORO_WORK,
  favMonth: new Date().getMonth(),
  draggedSticker: null,
};

// ─────────────────────────────────────
// 3. LOCALSTORAGE HELPERS
// ─────────────────────────────────────

const LS = {
  get:    (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set:    (k, v)   => localStorage.setItem(k, JSON.stringify(v)),
  del:    (k)      => localStorage.removeItem(k),
};

function getEntries()    { return LS.get('pd_entries', []); }
function saveEntries(e)  { LS.set('pd_entries', e); }
function getPet()        { return LS.get('pd_pet', { xp:0, level:1, entries:0, lastFeed:null }); }
function savePet(p)      { LS.set('pd_pet', p); }
function getSessions()   { return LS.get('pd_sessions', 0); }
function saveSessions(n) { LS.set('pd_sessions', n); }
function getGarden()     { return LS.get('pd_garden', []); }
function saveGarden(g)   { LS.set('pd_garden', g); }
function getStreak()     { return LS.get('pd_streak', { count:0, lastDate:null }); }
function saveStreak(s)   { LS.set('pd_streak', s); }
function getFavorites()  { return LS.get('pd_favorites', {}); }
function saveFavorites(f){ LS.set('pd_favorites', f); }

// ─────────────────────────────────────
// 4. THEME ENGINE
// ─────────────────────────────────────

function applyMonthTheme(month) {
  const body = document.body;
  // Remove all theme classes
  MONTH_THEMES.forEach(t => body.classList.remove('theme-' + t.cls));
  body.classList.add('theme-' + MONTH_THEMES[month].cls);

  // Update badge
  const badge = document.getElementById('themeBadge');
  if (badge) badge.textContent = `${MONTH_THEMES[month].emoji} ${MONTH_THEMES[month].label}`;
}

// Apply current month theme on load
applyMonthTheme(new Date().getMonth());





// ─────────────────────────────────────
// 8. STREAK TRACKER
// ─────────────────────────────────────

function updateStreak(write = false) {
  const streak  = getStreak();
  const today   = new Date().toDateString();
  if (write) {
    if (streak.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      streak.count    = streak.lastDate === yesterday ? streak.count + 1 : 1;
      streak.lastDate = today;
      saveStreak(streak);
    }
  }
  document.getElementById('sidebarStreak').textContent = streak.count;
}
updateStreak();

// ─────────────────────────────────────
// 9. JOURNAL — ENTRY LIST
// ─────────────────────────────────────

function renderEntryList() {
  const list    = document.getElementById('entryList');
  const entries = getEntries().sort((a,b) => new Date(b.date) - new Date(a.date));
  list.innerHTML = '';

  if (!entries.length) {
    list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-light);font-style:italic">No entries yet. Start writing! 🌸</div>';
    return;
  }

  entries.forEach(e => {
    const div = document.createElement('div');
    div.className = 'entry-item' + (e.id === state.currentEntryId ? ' selected' : '');
    div.innerHTML = `
      <div class="entry-item-mood">${e.mood || '😊'}</div>
      <div class="entry-item-title">${e.title || 'Untitled Entry'}</div>
      <div class="entry-item-date">${formatDate(e.date)}</div>
      <div class="entry-item-preview">${stripHTML(e.content).slice(0,60)}…</div>
    `;
    div.addEventListener('click', () => loadEntry(e.id));
    list.appendChild(div);
  });
}

function stripHTML(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || '';
}

// ─────────────────────────────────────
// 10. JOURNAL — EDITOR
// ─────────────────────────────────────

const entryDate     = document.getElementById('entryDate');
const entryTitle    = document.getElementById('entryTitle');
const journalEditor = document.getElementById('journalEditor');
const wordCount     = document.getElementById('wordCount');
const btnSave       = document.getElementById('btnSave');
const btnDelete     = document.getElementById('btnDelete');
const btnNewEntry   = document.getElementById('btnNewEntry');

// Set today's date as default
entryDate.value = new Date().toISOString().split('T')[0];

// Mood selector
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedMood = btn.dataset.mood;
  });
});

// Word count
journalEditor.addEventListener('input', () => {
  const text  = journalEditor.innerText.trim();
  const words = text ? text.split(/\s+/).length : 0;
  wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
});

function newEntry() {
  state.currentEntryId = null;
  entryDate.value       = new Date().toISOString().split('T')[0];
  entryTitle.value      = '';
  journalEditor.innerHTML = '';
  wordCount.textContent = '0 words';
  state.selectedMood    = '😊';
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('active', b.dataset.mood === '😊'));
  btnDelete.style.display = 'none';
  renderEntryList();
  // Apply theme for selected month
  const m = new Date(entryDate.value).getMonth();
  applyMonthTheme(m);
}

function loadEntry(id) {
  const entries = getEntries();
  const entry   = entries.find(e => e.id === id);
  if (!entry) return;

  state.currentEntryId    = id;
  entryDate.value         = entry.date;
  entryTitle.value        = entry.title || '';
  journalEditor.innerHTML = entry.content || '';
  state.selectedMood      = entry.mood || '😊';
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('active', b.dataset.mood === entry.mood));
  btnDelete.style.display = 'inline-flex';
  wordCount.textContent   = `${stripHTML(entry.content || '').split(/\s+/).filter(Boolean).length} words`;
  renderEntryList();

  // Apply theme based on entry month
  const m = new Date(entry.date).getMonth();
  applyMonthTheme(m);
}

btnNewEntry.addEventListener('click', newEntry);

btnSave.addEventListener('click', () => {
  const content = journalEditor.innerHTML.trim();
  if (!content && !entryTitle.value) { showToast('✏️ Write something first!'); return; }

  const entries = getEntries();
  const id      = state.currentEntryId || ('entry_' + Date.now());
  const isNew   = !state.currentEntryId;
  const entry   = {
    id, date: entryDate.value,
    title: entryTitle.value || 'Untitled Entry',
    content, mood: state.selectedMood,
    createdAt: isNew ? Date.now() : (entries.find(e=>e.id===id)?.createdAt || Date.now()),
    updatedAt: Date.now(),
  };

  if (isNew) {
    entries.push(entry);
    awardXP();
    updateStreak(true);
  } else {
    const idx = entries.findIndex(e => e.id === id);
    if (idx > -1) entries[idx] = entry;
  }

  saveEntries(entries);
  state.currentEntryId = id;
  btnDelete.style.display = 'inline-flex';
  renderEntryList();
  showToast('💾 Entry saved! 🌸');
  updateStreak();
});

btnDelete.addEventListener('click', () => {
  if (!state.currentEntryId) return;
  if (!confirm('Delete this entry? 🌷')) return;
  const entries = getEntries().filter(e => e.id !== state.currentEntryId);
  saveEntries(entries);
  newEntry();
  showToast('🗑️ Entry deleted.');
});

entryDate.addEventListener('change', () => {
  const m = new Date(entryDate.value).getMonth();
  applyMonthTheme(m);
});

// Initialize
renderEntryList();
newEntry();

// ─────────────────────────────────────
// 11. STICKERS
// ─────────────────────────────────────

const toggleStickersBtn = document.getElementById('toggleStickers');
const stickerPanel      = document.getElementById('stickerPanel');
const stickerGrid       = document.getElementById('stickerGrid');

toggleStickersBtn.addEventListener('click', () => {
  const open = stickerPanel.style.display !== 'none';
  stickerPanel.style.display = open ? 'none' : 'flex';
  stickerPanel.style.flexDirection = 'column';
});

// Category buttons
document.querySelectorAll('.sticker-cat').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sticker-cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.stickerCategory = btn.dataset.cat;
    renderStickerGrid();
  });
});

function renderStickerGrid() {
  stickerGrid.innerHTML = '';
  (STICKERS[state.stickerCategory] || []).forEach(s => {
    const span = document.createElement('span');
    span.className   = 'sticker-item';
    span.textContent = s;
    span.draggable   = true;

    span.addEventListener('dragstart', e => {
      state.draggedSticker = s;
      e.dataTransfer.setData('text/plain', s);
    });

    // Also allow click-to-insert at cursor
    span.addEventListener('click', () => insertStickerAtCursor(s));
    stickerGrid.appendChild(span);
  });
}
renderStickerGrid();

// Drag-and-drop onto editor
const editorWrapper = document.getElementById('journalEditorWrapper');
editorWrapper.addEventListener('dragover', e => { e.preventDefault(); });
editorWrapper.addEventListener('drop', e => {
  e.preventDefault();
  const sticker = e.dataTransfer.getData('text/plain') || state.draggedSticker;
  if (!sticker) return;

  const rect  = editorWrapper.getBoundingClientRect();
  const x     = e.clientX - rect.left;
  const y     = e.clientY - rect.top;
  placeSticker(sticker, x, y);
});

function placeSticker(emoji, x, y) {
  const el = document.createElement('span');
  el.className   = 'dropped-sticker';
  el.textContent = emoji;
  el.style.left  = x + 'px';
  el.style.top   = y + 'px';
  makeDraggableInEditor(el);
  editorWrapper.appendChild(el);
}

function insertStickerAtCursor(emoji) {
  journalEditor.focus();
  const sel = window.getSelection();
  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(' ' + emoji + ' '));
    range.collapse(false);
  } else {
    journalEditor.innerHTML += ' ' + emoji + ' ';
  }
}

function makeDraggableInEditor(el) {
  let ox = 0, oy = 0, mx = 0, my = 0;
  el.addEventListener('mousedown', e => {
    e.preventDefault();
    ox = el.offsetLeft; oy = el.offsetTop;
    mx = e.clientX;     my = e.clientY;
    const move = ev => {
      el.style.left = (ox + ev.clientX - mx) + 'px';
      el.style.top  = (oy + ev.clientY - my) + 'px';
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });
  el.addEventListener('dblclick', () => el.remove());
}

// Image upload
document.getElementById('toggleImageUpload').addEventListener('click', () => {
  document.getElementById('imageUpload').click();
});
document.getElementById('imageUpload').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.createElement('img');
    img.src   = ev.target.result;
    img.style.cssText = 'max-width:200px;max-height:160px;border-radius:12px;position:absolute;left:80px;top:60px;cursor:move;box-shadow:0 4px 16px rgba(0,0,0,.2)';
    makeDraggableInEditor(img);
    editorWrapper.appendChild(img);
    showToast('🖼️ Image added! Drag to reposition.');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

// ─────────────────────────────────────
// 12. YEAR CALENDAR
// ─────────────────────────────────────

document.getElementById('prevYear').addEventListener('click', () => { state.calYear--; renderYearCalendar(); });
document.getElementById('nextYear').addEventListener('click', () => { state.calYear++; renderYearCalendar(); });

function renderYearCalendar() {
  document.getElementById('calYear').textContent = state.calYear;
  const grid    = document.getElementById('yearGrid');
  const entries = getEntries();
  grid.innerHTML = '';

  MONTH_THEMES.forEach((theme, mi) => {
    const card = document.createElement('div');
    card.className = 'month-card';

    const monthEntries = entries.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === state.calYear && d.getMonth() === mi;
    });
    const entryDates = new Set(monthEntries.map(e => new Date(e.date).getDate()));

    // Build mini calendar
    const firstDay = new Date(state.calYear, mi, 1).getDay();
    const daysInMonth = new Date(state.calYear, mi+1, 0).getDate();
    const today = new Date();

    let miniCal = '<div class="mini-cal-grid">';
    ['S','M','T','W','T','F','S'].forEach(d => miniCal += `<div class="mini-cal-day header">${d}</div>`);
    for (let i = 0; i < firstDay; i++) miniCal += '<div class="mini-cal-day"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday   = today.getFullYear()===state.calYear && today.getMonth()===mi && today.getDate()===d;
      const hasEntry  = entryDates.has(d);
      miniCal += `<div class="mini-cal-day ${hasEntry?'has-entry':''} ${isToday?'today':''}" 
                  title="${hasEntry?'Entry exists':''}">
                  ${d}</div>`;
    }
    miniCal += '</div>';

    card.innerHTML = `
      <div class="month-card-header">${theme.emoji} ${theme.name}</div>
      ${miniCal}
      <div class="month-stats">
        <span class="month-stat-chip">📖 ${monthEntries.length} entries</span>
        <span class="month-stat-chip">${theme.label}</span>
      </div>
    `;

    // Click on month → go to journal with that month
    card.addEventListener('click', () => {
      applyMonthTheme(mi);
      entryDate.value = `${state.calYear}-${String(mi+1).padStart(2,'0')}-01`;
      navigateTo('journal');
    });

    grid.appendChild(card);
  });
}

// ─────────────────────────────────────
// 13. MASCOT / PET SYSTEM
// ─────────────────────────────────────

function awardXP() {
  const pet = getPet();
  pet.xp      += XP_PER_ENTRY;
  pet.entries  = (pet.entries || 0) + 1;
  // Level up
  while (pet.xp >= pet.level * XP_PER_LEVEL) {
    pet.xp   -= pet.level * XP_PER_LEVEL;
    pet.level += 1;
    showToast(`🎉 Mochi leveled up to Level ${pet.level}!`);
    spawnHeartBurst();
  }
  savePet(pet);
  if (state.currentPage === 'mascot') renderMascot();
}

function renderMascot() {
  const pet       = getPet();
  const xpNeeded  = pet.level * XP_PER_LEVEL;
  const pct       = Math.min(100, (pet.xp / xpNeeded) * 100);
  const stageData = PET_STAGES.slice().reverse().find(s => pet.level >= s.minLv) || PET_STAGES[0];

  document.getElementById('petLevel').textContent    = pet.level;
  document.getElementById('xpBar').style.width       = pct + '%';
  document.getElementById('xpLabel').textContent     = `${pet.xp} / ${xpNeeded} XP`;
  document.getElementById('petEntries').textContent  = pet.entries || 0;
  document.getElementById('petEvolution').textContent = `${stageData.icon} ${stageData.name}`;
  document.getElementById('sidebarStreak').textContent = getStreak().count;

  // Mood based on streak
  const streak = getStreak();
  let mood = '😊 Happy';
  if (streak.count >= 7) mood = '🥰 Overjoyed';
  else if (streak.count >= 3) mood = '😄 Cheerful';
  else if (streak.count === 0) mood = '😴 Lonely…';
  document.getElementById('petMood').textContent = mood;

  // Mascot stage
  const mascot = document.getElementById('mascot');
  mascot.dataset.stage = stageData.stage;

  // Ensure ear / face elements exist
  if (!mascot.querySelector('.mascot-ear-l')) {
    mascot.innerHTML = `
      <div class="mascot-ear-l"><div class="mascot-ear-inner"></div></div>
      <div class="mascot-ear-r"><div class="mascot-ear-inner"></div></div>
      <div class="mascot-eye-l"></div>
      <div class="mascot-eye-r"></div>
      <div class="mascot-nose"></div>
      <div class="mascot-cheek-l"></div>
      <div class="mascot-cheek-r"></div>
    `;
  }

  // Evolution stages highlight
  document.querySelectorAll('.evo-stage').forEach(el => {
    const s = parseInt(el.dataset.stage);
    el.classList.toggle('unlocked', s <= stageData.stage);
  });

  // Speech
  const speeches = [
    'Hello! I\'m Mochi~ 🌸',
    'Write in your journal to level me up! 📖',
    'I love you! 💖',
    'Keep it up, you\'re amazing! ✨',
    `Level ${pet.level} and thriving! 🌟`,
  ];
  document.getElementById('mascotSpeech').textContent = speeches[Math.floor(Math.random() * speeches.length)];
}


function spawnHeartBurst() {
  for (let i = 0; i < 12; i++) {
    const h = document.createElement('div');
    h.textContent = ['💖','💕','✨','🌸','⭐'][Math.floor(Math.random()*5)];
    h.style.cssText = `
      position:fixed;
      left:${30+Math.random()*40}%;
      top:${20+Math.random()*60}%;
      font-size:${18+Math.random()*20}px;
      pointer-events:none; z-index:9999;
      animation:heartBurst 1.4s forwards;
      animation-delay:${Math.random()*0.5}s;
    `;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 2200);
  }
}

// Inject heart burst keyframes once
const heartStyle = document.createElement('style');
heartStyle.textContent = `
@keyframes heartBurst {
  0%   { transform: scale(0) translateY(0); opacity:1; }
  80%  { opacity:1; }
  100% { transform: scale(1.5) translateY(-80px) rotate(${Math.random()*60-30}deg); opacity:0; }
}`;
document.head.appendChild(heartStyle);

// ─────────────────────────────────────
// 14. POMODORO TIMER
// ─────────────────────────────────────

const timerDisplay = document.getElementById('timerDisplay');
const timerMode    = document.getElementById('timerMode');
const timerRing    = document.getElementById('timerRing');
const CIRCUMFERENCE = 339.3;

function updateTimerDisplay() {
  const m = Math.floor(state.pomodoroSeconds / 60);
  const s = state.pomodoroSeconds % 60;
  timerDisplay.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  const progress  = 1 - (state.pomodoroSeconds / state.pomodoroTotalSeconds);
  timerRing.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  timerRing.style.stroke = `var(--primary-dark)`;
}

document.getElementById('timerStart').addEventListener('click', () => {
  if (state.pomodoroRunning) return;
  state.pomodoroRunning = true;
  state.pomodoroInterval = setInterval(() => {
    if (state.pomodoroSeconds <= 0) {
      clearInterval(state.pomodoroInterval);
      state.pomodoroRunning = false;

      if (state.pomodoroIsWork) {
        // Session complete!
        const sessions = getSessions() + 1;
        saveSessions(sessions);
        document.getElementById('sessionCount').textContent = sessions;
        bloomFlower();
        showToast('🌸 Pomodoro complete! A flower bloomed!');
        spawnHeartBurst();
        playDingSound();
        // Switch to break
        state.pomodoroIsWork      = false;
        state.pomodoroTotalSeconds = POMODORO_BREAK;
        state.pomodoroSeconds      = POMODORO_BREAK;
        timerMode.textContent     = '☕ Break Time';
      } else {
        // Break over
        state.pomodoroIsWork      = true;
        state.pomodoroTotalSeconds = POMODORO_WORK;
        state.pomodoroSeconds      = POMODORO_WORK;
        timerMode.textContent     = '🌸 Work Time';
        showToast('⏳ Break over! Ready to focus? 💪');
      }
      updateTimerDisplay();
    } else {
      state.pomodoroSeconds--;
      updateTimerDisplay();
    }
  }, 1000);
});

document.getElementById('timerPause').addEventListener('click', () => {
  clearInterval(state.pomodoroInterval);
  state.pomodoroRunning = false;
});

document.getElementById('timerReset').addEventListener('click', () => {
  clearInterval(state.pomodoroInterval);
  state.pomodoroRunning         = false;
  state.pomodoroIsWork          = true;
  state.pomodoroTotalSeconds    = POMODORO_WORK;
  state.pomodoroSeconds         = POMODORO_WORK;
  timerMode.textContent         = '🌸 Work Time';
  updateTimerDisplay();
});
document.querySelectorAll('.duration-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mins = parseInt(btn.dataset.mins);
    clearInterval(state.pomodoroInterval);
    state.pomodoroRunning         = false;
    state.pomodoroIsWork          = true;
    state.pomodoroTotalSeconds    = mins * 60;
    state.pomodoroSeconds         = mins * 60;
    timerMode.textContent         = '🌸 Work Time';
    updateTimerDisplay();
  });
});
// Load session count
document.getElementById('sessionCount').textContent = getSessions();
updateTimerDisplay();

// Bloom flower
function bloomFlower() {
  const garden = getGarden();
  const flowers = ['🌸','🌺','🌼','🌻','🌷','💐'];
  garden.push(flowers[garden.length % flowers.length]);
  saveGarden(garden);
  renderGarden();
}

function renderGarden() {
  const garden  = getGarden();
  const container = document.getElementById('gardenFlowers');
  container.innerHTML = '';
  garden.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'garden-flower';
    div.style.animationDelay = (i * 0.1) + 's';
    div.innerHTML = `<div class="flower-head">${f}</div><div class="flower-stem"></div>`;
    container.appendChild(div);
  });
}
renderGarden();

// ─────────────────────────────────────
// 15. MONTHLY FAVORITES
// ─────────────────────────────────────

const favMonthSelect = document.getElementById('favMonthSelect');
favMonthSelect.value = state.favMonth;
favMonthSelect.addEventListener('change', () => {
  state.favMonth = parseInt(favMonthSelect.value);
  renderFavorites();
  applyMonthTheme(state.favMonth);
});

function getFavKey(month, type) { return `${state.calYear}_${month}_${type}`; }

function renderFavorites() {
  renderFavList('songs',    'favSongs');
  renderFavList('movies',   'favMovies');
  renderFavList('memories', 'favMemories');
}

function renderFavList(type, containerId) {
  const favs = getFavorites();
  const key   = getFavKey(state.favMonth, type);
  const items = favs[key] || [];
  const cont  = document.getElementById(containerId);
  cont.innerHTML = '';
  items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'fav-item';
    el.innerHTML = `
      <span>${item}</span>
      <button class="fav-item-del" data-type="${type}" data-idx="${idx}">×</button>
    `;
    el.querySelector('.fav-item-del').addEventListener('click', () => removeFav(type, idx));
    cont.appendChild(el);
  });
}

function addFav(type, inputId) {
  const input = document.getElementById(inputId);
  const val   = input.value.trim();
  if (!val) return;
  const favs = getFavorites();
  const key   = getFavKey(state.favMonth, type);
  favs[key]   = [...(favs[key] || []), val];
  saveFavorites(favs);
  input.value = '';
  renderFavorites();
  showToast('💖 Added!');
}

function removeFav(type, idx) {
  const favs = getFavorites();
  const key   = getFavKey(state.favMonth, type);
  favs[key].splice(idx, 1);
  saveFavorites(favs);
  renderFavorites();
}

document.getElementById('addSong').addEventListener('click',    () => addFav('songs',    'newSong'));
document.getElementById('addMovie').addEventListener('click',   () => addFav('movies',   'newMovie'));
document.getElementById('addMemory').addEventListener('click',  () => addFav('memories', 'newMemory'));

['newSong','newMovie','newMemory'].forEach((id, i) => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') ['addSong','addMovie','addMemory'][i] && document.getElementById(['addSong','addMovie','addMemory'][i]).click();
  });
});

// ─────────────────────────────────────
// 16. YEAR REVIEW
// ─────────────────────────────────────

function renderYearReview() {
  const entries  = getEntries().filter(e => new Date(e.date).getFullYear() === state.calYear);
  const pet      = getPet();
  const streak   = getStreak();
  const sessions = getSessions();
  const favs     = getFavorites();
  const cont     = document.getElementById('yearReviewContent');

  // Count by month
  const byMonth  = Array(12).fill(0);
  entries.forEach(e => byMonth[new Date(e.date).getMonth()]++);

  // Mood stats
  const moodCount = {};
  entries.forEach(e => { moodCount[e.mood||'😊'] = (moodCount[e.mood||'😊']||0)+1; });
  const topMood = Object.entries(moodCount).sort((a,b)=>b[1]-a[1])[0];

  cont.innerHTML = `
    <div class="yr-stats-row">
      <div class="yr-stat-card">
        <div class="yr-stat-icon">📖</div>
        <div class="yr-stat-val">${entries.length}</div>
        <div class="yr-stat-label">Total Entries</div>
      </div>
      <div class="yr-stat-card">
        <div class="yr-stat-icon">🔥</div>
        <div class="yr-stat-val">${streak.count}</div>
        <div class="yr-stat-label">Day Streak</div>
      </div>
      <div class="yr-stat-card">
        <div class="yr-stat-icon">🌸</div>
        <div class="yr-stat-val">${sessions}</div>
        <div class="yr-stat-label">Pomodoros</div>
      </div>
      <div class="yr-stat-card">
        <div class="yr-stat-icon">🐰</div>
        <div class="yr-stat-val">Lv ${pet.level}</div>
        <div class="yr-stat-label">Mochi's Level</div>
      </div>
      <div class="yr-stat-card">
        <div class="yr-stat-icon">${topMood?.[0]||'😊'}</div>
        <div class="yr-stat-val">${topMood?.[1]||0}</div>
        <div class="yr-stat-label">Top Mood</div>
      </div>
    </div>

    <div class="yr-months-section">
      <h2>🗓️ Month by Month</h2>
      <div class="yr-months-grid">
        ${MONTH_THEMES.map((t,mi) => {
          const songsKey  = `${state.calYear}_${mi}_songs`;
          const moviesKey = `${state.calYear}_${mi}_movies`;
          const memsKey   = `${state.calYear}_${mi}_memories`;
          const songs   = favs[songsKey]   || [];
          const movies  = favs[moviesKey]  || [];
          const mems    = favs[memsKey]    || [];
          return `
          <div class="yr-month-card">
            <div class="yr-month-name">${t.emoji} ${t.name}</div>
            <div class="yr-month-entries">📖 ${byMonth[mi]} entries</div>
            <div class="yr-month-favs">
              ${songs.length  ? `<div class="yr-month-fav-row">🎵 ${songs.slice(0,2).join(', ')}${songs.length>2?'…':''}</div>`:''}
              ${movies.length ? `<div class="yr-month-fav-row">🎬 ${movies.slice(0,2).join(', ')}${movies.length>2?'…':''}</div>`:''}
              ${mems.length   ? `<div class="yr-month-fav-row">💫 ${mems.slice(0,1).join(', ')}${mems.length>1?'…':''}</div>`:''}
              ${!songs.length && !movies.length && !mems.length ? '<span style="font-size:12px;color:var(--text-light)">No favorites added yet 🌸</span>' : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}



// ─────────────────────────────────────
// 18. TOAST NOTIFICATIONS
// ─────────────────────────────────────

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─────────────────────────────────────
// 19. MODAL (for calendar day click)
// ─────────────────────────────────────

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('modalOverlay').style.display = 'none';
});
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) {
    document.getElementById('modalOverlay').style.display = 'none';
  }
});

// ─────────────────────────────────────
// 20. FINAL INIT
// ─────────────────────────────────────

// Apply timer gradient (SVG defs)
const svgDefs = document.createElementNS('http://www.w3.org/2000/svg','defs');
svgDefs.innerHTML = `
  <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" style="stop-color:var(--primary-dark)"/>
    <stop offset="100%" style="stop-color:var(--accent)"/>
  </linearGradient>`;
document.querySelector('.progress-svg')?.prepend(svgDefs);

// Set current month in favorites selector
favMonthSelect.value = new Date().getMonth();
state.favMonth = new Date().getMonth();

// Animate mascot on page load
setTimeout(() => {
  if (state.currentPage !== 'mascot') return;
  renderMascot();
}, 100);

// Log welcome
console.log('%c🌸 Petal Diary loaded! Happy journaling! 💖', 'color:hotpink;font-size:16px;font-weight:bold');
