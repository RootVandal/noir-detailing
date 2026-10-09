/* ==========================================================================
   NOIR DETAILING — логика страницы
   ========================================================================== */
(() => {
  "use strict";

  const B = window.BRAND, S = window.SERVICES, C = window.CARS, IMG = window.IMG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const svc = (id) => S.find((s) => s.id === id);
  const money = (n) => Math.round(n).toLocaleString("ru-RU");
  const srcset = (id, ws = [640, 1024, 1600, 2200]) => ws.map((w) => `${IMG(id, w)} ${w}w`).join(", ");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ----------------------------- Бренд ----------------------------- */
  function applyBrand() {
    $$("[data-brand]").forEach((el) => { const v = B[el.dataset.brand]; if (v != null) el.textContent = v; });
    const hrefs = {
      tel: "tel:" + B.phone.replace(/[^\d+]/g, ""),
      wa: "https://wa.me/" + B.whatsapp,
      mail: "mailto:" + B.email,
      ig: "https://instagram.com/" + B.instagram,
      tg: "https://t.me/" + B.telegram,
      map: "https://2gis.kz/almaty/search/" + encodeURIComponent(B.mapQuery),
    };
    $$("[data-brand-href]").forEach((el) => (el.href = hrefs[el.dataset.brandHref]));
    document.title = `${B.name} ${B.suffix} — ${B.tagline}`;
  }

  /* ----------------------------- Hero ------------------------------ */
  function hero() {
    const img = $("#heroImg"), id = "1520340356584-f9917d1eea6f";
    img.sizes = "100vw";
    img.srcset = srcset(id, [800, 1400, 2000, 2800]);
    img.src = IMG(id, 2000);
    const words = [...C.map((c) => c.make), ...S.map((s) => s.title)];
    const uniq = [...new Set(words)];
    const row = uniq.map((w) => `<span>${esc(w)}</span>`).join("");
    $("#marquee").innerHTML = row + row;
  }

  /* --------------------------- Шапка ------------------------------- */
  function header() {
    const hdr = $("#hdr"), heroEl = $(".hero");
    const upd = () => {
      const lim = heroEl.offsetHeight - hdr.offsetHeight - 10;
      hdr.classList.toggle("solid", window.scrollY > lim);
    };
    upd();
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);

    const burger = $("#burger");
    const close = () => { document.body.classList.remove("menu-open", "locked"); burger.setAttribute("aria-expanded", "false"); };
    burger.addEventListener("click", () => {
      const open = !document.body.classList.contains("menu-open");
      document.body.classList.toggle("menu-open", open);
      document.body.classList.toggle("locked", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    $$("#nav a").forEach((a) => a.addEventListener("click", close));
  }

  /* ---------------------------- Услуги ----------------------------- */
  function services() {
    $("#svcTabs").innerHTML = S.map((s) =>
      `<button class="svc-tab" role="tab" data-go="${s.id}"><span class="mono">${s.no}</span>${esc(s.title)}</button>`).join("");

    $("#svcList").innerHTML = S.map((s) => {
      const count = C.filter((c) => c.services.includes(s.id)).length;
      return `
      <article class="svc" id="svc-${s.id}" data-svc="${s.id}">
        <div class="wrap svc-in">
          <div class="svc-media reveal">
            <div class="ph main"><img loading="lazy" sizes="(max-width:900px) 100vw, 55vw" srcset="${srcset(s.photo)}" src="${IMG(s.photo, 1200)}" alt="${esc(s.title)}"></div>
            ${s.photos.map((p) => `<div class="ph"><img loading="lazy" sizes="(max-width:900px) 50vw, 27vw" srcset="${srcset(p, [400, 800, 1200])}" src="${IMG(p, 800)}" alt=""></div>`).join("")}
          </div>
          <div class="svc-text reveal">
            <span class="svc-no">${s.no}</span>
            <h3>${esc(s.title)}</h3>
            <p class="svc-kicker">${esc(s.kicker)}</p>
            <p class="svc-lead">${esc(s.lead)}</p>
            <ul class="svc-list">${s.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
            <div class="svc-meta">
              <div><span class="mono">Время</span><b>${esc(s.time)}</b></div>
              <div><span class="mono">Стоимость</span><b>от ${money(s.from)} ₸</b></div>
            </div>
            <div class="svc-actions">
              <button class="btn" data-calc="${s.id}">Рассчитать стоимость</button>
              <button class="link-arrow" data-works="${s.id}">Работы · ${count} <span>→</span></button>
            </div>
          </div>
        </div>
      </article>`;
    }).join("");

    $$("[data-go]").forEach((b) => b.addEventListener("click", () => $("#svc-" + b.dataset.go).scrollIntoView({ behavior: "smooth" })));
    $$("[data-works]").forEach((b) => b.addEventListener("click", () => { setFilter(b.dataset.works); $("#works").scrollIntoView({ behavior: "smooth" }); }));
    $$("[data-calc]").forEach((b) => b.addEventListener("click", () => { calcPreset([b.dataset.calc]); $("#price").scrollIntoView({ behavior: "smooth" }); }));

    // подсветка активной вкладки
    const tabs = $$(".svc-tab");
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) tabs.forEach((t) => t.classList.toggle("on", t.dataset.go === e.target.dataset.svc));
    }), { rootMargin: "-45% 0px -50% 0px" });
    $$(".svc").forEach((el) => io.observe(el));
  }

  /* ---------------------------- Работы ----------------------------- */
  let filter = "all";
  function works() {
    const chips = [["all", "Все работы", C.length], ...S.map((s) => [s.id, s.title, C.filter((c) => c.services.includes(s.id)).length])];
    $("#filters").innerHTML = chips.map(([id, t, n]) => `<button class="chip" data-f="${id}">${esc(t)}<sup>${n}</sup></button>`).join("");
    $$("#filters .chip").forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.f)));

    $("#cars").innerHTML = C.map((c, i) => `
      <article class="car reveal" data-slug="${c.slug}" tabindex="0" role="link" aria-label="${esc(c.make + " " + c.model)} — открыть работу">
        <div class="car-ph">
          <img loading="lazy" sizes="(max-width:900px) 100vw, 50vw" srcset="${srcset(c.photos[0][0])}" src="${IMG(c.photos[0][0], 1200)}" alt="${esc(c.make + " " + c.model)}">
          <span class="count mono">${String(i + 1).padStart(2, "0")} · ${c.photos.length} фото</span>
          <span class="open">→</span>
        </div>
        <div class="car-info">
          <div><span class="mk mono">${esc(c.make)} · ${c.year}</span><h3>${esc(c.model)}</h3></div>
          <div class="car-tags">${c.services.map((id) => `<span class="tag">${esc(svc(id).title)}</span>`).join("")}</div>
        </div>
      </article>`).join("");

    $$(".car").forEach((el) => {
      const go = () => (location.hash = "car/" + el.dataset.slug);
      el.addEventListener("click", go);
      el.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
    });
    setFilter("all");
  }
  function setFilter(f) {
    filter = f;
    $$("#filters .chip").forEach((b) => b.classList.toggle("on", b.dataset.f === f));
    // в отфильтрованном виде убираем «широкие» карточки, чтобы сетка не рвалась
    let n = 0;
    $$(".car").forEach((el) => {
      const c = C.find((x) => x.slug === el.dataset.slug);
      const show = f === "all" || c.services.includes(f);
      el.classList.toggle("hide", !show);
      if (show) { el.style.order = n++; el.classList.add("in"); }
    });
    // широкая карточка — каждая третья из видимых
    const vis = $$(".car:not(.hide)").sort((a, b) => a.style.order - b.style.order);
    vis.forEach((el, i) => el.classList.toggle("wide", i % 3 === 0 || (i === vis.length - 1 && i % 3 === 1)));
  }

  /* ------------------------ Страница машины ------------------------ */
  const page = $("#carPage"), scroller = $("#carScroll");
  let current = -1, openedFromList = false;

  function renderCar(c) {
    const i = C.indexOf(c), next = C[(i + 1) % C.length];
    const hero = c.photos[0][0];
    $("#carBarTitle").textContent = `${String(i + 1).padStart(2, "0")} / ${String(C.length).padStart(2, "0")} — ${c.make} ${c.model}`;
    scroller.innerHTML = `
      <div class="cp-hero" data-lb="0">
        <img sizes="100vw" srcset="${srcset(hero, [800, 1400, 2000, 2800])}" src="${IMG(hero, 2000)}" alt="${esc(c.make + " " + c.model)}">
        <span class="mono">${esc(c.photos[0][1])} · нажмите, чтобы открыть</span>
      </div>
      <div class="wrap cp-head">
        <div>
          <span class="mk mono">${esc(c.make)} — работа № ${String(i + 1).padStart(2, "0")}</span>
          <h1>${esc(c.model)}</h1>
          <p class="cp-summary">${esc(c.summary)}</p>
        </div>
        <div class="cp-specs">
          <div><span class="mono">Год</span><b>${c.year}</b></div>
          <div><span class="mono">Цвет</span><b>${esc(c.color)}</b></div>
          <div><span class="mono">В боксе</span><b>${c.days} ${plural(c.days, "день", "дня", "дней")}</b></div>
          <div><span class="mono">Услуг</span><b>${c.services.length}</b></div>
        </div>
      </div>
      <div class="wrap"><div class="cp-stats">${c.stats.map(([k, v]) => `<div><b>${esc(v)}</b><span class="mono">${esc(k)}</span></div>`).join("")}</div></div>

      <section class="wrap cp-sec">
        <div class="cp-sec-h"><h2>Галерея</h2><span class="mono">${c.photos.length} фото</span></div>
        <div class="gallery">${c.photos.map(([id, cap], k) =>
          `<button data-lb="${k}"><img loading="lazy" sizes="(max-width:900px) 50vw, 33vw" srcset="${srcset(id, [480, 900, 1400])}" src="${IMG(id, 900)}" alt="${esc(cap)}"><span class="cap mono">${esc(cap)}</span></button>`).join("")}</div>
      </section>

      <section class="wrap cp-sec">
        <div class="cp-sec-h"><h2>До и после</h2><span class="mono">Потяните ползунок</span></div>
        <div class="ba" id="ba">
          <img class="after" src="${IMG(hero, 1800)}" alt="После">
          <div class="before-wrap"><img class="before" src="${IMG(hero, 1800)}" alt="До"><div class="haze"></div></div>
          <div class="handle"></div>
          <span class="lbl l mono">До</span><span class="lbl r mono">После</span>
        </div>
        <p class="ba-note">Визуализация эффекта для концепта — в рабочей версии здесь будут реальные снимки «до/после» из студии.</p>
      </section>

      <section class="wrap cp-sec">
        <div class="cp-sec-h"><h2>Что сделали</h2><span class="mono">${c.services.length} ${plural(c.services.length, "услуга", "услуги", "услуг")}</span></div>
        <div class="cp-done">${c.services.map((id) => { const s = svc(id); return `<a href="#svc-${s.id}" data-close><div><span class="mono">${s.no} · ${esc(s.time)}</span><b>${esc(s.title)}</b></div><span>→</span></a>`; }).join("")}</div>
      </section>

      <section class="cp-cta"><div class="wrap">
        <h2>Хотите так же<br><em>для своей машины?</em></h2>
        <button class="btn btn-light" id="cpBook">Записаться на осмотр</button>
      </div></section>

      <button class="cp-next" id="cpNext">
        <img loading="lazy" src="${IMG(next.photos[0][0], 1800)}" alt="">
        <div class="in"><span class="mono">Следующая работа →</span><b>${esc(next.make)} ${esc(next.model)}</b></div>
      </button>`;

    scroller.scrollTop = 0;
    $$("[data-lb]", scroller).forEach((el) => el.addEventListener("click", () => lbOpen(c.photos, +el.dataset.lb)));
    $$("[data-close]", scroller).forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); closeCar(a.getAttribute("href")); }));
    $("#cpNext").addEventListener("click", () => (location.hash = "car/" + next.slug));
    $("#cpBook").addEventListener("click", () => {
      prefillForm(`${c.make} ${c.model}`, c.services);
      closeCar("#book");
    });
    beforeAfter($("#ba"));
  }

  function openCar(slug) {
    const c = C.find((x) => x.slug === slug);
    if (!c) return closeCar();
    current = C.indexOf(c);
    renderCar(c);
    page.classList.add("open");
    page.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    document.body.classList.remove("menu-open");
  }
  function closeCar(target) {
    const wasOpen = page.classList.contains("open");
    page.classList.remove("open");
    page.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
    if (/^#car\//.test(location.hash)) {
      history.replaceState(null, "", target || "#works");
    }
    if (wasOpen) {
      const el = target ? $(target) : $(`.car[data-slug="${C[current]?.slug}"]`) || $("#works");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: target ? "smooth" : "auto", block: target ? "start" : "center" }), target ? 50 : 0);
    }
  }
  function route() {
    const m = location.hash.match(/^#car\/([\w-]+)/);
    if (m) openCar(m[1]);
    else if (page.classList.contains("open")) closeCar(location.hash || undefined);
  }
  $("#carBack").addEventListener("click", () => closeCar());
  $("#carPrev").addEventListener("click", () => (location.hash = "car/" + C[(current - 1 + C.length) % C.length].slug));
  $("#carNext").addEventListener("click", () => (location.hash = "car/" + C[(current + 1) % C.length].slug));
  window.addEventListener("hashchange", route);

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  /* ---------------------------- До/после --------------------------- */
  function beforeAfter(el) {
    let drag = false;
    const set = (x) => {
      const r = el.getBoundingClientRect();
      const p = Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100));
      el.style.setProperty("--x", p + "%");
    };
    el.addEventListener("pointerdown", (e) => { drag = true; el.setPointerCapture(e.pointerId); set(e.clientX); });
    el.addEventListener("pointermove", (e) => drag && set(e.clientX));
    el.addEventListener("pointerup", () => (drag = false));
    el.addEventListener("pointercancel", () => (drag = false));
    // мягкая подсказка при появлении
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      let t0 = null;
      const anim = (t) => {
        if (drag) return;
        t0 ??= t;
        const k = Math.min(1, (t - t0) / 1600);
        el.style.setProperty("--x", 50 + Math.sin(k * Math.PI * 2) * 18 + "%");
        if (k < 1) requestAnimationFrame(anim);
      };
      requestAnimationFrame(anim);
    }, { root: scroller, threshold: .6 });
    io.observe(el);
  }

  /* ----------------------------- Лайтбокс -------------------------- */
  const lb = $("#lb"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  let lbList = [], lbI = 0;
  function lbShow() {
    const [id, cap] = lbList[lbI];
    lbImg.src = IMG(id, 2200, 85);
    lbImg.alt = cap;
    lbCap.textContent = `${String(lbI + 1).padStart(2, "0")} / ${String(lbList.length).padStart(2, "0")} — ${cap}`;
  }
  function lbOpen(list, i) { lbList = list; lbI = i; lbShow(); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); }
  function lbClose() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); }
  const lbStep = (d) => { lbI = (lbI + d + lbList.length) % lbList.length; lbShow(); };
  $("#lbX").addEventListener("click", lbClose);
  $("#lbPrev").addEventListener("click", (e) => { e.stopPropagation(); lbStep(-1); });
  $("#lbNext").addEventListener("click", (e) => { e.stopPropagation(); lbStep(1); });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "FIGURE") lbClose(); });
  let tx = null;
  lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (tx == null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1);
    tx = null;
  });
  document.addEventListener("keydown", (e) => {
    if (lb.classList.contains("open")) {
      if (e.key === "Escape") lbClose();
      if (e.key === "ArrowLeft") lbStep(-1);
      if (e.key === "ArrowRight") lbStep(1);
    } else if (page.classList.contains("open")) {
      if (e.key === "Escape") closeCar();
      if (e.key === "ArrowLeft") $("#carPrev").click();
      if (e.key === "ArrowRight") $("#carNext").click();
    }
  });

  /* --------------------------- Калькулятор ------------------------- */
  const HOURS = { wash: 3, polish: 16, ceramic: 16, interior: 8 };
  const st = { cls: "business", svc: new Set(["wash", "ceramic"]), cer: 2 };

  function calc() {
    $("#calcClass").innerHTML = window.CAR_CLASSES.map((c) => `<button class="chip" data-cls="${c.id}">${esc(c.label)}</button>`).join("");
    $("#calcSvc").innerHTML = S.map((s) => checkbox(s, `от ${money(s.from)} ₸`, "c")).join("");
    $("#calcCer").innerHTML = window.CERAMIC_LEVELS.map((l) => `<button class="chip" data-cer="${l.id}">${esc(l.label)}</button>`).join("");

    $$("[data-cls]").forEach((b) => b.addEventListener("click", () => { st.cls = b.dataset.cls; calcUpd(); }));
    $$("[data-cer]").forEach((b) => b.addEventListener("click", () => { st.cer = +b.dataset.cer; calcUpd(); }));
    $$("#calcSvc .check").forEach((l) => l.querySelector("input").addEventListener("change", (e) => {
      e.target.checked ? st.svc.add(l.dataset.id) : st.svc.delete(l.dataset.id);
      calcUpd();
    }));
    $("#calcBook").addEventListener("click", () => prefillForm(null, [...st.svc]));
    calcUpd(true);
  }
  function checkbox(s, sub, ns) {
    return `<label class="check" data-id="${s.id}"><input type="checkbox" name="${ns}-${s.id}"><span><span class="t">${esc(s.title)}</span><span class="p">${sub}</span></span><span class="box"></span></label>`;
  }
  function calcPreset(ids) { st.svc = new Set(ids); if (ids.includes("ceramic") && !st.cer) st.cer = 2; calcUpd(); }

  let shown = 0, raf = 0;
  function calcUpd(instant) {
    const k = window.CAR_CLASSES.find((c) => c.id === st.cls).k;
    $$("[data-cls]").forEach((b) => b.classList.toggle("on", b.dataset.cls === st.cls));
    $$("[data-cer]").forEach((b) => b.classList.toggle("on", +b.dataset.cer === st.cer));
    $$("#calcSvc .check").forEach((l) => { const on = st.svc.has(l.dataset.id); l.classList.toggle("on", on); l.querySelector("input").checked = on; });
    $("#ceramicField").classList.toggle("off", !st.svc.has("ceramic"));

    const lines = [];
    let sum = 0, hours = 0;
    S.forEach((s) => {
      if (!st.svc.has(s.id)) return;
      let p = s.from * k;
      if (s.id === "ceramic") p += window.CERAMIC_LEVELS.find((l) => l.id === st.cer).add * k;
      p = Math.round(p / 1000) * 1000;
      sum += p; hours += HOURS[s.id];
      lines.push(`<li><span>${esc(s.title)}${s.id === "ceramic" ? ` · ${st.cer} ${plural(st.cer, "слой", "слоя", "слоёв")}` : ""}</span><b>${money(p)} ₸</b></li>`);
    });
    if (st.svc.has("polish") && st.svc.has("ceramic")) hours -= 6; // подготовка ЛКП совмещается
    if (st.svc.size >= 3) {
      const d = Math.round(sum * 0.1 / 1000) * 1000;
      sum -= d;
      lines.push(`<li class="disc"><span>Скидка за комплекс −10 %</span><b>−${money(d)} ₸</b></li>`);
    }
    $("#calcLines").innerHTML = lines.join("") || `<li class="empty"><span>Выберите хотя бы одну услугу</span></li>`;
    $("#calcTime").textContent = !hours ? "—" : hours <= 10 ? `Срок: ≈ ${hours} ${plural(hours, "час", "часа", "часов")}` : `Срок: ≈ ${Math.ceil(hours / 8)} ${plural(Math.ceil(hours / 8), "день", "дня", "дней")}`;

    cancelAnimationFrame(raf);
    const from = shown, to = sum, t0 = performance.now();
    const out = $("#calcTotal");
    if (instant) { shown = to; out.textContent = money(to); return; }
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - p, 3);
      shown = from + (to - from) * e;
      out.textContent = money(Math.round(shown / 1000) * 1000);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  /* ------------------------------ FAQ ------------------------------ */
  function faq() {
    $("#faq").innerHTML = window.FAQ.map(([q, a]) =>
      `<div class="qa"><button aria-expanded="false">${esc(q)}<span class="pm"></span></button><div class="qa-a"><div><p>${esc(a)}</p></div></div></div>`).join("");
    $$(".qa button").forEach((b) => b.addEventListener("click", () => {
      const qa = b.parentElement, open = !qa.classList.contains("open");
      qa.classList.toggle("open", open);
      b.setAttribute("aria-expanded", String(open));
    }));
  }

  /* ----------------------------- Форма ----------------------------- */
  function form() {
    $("#formSvc").innerHTML = S.map((s) => checkbox(s, s.time, "f")).join("");
    $$("#formSvc .check input").forEach((i) => i.addEventListener("change", () => i.closest(".check").classList.toggle("on", i.checked)));

    const f = $("#form");
    const phone = f.elements.phone;
    phone.addEventListener("input", () => {
      let d = phone.value.replace(/\D/g, "");
      if (d.startsWith("8")) d = "7" + d.slice(1);
      if (d && !d.startsWith("7")) d = "7" + d;
      d = d.slice(0, 11);
      const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
      phone.value = d ? "+7" + (p[0] ? " " + p[0] : "") + (p[1] ? " " + p[1] : "") + (p[2] ? " " + p[2] : "") + (p[3] ? " " + p[3] : "") : "";
    });

    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = f.elements.name, ok1 = name.value.trim().length > 1, ok2 = phone.value.replace(/\D/g, "").length === 11;
      name.closest(".field").classList.toggle("err", !ok1);
      phone.closest(".field").classList.toggle("err", !ok2);
      if (!ok1 || !ok2) return (ok1 ? phone : name).focus();

      const chosen = $$("#formSvc .check.on").map((l) => svc(l.dataset.id).title);
      const msg = [
        `Здравствуйте! Заявка с сайта ${B.name} ${B.suffix}.`,
        `Имя: ${name.value.trim()}`,
        `Телефон: ${phone.value}`,
        f.elements.car.value.trim() && `Автомобиль: ${f.elements.car.value.trim()}`,
        chosen.length && `Услуги: ${chosen.join(", ")}`,
        f.elements.note.value.trim() && `Комментарий: ${f.elements.note.value.trim()}`,
      ].filter(Boolean).join("\n");
      $("#formWa").href = `https://wa.me/${B.whatsapp}?text=${encodeURIComponent(msg)}`;
      $("#formOk").hidden = false;
    });
  }
  function prefillForm(car, ids) {
    const f = $("#form");
    if (car) f.elements.car.value = car;
    $$("#formSvc .check").forEach((l) => {
      const on = ids.includes(l.dataset.id);
      l.classList.toggle("on", on);
      l.querySelector("input").checked = on;
    });
    $("#formOk").hidden = true;
  }

  /* ----------------------------- Reveal ---------------------------- */
  function reveal() {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
  }

  /* ------------------------------ Init ----------------------------- */
  applyBrand();
  hero();
  header();
  services();
  works();
  calc();
  faq();
  form();
  reveal();
  route();
})();
