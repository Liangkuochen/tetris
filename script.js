const c=document.getElementById('game'),x=c.getContext('2d'),nc=document.getElementById('next'),nx=nc.getContext('2d');
const W=10,H=20,B=30,NB=24,types=['I','J','L','O','S','T','Z'];
const colors={I:'#00d9ff',J:'#4d7cff',L:'#ff9f1c',O:'#ffd60a',S:'#2ec4b6',T:'#b967ff',Z:'#ff4d6d'};
const shapes={I:[[1,1,1,1]],J:[[1,0,0],[1,1,1]],L:[[0,0,1],[1,1,1]],O:[[1,1],[1,1]],S:[[0,1,1],[1,1,0]],T:[[0,1,0],[1,1,1]],Z:[[1,1,0],[0,1,1]]};
const speeds=[800,650,500,350,220], need=[0,5,12,20,30];
const themes=['第一關・星空啟程','第二關・海洋世界','第三關・夢幻紫境','第四關・火焰挑戰','第五關・翡翠王國'];
let board,p,next,score=0,lines=0,level=1,running=false,paused=false,over=false,last=0,timer=0,raf;
let high=+localStorage.getItem('tetrisHigh')||0; document.getElementById('high').textContent=high;
const el=id=>document.getElementById(id);
function makeBoard(){return Array.from({length:H},()=>Array(W).fill(0))}
function rand(){let t=types[Math.floor(Math.random()*7)];return{t,shape:shapes[t].map(r=>[...r]),x:0,y:0}}
function start(){board=makeBoard();score=0;lines=0;level=1;running=true;paused=false;over=false;timer=0;last=performance.now();next=rand();theme();spawn();hide();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function spawn(){p=next||rand();p.x=Math.floor((W-p.shape[0].length)/2);p.y=0;next=rand();drawNext();if(hit(p)){over=true;running=false;show('遊戲結束\n請重新開始')}} 
function hit(q,dx=0,dy=0,s=q.shape){for(let y=0;y<s.length;y++)for(let z=0;z<s[y].length;z++)if(s[y][z]){let X=q.x+z+dx,Y=q.y+y+dy;if(X<0||X>=W||Y>=H||(Y>=0&&board[Y][X]))return true}return false}
function merge(){p.shape.forEach((r,y)=>r.forEach((v,z)=>{if(v&&p.y+y>=0)board[p.y+y][p.x+z]=p.t}))}
function rotate(){let s=p.shape.map(r=>[...r]);let r=s[0].map((_,i)=>s.map(a=>a[i]).reverse());for(let dx of [0,-1,1,-2,2])if(!hit(p,dx,0,r)){p.shape=r;p.x+=dx;return}}
function clear(){let n=0;for(let y=H-1;y>=0;y--)if(board[y].every(Boolean)){board.splice(y,1);board.unshift(Array(W).fill(0));n++;y++}if(!n)return;score+=[0,100,300,500,800][n]*level;lines+=n;if(score>high){high=score;localStorage.setItem('tetrisHigh',high)}let nl=Math.min(5,1+need.filter(v=>v>0&&lines>=v).length);if(nl>level){level=nl;theme();show('🎉 '+themes[level-1]+'\n速度提升！');setTimeout(()=>{if(running&&!paused)hide()},900)}if(lines>=30){level=5;theme();over=true;running=false;show('🏆 恭喜完成五個關卡！\n你是俄羅斯方塊高手！')}}
function drop(){if(!running||paused||over)return;if(!hit(p,0,1))p.y++;else{merge();clear();if(!over)spawn()}timer=0}
function hard(){if(!running||paused||over)return;while(!hit(p,0,1))p.y++;score+=2;drop()}
function action(a){if(a==='pause'){if(!running||over)return;paused=!paused;paused?show('⏸ 暫停'):hide();return}if(!running||paused||over)return;if(a==='left'&&!hit(p,-1,0))p.x--;if(a==='right'&&!hit(p,1,0))p.x++;if(a==='rotate')rotate();if(a==='down')drop();if(a==='drop')hard();ui()}
function loop(t){let d=t-last;last=t;if(running&&!paused&&!over){timer+=d;if(timer>speeds[level-1])drop()}draw();ui();if(running||paused)raf=requestAnimationFrame(loop)}
function cell(q,X,Y,col,size=B){q.fillStyle=col;q.fillRect(X*size+1,Y*size+1,size-2,size-2);q.fillStyle='#ffffff38';q.fillRect(X*size+3,Y*size+3,size-8,4)}
function draw(){x.fillStyle='#0b1020';x.fillRect(0,0,c.width,c.height);x.strokeStyle='#ffffff12';for(let i=0;i<=W;i++){x.beginPath();x.moveTo(i*B,0);x.lineTo(i*B,H*B);x.stroke()}for(let i=0;i<=H;i++){x.beginPath();x.moveTo(0,i*B);x.lineTo(W*B,i*B);x.stroke()}board.forEach((r,y)=>r.forEach((t,z)=>{if(t)cell(x,z,y,colors[t])}));if(p)p.shape.forEach((r,y)=>r.forEach((v,z)=>{if(v)cell(x,p.x+z,p.y+y,colors[p.t])}));if(paused){x.fillStyle='#0009';x.fillRect(0,0,c.width,c.height)}}
function drawNext(){nx.fillStyle='#101522';nx.fillRect(0,0,120,120);let s=next.shape,ox=(5-s[0].length)/2,oy=(5-s.length)/2;s.forEach((r,y)=>r.forEach((v,z)=>{if(v)cell(nx,ox+z,oy+y,colors[next.t],NB)}))}
function ui(){el('level').textContent=level+' / 5';el('score').textContent=score;el('lines').textContent=lines;el('high').textContent=high}
function theme(){document.body.className='level'+level;el('theme').textContent=themes[level-1]}
function show(t){el('msg').textContent=t;el('msg').classList.remove('hidden')}function hide(){el('msg').classList.add('hidden')}
document.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();action(b.dataset.a)}));
document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key))e.preventDefault();({ArrowLeft:()=>action('left'),ArrowRight:()=>action('right'),ArrowDown:()=>action('down'),ArrowUp:()=>action('rotate'),' ':()=>action('drop'),p:()=>action('pause'),P:()=>action('pause')}[e.key]?.())});
el('start').onclick=start; board=makeBoard();theme();ui();draw();drawNext();