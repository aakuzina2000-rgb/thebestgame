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

function showSwipePopup(text,type="safe"){
  const old=document.querySelector(".swipe-popup");
  if(old)old.remove();
  const pop=document.createElement("div");
  pop.className=`swipe-popup ${type}`;
  pop.innerHTML=`<span>${type==="life"?"−1 LIFE":"✓ LIFE SAVED"}</span><strong>${text}</strong>`;
  document.body.appendChild(pop);
  requestAnimationFrame(()=>pop.classList.add("show"));
  setTimeout(()=>pop.classList.remove("show"),1450);
  setTimeout(()=>pop.remove(),1800);
}

function swipe(dir){
  const p=profiles[state.currentProfile];
  const action=dir==="right"?p.like:p.nope;
  const msg=document.getElementById("game-message");

  if(p.isFinal&&dir==="left"){
    msg.textContent=action.text;
    const c=document.querySelector(".profile-card");
    if(c)c.animate([{transform:"translateX(-10px)"},{transform:"translateX(10px)"},{transform:"translateX(0)"}],{duration:300});
    return;
  }

  state.history.push(state.currentProfile);

  const c=document.querySelector(".profile-card");
  if(c){
    c.style.transform=dir==="right"?"translateX(150%) rotate(18deg)":"translateX(-150%) rotate(-18deg)";
    c.style.opacity="0";
  }

  if(action.type==="life"){
    const result=loseLife(action.text);
    msg.textContent=result;
    showSwipePopup(result,"life");
  }
  else if(action.type==="match"){
    msg.textContent=action.text;
    showSwipePopup("Correct choice. Suspiciously correct.","safe");
    setTimeout(()=>showScreen("screen-match"),900);
    return;
  }else{
    msg.textContent=action.text;
    showSwipePopup(action.text,"safe");
  }

  setTimeout(nextProfile,260);
}

function rewind(){
  const msg=document.getElementById("game-message");
  if(!state.history.length){
    msg.textContent="Nothing to rewind. Time machine not installed.";
    return;
  }
  state.currentProfile=state.history.pop();
  renderProfile();
  msg.textContent="Rewound. Pretend that never happened.";
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
  document.getElementById("game-message").textContent="Swipe. Try not to die.";
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
