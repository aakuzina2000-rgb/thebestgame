console.log("THE BEST GAME v21 loaded");
const ACCESS_CODE="indonesia";
const MAX_LIVES=3;
const SAVE_KEY="thebestgame_save_v1";

function defaultSave(){
  return{
    version:1,playerName:"",debt:0,firstLoginSeen:false,
    parts:{
      indonesia:{
        unlocked:true,completed:false,
        minigames:{
          tinder:{unlocked:true,completed:false,attempts:0,bestLivesLeft:0},
          game2:{unlocked:false,completed:false},
          game3:{unlocked:false,completed:false}
        }
      },
      russia:{unlocked:false,completed:false,minigames:{}}
    }
  };
}

function loadSave(){
  try{
    const s=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(!s)return defaultSave();
    const b=defaultSave();
    return{
      ...b,...s,
      parts:{
        ...b.parts,...(s.parts||{}),
        indonesia:{
          ...b.parts.indonesia,...(s.parts?.indonesia||{}),
          minigames:{...b.parts.indonesia.minigames,...(s.parts?.indonesia?.minigames||{})}
        }
      }
    };
  }catch{return defaultSave();}
}

const state={...loadSave(),lives:MAX_LIVES,currentProfile:0,history:[]};

// v21 mission-order migration: Tinder -> Churros -> Padel.
if(state.parts.indonesia.minigames.tinder.completed){
  state.parts.indonesia.minigames.game2.unlocked=true;
}


const baseProfiles=[
  {
    name:"Drako",age:28,image:"assets/dragon.png",
    bio:"Owns three villas, two scooters and absolutely no fire insurance.",
    meta:"Canggu • 2 km away",
    like:{type:"life",text:"MATCH. Dinner was great. You were dinner. -1 life."},
    nope:{type:"safe",text:"Good call. Eyebrows preserved."}
  },
  {
    name:"Xyra",age:29,image:"assets/alien.png",
    bio:"New to Earth. Looking for a local guide. Human organs are NOT a hobby.",
    meta:"Uluwatu • signal unstable",
    like:{type:"life",text:"You have been selected for research. -1 life."},
    nope:{type:"safe",text:"Earth retains one citizen."}
  },
  {
    name:"Leo",age:34,image:"assets/male.png",
    bio:"Says 'I know a hidden beach' and then takes you somewhere with a 40k entrance fee.",
    meta:"Seminyak • 5 km away",
    like:{type:"life",text:"He said 'trust me' four times in five minutes. -1 life."},
    nope:{type:"safe",text:"A rare display of good judgment."}
  },
  {
    name:"Milo",age:27,image:"assets/cat.png",
    bio:"Emotionally unavailable. Sleeps 16 hours. Still somehow has higher standards than you.",
    meta:"Ubud • probably indoors",
    like:{type:"life",text:"He knocked your drink off the table and ghosted you. -1 life."},
    nope:{type:"safe",text:"Rejected by a cat. Character development."}
  },
  {
    name:"Max",age:32,image:"assets/man2.png",
    bio:"Entrepreneur. Has a podcast. Nobody asked for either.",
    meta:"Canggu • 1 km away",
    like:{type:"life",text:"He explained crypto before saying hello. -1 life."},
    nope:{type:"safe",text:"Sanity +10."}
  },
  {
    name:"Bella",age:26,image:"assets/woman.png",
    bio:"47 countries. 800 selfies. Looking for someone who can hold the ring light.",
    meta:"Canggu • 3 km away",
    like:{type:"life",text:"Dinner bill: 4,850,000 IDR. Wallet critically damaged. -1 life."},
    nope:{type:"safe",text:"Your bank account sends its regards."}
  }
];

const finalProfile={
  name:"Anastasia",age:24,image:"assets/anastasia_16bit.png",
  bio:"Russian. Love bumble coffee and kinder bueno",
  meta:"Bali • very close",
  isFinal:true,
  like:{type:"match",text:"Finally."},
  nope:{type:"return",text:"Excuse me? That button seems broken."}
};

let profiles=[];

function shuffle(a){
  const r=[...a];
  for(let i=r.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [r[i],r[j]]=[r[j],r[i]];
  }
  return r;
}
function rebuildProfiles(){profiles=[...shuffle(baseProfiles),finalProfile];}

function saveState(){
  localStorage.setItem(SAVE_KEY,JSON.stringify({
    version:state.version,playerName:state.playerName,debt:state.debt,
    firstLoginSeen:state.firstLoginSeen,parts:state.parts
  }));
}
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
function renderDebt(){
  document.getElementById("debt-top").textContent=state.debt;
  document.querySelectorAll(".debt-any").forEach(e=>e.textContent=state.debt);
  document.getElementById("debt-big").textContent=state.debt;
}
function showDebtGain(){
  renderDebt();
  let toast=document.getElementById("debt-gain-toast");
  if(!toast){
    toast=document.createElement("div");
    toast.id="debt-gain-toast";
    toast.className="debt-gain-toast";
    toast.innerHTML='<img src="assets/pain_au_chocolat.png" alt=""><div><strong>YOU OWE +1</strong><span>pain au chocolat</span></div>';
    document.body.appendChild(toast);
  }
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer=setTimeout(()=>toast.classList.remove("show"),1800);
}
function renderLives(){
  document.getElementById("lives").textContent="❤️".repeat(state.lives)+"🖤".repeat(MAX_LIVES-state.lives);
}
function renderProgress(){
  const games=Object.values(state.parts.indonesia.minigames);
  const done=games.filter(g=>g.completed).length;
  document.querySelectorAll(".indonesia-progress").forEach(e=>e.textContent=`${done}/${games.length} MISSIONS COMPLETE`);
  const t=state.parts.indonesia.minigames.tinder;
  const st=document.getElementById("tinder-status");
  if(st){st.textContent=t.completed?"COMPLETE":"IN PROGRESS";st.dataset.status=t.completed?"complete":"progress";}
  if(typeof renderPadelMission==="function")renderPadelMission();
}
function loseLife(msg){
  state.lives--;
  if(state.lives<=0){
    state.debt++;
    state.lives=MAX_LIVES;
    saveState();showDebtGain();renderLives();
    return "NO LIVES LEFT. Respawned. Debt +1 pain au chocolat.";
  }
  saveState();renderLives();
  return msg;
}

function renderProfile(){
  const stack=document.getElementById("card-stack");
  stack.innerHTML="";
  const p=profiles[state.currentProfile];
  if(!p)return;
  const card=document.createElement("div");
  card.className="profile-card";
  card.innerHTML=`
    <div class="profile-visual"><img src="${p.image}" alt="${p.name}"></div>
    <div class="profile-copy">
      <h3>${p.name}, ${p.age}</h3>
      <p>${p.bio}</p>
      <div class="profile-meta">${p.meta}</div>
    </div>`;
  stack.appendChild(card);
  attachDrag(card);
}
function nextProfile(){
  state.currentProfile=Math.min(state.currentProfile+1,profiles.length-1);
  renderProfile();
}

function showSwipePopup(text,type="safe",title=null){
  const phone=document.querySelector(".phone");
  if(!phone)return;

  const old=phone.querySelector(".swipe-popup");
  if(old)old.remove();

  const pop=document.createElement("div");
  pop.className=`swipe-popup ${type}`;

  const label=title || (type==="life" ? "−1 LIFE" : "✓ LIFE SAVED");
  pop.innerHTML=`
    <div class="notification-app">
      <span class="notification-logo">🔥</span>
      <span>TINDER</span>
      <small>now</small>
    </div>
    <div class="notification-title">${label}</div>
    <div class="notification-text">${text}</div>
  `;

  phone.appendChild(pop);
  requestAnimationFrame(()=>pop.classList.add("show"));
  setTimeout(()=>pop.classList.remove("show"),1650);
  setTimeout(()=>pop.remove(),1950);
}

function badLikeMessage(actionText){
  if(state.lives===MAX_LIVES){
    return actionText;
  }
  if(state.lives===2){
    return `You absolute debil. ${actionText} Two lives left.`;
  }
  if(state.lives===1){
    return `Are you stupid? ${actionText} Do that one more time and you're buying a pain au chocolat.`;
  }
  return actionText;
}

function swipe(dir){
  const p=profiles[state.currentProfile];
  const action=dir==="right"?p.like:p.nope;

  if(p.isFinal && dir==="left"){
    const c=document.querySelector(".profile-card");
    if(c)c.animate(
      [{transform:"translateX(-10px)"},{transform:"translateX(10px)"},{transform:"translateX(0)"}],
      {duration:300}
    );
    showSwipePopup("You debil.","life","−1 LIFE");
    return;
  }

  state.history.push(state.currentProfile);

  const c=document.querySelector(".profile-card");
  if(c){
    c.style.transform=dir==="right"
      ?"translateX(150%) rotate(18deg)"
      :"translateX(-150%) rotate(-18deg)";
    c.style.opacity="0";
  }

  if(action.type==="life"){
    const result=loseLife(action.text);
    if(result.startsWith("NO LIVES LEFT")){
      showSwipePopup("You debil.","life","−1 LIFE · DEBT +1");
    }else{
      showSwipePopup("You debil.","life","−1 LIFE");
    }
  }
  else if(action.type==="match"){
    showSwipePopup("You debil.","safe","+1 LIFE");
    setTimeout(()=>showScreen("screen-match"),1050);
    return;
  }
  else{
    showSwipePopup(action.text,"safe");
  }

  setTimeout(nextProfile,280);
}

function rewind(){
  if(!state.history.length){
    showSwipePopup("Nothing to rewind. Even this game has limits.","safe","REWIND");
    return;
  }
  state.currentProfile=state.history.pop();
  renderProfile();
  showSwipePopup("Rewound. Your terrible decision has been temporarily erased.","safe","REWIND");
}

function attachDrag(card){
  let sx=0,cx=0,drag=false;
  card.addEventListener("pointerdown",e=>{
    drag=true;sx=e.clientX;card.setPointerCapture(e.pointerId);card.style.transition="none";
  });
  card.addEventListener("pointermove",e=>{
    if(!drag)return;cx=e.clientX-sx;
    card.style.transform=`translateX(${cx}px) rotate(${cx/18}deg)`;
  });
  const end=()=>{
    if(!drag)return;drag=false;card.style.transition="transform .25s,opacity .25s";
    if(cx>95)swipe("right");
    else if(cx<-95)swipe("left");
    else card.style.transform="translateX(0) rotate(0)";
    cx=0;
  };
  card.addEventListener("pointerup",end);
  card.addEventListener("pointercancel",end);
}



/* ===== MISSION 02: CHURROS ===== */
let churros={
  active:false,score:0,lives:3,basketX:50,items:[],spawnTimer:null,raf:null,last:0,
  keys:{left:false,right:false},nextId:1
};
const churrosGood=[
  {label:"CHURROS",kind:"food",symbol:"CH"},
  {label:"ECZEMA",kind:"diagnosis",symbol:"Rx"},
  {label:"ARTHRITIS",kind:"diagnosis",symbol:"Rx"}
];
const churrosBad=[
  {label:"CROISSANT",kind:"food",symbol:"CR"},
  {label:"DONUT",kind:"food",symbol:"DO"},
  {label:"TOMATO",kind:"food",symbol:"TO"},
  {label:"BROCCOLI",kind:"food",symbol:"BR"},
  {label:"MIGRAINE",kind:"diagnosis",symbol:"Rx"},
  {label:"ASTHMA",kind:"diagnosis",symbol:"Rx"},
  {label:"GOUT",kind:"diagnosis",symbol:"Rx"},
  {label:"SCOLIOSIS",kind:"diagnosis",symbol:"Rx"},
  {label:"DIABETES",kind:"diagnosis",symbol:"Rx"}
];

function renderChurrosMission(){
  const g=state.parts.indonesia.minigames.game2;
  const btn=document.getElementById("open-churros");
  const status=document.getElementById("churros-status");
  if(!btn||!status)return;
  if(g.completed){btn.classList.remove("locked");status.textContent="COMPLETE";status.dataset.status="complete";}
  else if(g.unlocked){btn.classList.remove("locked");status.textContent="UNLOCKED";status.dataset.status="unlocked";}
  else{btn.classList.add("locked");status.textContent="LOCKED";status.dataset.status="locked";}
}
function renderChurrosHud(){
  const l=document.getElementById("churros-lives"),s=document.getElementById("churros-score");
  if(l)l.textContent="❤️".repeat(churros.lives)+"🖤".repeat(3-churros.lives);
  if(s)s.textContent=`${churros.score} / 15`;
  const b=document.getElementById("churros-basket"); if(b)b.style.left=churros.basketX+"%";
}
function churrosPop(text,bad=false){
  const p=document.getElementById("churros-popup"); if(!p)return;
  p.textContent=text;p.className="churros-popup show "+(bad?"bad":"good");
  clearTimeout(p._t);p._t=setTimeout(()=>p.className="churros-popup",800);
}
function clearChurrosItems(){
  churros.items.forEach(i=>i.el.remove());churros.items=[];
}
function stopChurros(){
  churros.active=false;clearTimeout(churros.spawnTimer);cancelAnimationFrame(churros.raf);
}
function spawnChurrosItem(){
  if(!churros.active)return;
  const good=Math.random()<0.48;
  const pool=good?churrosGood:churrosBad;
  const data=pool[Math.floor(Math.random()*pool.length)];
  const el=document.createElement("div");
  el.className=`fall-item ${data.kind} ${good?"wanted":"wrong"}`;
  el.innerHTML=`<b>${data.symbol}</b><span>${data.label}</span>`;
  document.getElementById("falling-layer").appendChild(el);
  const item={id:churros.nextId++,x:8+Math.random()*84,y:-10,speed:18+Math.random()*7,good,data,el};
  churros.items.push(item);
  el.style.left=item.x+"%";el.style.top=item.y+"%";
  churros.spawnTimer=setTimeout(spawnChurrosItem,650+Math.random()*450);
}
function catchChurros(item){
  item.el.remove();churros.items=churros.items.filter(x=>x!==item);
  if(item.good){
    churros.score++;
    churrosPop(item.data.label==="CHURROS"?"+1 · IMPORTANT MEDICATION":"+1 · YEP. THAT'S YOURS.");
    if(churros.score>=15){
      stopChurros();
      document.getElementById("churros-result").classList.remove("hidden");
      return;
    }
  }else{
    churros.lives--;
    churrosPop("WRONG. NOT YOUR PROBLEM.",true);
    if(churros.lives<=0){
      state.debt++;churros.lives=3;saveState();showDebtGain();
    }
  }
  renderChurrosHud();
}
function churrosFrame(t){
  if(!churros.active)return;
  const dt=churros.last?Math.min(40,t-churros.last):16;churros.last=t;
  const move=.045*dt;
  if(churros.keys.left)churros.basketX=Math.max(7,churros.basketX-move);
  if(churros.keys.right)churros.basketX=Math.min(93,churros.basketX+move);
  renderChurrosHud();
  [...churros.items].forEach(item=>{
    item.y+=item.speed*dt/1000;
    item.el.style.top=item.y+"%";
    if(item.y>=78 && item.y<=92 && Math.abs(item.x-churros.basketX)<10)catchChurros(item);
    else if(item.y>103){item.el.remove();churros.items=churros.items.filter(x=>x!==item);}
  });
  churros.raf=requestAnimationFrame(churrosFrame);
}
function resetChurros(){
  stopChurros();clearChurrosItems();
  churros.score=0;churros.lives=3;churros.basketX=50;churros.last=0;
  churros.keys.left=false;churros.keys.right=false;
  document.getElementById("churros-result").classList.add("hidden");
  document.getElementById("churros-start-overlay").classList.remove("hidden");
  renderChurrosHud();
}
function startChurros(){
  resetChurros();document.getElementById("churros-start-overlay").classList.add("hidden");
  churros.active=true;spawnChurrosItem();churros.raf=requestAnimationFrame(churrosFrame);
}

/* ===== MISSION 03: PADEL ===== */
let padel={
  gamesYou:0,gamesCpu:0,
  pointsYou:0,pointsCpu:0,
  lives:3,
  roundActive:false,finished:false,paused:false,
  startTime:0,duration:1500,raf:null,pauseStarted:0,
  ballTargetX:50,
  rallyCount:0,totalGames:5,currentGame:1,pointsToWin:5,visualProgress:0,
  keys:{left:false,right:false},lastFrame:0
};

function renderPadelMission(){
  const g=state.parts.indonesia.minigames.game3;
  const btn=document.getElementById("open-padel");
  const status=document.getElementById("padel-status");
  if(!btn||!status)return;
  if(g.completed){
    btn.classList.remove("locked");
    status.textContent="COMPLETE";
    status.dataset.status="complete";
  }else if(g.unlocked){
    btn.classList.remove("locked");
    status.textContent="UNLOCKED";
    status.dataset.status="unlocked";
  }else{
    btn.classList.add("locked");
    status.textContent="LOCKED";
    status.dataset.status="locked";
  }
}

function renderPadelHud(){
  const score=document.getElementById("padel-score");
  const points=document.getElementById("padel-points");
  const setLabel=document.getElementById("padel-set-label");
  if(score)score.textContent=`GAMES  YOU ${padel.gamesYou} — ${padel.gamesCpu} CPU`;
  if(points)points.textContent=`POINTS  ${padel.pointsYou} — ${padel.pointsCpu}`;
  if(setLabel)setLabel.textContent=`PADEL // GAME ${Math.min(padel.currentGame,5)} OF 5`;
}

function padelNotify(title,text,type="good"){
  const n=document.getElementById("padel-notification");
  if(!n)return;
  n.className=`padel-notification ${type}`;
  n.querySelector(".notification-title").textContent=title;
  n.querySelector(".notification-text").textContent=text;
  n.classList.add("show");
  clearTimeout(n._timer);
  n._timer=setTimeout(()=>n.classList.remove("show"),1200);
}

function updatePlayer(){
  const el=document.getElementById("padel-player");
  if(el)el.style.left="50%";
}

function setBallProgress(p){
  const ball=document.getElementById("padel-ball");
  const marker=document.getElementById("timing-marker");
  const visualP=Math.max(0,Math.min(1,p));
  padel.visualProgress=visualP;
  if(!ball||!marker)return;
  const top=22+visualP*62;
  const x=50;
  ball.style.top=top+"%";
  ball.style.left=x+"%";
  marker.style.left=`calc(${visualP*100}% - 2px)`;
}

function currentSpeedDuration(){
  // Gentle acceleration during the match, capped so later games remain playable.
  return Math.max(1120,1550 - Math.min(padel.rallyCount-1,8)*45);
}

function runCountdown(){
  return new Promise(resolve=>{
    const box=document.getElementById("padel-countdown");
    const text=document.getElementById("padel-countdown-text");
    const sequence=["3","2","1","MAAAATCH"];
    box.classList.remove("hidden");
    let i=0;
    const step=()=>{
      text.textContent=sequence[i];
      text.classList.remove("pop");
      void text.offsetWidth;
      text.classList.add("pop");
      i++;
      if(i<sequence.length){
        setTimeout(step,i===3?650:700);
      }else{
        setTimeout(()=>{
          box.classList.add("hidden");
          resolve();
        },850);
      }
    };
    step();
  });
}

function startRally(){
  if(padel.roundActive||padel.finished||padel.paused)return;
  padel.roundActive=true;
  padel.rallyCount++;
  padel.startTime=performance.now();
  padel.duration=currentSpeedDuration();
  padel.ballTargetX=50;
  setBallProgress(0);

  function frame(t){
    if(!padel.roundActive||padel.finished)return;
    if(padel.paused){
      padel.raf=requestAnimationFrame(frame);
      return;
    }

    padel.lastFrame=t;
    updatePlayer();

    const p=(t-padel.startTime)/padel.duration;
    setBallProgress(Math.min(p,1));

    if(p>=1){
      padel.roundActive=false;
      finishPoint(false,"TOO LATE","The ball has already moved on.");
      return;
    }
    padel.raf=requestAnimationFrame(frame);
  }
  padel.lastFrame=0;
  padel.raf=requestAnimationFrame(frame);
}

function scheduleNextRally(){
  if(padel.finished||padel.paused)return;
  setTimeout(()=>{
    if(!padel.paused&&!padel.finished)startRally();
  },700);
}

function showPadelGameBreak(playerWonGame,finishedGame){
  const overlay=document.getElementById("padel-game-break");
  if(!overlay)return;
  const title=document.getElementById("padel-game-break-title");
  const score=document.getElementById("padel-game-break-score");
  title.textContent=playerWonGame ? `GAME ${finishedGame} — YOU WON` : `GAME ${finishedGame} — YOU LOST`;
  score.textContent=`FRANCE ${padel.gamesYou} — ${padel.gamesCpu} PADEL GIRL`;
  overlay.classList.remove("hidden");
  setTimeout(()=>overlay.classList.add("hidden"),1800);
}

function finishPoint(playerWon,title,text){
  if(playerWon)padel.pointsYou++; else padel.pointsCpu++;
  renderPadelHud();
  padelNotify(title,text,playerWon?"good":"bad");

  const gameOver = padel.pointsYou>=padel.pointsToWin || padel.pointsCpu>=padel.pointsToWin;
  if(!gameOver){
    scheduleNextRally();
    return;
  }

  const playerWonGame = padel.pointsYou>padel.pointsCpu;
  if(playerWonGame){
    padel.gamesYou++;
  }else{
    padel.gamesCpu++;
    state.debt++;
    saveState();
    showDebtGain();
  }

  const finishedGame=padel.currentGame;
  renderPadelHud();
  showPadelGameBreak(playerWonGame,finishedGame);

  if(padel.currentGame>=padel.totalGames){
    setTimeout(()=>finishPadelMatch(padel.gamesYou>padel.gamesCpu),2100);
    return;
  }

  padel.pointsYou=0;
  padel.pointsCpu=0;
  padel.currentGame++;
  setTimeout(()=>{
    renderPadelHud();
    scheduleNextRally();
  },2000);
}

function hitPadel(){
  if(!padel.roundActive||padel.finished||padel.paused)return;

  // IMPORTANT: score from the marker's ACTUAL displayed position, not a second clock.
  // This removes the visual/timing mismatch that caused center hits to lose.
  const p=padel.visualProgress;

  padel.roundActive=false;
  cancelAnimationFrame(padel.raf);

  // The visible middle zone is deliberately generous.
  if(p>=0.45 && p<=0.55){
    finishPoint(true,"PERFECT","+1 POINT");
  }else if(p<0.45){
    finishPoint(false,"TOO EARLY","CPU +1 POINT");
  }else{
    finishPoint(false,"TOO LATE","CPU +1 POINT");
  }
}

function togglePadelPause(force){
  if(padel.finished)return;
  const next=typeof force==="boolean"?force:!padel.paused;
  if(next===padel.paused)return;
  padel.paused=next;

  const overlay=document.getElementById("padel-pause-overlay");
  const btn=document.getElementById("padel-pause");

  if(padel.paused){
    padel.pauseStarted=performance.now();
    overlay.classList.remove("hidden");
    btn.innerHTML='RESUME <small>P</small>';
  }else{
    const pausedFor=performance.now()-padel.pauseStarted;
    if(padel.roundActive)padel.startTime+=pausedFor;
    overlay.classList.add("hidden");
    btn.innerHTML='PAUSE <small>P</small>';
  }
}

function showPadelResult(title,copy,buttonText,handler,showFrench=false){
  const box=document.getElementById("padel-result");
  const french=document.getElementById("padel-french-final");
  document.getElementById("padel-result-title").textContent=title;
  document.getElementById("padel-result-copy").textContent=copy;
  french.classList.toggle("hidden",!showFrench);

  const btn=document.getElementById("padel-result-btn");
  btn.textContent=buttonText;
  btn.onclick=handler;
  box.classList.remove("hidden");
}

function finishPadelMatch(won){
  padel.finished=true;
  padel.roundActive=false;
  cancelAnimationFrame(padel.raf);

  // Mission passes either way, as requested.
  state.parts.indonesia.minigames.game3.completed=true;
  saveState();
  renderProgress();
  renderPadelMission();

  if(won){
    showPadelResult(
      "MATCH RESULT — YOU WIN",
      "",
      "CONTINUE →",
      ()=>{
        document.getElementById("padel-result").classList.add("hidden");
        showScreen("screen-indonesia");
      },
      true
    );
  }else{
    showPadelResult(
      "MATCH RESULT — YOU LOST",
      "Losing at padel. In Indonesia. Against a girl. Impressive, beau gosse.",
      "WALK IT OFF →",
      ()=>{
        document.getElementById("padel-result").classList.add("hidden");
        showScreen("screen-indonesia");
      },
      false
    );
  }
}

function resetPadelMatch(){
  document.getElementById("padel-result").classList.add("hidden");
  document.getElementById("padel-pause-overlay").classList.add("hidden");
  padel.gamesYou=0;padel.gamesCpu=0;padel.pointsYou=0;padel.pointsCpu=0;
  padel.finished=false;padel.roundActive=false;padel.paused=false;
  padel.rallyCount=0;padel.currentGame=1;padel.visualProgress=0;
  padel.keys.left=false;padel.keys.right=false;
  renderPadelHud();updatePlayer();setBallProgress(0);
}

function enterPadel(){
  if(!state.parts.indonesia.minigames.game3.unlocked)return;
  showScreen("screen-padel-intro");
}

function enterGame(){
  try{
    const nameInput=document.getElementById("player-name");
    const codeInput=document.getElementById("access-code");
    const error=document.getElementById("login-error");

    const name=((nameInput && nameInput.value) || "Anastasia").trim() || "Anastasia";
    const code=((codeInput && codeInput.value) || "indonesia").trim().toLowerCase();

    if(code!=="indonesia"){
      if(error)error.textContent="WRONG ACCESS CODE";
      return false;
    }

    state.playerName=name;

    // localStorage must never be able to block login.
    try{ saveState(); }catch(_){}

    const homePlayer=document.getElementById("home-player");
    if(homePlayer)homePlayer.textContent=name;
    if(error)error.textContent="";

    const home=document.getElementById("screen-home");
    if(!home)throw new Error("Home screen missing");

    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    home.classList.add("active");

    // Welcome is decorative; if it ever breaks, login still succeeds.
    try{
      if(typeof showRandomWelcome==="function")showRandomWelcome();
    }catch(_){}

    return false;
  }catch(err){
    console.error("LOGIN ERROR",err);
    const error=document.getElementById("login-error");
    if(error)error.textContent="LOGIN ERROR — REFRESH AND TRY AGAIN";
    return false;
  }
}

const loginBtn=document.getElementById("login-btn");
if(loginBtn){
  loginBtn.onclick=function(e){
    if(e)e.preventDefault();
    return enterGame();
  };
}

["player-name","access-code"].forEach(id=>{
  const el=document.getElementById(id);
  if(el){
    el.onkeydown=function(e){
      if(e.key==="Enter"){
        e.preventDefault();
        enterGame();
      }
    };
  }
});

const welcomeMessages=[
  ["Coucou, yopta.","Thought you were going to play Call of Duty?","Ah bah non. T’en voulais beaucoup, hein ?"],
  ["Oh. You again.","Could’ve gone to the gym, you know.","Mais non. Monsieur préfère souffrir ici."],
  ["Welcome back, champion.","Still making terrible decisions? Perfect.","On ne change pas une équipe qui perd."],
  ["Look who survived.","I genuinely thought you’d rage quit.","Quelle déception. T’es encore là."],
  ["Bonsoir, debil.","Another day. Another questionable choice.","Allez. Essaie d’être intelligent cinq minutes."],
  ["Seriously? Again?","There are hobbies outside this game.","Oui oui. Même aller à la salle compte."],
  ["Player detected.","Common sense not detected.","Bon courage. Tu vas en avoir besoin."],
  ["Ah, merde.","I was hoping you’d forgotten this game.","Trop tard. Entre, beau gosse."],
  ["Still here? Impressive.","At this point even the game is concerned.","Mais toi, tu continues. Un peu triste. Très courageux."],
  ["Coucou, catastrophe.","Ready to lose lives with confidence?","Magnifique. Fais n’importe quoi, mais avec style."]
];

function showRandomWelcome(){
  const m=welcomeMessages[Math.floor(Math.random()*welcomeMessages.length)];
  document.getElementById("welcome-title").textContent=m[0];
  document.getElementById("welcome-main").textContent=m[1];
  document.getElementById("welcome-french").textContent=m[2];
  document.getElementById("welcome-modal").classList.remove("hidden");
}

function closeWelcome(){
  state.firstLoginSeen=true;
  try{saveState();}catch(_){}
  document.getElementById("welcome-modal").classList.add("hidden");
  showScreen("screen-home");
}
document.getElementById("close-welcome").addEventListener("click",closeWelcome);
document.getElementById("welcome-continue").addEventListener("click",closeWelcome);

document.querySelector('[data-part="indonesia"]').addEventListener("click",()=>showScreen("screen-indonesia"));
document.querySelectorAll(".back-home").forEach(b=>b.addEventListener("click",()=>showScreen("screen-home")));

document.getElementById("open-tinder").addEventListener("click",()=>{
  state.parts.indonesia.minigames.tinder.attempts++;
  state.currentProfile=0;state.history=[];state.lives=MAX_LIVES;
  rebuildProfiles();renderLives();renderProfile();saveState();
  showScreen("screen-tinder");
});
document.getElementById("back-indonesia").addEventListener("click",()=>showScreen("screen-indonesia"));
document.getElementById("rewind-btn").addEventListener("click",rewind);
document.getElementById("nope-btn").addEventListener("click",()=>swipe("left"));
document.getElementById("like-btn").addEventListener("click",()=>swipe("right"));

document.getElementById("finish-tinder").addEventListener("click",()=>{
  const t=state.parts.indonesia.minigames.tinder;
  t.completed=true;t.bestLivesLeft=Math.max(t.bestLivesLeft||0,state.lives);
  state.parts.indonesia.minigames.game2.unlocked=true;
  saveState();renderProgress();showScreen("screen-indonesia");
});

function openDebt(){renderDebt();document.getElementById("debt-modal").classList.remove("hidden");}
document.getElementById("debt-btn").addEventListener("click",openDebt);
document.querySelectorAll(".debt-open").forEach(b=>b.addEventListener("click",openDebt));
document.getElementById("close-debt").addEventListener("click",()=>document.getElementById("debt-modal").classList.add("hidden"));

document.getElementById("home-player").textContent=state.playerName||"—";
document.getElementById("player-name").value="Anastasia";
document.getElementById("access-code").value="indonesia";
renderDebt();renderLives();renderProgress();rebuildProfiles();






document.getElementById("open-churros").addEventListener("click",()=>{
  if(!state.parts.indonesia.minigames.game2.unlocked)return;
  resetChurros();showScreen("screen-churros");
});
document.getElementById("start-churros").addEventListener("click",startChurros);
document.querySelector(".churros-back").addEventListener("click",()=>{stopChurros();showScreen("screen-indonesia");});
document.getElementById("finish-churros").addEventListener("click",()=>{
  state.parts.indonesia.minigames.game2.completed=true;
  state.parts.indonesia.minigames.game3.unlocked=true;
  saveState();renderProgress();renderChurrosMission();renderPadelMission();showScreen("screen-indonesia");
});
document.addEventListener("keydown",e=>{
  if(!document.getElementById("screen-churros").classList.contains("active"))return;
  if(["ArrowLeft","ArrowRight","KeyA","KeyD"].includes(e.code))e.preventDefault();
  if(e.code==="ArrowLeft"||e.code==="KeyA")churros.keys.left=true;
  if(e.code==="ArrowRight"||e.code==="KeyD")churros.keys.right=true;
});
document.addEventListener("keyup",e=>{
  if(e.code==="ArrowLeft"||e.code==="KeyA")churros.keys.left=false;
  if(e.code==="ArrowRight"||e.code==="KeyD")churros.keys.right=false;
});
renderChurrosMission();

document.getElementById("open-padel").addEventListener("click",enterPadel);

document.getElementById("start-padel").addEventListener("click",async()=>{
  resetPadelMatch();
  showScreen("screen-padel");
  await runCountdown();
  if(document.getElementById("screen-padel").classList.contains("active")){
    startRally();
  }
});

document.querySelectorAll(".padel-back").forEach(b=>b.addEventListener("click",()=>{
  padel.roundActive=false;
  padel.finished=true;
  padel.paused=false;
  cancelAnimationFrame(padel.raf);
  showScreen("screen-indonesia");
}));

document.getElementById("padel-hit").addEventListener("click",hitPadel);
document.getElementById("padel-pause").addEventListener("click",()=>togglePadelPause());
document.getElementById("padel-resume").addEventListener("click",()=>togglePadelPause(false));

document.addEventListener("keydown",e=>{
  if(!document.getElementById("screen-padel").classList.contains("active"))return;
  if(["ArrowLeft","ArrowRight","KeyA","KeyD","Space","KeyP"].includes(e.code))e.preventDefault();

  if(e.code==="ArrowLeft"||e.code==="KeyA")padel.keys.left=true;
  if(e.code==="ArrowRight"||e.code==="KeyD")padel.keys.right=true;
  if(e.code==="Space"&&!e.repeat)hitPadel();
  if(e.code==="KeyP"&&!e.repeat)togglePadelPause();
});

document.addEventListener("keyup",e=>{
  if(e.code==="ArrowLeft"||e.code==="KeyA")padel.keys.left=false;
  if(e.code==="ArrowRight"||e.code==="KeyD")padel.keys.right=false;
});

renderPadelMission();
