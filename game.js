const ACCESS_CODE = "indonesia";
const SAVE_KEY = "thebestgame_save_v2";
const MAX_LIVES = 3;

const DEFAULT_SAVE = {
  version: 2,
  playerName: "",
  debt: 0,
  debtEvents: [],
  parts: {
    indonesia: {
      unlocked: true,
      completed: false,
      minigames: {
        tinder: { unlocked: true, completed: false, attempts: 0, bestLivesLeft: 0 },
        game2: { unlocked: false, completed: false },
        game3: { unlocked: false, completed: false }
      }
    },
    russia: { unlocked: false, completed: false, minigames: {} }
  }
};

function loadSave(){
  try{
    const x=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(!x) return structuredClone(DEFAULT_SAVE);
    return {
      ...structuredClone(DEFAULT_SAVE), ...x,
      parts:{
        ...structuredClone(DEFAULT_SAVE.parts), ...(x.parts||{}),
        indonesia:{
          ...structuredClone(DEFAULT_SAVE.parts.indonesia), ...(x.parts?.indonesia||{}),
          minigames:{...structuredClone(DEFAULT_SAVE.parts.indonesia.minigames), ...(x.parts?.indonesia?.minigames||{})}
        }
      }
    };
  }catch{return structuredClone(DEFAULT_SAVE)}
}

const state={...loadSave(), lives:MAX_LIVES, currentProfile:0, deck:[]};

const decoys=[
  {name:"Drako",age:28,image:"assets/dragon.png",bio:"Entrepreneur. Traveling the world. Looking for someone to share new adventures with.",meta:"Canggu · 3 km away",like:{type:"life",text:"MATCH. He said you looked snackable. He meant it literally. -1 HP."},nope:{type:"safe",text:"Excellent survival instincts."}},
  {name:"Marc",age:32,image:"assets/male.png",bio:"Gym, coffee, sunsets. Open-minded. Extremely open-minded.",meta:"Seminyak · 4 km away",like:{type:"life",text:"Unexpected side quest unlocked. Mission objective remains unchanged. -1 HP."},nope:{type:"safe",text:"Main quest preserved."}},
  {name:"Sir Whiskers",age:27,image:"assets/cat.png",bio:"Independent. Emotionally unavailable. Will ignore you for six hours and then demand attention.",meta:"Ubud · 11 km away",like:{type:"life",text:"You are now responsible for 4 a.m. zoomies. -1 HP."},nope:{type:"safe",text:"He judges you, but you survive."}},
  {name:"Xyra",age:29,image:"assets/alien.png",bio:"New to Earth. Looking for a local guide. Definitely not collecting specimens.",meta:"Bali(?) · 0 km away",like:{type:"life",text:"Congratulations. You volunteered for interplanetary research. -1 HP."},nope:{type:"safe",text:"Earth keeps one more citizen."}},
  {name:"Bella",age:26,image:"assets/woman.png",bio:"Pilates. Brunch. 47 countries. If you know, you know ✨",meta:"Canggu · 1 km away",like:{type:"life",text:"Dinner bill: 4,850,000 IDR. Critical wallet damage. -1 HP."},nope:{type:"safe",text:"Your bank account gained +10 morale."}},
  {name:"Nico",age:34,image:"assets/man2.png",bio:"Good wine, motorcycles and bad ideas. Here for the plot.",meta:"Denpasar · 8 km away",like:{type:"life",text:"Plot twist: this was not your romantic storyline. -1 HP."},nope:{type:"safe",text:"Narrative consistency restored."}}
];
const finalProfile={name:"Anastasia",age:25,image:"assets/anastasia.jpeg",bio:"Russian. Love bumble coffee and kinder bueno ♡",meta:"Bali · close enough",isFinal:true,like:{type:"match",text:"Finally."},nope:{type:"return",text:"Excuse me? That button appears to be broken."}};

function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function resetDeck(){state.deck=[...shuffle(decoys),finalProfile];state.currentProfile=0;renderProfile();renderQueue()}
function saveState(){localStorage.setItem(SAVE_KEY,JSON.stringify({version:state.version,playerName:state.playerName,debt:state.debt,debtEvents:state.debtEvents,parts:state.parts}))}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id)?.classList.add('active');window.scrollTo(0,0)}
function renderDebt(){document.getElementById('debt-top').textContent=state.debt;document.querySelectorAll('.debt-any').forEach(e=>e.textContent=state.debt);document.getElementById('debt-big').textContent=state.debt;const h=document.getElementById('debt-history');h.innerHTML=state.debtEvents.length?state.debtEvents.slice(-6).reverse().map(x=>`<div>🥐 ${x}</div>`).join(''):'No debt yet. Suspiciously competent.'}
function renderProgress(){const games=Object.values(state.parts.indonesia.minigames);const done=games.filter(g=>g.completed).length;document.querySelectorAll('.indonesia-progress').forEach(e=>e.textContent=`${done}/${games.length} MISSIONS COMPLETE`);const t=state.parts.indonesia.minigames.tinder;const s=document.getElementById('tinder-status');if(s)s.textContent=t.completed?'✓ COMPLETE':'PLAY →'}
function renderLives(){document.getElementById('lives').textContent='❤️'.repeat(state.lives)+'🖤'.repeat(MAX_LIVES-state.lives)}
function loseLife(reason){state.lives--;renderLives();if(state.lives<=0){state.debt++;state.debtEvents.push(`+1 pain au chocolat — ${reason}`);state.lives=MAX_LIVES;saveState();renderDebt();renderLives();return 'NO HP LEFT. Respawn granted. Tactical penalty: +1 pain au chocolat.'}saveState();return reason}
function renderProfile(){const p=state.deck[state.currentProfile];const stack=document.getElementById('card-stack');if(!stack||!p)return;stack.innerHTML=`<div class="profile-card"><div class="profile-visual"><img src="${p.image}" alt="${p.name}"></div><div class="profile-copy"><h3>${p.name}, ${p.age}</h3><p>${p.bio}</p><div class="profile-meta">${p.meta}</div></div></div>`;attachDrag(stack.firstElementChild)}
function renderQueue(){const q=document.getElementById('queue-list');if(!q)return;q.innerHTML=state.deck.map((p,i)=>`<div class="queue-thumb ${i===state.currentProfile?'current':''}"><img src="${p.image}" alt=""></div>`).join('')}
function nextProfile(){state.currentProfile=Math.min(state.currentProfile+1,state.deck.length-1);renderProfile();renderQueue()}
function swipe(direction){const p=state.deck[state.currentProfile];if(!p)return;const action=direction==='right'?p.like:p.nope;const msg=document.getElementById('game-message');if(p.isFinal&&direction==='left'){msg.textContent=action.text;document.querySelector('.profile-card')?.animate([{transform:'translateX(-12px) rotate(-2deg)'},{transform:'translateX(12px) rotate(2deg)'},{transform:'translateX(0)'}],{duration:330});return}const card=document.querySelector('.profile-card');if(card){card.style.transform=direction==='right'?'translateX(150%) rotate(18deg)':'translateX(-150%) rotate(-18deg)';card.style.opacity='0'}if(action.type==='life')msg.textContent=loseLife(action.text);else if(action.type==='match'){msg.textContent=action.text;setTimeout(()=>showScreen('screen-match'),300);return}else msg.textContent=action.text;setTimeout(nextProfile,280)}
function attachDrag(card){let sx=0,cx=0,drag=false;card.addEventListener('pointerdown',e=>{drag=true;sx=e.clientX;card.setPointerCapture(e.pointerId);card.style.transition='none'});card.addEventListener('pointermove',e=>{if(!drag)return;cx=e.clientX-sx;card.style.transform=`translateX(${cx}px) rotate(${cx/18}deg)`});const end=()=>{if(!drag)return;drag=false;card.style.transition='transform .25s,opacity .25s';if(cx>95)swipe('right');else if(cx<-95)swipe('left');else card.style.transform='';cx=0};card.addEventListener('pointerup',end);card.addEventListener('pointercancel',end)}

function enterIndonesia(){showScreen('screen-indonesia')}
document.querySelectorAll('[data-open="indonesia"]').forEach(b=>b.addEventListener('click',enterIndonesia));document.getElementById('svg-indonesia')?.addEventListener('click',enterIndonesia);document.querySelectorAll('.back-home').forEach(b=>b.addEventListener('click',()=>showScreen('screen-home')));
document.getElementById('login-btn').addEventListener('click',()=>{const name=document.getElementById('player-name').value.trim();const code=document.getElementById('access-code').value.trim().toLowerCase();const err=document.getElementById('login-error');if(!name){err.textContent='ENTER PLAYER NAME';return}if(code!==ACCESS_CODE){err.textContent='ACCESS DENIED';return}state.playerName=name;saveState();document.getElementById('home-player').textContent=name.toUpperCase();err.textContent='';showScreen('screen-home')});
document.getElementById('open-tinder').addEventListener('click',()=>{state.parts.indonesia.minigames.tinder.attempts++;state.lives=MAX_LIVES;saveState();renderLives();resetDeck();document.getElementById('game-message').textContent='Drag the card or choose.';showScreen('screen-tinder')});
document.getElementById('back-indonesia').addEventListener('click',()=>showScreen('screen-indonesia'));document.getElementById('nope-btn').addEventListener('click',()=>swipe('left'));document.getElementById('like-btn').addEventListener('click',()=>swipe('right'));document.getElementById('like-btn-2').addEventListener('click',()=>swipe('right'));
document.getElementById('finish-tinder').addEventListener('click',()=>{const t=state.parts.indonesia.minigames.tinder;t.completed=true;t.bestLivesLeft=Math.max(t.bestLivesLeft||0,state.lives);state.parts.indonesia.minigames.game2.unlocked=true;saveState();renderProgress();showScreen('screen-indonesia')});
document.querySelectorAll('.debt-open').forEach(b=>b.addEventListener('click',()=>{renderDebt();document.getElementById('debt-modal').classList.remove('hidden')}));document.getElementById('close-debt').addEventListener('click',()=>document.getElementById('debt-modal').classList.add('hidden'));document.getElementById('debt-modal').addEventListener('click',e=>{if(e.target.id==='debt-modal')e.currentTarget.classList.add('hidden')});
if(state.playerName){document.getElementById('player-name').value=state.playerName;document.getElementById('home-player').textContent=state.playerName.toUpperCase()}renderDebt();renderProgress();renderLives();
