(function(){
'use strict';

/* ================= CONFIG (always first) ================= */
var SUPA_URL = 'https://snnbgttfavruslntoosu.supabase.co';
var SUPA_KEY = 'sb_publishable_DXRoK4gaSjx3fwQ78ltVMA_OB26BGqM';
var VAPID_PUBLIC = 'BJ8hUUd0T1pGve9Xl_p3PCKGDrKBcP6u3MC0gWKbH2HsAdBzOiKRmZTp5L5t3S5xXIFd83obXveHHg8z4yyKNhQ';
var LOCAL_KEY = 'ansla.v2.local';   /* this device only: settings, treasures (until the vault), who I am */
var CACHE_KEY = 'ansla.v2.cache';   /* last-known shared state, for instant paint */
var FUTURE_CREW = 'Milo, Cherub and BigJ will sign on when they reach the island.';
var LIBRARY = {
  'On the water': ['The tinny','SUP','Kayaking','Boogie boarding','River swimming','Fishing','Magnet fishing'],
  'Trails and wilds': ['National park hike','Mountain trails','Beach walk','Moonlit walk','Cycling'],
  'Wildlife': ['Dolphin spotting','Whale watching'],
  'Sky and night': ['Stargazing','Astrophotography','Storm watching'],
  'Fire and camp': ['Campfire','Camping'],
  'Treasure hunting': ['Goldpanning','Fossicking','Antique hunting'],
  'Big days out': ['Dreamworld','SEA LIFE'],
  'Home ports': ['Movie night','Board games','Quiz night'],
  'Dadrew\'s Almanac': [
    'Mt Coolum New Year\'s Hike and Beach Picnic','SEA LIFE (Nov)','Dreamworld (Jan)',
    'Gardners Falls – Maleny, Swimming Hole','Buderim Forest Park – Waterfall and Shaded Trails',
    'Kondalilla Falls – Full Circuit Hike','Noosa National Park – Coastal Walks and Secluded Beaches',
    'Mapleton Falls and National Park','Mt Coolum Sunrise Climb and Coolum Beach',
    'Wappa Falls – Swimming and Picnic',
    'SEA LIFE (Mar)','Mary Cairncross Scenic Reserve – Glass House Mountain Views',
    'Baroon Pocket Dam – Walk or Paddleboarding','Mt Ninderry Hike – Hinterland Views',
    'Mt Ngungun Climb – Family-Friendly Adventure','Glass House Mountains Lookout Circuit',
    'Dreamworld (Apr)','Eumundi Conservation Park Walk and Markets',
    'Bribie Island – Coastal Walks and Birdwatching','Noosa Everglades Eco Tour – Tranquil Waterways',
    'SEA LIFE (May)','Tibrogargan Circuit – Glass House Mountains','Mt Beerburrum Climb and Picnic',
    'Mt Tinbeerwah Sunset Hike','Boreen Point Foreshore – Relaxing Day','Dreamworld (Jun)',
    'Caloundra Coastal Pathway Walk to Moffat Beach','Noosa Botanic Gardens – Lakeside Afternoon',
    'Mt Cooroora (Pomona) Hike','Glass House Mountains Interpretive Centre and Trails',
    'Mt Coochin Climb – Lesser-Known Adventure','SEA LIFE (Jul)','Rainbow Beach – Coloured Sands and Walks',
    'Conondale National Park – Booloumba Falls Hike','Eumundi Markets and Mount Eerwah Walking Trail',
    'Noosa Heads Coastal Walk – Spring Views','Kondalilla Falls Wildflower Hike','Dreamworld (Sep)',
    'Mooloolaba Beach – Swimming and Rock Pool Snorkelling','Double Island Point – 4WD Tour or Paddle Adventure',
    'SEA LIFE (Sep)','Cootharaba to Kinaba Walk – Noosa Everglades','Mt Tibrogargan Climb or Summit Trail',
    'Montville Visit and Baroon Pocket Dam','Dreamworld (Oct)','Peregian Beach – Coastal Tracks',
    'Point Cartwright – Walks and Beach Relaxation','Sunshine Coast Hinterland Great Walk (Short Section)'
  ]
};
var CAT_ART = {
  'On the water':'on_the_water', 'Trails and wilds':'trails_and_wilds', 'Wildlife':'wildlife',
  'Sky and night':'sky_and_night', 'Fire and camp':'fire_and_camp', 'Treasure hunting':'treasure_hunting',
  'Big days out':'big_days_out', 'Home ports':'home_ports', 'Dadrew\'s Almanac':'dadrews_almanac'
};
var CAT_POS = { 'Home ports':'center 72%' };
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
var CHAOS_TEASES = [
  'The crystal hums. It knows something you do not.',
  'Not yet. But soon, and without warning.',
  'A little chaos is being prepared. The island asks for patience.',
  'The crystal flickers, considers you carefully, and dims again.'
];
var GREETINGS = { dawn:'Good morning, Captain.', day:'Good day, Captain.', dusk:'Good evening, Captain.', night:'The stars keep watch, Captain.' };
var WHEN_CHOICES = ['At first light','Midmorning','High sun','Golden hour','Under the stars','When the drums sound'];
var IDLE_MIN = 20000, IDLE_MAX = 45000;
var PHOTO_MAX_EDGE = 700, PHOTO_QUALITY = 0.7;
var HOME_SHORE = { lat:-26.6528, lng:153.0921, name:'Maroochydore' };
var METEOR_SHOWERS = [
  { name:'the Quadrantids', from:'01-01', to:'01-06' },
  { name:'the Eta Aquariids', from:'04-28', to:'05-10' },
  { name:'the Orionids', from:'10-16', to:'10-28' },
  { name:'the Geminids', from:'12-10', to:'12-16' }
];
var HUNT_PUBLISH_MS = { close:10000, long:60000 };
var HUNT_CUES = [
  [0.05, 'EEK! The cat is at the door! Do not even breathe!'],
  [0.15, 'A twig snaps. Very close. Hold everything.'],
  [0.4,  'Something stirs nearby. The hunt is warm.'],
  [1.0,  'Lanterns move in the distance. They are coming.'],
  [Infinity, 'The island is quiet. For now.']
];

/* ================= STATE ================= */
var sb = null;
var online = false;
var members = [];
var me = { id:null, name:null, role:null };
var shared = {
  flag:{ raised:false, adventure:null, when:null, raisedBy:null, joining:[] },
  horizon:[], ideas:[], adventures:[], chronicle:[], shanty:[], treasures:[],
  chaos:{ deployed:false, deployedBy:null },
  hideSeek:{ active:false, soughtId:null, mode:'close', startedBy:null }
};
var positions = {};   /* member_id -> latest hs_positions row */
var local = { settings:{ timeOverride:'auto', sound:true }, treasures:[], memberName:null, migrated:false };

function loadLocal(){
  try { var raw = localStorage.getItem(LOCAL_KEY); if (raw){ var l = JSON.parse(raw);
    local.settings = l.settings || local.settings; local.treasures = l.treasures || [];
    local.memberName = l.memberName || null; local.migrated = !!l.migrated; } }
  catch(e){}
}
function saveLocal(){
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(local)); } catch(e){}
}
function cacheSave(){ try { localStorage.setItem(CACHE_KEY, JSON.stringify(shared)); } catch(e){} }
function cachePaint(){
  try { var raw = localStorage.getItem(CACHE_KEY); if (raw){ shared = Object.assign(shared, JSON.parse(raw)); } } catch(e){}
}
function $(id){ return document.getElementById(id); }
function esc(s){ var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
function myName(){ return me.name || local.memberName || 'Captain'; }

/* ================= TIME OF DAY ================= */
function timeState(){
  if (local.settings.timeOverride && local.settings.timeOverride !== 'auto') return local.settings.timeOverride;
  var h = new Date().getHours() + new Date().getMinutes()/60;
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 16.5) return 'day';
  if (h >= 16.5 && h < 19.5) return 'dusk';
  return 'night';
}
function applyTime(){
  var t = timeState();
  $('scene').className = 't-' + t;
  $('greetTime').textContent = GREETINGS[t];
  $('greetName').textContent = 'Ahoy, ' + myName() + '!';
}

/* ================= SCENE FIT & DRAG ================= */
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

/* ================= RIPPLE / TOAST ================= */
function ripple(e){
  var r = document.createElement('div'); r.className = 'ripple';
  var rect = $('scene').getBoundingClientRect();
  r.style.left = (e.clientX - rect.left) + 'px'; r.style.top = (e.clientY - rect.top) + 'px';
  $('scene').appendChild(r); setTimeout(function(){ r.remove(); }, 750);
}
var toastTimer = null;
function toast(msg){
  var h = $('hint'); h.textContent = msg; h.classList.remove('gone');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ h.classList.add('gone'); }, 5000);
}

/* ================= THE ISLAND'S VOICE (synthesised drums) ================= */
var audioCtx = null;
function primeAudio(){
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch(e){}
}
function drumHit(t, freq, vol){
  var o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.45), t + 0.22);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.32);
}
function playDrums(){
  if (local.settings.sound === false || !audioCtx || audioCtx.state !== 'running') return;
  var t = audioCtx.currentTime + 0.03;
  drumHit(t,        110, 0.5);
  drumHit(t + 0.22, 110, 0.5);
  drumHit(t + 0.55,  82, 0.6);
  drumHit(t + 0.77,  82, 0.6);
  drumHit(t + 1.12,  62, 0.75);
}
function squeakChirp(t, f0, f1, dur, vol){
  var o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
function playSqueak(){
  if (local.settings.sound === false || !audioCtx || audioCtx.state !== 'running') return;
  var t = audioCtx.currentTime + 0.02;
  squeakChirp(t,        1500, 950, 0.13, 0.22);
  squeakChirp(t + 0.19, 1750, 1050, 0.16, 0.26);
}
var lastCueTier = 99;
function cueTier(km){
  if (km == null) return 99;
  if (km <= 0.05) return 0;
  if (km <= 0.15) return 1;
  if (km <= 0.4) return 2;
  return 3;
}
function checkSqueak(){
  if (!shared.hideSeek.active || !me.id || shared.hideSeek.soughtId !== me.id){ lastCueTier = 99; return; }
  var nearest = null, myPos = positions[me.id];
  members.forEach(function(m){
    if (m.id === me.id) return;
    var p = positions[m.id];
    if (p && myPos && p.lat != null && myPos.lat != null){
      var d = haversineKm({ lat:myPos.lat, lng:myPos.lng }, { lat:p.lat, lng:p.lng });
      if (nearest === null || d < nearest) nearest = d;
    }
  });
  var tier = cueTier(nearest);
  if (tier < lastCueTier && tier <= 1) playSqueak();
  lastCueTier = tier;
}

/* ================= PANEL PLUMBING ================= */
function openV(id){ $(id).classList.add('open'); }
function closeV(id){ $(id).classList.remove('open'); }
function closeAll(){ document.querySelectorAll('.veil.open').forEach(function(v){ v.classList.remove('open'); }); }
function body(id){ return document.querySelector('#' + id + ' .body'); }
function proclaim(text){
  var p = $('proclaim'); if (!p) return;
  p.querySelector('span').textContent = text;
  p.classList.remove('show'); void p.offsetWidth; p.classList.add('show');
  setTimeout(function(){ p.classList.remove('show'); }, 2300);
}
function boardPop(){
  var bl = $('boardLive'); if (bl){ bl.classList.remove('pop'); void bl.offsetWidth; bl.classList.add('pop'); }
}

/* ================= SCENE REFLECTION ================= */
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
  var pn = $('pennant'); if (pn) pn.classList.toggle('up', !!shared.flag.raised);
  var bl = $('boardLive');
  if (bl){
    var artCat = shared.flag.raised ? catOf(shared.flag.adventure) : (shared.horizon.length ? catOf(shared.horizon[0].title) : null);
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
    if (shared.flag.raised){
      t.textContent = shared.flag.raisedBy + ' has RAISED THE COLOURS!';
      bb.innerHTML = esc(shared.flag.adventure) + (shared.flag.when ? '<br>' + esc(shared.flag.when) : '') +
        '<br><small>' + shared.flag.joining.length + ' joining: ' + esc(shared.flag.joining.join(', ')) +
        (shared.chaos.deployed ? ' &middot; chaos is loose' : '') + '</small>' +
        (shared.horizon.length ? '<br><small>On the horizon: ' + esc(shared.horizon[0].title) + (shared.horizon.length > 1 ? ' +' + (shared.horizon.length - 1) + ' more' : '') + '</small>' : '');
    } else if (shared.horizon.length){
      t.textContent = 'The board is quiet.';
      bb.innerHTML = 'No colours flying over Ansla.<br><small>On the horizon: ' +
        esc(shared.horizon[0].title) + (shared.horizon[0].when ? ', ' + esc(shared.horizon[0].when.toLowerCase()) : '') +
        (shared.horizon.length > 1 ? ' +' + (shared.horizon.length - 1) + ' more' : '') + '</small>';
    } else {
      t.textContent = 'The board is quiet.';
      bb.innerHTML = 'No colours flying over Ansla.<br><small>Tap the board to choose an adventure, or plant an idea below.</small>';
    }
  }
  var cl = $('chestLive');
  if (cl){
    cl.innerHTML = '';
    shared.treasures.slice(-3).reverse().forEach(function(tr){
      if (!tr.url) return;
      var d = document.createElement('div'); d.className = 'mini';
      var im = document.createElement('img'); im.alt = ''; im.src = tr.url;
      d.appendChild(im); cl.appendChild(d);
    });
  }
}
function reflectLantern(){
  $('lanternGlow').classList.toggle('on', !!shared.hideSeek.active);
  $('hsBanner').classList.toggle('show', !!shared.hideSeek.active);
}

/* ================= SUPABASE: CONNECT, FETCH, SUBSCRIBE ================= */
function mapFlag(row){
  return { raised:!!row.raised, adventure:row.adventure, when:row.when_label,
           raisedBy:row.raised_by, joining:row.joining || [], raisedAt:row.raised_at };
}
async function ensureAuth(){
  var s = await sb.auth.getSession();
  if (!s.data.session){
    var r = await sb.auth.signInAnonymously();
    if (r.error) throw r.error;
  }
}
async function fetchRoster(){
  var r = await sb.from('crew_members').select('*').eq('active', true).order('joined_at');
  if (r.error) throw r.error;
  members = r.data || [];
}
async function whoAmI(){
  var r = await sb.from('crew_devices').select('member_id').maybeSingle();
  if (r.data){
    var m = members.filter(function(x){ return x.id === r.data.member_id; })[0];
    if (m){ me = { id:m.id, name:m.name, role:m.role }; local.memberName = m.name; saveLocal(); return true; }
  }
  return false;
}
async function fetchFlag(){ var r = await sb.from('flag').select('*').eq('id',1).single(); if (r.data) shared.flag = mapFlag(r.data); }
async function fetchHorizon(){ var r = await sb.from('horizon').select('*').order('charted_at'); if (r.data) shared.horizon = r.data.map(function(h){ return { id:h.id, title:h.title, when:h.when_label, chartedBy:h.charted_by }; }); }
async function fetchIdeas(){ var r = await sb.from('ideas').select('*').order('planted_at'); if (r.data) shared.ideas = r.data.map(function(i){ return { id:i.id, text:i.idea, plantedBy:i.planted_by, plantedAt:i.planted_at }; }); }
async function fetchAdventures(){ var r = await sb.from('adventures').select('*').order('completed_at'); if (r.data) shared.adventures = r.data.map(function(a){ return { title:a.title, when:a.when_label, joining:a.joining||[], chaos:a.chaos, chaosChampion:a.chaos_champion, completedAt:a.completed_at }; }); }
async function fetchChronicle(){ var r = await sb.from('chronicle').select('*').order('created_at'); if (r.data) shared.chronicle = r.data.map(function(c){ return { entry:c.entry, author:c.author, date:c.created_at }; }); }
async function fetchShanty(){ var r = await sb.from('shanty_lines').select('*').order('earned_at'); if (r.data) shared.shanty = r.data.map(function(s){ return { line:s.line, author:s.author, date:s.earned_at }; }); }
async function fetchChaos(){ var r = await sb.from('chaos_state').select('*').eq('id',1).single(); if (r.data) shared.chaos = { deployed:!!r.data.deployed, deployedBy:r.data.deployed_by }; }
async function fetchHideSeek(){ var r = await sb.from('hide_seek').select('*').eq('id',1).single(); if (r.data) shared.hideSeek = { active:!!r.data.active, soughtId:r.data.sought_member_id, mode:r.data.mode || 'close', startedBy:r.data.started_by, startedAt:r.data.started_at }; }
async function fetchPositions(){ var r = await sb.from('hs_positions').select('*'); if (r.data){ positions = {}; r.data.forEach(function(p){ positions[p.member_id] = p; }); } }
async function fetchTreasures(){
  var r = await sb.from('treasures').select('*').order('added_at');
  if (!r.data) return;
  var rows = r.data, paths = rows.map(function(t){ return t.photo_path; }), urls = {};
  if (paths.length){
    var s = await sb.storage.from('treasures').createSignedUrls(paths, 3600);
    if (s.data) s.data.forEach(function(u, i){ if (u && u.signedUrl) urls[paths[i]] = u.signedUrl; });
  }
  shared.treasures = rows.map(function(t){
    return { id:t.id, path:t.photo_path, caption:t.caption, addedBy:t.added_by, addedAt:t.added_at, url:urls[t.photo_path] || '' };
  });
}
async function refreshShared(){
  await Promise.all([fetchFlag(), fetchHorizon(), fetchIdeas(), fetchAdventures(), fetchChronicle(), fetchShanty(), fetchChaos(), fetchHideSeek(), fetchPositions(), fetchTreasures()]);
  cacheSave(); reflectScene(); reflectLantern(); geoSync();
}
function subscribe(){
  sb.channel('island')
    .on('postgres_changes', { event:'*', schema:'public', table:'flag' }, function(p){
      var was = shared.flag.raised;
      shared.flag = mapFlag(p.new); cacheSave(); reflectScene();
      if (shared.flag.raised && !was){ proclaim('The Colours Are Raised'); boardPop(); playDrums(); }
      if (!shared.flag.raised && was){ proclaim('The Colours Are Struck'); }
    })
    .on('postgres_changes', { event:'*', schema:'public', table:'chaos_state' }, function(p){
      var was = shared.chaos.deployed;
      shared.chaos = { deployed:!!p.new.deployed, deployedBy:p.new.deployed_by };
      cacheSave(); reflectScene();
      if (shared.chaos.deployed && !was && shared.chaos.deployedBy !== myName()) proclaim('Chaos Is Loose');
    })
    .on('postgres_changes', { event:'*', schema:'public', table:'hide_seek' }, function(p){
      var was = shared.hideSeek.active;
      shared.hideSeek = { active:!!p.new.active, soughtId:p.new.sought_member_id, mode:p.new.mode || 'close', startedBy:p.new.started_by, startedAt:p.new.started_at };
      cacheSave(); reflectLantern(); geoSync();
      if (shared.hideSeek.active && !was){ proclaim('The Hunt Is On'); playDrums(); }
      if (!shared.hideSeek.active && was){ positions = {}; mapMode = false; destroyHuntMap(); proclaim('The Lantern Is Doused'); }
      renderHuntIfOpen();
    })
    .on('postgres_changes', { event:'*', schema:'public', table:'hs_positions' }, function(p){
      if (p.new && p.new.member_id) positions[p.new.member_id] = p.new;
      checkSqueak();
      renderHuntIfOpen();
    })
    .on('postgres_changes', { event:'*', schema:'public', table:'horizon' }, function(){ fetchHorizon().then(function(){ cacheSave(); reflectScene(); }); })
    .on('postgres_changes', { event:'*', schema:'public', table:'ideas' }, function(){ fetchIdeas().then(cacheSave); })
    .on('postgres_changes', { event:'*', schema:'public', table:'adventures' }, function(){ fetchAdventures().then(cacheSave); })
    .on('postgres_changes', { event:'*', schema:'public', table:'chronicle' }, function(){ fetchChronicle().then(cacheSave); })
    .on('postgres_changes', { event:'*', schema:'public', table:'shanty_lines' }, function(){ fetchShanty().then(cacheSave); })
    .on('postgres_changes', { event:'*', schema:'public', table:'treasures' }, function(){
      fetchTreasures().then(function(){
        cacheSave(); reflectScene();
        var v = $('vChest'); if (v && v.classList.contains('open')) openChest();
      });
    })
    .subscribe();
}
async function connect(){
  if (!window.supabase){ throw new Error('Supabase library did not load'); }
  sb = window.supabase.createClient(SUPA_URL, SUPA_KEY);
  await ensureAuth();
  await fetchRoster();
  var known = await whoAmI();
  online = true;
  if (!known){ firstRun(); return; }
  applyTime();
  await refreshShared();
  subscribe();
  migrateLocalTreasures();
}
function offlineMode(){
  online = false;
  applyTime();
  reflectScene(); reflectLantern();
  toast('The island is beyond the reef. Reconnect to sail with the crew.');
}

/* ================= FIRST RUN (crew code + claim) ================= */
function firstRun(){
  var fr = $('firstRun'); fr.classList.add('open');
  $('frLead').style.display = ''; $('frCode').style.display = ''; $('frCrew').style.display = 'none'; $('frMotif').style.display = 'none';
  $('codeGo').onclick = function(){
    var code = $('codeIn').value.trim();
    if (!code) return;
    $('codeErr').textContent = '';
    $('frLead').textContent = 'Who steps ashore?';
    $('frCode').style.display = 'none';
    var wrap = $('frCrew'); wrap.style.display = ''; wrap.innerHTML = '';
    members.forEach(function(m){
      var btn = document.createElement('button');
      btn.className = 'crewBtn';
      btn.innerHTML = esc(m.name) + '<small>' + esc(m.role) + '</small>';
      btn.onclick = async function(){
        var r = await sb.rpc('join_crew', { code:code, member:m.id });
        if (r.error || r.data !== true){
          $('frLead').textContent = 'Speak the crew code.';
          $('frLead').style.display = '';
          $('frCode').style.display = ''; wrap.style.display = 'none';
          $('codeErr').textContent = 'The island does not answer to that knock. Try again.';
          return;
        }
        me = { id:m.id, name:m.name, role:m.role };
        local.memberName = m.name; saveLocal();
        wrap.style.display = 'none'; $('frLead').style.display = 'none';
        $('frMotif').style.display = 'block';
      };
      wrap.appendChild(btn);
    });
  };
  $('frHoist').onclick = async function(){
    fr.classList.remove('open');
    applyTime();
    await refreshShared();
    subscribe();
    migrateLocalTreasures();
  };
}

/* ================= ADVENTURE BOARD ================= */
async function raiseColours(title, when){
  if (shared.flag.raised) return;
  shared.flag = { raised:true, adventure:title, when:when || '', raisedBy:myName(), joining:[myName()] };
  reflectScene(); closeAll(); proclaim('The Colours Are Raised'); boardPop(); playDrums();
  if (!online) return toast('Raised here only. The crew will see it when the island reconnects.');
  await sb.rpc('reset_chaos');
  var r = await sb.from('flag').update({
    raised:true, adventure:title, when_label:when || '', raised_by:myName(),
    joining:[myName()], raised_at:new Date().toISOString(), updated_at:new Date().toISOString()
  }).eq('id', 1);
  if (r.error) toast('The wind dropped: ' + r.error.message);
  else drumsBeat('colours', title);
}
function horizonHtml(){
  if (!shared.horizon.length) return '';
  var h = '<div class="cat">On the horizon</div>';
  shared.horizon.forEach(function(hz, i){
    h += '<div class="advCard"><b style="font-size:15px;">' + esc(hz.title) + '</b>' +
      (hz.when ? ' <span style="font-size:13px; color:#7a5a32;">&middot; ' + esc(hz.when) + '</span>' : '') +
      '<br><span style="font-size:12px; color:#8a765a; font-style:italic;">charted by ' + esc(hz.chartedBy) + '</span><br>' +
      (shared.flag.raised ? '' : '<button class="wbtn hzHoist" data-i="' + i + '" style="margin-top:8px; font-size:13px;">Hoist the Colours</button>') +
      '<button class="wbtn ghost hzDrop" data-i="' + i + '" style="margin-top:8px; font-size:13px;">Let it drift</button></div>';
  });
  return h;
}
function wireHorizon(scope){
  scope.querySelectorAll('.hzHoist').forEach(function(el){
    el.onclick = async function(){
      var h = shared.horizon[parseInt(el.getAttribute('data-i'), 10)];
      if (!h) return;
      if (online && h.id) await sb.from('horizon').delete().eq('id', h.id);
      shared.horizon = shared.horizon.filter(function(x){ return x !== h; });
      raiseColours(h.title, h.when);
    };
  });
  scope.querySelectorAll('.hzDrop').forEach(function(el){
    el.onclick = async function(){
      var h = shared.horizon[parseInt(el.getAttribute('data-i'), 10)];
      if (!h) return;
      shared.horizon = shared.horizon.filter(function(x){ return x !== h; });
      if (online && h.id) await sb.from('horizon').delete().eq('id', h.id);
      reflectScene(); openBoard();
    };
  });
}
async function chartHorizon(title, when){
  shared.horizon.push({ title:title, when:when || '', chartedBy:myName() });
  reflectScene();
  if (online){
    var r = await sb.from('horizon').insert({ title:title, when_label:when || '', charted_by:myName() });
    if (r.error) toast('The chart smudged: ' + r.error.message); else fetchHorizon();
  }
}
function openBoard(){
  var b = body('vBoard'); b.innerHTML = '';
  var html = '';
  if (shared.flag.raised){
    var joined = shared.flag.joining.indexOf(myName()) !== -1;
    html += catBanner(shared.flag.adventure) +
      '<div class="advCard"><b>' + esc(shared.flag.raisedBy) + ' has RAISED THE COLOURS!</b><br>' +
      esc(shared.flag.adventure) + (shared.flag.when ? '<br>' + esc(shared.flag.when) : '') +
      '<br><span style="font-size:13px;color:#7a5a32;">' + shared.flag.joining.length + ' joining: ' + esc(shared.flag.joining.join(', ')) + '</span></div>' +
      '<button class="wbtn" id="bJoin"' + (joined ? ' disabled' : '') + '>' + (joined ? 'You are aboard' : "I'm going, is anyone coming? Count me in!") + '</button>' +
      '<div class="notice">When the crew returns, strike the colours at the flagpole and log the story. Fancy something after? Chart it on the horizon below.</div>';
  } else if (!shared.horizon.length){
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
    (shared.flag.raised ? '' : '<button class="wbtn" id="rfGo" style="margin-top:10px;">Raise the Colours</button>') +
    '<button class="wbtn ghost" id="rfChart" style="margin-top:10px;">Chart it on the horizon</button>' +
    '<button class="wbtn ghost" id="rfNo">Not this one</button></div>';
  b.innerHTML = html;
  if ($('bJoin')) $('bJoin').onclick = async function(){
    if (shared.flag.joining.indexOf(myName()) === -1){
      shared.flag.joining.push(myName());
      reflectScene();
      if (online) await sb.from('flag').update({ joining:shared.flag.joining, updated_at:new Date().toISOString() }).eq('id', 1);
    }
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
    chartHorizon(chosen, whenPick);
    openBoard();
  };
  $('rfNo').onclick = function(){ chosen = null; $('raiseForm').style.display = 'none'; };
  openV('vBoard');
}

/* ================= FLAG ================= */
function openFlag(){
  var b = body('vFlag'); b.innerHTML = '';
  if (!shared.flag.raised){
    b.innerHTML = '<div class="notice">The colours are stowed. The Adventure Board is where they rise.</div>' +
      '<button class="wbtn" id="fToBoard">To the Board</button>';
    $('fToBoard').onclick = function(){ closeV('vFlag'); openBoard(); };
  } else {
    b.innerHTML = catBanner(shared.flag.adventure) +
      '<div class="advCard"><b>' + esc(shared.flag.adventure) + '</b>' + (shared.flag.when ? '<br>' + esc(shared.flag.when) : '') +
      '<br><span style="font-size:13px;color:#7a5a32;">Raised by ' + esc(shared.flag.raisedBy) + ' &middot; crew aboard: ' + esc(shared.flag.joining.join(', ')) + '</span></div>' +
      '<button class="wbtn" id="fStrike">Strike the Colours (we are home)</button>' +
      '<div id="logForm" style="display:none; margin-top:14px;">' +
        '<div class="cat">Log the adventure</div>' +
        '<p style="font-size:14px; margin:8px 0;">Who won the day? The winner writes the next line of the shanty.</p>' +
        '<div id="winnerRow"></div>' +
        '<input type="text" id="shantyLine" class="scrollInput" placeholder="The next line of our shanty (winner’s words)&hellip;">' +
        (shared.chaos.deployed ?
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
        members.forEach(function(c){
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
      $('fLog').onclick = async function(){
        var line = $('shantyLine').value.trim();
        var note = $('chronNote').value.trim();
        var hadChaos = shared.chaos.deployed;
        var adv = { title:shared.flag.adventure, when:shared.flag.when, joining:shared.flag.joining,
                    raisedBy:shared.flag.raisedBy, chaos:hadChaos, chaosChampion:champ || null };
        shared.flag = { raised:false, adventure:null, when:null, raisedBy:null, joining:[] };
        shared.chaos = { deployed:false, deployedBy:null };
        reflectScene(); proclaim('The Colours Are Struck');
        var nxt = shared.horizon[0];
        b.innerHTML = '<div class="notice">The colours are struck, the story is kept. ' +
          (line ? 'The shanty grows a line longer. ' : 'The shanty waits for a braver day. ') +
          (hadChaos && champ ? esc(champ) + ' is crowned Chaos Champion.' : '') + '</div>' +
          (nxt ? '<div class="advCard"><b>' + esc(nxt.title) + '</b>' + (nxt.when ? ' <span style="font-size:13px; color:#7a5a32;">&middot; ' + esc(nxt.when) + '</span>' : '') +
                 '<br><span style="font-size:13px; font-style:italic; color:#8a765a;">waits on the horizon.</span></div>' +
                 '<button class="wbtn" id="fNext">Hoist the Colours for it</button>' : '');
        if (nxt) $('fNext').onclick = async function(){
          if (online && nxt.id) await sb.from('horizon').delete().eq('id', nxt.id);
          shared.horizon = shared.horizon.filter(function(x){ return x !== nxt; });
          raiseColours(nxt.title, nxt.when);
        };
        if (!online) return toast('Logged here only. It sails to the crew when the island reconnects.');
        var jobs = [
          sb.from('adventures').insert({ title:adv.title, when_label:adv.when || '', raised_by:adv.raisedBy,
            joining:adv.joining, chaos:adv.chaos, chaos_champion:adv.chaosChampion }),
          sb.from('flag').update({ raised:false, adventure:null, when_label:null, raised_by:null, joining:[], raised_at:null, updated_at:new Date().toISOString() }).eq('id', 1),
          sb.rpc('reset_chaos')
        ];
        if (line) jobs.push(sb.from('shanty_lines').insert({ line:line, author:winner || myName() }));
        if (note) jobs.push(sb.from('chronicle').insert({ entry:note, author:myName() }));
        var results = await Promise.all(jobs);
        var bad = results.filter(function(r){ return r.error; })[0];
        if (bad) toast('Part of the log blew away: ' + bad.error.message);
      };
    };
  }
  openV('vFlag');
}

/* ================= TREASURE CHEST (the family vault) ================= */
var pendingPhoto = null;
function dataURLtoBlob(d){
  var bin = atob(d.split(',')[1]);
  var arr = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type:'image/jpeg' });
}
function openChest(){
  var b = body('vChest');
  var html = '<button class="wbtn" id="tAdd">Add a treasure</button>' +
    '<div id="tForm" style="display:none;">' +
      '<div class="devWrap"><div class="devPol"><img id="devImg" alt="">' +
      '<input type="text" id="tCap" placeholder="what is this memory?"></div></div>' +
      '<div style="text-align:center;"><button class="wbtn" id="tSave">Into the chest</button></div>' +
    '</div><div id="tGrid"></div>';
  if (!shared.treasures.length) html += '<div class="notice">The chest waits for its first memory. Go and make one.</div>';
  html += '<p class="sub" style="margin-top:14px;">The family vault: every treasure here is shared with the whole crew, kept safe for generations.</p>';
  b.innerHTML = html;
  var grid = $('tGrid');
  shared.treasures.slice().reverse().forEach(function(t){
    if (!t.url) return;
    var d = document.createElement('div'); d.className = 'pol';
    d.innerHTML = '<img alt=""><div class="cap"></div><div class="by"></div>';
    d.querySelector('img').src = t.url;
    d.querySelector('.cap').textContent = t.caption || '';
    d.querySelector('.by').textContent = t.addedBy + ' · ' + new Date(t.addedAt).toLocaleDateString();
    grid.appendChild(d);
  });
  pendingPhoto = null;
  $('tAdd').onclick = function(){
    if (!online) return toast('The chest needs the island connected to keep treasures safe.');
    $('photoIn').value = ''; $('photoIn').click();
  };
  $('tSave').onclick = async function(){
    if (!pendingPhoto) return;
    if (!online) return toast('The chest needs the island connected to keep treasures safe.');
    var cap = $('tCap').value.trim();
    $('tSave').disabled = true; $('tSave').textContent = 'Sailing to the vault…';
    var path = Date.now() + '_' + (me.id || 'crew') + '.jpg';
    var up = await sb.storage.from('treasures').upload(path, dataURLtoBlob(pendingPhoto), { contentType:'image/jpeg' });
    if (up.error){ toast('The chest lid jammed: ' + up.error.message); $('tSave').disabled = false; $('tSave').textContent = 'Into the chest'; return; }
    var ins = await sb.from('treasures').insert({ photo_path:path, caption:cap, added_by:myName() });
    if (ins.error) toast('The label smudged: ' + ins.error.message);
    await fetchTreasures();
    cacheSave(); reflectScene(); openChest();
  };
  openV('vChest');
}
async function migrateLocalTreasures(){
  if (!online || local.migrated || !local.treasures.length) return;
  var mine = local.treasures.slice();
  for (var i = 0; i < mine.length; i++){
    var t = mine[i];
    try {
      var path = 'mig_' + Date.now() + '_' + i + '.jpg';
      var up = await sb.storage.from('treasures').upload(path, dataURLtoBlob(t.imageRef), { contentType:'image/jpeg' });
      if (up.error) continue;
      await sb.from('treasures').insert({ photo_path:path, caption:t.caption || '', added_by:t.addedBy || myName() });
    } catch(e){}
  }
  local.migrated = true; local.treasures = []; saveLocal();
  await fetchTreasures();
  cacheSave(); reflectScene();
  toast('Your treasures sailed to the family vault.');
}
async function exportChest(){
  if (!shared.treasures.length && !shared.chronicle.length && !shared.shanty.length) return toast('The chest is empty; nothing to export yet.');
  toast('Gathering the treasures for the archive…');
  var items = [];
  for (var i = 0; i < shared.treasures.length; i++){
    var t = shared.treasures[i], b64 = '';
    try {
      var resp = await fetch(t.url);
      var blob = await resp.blob();
      b64 = await new Promise(function(res){ var rd = new FileReader(); rd.onload = function(){ res(rd.result); }; rd.readAsDataURL(blob); });
    } catch(e){}
    items.push({ img:b64, caption:t.caption, by:t.addedBy, at:t.addedAt });
  }
  var h = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>The Chest of Ansla Island</title>' +
    '<style>body{font-family:Palatino,Georgia,serif;background:#f4ebd2;color:#2f2213;max-width:900px;margin:0 auto;padding:30px;}' +
    'h1,h2{letter-spacing:.1em;} .pol{display:inline-block;background:#fff;padding:10px 10px 16px;margin:10px;box-shadow:0 4px 12px rgba(0,0,0,.25);width:220px;vertical-align:top;}' +
    '.pol img{width:100%;} .cap{font-size:13px;margin-top:6px;} .by{font-size:11px;color:#8a765a;font-style:italic;}' +
    '.entry{border-left:3px solid #b99a68;padding:8px 14px;margin:10px 0;} .shanty{font-style:italic;font-size:17px;margin:6px 0;}</style></head><body>' +
    '<h1>Escape from Ansla Island</h1><p><i>The family archive, exported ' + new Date().toLocaleDateString() + '. Memories are our real treasure.</i></p><h2>The Treasure Chest</h2>';
  items.forEach(function(it){
    h += '<div class="pol">' + (it.img ? '<img src="' + it.img + '">' : '') +
      '<div class="cap">' + esc(it.caption || '') + '</div><div class="by">' + esc(it.by || '') + ' · ' + new Date(it.at).toLocaleDateString() + '</div></div>';
  });
  h += '<h2>The Chronicle</h2>';
  shared.chronicle.forEach(function(c){
    h += '<div class="entry">' + esc(c.entry) + '<div class="by">' + esc(c.author) + ' · ' + new Date(c.date).toLocaleDateString() + '</div></div>';
  });
  h += '<h2>Adventures</h2>';
  shared.adventures.forEach(function(a){
    h += '<div class="entry">' + esc(a.title) + (a.chaosChampion ? ' · Chaos Champion: ' + esc(a.chaosChampion) : '') +
      '<div class="by">' + new Date(a.completedAt).toLocaleDateString() + '</div></div>';
  });
  h += '<h2>The Shanty of Ansla</h2>';
  shared.shanty.forEach(function(s){ h += '<div class="shanty">&ldquo;' + esc(s.line) + '&rdquo; <span class="by">' + esc(s.author) + '</span></div>'; });
  h += '<p><i>Family is our crew. Adventure is our way.</i></p></body></html>';
  var blob2 = new Blob([h], { type:'text/html' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob2);
  a.download = 'ansla-island-archive-' + new Date().toISOString().slice(0, 10) + '.html';
  a.click();
  toast('The archive is in your downloads. Keep it somewhere that outlives us all.');
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

/* ================= ISLAND STONE (the senses, Voyage IV) ================= */
function moonPhase(d){
  /* synodic month from a known new moon (2000-01-06 18:14 UTC) */
  var synodic = 29.53058867;
  var days = (d.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
  var phase = ((days % synodic) + synodic) % synodic / synodic; /* 0 new → .5 full */
  var name;
  if (phase < 0.03 || phase > 0.97) name = 'a new moon';
  else if (phase < 0.22) name = 'a waxing crescent';
  else if (phase < 0.28) name = 'a first quarter moon';
  else if (phase < 0.47) name = 'a waxing moon';
  else if (phase < 0.53) name = 'a full moon';
  else if (phase < 0.72) name = 'a waning moon';
  else if (phase < 0.78) name = 'a last quarter moon';
  else name = 'a waning crescent';
  return { phase:phase, name:name };
}
function activeShower(d){
  var mmdd = ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  for (var i = 0; i < METEOR_SHOWERS.length; i++){
    var s = METEOR_SHOWERS[i];
    if (mmdd >= s.from && mmdd <= s.to) return s;
  }
  return null;
}
function fetchJson(url, ms){
  return new Promise(function(resolve){
    var ctl = new AbortController();
    var to = setTimeout(function(){ ctl.abort(); resolve(null); }, ms || 6000);
    fetch(url, { signal:ctl.signal }).then(function(r){ return r.json(); })
      .then(function(j){ clearTimeout(to); resolve(j); })
      .catch(function(){ clearTimeout(to); resolve(null); });
  });
}
async function stoneCoords(){
  try {
    if (navigator.permissions && navigator.geolocation && window.isSecureContext){
      var st = await navigator.permissions.query({ name:'geolocation' });
      if (st.state === 'granted'){
        var pos = await new Promise(function(res){
          navigator.geolocation.getCurrentPosition(function(p){ res(p); }, function(){ res(null); }, { timeout:3000, maximumAge:600000 });
        });
        if (pos) return { lat:pos.coords.latitude, lng:pos.coords.longitude };
      }
    }
  } catch(e){}
  return HOME_SHORE;
}
var stoneCache = null, stoneCacheAt = 0;
async function stoneSenses(){
  if (stoneCache && Date.now() - stoneCacheAt < 15 * 60000) return stoneCache;
  var c = await stoneCoords();
  var wUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lng +
    '&current=temperature_2m,weather_code,wind_speed_10m,uv_index&daily=weather_code,uv_index_max,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=2';
  var mUrl = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + c.lat + '&longitude=' + c.lng +
    '&hourly=sea_level_height_msl&timezone=auto&forecast_days=2';
  var res = await Promise.all([fetchJson(wUrl), fetchJson(mUrl)]);
  var senses = { weather:res[0], marine:res[1] };
  if (senses.weather){ stoneCache = senses; stoneCacheAt = Date.now(); }
  return senses;
}
function nextTideTurn(marine){
  try {
    var hs = marine.hourly, now = new Date();
    var vals = hs.sea_level_height_msl, times = hs.time;
    var startIdx = 0;
    for (var i = 0; i < times.length; i++){ if (new Date(times[i]) > now){ startIdx = Math.max(1, i); break; } }
    for (var j = startIdx; j < vals.length - 1; j++){
      if (vals[j] > vals[j-1] && vals[j] > vals[j+1]) return { kind:'high', at:new Date(times[j]) };
      if (vals[j] < vals[j-1] && vals[j] < vals[j+1]) return { kind:'low', at:new Date(times[j]) };
    }
  } catch(e){}
  return null;
}
function interpretStone(senses){
  var lines = [], sugg = [], marg = [];
  var now = new Date(), t = timeState(), moon = moonPhase(now), shower = activeShower(now);
  var month = now.getMonth() + 1;
  var w = senses.weather && senses.weather.current;
  var daily = senses.weather && senses.weather.daily;
  var code = w ? w.weather_code : null;
  var codeTomorrow = daily && daily.weather_code ? daily.weather_code[1] : null;
  var uv = w ? Math.round(w.uv_index) : null;
  var uvMax = daily && daily.uv_index_max ? Math.round(daily.uv_index_max[0]) : null;
  var wind = w ? Math.round(w.wind_speed_10m) : null;
  var rainProb = daily && daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : null;
  var thunderNow = code >= 95, thunderSoon = codeTomorrow >= 95 || (daily && daily.weather_code && daily.weather_code[0] >= 95);
  var rainingNow = code >= 51 && code <= 82 && !thunderNow;

  if (thunderNow){ lines.push('Thunder walks the land RIGHT NOW. This crew knows what that means.'); sugg.push(['Storm watching', 10]); }
  else if (thunderSoon){ lines.push('The Stone feels thunder coming. The sky is owing us a show.'); sugg.push(['Storm watching', 8]); }
  if (rainingNow){ lines.push('The rain means to stay a while. Let it. The table is dry and the kettle works.'); sugg.push(['Board games', 6], ['Movie night', 6]); }
  if (!thunderNow && !rainingNow && uv !== null && uv >= 9 && (t === 'day')){ lines.push('The sun rules today with a heavy hand. Choose water, shade, or rollercoasters.'); sugg.push(['River swimming', 6], ['Dreamworld', 5]); }
  if (month >= 6 && month <= 11){ lines.push('The whales are passing the home shore. They only knock once a year.'); sugg.push(['Whale watching', 5]); }
  if (shower){ lines.push('Stones fall from heaven this week: ' + shower.name + ' are flying.'); sugg.push(['Astrophotography', 7], ['Stargazing', 6]); }
  if (t === 'night' || t === 'dusk'){
    if (moon.phase < 0.1 || moon.phase > 0.92){ lines.push('The moon hides tonight; the stars come out to gossip.'); sugg.push(['Stargazing', 6], ['Astrophotography', 5]); }
    if (moon.phase > 0.44 && moon.phase < 0.56){ lines.push('The moon is full and the paths are silver.'); sugg.push(['Moonlit walk', 7]); }
  }
  if (!thunderNow && !rainingNow && wind !== null && wind <= 12 && (t === 'dawn' || t === 'day')){ lines.push('The water lies like glass. It will not wait all day.'); sugg.push(['SUP', 5], ['Kayaking', 5], ['The tinny', 4]); }
  if (wind !== null && wind >= 30){ lines.push('The wind has opinions today. Keep the small boats sleeping.'); }
  var tide = senses.marine ? nextTideTurn(senses.marine) : null;
  if (tide && tide.kind === 'low' && (t === 'dawn' || t === 'day')){ sugg.push(['Fishing', 4], ['Beach walk', 3]); }

  if (!lines.length){
    var seeded = STONE_LINES[t];
    lines.push(seeded[Math.floor(Math.random() * seeded.length)]);
  }
  if (!sugg.length){
    var pool = STONE_SUGGEST[t];
    sugg.push([pool[Math.floor(Math.random() * pool.length)], 1]);
  }
  sugg.sort(function(a, b){ return b[1] - a[1]; });

  if (w) marg.push(Math.round(w.temperature_2m) + '°');
  if (uvMax !== null) marg.push('UV ' + uvMax);
  if (wind !== null) marg.push('wind ' + wind);
  if (rainProb !== null) marg.push('rain ' + rainProb + '%');
  if (tide) marg.push(tide.kind + ' tide ' + tide.at.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' }));
  marg.push(moon.name);

  return { lines:lines.slice(0, 3), suggestion:sugg[0][0], marginalia:marg.join(' · ') };
}
async function openStone(){
  var b = body('vStone');
  b.innerHTML = '<div class="notice" style="font-size:16px;">The runes wake and read the world&hellip;</div>';
  openV('vStone');
  var reading = null;
  if (online && navigator.onLine !== false){
    try { reading = interpretStone(await stoneSenses()); } catch(e){ reading = null; }
  }
  if (!reading){
    var t = timeState();
    reading = {
      lines:[STONE_LINES[t][Math.floor(Math.random() * STONE_LINES[t].length)]],
      suggestion:STONE_SUGGEST[t][Math.floor(Math.random() * STONE_SUGGEST[t].length)],
      marginalia:'the Stone reads from memory; the sky is out of reach'
    };
  }
  var sugg = reading.suggestion;
  var html = '';
  reading.lines.forEach(function(l){ html += '<div class="notice" style="font-size:16px;">' + esc(l) + '</div>'; });
  html += '<p style="margin:14px 0 6px;">The runes settle on a thought:</p>' +
    '<div class="advCard"><b>' + esc(sugg) + '</b></div>' +
    (shared.flag.raised ? '<button class="wbtn" id="sChart">Chart it on the horizon</button>'
                        : '<button class="wbtn" id="sRaise">Raise the Colours for it</button>') +
    '<p class="sub" style="margin-top:16px; letter-spacing:.06em;">' + esc(reading.marginalia) + '</p>';
  b.innerHTML = html;
  if ($('sRaise')) $('sRaise').onclick = function(){ raiseColours(sugg, ''); };
  if ($('sChart')) $('sChart').onclick = function(){ chartHorizon(sugg, ''); closeV('vStone'); openBoard(); };
}

/* ================= THE REAL COMPASS ================= */
var deviceHeading = null, headingActive = false;
function headingSupported(){ return typeof DeviceOrientationEvent !== 'undefined'; }
function headingNeedsPermission(){ return headingSupported() && typeof DeviceOrientationEvent.requestPermission === 'function'; }
function onOrient(e){
  var h = null;
  if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
  else if (typeof e.alpha === 'number' && (e.absolute === true || e.type === 'deviceorientationabsolute')) h = (360 - e.alpha) % 360;
  if (h !== null){ deviceHeading = h; updateNeedles(); }
}
function startHeading(){
  if (headingActive || !headingSupported()) return;
  headingActive = true;
  window.addEventListener('deviceorientationabsolute', onOrient, true);
  window.addEventListener('deviceorientation', onOrient, true);
}
async function awakenNeedle(){
  if (headingNeedsPermission()){
    try {
      var res = await DeviceOrientationEvent.requestPermission();
      if (res !== 'granted') return toast('The needle stays asleep without your blessing.');
    } catch(e){ return toast('The needle stays asleep on this shore.'); }
  }
  startHeading();
  openCompassRefresh();
  renderHuntIfOpen();
}
function updateNeedles(){
  document.querySelectorAll('.liveNeedle').forEach(function(n){
    var brg = parseFloat(n.getAttribute('data-bearing')) || 0;
    var rot = deviceHeading === null ? brg : (brg - deviceHeading + 360) % 360;
    n.setAttribute('transform', 'rotate(' + Math.round(rot) + ' 60 60)');
  });
  var hd = $('cHead');
  if (hd && deviceHeading !== null) hd.textContent = Math.round(deviceHeading) + '° · facing ' + compassWord(deviceHeading);
}
function roseSvg(bearing){
  return '<div id="roseWrap"><svg width="170" height="170" viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="56" fill="#1e2b45" stroke="#c9a86a" stroke-width="2.5"/>' +
    '<circle cx="60" cy="60" r="44" fill="none" stroke="#8fa3c9" stroke-width=".7" opacity=".6"/>' +
    '<text x="60" y="16" fill="#e8d9b5" font-size="11" text-anchor="middle">N</text>' +
    '<text x="60" y="112" fill="#8fa3c9" font-size="10" text-anchor="middle">S</text>' +
    '<text x="109" y="64" fill="#8fa3c9" font-size="10" text-anchor="middle">E</text>' +
    '<text x="11" y="64" fill="#8fa3c9" font-size="10" text-anchor="middle">W</text>' +
    '<polygon class="liveNeedle" data-bearing="' + Math.round(bearing) + '" points="60,22 65,60 60,74 55,60" fill="#e05a4e" stroke="#e8d9b5" stroke-width=".8" transform="rotate(' + Math.round(bearing) + ' 60 60)"/>' +
    '</svg></div>';
}
function openCompassRefresh(){
  var v = $('vCompass'); if (v && v.classList.contains('open')) openCompass();
}
function openCompass(){
  var needP = headingNeedsPermission() && !headingActive;
  body('vCompass').innerHTML =
    roseSvg(0) +
    '<p id="cHead" style="text-align:center; font-size:16.5px; min-height:24px;">' +
    (deviceHeading !== null ? '' : 'The needle sleeps.') + '</p>' +
    (needP ? '<div style="text-align:center;"><button class="wbtn" id="cAwaken">Awaken the needle</button></div>' : '') +
    (!headingSupported() ? '<p class="sub" style="text-align:center;">This shore has no sense of direction. Carry the island in your pocket instead.</p>' : '') +
    '<p class="sub" style="text-align:center; margin-top:10px;">A true compass. Carry it on adventures; it always knows north, and during a hunt it knows more.</p>';
  if ($('cAwaken')) $('cAwaken').onclick = awakenNeedle;
  if (!headingNeedsPermission()) startHeading();
  updateNeedles();
  openV('vCompass');
}

/* ================= CHRONICLE ================= */
function openChron(){
  var b = body('vChron');
  var html = '<textarea id="chNew" class="journal" placeholder="Add to the Chronicle, ' + esc(myName()) + '…"></textarea>' +
    '<button class="wbtn" id="chSave">Record it</button>';
  html += '<div class="cat">The tales</div>';
  if (!shared.chronicle.length && !shared.adventures.length) html += '<div class="notice">The Chronicle is unwritten. The first tale is always the hardest to start and the best to remember.</div>';
  shared.chronicle.slice().reverse().forEach(function(c){
    html += '<div class="advCard"><span class="entryHand">' + esc(c.entry) + '</span><br>' +
      '<span style="font-size:12px; color:#8a765a; font-style:italic;">' + esc(c.author) + ' · ' + new Date(c.date).toLocaleDateString() + '</span></div>';
  });
  if (shared.adventures.length){
    html += '<div class="cat">Adventures completed: ' + shared.adventures.length + '</div>';
    shared.adventures.slice().reverse().forEach(function(a){
      html += '<div style="font-size:13.5px; margin:4px 0;">&#9873; ' + esc(a.title) + ' · ' + new Date(a.completedAt).toLocaleDateString() + '</div>';
    });
  }
  var champs = shared.adventures.filter(function(a){ return a.chaosChampion; });
  if (champs.length){
    html += '<div class="cat">Chaos Champions</div>';
    champs.slice().reverse().forEach(function(cc){
      html += '<div style="font-size:13.5px; margin:4px 0;">&#9733; ' + esc(cc.chaosChampion) + ' &middot; ' + esc(cc.title) + ' &middot; ' + new Date(cc.completedAt).toLocaleDateString() + '</div>';
    });
  }
  html += '<div class="cat">The Shanty of Ansla</div>';
  if (!shared.shanty.length){
    html += '<div class="notice">The song awaits its first line. Win the day on an adventure and write it.</div>';
  } else {
    shared.shanty.forEach(function(s){
      html += '<div style="font-style:italic; margin:5px 0; font-size:15px;">&ldquo;' + esc(s.line) + '&rdquo; <span style="font-size:11.5px; color:#8a765a;">' + esc(s.author) + '</span></div>';
    });
  }
  b.innerHTML = html;
  $('chSave').onclick = async function(){
    var v = $('chNew').value.trim(); if (!v) return;
    shared.chronicle.push({ entry:v, author:myName(), date:new Date().toISOString() });
    if (online){
      var r = await sb.from('chronicle').insert({ entry:v, author:myName() });
      if (r.error) toast('The ink ran: ' + r.error.message);
    }
    openChron();
  };
  openV('vChron');
}

/* ================= CHAOS ================= */
function allAboard(){
  if (!shared.flag.raised) return false;
  return members.every(function(c){ return shared.flag.joining.indexOf(c.name) !== -1; });
}
async function openChaos(){
  var b = body('vChaos');
  if (!shared.flag.raised){
    b.innerHTML = '<div style="text-align:center; padding:14px 4px;"><p style="font-size:17px; font-style:italic;">' +
      esc(CHAOS_TEASES[Math.floor(Math.random() * CHAOS_TEASES.length)]) + '</p>' +
      '<p style="font-size:13px; color:#8f7cad; margin-top:14px;">It wakes only when the colours fly and every crew member is aboard.</p></div>';
  } else if (!shared.chaos.deployed && !allAboard()){
    var missing = members.filter(function(c){ return shared.flag.joining.indexOf(c.name) === -1; })
                         .map(function(c){ return c.name; }).join(' and ');
    b.innerHTML = '<div style="text-align:center; padding:14px 4px;"><p style="font-size:17px; font-style:italic;">The crystal stirs&hellip; but waits for the whole crew.</p>' +
      '<p style="font-size:13.5px; color:#8f7cad; margin-top:12px;">' + esc(missing) + ' ' + (missing.indexOf(' and ') !== -1 ? 'have' : 'has') + ' not yet joined the adventure.</p></div>';
  } else if (!shared.chaos.deployed){
    b.innerHTML = '<div style="text-align:center; padding:10px 4px;">' +
      '<p style="font-size:18px; letter-spacing:.08em;">THE CRYSTAL IS LIVE.</p>' +
      '<p style="font-size:14px; font-style:italic; color:#8f7cad; margin:12px 0 18px;">All crew aboard. One touch, and every member of this crew receives a secret mission. Evidence goes in the Treasure Chest. The crew votes a Chaos Champion when the colours are struck.</p>' +
      '<button class="wbtn" id="xGo" style="background:#4a2a72; border-color:#2a1444;">Unleash the chaos</button></div>';
    $('xGo').onclick = async function(){
      if (!online) return toast('Chaos needs the whole island connected.');
      var r = await sb.rpc('deploy_chaos');
      if (r.error || r.data !== true) return toast('The crystal resisted. Try again.');
      shared.chaos = { deployed:true, deployedBy:myName() };
      reflectScene(); openChaos();
    };
  } else {
    var mine = '';
    if (online){
      var r = await sb.rpc('my_mission');
      mine = r.data || '';
    }
    b.innerHTML = '<div style="padding:6px 2px;">' +
      '<p style="font-size:12.5px; letter-spacing:.14em; color:#8f7cad; text-transform:uppercase;">Chaos was unleashed by ' + esc(shared.chaos.deployedBy || 'someone') + '</p>' +
      '<p style="margin:14px 0 6px; font-size:15px;">Your secret mission, ' + esc(myName()) + '. Yours alone. Tell no one:</p>' +
      '<div style="border:1px solid #4a3468; border-radius:6px; background:rgba(120,60,200,.10); padding:14px 16px; font-size:16px; font-style:italic;">' +
      esc(mine || 'The crystal is keeping your mission from prying eyes. Reconnect to receive it.') + '</div>' +
      '<p style="font-size:13px; color:#8f7cad; margin-top:14px;">Evidence in the Treasure Chest. The crew votes the Chaos Champion when the colours are struck.</p></div>';
  }
  openV('vChaos');
}

/* ================= PLANT AN IDEA ================= */
function openIdeas(){
  var b = body('vIdeas');
  var html = '<input type="text" id="idNew" placeholder="Poker night? Sunday BBQ? Plant it&hellip;">' +
    '<button class="wbtn" id="idPlant">Plant it</button>';
  if (!shared.ideas.length) html += '<div class="notice">Nothing planted yet. Ideas grow into adventures here.</div>';
  else html += '<div class="cat">Growing on the board</div>';
  shared.ideas.slice().reverse().forEach(function(idea, ri){
    var realIdx = shared.ideas.length - 1 - ri;
    html += '<div class="advCard"><b style="font-size:15px;">' + esc(idea.text) + '</b><br>' +
      '<span style="font-size:12px; color:#8a765a; font-style:italic;">planted by ' + esc(idea.plantedBy) + ' · ' + new Date(idea.plantedAt).toLocaleDateString() + '</span><br>' +
      '<button class="wbtn ghost idGrow" data-i="' + realIdx + '" style="margin-top:8px; font-size:13px;">' +
      (shared.flag.raised ? 'Chart it on the horizon' : 'Raise the Colours for it') + '</button>' +
      '</div>';
  });
  b.innerHTML = html;
  $('idPlant').onclick = async function(){
    var v = $('idNew').value.trim(); if (!v) return;
    shared.ideas.push({ text:v, plantedBy:myName(), plantedAt:new Date().toISOString() });
    if (online){
      var r = await sb.from('ideas').insert({ idea:v, planted_by:myName() });
      if (r.error) toast('The seed blew away: ' + r.error.message); else fetchIdeas();
    }
    openIdeas();
  };
  b.querySelectorAll('.idGrow').forEach(function(el){
    el.onclick = function(){
      var idea = shared.ideas[parseInt(el.getAttribute('data-i'), 10)];
      if (!idea) return;
      if (shared.flag.raised){ chartHorizon(idea.text, ''); openIdeas(); }
      else raiseColours(idea.text, '');
    };
  });
  openV('vIdeas');
}

/* ================= THE CALL (the drums) ================= */
function urlB64ToUint8Array(s){
  var pad = '='.repeat((4 - s.length % 4) % 4);
  var b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  var raw = atob(b64), arr = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
function drumsBeat(kind, what){
  if (!online || !sb) return;
  try { sb.functions.invoke('sound-the-drums', { body:{ kind:kind, by:myName(), what:what || '' } }).catch(function(){}); }
  catch(e){}
}
async function subscribeDrums(){
  try {
    if (!online) return toast('The drums need the island connected.');
    var reg = await navigator.serviceWorker.ready;
    var perm = await Notification.requestPermission();
    if (perm !== 'granted') return toast('The drums stay silent without your blessing.');
    var sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:urlB64ToUint8Array(VAPID_PUBLIC) });
    var j = sub.toJSON();
    var r = await sb.from('push_subscriptions').upsert(
      { member_id:me.id, endpoint:sub.endpoint, p256dh:j.keys.p256dh, auth:j.keys.auth }, { onConflict:'endpoint' });
    if (r.error) return toast('The drums missed a beat: ' + r.error.message);
    toast('The drums know you now, ' + myName() + '.');
    openCall();
  } catch(e){ toast('The drums stay silent on this shore.'); }
}
async function openCall(){
  var b = body('vCall');
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  var canPush = ('serviceWorker' in navigator) && ('PushManager' in window) && window.isSecureContext;
  var html = '';
  if (!canPush){
    html = '<div class="notice">The drums live on the deployed island (the https address). On this shore they can only be admired.</div>';
  } else if (isIOS && !standalone){
    html = '<div class="notice">On this phone, the drums only sound inside the installed island. Share &rarr; Add to Home Screen, open it from the icon, then return here.</div>';
  } else {
    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.getSubscription();
    if (sub && Notification.permission === 'granted'){
      html = '<div class="notice">The drums know you, ' + esc(myName()) + '. When the colours rise or a lantern is lit anywhere in the world, this device will hear it.</div>' +
        '<button class="wbtn ghost" id="drumRe">Teach them again</button>';
    } else {
      html = '<p style="font-size:15px; margin-bottom:10px;">The drums can learn to find you, wherever you roam. When the colours rise, they sound in your pocket.</p>' +
        '<button class="wbtn" id="drumGo">Teach the drums to find you</button>';
    }
  }
  b.innerHTML = html;
  if ($('drumGo')) $('drumGo').onclick = subscribeDrums;
  if ($('drumRe')) $('drumRe').onclick = subscribeDrums;
  openV('vCall');
}

/* ================= CREW ================= */
function openCrew(){
  var b = body('vCrew'); b.innerHTML = '';
  members.forEach(function(c){
    var d = document.createElement('button');
    d.className = 'crewBtn'; d.style.margin = '8px 0';
    d.innerHTML = esc(c.name) + (c.name === myName() ? ' &#10004;' : '') + '<small>' + esc(c.role) + '</small>';
    d.onclick = async function(){
      if (c.name === myName()) return;
      if (!online) return toast('Changing crew needs the island connected.');
      var r = await sb.rpc('join_crew', { code:'', member:c.id });
      if (r.error || r.data !== true){
        var code = prompt('The island asks for the crew code to change who you are:');
        if (!code) return;
        r = await sb.rpc('join_crew', { code:code, member:c.id });
        if (r.error || r.data !== true) return toast('The island does not answer to that knock.');
      }
      me = { id:c.id, name:c.name, role:c.role };
      local.memberName = c.name; saveLocal();
      applyTime(); openCrew();
    };
    b.appendChild(d);
  });
  var note = document.createElement('div'); note.className = 'notice'; note.textContent = FUTURE_CREW;
  b.appendChild(note);
  openV('vCrew');
}

/* ================= GIANT HIDE & SEEK ================= */
var geoWatchId = null, lastPub = 0;
function geoSync(){
  var participating = online && shared.hideSeek.active && me.id;
  if (participating && geoWatchId === null && navigator.geolocation && window.isSecureContext){
    geoWatchId = navigator.geolocation.watchPosition(function(pos){
      var now = Date.now();
      var interval = HUNT_PUBLISH_MS[shared.hideSeek.mode] || 10000;
      if (now - lastPub < interval) return;
      lastPub = now;
      sb.from('hs_positions').upsert({ member_id:me.id, lat:pos.coords.latitude, lng:pos.coords.longitude,
        accuracy:pos.coords.accuracy, updated_at:new Date().toISOString() }).then(function(){});
    }, function(){}, { enableHighAccuracy: shared.hideSeek.mode === 'close', maximumAge:5000 });
  }
  if (!participating && geoWatchId !== null && navigator.geolocation){
    navigator.geolocation.clearWatch(geoWatchId); geoWatchId = null;
  }
}
function haversineKm(a, b){
  var R = 6371, toR = Math.PI / 180;
  var dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
  var s = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(a.lat*toR) * Math.cos(b.lat*toR) * Math.sin(dLng/2) * Math.sin(dLng/2);
  return 2 * R * Math.asin(Math.sqrt(s));
}
function bearingDeg(a, b){
  var toR = Math.PI / 180;
  var y = Math.sin((b.lng - a.lng) * toR) * Math.cos(b.lat * toR);
  var x = Math.cos(a.lat*toR) * Math.sin(b.lat*toR) - Math.sin(a.lat*toR) * Math.cos(b.lat*toR) * Math.cos((b.lng - a.lng) * toR);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
function compassWord(d){
  var w = ['north','north-east','east','south-east','south','south-west','west','north-west'];
  return w[Math.round(d / 45) % 8];
}
function fmtDist(km){ return km < 1 ? Math.round(km*1000) + ' m' : (km < 10 ? km.toFixed(1) + ' km' : Math.round(km) + ' km'); }
function cueFor(km){
  for (var i = 0; i < HUNT_CUES.length; i++){ if (km <= HUNT_CUES[i][0]) return HUNT_CUES[i][1]; }
  return HUNT_CUES[HUNT_CUES.length - 1][1];
}
var mapMode = false, huntMapObj = null, huntMarkers = {};
function destroyHuntMap(){
  if (huntMapObj){ try { huntMapObj.remove(); } catch(e){} }
  huntMapObj = null; huntMarkers = {};
}
function updateHuntMarkers(){
  if (!huntMapObj || !window.L) return;
  var pts = [];
  members.forEach(function(m){
    var p = positions[m.id];
    if (!p || p.lat == null) return;
    if (!huntMarkers[m.id]){
      var isSought = m.id === shared.hideSeek.soughtId;
      var icon = window.L.divIcon({ className:'', iconSize:[26,26], iconAnchor:[13,13],
        html:'<div class="mapDot' + (isSought ? ' mapSought' : '') + '">' + esc(m.name.charAt(0)) + '</div>' });
      huntMarkers[m.id] = window.L.marker([p.lat, p.lng], { icon:icon }).addTo(huntMapObj).bindTooltip(m.name);
    } else huntMarkers[m.id].setLatLng([p.lat, p.lng]);
    pts.push([p.lat, p.lng]);
  });
  if (pts.length && !huntMapObj._anslaFit){
    huntMapObj.fitBounds(pts, { padding:[40, 40], maxZoom:14 });
    huntMapObj._anslaFit = true;
  }
}
function renderHuntIfOpen(){ var v = $('vHunt'); if (v && v.classList.contains('open')) renderHunt(); }
function openHunt(){ renderHunt(); openV('vHunt'); }
function renderHunt(){
  var b = body('vHunt');
  if (!shared.hideSeek.active){
    b.innerHTML = '<p style="font-size:14.5px;">Light the lantern and the island begins to watch. Who goes to ground?</p><div id="huntWho"></div>' +
      '<p style="font-size:13.5px; color:#7a5a32; margin:10px 0 4px;">What kind of hunt?</p><div id="huntMode">' +
      '<span class="whenChip sel" data-m="close">A close hunt (garden, park, bush)</span>' +
      '<span class="whenChip" data-m="long">A long chase (roads and rivers)</span></div>' +
      '<button class="wbtn" id="huntGo" style="margin-top:12px;">Light the lantern</button>' +
      (!window.isSecureContext ? '<div class="notice">This shore cannot sense positions; the deployed island carries the tracking magic. The lantern still lights everywhere.</div>' : '');
    var who = null, mode = 'close';
    var ww = $('huntWho');
    members.forEach(function(m){
      var btn = document.createElement('button');
      btn.className = 'pickChip'; btn.textContent = m.name;
      btn.onclick = function(){
        who = m;
        ww.querySelectorAll('.pickChip').forEach(function(x){ x.className = 'pickChip'; });
        btn.className = 'pickChip sel';
      };
      ww.appendChild(btn);
    });
    $('huntMode').querySelectorAll('.whenChip').forEach(function(ch){
      ch.onclick = function(){
        mode = ch.getAttribute('data-m');
        $('huntMode').querySelectorAll('.whenChip').forEach(function(x){ x.classList.remove('sel'); });
        ch.classList.add('sel');
      };
    });
    $('huntGo').onclick = async function(){
      if (!who) return;
      if (!online) return toast('The hunt needs the island connected.');
      var r = await sb.from('hide_seek').update({ active:true, sought_member_id:who.id, mode:mode,
        started_by:myName(), started_at:new Date().toISOString() }).eq('id', 1);
      if (r.error) return toast('The lantern guttered: ' + r.error.message);
      shared.hideSeek = { active:true, soughtId:who.id, mode:mode, startedBy:myName() };
      reflectLantern(); geoSync(); renderHunt(); playDrums();
      drumsBeat('hunt', who.name);
    };
  } else {
    if (mapMode && huntMapObj && $('huntMap')){ updateHuntMarkers(); return; }
    var sought = members.filter(function(m){ return m.id === shared.hideSeek.soughtId; })[0];
    var soughtName = sought ? sought.name : 'someone';
    var iAmSought = me.id && shared.hideSeek.soughtId === me.id;
    var html = '<p style="font-size:12.5px; letter-spacing:.14em; text-transform:uppercase; color:#7a5a32;">' +
      (shared.hideSeek.mode === 'long' ? 'A long chase' : 'A close hunt') + ' &middot; lit by ' + esc(shared.hideSeek.startedBy || '') + '</p>';
    if (mapMode){
      html += '<div id="huntMap"></div>' +
        '<p class="sub" style="text-align:center;">' + esc(soughtName) + ' has gone to ground. The chart shows every soul the island can sense.</p>' +
        (iAmSought ? '<button class="wbtn ghost" id="huntCaught" style="margin-top:10px;">They found me</button>'
                   : '<button class="wbtn" id="huntFound" style="margin-top:10px;">Found them!</button>') +
        '<button class="wbtn ghost" id="huntNeedleBtn" style="margin-top:10px;">Roll up the chart</button>';
    } else if (iAmSought){
      var nearest = null, myPos = positions[me.id];
      members.forEach(function(m){
        if (m.id === me.id) return;
        var p = positions[m.id];
        if (p && myPos && p.lat != null && myPos.lat != null){
          var d = haversineKm({ lat:myPos.lat, lng:myPos.lng }, { lat:p.lat, lng:p.lng });
          if (nearest === null || d < nearest) nearest = d;
        }
      });
      html += '<p style="margin:12px 0 4px; font-size:15px;">You are the Sought, ' + esc(myName()) + '. Stay hidden.</p>' +
        '<div class="notice' + (nearest !== null && nearest < 0.15 ? ' eekPulse' : '') + '" style="font-size:16px;">' +
        esc(nearest === null ? 'The island is quiet. For now.' : cueFor(nearest)) + '</div>' +
        (nearest !== null ? '<p style="font-size:12.5px; color:#8a765a; font-style:italic;">Nearest hunter: ' + fmtDist(nearest) + '</p>' : '') +
        '<button class="wbtn ghost" id="huntCaught" style="margin-top:10px;">They found me</button>' +
        '<button class="wbtn ghost" id="huntMapBtn" style="margin-top:10px;">Unroll the chart</button>';
    } else {
      var sp = shared.hideSeek.soughtId ? positions[shared.hideSeek.soughtId] : null;
      var mp = me.id ? positions[me.id] : null;
      html += '<p style="margin:10px 0 4px; font-size:15px;">' + esc(soughtName) + ' has gone to ground.</p>';
      if (sp && mp && sp.lat != null && mp.lat != null){
        var km = haversineKm({ lat:mp.lat, lng:mp.lng }, { lat:sp.lat, lng:sp.lng });
        var brg = bearingDeg({ lat:mp.lat, lng:mp.lng }, { lat:sp.lat, lng:sp.lng });
        html += roseSvg(brg) +
          '<p style="text-align:center; font-size:17px;">' + fmtDist(km) + ' to the ' + compassWord(brg) + '</p>' +
          (deviceHeading !== null
            ? '<p class="sub" style="text-align:center;">Follow the needle. It points at them.</p>'
            : '<p class="sub" style="text-align:center;">The needle points from north. Face north and follow it' +
              (headingNeedsPermission() ? ', or <button class="wbtn ghost" id="hAwaken" style="font-size:12px; padding:4px 10px;">awaken the needle</button>' : '') + '</p>');
      } else {
        html += '<div class="notice">' + (window.isSecureContext
          ? 'The island is listening for positions&hellip; move about and give it a moment.'
          : 'This shore cannot sense positions; the deployed island carries the tracking magic. Hunt by wit for now.') + '</div>';
      }
      html += '<button class="wbtn" id="huntFound" style="margin-top:10px;">Found them!</button>' +
        '<button class="wbtn ghost" id="huntMapBtn" style="margin-top:10px;">Unroll the chart</button>';
    }
    html += '<button class="wbtn ghost" id="huntDouse" style="margin-top:10px;">Douse the lantern</button>';
    b.innerHTML = html;
    if ($('huntMapBtn')) $('huntMapBtn').onclick = function(){ mapMode = true; renderHunt(); };
    if ($('huntNeedleBtn')) $('huntNeedleBtn').onclick = function(){ mapMode = false; destroyHuntMap(); renderHunt(); };
    if (mapMode && window.L && $('huntMap') && !huntMapObj){
      huntMapObj = window.L.map('huntMap');
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19,
        attribution:'&copy; OpenStreetMap' }).addTo(huntMapObj);
      huntMapObj.setView([HOME_SHORE.lat, HOME_SHORE.lng], 10);
      updateHuntMarkers();
    }
    async function endHunt(foundBy){
      if (!online) return toast('The lantern needs the island connected.');
      var jobs = [ sb.from('hide_seek').update({ active:false, sought_member_id:null, started_by:null }).eq('id', 1) ];
      if (foundBy) jobs.push(sb.from('chronicle').insert({
        entry:'Giant Hide & Seek: ' + soughtName + ' was found. The lantern goes dark.', author:foundBy }));
      jobs.push(sb.from('hs_positions').delete().not('member_id', 'is', null));
      await Promise.all(jobs);
      shared.hideSeek = { active:false, soughtId:null, mode:'close', startedBy:null };
      positions = {};
      mapMode = false; destroyHuntMap();
      reflectLantern(); geoSync(); renderHunt();
    }
    if ($('huntFound')) $('huntFound').onclick = function(){ endHunt(myName()); };
    if ($('huntCaught')) $('huntCaught').onclick = function(){ endHunt(myName()); };
    if ($('huntDouse')) $('huntDouse').onclick = function(){ endHunt(null); };
    if ($('hAwaken')) $('hAwaken').onclick = awakenNeedle;
    updateNeedles();
  }
}

/* ================= SETTINGS ================= */
function openSettings(){
  var b = body('vSettings');
  b.innerHTML = '<div class="cat">Light on the island</div>' +
    '<p style="font-size:13.5px; margin:6px 0;">The island follows the real sky. Override it to preview:</p><div id="todRow"></div>' +
    '<div class="cat">The island&rsquo;s voice</div>' +
    '<button class="wbtn ' + (local.settings.sound === false ? 'ghost' : '') + '" id="sgSound">' +
    (local.settings.sound === false ? 'The drums are muffled (tap to unmuffle)' : 'The drums may sound (tap to muffle)') + '</button>' +
    '<div class="cat">This device</div>' +
    '<p style="font-size:13.5px; margin:6px 0;">Signed on as ' + esc(myName()) + (online ? ' · sailing with the crew' : ' · beyond the reef (offline)') + '</p>' +
    '<button class="wbtn ghost" id="sgReset">This device forgets the island</button>' +
    '<div class="cat">The archive</div>' +
    '<button class="wbtn ghost" id="sgExport">Export the chest (keep it forever)</button>' +
    '<p class="sub" style="margin-top:14px;">Escape from Ansla Island &middot; Voyage II &middot; one island, shared by the whole crew.</p>';
  var row = $('todRow');
  ['auto','dawn','day','dusk','night'].forEach(function(t){
    var btn = document.createElement('button');
    btn.className = (local.settings.timeOverride === t) ? 'wbtn' : 'wbtn ghost';
    btn.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    btn.onclick = function(){ local.settings.timeOverride = t; saveLocal(); applyTime(); openSettings(); };
    row.appendChild(btn);
  });
  $('sgExport').onclick = exportChest;
  $('sgSound').onclick = function(){
    local.settings.sound = local.settings.sound === false ? true : false;
    saveLocal();
    if (local.settings.sound !== false){ primeAudio(); playDrums(); }
    openSettings();
  };
  var armed = false;
  $('sgReset').onclick = async function(){
    if (!armed){ armed = true; $('sgReset').textContent = 'Truly? This device will need the crew code again. The shared island is untouched. Tap again.'; return; }
    try { if (sb) await sb.auth.signOut(); } catch(e){}
    localStorage.removeItem(LOCAL_KEY); localStorage.removeItem(CACHE_KEY);
    location.reload();
  };
  openV('vSettings');
}

/* ================= ROLLO ================= */
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

/* ================= WIRING ================= */
function bindHotspot(id, fn){
  $(id).addEventListener('click', function(e){
    if (wasDrag()) return;
    ripple(e); setTimeout(fn, 160);
  });
}
async function init(){
  loadLocal(); cachePaint();
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
  bindHotspot('hs-lantern', openHunt);
  bindHotspot('hs-idea', openIdeas);
  $('hs-rollo').addEventListener('click', function(){ if (!wasDrag()) rolloBark(); });
  document.querySelectorAll('.veil .closeX').forEach(function(x){
    x.onclick = function(){ x.closest('.veil').classList.remove('open'); };
  });
  document.querySelectorAll('.veil').forEach(function(v){
    v.addEventListener('click', function(e){ if (e.target === v) v.classList.remove('open'); });
  });
  window.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeAll(); });
  window.addEventListener('pointerdown', primeAudio, { once:false });
  rolloIdleLoop();
  setTimeout(function(){ $('hint').classList.add('gone'); }, 6000);
  if ('serviceWorker' in navigator && window.isSecureContext){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  }
  try { await connect(); }
  catch(e){ offlineMode(); }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
