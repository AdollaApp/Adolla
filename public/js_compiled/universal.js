"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// Search
document.querySelectorAll(".search-input").forEach(function (input) {
  input.addEventListener("change", function (event) {
    var query = event.currentTarget.value.trim();
    if (query && query.length > 0) {
      location.href = "".concat(!location.pathname.startsWith("/search/") ? "/search/mangasee/" : "", "?q=").concat(encodeURIComponent(query));
    }
  });
});

// Chapter quick select
document.querySelectorAll(".toggle-quick-select").forEach(function (div) {
  div.addEventListener("click", function (evt) {
    if (!evt.composedPath().includes(document.querySelector(".quick-select"))) {
      document.querySelector("html").classList.toggle("overlay-visible");
      document.querySelector(".quick-select-wrapper").classList.toggle("visible");
      document.querySelector(".quick-select-wrapper .scroll .current-chapter").scrollIntoView({
        block: "center"
      });
    }
  });
});

// Util
document.querySelectorAll(".blue-on-click").forEach(function (el) {
  // Used for elements like buttons and stuff
  el.addEventListener("click", function () {
    el.classList.add("badge-background");
  });
});

// Add class to chapterlink when clicked
document.querySelectorAll(".chapterLink, a.chapter:not(.no-badge)").forEach(function (link) {
  link.addEventListener("click", function (evt) {
    // Clean up
    document.querySelectorAll("a.chapter.badge-background").forEach(function (a) {
      return a.classList.remove("badge-background");
    });

    // Add class
    var select = link.querySelector(".select");
    if (!evt.composedPath().includes(select) && !document.querySelector(".chapter .select .is-selected")) {
      link.classList.add("clicked", "badge-background");
    }
  });
});

// Service workers
var sw = true;
if (sw && navigator.onLine) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then(function () {}, function (err) {
      console.error(err);
    });
  }
} else if (!sw && navigator.onLine) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      var _iterator = _createForOfIteratorHelper(registrations),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var registration = _step.value;
          registration.unregister();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    });
  }
}

// Loading state for footer buttons
document.querySelectorAll(".nav-footer .nav-link").forEach(function (link) {
  link.addEventListener("click", function () {
    link.classList.add("link-loading");
  });
});