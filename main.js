(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Theme toggle
  const isLight = () =>
    root.dataset.theme ? root.dataset.theme === 'light' : window.matchMedia('(prefers-color-scheme: light)').matches;
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = isLight() ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Typing effect
  const words = ['agentic AI systems', 'RAG pipelines', 'AI workflow engines', 'scalable Python backends'];
  const el = document.getElementById('typed');
  if (!reduce && el) {
    let w = 0, i = words[0].length, deleting = true;
    const tick = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      el.textContent = word.slice(0, i);
      let delay = deleting ? 45 : 85;
      if (!deleting && i === word.length) { deleting = true; delay = 1800; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
  }

  // Reveal on scroll + stagger
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => {
    const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains('reveal')) : [];
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = `${Math.min(idx, 6) * 70}ms`;
    io.observe(el);
  });

  // Count-up stats
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const node = e.target, target = +node.dataset.count, suffix = node.dataset.suffix || '';
      countIO.unobserve(node);
      if (reduce) { node.textContent = target + suffix; return; }
      const start = performance.now(), dur = 1400;
      const step = (t) => {
        const p = Math.min((t - start) / dur, 1);
        node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => countIO.observe(c));

  // Project filters
  const chips = document.querySelectorAll('.chip');
  const projects = document.querySelectorAll('.project');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    projects.forEach((p) => {
      const show = f === 'all' || p.dataset.cat === f;
      p.classList.toggle('hidden', !show);
      if (show) p.classList.add('in');
    });
  }));

  // Spotlight + tilt on project cards
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    projects.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        const rx = ((y / r.height) - 0.5) * -6, ry = ((x / r.width) - 0.5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  // Scroll progress + active nav link
  const bar = document.querySelector('.progress');
  const navLinks = [...document.querySelectorAll('.links a')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${h > 0 ? (scrollY / h) * 100 : 0}%`;
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
    navLinks.forEach((a, i) => a.classList.toggle('active', i === current));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
