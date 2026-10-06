/**
 * あおば住まい工房（架空）- Sample Corporate Site
 * Vanilla JavaScript（ライブラリ不使用）
 */
document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initPagetop();
  initFadeIn();
  initHeroSlider();
  initCountUp();
  initWorksFilter();
  initContactForm();
});

/* ---------- ハンバーガーメニュー ---------- */
function initMenu() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('gnav');
  if (!btn || !nav) return;

  const header = document.querySelector('.header');
  const setOpen = (open) => {
    // お知らせバーの高さがあっても、メニューがヘッダーの真下から始まるようにする
    if (open && header) nav.style.top = `${header.getBoundingClientRect().bottom}px`;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('is-menu-open', open);
  };

  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      btn.focus();
    }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/* ---------- ページトップボタン ---------- */
function initPagetop() {
  const btn = document.getElementById('pagetop');
  if (!btn) return;
  const onScroll = () => btn.classList.toggle('is-show', window.scrollY > 400);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- スクロールでフェードイン ---------- */
function initFadeIn() {
  const targets = document.querySelectorAll('.js-fade');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach((el) => io.observe(el));
}

/* ---------- メインビジュアルのスライダー ---------- */
function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  const dotsWrap = document.getElementById('heroDots');
  if (!slider || !dotsWrap) return;

  const slides = Array.from(slider.children);
  const dots = Array.from(dotsWrap.children);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === current);
      s.setAttribute('aria-hidden', String(i !== current));
    });
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
  };

  const start = () => {
    if (reduceMotion) return;
    stop();
    timer = setInterval(() => show(current + 1), 5000);
  };
  const stop = () => clearInterval(timer);

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      start(); // 手動で切り替えたらタイマーをリセット
    });
  });

  // タブが非表示のときは止める
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}

/* ---------- 数字のカウントアップ ---------- */
function initCountUp() {
  const counters = document.querySelectorAll('.js-count');
  if (!counters.length) return;

  const format = (n) => n.toLocaleString('ja-JP');
  const run = (el) => {
    const to = Number(el.dataset.to);
    const duration = 1500;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = format(Math.round(to * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    counters.forEach((el) => (el.textContent = format(Number(el.dataset.to))));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        run(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => io.observe(el));
}

/* ---------- 施工事例の絞り込み ---------- */
function initWorksFilter() {
  const buttons = document.querySelectorAll('.filter__btn');
  const works = document.querySelectorAll('.js-work');
  const count = document.getElementById('workCount');
  if (!buttons.length || !works.length) return;

  // URLの ?category=xxx でも絞り込めるようにする
  const params = new URLSearchParams(location.search);

  const apply = (category) => {
    let visible = 0;
    buttons.forEach((b) => {
      const active = b.dataset.filter === category;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    works.forEach((w) => {
      const match = category === 'all' || w.dataset.category === category;
      w.classList.toggle('is-hidden', !match);
      w.classList.remove('is-appear');
      if (match) {
        visible += 1;
        void w.offsetWidth; // アニメーションを再実行させる
        w.classList.add('is-appear');
      }
    });
    if (count) count.textContent = visible;
  };

  buttons.forEach((b) => {
    b.addEventListener('click', () => {
      apply(b.dataset.filter);
      const url = new URL(location.href);
      if (b.dataset.filter === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', b.dataset.filter);
      history.replaceState(null, '', url);
    });
  });

  const initial = params.get('category');
  if (initial && [...buttons].some((b) => b.dataset.filter === initial)) apply(initial);
}

/* ---------- お問い合わせフォーム（入力 → 確認 → 完了） ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const panels = {
    input: document.getElementById('panelInput'),
    confirm: document.getElementById('panelConfirm'),
    done: document.getElementById('panelDone'),
  };
  const steps = [1, 2, 3].map((n) => document.getElementById(`step${n}`));

  const showPanel = (name, stepIndex) => {
    Object.entries(panels).forEach(([key, el]) => (el.hidden = key !== name));
    steps.forEach((s, i) => {
      s.classList.toggle('is-current', i === stepIndex);
      s.classList.toggle('is-done', i < stepIndex);
      if (i === stepIndex) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
    });
    const top = document.querySelector('.steps').getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
    if (name !== 'input') panels[name].focus({ preventScroll: true });
  };

  const rules = {
    cname: { label: 'お名前', check: (v) => (v.trim() ? '' : 'お名前を入力してください。') },
    cmail: {
      label: 'メールアドレス',
      check: (v) => {
        if (!v.trim()) return 'メールアドレスを入力してください。';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'メールアドレスの形式が正しくありません。';
      },
    },
    ctel: {
      label: '電話番号',
      check: (v) => (!v.trim() || /^0\d{1,4}-?\d{1,4}-?\d{3,4}$/.test(v.trim()) ? '' : '電話番号の形式が正しくありません。'),
    },
    cmsg: { label: 'ご相談内容', check: (v) => (v.trim() ? '' : 'ご相談内容を入力してください。') },
  };

  const validate = (id) => {
    const input = document.getElementById(id);
    const error = document.getElementById(`${id}-error`);
    const msg = rules[id].check(input.value);
    input.classList.toggle('is-error', Boolean(msg));
    input.setAttribute('aria-invalid', String(Boolean(msg)));
    if (msg) input.setAttribute('aria-describedby', `${id}-error`);
    else input.removeAttribute('aria-describedby');
    error.textContent = msg;
    return !msg;
  };

  Object.keys(rules).forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener('blur', () => validate(id));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-error')) validate(id);
    });
  });

  const agree = document.getElementById('agree');
  const agreeError = document.getElementById('agree-error');

  // 確認画面にはテキストとして表示する（HTMLとして解釈させない）
  const escapeRow = (dt, dd) => {
    const div = document.createElement('div');
    const t = document.createElement('dt');
    const d = document.createElement('dd');
    t.textContent = dt;
    d.textContent = dd || '（未入力）';
    div.append(t, d);
    return div;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ids = Object.keys(rules);
    const results = ids.map(validate);
    const agreed = agree.checked;
    agreeError.textContent = agreed ? '' : '個人情報の取り扱いへの同意が必要です。';

    const firstErrorIndex = results.indexOf(false);
    if (firstErrorIndex !== -1) {
      document.getElementById(ids[firstErrorIndex]).focus();
      return;
    }
    if (!agreed) {
      agree.focus();
      return;
    }

    const data = new FormData(form);
    const list = document.getElementById('confirmList');
    list.replaceChildren(
      escapeRow('ご相談の種類', data.get('type')),
      escapeRow('リフォームしたい場所', data.get('place')),
      escapeRow('お名前', data.get('name')),
      escapeRow('メールアドレス', data.get('email')),
      escapeRow('電話番号', data.get('tel')),
      escapeRow('ご相談内容', data.get('message')),
    );
    showPanel('confirm', 1);
  });

  document.getElementById('backBtn').addEventListener('click', () => showPanel('input', 0));
  document.getElementById('sendBtn').addEventListener('click', () => {
    // 実際のサイトでは、ここで fetch() を使ってPHPに送信します
    form.reset();
    showPanel('done', 2);
  });
}
