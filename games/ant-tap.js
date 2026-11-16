(() => {
  const id = 'antTap';
  const duration = 30_000;
  const targetSize = 44;
  const tau = Math.PI * 2;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const antArt = '<span class="ant-tap-ant" aria-hidden="true"><i></i><i></i><i></i><b></b></span>';
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'game-card';
  card.innerHTML = '<span class="mini-art ant-tap-art">' + antArt + '</span><span class="card-copy"><b>Ant Tap</b><small>Squash the swarm</small></span><span class="arrow">→</span>';
  document.querySelector('.game-grid').append(card);

  const page = document.createElement('section');
  page.id = id + 'Page';
  page.className = 'page';
  page.setAttribute('aria-labelledby', 'antTapTitle');
  page.innerHTML = `
    <header class="ant-tap-bar">
      <button class="back-button" type="button" aria-label="Back to games">←</button>
      <h1 id="antTapTitle">Ant Tap</h1>
      <dl class="ant-tap-stats">
        <div><dt>Score</dt><dd data-score>0</dd></div>
        <div><dt>Time</dt><dd data-time>30s</dd></div>
      </dl>
      <button class="ant-tap-pause" type="button" hidden>Pause</button>
    </header>
    <div class="ant-tap-field" role="group" aria-label="Ants"></div>
    <div class="ant-tap-prompt">
      <p role="status">Tap as many ants as you can in 30 seconds.</p>
      <button type="button">Play</button>
    </div>`;
  document.getElementById('app').append(page);
  const field = page.querySelector('.ant-tap-field');
  const prompt = page.querySelector('.ant-tap-prompt');
  const message = prompt.querySelector('p');
  const playButton = prompt.querySelector('button');
  const pauseButton = page.querySelector('.ant-tap-pause');
  const scoreLabel = page.querySelector('[data-score]');
  const timeLabel = page.querySelector('[data-time]');
  let ants = [];
  let width = 0, height = 0, score = 0, remaining = duration;
  let frameId = 0, started = 0, lastFrame = 0, running = false, resumable = false;
  const range = (size) => Math.max(0, size - targetSize);
  const clamp = (value, max) => Math.max(0, Math.min(max, value));

  function place(ant) {
    ant.button.style.transform = `translate(${ant.x}px, ${ant.y}px) rotate(${ant.direction}rad)`;
  }

  function positionAnt(ant) {
    ant.x = Math.random() * range(width);
    ant.y = Math.random() * range(height);
    ant.direction = Math.random() * tau;
    place(ant);
  }

  function addAnt() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ant-tap-target';
    button.setAttribute('aria-label', 'Squash ant');
    button.innerHTML = antArt;
    const ant = {button, x: 0, y: 0, direction: 0, speed: 30 + Math.random() * 56};
    positionAnt(ant);
    ants.push(ant);
    field.append(button);
    button.addEventListener('click', () => {
      if (!running || currentPage !== id || document.hidden || !ants.includes(ant)) return;
      updateTime(performance.now());
      if (!remaining) return;
      const hadFocus = document.activeElement === button;
      ants.splice(ants.indexOf(ant), 1);
      button.remove();
      scoreLabel.textContent = ++score;
      addAnt();
      if (hadFocus) ants[0].button.focus({preventScroll: true});
    });
  }

  function resize() {
    width = field.clientWidth;
    height = field.clientHeight;
    if (!width || !height) return;
    for (const ant of ants) {
      ant.x = clamp(ant.x, range(width));
      ant.y = clamp(ant.y, range(height));
      place(ant);
    }
  }

  function stop(text, action, canResume, focus = true) {
    running = false;
    resumable = canResume;
    cancelAnimationFrame(frameId);
    field.inert = true;
    pauseButton.hidden = true;
    message.textContent = text;
    playButton.textContent = action;
    prompt.hidden = false;
    if (focus) playButton.focus({preventScroll: true});
  }

  function updateTime(now) {
    remaining = Math.max(0, duration - (now - started));
    const label = Math.ceil(remaining / 1000) + 's';
    if (timeLabel.textContent !== label) timeLabel.textContent = label;
    if (!remaining) stop(`Time’s up! You squashed ${score} ${score === 1 ? 'ant' : 'ants'}.`, 'Play again', false);
  }

  function pause(focus = true) {
    if (!running) return;
    updateTime(performance.now());
    if (running) stop('Round paused.', 'Resume', true, focus);
  }

  function step(now) {
    if (currentPage !== id) {
      pause(false);
      return;
    }
    updateTime(now);
    if (!running) return;
    const dt = clamp((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    if (!reducedMotion.matches) {
      const maxX = range(width), maxY = range(height);
      for (const ant of ants) {
        ant.direction += (Math.random() - 0.5) * 2.8 * dt;
        ant.x += Math.cos(ant.direction) * ant.speed * dt;
        ant.y += Math.sin(ant.direction) * ant.speed * dt;
        if (ant.x < 0 || ant.x > maxX) ant.direction = Math.PI - ant.direction;
        if (ant.y < 0 || ant.y > maxY) ant.direction = -ant.direction;
        ant.x = clamp(ant.x, maxX);
        ant.y = clamp(ant.y, maxY);
        place(ant);
      }
    }
    frameId = requestAnimationFrame(step);
  }

  field.inert = true;
  new ResizeObserver(resize).observe(field);
  card.addEventListener('click', () => {
    showPage(id);
    playButton.focus({preventScroll: true});
  });
  page.querySelector('.back-button').addEventListener('click', () => {
    pause(false);
    showPage('home');
    card.focus({preventScroll: true});
  });
  pauseButton.addEventListener('click', () => pause());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && currentPage === id) pause(false);
    if (!document.hidden && currentPage === id && !running) playButton.focus({preventScroll: true});
  });
  playButton.addEventListener('click', () => {
    if (running || currentPage !== id || document.hidden) return;
    resize();
    if (!resumable) {
      field.replaceChildren();
      ants = [];
      remaining = duration;
      score = 0;
      scoreLabel.textContent = '0';
      timeLabel.textContent = '30s';
      const count = clamp(Math.round(width * height / 14_000), 56);
      for (let i = 0; i < Math.max(18, count); i++) addAnt();
    }
    field.inert = false;
    prompt.hidden = true;
    pauseButton.hidden = false;
    running = true;
    lastFrame = performance.now();
    started = lastFrame - (duration - remaining);
    ants[0].button.focus({preventScroll: true});
    frameId = requestAnimationFrame(step);
  });
})();
