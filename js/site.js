/* 占い館 老上海 HP試作 — 今のHPと同じ演出(jQueryなし)
   1. Loading...(セッション中の最初の1回だけ)→ 2. 紫の扉が中央から開く → 3. 文字が光りながら出現
   4. スクロールで「じわっ」と出現 5. ハンバーガーメニュー(背景ぼかし) 6. トップ写真がスクロールで拡大 */
(function () {
  "use strict";
  var body = document.body;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 光りながら出現する文字 ---------- */
  var glowTargets = document.querySelectorAll(".glowAnime, .page-head .section-title, .teacher-summary h1");
  glowTargets.forEach(function (el) {
    el.classList.add("glowAnime");
    // 子要素(<br> や <span>)はそのまま残し、文字だけを1文字ずつ包む
    var i = 0;
    (function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split("").forEach(function (ch) {
            if (ch.trim() === "") { frag.appendChild(document.createTextNode(ch)); return; }
            var s = document.createElement("span");
            s.className = "g";
            s.textContent = ch;
            s.style.animationDelay = (i++ / 10) + "s";
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          wrap(child);
        }
      });
    })(el);
  });
  function startGlow() { glowTargets.forEach(function (el) { el.classList.add("glow"); }); }

  /* ---------- じわっと出現 ---------- */
  var blurTargets = document.querySelectorAll(
    "main section > .wrap > *, .teacher-card, .step, .card, .value-list li, .photo-row figure"
  );
  function startBlur() {
    if (!("IntersectionObserver" in window)) {
      blurTargets.forEach(function (el) { el.classList.add("blur"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("blur"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -40px 0px" });
    blurTargets.forEach(function (el) { el.classList.add("blurTrigger"); io.observe(el); });
  }

  /* ---------- 扉が開く ---------- */
  function appear() {
    body.classList.add("appear");
    startGlow();
    startBlur();
  }
  var splash = document.getElementById("splash");
  var seen = false;
  try { seen = sessionStorage.getItem("rsh-splash") === "1"; sessionStorage.setItem("rsh-splash", "1"); } catch (e) {}
  if (reduce) {
    body.classList.add("no-motion");
    splash.style.display = "none";
    appear();
  } else if (seen) {
    splash.style.display = "none";
    appear();
  } else {
    body.classList.add("splashing");
    setTimeout(function () { splash.classList.add("fade"); }, 1200);
    setTimeout(function () { splash.style.display = "none"; appear(); }, 1700);
  }

  /* ---------- ハンバーガーメニュー ---------- */
  var btn = document.querySelector(".openbtn");
  var nav = document.getElementById("g-nav");
  var wrapper = document.getElementById("wrapper");
  function setMenu(open) {
    btn.classList.toggle("active", open);
    nav.classList.toggle("panelactive", open);
    wrapper.classList.toggle("mainblur", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  }
  btn.addEventListener("click", function () { setMenu(!nav.classList.contains("panelactive")); });
  btn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMenu(!nav.classList.contains("panelactive")); }
  });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- トップ写真がスクロールで拡大 ---------- */
  var headerImg = document.getElementById("header-img");
  if (headerImg && !reduce) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        headerImg.style.transform = "scale(" + (100 + y / 10) / 100 + ")";
        headerImg.style.top = -(y / 50) + "%";
        ticking = false;
      });
    }, { passive: true });
  }
})();
