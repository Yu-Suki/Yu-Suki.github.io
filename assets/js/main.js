/* =============================================================
   大肥鱼 · 个人主页交互
   都是原生 JS，没有依赖。想删功能就删对应的一小段。
   ============================================================= */
(function () {
  'use strict';

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel));
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------- 1. 深色 / 浅色切换 ---------- */
  var themeBtn = $('#themeBtn');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (e) {}
    if (themeBtn) {
      themeBtn.setAttribute(
        'aria-label',
        theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'
      );
    }
  }

  if (themeBtn) {
    applyTheme(root.dataset.theme || 'dark');
    themeBtn.addEventListener('click', function () {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- 2. 移动端菜单 ---------- */
  var menuBtn = $('#menuBtn');
  var nav = $('#nav');

  function closeMenu() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (menuBtn) {
      menuBtn.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuBtn.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- 3. 滚动进度条 / 头部状态 / 回到顶部 ---------- */
  var header = $('#header');
  var bar = $('#progress');
  var toTop = $('#toTop');

  function onScroll() {
    var el = document.documentElement;
    var max = el.scrollHeight - el.clientHeight;
    var p = max > 0 ? el.scrollTop / max : 0;
    if (bar) bar.style.transform = 'scaleX(' + p + ')';
    if (header) header.classList.toggle('is-scrolled', el.scrollTop > 8);
    if (toTop) toTop.classList.toggle('show', el.scrollTop > 560);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 4. 导航高亮当前区块 ---------- */
  var navLinks = $$('#nav a[href^="#"]');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = '#' + entry.target.id;
          navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 5. 滚动出现动画 ---------- */
  var reveals = $$('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- 6. 打字机效果 ---------- */
  var typingEl = $('#typing');
  // ✏️ 想改这几个身份标签，改这里就行
  var roles = ['前端开发工程师', '独立开发者', '摄影爱好者', '终身学习者'];

  if (typingEl) {
    if (reduceMotion) {
      typingEl.textContent = roles[0];
    } else {
      var roleIndex = 0;
      var charIndex = 0;
      var deleting = false;

      var tick = function () {
        var word = roles[roleIndex];
        typingEl.textContent = word.slice(0, charIndex);

        if (!deleting && charIndex < word.length) {
          charIndex++;
          setTimeout(tick, 110);
        } else if (!deleting) {
          deleting = true;
          setTimeout(tick, 1600);
        } else if (charIndex > 0) {
          charIndex--;
          setTimeout(tick, 55);
        } else {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(tick, 320);
        }
      };

      setTimeout(tick, 500);
    }
  }

  /* ---------- 7. 复制邮箱 + 轻提示 ---------- */
  var toastEl = $('#toast');
  var toastTimer;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2200);
  }

  var copyBtn = $('#copyMail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var mail = copyBtn.dataset.mail || '';
      var done = function () { toast('邮箱已复制 ✓'); };
      var fallback = function () {
        var ta = document.createElement('textarea');
        ta.value = mail;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mail).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
  }

  /* ---------- 8. 项目卡片跟随鼠标的光斑 ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('.work-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', e.clientX - r.left + 'px');
        card.style.setProperty('--my', e.clientY - r.top + 'px');
      });
    });
  }

  /* ---------- 9. 项目区：自动同步 GitHub 仓库 ----------
     页面加载时读一次你公开的仓库，标题 / 简介 / 语言 / star 全自动。
     改动这里三个配置就够了。 */
  var GH_USER = 'Yu-Suki'; // ✏️ 你的 GitHub 用户名
  var GH_LIMIT = 6; // 最多显示几个仓库
  var GH_HIDE = ['Yu-Suki.github.io']; // 不想展示的仓库名（写仓库名，不是 用户名/仓库名）
  var GH_CACHE_KEY = 'gh-repos-' + GH_USER;
  var GH_TTL = 60 * 60 * 1000; // 缓存 1 小时，避免每次都打接口

  // GitHub 官方语言配色（没有的就用紫色兜底）
  var LANG_COLORS = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    HTML: '#e34c26', CSS: '#563d7c', SCSS: '#c6538c', Vue: '#41b883',
    Svelte: '#ff3e00', React: '#61dafb', Go: '#00ADD8', Rust: '#dea584',
    Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
    Shell: '#89e051', 'Jupyter Notebook': '#DA5B0B', PHP: '#4F5D95',
    Ruby: '#701516', Dart: '#00B4AB', Kotlin: '#A97BFF', Swift: '#F05138',
    Lua: '#000080', Markdown: '#083fa1', Dockerfile: '#384d54'
  };

  var repoGrid = $('#repoGrid');
  var repoStatus = $('#repoStatus');

  function escHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function setRepoStatus(msg) {
    if (!repoStatus) return;
    repoStatus.hidden = !msg;
    repoStatus.textContent = msg || '';
  }

  function repoCardHtml(repo, index) {
    var year = String(repo.pushed_at || repo.created_at || '').slice(0, 4);
    var desc = repo.description || '还没写简介 —— 去仓库加上 Description，这里会自动显示。';
    var tags = '';

    if (repo.language) {
      tags +=
        '<li class="tag-lang"><i class="lang-dot" style="--c:' +
        (LANG_COLORS[repo.language] || '#8b5cf6') +
        '"></i>' +
        escHtml(repo.language) +
        '</li>';
    }
    (repo.topics || []).slice(0, 2).forEach(function (t) {
      tags += '<li>' + escHtml(t) + '</li>';
    });
    if (repo.stargazers_count > 0) {
      tags += '<li class="tag-star">★ ' + repo.stargazers_count + '</li>';
    }

    return (
      '<article class="work-card work-card--auto" style="animation-delay:' + index * 60 + 'ms">' +
      '<div class="work-top"><span>' + pad2(index + 1) + '</span><span>' + escHtml(year) + '</span></div>' +
      '<h3><a href="' + escHtml(repo.html_url) + '" target="_blank" rel="noopener">' +
      escHtml(repo.name) +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>' +
      '</a></h3>' +
      '<p>' + escHtml(desc) + '</p>' +
      '<ul class="tags">' + tags + '</ul>' +
      '</article>'
    );
  }

  function moreCardHtml() {
    return (
      '<a class="work-card work-more" href="https://github.com/' + GH_USER + '?tab=repositories" target="_blank" rel="noopener">' +
      '<div class="work-top"><span>＋</span><span>GitHub</span></div>' +
      '<h3>看全部仓库<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg></h3>' +
      '<p>没做完的半成品、实验性的小工具都在这里。</p>' +
      '</a>'
    );
  }

  function renderRepos(list) {
    if (!repoGrid) return;

    // 首屏那个「N 个开源项目」的小标签和统计数字也跟着变
    var total = list.length;
    var chip = $('#chipRepos');
    var stat = $('#statRepos');
    if (chip) chip.textContent = total + ' 个开源项目';
    if (stat) stat.textContent = total;

    var repos = list
      .filter(function (r) {
        return !r.fork && !r.archived && GH_HIDE.indexOf(r.name) === -1;
      })
      .slice(0, GH_LIMIT);

    if (!repos.length) {
      repoGrid.innerHTML = '';
      setRepoStatus('还没有公开仓库 —— 在 GitHub 新建一个 Public 仓库，这里就会出现。');
      return;
    }

    repoGrid.innerHTML = repos.map(repoCardHtml).join('') + moreCardHtml();
    setRepoStatus('');
  }

  function trimRepo(r) {
    return {
      name: r.name,
      html_url: r.html_url,
      description: r.description,
      language: r.language,
      topics: r.topics || [],
      stargazers_count: r.stargazers_count || 0,
      pushed_at: r.pushed_at,
      created_at: r.created_at,
      fork: r.fork,
      archived: r.archived
    };
  }

  function loadRepos() {
    if (!repoGrid) return;

    var cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(GH_CACHE_KEY) || 'null');
    } catch (e) {}

    // 有缓存先秒开，不等网络
    if (cached && cached.d && Date.now() - cached.t < GH_TTL) {
      renderRepos(cached.d);
    }

    if (!window.fetch) {
      if (!cached) setRepoStatus('浏览器太旧，读不到 GitHub，下面是备用内容。');
      return;
    }

    fetch(
      'https://api.github.com/users/' + GH_USER + '/repos?sort=pushed&per_page=100',
      { headers: { Accept: 'application/vnd.github+json' } }
    )
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (list) {
        if (!Array.isArray(list)) throw new Error('返回格式不对');
        try {
          localStorage.setItem(
            GH_CACHE_KEY,
            JSON.stringify({ t: Date.now(), d: list.map(trimRepo) })
          );
        } catch (e) {}
        renderRepos(list);
      })
      .catch(function (err) {
        if (!cached) {
          setRepoStatus('没能读取 GitHub（' + err.message + '），下面是备用内容。');
        }
      });
  }

  loadRepos();

  /* ---------- 10. 页脚年份自动更新 ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
