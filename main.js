(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Years of experience, counted from the first software job (LnData, April 2022)
  const CAREER_START = new Date(2022, 3, 1);
  const now = new Date();
  let yrs = now.getFullYear() - CAREER_START.getFullYear();
  if (now.getMonth() < CAREER_START.getMonth()) yrs -= 1;
  document.querySelectorAll('.yrs').forEach((n) => { n.textContent = yrs; });
  document.querySelectorAll('.yrs-count').forEach((n) => { n.dataset.count = yrs; n.textContent = yrs + '+'; });

  // Case study dialogs
  const openDialog = (id) => {
    const d = document.getElementById(id);
    if (!d || typeof d.showModal !== 'function') return;
    d.showModal();
    document.body.classList.add('modal-open');
    history.replaceState(null, '', '#' + id);
  };
  document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => openDialog(b.dataset.open)));
  document.querySelectorAll('dialog.cs').forEach((d) => {
    d.querySelector('.cs-close').addEventListener('click', () => d.close());
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    d.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      history.replaceState(null, '', '#projects');
    });
  });
  // YouTube facade: load the player only when clicked, stop it when the dialog closes
  document.querySelectorAll('.yt').forEach((box) => {
    const facade = box.innerHTML;
    const bind = () => box.querySelector('.yt-play').addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0`;
      f.title = box.dataset.title || 'YouTube video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      box.replaceChildren(f);
    });
    bind();
    const dlg = box.closest('dialog');
    if (dlg) dlg.addEventListener('close', () => { if (box.querySelector('iframe')) { box.innerHTML = facade; bind(); } });
  });

  if (location.hash.startsWith('#cs-')) openDialog(location.hash.slice(1));

  // Theme toggle
  const isLight = () =>
    root.dataset.theme ? root.dataset.theme === 'light' : window.matchMedia('(prefers-color-scheme: light)').matches;
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = isLight() ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Mobile menu
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  const setMenu = (open) => {
    navLinks.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // Typing effect
  const words = ['AI products', 'AI agents', 'backend APIs', 'full stack apps', 'RAG pipelines'];
  const el = document.getElementById('typed');
  if (!reduce && el) {
    let w = 0, i = words[0].length, deleting = true;
    const tick = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      el.textContent = word.slice(0, i);
      let delay = deleting ? 40 : 80;
      if (!deleting && i === word.length) { deleting = true; delay = 1800; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
  }

  // Reveal on scroll + stagger
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach((node) => {
    const siblings = node.parentElement ? [...node.parentElement.children].filter((c) => c.classList.contains('reveal')) : [];
    const idx = siblings.indexOf(node);
    if (idx > 0) node.style.transitionDelay = `${Math.min(idx, 6) * 70}ms`;
    io.observe(node);
  });

  // Count-up stats (HTML already holds the final value for no-JS / crawlers)
  if (!reduce) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const node = e.target, target = +node.dataset.count, suffix = node.dataset.suffix || '';
        countIO.unobserve(node);
        const start = performance.now(), dur = 1400;
        const step = (t) => {
          const p = Math.min((t - start) / dur, 1);
          node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach((c) => countIO.observe(c));
  }

  // Project filters (a project can belong to several categories)
  const chips = document.querySelectorAll('.chip');
  const projects = document.querySelectorAll('.project');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
    chip.classList.add('active');
    chip.setAttribute('aria-pressed', 'true');
    const f = chip.dataset.filter;
    projects.forEach((p) => {
      const show = f === 'all' || p.dataset.cat.split(' ').includes(f);
      p.classList.toggle('hidden', !show);
      if (show) p.classList.add('in');
    });
  }));

  // Copy email with toast feedback
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (err) {}
      ta.remove(); return ok;
    }
  };
  document.querySelectorAll('.copy-email').forEach((btn) => btn.addEventListener('click', async () => {
    const ok = await copyText(btn.dataset.email);
    showToast(ok ? 'Email copied: ' + btn.dataset.email : btn.dataset.email);
    const label = btn.querySelector('span');
    if (ok && label) { const prev = label.textContent; label.textContent = 'Copied!'; setTimeout(() => { label.textContent = prev; }, 1800); }
  }));

  // Active nav link via IntersectionObserver (no layout reads on scroll)
  const links = [...navLinks.querySelectorAll('a')];
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove('active'));
      const a = byId.get(e.target.id);
      if (a) a.classList.add('active');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) secIO.observe(s); });

  // Scroll progress bar
  const bar = document.querySelector('.progress');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = root.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      ticking = false;
    });
  }, { passive: true });
})();
