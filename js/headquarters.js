(function(){
'use strict';

/* ---------- CONFIG (always first) ---------- */
var STORE_KEY = 'ansla.v1';
var CREW = [
  { id:'dadrew',  name:'Dadrew',  role:'The Captain' },
  { id:'mumgela', name:'Mumgela', role:'The Mapmaker & Magic Keeper' },
  { id:'theboy',  name:'The Boy', role:'First Mate & Explorer' }
];
var FUTURE_CREW = 'Milo, Cherub and BigJ will sign on when they reach the island.';
var LIBRARY = {
  'On the water': ['The tinny','SUP','Kayaking','Boogie boarding','River swimming','Fishing','Magnet fishing'],
  'Trails and wilds': ['National park hike','Mountain trails','Beach walk','Moonlit walk','Cycling'],
  'Wildlife': ['Dolphin spotting','Whale watching'],
  'Sky and night': ['Stargazing','Astrophotography','Storm watching'],
  'Fire and camp': ['Campfire','Camping'],
  'Treasure hunting': ['Goldpanning','Fossicking','Antique hunting'],
  'Big days out': ['Dreamworld','SEA LIFE'],
  'Home ports': ['Movie night','Board games','Quiz night']
};
var STONE_LINES = {
  dawn: ['The island wakes gold and quiet. First light belongs to the brave.',
         'The tide has turned in the night. New sand, new stories.',
         'Dew on the pandanus. The day has not decided what it is yet. You may decide for it.'],
  day:  ['The sun stands tall. Water and shade will both be glad of you.',
         'A fine wide day. Somewhere on the island, something is waiting to be found.',
         'The island is loudest at noon, if you know how to listen.'],
  dusk: ['The light turns to gold and the day tells its story. Walk out and hear the ending.',
         'Fish rise at dusk. So do stories.',
         'The lanterns will want lighting soon.'],
  night:['The stars are out over Ansla. Some adventures only happen in the dark.',
         'The moon keeps watch so the crew may wander.',
         'Night on the island is not empty. It is full of things the day cannot show you.']
};
var STONE_SUGGEST = {
  dawn: ['Beach walk','Fishing','Dolphin spotting','Kayaking'],
  day:  ['River swimming','Boogie boarding','National park hike','SUP','The tinny','Fossicking'],
  dusk: ['Beach walk','Fishing','Campfire','Storm watching'],
  night:['Stargazing','Astrophotography','Moonlit walk','Movie night','Board games','Quiz night']
};
var CHAOS_LINES = [
  'The crystal hums. It knows something you do not.',
  'Not yet. But soon, and without warning.',
  'A little chaos is being prepared. The island asks for patience.',
  'The crystal flickers, considers you carefully, and dims again.'
];
var CHAOS_MISSIONS = [
  'A stick on this adventure has been abducted by aliens. Find it and document its safe return.',
  'Convince the crew something strange lives in these woods. A yowie, perhaps. Commit to it.',
  'Prepare one innocent-looking snack with a surprising (edible!) twist and get a crew member to eat it.',
  'Claim a completely ordinary rock is priceless treasure. Defend it beyond all reason.',
  'Invent a solemn island tradition on the spot and get the whole crew to perform it.',
  'Swap one item of someone’s gear for something ridiculous without being caught.',
  'Narrate the crew like a nature documentary until somebody cracks.',
  'Photograph a crew member mid-blink and declare it their official portrait.',
  'Insist on a dramatic slow-motion walk for no reason. Recruit at least one other.',
  'Hide a hand-drawn treasure map for the crew to find. It must lead to something silly.',
  'Speak only in pirate for ten full minutes. Refuse to explain why.',
  'Award an invisible medal to a crew member with a full ceremony and a speech.'
];
var GREETINGS = { dawn:'Good morning, Captain.', day:'Good day, Captain.', dusk:'Good evening, Captain.', night:'The stars keep watch, Captain.' };
var WHEN_CHOICES = ['At first light','Midmorning','High sun','Golden hour','Under the stars','When the drums sound'];
var CAT_ART = {
  'On the water':'on_the_water', 'Trails and wilds':'trails_and_wilds', 'Wildlife':'wildlife',
  'Sky and night':'sky_and_night', 'Fire and camp':'fire_and_camp', 'Treasure hunting':'treasure_hunting',
  'Big days out':'big_days_out', 'Home ports':'home_ports'
};
var CAT_POS = { 'Home ports':'center 72%' };
var IDLE_MIN = 20000, IDLE_MAX = 45000;
var PHOTO_MAX_EDGE = 700, PHOTO_QUALITY = 0.7;

/* ---------- STATE ---------- */
function freshState(){
  return { crew:{ currentMemberId:null }, motif:{ chosen:null, unlocked:['ansla-emblem'] },
    flag:{ raised:false, adventure:null, raisedBy:null, raisedAt:null, joining:[] },
    adventures:[], ideas:[], horizon:[], treasures:[], rewards:{ shanty:[], motifs:[], chaosChampions:[] }, chronicle:[],
    chaos:{ deployed:false, deployedBy:null, missions:{} },
    hideSeek:{ active:false }, stone:{}, compass:{}, settings:{ timeOverride:'auto' } };
}
var state;
function load(){
  try { var raw = localStorage.getItem(STORE_KEY); state = raw ? JSON.parse(raw) : freshState(); }
  catch(e){ state = freshState(); }
  /* migrate older saves */
  if (!state.ideas) state.ideas = [];
  if (!state.horizon) state.horizon = [];
  if (!state.chaos) state.chaos = { deployed:false, deployedBy:null, missions:{} };
  if (!state.rewards.chaosChampions) state.rewards.chaosChampions = [];
}
function allAboard(){
  return state.flag.raised && CREW.every(function(c){ return state.flag.joining.indexOf(c.name) !== -1; });
}
function save(){
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); try { reflectScene(); } catch(e2){} return true; }
  catch(e){ alert('The chest is full. The island cannot hold more just now (device storage limit). Older treasures may need to sail to the cloud in a later voyage.'); return false; }
}
function proclaim(text){
  var p = $('proclaim'); if (!p) return;
  p.querySelector('span').textContent = text;
  p.classList.remove('show'); void p.offsetWidth; p.classList.add('show');
  setTimeout(function(){ p.classList.remove('show'); }, 2300);
}
function catOf(title){
  var found = null;
  Object.keys(LIBRARY).forEach(function(cat){ if (LIBRARY[cat].indexOf(title) !== -1) found = cat; });
  return found;
}
function catBanner(title){
  var cat = catOf(title);
  if (!cat || !CAT_ART[cat]) return '';
  return '<div class="catCard" style="background-image:url(\'art/board/' + CAT_ART[cat] + '.jpg\')' +
         (CAT_POS[cat] ? '; background-position:' + CAT_POS[cat] : '') + '"><span>' + esc(title) + '</span></div>';
}
function reflectScene(){
  var pn = $('pennant'); if (pn) pn.classList.toggle('up', !!state.flag.raised);
  var bl = $('boardLive');
  if (bl){
    var artCat = state.flag.raised ? catOf(state.flag.adventure) : (state.horizon.length ? catOf(state.horizon[0].title) : null);
    if (artCat && CAT_ART[artCat]){
      bl.classList.add('hasArt');
      bl.style.backgroundImage = 'linear-gradient(rgba(12,7,3,.15), rgba(12,7,3,.68)), url(\'art/board/' + CAT_ART[artCat] + '.jpg\')';
    } else {
      bl.classList.remove('hasArt');
      bl.style.backgroundImage = '';
    }
  }
  var t = $('blTitle'), bb = $('blBody');
  if (t && bb){
    if (state.flag.raised){
      t.textContent = state.flag.raisedBy + ' has RAISED THE COLOURS!';
      bb.innerHTML = esc(state.flag.adventure) + (state.flag.when ? '<br>' + esc(state.flag.when) : '') +
        '<br><small>' + state.flag.joining.length + ' joining: ' + esc(state.flag.joining.join(', ')) +
        (state.chaos.deployed ? ' &middot; chaos is loose' : '') + '</small>' +
        (state.horizon.length ? '<br><small>On the horizon: ' + esc(state.horizon[0].title) + (state.horizon.length > 1 ? ' +' + (state.horizon.length - 1) + ' more' : '') + '</small>' : '');
    } else if (state.horizon.length){
      t.textContent = 'The board is quiet.';
      bb.innerHTML = 'No colours flying over Ansla.<br><small>On the horizon: ' +
        esc(state.horizon[0].title) + (state.horizon[0].when ? ', ' + esc(state.horizon[0].when.toLowerCase()) : '') +
        (state.horizon.length > 1 ? ' +' + (state.horizon.length - 1) + ' more' : '') + '</small>';
    } else {
      t.textContent = 'The board is quiet.';
      bb.innerHTML = 'No colours flying over Ansla.<br><small>Tap the board to choose an adventure, or plant an idea below.</small>';
    }
  }
  var cl = $('chestLive');
  if (cl){
    cl.innerHTML = '';
    state.treasures.slice(-3).reverse().forEach(function(tr){
      var d = document.createElement('div'); d.className = 'mini';
      var im = document.createElement('img'); im.alt = ''; im.src = tr.imageRef;
      d.appendChild(im); cl.appendChild(d);
    });
  }
}
function member(){ var m = CREW.filter(function(c){ return c.id === state.crew.currentMemberId; })[0]; return m || CREW[0]; }
function $(id){ return document.getElementById(id); }
function esc(s){ var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

/* ---------- TIME OF DAY ---------- */
function timeState(){
  if (state.settings.timeOverride && state.settings.timeOverride !== 'auto') return state.settings.timeOverride;
  var h = new Date().getHours() + new Date().getMinutes()/60;
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 16.5) return 'day';
  if (h >= 16.5 && h < 19.5) return 'dusk';
  return 'night';
}
function applyTime(){
  var t = timeState();
  var sc = $('scene');
  sc.className = 't-' + t;
  $('greetTime').textContent = GREETINGS[t];
  $('greetName').textContent = 'Ahoy, ' + member().name + '!';
}

/* ---------- SCENE FIT & DRAG (auto-fits and recentres on any rotate/resize) ---------- */
var offX = 0, offY = 0, minX = 0, minY = 0, dragging = false, moved = 0;
var startX = 0, startY = 0, startOffX = 0, startOffY = 0, IMG_RATIO = 1.5;
function applyOffset(){ $('scene').style.transform = 'translate(' + offX + 'px,' + offY + 'px)'; }
function layout(){
  var stage = $('stage'), img = document.querySelector('#scene img.bg'), sc = $('scene');
  if (img.naturalWidth) IMG_RATIO = img.naturalWidth / img.naturalHeight;
  var vw = stage.clientWidth, vh = stage.clientHeight, w, h;
  if (vw / vh > IMG_RATIO){ w = vw; h = Math.round(vw / IMG_RATIO); }
  else { h = vh; w = Math.round(vh * IMG_RATIO); }
  img.style.width = w + 'px'; img.style.height = h + 'px';
  sc.style.width = w + 'px'; sc.style.height = h + 'px';
  minX = Math.min(0, vw - w); minY = Math.min(0, vh - h);
  offX = Math.max(minX, Math.min(0, (vw - w) / 2));
  offY = Math.max(minY, Math.min(0, (vh - h) / 2));
  applyOffset();
}
function bindDrag(){
  var stage = $('stage');
  stage.addEventListener('pointerdown', function(e){
    dragging = true; moved = 0; startX = e.clientX; startY = e.clientY;
    startOffX = offX; startOffY = offY; stage.classList.add('dragging');
  });
  window.addEventListener('pointermove', function(e){
    if (!dragging) return;
    var dx = e.clientX - startX, dy = e.clientY - startY;
    moved = Math.max(moved, Math.abs(dx), Math.abs(dy));
    offX = Math.max(minX, Math.min(0, startOffX + dx));
    offY = Math.max(minY, Math.min(0, startOffY + dy));
    applyOffset();
  });
  window.addEventListener('pointerup', function(){ dragging = false; stage.classList.remove('dragging'); });
  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', function(){ setTimeout(layout, 250); });
}
function wasDrag(){ return moved > 8; }

/* ---------- RIPPLE ---------- */
function ripple(e){
  var r = document.createElement('div'); r.className = 'ripple';
  var rect = $('scene').getBoundingClientRect();
  r.style.left = (e.clientX - rect.left) + 'px'; r.style.top = (e.clientY - rect.top) + 'px';
  $('scene').appendChild(r); setTimeout(function(){ r.remove(); }, 750);
}

/* ---------- PANEL PLUMBING ---------- */
function openV(id){ $(id).classList.add('open'); }
function closeV(id){ $(id).classList.remove('open'); }
function closeAll(){ document.querySelectorAll('.veil.open').forEach(function(v){ v.classList.remove('open'); }); }
function body(id){ return document.querySelector('#' + id + ' .body'); }

/* ---------- ADVENTURE BOARD ---------- */
function raiseColours(title, when){
  state.flag = { raised:true, adventure:title, when:when || '', raisedBy:member().name,
                 raisedAt:new Date().toISOString(), joining:[member().name] };
  state.chaos = { deployed:false, deployedBy:null, missions:{} };
  save(); closeAll();
  proclaim('The Colours Are Raised');
  var bl = $('boardLive'); if (bl){ bl.classList.remove('pop'); void bl.offsetWidth; bl.classList.add('pop'); }
}
function horizonHtml(){
  if (!state.horizon.length) return '';
  var h = '<div class="cat">On the horizon</div>';
  state.horizon.forEach(function(hz, i){
    h += '<div class="advCard"><b style="font-size:15px;">' + esc(hz.title) + '</b>' +
      (hz.when ? ' <span style="font-size:13px; color:#7a5a32;">&middot; ' + esc(hz.when) + '</span>' : '') +
      '<br><span style="font-size:12px; color:#8a765a; font-style:italic;">charted by ' + esc(hz.chartedBy) + '</span><br>' +
      (state.flag.raised ? '' : '<button class="wbtn hzHoist" data-i="' + i + '" style="margin-top:8px; font-size:13px;">Hoist the Colours</button>') +
      '<button class="wbtn ghost hzDrop" data-i="' + i + '" style="margin-top:8px; font-size:13px;">Let it drift</button></div>';
  });
  return h;
}
function wireHorizon(scope){
  scope.querySelectorAll('.hzHoist').forEach(function(el){
    el.onclick = function(){
      var h = state.horizon.splice(parseInt(el.getAttribute('data-i'), 10), 1)[0];
      if (h) raiseColours(h.title, h.when);
    };
  });
  scope.querySelectorAll('.hzDrop').forEach(function(el){
    el.onclick = function(){ state.horizon.splice(parseInt(el.getAttribute('data-i'), 10), 1); save(); openBoard(); };
  });
}
function openBoard(){
  var b = body('vBoard'); b.innerHTML = '';
  var html = '';
  if (state.flag.raised){
    var joined = state.flag.joining.indexOf(member().name) !== -1;
    html += catBanner(state.flag.adventure) +
      '<div class="advCard"><b>' + esc(state.flag.raisedBy) + ' has RAISED THE COLOURS!</b><br>' +
      esc(state.flag.adventure) + (state.flag.when ? '<br>' + esc(state.flag.when) : '') +
      '<br><span style="font-size:13px;color:#7a5a32;">' + state.flag.joining.length + ' joining: ' + esc(state.flag.joining.join(', ')) + '</span></div>' +
      '<button class="wbtn" id="bJoin"' + (joined ? ' disabled' : '') + '>' + (joined ? 'You are aboard' : "I'm going, is anyone coming? Count me in!") + '</button>' +
      '<div class="notice">When the crew returns, strike the colours at the flagpole and log the story. Fancy something after? Chart it on the horizon below.</div>';
  } else if (!state.horizon.length){
    html += '<div class="notice">No colours flying. Choose an adventure and raise them, or chart one for the horizon.</div>';
  }
  html += horizonHtml();
  Object.keys(LIBRARY).forEach(function(cat){
    if (CAT_ART[cat]) html += '<div class="catCard" style="background-image:url(\'art/board/' + CAT_ART[cat] + '.jpg\')' + (CAT_POS[cat] ? '; background-position:' + CAT_POS[cat] : '') + '"><span>' + esc(cat) + '</span></div>';
    else html += '<div class="cat">' + esc(cat) + '</div>';
    LIBRARY[cat].forEach(function(a){ html += '<span class="adv" data-a="' + esc(a) + '">' + esc(a) + '</span>'; });
  });
  html += '<div id="raiseForm" style="display:none; margin-top:16px;">' +
    '<div class="advCard"><b id="rfName"></b></div>' +
    '<p style="font-size:13.5px; color:#7a5a32; margin:4px 0;">When do we sail?</p>' +
    '<div id="rfWhenRow"></div>' +
    (state.flag.raised ? '' : '<button class="wbtn" id="rfGo" style="margin-top:10px;">Raise the Colours</button>') +
    '<button class="wbtn ghost" id="rfChart" style="margin-top:10px;">Chart it on the horizon</button>' +
    '<button class="wbtn ghost" id="rfNo">Not this one</button></div>';
  b.innerHTML = html;
  if ($('bJoin')) $('bJoin').onclick = function(){
    if (state.flag.joining.indexOf(member().name) === -1){ state.flag.joining.push(member().name); save(); }
    openBoard();
  };
  wireHorizon(b);
  var chosen = null, whenPick = '';
  var wr = $('rfWhenRow');
  WHEN_CHOICES.forEach(function(w){
    var ch = document.createElement('span');
    ch.className = 'whenChip'; ch.textContent = w;
    ch.onclick = function(){
      whenPick = w;
      wr.querySelectorAll('.whenChip').forEach(function(x){ x.classList.remove('sel'); });
      ch.classList.add('sel');
    };
    wr.appendChild(ch);
  });
  b.querySelectorAll('.adv').forEach(function(el){
    el.onclick = function(){
      chosen = el.getAttribute('data-a');
      $('rfName').textContent = chosen;
      $('raiseForm').style.display = 'block';
      $('raiseForm').scrollIntoView({ behavior:'smooth', block:'nearest' });
    };
  });
  if ($('rfGo')) $('rfGo').onclick = function(){ if (chosen) raiseColours(chosen, whenPick); };
  $('rfChart').onclick = function(){
    if (!chosen) return;
    state.horizon.push({ title:chosen, when:whenPick, chartedBy:member().name, chartedAt:new Date().toISOString() });
    save(); openBoard();
  };
  $('rfNo').onclick = function(){ chosen = null; $('raiseForm').style.display = 'none'; };
  openV('vBoard');
}

/* ---------- FLAG ---------- */
function openFlag(){
  var b = body('vFlag'); b.innerHTML = '';
  if (!state.flag.raised){
    b.innerHTML = '<div class="notice">The colours are stowed. The Adventure Board is where they rise.</div>' +
      '<button class="wbtn" id="fToBoard">To the Board</button>';
    $('fToBoard').onclick = function(){ closeV('vFlag'); openBoard(); };
  } else {
    b.innerHTML = catBanner(state.flag.adventure) +
      '<div class="advCard"><b>' + esc(state.flag.adventure) + '</b>' + (state.flag.when ? '<br>' + esc(state.flag.when) : '') +
      '<br><span style="font-size:13px;color:#7a5a32;">Raised by ' + esc(state.flag.raisedBy) + ' &middot; crew aboard: ' + esc(state.flag.joining.join(', ')) + '</span></div>' +
      '<button class="wbtn" id="fStrike">Strike the Colours (we are home)</button>' +
      '<div id="logForm" style="display:none; margin-top:14px;">' +
        '<div class="cat">Log the adventure</div>' +
        '<p style="font-size:14px; margin:8px 0;">Who won the day? The winner writes the next line of the shanty.</p>' +
        '<div id="winnerRow"></div>' +
        '<input type="text" id="shantyLine" class="scrollInput" placeholder="The next line of our shanty (winner’s words)&hellip;">' +
        (state.chaos.deployed ?
          '<p style="font-size:14px; margin:8px 0;">Chaos was loose out there. The crew votes: who was <b>Chaos Champion</b>?</p><div id="champRow"></div>'
          : '') +
        '<textarea id="chronNote" class="journal" placeholder="A few words for the Chronicle: what happened out there?"></textarea>' +
        '<button class="wbtn" id="fLog">Seal it in the Chronicle</button>' +
      '</div>';
    $('fStrike').onclick = function(){
      $('fStrike').style.display = 'none';
      $('logForm').style.display = 'block';
      var winner = null, champ = null;
      function pickRow(rowEl, mark, setter){
        CREW.forEach(function(c){
          var btn = document.createElement('button');
          btn.className = 'pickChip'; btn.textContent = c.name;
          btn.onclick = function(){
            setter(c.name);
            rowEl.querySelectorAll('.pickChip').forEach(function(x){ x.className = 'pickChip'; x.textContent = x.textContent.replace(mark + ' ', ''); });
            btn.className = 'pickChip sel'; btn.textContent = mark + ' ' + c.name;
          };
          rowEl.appendChild(btn);
        });
      }
      pickRow($('winnerRow'), '⚔', function(n){ winner = n; });
      if ($('champRow')) pickRow($('champRow'), '★', function(n){ champ = n; });
      $('fLog').onclick = function(){
        var line = $('shantyLine').value.trim();
        var note = $('chronNote').value.trim();
        var hadChaos = state.chaos.deployed;
        state.adventures.push({ title:state.flag.adventure, when:state.flag.when, joining:state.flag.joining,
          raisedBy:state.flag.raisedBy, status:'completed', completedAt:new Date().toISOString(),
          chaos:hadChaos, chaosChampion:champ || null });
        if (line) state.rewards.shanty.push({ line:line, author:winner || member().name, date:new Date().toISOString() });
        if (hadChaos && champ) state.rewards.chaosChampions.push({ name:champ, adventure:state.flag.adventure, date:new Date().toISOString() });
        if (note) state.chronicle.push({ entry:note, author:member().name, date:new Date().toISOString() });
        state.flag = { raised:false, adventure:null, when:null, raisedBy:null, raisedAt:null, joining:[] };
        state.chaos = { deployed:false, deployedBy:null, missions:{} };
        save();
        proclaim('The Colours Are Struck');
        var nxt = state.horizon[0];
        b.innerHTML = '<div class="notice">The colours are struck, the story is kept. ' +
          (line ? 'The shanty grows a line longer. ' : 'The shanty waits for a braver day. ') +
          (hadChaos && champ ? esc(champ) + ' is crowned Chaos Champion.' : '') + '</div>' +
          (nxt ? '<div class="advCard"><b>' + esc(nxt.title) + '</b>' + (nxt.when ? ' <span style="font-size:13px; color:#7a5a32;">&middot; ' + esc(nxt.when) + '</span>' : '') +
                 '<br><span style="font-size:13px; font-style:italic; color:#8a765a;">waits on the horizon.</span></div>' +
                 '<button class="wbtn" id="fNext">Hoist the Colours for it</button>' : '');
        if (nxt) $('fNext').onclick = function(){
          var h = state.horizon.shift();
          if (h) raiseColours(h.title, h.when);
        };
      };
    };
  }
  openV('vFlag');
}

/* ---------- TREASURE CHEST ---------- */
var pendingPhoto = null;
function openChest(){
  var b = body('vChest');
  var html = '<button class="wbtn" id="tAdd">Add a treasure</button>' +
    '<div id="tForm" style="display:none;">' +
      '<div class="devWrap"><div class="devPol"><img id="devImg" alt="">' +
      '<input type="text" id="tCap" placeholder="what is this memory?"></div></div>' +
      '<div style="text-align:center;"><button class="wbtn" id="tSave">Into the chest</button></div>' +
    '</div><div id="tGrid"></div>';
  if (!state.treasures.length) html += '<div class="notice">The chest waits for its first memory. Go and make one.</div>';
  b.innerHTML = html;
  var grid = $('tGrid');
  state.treasures.slice().reverse().forEach(function(t){
    var d = document.createElement('div'); d.className = 'pol';
    d.innerHTML = '<img alt=""><div class="cap"></div><div class="by"></div>';
    d.querySelector('img').src = t.imageRef;
    d.querySelector('.cap').textContent = t.caption || '';
    d.querySelector('.by').textContent = t.addedBy + ' · ' + new Date(t.addedAt).toLocaleDateString();
    grid.appendChild(d);
  });
  pendingPhoto = null;
  $('tAdd').onclick = function(){ $('photoIn').value = ''; $('photoIn').click(); };
  $('tSave').onclick = function(){
    if (!pendingPhoto) return;
    state.treasures.push({ imageRef:pendingPhoto, caption:$('tCap').value.trim(), addedBy:member().name, addedAt:new Date().toISOString() });
    if (save()) openChest();
  };
  openV('vChest');
}
function bindPhotoInput(){
  $('photoIn').addEventListener('change', function(){
    var f = $('photoIn').files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function(){
      var img = new Image();
      img.onload = function(){
        var sc = Math.min(1, PHOTO_MAX_EDGE / Math.max(img.width, img.height));
        var cv = document.createElement('canvas');
        cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        pendingPhoto = cv.toDataURL('image/jpeg', PHOTO_QUALITY);
        var tf = $('tForm');
        if (tf){
          tf.style.display = 'block';
          var dv = $('devImg');
          if (dv){ dv.style.animation = 'none'; void dv.offsetWidth; dv.style.animation = ''; dv.src = pendingPhoto; }
        }
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(f);
  });
}

/* ---------- ISLAND STONE ---------- */
function openStone(){
  var t = timeState();
  var lines = STONE_LINES[t];
  var line = lines[Math.floor(Math.random() * lines.length)];
  var sugg = STONE_SUGGEST[t][Math.floor(Math.random() * STONE_SUGGEST[t].length)];
  body('vStone').innerHTML =
    '<div class="notice" style="font-size:16px;">' + esc(line) + '</div>' +
    '<p style="margin:14px 0 6px;">The runes glow and settle on a thought:</p>' +
    '<div class="advCard"><b>' + esc(sugg) + '</b></div>' +
    '<button class="wbtn" id="sRaise">Raise the Colours for it</button>' +
    '<p class="sub" style="margin-top:16px;">The Stone speaks from old wisdom for now. One day it will read the sky, the tides, the whales and the weather itself.</p>';
  $('sRaise').onclick = function(){ raiseColours(sugg, ''); };
  openV('vStone');
}

/* ---------- COMPASS ---------- */
var DIRS = [['North','the wild horizon'],['North-east','the morning water'],['East','the rising sun'],['South-east','the river mouth'],
            ['South','the old mountain'],['South-west','the deep forest'],['West','the setting sun'],['North-west','the far headland']];
function openCompass(){
  body('vCompass').innerHTML =
    '<div id="roseWrap"><svg width="150" height="150" viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="56" fill="#1e2b45" stroke="#c9a86a" stroke-width="2.5"/>' +
    '<circle cx="60" cy="60" r="44" fill="none" stroke="#8fa3c9" stroke-width=".7" opacity=".6"/>' +
    '<text x="60" y="16" fill="#e8d9b5" font-size="11" text-anchor="middle">N</text>' +
    '<text x="60" y="112" fill="#8fa3c9" font-size="10" text-anchor="middle">S</text>' +
    '<text x="109" y="64" fill="#8fa3c9" font-size="10" text-anchor="middle">E</text>' +
    '<text x="11" y="64" fill="#8fa3c9" font-size="10" text-anchor="middle">W</text>' +
    '<polygon id="needle" points="60,22 65,60 60,74 55,60" fill="#e05a4e" stroke="#e8d9b5" stroke-width=".8"/>' +
    '</svg></div><p id="cWord" style="text-align:center; font-style:italic; min-height:44px;"></p>' +
    '<p class="sub" style="text-align:center;">One day this needle will be real, and you will carry it on adventures.</p>';
  var pick = DIRS[Math.floor(Math.random() * DIRS.length)];
  var deg = 720 + DIRS.indexOf(pick) * 45;
  setTimeout(function(){
    var n = $('needle'); if (n) n.style.transform = 'rotate(' + deg + 'deg)';
    setTimeout(function(){
      var w = $('cWord'); if (w) w.textContent = 'The needle settles ' + pick[0].toLowerCase() + ', toward ' + pick[1] + '. What waits there?';
    }, 2600);
  }, 250);
  openV('vCompass');
}

/* ---------- CHRONICLE ---------- */
function openChron(){
  var b = body('vChron');
  var html = '<textarea id="chNew" class="journal" placeholder="Add to the Chronicle, ' + esc(member().name) + '…"></textarea>' +
    '<button class="wbtn" id="chSave">Record it</button>';
  html += '<div class="cat">The tales</div>';
  if (!state.chronicle.length && !state.adventures.length) html += '<div class="notice">The Chronicle is unwritten. The first tale is always the hardest to start and the best to remember.</div>';
  state.chronicle.slice().reverse().forEach(function(c){
    html += '<div class="advCard"><span class="entryHand">' + esc(c.entry) + '</span><br>' +
      '<span style="font-size:12px; color:#8a765a; font-style:italic;">' + esc(c.author) + ' · ' + new Date(c.date).toLocaleDateString() + '</span></div>';
  });
  if (state.adventures.length){
    html += '<div class="cat">Adventures completed: ' + state.adventures.length + '</div>';
    state.adventures.slice().reverse().forEach(function(a){
      html += '<div style="font-size:13.5px; margin:4px 0;">&#9873; ' + esc(a.title) + ' · ' + new Date(a.completedAt).toLocaleDateString() + '</div>';
    });
  }
  if (state.rewards.chaosChampions.length){
    html += '<div class="cat">Chaos Champions</div>';
    state.rewards.chaosChampions.slice().reverse().forEach(function(cc){
      html += '<div style="font-size:13.5px; margin:4px 0;">&#9733; ' + esc(cc.name) + ' &middot; ' + esc(cc.adventure) + ' &middot; ' + new Date(cc.date).toLocaleDateString() + '</div>';
    });
  }
  html += '<div class="cat">The Shanty of Ansla</div>';
  if (!state.rewards.shanty.length){
    html += '<div class="notice">The song awaits its first line. Win the day on an adventure and write it.</div>';
  } else {
    state.rewards.shanty.forEach(function(s){
      html += '<div style="font-style:italic; margin:5px 0; font-size:15px;">&ldquo;' + esc(s.line) + '&rdquo; <span style="font-size:11.5px; color:#8a765a;">' + esc(s.author) + '</span></div>';
    });
  }
  b.innerHTML = html;
  $('chSave').onclick = function(){
    var v = $('chNew').value.trim(); if (!v) return;
    state.chronicle.push({ entry:v, author:member().name, date:new Date().toISOString() });
    save(); openChron();
  };
  openV('vChron');
}

/* ---------- CHAOS ---------- */
function openChaos(){
  var b = body('vChaos');
  if (!state.flag.raised){
    b.innerHTML = '<div style="text-align:center; padding:14px 4px;"><p style="font-size:17px; font-style:italic;">' +
      esc(CHAOS_LINES[Math.floor(Math.random() * CHAOS_LINES.length)]) + '</p>' +
      '<p style="font-size:13px; color:#8f7cad; margin-top:14px;">It wakes only when the colours fly and every crew member is aboard.</p></div>';
  } else if (!allAboard()){
    var missing = CREW.filter(function(c){ return state.flag.joining.indexOf(c.name) === -1; })
                      .map(function(c){ return c.name; }).join(' and ');
    b.innerHTML = '<div style="text-align:center; padding:14px 4px;"><p style="font-size:17px; font-style:italic;">The crystal stirs&hellip; but waits for the whole crew.</p>' +
      '<p style="font-size:13.5px; color:#8f7cad; margin-top:12px;">' + esc(missing) + ' ' + (missing.indexOf(' and ') !== -1 ? 'have' : 'has') + ' not yet joined the adventure.</p></div>';
  } else if (!state.chaos.deployed){
    b.innerHTML = '<div style="text-align:center; padding:10px 4px;">' +
      '<p style="font-size:18px; letter-spacing:.08em;">THE CRYSTAL IS LIVE.</p>' +
      '<p style="font-size:14px; font-style:italic; color:#8f7cad; margin:12px 0 18px;">All crew aboard. One touch, and every member of this crew receives a secret mission. Evidence goes in the Treasure Chest. The crew votes a Chaos Champion when the colours are struck.</p>' +
      '<button class="wbtn" id="xGo" style="background:#4a2a72; border-color:#2a1444;">Unleash the chaos</button></div>';
    $('xGo').onclick = function(){
      var pool = CHAOS_MISSIONS.slice();
      var missions = {};
      CREW.forEach(function(c){
        var i = Math.floor(Math.random() * pool.length);
        missions[c.id] = pool.splice(i, 1)[0];
      });
      state.chaos = { deployed:true, deployedBy:member().name, missions:missions, deployedAt:new Date().toISOString() };
      save(); openChaos();
    };
  } else {
    b.innerHTML = '<div style="padding:6px 2px;">' +
      '<p style="font-size:12.5px; letter-spacing:.14em; color:#8f7cad; text-transform:uppercase;">Chaos was unleashed by ' + esc(state.chaos.deployedBy) + '</p>' +
      '<p style="margin:14px 0 6px; font-size:15px;">Your secret mission, ' + esc(member().name) + '. Yours alone. Tell no one:</p>' +
      '<div style="border:1px solid #4a3468; border-radius:6px; background:rgba(120,60,200,.10); padding:14px 16px; font-size:16px; font-style:italic;">' +
      esc(state.chaos.missions[member().id] || 'The crystal has nothing for you. Suspicious in itself.') + '</div>' +
      '<p style="font-size:13px; color:#8f7cad; margin-top:14px;">Evidence in the Treasure Chest. The crew votes the Chaos Champion when the colours are struck.</p></div>';
  }
  openV('vChaos');
}

/* ---------- PLANT AN IDEA ---------- */
function openIdeas(){
  var b = body('vIdeas');
  var html = '<input type="text" id="idNew" placeholder="Poker night? Sunday BBQ? Plant it&hellip;">' +
    '<button class="wbtn" id="idPlant">Plant it</button>';
  if (!state.ideas.length) html += '<div class="notice">Nothing planted yet. Ideas grow into adventures here.</div>';
  else html += '<div class="cat">Growing on the board</div>';
  state.ideas.slice().reverse().forEach(function(idea, ri){
    var realIdx = state.ideas.length - 1 - ri;
    html += '<div class="advCard"><b style="font-size:15px;">' + esc(idea.text) + '</b><br>' +
      '<span style="font-size:12px; color:#8a765a; font-style:italic;">planted by ' + esc(idea.plantedBy) + ' · ' + new Date(idea.plantedAt).toLocaleDateString() + '</span><br>' +
      '<button class="wbtn ghost idGrow" data-i="' + realIdx + '" style="margin-top:8px; font-size:13px;">' +
      (state.flag.raised ? 'Chart it on the horizon' : 'Raise the Colours for it') + '</button>' +
      '</div>';
  });
  b.innerHTML = html;
  $('idPlant').onclick = function(){
    var v = $('idNew').value.trim(); if (!v) return;
    state.ideas.push({ text:v, plantedBy:member().name, plantedAt:new Date().toISOString() });
    save(); openIdeas();
  };
  b.querySelectorAll('.idGrow').forEach(function(el){
    el.onclick = function(){
      var idea = state.ideas[parseInt(el.getAttribute('data-i'), 10)];
      if (!idea) return;
      if (state.flag.raised){
        state.horizon.push({ title:idea.text, when:'', chartedBy:member().name, chartedAt:new Date().toISOString() });
        save(); openIdeas();
      } else {
        raiseColours(idea.text, '');
      }
    };
  });
  openV('vIdeas');
}

/* ---------- THE CALL ---------- */
function openCall(){
  body('vCall').innerHTML = state.flag.raised
    ? '<div class="notice">The colours are raised! One day the drums will sound on every crew member’s phone the moment this happens. For now, word travels the old way.</div>'
    : '<div class="notice">The drums are quiet. They sound when the colours are raised, and one voyage soon, they will reach the whole crew wherever they roam.</div>';
  openV('vCall');
}

/* ---------- CREW ---------- */
function openCrew(){
  var b = body('vCrew'); b.innerHTML = '';
  CREW.forEach(function(c){
    var d = document.createElement('button');
    d.className = 'crewBtn'; d.style.margin = '8px 0';
    d.innerHTML = esc(c.name) + (c.id === state.crew.currentMemberId ? ' &#10004;' : '') + '<small>' + esc(c.role) + '</small>';
    d.onclick = function(){ state.crew.currentMemberId = c.id; save(); applyTime(); openCrew(); };
    b.appendChild(d);
  });
  var note = document.createElement('div'); note.className = 'notice'; note.textContent = FUTURE_CREW;
  b.appendChild(note);
  openV('vCrew');
}

/* ---------- SETTINGS ---------- */
function openSettings(){
  var b = body('vSettings');
  b.innerHTML = '<div class="cat">Light on the island</div>' +
    '<p style="font-size:13.5px; margin:6px 0;">The island follows the real sky. Override it to preview:</p><div id="todRow"></div>' +
    '<div class="cat">Danger below decks</div>' +
    '<button class="wbtn ghost" id="sgReset">Begin again (wipes everything)</button>' +
    '<p class="sub" style="margin-top:14px;">Escape from Ansla Island &middot; Voyage I mock-up &middot; nothing leaves this device.</p>';
  var row = $('todRow');
  ['auto','dawn','day','dusk','night'].forEach(function(t){
    var btn = document.createElement('button');
    btn.className = (state.settings.timeOverride === t) ? 'wbtn' : 'wbtn ghost';
    btn.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    btn.onclick = function(){ state.settings.timeOverride = t; save(); applyTime(); openSettings(); };
    row.appendChild(btn);
  });
  var armed = false;
  $('sgReset').onclick = function(){
    if (!armed){ armed = true; $('sgReset').textContent = 'Truly? All tales, treasures and the shanty will sink. Tap again to be sure.'; return; }
    localStorage.removeItem(STORE_KEY); location.reload();
  };
  openV('vSettings');
}

/* ---------- ROLLO ---------- */
function rolloBark(){
  var fx = $('rolloFx');
  fx.classList.remove('bark'); void fx.offsetWidth; fx.classList.add('bark');
}
function rolloIdleLoop(){
  setTimeout(function(){
    var g = $('rolloIdle'); g.classList.add('on');
    setTimeout(function(){ g.classList.remove('on'); }, 2200);
    rolloIdleLoop();
  }, IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN));
}

/* ---------- LANTERN / HIDE & SEEK ---------- */
function toggleLantern(){
  state.hideSeek.active = !state.hideSeek.active;
  if (state.hideSeek.active) state.hideSeek.startedAt = new Date().toISOString();
  save(); reflectLantern();
}
function reflectLantern(){
  $('lanternGlow').classList.toggle('on', !!state.hideSeek.active);
  $('hsBanner').classList.toggle('show', !!state.hideSeek.active);
}

/* ---------- FIRST RUN ---------- */
function firstRun(){
  var fr = $('firstRun'); fr.classList.add('open');
  var wrap = $('frCrew'); wrap.innerHTML = '';
  CREW.forEach(function(c){
    var btn = document.createElement('button');
    btn.className = 'crewBtn';
    btn.innerHTML = esc(c.name) + '<small>' + esc(c.role) + '</small>';
    btn.onclick = function(){
      state.crew.currentMemberId = c.id;
      $('frLead').style.display = 'none'; wrap.style.display = 'none';
      $('frMotif').style.display = 'block';
    };
    wrap.appendChild(btn);
  });
  $('frHoist').onclick = function(){
    state.motif.chosen = 'ansla-emblem';
    save(); fr.classList.remove('open'); applyTime();
  };
}

/* ---------- WIRING ---------- */
function bindHotspot(id, fn){
  $(id).addEventListener('click', function(e){
    if (wasDrag()) return;
    ripple(e); setTimeout(fn, 160);
  });
}
function init(){
  load();
  layout(); bindDrag(); bindPhotoInput();
  document.querySelector('#scene img.bg').addEventListener('load', layout);
  applyTime(); reflectLantern(); reflectScene();
  setInterval(applyTime, 60000);
  bindHotspot('hs-board', openBoard);
  bindHotspot('hs-flag', openFlag);
  bindHotspot('hs-chest', openChest);
  bindHotspot('hs-stone', openStone);
  bindHotspot('hs-compass', openCompass);
  bindHotspot('hs-chron', openChron);
  bindHotspot('hs-chaos', openChaos);
  bindHotspot('hs-call', openCall);
  bindHotspot('hs-crew', openCrew);
  bindHotspot('hs-settings', openSettings);
  bindHotspot('hs-lantern', toggleLantern);
  bindHotspot('hs-idea', openIdeas);
  $('hs-rollo').addEventListener('click', function(){ if (!wasDrag()) rolloBark(); });
  document.querySelectorAll('.veil .closeX').forEach(function(x){
    x.onclick = function(){ x.closest('.veil').classList.remove('open'); };
  });
  document.querySelectorAll('.veil').forEach(function(v){
    v.addEventListener('click', function(e){ if (e.target === v) v.classList.remove('open'); });
  });
  window.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeAll(); });
  rolloIdleLoop();
  setTimeout(function(){ $('hint').classList.add('gone'); }, 6000);
  if (!state.crew.currentMemberId || !state.motif.chosen) firstRun();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
