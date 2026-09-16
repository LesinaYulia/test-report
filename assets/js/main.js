/**
 * Своя Дача — интерактив лендинга:
 * подстановка контактов, мобильное меню, липкая шапка, появление блоков
 * при прокрутке, галерея-лайтбокс и валидация формы бронирования.
 */
(function () {
  "use strict";

  var c = window.SITE_CONTACTS || {};

  /* ---------- Подстановка контактов во все шаблонные места ---------- */
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
    document.querySelectorAll('[data-contact="map-link"]').forEach(function (el) {
      el.setAttribute("href", c.map || "#");
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
    }

    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Липкая шапка при прокрутке ---------- */
  function initStickyHeader() {
    var header = document.getElementById("header");
    if (!header) return;
    var toggle = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Галерея / лайтбокс ---------- */
  function initGallery() {
    var grid = document.getElementById("galleryGrid");
    var lightbox = document.getElementById("lightbox");
    if (!grid || !lightbox) return;

    var img = document.getElementById("lightboxImg");
    var closeBtn = lightbox.querySelector(".lightbox__close");
    var prevBtn = lightbox.querySelector(".lightbox__nav--prev");
    var nextBtn = lightbox.querySelector(".lightbox__nav--next");
    var items = Array.prototype.slice.call(grid.querySelectorAll(".gallery__item"));
    var current = 0;
    var lastFocused = null;

    function show(index) {
      current = (index + items.length) % items.length;
      var el = items[current];
      img.src = el.getAttribute("data-full") || el.querySelector("img").src;
      img.alt = el.querySelector("img").alt || "";
    }

    function open(index) {
      lastFocused = document.activeElement;
      show(index);
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    items.forEach(function (el, index) {
      el.addEventListener("click", function () { open(index); });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { show(current - 1); });
    nextBtn.addEventListener("click", function () { show(current + 1); });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
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
      var extras = data.getAll("extras").join(", ") || "не выбрано";
      var summary =
        "Заявка с сайта «Своя Дача»\n" +
        "Имя: " + data.get("name") + "\n" +
        "Телефон: " + data.get("phone") + "\n" +
        "Заезд: " + (data.get("checkin") || "не указан") + "\n" +
        "Суток: " + data.get("nights") + "\n" +
        "Гостей: " + (data.get("guests") || "не указано") + "\n" +
        "Дополнительно: " + extras + "\n" +
        "Комментарий: " + (data.get("comment") || "—");

      function done(ok, message) {
        status.textContent = message;
        status.classList.add(ok ? "is-ok" : "is-error");
        if (ok) form.reset();
      }

      if (c.formEndpoint) {
        fetch(c.formEndpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data
        })
          .then(function (res) {
            if (!res.ok) throw new Error("bad status");
            done(true, "Спасибо! Заявка отправлена, мы свяжемся с вами в ближайшее время.");
          })
          .catch(function () {
            fallbackToWhatsApp();
          });
      } else {
        fallbackToWhatsApp();
      }

      function fallbackToWhatsApp() {
        // Без настроенного formEndpoint отправляем заявку через WhatsApp,
        // чтобы она гарантированно дошла владельцу.
        var waBase = (c.whatsapp || "https://wa.me/79000000000").split("?")[0];
        var waLink = waBase + "?text=" + encodeURIComponent(summary);
        window.open(waLink, "_blank", "noopener");
        done(true, "Спасибо! Открываем WhatsApp, чтобы отправить заявку — просто нажмите «Отправить».");
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
    initReveal();
    initGallery();
    initForm();
    initYear();
  });
})();
