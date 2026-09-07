const ACCESS_CODE = "indonesia";
const MAX_LIVES = 3;
const SAVE_KEY = "thebestgame_save_v1";

function defaultSave(){
  return {
    version:1,
    playerName:"",
    debt:0,
    debtEvents:[],
    firstLoginSeen:false,
    parts:{
      indonesia:{
        unlocked:true,
        completed:false,
        minigames:{
          tinder:{unlocked:true,completed:false,attempts:0,bestLivesLeft:0},
          game2:{unlocked:false,completed:false},
          game3:{unlocked:false,completed:false}
        }
      },
      russia:{unlocked:false,completed:false,minigames:{}}
    }
  }
}

function loadSave(){
  try{
    const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(!saved) return defaultSave();
    const base=defaultSave();
    return {
      ...base,
      ...saved,
      parts:{
        ...base.parts,
        ...(saved.parts||{}),
        indonesia:{
          ...base.parts.indonesia,
          ...(saved.parts?.indonesia||{}),
          minigames:{
            ...base.parts.indonesia.minigames,
            ...(saved.parts?.indonesia?.minigames||{})
          }
        }
      }
    }
  }catch{
    return defaultSave();
  }
}

const state={...loadSave(),lives:MAX_LIVES,currentProfile:0};

const baseProfiles=[
  {
    name:"Drako",age:28,image:"assets/dragon.png",
    bio:"Entrepreneur. Traveling the world. Looking for someone to share new adventures with.",
    meta:"Canggu • 2 km away",
    like:{type:"life",text:"MATCH. He breathed fire during appetizers. -1 HP."},
    nope:{type:"safe",text:"Reasonable. Eyebrows preserved."}
  },
  {
    name:"Xyra",age:29,image:"assets/alien.png",
    bio:"New to Earth. Fluent in three galaxies. Still figuring out small talk.",
    meta:"Uluwatu • signal unstable",
    like:{type:"life",text:"You have been selected for research. -1 HP."},
    nope:{type:"safe",text:"Earth retains one citizen."}
  },
  {
    name:"Leo",age:34,image:"assets/male.png",
    bio:"Gym, espresso, bad decisions. 'Just seeing what happens.'",
    meta:"Seminyak • 5 km away",
    like:{type:"life",text:"Unexpected side quest. Wrong target audience. -1 HP."},
    nope:{type:"safe",text:"Main mission continues."}
  },
  {
    name:"Milo",age:27,image:"assets/cat.png",
    bio:"Independent. Sleeps 16 hours. Will judge you silently.",
    meta:"Ubud • probably indoors",
    like:{type:"life",text:"He knocked your drink off the table and left. -1 HP."},
    nope:{type:"safe",text:"Good instincts."}
  },
  {
    name:"Max",age:32,image:"assets/man2.png",
    bio:"Finance bro. Padél at 7. Networking at 8. Personality TBD.",
    meta:"Canggu • 1 km away",
    like:{type:"life",text:"He explained crypto for 47 minutes. -1 HP."},
    nope:{type:"safe",text:"Sanity +10."}
  },
  {
    name:"Bella",age:26,image:"assets/woman.png",
    bio:"47 countries. Pilates. Matcha. Don't waste my time.",
    meta:"Canggu • 3 km away",
    like:{type:"life",text:"Dinner bill: 4,850,000 IDR. Critical wallet damage. -1 HP."},
    nope:{type:"safe",text:"Your bank account thanks you."}
  }
];

const finalProfile={
  name:"Anastasia",age:25,image:"assets/anastasia_real.jpeg",
  bio:"Russian. Love bumble coffee and kinder bueno",
  meta:"Bali • very close",
  isFinal:true,
  like:{type:"match",text:"Finally."},
  nope:{type:"return",text:"Excuse me? That option appears to be broken."}
};

let profiles=[];

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function rebuildProfiles(){
  profiles=[...shuffle(baseProfiles),finalProfile];
}

function saveState(){
  localStorage.setItem(SAVE_KEY,JSON.stringify({
    version:state.version,
    playerName:state.playerName,
    debt:state.debt,
    debtEvents:state.debtEvents,
    firstLoginSeen:state.firstLoginSeen,
    parts:state.parts
  }));
}

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function renderDebt(){
  document.getElementById("debt-top").textContent=state.debt;
  document.querySelectorAll(".debt-any").forEach(el=>el.textContent=state.debt);
  document.getElementById("debt-big").textContent=state.debt;
}

function renderLives(){
  document.getElementById("lives").textContent="❤️".repeat(state.lives)+"🖤".repeat(MAX_LIVES-state.lives);
}

function renderProgress(){
  const games=Object.values(state.parts.indonesia.minigames);
  const completed=games.filter(g=>g.completed).length;
  document.querySelectorAll(".indonesia-progress").forEach(el=>el.textContent=`${completed}/${games.length} MISSIONS COMPLETE`);
  const tinder=state.parts.indonesia.minigames.tinder;
  const status=document.getElementById("tinder-status");
  if(status) status.textContent=tinder.completed?"✓ COMPLETE":"PLAY →";
}

function loseLife(reason){
  state.lives-=1;
  if(state.lives<=0){
    state.debt+=1;
    state.debtEvents.push("+1 pain au chocolat");
    state.lives=MAX_LIVES;
    saveState(); renderDebt(); renderLives();
    return "NO HP LEFT. Respawned. Debt +1 pain au chocolat.";
  }
  saveState(); renderLives();
  return reason;
}

function renderProfile(){
  const stack=document.getElementById("card-stack");
  stack.innerHTML="";
  const p=profiles[state.currentProfile];
  if(!p) return;
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

function swipe(direction){
  const p=profiles[state.currentProfile];
  const action=direction==="right"?p.like:p.nope;
  const msg=document.getElementById("game-message");

  if(p.isFinal && direction==="left"){
    msg.textContent=action.text;
    const card=document.querySelector(".profile-card");
    if(card) card.animate(
      [{transform:"translateX(-10px)"},{transform:"translateX(10px)"},{transform:"translateX(0)"}],
      {duration:300}
    );
    return;
  }

  const card=document.querySelector(".profile-card");
  if(card){
    card.style.transform=direction==="right"?"translateX(150%) rotate(18deg)":"translateX(-150%) rotate(-18deg)";
    card.style.opacity="0";
  }

  if(action.type==="life") msg.textContent=loseLife(action.text);
  else if(action.type==="match"){
    msg.textContent=action.text;
    setTimeout(()=>showScreen("screen-match"),280);
    return;
  } else msg.textContent=action.text;

  setTimeout(nextProfile,260);
}

function attachDrag(card){
  let startX=0,currentX=0,dragging=false;
  card.addEventListener("pointerdown",e=>{
    dragging=true;startX=e.clientX;card.setPointerCapture(e.pointerId);card.style.transition="none";
  });
  card.addEventListener("pointermove",e=>{
    if(!dragging)return;
    currentX=e.clientX-startX;
    card.style.transform=`translateX(${currentX}px) rotate(${currentX/18}deg)`;
  });
  const end=()=>{
    if(!dragging)return;
    dragging=false;card.style.transition="transform .25s,opacity .25s";
    if(currentX>95)swipe("right");
    else if(currentX<-95)swipe("left");
    else card.style.transform="translateX(0) rotate(0)";
    currentX=0;
  };
  card.addEventListener("pointerup",end);
  card.addEventListener("pointercancel",end);
}

document.getElementById("login-btn").addEventListener("click",()=>{
  const name=document.getElementById("player-name").value.trim();
  const code=document.getElementById("access-code").value.trim();
  const err=document.getElementById("login-error");
  if(!name){err.textContent="Enter player name.";return;}
  if(code.toLowerCase()!==ACCESS_CODE){err.textContent="ACCESS DENIED";return;}
  state.playerName=name;saveState();
  document.getElementById("home-player").textContent=name;
  err.textContent="";
  showScreen("screen-home");

  if(!state.firstLoginSeen){
    document.getElementById("welcome-modal").classList.remove("hidden");
  }
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
  state.parts.indonesia.minigames.tinder.attempts+=1;
  state.currentProfile=0;state.lives=MAX_LIVES;
  rebuildProfiles();renderLives();renderProfile();
  document.getElementById("game-message").textContent="Swipe. Try not to die.";
  saveState();showScreen("screen-tinder");
});
document.getElementById("back-indonesia").addEventListener("click",()=>showScreen("screen-indonesia"));
document.getElementById("nope-btn").addEventListener("click",()=>swipe("left"));
document.getElementById("like-btn").addEventListener("click",()=>swipe("right"));

document.getElementById("finish-tinder").addEventListener("click",()=>{
  const tinder=state.parts.indonesia.minigames.tinder;
  tinder.completed=true;
  tinder.bestLivesLeft=Math.max(tinder.bestLivesLeft||0,state.lives);
  state.parts.indonesia.minigames.game2.unlocked=true;
  saveState();renderProgress();showScreen("screen-indonesia");
});

function openDebt(){renderDebt();document.getElementById("debt-modal").classList.remove("hidden")}
document.getElementById("debt-btn").addEventListener("click",openDebt);
document.querySelectorAll(".debt-open").forEach(b=>b.addEventListener("click",openDebt));
document.getElementById("close-debt").addEventListener("click",()=>document.getElementById("debt-modal").classList.add("hidden"));

function openInventory(){document.getElementById("inventory-modal").classList.remove("hidden")}
document.getElementById("inventory-btn").addEventListener("click",openInventory);
document.querySelectorAll(".inventory-open").forEach(b=>b.addEventListener("click",openInventory));
document.getElementById("close-inventory").addEventListener("click",()=>document.getElementById("inventory-modal").classList.add("hidden"));

document.getElementById("home-player").textContent=state.playerName||"—";
if(state.playerName)document.getElementById("player-name").value=state.playerName;
renderDebt();renderLives();renderProgress();rebuildProfiles();
