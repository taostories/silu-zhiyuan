(() => {
  // Warm only the next few images, after the current scene has finished loading.
  const cached = new Set();
  let generation = 0, queue = [], active = false;
  function pump() {
    if (active || !queue.length) return;
    const url = queue.shift();
    if (cached.has(url)) { pump(); return; }
    active = true;
    const image = new Image();
    image.fetchPriority = 'low';
    image.decoding = 'async';
    image.onload = () => { cached.add(url); active = false; pump(); };
    image.onerror = () => { active = false; pump(); };
    image.src = url;
  }
  window.SILU_LOADING = {
    warm(urls) {
      const token = ++generation;
      queue = [];
      if (navigator.connection?.saveData) return;
      Promise.allSettled([...document.querySelectorAll('#app img')].map(image => image.decode())).then(() => {
        if (token !== generation) return;
        queue = [...new Set(urls.filter(Boolean))].filter(url => !cached.has(url));
        pump();
      });
    }
  };
})();
