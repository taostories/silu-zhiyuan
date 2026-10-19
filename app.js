(() => {
  'use strict';
  const $=s=>document.querySelector(s),root=$('#app'),story=window.SILU_STORY,art=window.SILU_ART,assets=window.SILU_ASSETS,chapters=story.chapters;
  const KEY='silu-zhiyuan-v2';
  const fresh=()=>({version:2,storyRevision:5,gameplayRevision:7,prologueDone:false,prologueLine:0,epilogueStarted:false,epilogueStep:0,epilogueLine:0,completed:[false,false,false,false],chapters:chapters.map(()=>({stage:'intro',line:0,game:{},passed:false})),traveler:.074,endingLine:0,ended:false});
  let data=fresh(),view='map',current=0,selected=0,cleanup=()=>{},motion=0,noticeTimer,walking=false;
  try {
    const saved=JSON.parse(localStorage.getItem(KEY));
    if(saved?.version===2&&saved.chapters?.length===4&&saved.completed?.length===4){
      let chain=true;
      saved.completed=saved.completed.map(v=>{chain=chain&&v===true;return chain;});
      data={...data,...saved};
      data.chapters=chapters.map((c,i)=>{
        const s=saved.chapters[i],valid=s&&['intro','game','after','complete'].includes(s.stage);
        if(!valid)return fresh().chapters[i];
        const cp={stage:s.stage,line:Number.isInteger(s.line)?Math.max(0,s.line):0,game:s.game&&typeof s.game==='object'?s.game:{},passed:!!s.passed};
        if(!unlocked(i))return fresh().chapters[i];
        if(!data.completed[i]&&cp.stage==='complete')cp.stage=cp.passed?'after':'intro';
        if(cp.stage==='after'&&!cp.passed){cp.stage='game';cp.line=0;}
        return cp;
      });
      data.traveler=Number.isFinite(data.traveler)?Math.max(.035,Math.min(nodesLimit(),data.traveler)):.074;
      data.endingLine=Number.isInteger(data.endingLine)?Math.max(0,Math.min(story.ending.length-1,data.endingLine)):0;
      data.ended=!!data.ended&&data.completed.every(Boolean);
      data.prologueLine=Math.max(0,Math.min(story.prologue.length-1,Number(data.prologueLine)||0));
      data.epilogueStep=Math.max(0,Math.min(2,Number(data.epilogueStep)||0));
      data.epilogueStarted=!!data.epilogueStarted&&data.completed.every(Boolean);
      if(saved.storyRevision!==5){data.storyRevision=5;data.prologueDone=false;data.prologueLine=0;data.chapters.forEach(cp=>cp.line=0);data.ended=false;data.epilogueStarted=data.completed.every(Boolean);data.epilogueStep=0;}
      if(saved.gameplayRevision!==6&&saved.gameplayRevision!==7){
        data.gameplayRevision=6;data.chapters.forEach((cp,i)=>{if(i<3&&!data.completed[i]){cp.line=0;if(cp.stage==='game'||cp.stage==='after'){cp.stage='intro';cp.game={};cp.passed=false;}}});
        data.epilogueLine=0;
      }
      if(saved.gameplayRevision===6){
        data.gameplayRevision=7;const cp=data.chapters[2];if(!data.completed[2]){cp.stage='intro';cp.line=0;cp.game={};cp.passed=false;}
      }else if(saved.gameplayRevision!==7){data.gameplayRevision=7;}
      if(!data.completed[0]&&data.chapters[0].game.gear==='cloak'){data.chapters[0]={stage:'intro',line:0,game:{},passed:false};}
      data.epilogueLine=Math.max(0,Number.isInteger(data.epilogueLine)?data.epilogueLine:0);
      if(data.chapters[3].passed&&!data.completed[3]){data.completed[3]=true;data.chapters[3].stage='complete';data.epilogueStarted=true;}
    }
  }catch{}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}}
  function escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function toast(text){clearTimeout(noticeTimer);$('#toast').textContent=text;$('#toast').classList.add('show');noticeTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
  function change(){cleanup();cleanup=()=>{};cancelAnimationFrame(motion);walking=false;$('#toast').classList.remove('show');root.dataset.view=view;window.scrollTo(0,0);}
  function showTitle(){
    view='title';change();
    const continuing=data.prologueDone||data.prologueLine>0;
    root.innerHTML=`<main class="title-screen"><div class="title-landscape" aria-hidden="true"><img src="${escape(assets.title||assets.map)}" alt=""></div><section class="title-center"><h1>${assets.titleLogo?`<img class="title-logo" src="${escape(assets.titleLogo)}" alt="丝路知远">`:'丝路知远'}</h1><div class="title-rule" aria-hidden="true"><span></span>◇<span></span></div><button class="title-enter" id="enter-game">${continuing?'继续旅程':'进入游戏'}<span aria-hidden="true"> →</span></button></section></main>`;
    const logo=$('.title-logo');if(logo)logo.onerror=()=>{logo.parentElement.textContent='丝路知远';};
    const image=$('.title-landscape img');image.onerror=()=>{image.onerror=null;image.src=assets.map;};
    $('#enter-game').onclick=()=>{if(!data.prologueDone)showPrologue();else if(data.epilogueStarted)showEpilogue(data.epilogueStep,data.epilogueLine);else showMap();};
    window.SILU_LOADING?.warm([!data.prologueDone?assets[story.prologue[data.prologueLine].scene||'packing']:data.epilogueStarted?assets.opening:assets.map]);
  }
  function unlocked(i){return Number.isInteger(i)&&i>=0&&i<4&&data.completed.slice(0,i).every(Boolean);}
  function nextStation(){const n=data.completed.findIndex(v=>!v);return n<0?3:n;}
  function nodesLimit(){return [.074,.255,.52,.927][nextStation()];}
  function header(home=false){return `<header class="topbar ${home?'':'story-topbar'}"><button class="brand" data-home aria-label="返回丝路长卷"><span class="brand-mark">知<br>远</span>丝路知远</button><div class="header-right"><div class="route-dots" aria-label="已走过 ${data.completed.filter(Boolean).length} 站">${data.completed.map(v=>`<i class="${v?'done':''}"></i>`).join('')}</div><button class="text-button" ${home?'data-reset':'data-home'}>${home?'重新启程':'返回长卷'}</button></div></header>`;}
  function bindHeader(){root.querySelectorAll('[data-home]').forEach(b=>b.onclick=()=>showMap());}
  function character(row){if(row.kind!=='dialogue')return '';const key=row.speaker==='爷爷'?'grandfather':row.speaker==='顾老师'?'scholar':'traveler';return '<div class="scene-character" data-character="'+key+'">'+(assets[key]?'<img src="'+escape(assets[key])+'" alt="'+escape(row.speaker)+'" data-character-fallback="'+key+'">':art.person(key))+'</div>';}
  function background(id){return `<div class="scene-background">${assets[id]?`<img src="${escape(assets[id])}" alt="" data-fallback="${id}">`:art.scene[id]}</div>`;}
  function warmDialogue(rows, line, scene) {
    const images=rows.slice(line+1,line+4).flatMap(row=>{
      const person=row.speaker==='顾老师'?'scholar':row.speaker==='爷爷'?'grandfather':'traveler';
      return [assets[row.scene||scene],row.kind==='dialogue'?assets[person]:row.kind==='message'?assets.avatars?.[person]:null];
    });
    window.SILU_LOADING?.warm(images);
  }
  function imageFallback(){root.querySelectorAll('img[data-character-fallback]').forEach(img=>{const fallback=()=>{img.parentElement.innerHTML=art.person(img.dataset.characterFallback);};img.onerror=fallback;if(img.complete&&!img.naturalWidth)fallback();});root.querySelectorAll('img[data-fallback]').forEach(img=>img.onerror=()=>{img.parentElement.innerHTML=img.dataset.fallback==='map'?art.map:art.scene[img.dataset.fallback];});}
  const nodes=[{x:.074,y:.69},{x:.255,y:.55},{x:.52,y:.65},{x:.927,y:.51}];
  const passing=[{name:'张掖',x:.338,y:.57},{name:'嘉峪关',x:.425,y:.61},{name:'玉门关',x:.604,y:.59},{name:'阳关',x:.655,y:.67},{name:'吐鲁番',x:.747,y:.54},{name:'库车',x:.837,y:.57}];
  const route=[{x:.035,y:.74},nodes[0],nodes[1],...passing.slice(0,2),nodes[2],...passing.slice(2),nodes[3],{x:.97,y:.48}];
  function roadY(x){for(let i=1;i<route.length;i++)if(x<=route[i].x){const a=route[i-1],b=route[i],t=(x-a.x)/(b.x-a.x);return a.y+(b.y-a.y)*t;}return .48;}
  function mapTraveler(){
    if(assets.mapTravelerWalk)return `<span class="traveler-sprite"><img src="${escape(assets.mapTravelerWalk)}" alt="行走的青年" data-walk-sheet></span>`;
    return assets.mapTraveler?`<img src="${escape(assets.mapTraveler)}" alt="行走的青年">`:art.person();
  }
  function showMap(prefer){
    if(!data.prologueDone){showPrologue();return;}data.epilogueStarted=false;save();
    view='map';change();selected=prefer??nextStation();
    const all=data.completed.every(Boolean);
    root.innerHTML=`${header(true)}<main class="home"><div class="map-scroll" tabindex="0" aria-label="丝路长卷，可横向拖动。点击地点前往，抵达后单独进入。"><div class="map-world"><div class="map-art">${assets.map?`<img src="${escape(assets.map)}" alt="丝路长卷" data-fallback="map">`:art.map}</div><svg class="map-road" viewBox="0 0 1000 680" preserveAspectRatio="none"><path class="road-shadow" d="${route.map((p,i)=>`${i?'L':'M'}${p.x*1000} ${p.y*680}`).join(' ')}"/><path class="road-line" d="${route.map((p,i)=>`${i?'L':'M'}${p.x*1000} ${p.y*680}`).join(' ')}"/></svg>${chapters.map((c,i)=>`<button class="map-node ${data.completed[i]?'complete':''} ${unlocked(i)?'':'locked'}" data-station="${i}" aria-disabled="${!unlocked(i)}" style="left:${nodes[i].x*100}%;top:${nodes[i].y*100}%" aria-label="${c.place}，${data.completed[i]?'已完成，可重访':unlocked(i)?'点击前往':'尚未开启'}"><span class="node-ring"></span><strong class="node-title">${c.place}</strong><span class="node-caption">${data.completed[i]?'已走过':unlocked(i)?'此程出发':'待前程抵达'}</span></button>`).join('')}${passing.map(p=>`<div class="waypoint" tabindex="0" aria-label="${p.name}，途经地，无剧情" style="left:${p.x*100}%;top:${p.y*100}%"><span>${p.name}</span><span class="way-tip" role="tooltip">${escape(story.waypoints.find(w=>w.name===p.name)?.text||'')}</span></div>`).join('')}<div class="traveler ${assets.mapTravelerWalk?'has-walk-sheet':''}" id="traveler">${mapTraveler()}</div></div></div><div class="map-bottom"><div class="map-current" id="map-current"></div><div class="map-navigation"><div class="map-pan"><button data-pan="-1" aria-label="向东浏览">←</button><span class="scroll-track"><i></i></span><button data-pan="1" aria-label="向西浏览">→</button></div><button class="${all?'outline':'primary'}" id="enter-station"></button>${all?`<button class="primary" id="view-ending">重看尾声 ↗</button>`:''}</div></div></main>`;
    bindHeader();imageFallback();positionTraveler(data.traveler);updateMapSelection();
    window.SILU_LOADING?.warm([assets[chapters[selected].id],assets.scholar]);
    const walkSheet=$('[data-walk-sheet]');
    if(walkSheet){const fallback=()=>{const t=$('#traveler');if(!t)return;t.classList.remove('has-walk-sheet');t.innerHTML=art.person();};walkSheet.onerror=fallback;if(walkSheet.complete&&!walkSheet.naturalWidth)fallback();}
    const scroll=$('.map-scroll'),world=$('.map-world');
    function indicator(){const max=scroll.scrollWidth-scroll.clientWidth,track=$('.scroll-track');if(track)track.firstElementChild.style.left=`${Math.max(0,(track.clientWidth-28)*(max?scroll.scrollLeft/max:0))}px`;}
    scroll.onscroll=indicator;
    requestAnimationFrame(()=>{if(view==='map'){scroll.scrollLeft=data.traveler*world.clientWidth-scroll.clientWidth*.5;indicator();}});
    root.querySelectorAll('[data-pan]').forEach(b=>b.onclick=()=>scroll.scrollBy({left:Number(b.dataset.pan)*scroll.clientWidth*.65,behavior:'smooth'}));
    root.querySelectorAll('[data-station]').forEach(b=>b.onclick=()=>{
      const i=Number(b.dataset.station);
      if(!unlocked(i)){toast(`请先完成「${chapters[nextStation()].place}」，再继续向西。`);return;}
      selected=i;updateMapSelection();walkTo(nodes[i].x);
    });
    $('#enter-station').onclick=()=>{
      if(walking||!unlocked(selected))return;
      if(Math.abs(data.traveler-nodes[selected].x)>.003){walkTo(nodes[selected].x);return;}
      openChapter(selected);
    };
    if($('#view-ending'))$('#view-ending').onclick=()=>{if(data.completed.every(Boolean)){data.epilogueStarted=true;showEpilogue(0);}};
    root.querySelectorAll('.waypoint').forEach(el=>{el.onpointerdown=e=>e.stopPropagation();el.onpointerup=e=>e.stopPropagation();el.onclick=e=>{e.preventDefault();e.stopPropagation();el.classList.add('tip-dismissed');el.blur();};el.onpointerleave=()=>el.classList.remove('tip-dismissed');});
    $('[data-reset]').onclick=confirmRestart;
    let drag=null;
    scroll.onpointerdown=e=>{if(e.button!==0||e.target.closest('button,.waypoint'))return;drag={x:e.clientX,scroll:scroll.scrollLeft,moved:false,id:e.pointerId};if(e.pointerType==='mouse')scroll.setPointerCapture(e.pointerId);};
    scroll.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>8)drag.moved=true;if(drag.moved&&e.pointerType==='mouse')scroll.scrollLeft=drag.scroll-dx;};
    scroll.onpointerup=e=>{if(!drag)return;const moved=drag.moved;drag=null;if(!moved){const r=world.getBoundingClientRect();const target=(e.clientX-r.left)/r.width;walkTo(Math.max(.035,Math.min(nodesLimit(),target)));}};
    scroll.onpointercancel=()=>drag=null;scroll.onlostpointercapture=()=>drag=null;
    const wheel=e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();scroll.scrollLeft+=e.deltaY;}};
    scroll.addEventListener('wheel',wheel,{passive:false});cleanup=()=>scroll.removeEventListener('wheel',wheel);
  }
  function restartJourney(){
    data=fresh();current=0;selected=0;clearTimeout(noticeTimer);save();showTitle();
  }
  function confirmRestart(){
    if($('.restart-dialog'))return;
    const dialog=document.createElement('dialog');dialog.className='restart-dialog';dialog.setAttribute('aria-labelledby','restart-title');
    dialog.innerHTML='<p class="eyebrow">重新启程</p><h2 id="restart-title">从出发前夜，重新开始</h2><p>将清空此行进度，返回标题界面。</p><div class="restart-actions"><button class="outline" data-cancel autofocus>留在这一程</button><button class="primary" data-confirm>从头开始</button></div>';
    root.append(dialog);const close=()=>{dialog.close();dialog.remove();$('[data-reset]')?.focus();};
    dialog.querySelector('[data-cancel]').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
    dialog.querySelector('[data-confirm]').onclick=()=>{dialog.close();dialog.remove();restartJourney();};dialog.showModal();
  }
  function updateMapSelection(){
    if(view!=='map')return;
    const c=chapters[selected],done=data.completed[selected],cp=data.chapters[selected],at=Math.abs(data.traveler-nodes[selected].x)<=.003;
    $('#map-current').innerHTML=`<strong>${c.place}</strong>`;
    const button=$('#enter-station');button.disabled=walking;button.textContent=walking?'正在前往…':!at?`前往${c.place} →`:done?`重访${c.place}`:cp.line>0||cp.stage!=='intro'?`续读${c.place} ↗`:`进入${c.place} ↗`;
    root.querySelectorAll('.map-node').forEach((b,i)=>b.classList.toggle('current',selected===i));
  }
  function positionTraveler(x){const t=$('#traveler');if(t){t.style.left=`${x*100}%`;t.style.top=`${roadY(x)*100}%`;}}
  function walkTo(target,callback){
    cancelAnimationFrame(motion);target=Math.max(.035,Math.min(nodesLimit(),target));
    const start=data.traveler,delta=target-start,t=$('#traveler'),scroll=$('.map-scroll'),world=$('.map-world');if(!t)return;
    walking=true;updateMapSelection();t.classList.add('walking');t.classList.toggle('flip',delta<0);
    const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.max(220,Math.min(2600,Math.abs(delta)*8000)),began=performance.now(),cameraStart=scroll.scrollLeft;
    function frame(now){
      const p=duration===0?1:Math.min(1,(now-began)/duration);data.traveler=start+delta*p;positionTraveler(data.traveler);
      // Camera follows every frame, with a short easing from a manually panned view.
      const follow=Math.max(0,Math.min(world.clientWidth-scroll.clientWidth,data.traveler*world.clientWidth-scroll.clientWidth*.5));
      const blend=duration===0?1:Math.min(1,(now-began)/240);scroll.scrollLeft=cameraStart+(follow-cameraStart)*blend;
      if(p<1)motion=requestAnimationFrame(frame);else{walking=false;t.classList.remove('walking');save();updateMapSelection();if(callback&&view==='map')callback();}
    }
    motion=requestAnimationFrame(frame);
  }
  function openChapter(i){
    if(!unlocked(i))return;current=i;
    if(data.chapters[i].stage==='complete')data.chapters[i]={stage:'intro',line:0,game:{},passed:false};
    save();if(data.chapters[i].stage==='game')showGame();else showDialogue();
  }
  function introLines(c){return [...c.narration.map(text=>({kind:'narration',speaker:'旁白',text})),...c.before];}
  function speakerLabel(){return '';}
  function messageScene(row,line,total,controls,rows){
    const outgoing=r=>r.direction==='outgoing'||r.speaker==='你';
    const contact=outgoing(row)?'顾老师':row.speaker;
    let start=line;
    while(start>0&&rows[start-1].kind==='message'&&(outgoing(rows[start-1])||rows[start-1].speaker===contact))start--;
    const history=rows.slice(start,line+1);
    const avatar=r=>{const key=outgoing(r)?'traveler':r.speaker==='爷爷'?'grandfather':'scholar';return '<span class="chat-avatar" aria-hidden="true">'+(assets[key]?'<img src="'+escape(assets.avatars?.[key]||assets[key])+'" alt="" data-character-fallback="'+key+'">':art.person(key).replace('viewBox="0 0 120 190"','viewBox="25 8 70 70"'))+'</span>';};
    return '<section class="chat-scene" aria-label="手机聊天"><div class="chat-window"><div class="chat-header"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4Z"/></svg><span>手机消息</span></div><div class="chat-thread" tabindex="0" aria-label="聊天记录">'+history.map((r,i)=>'<div class="chat-row '+(outgoing(r)?'outgoing':'incoming')+'" '+(i===history.length-1?'data-current-message':'')+'>'+avatar(r)+'<p class="chat-bubble" '+(i===history.length-1?'aria-live="polite"':'')+'>'+escape(r.text)+'</p></div>').join('')+'</div><div class="chat-controls">'+controls+'</div></div></section>';
  }
  function positionChat(){
    const thread=$('.chat-thread');if(thread)thread.scrollTop=thread.scrollHeight;
    const stage=$('.story-stage'),portrait=stage?.querySelector('.scene-character'),dialogue=stage?.querySelector('.dialogue');
    if(!portrait||!dialogue)return;
    const align=()=>{
      const s=stage.getBoundingClientRect(),d=dialogue.getBoundingClientRect();
      const height=Math.min(portrait.offsetHeight,Math.max(100,d.top-s.top+70));
      portrait.style.height=height+'px';portrait.style.top=(d.top-s.top-height+70)+'px';
      portrait.style.left=(portrait.dataset.character==='scholar'?d.right-s.left-portrait.offsetWidth-14:d.left-s.left+14)+'px';
    };
    align();const observer=new ResizeObserver(align);observer.observe(stage);observer.observe(dialogue);
    const previousCleanup=cleanup;cleanup=()=>{observer.disconnect();previousCleanup();};
  }
  function showPrologue(){
    view='prologue';change();const line=data.prologueLine,row=story.prologue[line],last=line===story.prologue.length-1;
    const scene=row.scene||'packing';
    const heading='';
    const controls='<button class="text-button" id="previous" '+(line===0?'disabled':'')+'>← 上一句</button><button class="primary" id="next">'+(last?'沿丝路出发 ↗':'继续 →')+'</button>';
    root.innerHTML=background(scene)+'<header class="topbar opening-topbar"><span class="brand"><span class="brand-mark">知<br>远</span>丝路知远</span></header>'+(row.kind==='message'?'<main class="mail-stage prologue-mail">'+heading+messageScene(row,line,story.prologue.length,controls,story.prologue)+'</main>':'<main class="story-stage opening-stage" data-scene="'+scene+'">'+heading+character(row)+'<section class="dialogue" aria-label="序章对话"><p class="dialogue-text" aria-live="polite">'+escape(row.text)+'</p><div class="dialogue-controls">'+controls+'</div></section></main>');
    imageFallback();positionChat();$('#previous').onclick=()=>{if(line>0){data.prologueLine--;save();showPrologue();}};$('#next').onclick=()=>{if(!last){data.prologueLine++;save();showPrologue();}else{data.prologueDone=true;save();if(data.epilogueStarted)showEpilogue(data.epilogueStep,data.epilogueLine);else showMap();}};
    warmDialogue(story.prologue,line,'packing');
  }
  function showDialogue(){
    view='dialogue';change();const c=chapters[current],cp=data.chapters[current],lines=cp.stage==='after'?c.after:introLines(c);
    if(!lines.length){finishChapter();return;}let line=Math.max(0,Math.min(lines.length-1,cp.line));cp.line=line;
    const row={...lines[line],text:lines[line].text},last=line===lines.length-1,scholar=row.speaker==='顾老师',remote=row.kind==='message',portrait=scholar?'scholar':'traveler';
    const nextLabel=last?cp.stage==='after'?'回到长卷 ↗':current<2?'翻进画册 ↗':'动手续写 ↗':'继续 →';
    const controls='<button class="text-button" id="previous" '+(line===0?'disabled':'')+'>← 上一句</button><button class="primary" id="next">'+nextLabel+'</button>';
    const heading='';
    if(remote){
      root.innerHTML=background(c.id)+header()+'<main class="mail-stage">'+heading+messageScene(row,line,lines.length,controls,lines)+'</main>';
    }else{
      root.innerHTML=background(c.id)+header()+'<main class="story-stage">'+heading+(c.annotation&&cp.stage==='intro'&&line===0?'<button class="hotspot" aria-expanded="false"><span class="pulse-dot"></span>'+c.annotation.label+' ＋</button>':'')+(row.kind==='dialogue'?'<div class="scene-character" data-character="'+portrait+'">'+(assets[portrait]?'<img src="'+escape(assets[portrait])+'" alt="'+(scholar?'顾老师':'青年')+'">':art.person(portrait))+'</div>':'')+'<section class="dialogue" aria-label="剧情对话" style="--progress:'+((line+1)/lines.length*100)+'%"><p class="dialogue-text" aria-live="polite">'+escape(row.text)+'</p><div class="dialogue-controls">'+controls+'</div></section></main>';
    }
    bindHeader();imageFallback();positionChat();$('#previous').onclick=()=>{if(line>0){cp.line--;save();showDialogue();}};
    warmDialogue(lines,line,c.id);
    $('#next').onclick=()=>{if(!last){cp.line++;save();showDialogue();}else if(cp.stage==='after'){if(cp.passed)finishChapter();}else{cp.stage='game';cp.line=0;save();showGame();}};
    if($('.hotspot'))$('.hotspot').onclick=()=>{const b=$('.hotspot');if($('.annotation')){$('.annotation').remove();b.setAttribute('aria-expanded','false');return;}const note=document.createElement('aside');note.className='annotation';note.innerHTML='<button aria-label="收起注解">×</button><p>'+escape(c.annotation.text)+'</p>'+(c.annotation.source?'<a class="annotation-source" href="'+escape(c.annotation.source.url)+'" target="_blank" rel="noopener noreferrer">'+escape(c.annotation.source.label)+' ↗</a>':'');$('.story-stage').append(note);b.setAttribute('aria-expanded','true');note.querySelector('button').onclick=()=>{note.remove();b.setAttribute('aria-expanded','false');b.focus();};};
  }
  function showGame(){
    if(!unlocked(current))return;view='game';change();const c=chapters[current],cp=data.chapters[current];cp.stage='game';
    root.innerHTML=`${background(c.id)}${header()}<main class="game-stage ${current===1?'trade-stage':''}"><div class="game-heading">${current===1?'':`<div><p class="eyebrow">${c.place}</p><h1 class="game-title">${c.game.name}</h1></div>`}<div class="game-tools"><details class="game-help"><summary>玩法</summary><p>${escape(c.game.help)}</p></details><button class="game-reset">重来 ↻</button></div></div>${current===1?'':`<p class="game-instruction">${c.game.instruction}</p>`}<section class="game-panel"><div class="game-counter" aria-live="polite"></div><div id="game-workspace"></div><div class="game-footer"><p class="game-feedback" role="status" aria-live="polite"></p>${current===1?'':'<button class="primary" id="game-continue" disabled>收进画册 →</button>'}</div></section></main>`;
    bindHeader();imageFallback();
    const continueStory=()=>{if(!cp.passed)return;cp.stage='after';cp.line=0;save();showDialogue();};
    let endTimer;const api={assets,art,continueStory,onSave:game=>{cp.game=game;save();},feedback:(text,success=false)=>{const el=$('.game-feedback');if(el){el.textContent=text;el.classList.toggle('success',success);}},counter:text=>{if($('.game-counter'))$('.game-counter').textContent=text;},done:()=>{cp.passed=true;save();if(current===3){endTimer=setTimeout(()=>{if(view==='game')finishChapter();},900);}else if($('#game-continue'))$('#game-continue').disabled=false;}};
    const unmount=(current===2?window.SILU_RHYTHM:current<2?window.SILU_CHALLENGES:window.SILU_JOURNEY_B).mount(current,$('#game-workspace'),cp.game,api);
    cleanup=()=>{clearTimeout(endTimer);if(typeof unmount==='function')unmount();};
    if(current===3){$('#game-continue').hidden=true;$('.game-footer').classList.add('final-game-footer');}
    $('.game-reset').onclick=()=>{cp.game={};cp.passed=false;save();showGame();};
    if($('#game-continue'))$('#game-continue').onclick=continueStory;
  }
  function finishChapter(){
    const cp=data.chapters[current];if(!cp.passed||!unlocked(current))return;
    cp.stage='complete';cp.line=0;data.completed[current]=true;data.traveler=nodes[current].x;save();if(current===3){data.epilogueStarted=true;showEpilogue(0);}else{showMap(current+1);toast(`已收下“${chapters[current].keepsake.word}”，下一站${chapters[current+1].place}`);}
  }
  function showEpilogue(step=0,line=0){
    if(!data.completed.every(Boolean))return;view=step===2?'finale':'epilogue';change();data.epilogueStarted=true;data.epilogueStep=step;save();
    if(step<2){
      const page=story.epilogue[step],rows=page.lines;line=Math.max(0,Math.min(rows.length-1,line));data.epilogueLine=line;save();const row=rows[line],last=line===rows.length-1;
      const controls='<button class="text-button" id="previous" '+(step===0&&line===0?'disabled':'')+'>← 上一句</button><button class="primary" id="next">'+(last&&step===1?'翻开最后一页 ↗':'继续 →')+'</button>';
      const heading='';
      root.innerHTML=background(page.scene||'opening')+'<header class="topbar epilogue-topbar"><span class="brand"><span class="brand-mark">知<br>远</span>丝路知远</span></header>'+(row.kind==='message'?'<main class="mail-stage epilogue-dialogue">'+heading+messageScene(row,line,rows.length,controls,rows)+'</main>':'<main class="story-stage opening-stage epilogue-dialogue">'+heading+character(row)+'<section class="dialogue" aria-label="尾声对话"><p class="dialogue-text" aria-live="polite">'+escape(row.text)+'</p><div class="dialogue-controls">'+controls+'</div></section></main>');
      imageFallback();positionChat();$('#previous').onclick=()=>{if(line>0)showEpilogue(step,line-1);else if(step>0)showEpilogue(step-1,story.epilogue[step-1].lines.length-1);};$('#next').onclick=()=>last?showEpilogue(step+1):showEpilogue(step,line+1);return;
    }
    data.epilogueLine=0;
    const final=step===2,c=final?story.finale:story.epilogue[step];
    let delay=0;const text=final?c.lines.map(line=>{const groups=[];for(const char of line){if(/[，。；：！？]/.test(char)&&groups.length)groups[groups.length-1]+=char;else groups.push(char);}const chars=groups.map(char=>{const span='<span class="final-char" aria-hidden="true" style="--at:'+delay.toFixed(2)+'s">'+escape(char)+'</span>';delay+=.055*char.length;return span;}).join('');delay+=.55;return '<p aria-label="'+escape(line)+'">'+chars+'</p>';}).join(''):c.paragraphs.map(t=>'<p>'+escape(t)+'</p>').join('');
    root.innerHTML=background(final?'epilogue':'opening')+'<header class="topbar epilogue-topbar"><span class="brand"><span class="brand-mark">知<br>远</span>丝路知远</span></header><main class="epilogue-stage '+(final?'finale-stage':'')+'"><section class="epilogue-page"><h1>'+(final&&assets.titleLogo?'<img class="finale-logo" src="'+escape(assets.titleLogo)+'" alt="'+escape(c.title)+'">':escape(c.title))+'</h1><div class="epilogue-copy '+(final?'finale-copy':'')+'">'+text+'</div>'+(final?'<div class="epilogue-actions"><button class="outline" id="back-map">再看长卷</button><button class="primary" id="restart-ending">从头开始</button></div>':'<div class="epilogue-actions"><button class="text-button" id="previous" '+(step===0?'disabled':'')+'>← 上一页</button><button class="primary" id="next">'+(step===1?'翻开最后一页 ↗':'继续 →')+'</button></div>')+'</section></main>';
    const finaleLogo=$('.finale-logo');if(finaleLogo)finaleLogo.onerror=()=>{finaleLogo.parentElement.textContent=c.title;};
    imageFallback();if(!final){$('#previous').onclick=()=>showEpilogue(step-1);$('#next').onclick=()=>showEpilogue(step+1);return;}
    data.ended=true;save();$('#back-map').onclick=()=>showMap();$('#restart-ending').onclick=restartJourney;
  }
  document.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||document.querySelector('dialog[open]'))return;
    if(e.key==='Escape'){if($('.annotation')){$('.annotation').remove();$('.hotspot').setAttribute('aria-expanded','false');}else if(view==='dialogue'||view==='game')showMap();return;}
    if(e.target.closest('button,input,select,textarea,[role="button"]'))return;
    if(view==='title'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();$('#enter-game').click();return;}
    if(view==='dialogue'||view==='prologue'||view==='epilogue'){if([' ','Enter','ArrowRight'].includes(e.key)){e.preventDefault();$('#next').click();}if(e.key==='ArrowLeft')$('#previous').click();}
    else if(view==='map'){if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();walkTo(Math.max(.035,Math.min(nodesLimit(),data.traveler+(e.key==='ArrowRight'?.045:-.045))));}if(e.key==='Enter')$('#enter-station').click();}
  });
  window.addEventListener('pagehide',save);showTitle();
})();

