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
function renderLives(){
  document.getElementById("lives").textContent="❤️".repeat(state.lives)+"🖤".repeat(MAX_LIVES-state.lives);
}
function renderProgress(){
  const games=Object.values(state.parts.indonesia.minigames);
  const done=games.filter(g=>g.completed).length;
  document.querySelectorAll(".indonesia-progress").forEach(e=>e.textContent=`${done}/${games.length} MISSIONS COMPLETE`);
  const t=state.parts.indonesia.minigames.tinder;
  const st=document.getElementById("tinder-status");
  if(st)st.textContent=t.completed?"✓ COMPLETE":"PLAY →";
  if(typeof renderPadelMission==="function")renderPadelMission();
}
function loseLife(msg){
  state.lives--;
  if(state.lives<=0){
    state.debt++;
    state.lives=MAX_LIVES;
    saveState();renderDebt();renderLives();
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


/* ===== MISSION 02: PADEL ===== */
let padel={
  you:0,cpu:0,lives:3,roundActive:false,startTime:0,duration:1650,
  raf:null,finished:false,paused:false,pauseStarted:0,
  playerX:50,ballTargetX:50,rallyCount:0,
  keys:{left:false,right:false},lastFrame:0
};

function renderPadelMission(){
  const g=state.parts.indonesia.minigames.game2;
  const btn=document.getElementById("open-padel");
  const status=document.getElementById("padel-status");
  if(!btn||!status)return;
  if(g.completed){btn.classList.remove("locked");status.textContent="✓ COMPLETE";}
  else if(g.unlocked){btn.classList.remove("locked");status.textContent="PLAY →";}
  else{btn.classList.add("locked");status.textContent="LOCKED";}
}

function renderPadelHud(){
  const score=document.getElementById("padel-score");
  const lives=document.getElementById("padel-lives");
  if(score)score.textContent=`YOU ${padel.you} — ${padel.cpu} CPU`;
  if(lives)lives.textContent="❤️".repeat(padel.lives)+"🖤".repeat(3-padel.lives);
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
  if(el)el.style.left=padel.playerX+"%";
}

function setBallProgress(p){
  const ball=document.getElementById("padel-ball");
  const marker=document.getElementById("timing-marker");
  if(!ball||!marker)return;
  const top=22+p*62;
  const startX=50;
  const curve=Math.sin(p*Math.PI)*((padel.ballTargetX-startX)*.18);
  const x=startX+(padel.ballTargetX-startX)*p+curve;
  ball.style.top=top+"%";
  ball.style.left=x+"%";
  marker.style.left=`calc(${Math.max(0,Math.min(1,p))*100}% - 2px)`;
}

function currentSpeedDuration(){
  // Gets ~4% faster per rally, capped so it stays playable.
  return Math.max(900,1650*Math.pow(.96,padel.rallyCount));
}

function startRally(){
  if(padel.roundActive||padel.finished||padel.paused)return;
  padel.roundActive=true;
  padel.rallyCount++;
  padel.startTime=performance.now();
  padel.duration=currentSpeedDuration();
  padel.ballTargetX=20+Math.random()*60;
  setBallProgress(0);

  function frame(t){
    if(!padel.roundActive||padel.finished)return;
    if(padel.paused){padel.raf=requestAnimationFrame(frame);return;}

    const dt=padel.lastFrame ? Math.min(32,t-padel.lastFrame) : 16;
    padel.lastFrame=t;
    const moveSpeed=.038*dt;
    if(padel.keys.left)padel.playerX=Math.max(13,padel.playerX-moveSpeed);
    if(padel.keys.right)padel.playerX=Math.min(87,padel.playerX+moveSpeed);
    updatePlayer();

    const p=(t-padel.startTime)/padel.duration;
    setBallProgress(Math.min(p,1));
    if(p>=1){
      padel.roundActive=false;
      cpuPoint("MISSED","The ball was somewhere else. So were you.");
      return;
    }
    padel.raf=requestAnimationFrame(frame);
  }
  padel.lastFrame=0;
  padel.raf=requestAnimationFrame(frame);
}

function scheduleNextRally(){
  if(padel.finished||padel.paused)return;
  setTimeout(()=>{if(!padel.paused&&!padel.finished)startRally()},650);
}

function playerPoint(title,text){
  padel.you++;renderPadelHud();padelNotify(title,text,"good");
  if(padel.you>=5)return finishPadelMatch(true);
  scheduleNextRally();
}
function cpuPoint(title,text){
  padel.cpu++;renderPadelHud();padelNotify(title,text,"bad");
  if(padel.cpu>=5)return finishPadelMatch(false);
  scheduleNextRally();
}

function hitPadel(){
  if(!padel.roundActive||padel.finished||padel.paused)return;
  const p=(performance.now()-padel.startTime)/padel.duration;
  const timingDistance=Math.abs(p-.76);
  const positionDistance=Math.abs(padel.playerX-padel.ballTargetX);

  // Now BOTH timing and player position matter.
  if(positionDistance>15){
    padel.roundActive=false;cancelAnimationFrame(padel.raf);
    cpuPoint("TOO FAR","Move your sexy ass toward the ball.");
    return;
  }

  padel.roundActive=false;cancelAnimationFrame(padel.raf);
  if(timingDistance<=.05) playerPoint("PERFECT","Okay, champion.");
  else if(timingDistance<=.11) playerPoint("GREAT","Sexy and coordinated. Suspicious.");
  else if(timingDistance<=.18){
    if(Math.random()<.55)playerPoint("GOOD","Not elegant. Still counts.");
    else cpuPoint(p<.76?"TOO EARLY":"TOO LATE","Timing, beau gosse.");
  }else cpuPoint(p<.76?"TOO EARLY":"TOO LATE",p<.76?"Fighting the air again.":"The ball has already moved on.");
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
    if(!padel.roundActive&&!padel.finished)setTimeout(startRally,300);
  }
}

function showPadelResult(title,copy,buttonText,handler){
  const box=document.getElementById("padel-result");
  document.getElementById("padel-result-title").textContent=title;
  document.getElementById("padel-result-copy").textContent=copy;
  const btn=document.getElementById("padel-result-btn");
  btn.textContent=buttonText;btn.onclick=handler;
  box.classList.remove("hidden");
}

function finishPadelMatch(won){
  padel.finished=true;padel.roundActive=false;cancelAnimationFrame(padel.raf);

  // The joke is that the mission passes either way.
  state.parts.indonesia.minigames.game2.completed=true;
  state.parts.indonesia.minigames.game3.unlocked=true;
  saveState();renderProgress();renderPadelMission();

  showPadelResult(
    won ? "MATCH RESULT — YOU WIN" : "MATCH OVER",
    won ? "Fine. You actually won the match." : "Technically you lost. Emotionally? Irrelevant.",
    "CONTINUE →",
    ()=>{
      document.getElementById("padel-result").classList.add("hidden");
      showScreen("screen-indonesia");
    }
  );
}

function resetPadelMatch(){
  document.getElementById("padel-result").classList.add("hidden");
  document.getElementById("padel-pause-overlay").classList.add("hidden");
  padel.you=0;padel.cpu=0;padel.finished=false;padel.roundActive=false;padel.paused=false;
  padel.playerX=50;padel.rallyCount=0;padel.keys.left=false;padel.keys.right=false;
  renderPadelHud();updatePlayer();setBallProgress(0);
  setTimeout(startRally,600);
}
function enterPadel(){
  if(!state.parts.indonesia.minigames.game2.unlocked)return;
  showScreen("screen-padel-intro");
}

document.getElementById("login-btn").addEventListener("click",()=>{
  const n=document.getElementById("player-name").value.trim();
  const c=document.getElementById("access-code").value.trim();
  const e=document.getElementById("login-error");
  if(!n){e.textContent="Enter player name.";return;}
  if(c.toLowerCase()!==ACCESS_CODE){e.textContent="ACCESS DENIED";return;}
  state.playerName=n;saveState();document.getElementById("home-player").textContent=n;e.textContent="";
  showScreen("screen-home");
  if(!state.firstLoginSeen)document.getElementById("welcome-modal").classList.remove("hidden");
});

function closeWelcome(){
  state.firstLoginSeen=true;saveState();
  document.getElementById("welcome-modal").classList.add("hidden");
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
if(state.playerName)document.getElementById("player-name").value=state.playerName;
renderDebt();renderLives();renderProgress();rebuildProfiles();



document.getElementById("open-padel").addEventListener("click",enterPadel);
document.getElementById("start-padel").addEventListener("click",()=>{
  padel.you=0;padel.cpu=0;padel.lives=3;padel.finished=false;padel.roundActive=false;padel.paused=false;
  padel.playerX=50;padel.rallyCount=0;padel.keys.left=false;padel.keys.right=false;
  document.getElementById("padel-result").classList.add("hidden");
  document.getElementById("padel-pause-overlay").classList.add("hidden");
  renderPadelHud();updatePlayer();
  showScreen("screen-padel");
  setTimeout(startRally,650);
});
document.querySelectorAll(".padel-back").forEach(b=>b.addEventListener("click",()=>{
  padel.roundActive=false;padel.finished=true;padel.paused=false;
  cancelAnimationFrame(padel.raf);showScreen("screen-indonesia");
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
