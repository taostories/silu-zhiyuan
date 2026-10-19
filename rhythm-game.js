(() => {
  'use strict';
  const R = window.SILU_RHYTHM_RULES;
  const glyph = note => note === 'drum' ? '●' : note === 'bell' ? '◇' : '—';
  const label = note => note === 'drum' ? '鼓' : note === 'bell' ? '铃' : '停';
  const picture = `<svg viewBox="0 0 720 240" role="img" aria-label="原创乐舞画，鼓与铃呼应，舞者舒展飘带">
    <path d="M0 205Q130 140 250 195T490 180T720 198V240H0" fill="#b69b70" opacity=".25"/>
    <circle cx="360" cy="111" r="99" fill="none" stroke="#b59761" opacity=".35"/>
    <circle cx="360" cy="111" r="88" fill="none" stroke="#b59761" opacity=".2"/>
    <path class="ry-ribbon" d="M94 119C186-23 258 215 359 75S534 212 644 89" fill="none" stroke="#b46e51" stroke-width="9"/>
    <path class="ry-ribbon thin" d="M76 143C183 8 261 237 369 101S543 228 661 112" fill="none" stroke="#c5a16a" stroke-width="4"/>
    <g class="ry-dancer"><circle cx="360" cy="65" r="14" fill="#b48860"/><path d="M348 80L318 164Q360 189 411 166L371 82Z" fill="#557e73"/><path d="M351 91L311 113L281 80M370 92L407 61L437 78" fill="none" stroke="#557e73" stroke-width="12" stroke-linecap="round"/><path d="M345 174L330 213M378 176L404 210" stroke="#7f6850" stroke-width="8" stroke-linecap="round"/><path d="M341 129Q364 145 390 129" fill="none" stroke="#d2bd85" stroke-width="5"/></g>
    <g class="ry-art-drum"><ellipse cx="155" cy="181" rx="38" ry="14" fill="#b67553"/><path d="M117 181L122 219Q155 233 188 219L193 181" fill="#a66d51"/><ellipse cx="155" cy="181" rx="38" ry="14" fill="#e3c795" stroke="#896d4b" stroke-width="3"/><path d="M123 189L135 220L147 195L160 225L172 195L186 220" fill="none" stroke="#d7bd87" stroke-width="3"/></g>
    <g class="ry-art-bell"><path d="M551 170Q551 135 571 135Q591 135 591 170L600 187H542Z" fill="#be995c" stroke="#917647" stroke-width="3"/><circle cx="571" cy="192" r="6" fill="#917647"/><path d="M567 135V123H575V135" fill="none" stroke="#917647" stroke-width="3"/></g>
  </svg>`;
  function mount(index, host, saved, api) {
    const state = R.restore(saved), $ = s => host.querySelector(s);
    let phase = state.done ? 'done' : 'ready', round = Math.min(2, state.history.length);
    let disposed = false, frame = 0, origin = 0, lastBeat = -1, pulseUntil = 0, activeInstrument = '';
    let audio = null, master = null, limiter = null, cover = null, imageProbe = null, soundReady = Promise.resolve();
    const buffers = {}, voices = new Set(), abort = new AbortController();
    const rawSounds = Object.fromEntries(['drum', 'bell'].map(name => [name,
      fetch('assets/audio/' + (name === 'drum' ? 'drum-clear' : name) + '.wav', {signal: abort.signal}).then(r => {
        if (!r.ok) throw Error('Audio unavailable'); return r.arrayBuffer();
      }).catch(() => null)
    ]));
    const dancerArt = picture.match(/<g class="ry-dancer">[\s\S]*?<\/g>/)[0];
    const emptyPicture = picture.replace(dancerArt, '').replace(/<g class="ry-art-(drum|bell)">[\s\S]*?<\/g>/g, '');
    function applyArt() {
      if (cover && $('.ry-backdrop')) $('.ry-backdrop').replaceChildren(cover.cloneNode());
      for (const [name, key] of [['drum','rhythmDrum'],['bell','rhythmBell']]) {
        if (!api.assets?.[key] || !$('.ry-picture') || $('.ry-prop-'+name)) continue;
        const img=new Image(); img.src=api.assets[key]; img.alt=name==='drum'?'鼓':'铃'; img.className='ry-prop ry-prop-'+name;
        $('.ry-picture').append(img);
      }
    }
    if (api.assets?.rhythmStage) {
      imageProbe = new Image(); imageProbe.alt = '原创丝路乐舞画';
      imageProbe.onload = () => { if (!disposed) { cover = imageProbe; applyArt(); } };
      imageProbe.src = api.assets.rhythmStage;
    }
    const checkpoint = () => api.onSave({version: 9, ...state});
    function unlockAudio(resume = true) {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!audio && Audio) {
          audio = new Audio(); master = audio.createGain(); limiter = audio.createDynamicsCompressor();
          master.gain.value = state.muted ? 0 : .7;
          limiter.threshold.value = -12; limiter.knee.value = 15; limiter.ratio.value = 5;
          master.connect(limiter); limiter.connect(audio.destination);
          soundReady = Promise.all(['drum', 'bell'].map(name => rawSounds[name].then(bytes => bytes && !disposed ? audio.decodeAudioData(bytes) : null).then(buffer => {
            if (!buffer || disposed) return;
            // Keep the recorded attack, remove leading silence and balance the two samples.
            let peak = 0;
            for (let c = 0; c < buffer.numberOfChannels; c++) for (const v of buffer.getChannelData(c)) peak = Math.max(peak, Math.abs(v));
            if (!peak) return;
            let first = buffer.length;
            for (let c = 0; c < buffer.numberOfChannels; c++) {
              const channel = buffer.getChannelData(c);
              for (let i = 0; i < channel.length; i++) if (Math.abs(channel[i]) > peak * .012) { first = Math.min(first, i); break; }
            }
            const offset = Math.max(0, first / buffer.sampleRate - .005);
            buffers[name] = {buffer, offset, gain: (name === 'drum' ? 3.5 : .38) / peak};
          }).catch(() => {})));
        }
        if (resume && audio?.state === 'suspended') audio.resume().catch(() => {});
      } catch { /* The sequence remains playable without sound. */ }
    }
    function tone(instrument) {
      const sample = buffers[instrument];
      if (!sample || !audio || audio.state !== 'running' || state.muted) return;
      const t = audio.currentTime, duration = Math.min(1.6, sample.buffer.duration - sample.offset);
      const source = audio.createBufferSource(), gain = audio.createGain(), filter = audio.createBiquadFilter();
      source.buffer = sample.buffer; filter.type = 'lowpass'; filter.frequency.value = instrument === 'bell' ? 4300 : 2800;
      gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(sample.gain, t + .005);
      gain.gain.setValueAtTime(sample.gain, t + Math.max(.006, duration - .12));
      gain.gain.linearRampToValueAtTime(0, t + duration);
      source.connect(filter); filter.connect(gain); gain.connect(master); voices.add(source);
      if (voices.size > 6) voices.values().next().value.stop();
      source.onended = () => { voices.delete(source); source.disconnect(); filter.disconnect(); gain.disconnect(); };
      source.start(t, sample.offset, duration);
    }
    function stopSounds() { for (const voice of voices) { try { voice.stop(); } catch {} } voices.clear(); }
    function pulse(instrument) {
      activeInstrument = instrument; pulseUntil = performance.now() + 220;
      cancelAnimationFrame(frame); frame = requestAnimationFrame(tick);
    }
    function updateScore() {
      const n = phase === 'won' || phase === 'done' ? R.rounds[round].notes.length : state.progress.length;
      host.querySelectorAll('.ry-beat').forEach((el, i) => {
        el.classList.toggle('correct', i < n);
        el.classList.toggle('active', phase === 'play' && i === n);
        el.setAttribute('aria-label', label(R.rounds[round].notes[i]) + (i < n ? '，已完成' : phase === 'play' && i === n ? '，下一个' : ''));
      });
    }
    function render() {
      const song = R.rounds[round];
      const message = phase === 'done' ? '乐舞响起来了' : phase === 'listen' ? '听听鼓与铃' : phase === 'play' ? '按顺序点，慢慢来也可以' : phase === 'won' ? '这一段完成了' : '准备好了，就开始';
      host.innerHTML = '<section class="ry-game" data-phase="' + phase + '"><div class="ry-top"><div class="ry-seals" aria-label="已完成' + state.history.length + '段">' + R.rounds.map((r,i) => '<span class="' + (i < state.history.length ? 'earned' : '') + '">' + r.name + '</span>').join('') + '</div><button class="ry-sound" data-ry="sound" aria-pressed="' + state.muted + '">' + (state.muted ? '声音：关' : '声音：开') + '</button></div><div class="ry-picture"><div class="ry-backdrop">' + emptyPicture + '</div><svg class="ry-cast" viewBox="0 0 720 240" aria-label="原创舞者">' + dancerArt + '</svg></div><p class="ry-status" aria-live="polite">' + message + '</p><div class="ry-score" aria-label="鼓铃顺序">' + song.notes.map((note,i) => '<span class="ry-beat" data-beat="' + i + '"><i>' + glyph(note) + '</i></span>').join('') + '</div><div class="ry-pads"><button data-instrument="drum" aria-label="击鼓，键盘F" ' + (phase !== 'play' ? 'disabled' : '') + '><span>●</span>鼓<kbd>F</kbd></button><button data-instrument="bell" aria-label="摇铃，键盘J" ' + (phase !== 'play' ? 'disabled' : '') + '><span>◇</span>铃<kbd>J</kbd></button></div><div class="ry-actions">' + (phase === 'ready' || phase === 'play' || phase === 'listen' ? '<button class="ry-relisten" data-ry="listen">' + (phase === 'listen' ? '停止示范' : '听一遍') + '</button>' : '') + (phase !== 'play' ? '<button class="primary" data-ry="main" ' + (phase === 'done' ? 'disabled' : '') + '>' + (phase === 'won' ? '下一段 →' : phase === 'done' ? '三段已完成' : state.progress.length ? '继续演奏' : '开始') + '</button>' : '') + '</div></section>';
      api.counter(state.done ? '三段合奏完成' : (round + 1) + ' / 3 · ' + song.name);
      updateScore(); applyArt();
      if (api.assets?.dancer) {
        const img = new Image(); img.alt = '原创舞者'; img.className = 'ry-dancer-image';
        img.onload = () => { if (!disposed && $('.ry-cast')) $('.ry-cast').replaceWith(img); }; img.src = api.assets.dancer;
      }
    }
    function tick(now) {
      if (disposed) return;
      if (phase === 'listen') {
        const slot = Math.floor((now - origin) / 720);
        if (slot >= R.rounds[round].notes.length) { phase = 'ready'; render(); }
        else if (slot !== lastBeat) {
          lastBeat = slot;
          host.querySelectorAll('.ry-beat').forEach((el,i) => el.classList.toggle('active', i === slot));
          const note = R.rounds[round].notes[slot]; tone(note); activeInstrument = note; pulseUntil = now + 220;
        }
      }
      host.querySelectorAll('[data-instrument]').forEach(el => el.classList.toggle('pulse', now < pulseUntil && el.dataset.instrument === activeInstrument));
      $('.ry-picture')?.classList.toggle('pulse', now < pulseUntil);
      host.querySelectorAll('.ry-prop').forEach(el=>el.classList.toggle('struck',now<pulseUntil&&el.classList.contains('ry-prop-'+activeInstrument)));
      if (phase === 'listen' || now < pulseUntil) frame = requestAnimationFrame(tick);
    }
    function startPlay() {
      unlockAudio(); stopSounds(); cancelAnimationFrame(frame);
      if (phase === 'won') round = state.history.length;
      phase = 'play'; render(); api.feedback('');
    }
    function listen() {
      unlockAudio(); cancelAnimationFrame(frame); stopSounds();
      if (phase === 'listen') { phase = 'ready'; render(); return; }
      phase = 'listen'; lastBeat = -1; render(); api.feedback('');
      soundReady.then(() => { if (!disposed && phase === 'listen') { origin = performance.now(); frame = requestAnimationFrame(tick); } });
    }
    function hit(instrument) {
      if (disposed || phase !== 'play' || state.done) return;
      unlockAudio(); tone(instrument); pulse(instrument);
      const next = R.rounds[round].notes[state.progress.length];
      if (instrument !== next) { api.feedback('这里是' + label(next) + '，接着点就好。'); return; }
      state.progress.push({instrument}); api.feedback('');
      if (R.judge(round, state.progress).passed) {
        state.history.push({events: state.progress.map(e => ({...e}))}); state.progress = [];
        state.done = state.history.length === R.rounds.length; phase = state.done ? 'done' : 'won';
        checkpoint(); render(); api.feedback(state.done ? '把这段乐舞，讲给爷爷听。' : '这一段完成了。', true);
        if (state.done) api.done();
      } else { checkpoint(); updateScore(); }
    }
    function click(e) {
      const b = e.target.closest('button'); if (!b || !host.contains(b) || b.disabled) return;
      if (b.dataset.instrument) { hit(b.dataset.instrument); return; }
      if (b.dataset.ry === 'sound') {
        state.muted = !state.muted; unlockAudio();
        if (master) master.gain.setTargetAtTime(state.muted ? 0 : .7, audio.currentTime, .015);
        if (state.muted) stopSounds(); checkpoint(); b.textContent = state.muted ? '声音：关' : '声音：开'; b.setAttribute('aria-pressed', state.muted);
      } else if (b.dataset.ry === 'listen') listen();
      else if (b.dataset.ry === 'main') startPlay();
    }
    function key(e) {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input,textarea')) return;
      const instrument = {f:'drum', j:'bell'}[e.key.toLowerCase()];
      if (instrument) { e.preventDefault(); hit(instrument); }
    }
    function visibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame); stopSounds(); pulseUntil = 0;
        if (phase === 'listen') phase = 'ready'; render();
      }
    }
    host.addEventListener('click', click); document.addEventListener('keydown', key); document.addEventListener('visibilitychange', visibility);
    unlockAudio(false); render(); checkpoint(); api.feedback(''); if (state.done) api.done();
    return () => {
      disposed = true; cancelAnimationFrame(frame); abort.abort(); stopSounds(); if (imageProbe) imageProbe.onload = null;
      host.removeEventListener('click', click); document.removeEventListener('keydown', key); document.removeEventListener('visibilitychange', visibility);
      if (audio) audio.close().catch(() => {});
    };
  }
  window.SILU_RHYTHM = {mount};
})();
