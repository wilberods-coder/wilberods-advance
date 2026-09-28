import * as THREE from './vendor/three.module.js';
import {createConsole} from './console.js';

const stage=document.querySelector('#stage');
const screenCanvas=document.createElement('canvas');screenCanvas.width=1536;screenCanvas.height=1024;
const ctx=screenCanvas.getContext('2d');ctx.scale(2,2);
const names=['GitHub','Modrinth','Steam','Проекты','NEON ARENA'];
const links=['https://github.com/wilberods-coder','https://modrinth.com/user/wilberods-coder','https://steamcommunity.com/id/ScuderiiaFerrari/'];
const projects=[['nebula-gaming-keyboard','3D gaming keyboard · HTML'],['Pdd-site','Веб-проект'],['calculator.py','Калькулятор · Python']];
let mode='menu',selected=0,projectSelected=0,muted=true,audio,paused=false,started=false,over=false;
let renderer,scene,camera,unit,screen,texture,previous=0,clock=0,zoom=0,lid,shadow;
let entered=false,entrance=0;
const keys=new Set(),hits=[],ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const status=document.querySelector('#status');
function beep(freq=400,duration=.05){if(muted)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{}}
document.querySelector('#sound').onclick=e=>{muted=!muted;const b=e.currentTarget;b.innerHTML=muted?'Звук выкл. <span>◌</span>':'Звук вкл. <span>◉</span>';b.setAttribute('aria-pressed',String(!muted));beep(650)};
function rr(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
function text(s,x,y,size=22,color='#dfecd6',align='left'){ctx.font=`600 ${size}px Arial, sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y)}
function drawMenu(){
ctx.fillStyle='#102022';ctx.fillRect(0,0,768,512);
text(mode==='projects'?'МОИ ПРОЕКТЫ':'WILBERODS',32,52,32,'#caffbc');
text(mode==='projects'?'03':'MENU',735,50,25,'#aac5bd','right');
if(mode==='projects'){
projects.forEach((p,i)=>{let y=90+i*118;rr(ctx,22,y,724,106,7,i===projectSelected?'#d2f6bd':'#21393a');
text(p[0]==='nebula-gaming-keyboard'?'NEBULA keyboard':p[0],42,y+44,38,i===projectSelected?'#112921':'#edf8ee');
text(p[1],42,y+81,28,i===projectSelected?'#35593c':'#b9d0c8');text('↗',718,y+48,35,i===projectSelected?'#112921':'#edf8ee','right')});
text('B / ESC — НАЗАД',32,488,27,'#c4ddd1');return}
names.forEach((name,i)=>{let y=80+i*76;rr(ctx,22,y,724,68,7,i===selected?'#d2f6bd':'#21393a');
text(name,48,y+50,54,i===selected?'#112921':'#edf8ee');text(i===4?'▶':'↗',715,y+45,32,i===selected?'#25462d':'#c1d8cd','right')});
text('↑↓ ВЫБРАТЬ',30,492,25,'#c4ddd1');text('A / ENTER',736,492,25,'#c4ddd1','right')}
function choose(i=selected){stage.focus({preventScroll:true});beep(660);if(i<3){window.open(links[i],'_blank','noopener,noreferrer');return}if(i===3){mode='projects';projectSelected=0;status.textContent='Проекты. Стрелки для выбора, Enter открыть, Escape назад.';return}mode='game';started=false;over=false;paused=false;document.body.classList.add('playing');document.querySelector('.game-bar').hidden=false;document.querySelector('#touch-controls').hidden=false;document.querySelector('#pause').textContent='Пауза';keys.clear();status.textContent='Neon Arena. Enter начать, WASD движение, пробел стрелять, P пауза, Escape меню.'}
function back(){stage.focus({preventScroll:true});mode='menu';started=false;keys.clear();document.body.classList.remove('playing');document.querySelector('.game-bar').hidden=true;document.querySelector('#touch-controls').hidden=true;beep(220)}
function activate(){if(mode==='menu')choose();else if(mode==='projects')window.open('https://github.com/wilberods-coder/'+projects[projectSelected][0],'_blank','noopener,noreferrer');else if(!started||over)resetGame();else keys.add(' ')}
function moveMenu(d){if(mode==='menu')selected=(selected+d+5)%5;else if(mode==='projects')projectSelected=(projectSelected+d+3)%3;beep(320);status.textContent=mode==='menu'?names[selected]:projects[projectSelected][0]}
document.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>{selected=+b.dataset.menu;choose(selected)});
document.querySelector('#back').onclick=back;
function pause(){stage.focus({preventScroll:true});if(mode!=='game'||!started||over)return;paused=!paused;keys.clear();document.querySelector('#pause').textContent=paused?'Продолжить':'Пауза'}document.querySelector('#pause').onclick=pause;
window.addEventListener('keydown',e=>{if(!entered)return;if(e.target.closest('button,a,input'))return;const k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter','Escape'].includes(k))e.preventDefault();keys.add(k);if(e.repeat)return;if(k==='Escape')back();else if(k==='Enter')activate();else if(k==='p'||k==='з')pause();else if(mode!=='game'&&k==='ArrowDown')moveMenu(1);else if(mode!=='game'&&k==='ArrowUp')moveMenu(-1);else if(mode==='game'&&k===' '&&(!started||over))resetGame()});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
window.addEventListener('blur',()=>{keys.clear();if(mode==='game'&&started&&!over&&!paused)pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();if(mode==='game'&&started&&!over&&!paused)pause()}});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(!started||over)resetGame();keys.add(b.dataset.key)};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key)});

try{({renderer,scene,camera,unit,screen,texture,lid,shadow}=createConsole(stage,screenCanvas,hits));document.querySelector('#loading').remove();}
catch(error){renderer=null;document.querySelector('#loading').textContent='3D недоступно в этом браузере. Профили доступны в меню ниже.';console.error(error)}
const splash=document.querySelector('#splash');
function enterSite(){if(entered)return;entered=true;keys.clear();document.body.classList.remove('booting');splash.classList.add('leaving');document.querySelector('header').inert=false;document.querySelector('main').inert=false;document.querySelector('footer').inert=false;stage.focus({preventScroll:true});setTimeout(()=>splash.hidden=true,reduced?0:1100);}
document.querySelector('#enter-site').onclick=enterSite;
document.addEventListener('keydown',e=>{if(!entered&&(e.code==='Space'||e.key==='Enter')){e.preventDefault();e.stopImmediatePropagation();enterSite()}},true);

let lookX=0,lookY=0,held=null;
function hitAt(e){const r=stage.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(hits,false)[0]}
stage.addEventListener('pointermove',e=>{if(!renderer)return;lookX=(e.clientX/innerWidth-.5);lookY=(e.clientY/innerHeight-.5);const hit=hitAt(e);stage.style.cursor=hit?'pointer':'grab';if(hit?.object===screen&&mode==='menu'){const y=(1-hit.uv.y)*512;const i=Math.floor((y-80)/76);if(i>=0&&i<5)selected=i}});
stage.addEventListener('pointerdown',e=>{if(!renderer)return;const hit=hitAt(e);if(!hit)return;stage.setPointerCapture(e.pointerId);const a=hit.object.userData.action;if(a==='screen'){const x=hit.uv.x*768,y=(1-hit.uv.y)*512;if(mode==='menu'){const i=Math.floor((y-80)/76);if(i>=0&&i<5)choose(i)}else if(mode==='projects'){const i=Math.floor((y-90)/118);if(i>=0&&i<3){projectSelected=i;activate()}}else if(!started||over)resetGame();else{aim={x,y};keys.add(' ');held=' '}}else if(a==='a'||a==='start'){activate();held=' '}else if(a==='b'||a==='select')back();else{const key={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[a];if(mode==='game'){keys.add(key);held=key}else moveMenu(a==='up'||a==='left'?-1:1)}});
function release(){if(held)keys.delete(held);held=null;aim=null}stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);

let player,bots=[],bullets=[],particles=[],wave=1,score=0,cooldown=0,spawnDelay=0,aim=null;
const blocks=[{x:170,y:145,w:64,h:60},{x:530,y:145,w:64,h:60},{x:170,y:335,w:64,h:60},{x:530,y:335,w:64,h:60}];
function resetGame(){player={x:384,y:280,hp:5,inv:1};bots=[];bullets=[];particles=[];score=0;wave=1;cooldown=0;spawnDelay=.5;started=true;over=false;paused=false;keys.clear();document.querySelector('#pause').textContent='Пауза';beep(800,.12)}
function spawnWave(){for(let i=0;i<3+wave*2;i++){let side=i%4;bots.push({x:side===0?35:side===1?733:70+Math.random()*628,y:side===2?85:side===3?477:85+Math.random()*390,hp:2+Math.floor(wave/4),r:11,speed:46+Math.min(wave*6,60),phase:Math.random()*6.28})}}
function valid(x,y,r=11){return x>18+r&&x<750-r&&y>65+r&&y<494-r&&!blocks.some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h)}
function travel(o,dx,dy){if(valid(o.x+dx,o.y))o.x+=dx;if(valid(o.x,o.y+dy))o.y+=dy}
function burst(x,y,color){for(let i=0;i<9;i++)particles.push({x,y,vx:(Math.random()-.5)*170,vy:(Math.random()-.5)*170,life:.4,color})}
function updateGame(dt){if(!started||paused||over)return;player.inv=Math.max(0,player.inv-dt);cooldown-=dt;let dx=(keys.has('d')||keys.has('в')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ф')||keys.has('ArrowLeft')?1:0),dy=(keys.has('s')||keys.has('ы')||keys.has('ArrowDown')?1:0)-(keys.has('w')||keys.has('ц')||keys.has('ArrowUp')?1:0);let len=Math.hypot(dx,dy)||1;travel(player,dx/len*175*dt,dy/len*175*dt);
if(!bots.length){spawnDelay-=dt;if(spawnDelay<=0){spawnWave();spawnDelay=1.1}}
if(keys.has(' ')&&cooldown<=0){let target=aim||bots.reduce((best,b)=>!best||Math.hypot(b.x-player.x,b.y-player.y)<Math.hypot(best.x-player.x,best.y-player.y)?b:best,null);if(target){let a=Math.atan2(target.y-player.y,target.x-player.x);bullets.push({x:player.x,y:player.y,vx:Math.cos(a)*420,vy:Math.sin(a)*420,life:1.5});cooldown=.19;beep(150,.025)}}
for(const b of bots){let a=Math.atan2(player.y-b.y,player.x-b.x);let ox=b.x,oy=b.y;travel(b,Math.cos(a)*b.speed*dt,Math.sin(a)*b.speed*dt);if(Math.hypot(b.x-ox,b.y-oy)<b.speed*dt*.3){const turn=Math.sin(b.phase)>0?1:-1;travel(b,Math.cos(a+turn*1.4)*b.speed*dt,Math.sin(a+turn*1.4)*b.speed*dt)}if(Math.hypot(b.x-player.x,b.y-player.y)<23&&player.inv<=0){player.hp--;player.inv=1.2;burst(player.x,player.y,'#b8ffbd');beep(80,.1);if(player.hp<=0){over=true;status.textContent=`Игра окончена. Счёт ${score}. Enter для новой игры.`}}}
for(const b of bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(!valid(b.x,b.y,2))b.life=0;for(const bot of bots){if(b.life>0&&bot.hp>0&&Math.hypot(b.x-bot.x,b.y-bot.y)<15){bot.hp--;b.life=0;burst(bot.x,bot.y,'#ff6c9a');if(bot.hp<=0)score+=100}}}bullets=bullets.filter(b=>b.life>0);let old=bots.length;bots=bots.filter(b=>b.hp>0);if(old&&!bots.length){wave++;beep(800,.15)}for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0)}
function drawGame(){ctx.fillStyle='#101b29';ctx.fillRect(0,0,768,512);ctx.strokeStyle='#213247';ctx.lineWidth=1;for(let x=20;x<750;x+=32){ctx.beginPath();ctx.moveTo(x,64);ctx.lineTo(x,494);ctx.stroke()}for(let y=64;y<495;y+=32){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(748,y);ctx.stroke()}ctx.strokeStyle='#608a83';ctx.strokeRect(18,64,732,430);
text('NEON ARENA',24,42,34,'#baffbf');text(`WAVE ${wave}`,385,42,30,'#9ca7bb','center');text(String(score).padStart(6,'0'),740,42,34,'#e0e8ee','right');
for(const b of blocks){rr(ctx,b.x,b.y,b.w,b.h,3,'#2f435a');ctx.fillStyle='#52718b';ctx.fillRect(b.x,b.y,b.w,4);ctx.fillStyle='#1b2b3c';ctx.fillRect(b.x+9,b.y+12,b.w-18,b.h-22)}
if(started){for(const b of bots){ctx.fillStyle='#f0759d';ctx.fillRect(b.x-10,b.y-10,20,20);ctx.fillStyle='#441c36';ctx.fillRect(b.x-6,b.y-4,4,4);ctx.fillRect(b.x+2,b.y-4,4,4)}if(player.inv<=0||Math.floor(clock*12)%2===0){ctx.shadowColor='#adffc9';ctx.shadowBlur=14;rr(ctx,player.x-10,player.y-10,20,20,3,'#baffc5');ctx.shadowBlur=0;ctx.fillStyle='#2d5e5a';ctx.fillRect(player.x-5,player.y-5,10,5)}for(const b of bullets){ctx.fillStyle='#efffaf';ctx.fillRect(b.x-3,b.y-3,6,6)}for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/.4);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4,4)}ctx.globalAlpha=1;text('♥'.repeat(Math.max(0,player.hp)),31,483,30,'#baffc5')}
if(!started||over||paused){ctx.fillStyle='#0b132be8';ctx.fillRect(0,64,768,448);text(paused?'ПАУЗА':over?'GAME OVER':'NEON ARENA',384,211,48,'#c6ffc5','center');text(over?`СЧЁТ ${score} · ВОЛНА ${wave}`:paused?'Выдохни. Арена подождёт.':'ТЫ ОДИН. БОТОВ МНОГО.',384,258,30,'#9daec9','center');text(over?'ENTER / A — ЕЩЁ РАЗ':paused?'P — ПРОДОЛЖИТЬ':'ENTER / A — НАЧАТЬ',384,335,32,'#eee5ff','center');if(!over&&!paused){text('WASD / ↑↓←→ — ДВИЖЕНИЕ',384,393,30,'#879bb5','center');text('ПРОБЕЛ / A — ОГОНЬ · АВТОПРИЦЕЛ',384,436,28,'#879bb5','center')}}}
function animate(t){
const dt=Math.min((t-previous)/1000,.04)||0;previous=t;clock+=dt;
mode==='game'?(updateGame(dt),drawGame()):drawMenu();
if(renderer){texture.needsUpdate=true;const target=mode==='game'?1:0;zoom+=(target-zoom)*(reduced?1:1-Math.exp(-dt*4));
entrance=Math.min(1,entrance+(entered?dt/1.6:0));const ease=1-Math.pow(1-entrance,3),reveal=reduced?(entered?1:0):ease;
const narrow=camera.aspect<1,fitWidth=7.5/(2*Math.tan(THREE.MathUtils.degToRad(18))*camera.aspect),distance=Math.max(18.5,fitWidth+3.8);
const gameDistance=Math.max(9,5.95/(2*Math.tan(THREE.MathUtils.degToRad(18))*camera.aspect));
camera.position.set(0,THREE.MathUtils.lerp(0,1.85,zoom),THREE.MathUtils.lerp(distance,gameDistance,zoom));camera.lookAt(0,camera.position.y,0);
unit.rotation.set(THREE.MathUtils.lerp(-.025,0,zoom),THREE.MathUtils.lerp(narrow?-.06:-.20,0,zoom)+(reduced?0:lookX*.045*(1-zoom)),-.018*(1-zoom));
unit.position.set(camera.aspect>1.7?.45*(1-zoom):0,-1.32-(1-reveal)*1.7+(reduced?0:Math.sin(clock*.7)*.025*(1-zoom)),0);
unit.scale.setScalar(.9+.1*reveal);lid.rotation.x=THREE.MathUtils.lerp(1.96,-.055,reveal);unit.visible=entered;shadow.visible=entered;shadow.material.opacity=reveal;
renderer.render(scene,camera)}requestAnimationFrame(animate)}requestAnimationFrame(animate);
