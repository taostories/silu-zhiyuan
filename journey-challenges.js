(() => {
  'use strict';
  const M=window.SILU_CHALLENGE_RULES;
  const shapes={
    water:'<path d="M16 3C12 10 5 15 7 23q3 11 16 3 8-7-7-23Z" fill="#648f8b"/>',
    silk:'<path d="M8 4h20q-8 13-2 24H5Q0 14 8 4Z" fill="#81a08b"/><path d="m8 11 15 4M6 19l17 4" stroke="#e9d5a6" stroke-width="3"/>',
    herb:'<path d="M16 30V6M16 15Q2 15 5 4q12 0 11 11m0 9q13-1 12-13-12 1-12 13" fill="#7a9665" stroke="#4c6d53" stroke-width="2"/>',
    wood:'<path d="m3 12 21-8 6 16-21 8Z" fill="#b89561" stroke="#7f6d4c" stroke-width="2"/><path d="m8 16 14-6m-12 12 15-6" stroke="#806c46" fill="none"/>',
    iron:'<path d="m9 4 8 1 5 8-7 1L7 28l-5-3 10-12Z" fill="#73887a" stroke="#4e665b" stroke-width="2"/><path d="m18 19 10 9" stroke="#a18354" stroke-width="5"/>',
    wheel:'<circle cx="16" cy="16" r="12" fill="none" stroke="#596c55" stroke-width="3"/><path d="M16 4v24M4 16h24M7 7l18 18M7 25 25 7" stroke="#596c55" stroke-width="2"/>',
    food:'<path d="M3 24Q1 5 18 8q15 0 12 17-13 9-27-1Z" fill="#c5a16b"/><path d="m11 13-3 9m11-10-4 11m11-8-4 9" stroke="#efddaf" stroke-width="2"/>',
    rock:'<path d="m2 29 9-23 8 12 5-7 7 18Z" fill="#88947e"/>',
    shelter:'<path d="m3 25 8-20h13l7 20H18l-3-11-4 11Z" fill="#9e9c7a"/><path d="M4 28h25" stroke="#687c65" stroke-width="2"/>',
    sand:'<path d="M1 9h21q9 0 6-6M3 16h23q8 0 3 6M1 25h17" stroke="#a97c4d" stroke-width="2" fill="none"/>',
    station:'<path d="M1 13 16 3l15 10ZM5 14h22v15H5Z" fill="#ab8052"/><path d="M12 29V18h8v11" fill="#e9d7af"/>',
    cloak:'<path d="M10 6q6-9 12 0l-3 7 12 17H1l12-17Z" fill="#849982"/><path d="M16 12v17" stroke="#e5c99b" stroke-width="2"/>',
    letter:'<rect x="2" y="7" width="28" height="20" rx="2" fill="#dfc594" stroke="#a18052"/><path d="m3 8 13 11L29 8" stroke="#a18052" fill="none" stroke-width="2"/>'
  };
  const vectorIcon=kind=>`<svg viewBox="0 0 32 32" aria-hidden="true">${shapes[kind]||shapes.letter}</svg>`;
  const muralSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900"><rect width="900" height="900" fill="#d9be90"/><path d="M0 0H900V420Q500 360 0 440Z" fill="#c4c8a4"/><circle cx="752" cy="126" r="60" fill="#bd7851"/><path d="M0 350 118 165 205 271 325 70 448 269 565 151 680 292 783 219 900 335V490H0Z" fill="#739384"/><path d="m278 145 47-75 54 86-45-18-23 15Z" fill="#dce0bd"/><path d="M0 410 162 320 272 379 410 226 548 369 711 310 900 420V540H0Z" fill="#4f7c74"/><path d="M0 488Q217 369 390 432T900 465V900H0Z" fill="#c4a979"/><path d="M540 250Q399 380 566 500T520 705T602 900" fill="none" stroke="#ece0b8" stroke-width="70"/><path d="M540 250Q399 380 566 500T520 705T602 900" fill="none" stroke="#7faaa0" stroke-width="51"/><path d="M0 625Q170 675 290 590T580 582T900 663" fill="none" stroke="#a48153" stroke-width="54"/><path d="M0 625Q170 675 290 590T580 582T900 663" fill="none" stroke="#e2ce9d" stroke-width="39"/><path d="M515 566q56-46 116 34m-116-34 9 39m99-12-3 35" fill="none" stroke="#766d4c" stroke-width="17"/><path d="m514 581 111 37" stroke="#d6be85" stroke-width="27"/><path d="m530 574-7 27m32-16-8 26m34-16-9 25m34-13-8 23" stroke="#8e7d56" stroke-width="5"/><g fill="#a5774e"><path d="M85 590V431h130v159Z"/><path d="m60 435 90-64 90 64Z"/><path d="M102 383v-60h96v60Z"/><path d="m85 327 65-47 65 47Z"/></g><path d="M129 590v-85q23-28 45 0v85" fill="#596c52"/><path d="M105 451h92m-92 16h92" stroke="#d6b684" stroke-width="5"/><path d="M40 845Q245 702 445 803T900 783" fill="none" stroke="#9c694d" stroke-width="12"/><path d="M40 869Q245 726 445 827T900 807" fill="none" stroke="#deca98" stroke-width="6"/><g transform="translate(337 546)"><path d="M-28 20q-12-49 9-47 17-3 24 13 8-21 24-15 20 4 18 36l31-3 6-39 14 3-3 58-26 13h-88Z" fill="#9e714b"/><path d="m-15 35-8 36m28-36 7 36m45-36 10 36m14-44 11 42" stroke="#77583d" stroke-width="7"/><path d="M-10-20h46v36H-10Z" fill="#496f66"/><path d="m83-22 67 29" stroke="#795d42" stroke-width="3"/></g><g transform="translate(492 552)"><circle cy="-20" r="11" fill="#a77951"/><path d="m-6-8-17 49h43L6-8Z" fill="#ad6548"/><path d="m-8 39-10 22m27-22 13 22" stroke="#6f6246" stroke-width="6"/></g><g transform="translate(730 740)"><circle cy="-27" r="13" fill="#ae8056"/><path d="m-7-14-32 69h75L8-14Z" fill="#4d7974"/><path d="m-6 0-47-19m60 17 48-30" stroke="#4d7974" stroke-width="9"/><path d="M-60-38Q-7-80 54-52T153-30" fill="none" stroke="#ab684f" stroke-width="12"/></g><g fill="#789277"><path d="m58 718 13-61 13 61Zm158-34 11-49 12 49Zm575-125 14-66 14 66Zm42-20 12-56 14 56Z"/></g><path d="M31 62q70-32 143 0m362-13q60-25 107 0M42 120q56-15 102 5" fill="none" stroke="#ece1be" stroke-width="9"/><rect x="12" y="12" width="876" height="876" rx="5" fill="none" stroke="#9b8056" stroke-width="9"/></svg>`;
  const muralUrl='data:image/svg+xml,'+encodeURIComponent(muralSvg);
  function mount(index,host,saved={},api){
    const tradeFooter=index===1?host.parentElement.querySelector('.game-footer'):null;
    const icons=(index===0?api.assets?.routeIcons:api.assets?.tradeIcons)||{};
    const icon=kind=>icons[kind]?`<img class="cg-art" src="${icons[kind]}" data-icon-kind="${kind}" alt="" draggable="false">`:vectorIcon(kind);
    function failedImage(e){const img=e.target;if(img.matches?.('img[data-icon-kind]'))img.outerHTML=img.dataset.iconKind==='wind'?'':vectorIcon(img.dataset.iconKind);}
    const $=s=>host.querySelector(s);let disposed=false,timer=null,notified=false,selected=null,notice='',preview=false,running=false,bad=-1,drag=null;
    host.style.setProperty('--mural','url('+JSON.stringify(muralUrl)+')');
    let imageProbe=null;
    if(index===2&&api.assets?.muralPuzzle){imageProbe=new Image();imageProbe.onload=()=>{if(!disposed)host.style.setProperty('--mural','url('+JSON.stringify(imageProbe.src)+')');};imageProbe.src=api.assets.muralPuzzle;}
    const seed=Number.isInteger(saved.seed)?saved.seed>>>0:Math.floor(Math.random()*0xffffffff)>>>0;
    let log=saved.version===M.VERSION&&Array.isArray(saved.actions)&&!(index===0&&saved.gear==='cloak')?saved.actions:[],gear='water';
    let state;const order=M.shuffle(M.offers.map(o=>o.id),seed);
    function finish(){if(!notified){notified=true;api.done();}}
    function checkpoint(){api.onSave({version:M.VERSION,seed,gear,actions:[...log],done:!!state?.done});}
    function replay(){const result=index===0?M.routeReplay(gear,log):index===1?M.tradeReplay(log):M.muralReplay(seed,log);state=result.state;log=result.actions;}
    function quantities(bag,compact=false){return Object.entries(bag).filter(([,n])=>n>0).map(([k,n])=>`<span class="cg-item" title="${M.labels[k]} × ${n}" aria-label="${M.labels[k]} × ${n}">${icon(k)}<span>${compact?'':M.labels[k]}<b>×${n}</b></span></span>`).join('');}
    function actionButton(action,label,disabled=false,cls=''){return `<button data-action="${action}" class="${cls}" ${disabled?'disabled':''}>${label}</button>`;}
    function feedback(text){api.feedback(text,!!state?.done);}
    function render(){if(disposed)return;replay();checkpoint();if(index===0)renderRoute();else if(index===1)renderTrade();else renderMural();if(state.done)finish();}
    function renderRoute(){
      const R=M.route;
      const col=M.windAt(state.turn);
      const history=M.routeReplay(gear,log).states;
      host.innerHTML=`<section class="cg-route ${icons.plain?'illustrated':''}"><div class="cg-route-hud"><strong>水 ${Math.max(0,state.water)} / 7</strong><span>余 ${Math.max(0,R.limit-state.turn)} 次行动</span></div><div class="cg-forecast"><b>风沙会随每次行动移动</b><span>飘动的橙色区域额外耗水；沙地留在原处。</span></div><div class="cg-route-board" role="group" aria-label="六行七列路图。标出的风沙在下一步行动生效。">${Array.from({length:42},(_,id)=>{
        const kind=R.rocks.includes(id)?'rock':R.wells.includes(id)?'water':R.shelters.includes(id)?'shelter':R.sand.includes(id)?'sand':id===R.goal?'station':id===R.start?'letter':'plain';
        const adjacent=M.near(state.position,id)&&kind!=='rock',wind=[col,col+1].includes(id%7),used=state.used.includes(id),result=adjacent?M.routeStep(state,id):{};
        const name={rock:'山石',water:used?'空水源':'水源',shelter:'避风石',sand:'沙地',station:'驿站',letter:'长安',plain:'戈壁'}[kind];
        return `<button class="cg-cell ${kind} ${wind?'wind':''} ${adjacent&&!state.failed&&!state.done?'reachable':''} ${id===state.position?'here':''} ${used?'used':''}" data-cell="${id}" aria-label="${String.fromCharCode(65+id%7)}${1+Math.floor(id/7)} ${name}${adjacent&&result.cost?',耗水'+result.cost:''}" aria-disabled="${!adjacent||state.failed||state.done}">${kind==='plain'&&!icons.plain?'<span class="cg-pebble">·</span>':icon(kind)}${wind&&icons.wind&&!['rock','water','shelter'].includes(kind)?'<span class="cg-wind-art" aria-hidden="true">'+icon('wind')+'</span>':''}<small class="cg-cell-label">${wind&&!['rock','water','shelter'].includes(kind)?'风沙':name}</small>${adjacent&&result.cost&&!state.failed&&!state.done?`<em>−${result.cost}</em>`:''}${id===state.position?'<span class="cg-walker" aria-hidden="true">●</span>':''}</button>`;
      }).join('')}</div><div class="cg-inline-legend" aria-label="路图图例"><span>${icon('plain')}<span><b>戈壁</b><small>耗水1</small></span></span><span>${icon('sand')}<span><b>沙地</b><small>耗水2</small></span></span><span>${icon('rock')}<span><b>山石</b><small>不能走</small></span></span><span>${icon('shelter')}<span><b>避风石</b><small>挡风·可等</small></span></span><span>${icon('water')}<span><b>水源</b><small>补满一次</small></span></span><span>${icon('letter')}<span><b>长安</b><small>出发点</small></span></span><span>${icon('station')}<span><b>驿站</b><small>送信终点</small></span></span><span>${icon('wind')}<span><b>风沙</b><small>移动·加耗3</small></span></span></div><div class="cg-actions">${actionButton('wait','原地等风',state.done||state.failed||![R.start,...R.shelters,...R.wells].includes(state.position))}${actionButton('undo','撤回一步',!log.length||state.done)}</div></section>`;
      api.counter(state.done?'家书已送达':state.failed?'停下，重新选路':'送信途中');
      feedback(notice||(state.done?`用了${log.filter(a=>a!=='wait').length}步，家书平安送到。`:state.failed?(state.water<=0?'水用尽了，撤回换条路。':'天黑了，撤回换条路。'):''));
    }
    function renderTrade(){
      host.innerHTML=`<section class="cg-trade"><div class="cg-departure"><div>${['wheel','water','food'].map(k=>`<span class="${state.bag[k]?'ready':''}">${icon(k)}${M.labels[k]}${state.bag[k]?' ✓':''}</span>`).join('')}</div></div><div class="cg-inventory"><span>行囊 ${M.count(state.bag)} / 6</span><div>${quantities(state.bag)||'空'}</div></div><div class="cg-offers">${order.map(id=>{const o=M.offers.find(o=>o.id===id),used=state.used.includes(id);return `<button data-offer="${id}" class="cg-offer ${selected===id?'selected':''} ${used?'sold':''}" aria-pressed="${selected===id}"><strong>${o.name}</strong><span class="cg-recipe"><span class="cg-give"><b>换出</b>${quantities(o.cost,false)}</span><span class="cg-arrow">↓</span><span class="cg-get"><b>得到</b>${quantities(o.gain,false)}</span></span><span class="cg-stock">${used?'已换完':''}</span></button>`;}).join('')}<div class="cg-control-tile"><strong>整装行囊</strong><span class="cg-selected-name">${selected?M.offers.find(o=>o.id===selected).name:'先选一个摊位'}</span>${actionButton('trade','交换',!selected||state.used.includes(selected)||state.done,'primary')}${actionButton('undo','撤回交换',!log.length||state.done)}${actionButton('depart','整装待发',false,'primary')}</div></div></section>`;
      if(tradeFooter)host.querySelector('.cg-control-tile').append(tradeFooter);
      api.counter(state.done?'已经整装':`${state.used.length} 次交换`);feedback(notice||(state.done?'车轮、水、粮齐备。':''));
    }
    function renderMural(){
      host.innerHTML=`<section class="cg-mural ${state.done?'complete':''}"><div class="cg-mural-top"><span>山线 · 水流 · 古道</span>${actionButton('preview',preview?'正在看构图…':'看构图 · 3秒',preview||running||state.done)}</div><div class="cg-mural-board ${preview?'previewing':''}"><div class="cg-mural-grid" role="group" aria-label="九片原创画卷，选两片交换，选一片后可旋转。">${state.pieces.map((p,i)=>`<button class="cg-fragment ${selected===i?'selected':''} ${bad===i?'breakpoint':''}" data-piece="${i}" aria-label="第${Math.floor(i/3)+1}行第${i%3+1}列画片，选择交换或旋转" aria-pressed="${selected===i}" ${running||preview||state.done?'disabled':''}><span class="cg-fragment-art" style="background-position:${p.id%3*50}% ${Math.floor(p.id/3)*50}%;transform:rotate(${p.rot*90}deg)"></span></button>`).join('')}</div>${preview?'<div class="cg-mural-preview" aria-label="完整构图参考"></div>':''}${running||state.done?`<svg class="cg-animation" viewBox="0 0 900 900" aria-hidden="true"><g transform="${state.done?'translate(880 663)':'translate(0 0)'}"><circle r="17" fill="#426b60" stroke="#f5e8c6" stroke-width="6"/>${running?'<animateMotion dur="2.2s" fill="freeze" path="M20 625 Q170 675 290 590 T580 582 T880 663"/>':''}</g></svg>`:''}</div><div class="cg-mural-tools">${actionButton('rotate','旋转所选 ↻',selected===null||running||preview||state.done)}${actionButton('undo','撤回',!log.length||running||preview||state.done)}${actionButton('try','试走画卷',running||preview||state.done,'primary')}</div><p class="cg-mural-note">点两片交换，也可拖放。观察山线、水流与桥，接好后试走。</p></section>`;
      api.counter(state.done?'画卷已接通':running?'沿画中路前行':'原创画卷');feedback(notice||(state.done?'路连上了。把这卷可以亲手拼、沿路看的丝路发给爷爷。':'让爷爷看得懂：山水要连贯，古道要过桥，人物不能倒着。'));
    }
    function apply(action){
      const result=index===0?M.routeStep(state,action):index===1?M.tradeStep(state,action):M.muralStep(state,action);
      if(result.error){notice=result.error;if(index===0&&state.failed)notice=state.water<=0?'水用尽了。可以撤回上一步，重新规划。':result.error;feedback(notice);return;}
      log.push(action);notice='';if(index===0)notice=result.state.failed?'':action==='wait'?'等风 · 不耗水':result.refill?'水已补满 · 此处已用':result.cost>=3?`耗水 ${result.cost}`:'';
      render();
    }
    function click(e){const b=e.target.closest('button');if(!b||!host.contains(b)||b.disabled)return;
      if(b.dataset.cell!==undefined){apply(Number(b.dataset.cell));return;}
      if(b.dataset.offer){selected=b.dataset.offer;notice='';render();return;}
      if(b.dataset.piece!==undefined){if(running||preview||state.done)return;const i=Number(b.dataset.piece);bad=-1;if(selected!==null&&selected!==i){const from=selected;selected=null;apply({type:'swap',a:from,b:i});}else{selected=selected===i?null:i;render();}return;}
      const action=b.dataset.action;
      if(action==='undo'){if(log.length&&!state.done){log.pop();notice='已撤回，可以换一种安排。';bad=-1;render();}return;}
      if(action==='depart'){if(!state.done)apply(action);if(state.done)api.continueStory();return;}
      if(action==='wait'){apply(action);return;}
      if(action==='trade'&&selected){apply(selected);return;}
      if(action==='rotate'&&selected!==null){bad=-1;apply({type:'rotate',a:selected});return;}
      if(action==='preview'){preview=true;notice='';render();timer=setTimeout(()=>{preview=false;render();},3000);return;}
      if(action==='try'){
        bad=state.pieces.findIndex((p,i)=>p.id!==i||p.rot!==0);
        if(bad>=0){const row=Math.floor(bad/3)+1,col=bad%3+1;notice=`第${row}行第${col}列附近还没接上。看看山线与水流，是位置不对，还是方向反了？`;render();return;}
        running=true;notice='古道过桥，画中人继续向前。';render();timer=setTimeout(()=>{running=false;apply({type:'finish'});},matchMedia('(prefers-reduced-motion: reduce)').matches?50:2300);
      }
    }
    let suppressUntil=0;
    const handleClick=e=>{if(performance.now()<suppressUntil)return;click(e);};
    const down=e=>{if(index!==2||running||preview||state.done||e.button!==0)return;const b=e.target.closest('[data-piece]');if(!b)return;drag={i:Number(b.dataset.piece),x:e.clientX,y:e.clientY,id:e.pointerId};b.setPointerCapture(e.pointerId);};
    const up=e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;const moved=Math.hypot(e.clientX-d.x,e.clientY-d.y)>12;if(!moved)return;const b=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-piece]');suppressUntil=performance.now()+180;if(b&&host.contains(b)&&Number(b.dataset.piece)!==d.i){selected=null;bad=-1;apply({type:'swap',a:d.i,b:Number(b.dataset.piece)});}};
    const cancel=()=>{drag=null;};
    host.addEventListener('error',failedImage,true);host.addEventListener('click',handleClick);host.addEventListener('pointerdown',down);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',cancel);
    render();
    return()=>{disposed=true;if(imageProbe)imageProbe.onload=null;host.style.removeProperty('--mural');clearTimeout(timer);host.removeEventListener('error',failedImage,true);host.removeEventListener('click',handleClick);host.removeEventListener('pointerdown',down);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',cancel);};
  }
  window.SILU_CHALLENGES={mount};
})();
