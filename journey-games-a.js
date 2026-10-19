(() => {
  'use strict';
  const icon = (kind) => {
    const paths = {
      water:'<path d="M16 3C13 8 7 13 7 19a9 9 0 0 0 18 0C25 13 19 8 16 3Z" fill="currentColor"/><path d="M12 20q0 5 5 5" fill="none" stroke="#f5ecd8" stroke-width="2"/>',
      rock:'<path d="m2 28 9-21 6 12 5-8 9 17Z" fill="currentColor"/><path d="m9 13 2-6 4 8" stroke="#e7dec4" fill="none"/>',
      sand:'<path d="M2 10h19q9 0 6-6M1 17h23q9 0 5 7M7 24h9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
      station:'<path d="M3 13h26L16 4Z" fill="currentColor"/><path d="M6 14v15h20V14M12 29V18h8v11" fill="none" stroke="currentColor" stroke-width="2.5"/>',
      letter:'<rect x="3" y="7" width="26" height="19" rx="2" fill="#e6c98e" stroke="currentColor" stroke-width="2"/><path d="m3 8 13 10L29 8" fill="none" stroke="currentColor" stroke-width="2"/>',
      silk:'<path d="M7 4h20q-7 12-2 24H5q-5-12 2-24Z" fill="#87a79a" stroke="currentColor" stroke-width="1.5"/><path d="m8 10 15 4M6 18l16 4" stroke="#e9d7ac" stroke-width="2"/>',
      herb:'<path d="M16 29V7M16 15Q1 14 5 4q14 1 11 11m0 7q14-2 12-12-13 1-12 12" fill="#77976b" stroke="currentColor" stroke-width="1.5"/>',
      bag:'<path d="M12 3h8v7q10 5 8 14-2 7-12 6S2 25 4 18q1-5 8-8Z" fill="#b79a6a" stroke="currentColor" stroke-width="1.5"/><path d="M10 9h12M12 17q-4 3-2 7" stroke="#f2e4c7" fill="none" stroke-width="2"/>',
      wheel:'<circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="16" cy="16" r="3" fill="#b58b57"/><path d="M16 4v24M4 16h24M7 7l18 18M7 25 25 7" stroke="currentColor" stroke-width="1.5"/>',
      food:'<path d="M4 24C1 8 29 6 29 23q-8 9-25 1Z" fill="#c4a168" stroke="currentColor" stroke-width="1.5"/><path d="m11 14-3 8m11-9-3 9m10-7-3 7" stroke="#f0dab2" stroke-width="2"/>'
    };
    return `<svg viewBox="0 0 32 32" aria-hidden="true">${paths[kind] || paths.letter}</svg>`;
  };
  function mount(index, host, saved = {}, api) {
    const disposers = [];
    const on = (el,event,fn) => {el.addEventListener(event,fn);disposers.push(()=>el.removeEventListener(event,fn));};
    const $ = s => host.querySelector(s);
    if(index === 0) route(); else exchange();
    return () => disposers.forEach(fn=>fn());

    function route() {
      const cap=7, start=28, goal=6;
      const rocks=new Set([2,3,12,15,17,26]), waters=new Set([11,23]), sands=new Set([8,16,19,30,31]);
      const terrain=id=>rocks.has(id)?'rock':waters.has(id)?'water':sands.has(id)?'sand':id===goal?'station':'plain';
      const near=(a,b)=>Math.abs(Math.floor(a/7)-Math.floor(b/7))+Math.abs(a%7-b%7)===1;
      let trail=[{id:start,water:cap}],done=false;
      if(Array.isArray(saved.trail)) {
        for(const entry of saved.trail.slice(1,501)) {
          const prev=trail.at(-1), id=entry?.id;
          if(!Number.isInteger(id)||id<0||id>34||rocks.has(id)||!near(prev.id,id)||prev.water<=0||prev.id===goal)break;
          const water=waters.has(id)?cap:Math.max(0,prev.water-(sands.has(id)?3:1));
          trail.push({id,water});
        }
      }
      done=trail.at(-1).id===goal;
      host.innerHTML=`<div class="ja-route" data-game="route"><div class="ja-brief">${icon('letter')}<span>沿画册的路，把家书送到驿站。</span></div><div class="ja-route-tools"><div class="ja-water" aria-label="剩余水量"><span>水囊</span><div class="ja-water-drops"></div><b data-water></b></div><button type="button" data-route-undo>撤回一步</button><button type="button" data-route-reset>重走</button></div><div class="ja-grid" role="group" aria-label="五行七列的行旅地图，点击上下左右相邻格"><svg class="ja-trail" viewBox="0 0 700 500" preserveAspectRatio="none" aria-hidden="true"><polyline/></svg>${Array.from({length:35},(_,id)=>{const kind=terrain(id),name=id===start?'长安':id===goal?'驿站':kind==='water'?'水源':kind==='rock'?'山石':kind==='sand'?'风沙':'戈壁';return `<button type="button" class="ja-cell ja-${kind}" data-cell="${id}" aria-label="第${Math.floor(id/7)+1}行第${id%7+1}列，${name}">${id===start?'<span class="ja-place">长安</span>':kind!=='plain'?icon(kind):'<span class="ja-pebbles">· ·</span>'}${['water','sand','station'].includes(kind)?`<span class="ja-cell-name">${name}</span>`:''}</button>`;}).join('')}<div class="ja-walker" aria-hidden="true"><span class="ja-walker-head"></span><span class="ja-walker-body"></span></div></div><div class="ja-legend"><span>${icon('water')}补满</span><span>${icon('sand')}耗水 3</span><span>${icon('rock')}绕行</span><span>戈壁耗水 1</span></div><p class="ja-route-note" data-route-note role="status"></p></div>`;
      const cells=[...host.querySelectorAll('[data-cell]')];
      function persist(){api.onSave({trail:trail.map(p=>({...p})),position:trail.at(-1).id,water:trail.at(-1).water,done});}
      function render(message) {
        const last=trail.at(-1),failed=last.water===0&&!done;
        $('.ja-water-drops').innerHTML=Array.from({length:cap},(_,i)=>`<i class="${i<last.water?'full':''}"></i>`).join('');
        $('[data-water]').textContent=`${last.water}/${cap}`;$('.ja-water').classList.toggle('low',last.water<=2);
        cells.forEach(b=>{const id=Number(b.dataset.cell),adjacent=near(last.id,id)&&!rocks.has(id);b.classList.toggle('ja-reachable',adjacent&&!failed&&!done);b.classList.toggle('ja-visited',trail.some(p=>p.id===id));b.classList.toggle('ja-current',id===last.id);b.setAttribute('aria-current',id===last.id?'location':'false');b.setAttribute('aria-disabled',String(!adjacent||failed||done));});
        $('.ja-trail polyline').setAttribute('points',trail.map(p=>`${(p.id%7)*100+50},${Math.floor(p.id/7)*100+50}`).join(' '));
        $('.ja-walker').style.left=`${(last.id%7+.5)/7*100}%`;$('.ja-walker').style.top=`${(Math.floor(last.id/7)+.5)/5*100}%`;
        $('[data-route-undo]').disabled=trail.length===1||done;$('[data-route-reset]').disabled=done;
        const text=message||(done?'画册里，家书送到了。陌生人的托付，也成了西行的理由。':failed?'水用尽了，先歇一歇。撤回一步，或重新找一条路。':last.water<=2?'水不多了，看看附近的水源。':'画册里的路：点击相邻地格，靠近水源再向西。');
        $('[data-route-note]').textContent=text;$('.ja-route').classList.toggle('ja-failed',failed);$('.ja-route').classList.toggle('ja-done',done);
        api.counter(done?'家书已送达':`行走 ${trail.length-1} 步`);api.feedback(done?'一封家书，连起两处牵挂。':failed?'路可以重选，托付仍在。':'手绘册中的行旅想象',done);persist();if(done)api.done();
      }
      cells.forEach(b=>on(b,'click',()=>{const id=Number(b.dataset.cell),last=trail.at(-1);if(done)return;if(last.water<=0){render('水已用尽。撤回一步，回到还能选择的地方。');return;}if(rocks.has(id)){render('这里山石难行，换一条路。');return;}if(!near(last.id,id)){render('一步一步走：只能进入上下左右相邻格。');return;}const water=waters.has(id)?cap:Math.max(0,last.water-(sands.has(id)?3:1));trail.push({id,water});done=id===goal&&water>0;if(id===goal&&water===0){trail.pop();render('水还差一点，先找补给，再把家书送到。');return;}render(waters.has(id)?'找到了画册标出的水源。补满水囊，继续送信。':undefined);}));
      on($('[data-route-undo]'),'click',()=>{if(done||trail.length===1)return;trail.pop();render('回到上一步，重新看看地形。');});
      on($('[data-route-reset]'),'click',()=>{if(done)return;trail=[{id:start,water:cap}];render('家书妥善收好。沿水源重新规划这段路。');});render();
    }

    function exchange() {
      const labels={silk:'丝绢',herb:'药草',bag:'水囊',wheel:'车轮',food:'干粮'};
      const people=[
        {name:'药草摊',role:'药草换丝绢',offer:'herb',want:'silk',say:'药草需要重新包好。用丝绢包裹，可换走一束药草。',reject:'包裹药草需要丝绢，手中的物品暂时换不了。',tone:'green'},
        {name:'水囊摊',role:'水囊换药草',offer:'bag',want:'herb',say:'长途跋涉后需要药草。有一只备用水囊可以交换。',reject:'这里需要药草，手中的物品暂时换不了。',tone:'ochre'},
        {name:'车轮摊',role:'车轮换水囊',offer:'wheel',want:'bag',say:'即将穿过漫长的旱路。用水囊，可以换走备用车轮。',reject:'带上水囊，再来交换这只车轮。',tone:'blue'},
        {name:'干粮摊',role:'干粮换丝绢',offer:'food',want:'silk',say:'包裹干粮需要丝绢。若这次交换不合适，还能原样换回。',reject:'这里需要包裹干粮的丝绢。',tone:'gold'}
      ];
      const validActions=['ning','zhou','cen','he','return'];
      let log=[],item='silk',selected=null,heard=new Set(Array.isArray(saved.heard)?saved.heard.filter(n=>Number.isInteger(n)&&n>=0&&n<4):[]),message='车轮停在了这一页。查看交换牌，让路继续向前。';
      function apply(action) {
        if(action==='ning'&&item==='silk')item='herb';else if(action==='zhou'&&item==='herb')item='bag';else if(action==='cen'&&item==='bag')item='wheel';else if(action==='he'&&item==='silk')item='food';else if(action==='return'&&item==='food')item='silk';else return false;return true;
      }
      if(Array.isArray(saved.log))for(const a of saved.log.slice(0,100)){if(!validActions.includes(a)||!apply(a))break;log.push(a);}
      let done=item==='wheel';
      host.innerHTML=`<div class="ja-exchange" data-game="exchange"><div class="ja-brief">${icon('wheel')}<span>送信的车停了。用一块丝绢，换回车轮。</span></div><div class="ja-people">${people.map((p,i)=>`<button type="button" class="ja-person ja-tone-${p.tone}" data-person="${i}" aria-label="查看${p.name}所需"><span class="ja-stall-object">${icon(p.offer)}</span><b>${p.name}</b><span class="ja-heard" data-heard="${i}">查看所需</span></button>`).join('')}</div><div class="ja-request" aria-live="polite"><div class="ja-request-head"><strong data-person-name>驿站歇脚处</strong><span data-person-role>查看所需，再作交换</span></div><p data-request>一小块丝绢，也许能让几个人继续前行。</p><button type="button" class="ja-trade-button" data-trade disabled>选一处摊位</button></div><div class="ja-inventory"><div><span>你带着</span><strong data-item></strong></div><button type="button" data-trade-undo>撤回交换</button></div><p class="ja-exchange-note" data-exchange-note role="status"></p><div class="ja-recap" data-recap hidden aria-label="互助交换复盘"></div></div>`;
      function persist(){api.onSave({log:[...log],item,heard:[...heard],done});}
      function render() {
        $('[data-item]').innerHTML=`${icon(item)}${labels[item]}`;$('[data-trade-undo]').disabled=!log.length||done;
        host.querySelectorAll('[data-person]').forEach(b=>{const id=Number(b.dataset.person);b.classList.toggle('selected',selected===id);b.setAttribute('aria-pressed',String(selected===id));$(`[data-heard="${id}"]`).textContent=heard.has(id)?'已查看':'查看所需';});
        const person=selected===null?null:people[selected];
        $('[data-person-name]').textContent=person?person.name:done?'车轮已换回':'驿站歇脚处';$('[data-person-role]').textContent=person?person.role:done?'这段路可以继续了':'查看所需，再作交换';
        $('[data-request]').textContent=done?'丝绢、药草、水囊，一件件换到了需要它们的地方。车轮终于可以装上了。':person?(selected===3&&item==='food'?'丝绢还留在摊位上。交回干粮，就能换回丝绢。':person.say):'故事里，一小块丝绢，也许能让几个人继续前行。';
        $('[data-trade]').disabled=selected===null||done;$('[data-trade]').textContent=done?'已找到车轮':selected===null?'选一处摊位':selected===3&&item==='food'?'用干粮换回丝绢':`用${labels[item]}交换${labels[person.offer]}`;
        $('[data-exchange-note]').textContent=message;$('.ja-exchange').classList.toggle('ja-done',done);
        if(done){const recap=$('[data-recap]');recap.hidden=false;recap.innerHTML=['silk','herb','bag','wheel'].map((v,i)=>`${i?'<span class="ja-recap-arrow">→</span>':''}<span>${icon(v)}${labels[v]}</span>`).join('');}
        api.counter(done?'车轮已换回':`${heard.size} / 4 已查看`);api.feedback(done?'一人所长，补一人所需。':'看清所需的物品，再试着交换。',done);persist();if(done)api.done();
      }
      host.querySelectorAll('[data-person]').forEach(b=>on(b,'click',()=>{selected=Number(b.dataset.person);heard.add(selected);message=done?'物品各得其所，这段路接上了。':`你查看了${people[selected].name}的交换牌。`;render();}));
      on($('[data-trade]'),'click',()=>{if(selected===null||done)return;const person=people[selected];let action=selected===3&&item==='food'?'return':['ning','zhou','cen','he'][selected],old=item;
        if(!apply(action)){message=`${person.name}：${person.reject}`;render();return;}
        log.push(action);done=item==='wheel';message=done?'车轮换回来了。画中的车终于能继续向前。':`在${person.name}，用${labels[old]}换到了${labels[item]}。${item==='food'?'暂时不缺干粮，可以在此换回丝绢。':''}`;render();
      });
      on($('[data-trade-undo]'),'click',()=>{if(done||!log.length)return;log.pop();item='silk';for(const action of log)apply(action);message='撤回这次交换，物品回到原处。';render();});render();
    }
  }
  window.SILU_JOURNEY_A={mount};
})();

