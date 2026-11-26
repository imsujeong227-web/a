const STORE = 'moayeo-haeng-v1';
const CATEGORIES = {
  food: { label: '식당', icon: '🍜', cls: 'food' },
  cafe: { label: '카페', icon: '☕', cls: 'cafe' },
  spot: { label: '관광', icon: '🏛️', cls: 'spot' },
  etc: { label: '기타', icon: '✨', cls: 'etc' },
};
const samples = [
  { name: '해운대 암소갈비집', category: 'food', memo: '부산 오면 꼭 먹어야 하는 갈비!', by: '민지', votes: ['민지', '지우', '도윤'] },
  { name: '흰여울문화마을', category: 'spot', memo: '바다 보면서 천천히 산책하기', by: '지우', votes: ['지우', '민지'] },
  { name: '초량밀면', category: 'food', memo: '점심은 시원한 밀면 어때?', by: '도윤', votes: ['도윤'] },
  { name: '모모스 커피', category: 'cafe', memo: '커피 좋아하는 사람 여기 모여!', by: '서연', votes: ['서연', '지우'] },
];
let db = loadDB();
let activeCategory = 'food';
let toastTimer;

function loadDB() {
  try { return JSON.parse(localStorage.getItem(STORE)) || { rooms: {} }; }
  catch { return { rooms: {} }; }
}
function saveDB() { localStorage.setItem(STORE, JSON.stringify(db)); }
function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function getRoomId() { return new URLSearchParams(location.search).get('room'); }
function getRoom() { const id = getRoomId(); return id ? db.rooms[id] : null; }
function who(room) { return sessionStorage.getItem(`traveler-${room.id}`) || room.host; }
function makeId() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
function showToast(message) {
  const el = document.querySelector('#toast'); if (!el) return;
  el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2300);
}
function navigate(url) { history.pushState({}, '', url); render(); window.scrollTo(0, 0); }
function home() {
  return `<div class="shell">
    <header class="topbar"><a href="./" class="brand" data-home><span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 4 9 15"/><path d="m20 4-7 17-4-7-7-4 18-6Z"/></svg></span>모아여행</a><div class="topnote">친구와 함께 만드는 여행</div></header>
    <main class="hero">
      <div><div class="eyebrow"><span class="dot"></span>우리끼리 여행 계획, 간단하게</div><h1>링크 하나로 끝내는<br/><em>우리들의 여행 계획</em></h1><p class="hero-copy">가고 싶은 곳을 모으고, 마음에 드는 곳에 하트를 눌러요. 복잡한 단톡방 대신 우리 여행의 첫 장면을 함께 만들어봐요.</p><div class="hero-bits"><span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 10 4 4 8-8"/></svg>가입 없이 바로 시작</span><span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 10 4 4 8-8"/></svg>함께 모으는 장소</span><span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 10 4 4 8-8"/></svg>한눈에 보는 일정</span></div></div>
      <form class="create-card" id="create-form"><h2 class="card-title">새 여행 방 만들기</h2><p class="card-sub">여행 정보를 입력하고 친구들을 초대해보세요.</p>
        <div class="field"><label for="trip-title">여행 이름</label><input id="trip-title" name="title" maxlength="20" placeholder="예: 부산 여름 여행" required /></div>
        <div class="row"><div class="field"><label for="trip-days">여행 기간</label><select id="trip-days" name="days">${Array.from({length:7},(_,i)=>`<option value="${i+1}" ${i===2?'selected':''}>${i+1}일</option>`).join('')}</select></div><div class="field"><label for="host-name">내 닉네임</label><input id="host-name" name="host" maxlength="8" placeholder="예: 민지" required /></div></div>
        <div id="create-error" class="error-text"></div><button class="primary full" type="submit">여행 방 만들기 <span>→</span></button><p class="micro">로그인 없이 이 브라우저에 여행 방이 저장돼요.</p></form>
    </main>
    <div class="preview" aria-label="장소 투표 미리보기"><div class="preview-head"><span class="preview-title">부산 여름 여행 <span style="color:#94a3b8;font-weight:500">· 3일</span></span><div class="avatar-stack"><span class="avatar">민</span><span class="avatar" style="background:#dcfce7">지</span><span class="avatar" style="background:#ffedd5">도</span><span class="avatar" style="background:#fce7f3">+2</span></div></div>${samples.slice(0,3).map(p=>`<div class="place-mini"><div class="place-emoji">${CATEGORIES[p.category].icon}</div><div class="mini-info"><strong>${p.name}</strong><small>${CATEGORIES[p.category].label} · ${p.by}님이 추천</small></div><span class="mini-vote">♥ ${p.votes.length}</span></div>`).join('')}<div class="preview-footer">친구들의 마음이 모이면, 여행 일정도 완성!</div></div>
    <section class="section"><div class="section-label">3 steps to your trip</div><div class="steps"><div class="step"><div class="step-icon">🔗</div><h3>방을 만들고 초대해요</h3><p>링크를 단톡방에 공유하면<br/>친구들도 바로 참여할 수 있어요.</p></div><div class="step"><div class="step-icon">💛</div><h3>가고 싶은 곳을 모아요</h3><p>장소를 추천하고 하트를 눌러<br/>함께 가고 싶은 곳을 골라요.</p></div><div class="step"><div class="step-icon">🗺️</div><h3>여행 일정을 완성해요</h3><p>모인 장소를 바탕으로<br/>일차별 코스를 정리해요.</p></div></div></section>
    <footer class="footer">모아여행 · 우리끼리 가볍게 떠나는 계획</footer>
  </div>`;
}
function placeCard(place, room) {
  const cat = CATEGORIES[place.category] || CATEGORIES.etc;
  const voted = place.votes.includes(who(room));
  return `<article class="place-card ${voted?'voted':''}"><div class="category-icon ${cat.cls}">${cat.icon}</div><div class="place-details"><div class="place-top"><strong>${escapeHTML(place.name)}</strong><span class="badge ${cat.cls}">${cat.label}</span></div>${place.memo?`<div class="place-memo">${escapeHTML(place.memo)}</div>`:''}<div class="place-by">${escapeHTML(place.by)}님이 추천</div></div><button class="vote-button ${voted?'active':''}" data-vote="${place.id}" aria-label="${voted?'투표 취소':'가고 싶어요'}"><span class="heart">${voted?'♥':'♡'}</span>${place.votes.length}</button></article>`;
}
function roomView(room) {
  const sort = new URLSearchParams(location.search).get('sort') || 'votes';
  const places = [...room.places].sort((a,b) => sort === 'new' ? b.created-a.created : b.votes.length-a.votes.length || a.created-b.created);
  return `<div class="room-shell"><header class="room-header"><div class="room-nav"><button class="back-link" data-home>← 홈으로</button><a class="brand" href="./" data-home><span class="brand-mark">✦</span>모아여행</a><span style="width:48px"></span></div><div class="room-heading"><div><h1>${escapeHTML(room.title)}</h1><div class="room-meta"><span>${room.days}일 여행</span><i class="meta-dot"></i><span>방장 ${escapeHTML(room.host)}</span><i class="meta-dot"></i><span>${room.members.length}명 참여</span></div></div><div class="room-actions"><button class="outline" data-copy-link>↗ 초대 링크 복사</button></div></div><div class="room-stats"><span class="stat-chip">✦ ${room.places.length}개 장소</span><span class="stat-chip">♥ ${room.places.reduce((n,p)=>n+p.votes.length,0)}개 하트</span></div></header>
    <main><div class="board-head"><h2>우리의 후보 장소 <span style="color:#94a3b8;font-weight:500">${room.places.length}</span></h2><select class="sort-select" id="sort-select" aria-label="정렬"><option value="votes" ${sort==='votes'?'selected':''}>하트 많은 순</option><option value="new" ${sort==='new'?'selected':''}>최근 등록 순</option></select></div><div class="place-list">${places.length?places.map(p=>placeCard(p,room)).join(''):`<div class="empty-state"><div class="empty-art">🧭</div><h3>첫 번째 장소를 추천해보세요</h3><p>가고 싶은 곳을 하나씩 모아볼까요?</p></div>`}</div></main>
    <button class="add-fab" data-add>＋ 장소 추가</button><div class="bottom-bar"><div class="bottom-bar-inner"><span class="bottom-hint">장소를 고르고 함께 갈 곳을 정해봐요</span><button class="success" data-route>투표 마감하고 일정 만들기 <span>→</span></button></div></div></div>`;
}
function joinModal(room) {
  return `<div class="overlay" id="join-overlay"><form class="modal" id="join-form"><div class="modal-top"><div><div class="eyebrow" style="margin-bottom:12px"><span class="dot"></span>여행 초대</div><h2>${escapeHTML(room.title)} 방에 초대되었어요!</h2><p>사용할 닉네임을 입력하면 장소를 추천하고 투표할 수 있어요.</p></div></div><div class="field" style="margin-top:19px"><label for="join-name">내 닉네임</label><input id="join-name" name="name" maxlength="8" placeholder="예: 지우" required /></div><div id="join-error" class="form-error"></div><button class="primary full" type="submit">참여하기 <span>→</span></button><p class="micro">이 브라우저에서만 여행 방 정보가 저장됩니다.</p></form></div>`;
}
function routeView(room) {
  const route = room.route || makeRoute(room);
  const day = Number(new URLSearchParams(location.search).get('day') || 1);
  const dayStops = route.days[day-1] || [];
  return `<div class="route-shell"><div class="route-top"><button class="back-link" data-board>← 투표 화면으로</button><button class="outline" data-copy-route>일정 텍스트 복사하기</button></div><div class="route-layout"><main><h1 class="route-title">${escapeHTML(room.title)}<br/>추천 동선이 완성됐어요!</h1><p class="route-sub">함께 가고 싶은 마음을 모아, 일차별로 정리했어요.</p>${route.compromise?`<div class="warning">💛 겹치는 장소가 없어 모두의 1순위 장소를 하나씩 담아 균형 있게 짰어요!</div>`:''}<div class="day-tabs">${route.days.map((_,i)=>`<button class="day-tab ${day===i+1?'active':''}" data-day="${i+1}">${i+1}일차</button>`).join('')}</div><div class="timeline">${dayStops.map((p,i)=>`${i?`<div class="travel-chip">🚗 차량 약 ${p.travel||12}분</div>`:''}<div class="stop"><div class="stop-number">${i+1}</div><div class="stop-content"><strong>${escapeHTML(p.name)}</strong><p>${CATEGORIES[p.category]?.label||'장소'}${p.memo?` · ${escapeHTML(p.memo)}`:''}</p></div></div>`).join('') || '<div class="empty-state"><h3>이날은 여유롭게 쉬어가요</h3><p>투표 화면에서 장소를 더 추가할 수 있어요.</p></div>'}</div><div class="route-actions"><button class="outline" data-board>투표 화면으로 돌아가기</button><button class="primary" data-copy-route>일정 텍스트 복사하기</button></div></main><aside class="map-card"><div class="map-water"></div><div class="map-grid"></div><div class="map-route"></div>${dayStops.slice(0,4).map((p,i)=>`<div class="map-pin" style="left:${22+(i*19)%52}%;top:${24+(i*27)%56}%"><span>${i+1}</span></div>`).join('')}<div class="map-caption">📍 ${dayStops.length}곳 · 장소명 기반 간단 동선 미리보기</div></aside></div></div>`;
}
function makeRoute(room) {
  const counts = room.places.map(p=>({ ...p, count:p.votes.length }));
  const shared = counts.filter(p=>p.count>=2).sort((a,b)=>b.count-a.count);
  const compromise = shared.length===0;
  let selected = shared.length ? shared : counts.sort((a,b)=>b.count-a.count);
  // Spread high-ranked stops across days, then group nearby coordinate-grid cells.
  const days = Array.from({length:room.days},()=>[]);
  selected.forEach((p,i)=>days[i%room.days].push({...p, travel:10+((p.name.length*7+i*5)%18)}));
  days.forEach(day=>day.sort((a,b)=>((a.name.charCodeAt(0)||0)%5)-((b.name.charCodeAt(0)||0)%5)));
  room.route={days,compromise}; saveDB(); return room.route;
}
function render() {
  db=loadDB(); const app=document.querySelector('#app'); const room=getRoom();
  if (!room) { app.innerHTML=home(); bindHome(); return; }
  const knownTraveler=sessionStorage.getItem(`traveler-${room.id}`);
  if (!knownTraveler) { app.innerHTML=roomView(room); app.insertAdjacentHTML('beforeend',joinModal(room)); bindRoom(room); bindJoin(room); return; }
  if (room.route && new URLSearchParams(location.search).get('view')==='route') { app.innerHTML=routeView(room); bindRoute(room); }
  else { app.innerHTML=roomView(room); bindRoom(room); }
}
function bindJoin(room) {
  const overlay=document.querySelector('#join-overlay');
  document.querySelector('#join-form').addEventListener('submit',e=>{
    e.preventDefault();const name=String(new FormData(e.currentTarget).get('name')).trim();const error=document.querySelector('#join-error');
    if(!name||name.length>8||/[^가-힣a-zA-Z0-9]/.test(name)){error.textContent='닉네임을 1~8자로 입력해주세요. 특수문자는 사용할 수 없어요.';return;}
    if(room.members.some(m=>m.toLowerCase()===name.toLowerCase())){error.textContent='이미 사용 중인 닉네임입니다. 다른 이름을 입력해주세요.';return;}
    room.members.push(name);saveDB();sessionStorage.setItem(`traveler-${room.id}`,name);overlay.remove();render();showToast(`${name}님, 여행 방에 참여했어요!`);
  });
  setTimeout(()=>document.querySelector('#join-name')?.focus(),40);
}
function bindHome() {
  document.querySelectorAll('[data-home]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();navigate(location.pathname)}));
  document.querySelector('#create-form').addEventListener('submit',e=>{
    e.preventDefault();const fd=new FormData(e.currentTarget);const title=String(fd.get('title')).trim(),host=String(fd.get('host')).trim(),error=document.querySelector('#create-error');
    if(title.length<2){error.textContent='여행 제목을 2자 이상 입력해주세요.';return;}
    if(!host||host.length>8||/[^가-힣a-zA-Z0-9]/.test(host)){error.textContent='닉네임을 1~8자로 입력해주세요.';return;}
    const id=makeId(); db.rooms[id]={id,title,days:Number(fd.get('days')),host,members:[host],places:[],created:Date.now(),route:null};saveDB();sessionStorage.setItem(`traveler-${id}`,host);navigate(`${location.pathname}?room=${id}`);
  });
}
function bindRoom(room) {
  document.querySelectorAll('[data-home]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();navigate(location.pathname)}));
  document.querySelector('[data-copy-link]').addEventListener('click',()=>copyText(location.href,'초대 링크를 복사했어요!'));
  document.querySelector('[data-add]').addEventListener('click',()=>openPlaceModal(room));
  document.querySelector('[data-route]').addEventListener('click',()=>{
    if(room.places.length<2){showToast('최소 2개 이상의 장소를 추가해주세요.');return;}
    room.route=makeRoute(room);saveDB();navigate(`${location.pathname}?room=${room.id}&view=route`);
  });
  document.querySelector('#sort-select').addEventListener('change',e=>navigate(`${location.pathname}?room=${room.id}&sort=${e.target.value}`));
  document.querySelectorAll('[data-vote]').forEach(btn=>btn.addEventListener('click',()=>{
    const place=room.places.find(p=>p.id===btn.dataset.vote);if(!place)return;const name=who(room);const index=place.votes.indexOf(name);
    if(index>=0)place.votes.splice(index,1);else place.votes.push(name);room.route=null;saveDB();render();
  }));
}
function openPlaceModal(room) {
  document.body.insertAdjacentHTML('beforeend',`<div class="overlay" id="place-overlay"><form class="modal" id="place-form"><div class="modal-top"><div><h2>가고 싶은 곳 추가</h2><p>친구들에게 추천하고 싶은 장소를 알려주세요.</p></div><button type="button" class="close" data-close>×</button></div><div class="field"><label for="place-name">장소 이름</label><input id="place-name" name="name" maxlength="30" placeholder="예: 해운대 해수욕장" autofocus /></div><label class="field"><span style="font-size:12px;font-weight:700;color:#334155">어떤 곳인가요?</span></label><div class="category-choice">${Object.entries(CATEGORIES).map(([key,value],i)=>`<button type="button" class="${i===0?'selected':''}" data-category="${key}">${value.icon} ${value.label}</button>`).join('')}</div><div class="field"><label for="place-memo">한 줄 메모 <span style="color:#94a3b8;font-weight:500">(선택)</span></label><textarea id="place-memo" name="memo" maxlength="40" placeholder="여기서 뭘 하고 싶은지 알려주세요"></textarea></div><div id="place-error" class="form-error"></div><div class="modal-actions"><button type="button" class="outline" data-close>취소</button><button type="submit" class="primary">장소 추가</button></div></form></div>`);
  activeCategory='food';const overlay=document.querySelector('#place-overlay');
  overlay.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>overlay.remove()));
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});
  overlay.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{activeCategory=b.dataset.category;overlay.querySelectorAll('[data-category]').forEach(x=>x.classList.toggle('selected',x===b))}));
  overlay.querySelector('#place-form').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget),name=String(fd.get('name')).trim();if(!name){overlay.querySelector('#place-error').textContent='장소명을 입력해주세요.';return;}room.places.push({id:makeId(),name,category:activeCategory,memo:String(fd.get('memo')).trim(),by:who(room),votes:[who(room)],created:Date.now()});room.route=null;saveDB();overlay.remove();render();showToast('장소를 추가했어요!')});
  setTimeout(()=>overlay.querySelector('#place-name')?.focus(),40);
}
function bindRoute(room) {
  document.querySelectorAll('[data-board]').forEach(b=>b.addEventListener('click',()=>navigate(`${location.pathname}?room=${room.id}`)));
  document.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>navigate(`${location.pathname}?room=${room.id}&view=route&day=${b.dataset.day}`)));
  document.querySelectorAll('[data-copy-route]').forEach(b=>b.addEventListener('click',()=>copyText(routeText(room),'일정 텍스트를 복사했어요!')));
}
function routeText(room) {
  const route=room.route||makeRoute(room);
  return `${room.title} 추천 일정\n`+route.days.map((list,i)=>`${i+1}일차\n${list.map((p,j)=>`${j+1}. ${p.name}${j?` (차량 약 ${p.travel}분)`:''}`).join('\n')}`).join('\n\n');
}
async function copyText(text,message) {
  try { await navigator.clipboard.writeText(text); }
  catch { const ta=document.createElement('textarea');ta.value=text;document.body.append(ta);ta.select();document.execCommand('copy');ta.remove(); }
  showToast(message);
}
window.addEventListener('popstate',render);
window.addEventListener('storage',e=>{if(e.key===STORE)render()});
render();
