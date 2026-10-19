(() => {
  'use strict';
  const track = new Audio('assets/audio/ripples.mp3');
  track.loop = true;
  track.preload = 'none';
  let enabled = true, volume = .2, unlocked = false, quietScene = false, failed = false;
  try { enabled = localStorage.getItem('silu-music-enabled') !== 'false'; } catch {}
  const root = document.querySelector('#app');
  const button = document.createElement('button');
  button.className = 'music-control';
  button.type = 'button';
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/></svg>';
  button.setAttribute('aria-label', '背景音乐设置');
  button.setAttribute('aria-haspopup', 'dialog');
  const dialog = document.createElement('dialog');
  dialog.className = 'music-dialog';
  dialog.setAttribute('aria-labelledby', 'music-title');
  dialog.innerHTML = '<button class="music-close" aria-label="关闭音乐设置">×</button><h2 id="music-title">背景音乐</h2><p class="music-status" aria-live="polite"></p><button class="primary music-toggle"></button><label class="music-volume">音量<input type="range" min="0" max="50" value="20" aria-label="背景音乐音量"></label><p class="music-credit">《Ripples》 — Kevin MacLeod<br><a href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100691" target="_blank" rel="noopener noreferrer">incompetech.com</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a><br>原曲未改动，低音量循环播放。</p>';
  document.body.append(dialog);
  function paint() {
    button.classList.toggle('music-muted', !enabled || quietScene);
    dialog.querySelector('.music-toggle').textContent = enabled ? '关闭音乐' : '开启音乐';
    dialog.querySelector('.music-status').textContent = failed ? '音乐暂时未能加载' : !enabled ? '已关闭' : quietScene ? '鼓铃演奏时暂停' : !unlocked ? '进入游戏后播放' : '轻声伴随旅途';
  }
  function sync() {
    track.volume = volume;
    if (enabled && unlocked && !quietScene && !document.hidden) {
      if (track.paused) track.play().catch(() => {});
    } else track.pause();
    paint();
  }
  function place() {
    const host = root.querySelector('.header-right') || root.querySelector('.topbar') || root.querySelector('.title-screen');
    if (host && button.parentElement !== host) host.append(button);
    button.classList.toggle('music-on-title', root.dataset.view === 'title');
    const nextQuiet = !!root.querySelector('.ry-game');
    if (quietScene !== nextQuiet) { quietScene = nextQuiet; sync(); }
  }
  button.onclick = () => { paint(); dialog.showModal(); };
  dialog.querySelector('.music-close').onclick = () => { dialog.close(); button.focus(); };
  dialog.querySelector('.music-toggle').onclick = () => {
    enabled = !enabled; unlocked = true; failed = false;
    try { localStorage.setItem('silu-music-enabled', String(enabled)); } catch {}
    sync();
  };
  dialog.querySelector('input').oninput = e => { volume = Number(e.target.value) / 100; sync(); };
  document.addEventListener('click', e => {
    if (e.target.closest('#enter-game')) { unlocked = true; sync(); }
  }, true);
  document.addEventListener('visibilitychange', sync);
  track.addEventListener('error', () => { failed = true; paint(); });
  track.addEventListener('canplay', () => { failed = false; paint(); });
  new MutationObserver(place).observe(root, {childList: true, subtree: true});
  place(); paint();
})();
