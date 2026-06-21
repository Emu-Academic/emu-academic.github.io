/* Emu Academic —— site.js
 * 主题切换 · 移动菜单 · 滚动揭示 · 滚动进度 · 回顶
 * 原生 JS，无依赖。defer 加载。 */
(function () {
  "use strict";
  var root = document.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 主题切换 ---------- */
  function setTheme(theme, persist) {
    if (theme !== "light" && theme !== "dark") return;
    root.dataset.theme = theme;
    if (persist) {
      try { localStorage.setItem("theme", theme); } catch (e) {}
    }
    var btn = document.querySelector(".theme-toggle");
    if (btn) btn.setAttribute("aria-label", theme === "dark" ? "切换到亮色" : "切换到暗色");
  }

  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      if (document.startViewTransition && !prefersReduced) {
        document.startViewTransition(function () { setTheme(next, true); });
      } else {
        setTheme(next, true);
      }
    });
  });

  /* 跟随系统变化（仅当用户未手动设定） */
  try {
    if (!localStorage.getItem("theme")) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        setTheme(e.matches ? "dark" : "light", false);
      });
    }
  } catch (e) {}

  /* ---------- 移动菜单 ---------- */
  var menuBtn = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");
  var backdrop = document.querySelector(".mobile-backdrop");
  function closeMenu() {
    if (!panel) return;
    panel.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.removeProperty("overflow");
  }
  function openMenu() {
    if (!panel) return;
    panel.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      panel.classList.contains("open") ? closeMenu() : openMenu();
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });
  document.querySelectorAll(".mobile-panel__link").forEach(function (l) {
    l.addEventListener("click", closeMenu);
  });

  /* ---------- 滚动揭示（懒动画） ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.dataset.delay ? parseInt(el.dataset.delay, 10) : (i % 4) * 80;
          el.style.setProperty("--reveal-delay", delay + "ms");
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 懒加载图片兜底（旧浏览器） ---------- */
  var lazyImgs = document.querySelectorAll('img[loading="lazy"]:not([decoding])');
  lazyImgs.forEach(function (img) { img.decoding = "async"; });

  /* ---------- 滚动进度条 + 回顶 ---------- */
  var bar = document.querySelector(".scroll-progress");
  var toTop = document.querySelector(".to-top");
  var ticking = false;
  function onScroll() {
    var st = window.scrollY || root.scrollTop;
    var h = root.scrollHeight - root.clientHeight;
    if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + "%";
    if (toTop) toTop.classList.toggle("show", st > 600);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* ---------- 外链安全 ---------- */
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    if (a.host !== location.host) {
      a.rel = (a.rel || "") + " noopener noreferrer";
      if (!a.target) a.target = "_blank";
    }
  });
})();