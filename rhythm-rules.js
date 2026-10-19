(() => {
  'use strict';
  const legacyRounds = [
    { name: '相应', notes: ['drum', 'bell', 'drum', 'bell'], need: 4 },
    { name: '留白', notes: ['drum', null, 'bell', 'drum', 'bell', null], need: 5 },
    { name: '共鸣', notes: ['drum', 'bell', null, 'bell', 'drum', null, 'bell', 'drum'], need: 7 }
  ];
  const oldRounds = legacyRounds.map(song => ({ name: song.name, notes: song.notes.filter(Boolean) }));
  const rounds = [
    {name:'相应',notes:['drum','bell','drum','bell']},
    {name:'回环',notes:['drum','drum','bell','drum','bell','bell']},
    {name:'共鸣',notes:['drum','bell','bell','drum','drum','bell','drum','bell']}
  ];
  const beat = slow => slow ? 900 : 650;
  // Retain previously completed rounds when migrating the old timed game.
  function legacyJudge(round, events, slow = false) {
    const song = legacyRounds[round];
    if (!song || !Array.isArray(events) || events.length > 64) return { passed: false, score: 0, marks: [] };
    const duration = beat(slow), tolerance = duration * .36, slots = song.notes.map(() => []);
    let extra = 0;
    for (const event of events) {
      if (!event || !Number.isFinite(event.time) || !['drum', 'bell'].includes(event.instrument)) { extra++; continue; }
      const i = Math.round(event.time / duration);
      if (i < 0 || i >= slots.length || Math.abs(event.time - i * duration) > tolerance) extra++;
      else slots[i].push(event.instrument);
    }
    const marks = song.notes.map((note, i) => note === null ? slots[i].length === 0 : slots[i].length === 1 && slots[i][0] === note);
    const score = Math.max(0, marks.filter(Boolean).length - extra);
    return { passed: score >= song.need, score, marks, extra, firstMiss: marks.indexOf(false) };
  }
  function judge(round, events) {
    const song = rounds[round];
    if (!song || !Array.isArray(events)) return { passed: false, score: 0, marks: [] };
    const marks = song.notes.map((note, i) => events[i]?.instrument === note);
    return { passed: events.length === song.notes.length && marks.every(Boolean), score: marks.filter(Boolean).length, marks };
  }
  function restore(saved) {
    const history = [];
    if ([7, 8, 9].includes(saved?.version)) for (const attempt of (Array.isArray(saved.history) ? saved.history : []).slice(0, 3)) {
      const validate = saved.version === 7 ? legacyJudge : saved.version === 8 ? (round,events)=>({passed:Array.isArray(events)&&events.length===oldRounds[round].notes.length&&events.every((e,i)=>e?.instrument===oldRounds[round].notes[i])}) : judge;
      if (!attempt || !validate(history.length, attempt.events, attempt.slow === true).passed) break;
      history.push({ events: rounds[history.length].notes.map(instrument => ({ instrument })) });
    }
    const progress = [];
    if ([8,9].includes(saved?.version) && history.length < 3 && Array.isArray(saved.progress)) {
      const notes = rounds[history.length].notes;
      for (const event of saved.progress.slice(0, notes.length - 1)) {
        if (event?.instrument !== notes[progress.length]) break;
        progress.push({ instrument: event.instrument });
      }
    }
    return { history, progress, muted: saved?.muted === true, done: history.length === 3 };
  }
  window.SILU_RHYTHM_RULES = { rounds, beat, judge, restore };
})();
