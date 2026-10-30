(() => {
  const root = document.documentElement;

  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Years of experience, counted from the first software job (LnData, April 2022)
  const CAREER_START = new Date(2022, 3, 1);
  const now = new Date();
  let yrs = now.getFullYear() - CAREER_START.getFullYear();
  if (now.getMonth() < CAREER_START.getMonth()) yrs -= 1;
  document.querySelectorAll('.yrs').forEach((n) => { n.textContent = yrs; });

  // Case studies are inline <details>; old #cs-* links open and scroll to them
  const openCase = (id) => {
    const d = document.getElementById(id);
    if (!d || d.tagName !== 'DETAILS') return;
    d.open = true;
    (d.closest('.chapter') || d).scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  if (location.hash.startsWith('#cs-')) openCase(location.hash.slice(1));
  addEventListener('hashchange', () => { if (location.hash.startsWith('#cs-')) openCase(location.hash.slice(1)); });
  document.querySelectorAll('details[id^="cs-"]').forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) history.replaceState(null, '', '#' + d.id);
  }));

  // YouTube facade: load the player only when clicked, stop it when its case study closes
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
    const d = box.closest('details');
    if (d) d.addEventListener('toggle', () => { if (!d.open && box.querySelector('iframe')) { box.innerHTML = facade; bind(); } });
  });

  // Figures: result bars grow from zero once the figure is on screen
  const figIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('drawn');
      figIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -20% 0px' }); // any visible part above the bottom fifth counts, so tall figures on phones still draw
  document.querySelectorAll('.fig.draw').forEach((f) => figIO.observe(f));

  // Theme toggle
  const isDark = () =>
    root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
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

  // Copy email with toast feedback
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (msg) => {
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
})();
