(() => {
  'use strict';
  const VERSION=6;
  function rng(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
  function shuffle(array,seed){const a=[...array],r=rng(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  const route={cols:7,rows:6,start:35,goal:6,limit:18,rocks:[1,2,9,12,15,16,19,26,33],wells:[23,11],shelters:[30,17,10],sand:[22,24,25,31,32],wind:[5,4,3,2,3,4]};
  const near=(a,b)=>Math.abs(a%7-b%7)+Math.abs(Math.floor(a/7)-Math.floor(b/7))===1;
  const windAt=turn=>route.wind[turn%route.wind.length];
  function routeStart(gear){return {gear:gear==='cloak'?'cloak':'water',position:route.start,water:gear==='cloak'?6:7,turn:0,used:[],done:false,failed:false};}
  function routeStep(state,action){
    if(state.done||state.failed)return {error:'这一程已结束，可以撤回后重新规划。'};
    const next={...state,used:[...state.used],turn:state.turn+1};let cost=0,refill=false;
    if(action==='wait'){
      if(![route.start,...route.shelters,...route.wells].includes(state.position))return {error:'这里没有遮蔽，去水源或避风石旁再等风。'};
    }else{
      if(!Number.isInteger(action)||action<0||action>=42||route.rocks.includes(action)||!near(state.position,action))return {error:'只能走到相邻的空地，山石需要绕开。'};
      next.position=action;cost=route.sand.includes(action)?2:1;
      if([windAt(state.turn),windAt(state.turn)+1].includes(action%7)&&![...route.shelters,...route.wells].includes(action))cost+=state.gear==='cloak'?1:3;
      next.water-=cost;
      // Reaching a well with the final sip is legal; an exhausted, previously used well cannot refill.
      if(next.water>=0&&route.wells.includes(action)&&!state.used.includes(action)){next.used.push(action);next.water=state.gear==='cloak'?6:7;refill=true;}
    }
    next.done=next.position===route.goal&&next.water>0&&next.turn<=route.limit;
    next.failed=!next.done&&(next.water<=0||next.turn>=route.limit);
    return {state:next,cost,refill};
  }
  function routeReplay(gear,log){let state=routeStart(gear);const actions=[],states=[state];for(const action of Array.isArray(log)?log.slice(0,route.limit):[]){const result=routeStep(state,action);if(!result.state)break;actions.push(action);state=result.state;states.push(state);}return {state,actions,states};}
  const labels={silk:'丝绢',herb:'药草',wood:'木料',iron:'工具',wheel:'车轮',water:'饮水',food:'干粮'};
  const offers=[
    {id:'forge',name:'修车铺',cost:{wood:2,iron:1},gain:{wheel:1},clue:'木料做轮，工具加固。两样齐了才能修车。'},
    {id:'water',name:'水囊摊',cost:{herb:1},gain:{water:1},clue:'用药草换足下一程的饮水。'},
    {id:'shortcut',name:'旧轮摊',cost:{silk:3},gain:{wheel:1},clue:'现成车轮能直接带走，但会用尽手里的丝绢。'},
    {id:'herbs',name:'药草摊',cost:{silk:1},gain:{herb:3},clue:'一份丝绢包好货物，能换三束药草。'},
    {id:'food',name:'干粮摊',cost:{herb:1},gain:{food:1},clue:'干粮够这一程，留一束药草来换。'},
    {id:'timber',name:'木料摊',cost:{silk:1},gain:{wood:2},clue:'两块木料，可以交给修车铺做新轮。'},
    {id:'tools',name:'工具摊',cost:{silk:1,herb:1},gain:{iron:1},clue:'丝绢包裹工具，药草留给长途劳作的人。'},
    {id:'resale',name:'行装摊',cost:{food:1},gain:{silk:1},clue:'干粮也能换回丝绢。但出发时，仍需有粮。'}
  ];
  const count=bag=>Object.values(bag).reduce((a,b)=>a+b,0);
  function tradeStart(){return {bag:{silk:3},used:[],done:false};}
  function tradeStep(state,id){
    if(state.done)return {error:'已整装出发。'};
    if(id==='depart'){
      const missing=['wheel','water','food'].filter(k=>!state.bag[k]);
      return missing.length?{error:'还缺'+missing.map(k=>labels[k]).join('、')+'。车能走，人也要有水和粮。'}:{state:{...state,done:true}};
    }
    const offer=offers.find(o=>o.id===id);if(!offer)return {error:'没有这处交换。'};
    if(state.used.includes(id))return {error:'这一摊的库存已经换完。可撤回之前的交换。'};
    const missing=Object.entries(offer.cost).filter(([k,n])=>(state.bag[k]||0)<n);
    if(missing.length)return {error:'还缺'+missing.map(([k,n])=>`${labels[k]} × ${n-(state.bag[k]||0)}`).join('、')+'。'};
    const bag={...state.bag};for(const [k,n] of Object.entries(offer.cost))bag[k]-=n;for(const [k,n] of Object.entries(offer.gain))bag[k]=(bag[k]||0)+n;
    if(count(bag)>6)return {error:'行囊只能装6件，先用掉一些材料，再来交换。'};
    return {state:{bag,used:[...state.used,id],done:false}};
  }
  function tradeReplay(log){let state=tradeStart();const actions=[];for(const action of Array.isArray(log)?log.slice(0,9):[]){const result=tradeStep(state,action);if(!result.state)break;state=result.state;actions.push(action);}return {state,actions};}
  function muralStart(seed){const r=rng(seed^0x5a37);let pieces=shuffle(Array.from({length:9},(_,id)=>({id,rot:Math.floor(r()*4)})),seed);if(pieces.every((p,i)=>p.id===i&&p.rot===0))pieces[0].rot=1;return {pieces,done:false};}
  function muralStep(state,action){
    if(state.done||!action||!['rotate','swap','finish'].includes(action.type))return {error:'无效操作。'};
    const pieces=state.pieces.map(p=>({...p}));
    if(action.type==='finish'){if(!pieces.every((p,i)=>p.id===i&&p.rot===0))return {error:'画面还没有接好。'};return {state:{pieces,done:true}};}
    const valid=i=>Number.isInteger(i)&&i>=0&&i<9;if(!valid(action.a))return {error:'请选择画片。'};
    if(action.type==='rotate')pieces[action.a].rot=(pieces[action.a].rot+1)%4;
    else{if(!valid(action.b)||action.a===action.b)return {error:'请选择另一片。'};[pieces[action.a],pieces[action.b]]=[pieces[action.b],pieces[action.a]];}
    return {state:{pieces,done:false}};
  }
  function muralReplay(seed,log){let state=muralStart(seed);const actions=[];for(const action of Array.isArray(log)?log.slice(0,2000):[]){const result=muralStep(state,action);if(!result.state)break;state=result.state;actions.push(action);}return {state,actions};}
  window.SILU_CHALLENGE_RULES={VERSION,rng,shuffle,route,near,windAt,routeStart,routeStep,routeReplay,labels,offers,count,tradeStart,tradeStep,tradeReplay,muralStart,muralStep,muralReplay};
})();
