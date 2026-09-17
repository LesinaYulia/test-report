/**
 * Своя Дача — интерактив:
 * подстановка контактов, мобильное меню, липкая шапка, лёгкий параллакс
 * на hero-фото, появление блоков при прокрутке, sticky-CTA на мобильных
 * и форма бронирования.
 */
(function () {
  "use strict";

  var c = window.SITE_CONTACTS || {};
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Подстановка контактов ---------- */
  function applyContacts() {
    document.querySelectorAll('[data-contact="phone-link"]').forEach(function (el) {
      el.setAttribute("href", c.phoneHref || "tel:");
    });
    document.querySelectorAll('[data-contact="phone-text"]').forEach(function (el) {
      el.textContent = c.phone || "";
    });
    document.querySelectorAll('[data-contact="whatsapp-link"]').forEach(function (el) {
      el.setAttribute("href", c.whatsapp || "#");
    });
    document.querySelectorAll('[data-contact="telegram-link"]').forEach(function (el) {
      el.setAttribute("href", c.telegram || "#");
    });
    document.querySelectorAll('[data-contact="instagram-link"]').forEach(function (el) {
      el.setAttribute("href", c.instagram || "#");
    });
    document.querySelectorAll('[data-contact="email-link"]').forEach(function (el) {
      el.setAttribute("href", "mailto:" + (c.email || ""));
    });
    document.querySelectorAll('[data-contact="email-text"]').forEach(function (el) {
      el.textContent = c.email || "";
    });
    document.querySelectorAll('[data-contact="address"]').forEach(function (el) {
      el.textContent = c.address || el.textContent;
    });
  }

  /* ---------- Мобильное меню ---------- */
  function initNav() {
    var burger = document.getElementById("burger");
    var nav = document.getElementById("nav");
    if (!burger || !nav) return;

    function closeNav() {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Липкая шапка ---------- */
  function initStickyHeader() {
    var header = document.getElementById("header");
    if (!header) return;

    // На страницах без hero (политика, условия, 404) шапка не бывает
    // «прозрачной поверх фото» — сразу показываем её в контрастном виде.
    if (!document.getElementById("hero")) {
      header.classList.add("is-stuck");
      return;
    }

    var toggle = function () {
      header.classList.toggle("is-stuck", window.scrollY > 40);
    };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }

  /* ---------- Лёгкий параллакс на hero-фото ---------- */
  function initParallax() {
    var media = document.getElementById("heroMedia");
    if (!media || prefersReducedMotion) return;
    var ticking = false;

    function update() {
      var y = window.scrollY;
      // Двигаем фон чуть медленнее прокрутки — едва заметный, спокойный эффект.
      var offset = Math.min(y * 0.12, 60);
      media.style.transform = "translate3d(0," + offset + "px,0)";
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Появление блоков при прокрутке ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Sticky-CTA на мобильных ---------- */
  function initStickyCta() {
    var bar = document.getElementById("stickyCta");
    var hero = document.getElementById("hero");
    var booking = document.getElementById("booking");
    if (!bar || !hero || !booking) return;

    var pastHero = false;
    var inBooking = false;

    function sync() {
      bar.classList.toggle("is-visible", pastHero && !inBooking);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) { pastHero = !entry.isIntersecting; });
          sync();
        },
        { rootMargin: "-70% 0px 0px 0px" }
      ).observe(hero);

      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) { inBooking = entry.isIntersecting; });
          sync();
        },
        { threshold: 0.15 }
      ).observe(booking);
    }
  }

  /* ---------- Форма бронирования ---------- */
  function initForm() {
    var form = document.getElementById("bookingForm");
    var status = document.getElementById("formStatus");
    if (!form || !status) return;

    var validators = {
      name: function (v) { return v.trim().length >= 2 || "Укажите имя"; },
      phone: function (v) {
        var digits = v.replace(/\D/g, "");
        return digits.length >= 10 || "Проверьте номер телефона";
      },
      consent: function (v, field) { return field.checked || "Нужно согласие на обработку данных"; }
    };

    function setError(name, message) {
      var out = form.querySelector('[data-error-for="' + name + '"]');
      var field = form.elements[name];
      if (out) out.textContent = message || "";
      if (field && field.setAttribute) field.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function validate() {
      var ok = true;
      Object.keys(validators).forEach(function (name) {
        var field = form.elements[name];
        if (!field) return;
        var value = field.type === "checkbox" ? field.checked : field.value;
        var result = validators[name](value, field);
        if (result !== true) {
          setError(name, result);
          ok = false;
        } else {
          setError(name, "");
        }
      });
      return ok;
    }

    ["name", "phone"].forEach(function (name) {
      var field = form.elements[name];
      if (field) field.addEventListener("blur", validate);
    });
    var consentField = form.elements["consent"];
    if (consentField) consentField.addEventListener("change", validate);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form__status";
      status.textContent = "";

      if (!validate()) {
        status.textContent = "Проверьте, пожалуйста, отмеченные поля.";
        status.classList.add("is-error");
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = new FormData(form);
      var summary =
        "Заявка с сайта «Своя Дача»\n" +
        "Имя: " + data.get("name") + "\n" +
        "Телефон: " + data.get("phone") + "\n" +
        "Заезд: " + (data.get("checkin") || "не указан") + "\n" +
        "Выезд: " + (data.get("checkout") || "не указан") + "\n" +
        "Гостей: " + (data.get("guests") || "не указано") + "\n" +
        "Комментарий: " + (data.get("comment") || "—");

      function done(ok, message) {
        status.textContent = message;
        status.classList.add(ok ? "is-ok" : "is-error");
        if (ok) form.reset();
      }

      function fallbackToWhatsApp() {
        // Без настроенного formEndpoint заявка уходит через WhatsApp,
        // чтобы гарантированно дойти до владельца.
        var waBase = (c.whatsapp || "https://wa.me/79000000000").split("?")[0];
        var waLink = waBase + "?text=" + encodeURIComponent(summary);
        window.open(waLink, "_blank", "noopener");
        done(true, "Спасибо! Открываем WhatsApp, чтобы отправить заявку — нажмите «Отправить».");
      }

      if (c.formEndpoint) {
        fetch(c.formEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: data })
          .then(function (res) {
            if (!res.ok) throw new Error("bad status");
            done(true, "Спасибо! Заявка отправлена, мы свяжемся с вами в ближайшее время.");
          })
          .catch(fallbackToWhatsApp);
      } else {
        fallbackToWhatsApp();
      }
    });
  }

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyContacts();
    initNav();
    initStickyHeader();
    initParallax();
    initReveal();
    initStickyCta();
    initForm();
    initYear();
  });
})();
