"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function doCheck() {
  document.querySelectorAll(".show-all-wrapper").forEach(function (wrapper) {
    // Check row count in element. If there's more than 3 rows, hide everything after every row after the third row.

    // Get all manga children
    var kids = _toConsumableArray(wrapper.children).filter(function (el) {
      return el.nodeName !== "BUTTON";
    });

    // Clean up
    var _iterator = _createForOfIteratorHelper(kids),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var div = _step.value;
        div.classList.remove("do-hide");
      }

      // Get offsets with elements
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    var offsets = kids.map(function (el) {
      return {
        el: el,
        top: el.getBoundingClientRect().top
      };
    });
    var rowOffsets = _toConsumableArray(new Set(offsets.map(function (v) {
      return v.top;
    })));

    // Get array of elements per row. Don't ask.
    var rows = [];
    var _iterator2 = _createForOfIteratorHelper(offsets),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var offsetWrapper = _step2.value;
        if (!rows[rowOffsets.indexOf(offsetWrapper.top)]) rows[rowOffsets.indexOf(offsetWrapper.top)] = [];
        rows[rowOffsets.indexOf(offsetWrapper.top)].push(offsetWrapper.el);
      }

      // Hide children after third row
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    var toHide = rows.slice(3).flat();
    if (toHide.length > 0) {
      wrapper.classList.remove("do-show-all");
    } else {
      wrapper.classList.add("do-show-all");
    }
    var _iterator3 = _createForOfIteratorHelper(toHide),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var el = _step3.value;
        el.classList.add("do-hide");
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
    wrapper.querySelectorAll(".more-count").forEach(function (el) {
      return el.innerText = toHide.length;
    });
  });
}

// Add event listener for "read more"
document.querySelectorAll("button.show-all").forEach(function (btn) {
  btn.addEventListener("click", function () {
    btn.closest(".show-all-wrapper").classList.add("force-show");
  });
});

// Run main row check
doCheck();
var resizeDebounce;
window.addEventListener("resize", function () {
  if (resizeDebounce) {
    clearTimeout(resizeDebounce);
    resizeDebounce = null;
  }
  resizeDebounce = setTimeout(doCheck, 1e3 / 60);
});
document.querySelectorAll(".list-type-option").forEach(function (el) {
  el.addEventListener("click", function () {
    requestAnimationFrame(doCheck);
  });
});
document.querySelectorAll(".remove-announcement").forEach(function (button) {
  button.addEventListener("click", function () {
    fetch("/dismiss-announcement", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        id: Number(button.closest("[data-id]").getAttribute("data-id"))
      })
    }).then(function (d) {
      return d.json();
    }).then(function (d) {
      if (d.status !== 200) {
        alert(d.error);
      } else {
        location.reload();
      }
    });
  });
});