(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  function mount(index, host, saved = {}, api) {
    const cleanups = [], frames = new Set(); let disposed = false;
    const $ = s => host.querySelector(s), $$ = s => [...host.querySelectorAll(s)];
    const listen = (el, type, fn, options) => { el.addEventListener(type, fn, options); cleanups.push(() => el.removeEventListener(type, fn, options)); };
    const frame = fn => { const id = requestAnimationFrame(t => { frames.delete(id); if (!disposed) fn(t); }); frames.add(id); return id; };
    const svg = body => `<svg xmlns="${NS}" viewBox="0 0 600 110" aria-hidden="true">${body}</svg>`;
    if (index === 2) scrollStory(); else railway();
    return () => { disposed = true; cleanups.forEach(f => f()); frames.forEach(cancelAnimationFrame); };

    function scrollStory() {
      const names = ['山川', '乐舞', '行旅'];
      let offsets = Array.isArray(saved.offsets) && saved.offsets.length === 3 ? saved.offsets.map(v => Math.max(-3, Math.min(3, Math.round(Number(v) || 0)))) : [2, -2, 3];
      let finished = !!saved.done, preview = false;
      if (finished) offsets = [0, 0, 0];
      // Each painted band is continuous at x = 130 / 470 only at offset zero.
      // The middle strip moves; the two outer fragments stay fixed.
      function person(x, y, color, pose) {
        return `<g class="jb-figure ${pose || ''}" transform="translate(${x} ${y})"><circle cy="-34" r="6" fill="#9e7352"/><path d="M-2-27L-13-3H14L4-27Z" fill="${color}"/><path d="M-4-5L-11 11M5-5L12 11" fill="none" stroke="#725d45" stroke-width="4" stroke-linecap="round"/><path d="M-2-23L-20-14M4-23L20-13" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/></g>`;
      }
      function art(i) {
        if (i === 0) return `<rect x="-170" y="0" width="940" height="110" fill="#d7c6a1"/><circle cx="510" cy="24" r="19" fill="#cda267"/><path d="M-150 98L-25 58L42 77L115 20L168 64L232 29L293 83L354 46L421 71L474 17L540 66L631 39L770 100Z" fill="#9eaa8d"/><path d="M-150 110L-8 72L86 100L145 62L211 91L273 57L342 96L405 77L481 99L552 57L660 96L770 80V110Z" fill="#718b79"/><path d="M-50 104Q73 86 130 75T260 87T392 77T470 86T670 91" fill="none" stroke="#e6d8b5" stroke-width="4"/>`;
        if (i === 1) return `<rect x="-170" y="0" width="940" height="110" fill="#ddc298"/><path d="M-100 61C-13 5 82 100 130 40S244 22 300 57S418 99 470 34S600 48 710 15" fill="none" stroke="#a75941" stroke-width="8"/><path d="M-100 78C-12 24 77 115 130 58S247 42 300 74S423 115 470 51S600 66 710 33" fill="none" stroke="#bd9554" stroke-width="4"/>${person(222, 82, '#537d79', 'jb-dancer')}${person(370, 81, '#a75e46', 'jb-dancer')}<path d="M355 56Q368 37 383 53L375 72Z" fill="#d8aa64" stroke="#695b43" stroke-width="2"/><path d="M153 101H441" stroke="#ae9271" stroke-width="2"/>`;
        return `<rect x="-170" y="0" width="940" height="110" fill="#dac39a"/><path d="M-140 98C-23 102 70 44 130 61S244 101 300 81S402 34 470 55S598 100 740 67" fill="none" stroke="#a89168" stroke-width="13"/><path d="M-140 98C-23 102 70 44 130 61S244 101 300 81S402 34 470 55S598 100 740 67" fill="none" stroke="#eadbb7" stroke-width="3" stroke-dasharray="10 7"/><g class="jb-caravan"><path d="M245 62Q245 44 254 43Q264 43 269 51Q274 38 284 43Q297 42 298 61L316 58L321 32L330 36L328 67L313 74H247Z" fill="#9b704b"/><path d="M253 72L249 96M269 73L274 96M302 72L309 91M318 69L323 88" stroke="#896344" stroke-width="5"/><path d="M256 43L256 67H289V43" fill="#527c75"/><path d="M323 39L374 56" stroke="#8e7550" fill="none"/>${person(383, 80, '#ad6847', '')}<path d="M382 47L379 82" stroke="#805c42" stroke-width="3"/></g>`;
      }
      const band = (i, reference = false) => {
        const id = `jbclip-${i}-${reference ? 'r' : 'a'}`;
        return svg(`<defs><clipPath id="${id}-middle"><path d="M130 0H470V110H130Z"/></clipPath><clipPath id="${id}-sides"><path d="M0 0H130V110H0ZM470 0H600V110H470Z"/></clipPath></defs><g clip-path="url(#${id}-sides)">${art(i)}</g><g clip-path="url(#${id}-middle)"><g class="jb-moving-art" data-art="${i}" transform="translate(${reference ? 0 : offsets[i] * 42} 0)">${art(i)}</g></g>${reference ? '' : '<path class="jb-seams" d="M130 0V110M470 0V110" stroke="#f4e7ca" stroke-width="3" stroke-dasharray="4 4"/>'}`);
      };
      host.innerHTML = `<div class="jb-scroll-game"><div class="jb-scroll-caption"><span>给爷爷看的画卷</span><span class="jb-created">创作画卷</span></div><div class="jb-bands">${names.map((name, i) => `<div class="jb-band ${offsets[i] === 0 ? 'aligned' : ''}" data-band="${i}"><button class="jb-band-arrow" data-jb-step="${i},-1" aria-label="向左移动${name}">‹</button><div class="jb-band-art" data-jb-band="${i}" role="slider" tabindex="0" aria-label="${name}画带，左右拖动对齐断线" aria-valuemin="-3" aria-valuemax="3" aria-valuenow="${offsets[i]}">${band(i)}</div><button class="jb-band-arrow" data-jb-step="${i},1" aria-label="向右移动${name}">›</button><span class="jb-band-name">${name}<i aria-hidden="true">${offsets[i] === 0 ? ' ✓' : ''}</i></span></div>`).join('')}</div><div class="jb-scroll-actions"><span class="jb-scroll-story">沿着断开的线，找回画中人的路。</span><button class="jb-reference-toggle" aria-expanded="false">看完整画卷</button></div><div class="jb-scroll-reference hidden">${names.map((_, i) => band(i, true)).join('')}</div><div class="jb-story-awake hidden"><span>山川之间，有人赶路，也有人歌唱。</span><button class="primary jb-awaken">让画中人启程</button></div></div>`;
      let awakened = finished, notified = false;
      function checkpoint() { api.onSave({ offsets: [...offsets], done: awakened }); }
      function update() {
        const count = offsets.filter(v => v === 0).length;
        $$('.jb-band').forEach((el, i) => {
          el.classList.toggle('aligned', offsets[i] === 0);
          el.querySelector('.jb-moving-art').setAttribute('transform', `translate(${offsets[i] * 42} 0)`);
          el.querySelector('.jb-band-art').setAttribute('aria-valuenow', offsets[i]);
          el.querySelector('.jb-band-name i').textContent = offsets[i] === 0 ? ' ✓' : '';
          el.querySelectorAll('button').forEach(btn => { const dir = Number(btn.dataset.jbStep.split(',')[1]); btn.disabled = awakened || offsets[i] + dir < -3 || offsets[i] + dir > 3; });
        });
        $('.jb-story-awake').classList.toggle('hidden', count !== 3);
        $('.jb-awaken').disabled = awakened;
        $('.jb-awaken').textContent = awakened ? '画中人已启程' : '让画中人启程';
        $('.jb-scroll-game').classList.toggle('awakened', awakened);
        api.counter(`${count} / 3`);
        if (awakened) { api.feedback('画里的人，终于又走起来了。', true); if (!notified) { notified = true; api.done(); } }
        else if (count === 3) api.feedback('路已接好。请让画中人启程。');
        else api.feedback('拖动画带，或点两侧箭头，让两条接缝连起来。');
        checkpoint();
      }
      function move(i, value) { if (awakened) return; offsets[i] = Math.max(-3, Math.min(3, value)); update(); }
      $$('[data-jb-step]').forEach(el => listen(el, 'click', () => { const [i, dir] = el.dataset.jbStep.split(',').map(Number); move(i, offsets[i] + dir); }));
      $$('[data-jb-band]').forEach(el => {
        const i = Number(el.dataset.jbBand); let drag = null;
        listen(el, 'pointerdown', e => { if (awakened || e.button !== 0) return; e.preventDefault(); drag = { x: e.clientX, value: offsets[i], id: e.pointerId }; el.setPointerCapture(e.pointerId); });
        listen(el, 'pointermove', e => { if (!drag || drag.id !== e.pointerId) return; const step = el.querySelector('svg').getBoundingClientRect().width * 42 / 600; move(i, drag.value + Math.round((e.clientX - drag.x) / step)); });
        const stop = () => { drag = null; }; listen(el, 'pointerup', stop); listen(el, 'pointercancel', stop); listen(el, 'lostpointercapture', stop);
        listen(el, 'keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); move(i, offsets[i] + (e.key === 'ArrowLeft' ? -1 : 1)); } });
      });
      listen($('.jb-reference-toggle'), 'click', () => { preview = !preview; $('.jb-scroll-reference').classList.toggle('hidden', !preview); $('.jb-reference-toggle').setAttribute('aria-expanded', preview); $('.jb-reference-toggle').textContent = preview ? '收起画卷' : '看完整画卷'; });
      listen($('.jb-awaken'), 'click', () => { if (!offsets.every(v => v === 0) || awakened) return; awakened = true; update(); });
      update();
    }

    function railway() {
      const desired = [[3, 2], [2, 1], [3, 2], [0, 1], [0, 1], [3, 0], [0, 2], [2, 1], [0, 2], [1, 2], [0, 3], [2, 0], [0, 1], [0, 1], [3, 1], [3, 0]];
      const initial = [1, 2, 3, 1, 3, 1, 1, 2, 3, 3, 2, 1, 2, 2, 1, 3];
      let turns = Array.isArray(saved.turns) && saved.turns.length === 16 ? saved.turns.map(v => ((Math.round(Number(v) || 0) % 4) + 4) % 4) : [...initial];
      let finished = !!saved.done, running = false, notified = false;
      const names = ['上', '右', '下', '左'], deltas = [-4, 1, 4, -1];
      const connectors = i => desired[i].map(v => (v + turns[i]) % 4);
      function railSvg(i) {
        const [a, b] = desired[i], points = [[32, 0], [64, 32], [32, 64], [0, 32]];
        const p = points[a], q = points[b], straight = (a + 2) % 4 === b;
        const path = straight ? `M${p[0]} ${p[1]}L${q[0]} ${q[1]}` : `M${p[0]} ${p[1]}Q32 32 ${q[0]} ${q[1]}`;
        return `<svg viewBox="0 0 64 64" aria-hidden="true"><g transform="rotate(${turns[i] * 90} 32 32)"><path d="${path}" fill="none" stroke="#a89164" stroke-width="18" stroke-dasharray="3 5"/><path d="${path}" fill="none" stroke="#435f51" stroke-width="11"/><path d="${path}" fill="none" stroke="#ddd2b0" stroke-width="5"/></g></svg>`;
      }
      host.innerHTML = `<div class="jb-rail-game"><div class="jb-rail-contents"><div class="jb-rail-map"><div class="jb-rail-start" aria-label="起点，从第一行左侧进入"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12H20M14 6L20 12L14 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="jb-rail-board" aria-label="四行四列的铁路，点击轨道旋转"><div class="jb-rail-grid">${Array.from({ length: 16 }, (_, i) => `<button class="jb-rail-tile" data-jb-tile="${i}" aria-label="第${Math.floor(i / 4) + 1}行第${i % 4 + 1}列轨道，点击顺时针旋转">${railSvg(i)}</button>`).join('')}</div><div class="jb-train hidden" aria-label="载着故事的列车"><svg viewBox="0 0 44 28"><rect x="3" y="5" width="32" height="19" rx="4" fill="#a95840"/><path d="M35 8L43 14L35 22Z" fill="#b37950"/><rect x="9" y="8" width="9" height="7" fill="#f3dfad"/><rect x="22" y="8" width="9" height="7" fill="#f3dfad"/><path d="M6 23H36" stroke="#3f5a4b" stroke-width="5"/></svg></div></div><div class="jb-rail-end" aria-label="终点，从第二行右侧离开"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12H20M14 6L20 12L14 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div><div class="jb-train-cargo"><div><span>一封家书</span><span>一次互市</span><span>一曲乐舞</span></div></div></div><div class="jb-rail-actions"><button class="primary jb-dispatch">向远方发车</button></div></div>`;
      if(api.assets?.railTrain){const img=new Image();img.alt='货运列车';img.onload=()=>{if(!disposed)$('.jb-train').replaceChildren(img);};img.src=api.assets.railTrain;}
      function checkpoint() { api.onSave({ turns: [...turns], done: finished }); }
      function draw() {
        $$('[data-jb-tile]').forEach((el, i) => { el.innerHTML = railSvg(i); el.disabled = running || finished; el.setAttribute('aria-label', `第${Math.floor(i / 4) + 1}行第${i % 4 + 1}列，轨道朝${connectors(i).map(d => names[d]).join('与')}，点击旋转`); });
        $('.jb-dispatch').disabled = running || finished;
        $('.jb-dispatch').textContent = finished ? '故事已经出发' : running ? '列车行进中' : '向远方发车';
        api.counter(finished ? '已抵达' : '待发车');
      }
      function trace() {
        const path = [], visited = new Set(); let i = 0, entry = 3;
        for (let step = 0; step < 17; step++) {
          if (visited.has(i)) return { path, bad: i, message: '这段轨道绕回了原处，换一个方向。' };
          visited.add(i); path.push(i); const ports = connectors(i);
          if (!ports.includes(entry)) return { path, bad: i, message: `第${Math.floor(i / 4) + 1}行第${i % 4 + 1}列没有接上来路。` };
          const exit = ports.find(d => d !== entry);
          if (i === 7 && exit === 1) return { path, success: true };
          if ((exit === 0 && i < 4) || (exit === 1 && i % 4 === 3) || (exit === 2 && i >= 12) || (exit === 3 && i % 4 === 0)) return { path, bad: i, message: `轨道从第${Math.floor(i / 4) + 1}行第${i % 4 + 1}列走出了边界。` };
          i += deltas[exit]; entry = (exit + 2) % 4;
        }
        return { path, bad: i, message: '轨道还没通向远方。' };
      }
      function railwayPoints(result) {
        const edge = [[.5, 0], [1, .5], [.5, 1], [0, .5]], points = [];
        let entry = 3;
        result.path.forEach((i, n) => {
          const ports = connectors(i), p = edge[entry], exit = ports.find(d => d !== entry);
          const absolute = v => ({ x: (i % 4 + v[0]) * 25, y: (Math.floor(i / 4) + v[1]) * 25 });
          if (!ports.includes(entry)) { points.push(absolute(p)); return; }
          const q = edge[exit], straight = (entry + 2) % 4 === exit;
          for (let j = n ? 1 : 0; j <= 10; j++) {
            const t = j / 10, s = 1 - t;
            points.push(absolute(straight ? [p[0] * s + q[0] * t, p[1] * s + q[1] * t] : [p[0] * s * s + s * t + q[0] * t * t, p[1] * s * s + s * t + q[1] * t * t]));
          }
          entry = (exit + 2) % 4;
        });
        if (points.length === 1) points.push({ ...points[0], x: points[0].x + .1 });
        return points;
      }
      function animate(result) {
        running = true; draw(); const train = $('.jb-train'); train.classList.remove('hidden');
        const points = railwayPoints(result);
        let start;
        const duration = Math.max(700, result.path.length * 230);
        function step(t) {
          if (start === undefined) start = t;
          const p = Math.min(1, (t - start) / duration), progress = p * (points.length - 1), at = Math.min(points.length - 2, Math.floor(progress)), f = progress - at, a = points[at], b = points[at + 1];
          train.style.left = `${a.x + (b.x - a.x) * f}%`; train.style.top = `${a.y + (b.y - a.y) * f}%`;
          train.style.transform = `translate(-50%,-50%) rotate(${Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI}deg)`;
          if (p < 1) frame(step); else {
            running = false;
            result.path.forEach(i => $(`[data-jb-tile="${i}"]`).classList.add('traversed'));
            if (result.success) { finished = true; checkpoint(); draw(); api.feedback('这一次，车上也有你讲的故事。', true); if (!notified) { notified = true; api.done(); } }
            else { $(`[data-jb-tile="${result.bad}"]`)?.classList.add('breakpoint'); draw(); api.feedback(result.message); }
          }
        }
        frame(step);
      }
      $$('[data-jb-tile]').forEach(el => listen(el, 'click', () => {
        if (running || finished) return;
        const i = Number(el.dataset.jbTile); turns[i] = (turns[i] + 1) % 4;
        $$('.jb-rail-tile').forEach(tile => tile.classList.remove('breakpoint', 'traversed')); $('.jb-train').classList.add('hidden');
        checkpoint(); draw(); api.feedback('');
      }));
      listen($('.jb-dispatch'), 'click', () => {
        if (running || finished) return; $$('.jb-rail-tile').forEach(tile => tile.classList.remove('breakpoint', 'traversed'));
        const result = trace(); api.feedback(result.success ? '路已接通。让故事继续向西。' : '试着走一趟，看看路在哪里断开。'); animate(result);
      });
      draw(); checkpoint();
      if (finished) { api.feedback('这一次，车上也有你讲的故事。', true); notified = true; api.done(); }
      else api.feedback('');
    }
  }
  window.SILU_JOURNEY_B = { mount };
})();
