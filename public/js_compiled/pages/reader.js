"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
// This JS file is only for the reader.
// If this is run, it's fair to assume
// that this is the reader page

// Load state
var loaded = false;
var imageUrls;
document.querySelector(".manga-reader .loading").scrollIntoView({
  inline: "start",
  block: "start"
});

// This is a debounce effect for the page update
var scrollDebounce;
var secondScrollDebounce;
var badgeScrollDebounce;
function updateScrollDebounce() {
  var doDebounce = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  if (scrollDebounce) {
    clearTimeout(scrollDebounce);
    scrollDebounce = null;
  }
  if (secondScrollDebounce) {
    clearTimeout(secondScrollDebounce);
    secondScrollDebounce = null;
  }
  if (badgeScrollDebounce) {
    clearTimeout(badgeScrollDebounce);
    badgeScrollDebounce = null;
  }
  scrollDebounce = setTimeout(function () {
    if (!loaded) return;
    // Send POST request to update "reading" state
    var _getPageProgress = getPageProgress(),
      _getPageProgress2 = _slicedToArray(_getPageProgress, 2),
      currentPage = _getPageProgress2[0],
      pageCount = _getPageProgress2[1];
    var pathname = location.pathname;
    if (!pathname.endsWith("/")) pathname += "/";
    fetch(pathname + "set-progress", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        current: currentPage,
        total: pageCount
      })
    });
  }, doDebounce ? 500 : 0);
  badgeScrollDebounce = setTimeout( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var res, unreadCount;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log("Setting badge");
            // Update client badge count
            if (!("setAppBadge" in navigator)) {
              _context.next = 7;
              break;
            }
            _context.next = 4;
            return fetch("/json").then(function (d) {
              return d.json();
            });
          case 4:
            res = _context.sent;
            unreadCount = res.data.reading.filter(function (entry) {
              return entry.progress["new"];
            }).length;
            navigator.setAppBadge(unreadCount);
          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })), 3e3);
  secondScrollDebounce = setTimeout(function () {
    updatePages();
  }, doDebounce ? 100 : 0);
}

// Lazy loading shizzles
document.addEventListener("scroll", updateLazyLoading);
document.querySelector(".pages").addEventListener("scroll", updateLazyLoading);
function updateLazyLoading() {
  var elOffsets = getPageProgress()[2];
  var threshold = screen.width + screen.height;
  var els = elOffsets.filter(function (entry) {
    return entry.offset < threshold && entry.el.getAttribute("data-src");
  });
  var _iterator = _createForOfIteratorHelper(els),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var entry = _step.value;
      entry.el.src = entry.el.getAttribute("data-src");
      entry.el.removeAttribute("data-src");
      entry.el.removeAttribute("style");
      console.log("Lazy loading: ".concat(entry.el.alt));
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

// Find html and pages so that we can add scroll listeners for both
document.addEventListener("scroll", updateScrollDebounce);
document.querySelector(".pages").addEventListener("scroll", updateScrollDebounce);
function updatePages() {
  var _getPageProgress3 = getPageProgress(),
    _getPageProgress4 = _slicedToArray(_getPageProgress3, 2),
    currentPage = _getPageProgress4[0],
    pageCount = _getPageProgress4[1];
  if (loaded) document.body.setAttribute("data-to-page", currentPage);
  var toPage = Number(document.body.getAttribute("data-to-page")) || 0;
  var pageCountDom = Number(document.body.getAttribute("data-page-count")) || toPage + 1;
  document.querySelectorAll(".current-page").forEach(function (span) {
    span.innerText = "".concat(loaded ? currentPage : toPage !== "false" ? toPage : 0, " of ").concat(pageCount ? pageCount : pageCountDom !== "false" ? pageCountDom : 0);
  });
}
updatePages();

// Get page progress
function getPageProgress() {
  var _elementOffsets$;
  var pageCount = document.querySelectorAll(".pageImg").length;

  // Check if the reader is horizontal or not
  var isHorizontal = document.querySelector("[data-reader-direction]").getAttribute("data-reader-direction").startsWith("horizontal");

  // Get offset for pages
  var direction = isHorizontal ? "left" : "bottom";
  var wrapperOffset = isHorizontal ? document.querySelector(".pages").getBoundingClientRect()[direction] : window.innerHeight;
  var elementOffsets = _toConsumableArray(document.querySelectorAll(".pageImg")).map(function (d) {
    return {
      offset: Math.abs(d.getBoundingClientRect()[direction] - wrapperOffset),
      el: d
    };
  }).sort(function (a, b) {
    return a.offset - b.offset;
  });
  var closestPage = (_elementOffsets$ = elementOffsets[0]) === null || _elementOffsets$ === void 0 ? void 0 : _elementOffsets$.el;
  var currentPage = closestPage ? Number(closestPage.getAttribute("data-i")) || 1 : 1;
  return [currentPage, pageCount, elementOffsets];
}
function readerIsHorizontal() {
  // Returns if the images are vertical or not
  var settings = getSettings();
  return settings["reader-direction"] === "horizontal" || settings["reader-direction"] === "horizontal-reversed";
}

// Scroll to page
function scrollToPage() {
  // doImages();
  // Scroll each specific page to end
  document.querySelectorAll(".page-container").forEach(function (container) {
    container.scrollTo(1000, 0);
  });

  // Scroll to specific page
  var page = Number(document.body.dataset.toPage) || 1;
  console.info("Scroll to page", page);
  if (page) {
    // Get relevant element and scroll to it
    var pageEl = document.querySelector(".pageImg[data-i=\"".concat(page, "\"]"));
    if (!pageEl) return null;
    scrollReader(pageEl);
  }
}
function scrollReader(pageEl) {
  var topOffset = document.querySelector(".mobile-nav").scrollHeight;
  pageEl.scrollIntoView({
    inline: "start",
    block: "start"
  });
  if (!readerIsHorizontal()) {
    window.scrollBy(0, -topOffset);
    // Deal with iOS padding
  }
}

// Add click event to floating button
document.querySelectorAll(".floating-button").forEach(function (button) {
  button.addEventListener("click", function () {
    button.classList.add("clicked", "badge-background");
  });
});
function nextPage() {
  var _getPageProgress5 = getPageProgress(),
    _getPageProgress6 = _slicedToArray(_getPageProgress5, 2),
    currentPage = _getPageProgress6[0],
    pageCount = _getPageProgress6[1];
  var pageEl = document.querySelectorAll(".pageImg")[currentPage];
  if (pageEl) scrollReader(pageEl);

  // Go to next chapter if it's on the last page
  if (currentPage === pageCount) nextChapter();
}
function previousPage() {
  var _getPageProgress7 = getPageProgress(),
    _getPageProgress8 = _slicedToArray(_getPageProgress7, 2),
    currentPage = _getPageProgress8[0],
    pageCount = _getPageProgress8[1];
  var pageEl = document.querySelectorAll(".pageImg")[currentPage - 2];
  if (pageEl) scrollReader(pageEl);

  // Go to previous chapter if it's on page 0
  if (currentPage === 1) previousChapter();
}
function nextChapter() {
  document.querySelector(".next .chapterLink").click();
}
function previousChapter() {
  document.querySelector(".previous .chapterLink").click();
}

// Keyboard controls
document.addEventListener("keydown", function (evt) {
  if (!evt.key.startsWith("Arrow") || getSettings()["enable-keyboard-controls"] === "no") return;
  evt.preventDefault();
  var isHorizontal = readerIsHorizontal();
  switch (evt.key) {
    case "ArrowLeft":
      isHorizontal ? previousPage() : previousChapter();
      break;
    case "ArrowRight":
      isHorizontal ? nextPage() : nextChapter();
      break;
    case "ArrowUp":
      isHorizontal ? previousChapter() : previousPage();
      break;
    case "ArrowDown":
      isHorizontal ? nextChapter() : nextPage();
      break;
    default:
      alert("Unknown");
  }
});
function toggleTappable(evt) {
  document.querySelectorAll(".toggle-on-tap, .toggle-class-on-tap").forEach(function (toggle) {
    return toggle.classList.toggle("tapped");
  });
}
document.querySelectorAll(".manga-reader").forEach(function (el) {
  el.addEventListener("click", function (evt) {
    // Get all classes for each element in the path
    var classes = _toConsumableArray(evt.composedPath()).reverse().map(function (v) {
      var _v$classList;
      return Object.values((_v$classList = v.classList) !== null && _v$classList !== void 0 ? _v$classList : {}).join(".");
    }).map(function (v) {
      return v.length > 0 ? "." + v : v;
    }).join(" ").trim();

    // If a button was pressed or the layout is open, do nothing
    if (classes.includes(".secondary-button") || classes.includes("quick-select-wrapper")) return;
    var target = evt.currentTarget;
    var _target$getBoundingCl = target.getBoundingClientRect(),
      containerX = _target$getBoundingCl.x,
      width = _target$getBoundingCl.width;
    var clientX = evt.clientX;
    var relativeX = clientX - containerX;

    // Evaluate which section was clicked
    var _map = [0, width / 3, width / 3 * 2].map(function (area) {
        return relativeX >= area && relativeX < area + width / 3;
      }),
      _map2 = _slicedToArray(_map, 3),
      left = _map2[0],
      middle = _map2[1],
      right = _map2[2];
    if (getSettings()["tap-navigation"] !== "yes") {
      toggleTappable(evt);
    } else {
      if (left) previousPage();else if (middle) toggleTappable(evt);else if (right) nextPage();
    }
  });
});

// Generate error for failed images
var failedImages = [];
var errorDebounce;
document.querySelectorAll(".pageImg").forEach(function (img) {
  img.addEventListener("error", function (evt) {
    failedImages.push(img.getAttribute("alt"));
    img.classList.add("hidden");
    if (errorDebounce) {
      clearTimeout(errorDebounce);
      errorDebounce = null;
    }
    errorDebounce = setTimeout(function () {
      // alert(`The images for ${failedImages.sort((a,b) => a.split(" ").pop() - b.split(" ").pop()).join(", ")} ${failedImages.length === 1 ? "has" : "have"} failed to load.`);
      alert("The images for ".concat(failedImages.length, " ").concat(failedImages.length === 1 ? "page has" : "pages have", " failed to load."));
      failedImages = [];
    }, 600);
  });
});

// Function to set innerHTML
function setLoadingText(text) {
  document.querySelectorAll(".current-loading-progress").forEach(function (el) {
    el.innerText = text;
  });
}
function initImages() {
  return _initImages.apply(this, arguments);
}
function _initImages() {
  _initImages = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var forced,
      wrapper,
      toLoadImages,
      loadedImg,
      img,
      checkInterval,
      curChapterAnchor,
      children,
      chapIndex,
      preloadableChapters,
      _iterator5,
      _step5,
      anchor,
      _args2 = arguments;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            forced = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : false;
            _context2.prev = 1;
            _context2.next = 4;
            return getImageUrls(location.href, forced);
          case 4:
            imageUrls = _context2.sent;
            // Add elements to DOM
            doImages(forced);

            // Wait for any images to load
            wrapper = document.querySelector(".pages");
            toLoadImages = _toConsumableArray(wrapper.querySelectorAll(".pageImg"));
            updateLazyLoading();

            // Load for each one
            _context2.next = 11;
            return Promise.any(toLoadImages.map(function (img) {
              return new Promise(function (resolve, reject) {
                img.addEventListener("load", function () {
                  loadedImg = img;
                  resolve();
                });
                img.addEventListener("error", reject);
              });
            }));
          case 11:
            if (getSettings()["reader-direction"] === "long-strip") {
              document.querySelectorAll("[data-src]").forEach(function (el) {
                el.style.minHeight = loadedImg.scrollHeight + "px";
              });
            }

            // Remove loading text
            setLoadingText("");
            updatePages();

            // Update loading section in DOM
            document.querySelector(".manga-reader").classList.add("loaded");

            // Check whether to scroll to page yet, or not
            img = document.querySelector(".pageImg");
            checkInterval = setInterval(function () {
              if (img.scrollHeight > 0) {
                clearInterval(checkInterval);
                scrollToPage();
                loaded = true;
                updateScrollDebounce(false);
              }
            }, 50);
            updateDoublePages();
            _context2.next = 27;
            break;
          case 20:
            _context2.prev = 20;
            _context2.t0 = _context2["catch"](1);
            console.error(_context2.t0);
            loaded = true;
            document.querySelector(".manga-reader").classList.add("loaded");
            setLoadingText("Error");
            document.querySelectorAll(".reload-chapters-button").forEach(function (el) {
              el.classList.remove("hidden");
            });
          case 27:
            // Pre-load other image urls
            curChapterAnchor = document.querySelector(".current-chapter");
            children = _toConsumableArray(curChapterAnchor.parentNode.children);
            chapIndex = children.indexOf(curChapterAnchor);
            preloadableChapters = children.slice(chapIndex, chapIndex + 5);
            _iterator5 = _createForOfIteratorHelper(preloadableChapters);
            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                anchor = _step5.value;
                getImageUrls(anchor.href);
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }
          case 33:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 20]]);
  }));
  return _initImages.apply(this, arguments);
}
initImages();
document.querySelectorAll(".reload-chapters-button").forEach(function (el) {
  el.addEventListener("click", function (evt) {
    document.querySelector(".manga-reader").classList.remove("loaded");
    document.querySelectorAll(".page-container, .pageImg").forEach(function (el) {
      return el.remove();
    });
    initImages(true);
    el.classList.add("hidden");
  });
});
function doImages() {
  var bypassCache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  // Add images to DOM
  var wrapper = document.querySelector(".pages");
  document.querySelectorAll(".page-container, .pageImg").forEach(function (el) {
    return el.remove();
  });
  var clone = Object.assign([], imageUrls); // Apparently `.reverse()` now manipulates the original array? So we need to clone it.
  var _loop = function _loop() {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
      i = _Object$entries$_i[0],
      url = _Object$entries$_i[1];
    // Generate node
    var img = document.createElement("img");
    img.classList.add("pageImg");
    img.setAttribute("alt", "Page ".concat(Number(clone.length - i)));
    img.setAttribute("data-i", clone.length - i);
    img.style.minHeight = "30vh";

    // Set source
    var proxySrc = "/proxy-image?url=".concat(encodeURIComponent(url), "&referer=").concat(location.href.includes("mangasee") ? "mangasee" : location.href.includes("manganelo") ? "manganelo" : location.href.includes("mangahere") ? "mangahere" : "null").concat(bypassCache ? "&c=".concat(+Date.now()) : "");
    var isBookMode = getSettings()["double-pages"] === "yes";
    if (isBookMode) {
      img.setAttribute("src", url.includes("mangadex") ? proxySrc : url);
    } else {
      img.setAttribute("data-src", url.includes("mangadex") ? proxySrc : url);
      img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }
    img.addEventListener("error", function () {
      if (!img.src.includes("proxy-image")) {
        img.src = proxySrc;
      } else {
        loaded = true;
        document.querySelector(".manga-reader").classList.add("loaded");
        setLoadingText("Error");
        document.querySelectorAll(".reload-chapters-button").forEach(function (el) {
          el.classList.remove("hidden");
        });
      }
    });

    // Add to DOM
    wrapper.insertBefore(img, wrapper.querySelector("*"));
  };
  for (var _i2 = 0, _Object$entries = Object.entries(clone.reverse()); _i2 < _Object$entries.length; _i2++) {
    _loop();
  }

  // Update doublePages
  updateDoublePages();
}
function getImageUrls() {
  return _getImageUrls.apply(this, arguments);
} // Camera mode
function _getImageUrls() {
  _getImageUrls = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
    var loc,
      forceFetch,
      key,
      cache,
      url,
      _i4,
      _Object$keys,
      _url,
      urls,
      _args3 = arguments;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            loc = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : location.href;
            forceFetch = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : false;
            // Prepare storage
            key = "image-cache";
            if (!localStorage.getItem(key)) localStorage.setItem(key, "{}");
            cache = JSON.parse(localStorage.getItem(key)); // Generate URL endpoint
            if (!loc.endsWith("/")) loc += "/";
            url = "".concat(loc.split(location.host)[1], "get-images/"); // Remove old items
            for (_i4 = 0, _Object$keys = Object.keys(cache); _i4 < _Object$keys.length; _i4++) {
              _url = _Object$keys[_i4];
              if (cache[_url] && cache[_url].at < Date.now() - 1e3 * 60 * 60) {
                cache[_url] = undefined;
              }
            }

            // Check cache
            if (!(cache[url] && !forceFetch)) {
              _context3.next = 10;
              break;
            }
            return _context3.abrupt("return", cache[url].images);
          case 10:
            _context3.prev = 10;
            _context3.next = 13;
            return fetch(url);
          case 13:
            _context3.next = 15;
            return _context3.sent.json();
          case 15:
            urls = _context3.sent;
            _context3.next = 22;
            break;
          case 18:
            _context3.prev = 18;
            _context3.t0 = _context3["catch"](10);
            location.href = "/error";
            return _context3.abrupt("return");
          case 22:
            if (!(urls[0] === "captcha")) {
              _context3.next = 25;
              break;
            }
            location.href = "/error?t=captcha";
            return _context3.abrupt("return");
          case 25:
            // Store in cache
            cache = JSON.parse(localStorage.getItem(key));
            cache[url] = {
              at: Date.now(),
              images: urls
            };

            // It might overflow
            try {
              localStorage.setItem(key, JSON.stringify(cache));
            } catch (err) {
              // Nothing at all. Lol.
            }

            // Return data
            return _context3.abrupt("return", urls);
          case 29:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[10, 18]]);
  }));
  return _getImageUrls.apply(this, arguments);
}
var cameraInterval;
var onScreenImages = [];
document.querySelectorAll(".is-camera-button").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.body.classList.add("is-camera-mode");
    if (cameraInterval) {
      clearInterval(cameraInterval);
    }
    onScreenImages = [];
    cameraInterval = setInterval(function () {
      var images = document.querySelectorAll(".pageImg");
      var _iterator2 = _createForOfIteratorHelper(images),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var image = _step2.value;
          if (isOnScreen(image) && !onScreenImages.includes(image)) {
            onScreenImages.push(image);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }, 500);
    setTimeout(function () {
      var f = function f(evt) {
        evt.currentTarget.removeEventListener("click", f);
        document.body.classList.remove("is-camera-mode");
        clearInterval(cameraInterval);

        // Get image URLs for every image that was on screen
        var imgs = _toConsumableArray(onScreenImages[0].closest(".pages").querySelectorAll("img"));
        var images = onScreenImages.sort(function (a, b) {
          return imgs.indexOf(a) - imgs.indexOf(b);
        });
        showBigImage(images);
      };
      document.body.addEventListener("click", f);
    }, 1e3);
  });
});
var fileToShare;

/**
 * Get base64 URL for really big image
 * Images is an array of image element
 */
function showBigImage(_x) {
  return _showBigImage.apply(this, arguments);
}
function _showBigImage() {
  _showBigImage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(images) {
    var canvas, ctx, heightSum, imgs, y, _iterator6, _step6, img, url, div, a;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            canvas = document.createElement("canvas");
            ctx = canvas.getContext("2d");
            canvas.width = images[0].naturalWidth;
            heightSum = images.reduce(function (acc, img) {
              return acc + img.naturalHeight;
            }, 0);
            canvas.height = heightSum;
            _context5.next = 7;
            return Promise.all(images.map(function (img) {
              return new Promise( /*#__PURE__*/function () {
                var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(resolve) {
                  var newImage, blob;
                  return _regeneratorRuntime().wrap(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          if (img.src.startsWith("data:image")) {
                            _context4.next = 9;
                            break;
                          }
                          newImage = new Image();
                          _context4.next = 4;
                          return fetch(img.src).then(function (r) {
                            return r.blob();
                          }).then(function (blob) {
                            return URL.createObjectURL(blob);
                          });
                        case 4:
                          blob = _context4.sent;
                          newImage.src = blob;
                          setTimeout(function () {
                            resolve(newImage);
                          }, 1e3);
                          _context4.next = 10;
                          break;
                        case 9:
                          resolve(img);
                        case 10:
                        case "end":
                          return _context4.stop();
                      }
                    }
                  }, _callee4);
                }));
                return function (_x2) {
                  return _ref2.apply(this, arguments);
                };
              }());
            }));
          case 7:
            imgs = _context5.sent;
            y = 0;
            _iterator6 = _createForOfIteratorHelper(imgs);
            try {
              for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                img = _step6.value;
                ctx.drawImage(img, 0, y);
                y += img.naturalHeight;
              }
            } catch (err) {
              _iterator6.e(err);
            } finally {
              _iterator6.f();
            }
            url = canvas.toDataURL();
            div = document.createElement("div");
            div.classList.add("img-share");
            a = document.createElement("a");
            a.href = url;
            a.setAttribute("download", "screenshot.png");
            a.innerHTML = "<img class=\"to-share\" src=\"".concat(url, "\">");
            div.appendChild(a);
            div.addEventListener("click", function () {
              div.remove();
            });
            document.body.appendChild(div);
          case 21:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _showBigImage.apply(this, arguments);
}
function isOnScreen(el) {
  // See if element is visible on screen
  var rect = el.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  var viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0 || rect.right < 0 || rect.left - viewWidth >= 0);
}
function updateDoublePages() {
  var doScroll = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var _getPageProgress9 = getPageProgress(),
    _getPageProgress10 = _slicedToArray(_getPageProgress9, 1),
    currentPage = _getPageProgress10[0];
  var wrapper = document.querySelector(".pages");

  // Get all images
  var allImages = _toConsumableArray(document.querySelectorAll(".pageImg")).sort(function (a, b) {
    return a.getAttribute("data-i") - b.getAttribute("data-i");
  });

  // Remove left-overs
  document.querySelectorAll(".page-container").forEach(function (div) {
    return div.remove();
  });

  // Iniate some other variables
  var newImageSequences = [];
  var settings = getSettings();
  var doDouble = settings["double-pages"] === "yes" && readerIsHorizontal() && window.innerWidth > window.innerHeight;
  if (doDouble) {
    newImageSequences.unshift([null]);
  }

  // Sort all images into the sequence
  var _iterator3 = _createForOfIteratorHelper(allImages),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var img = _step3.value;
      if (img.naturalHeight > img.naturalWidth && doDouble) {
        // Vertical images...
        if (newImageSequences[0].length < 2) {
          newImageSequences[0].unshift(img);
        } else {
          newImageSequences.unshift([img]);
        }
      } else {
        newImageSequences.unshift([img, null]);
      }
      img.remove();
    }

    // Add all sequences to the DOM
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  for (var _i3 = 0, _newImageSequences = newImageSequences; _i3 < _newImageSequences.length; _i3++) {
    var seq = _newImageSequences[_i3];
    var div = document.createElement("div");
    div.classList.add("page-container");
    var _iterator4 = _createForOfIteratorHelper(seq),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var imgEl = _step4.value;
        if (imgEl) div.appendChild(imgEl);
      }

      // Add to DOM
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
    wrapper.insertBefore(div, wrapper.querySelector("*"));
  }

  // For RTL readers, reverse the order of the pages
  // Reverse element order of `pages`
  if (getSettings()["reader-direction"] === "horizontal-reversed") {
    reverseChildren(document.querySelector(".pages"));
  }

  // Scroll to previous page
  if (doScroll) {
    var pageEl = document.querySelector("[data-i=\"".concat(currentPage, "\"]"));
    if (pageEl) pageEl.scrollIntoView();
  }
}
function reverseChildren(parent) {
  for (var i = 1; i < parent.childNodes.length; i++) {
    parent.insertBefore(parent.childNodes[i], parent.firstChild);
  }
}
var resizeDebounceDouble = null;
window.addEventListener("resize", function () {
  if (resizeDebounceDouble) {
    clearTimeout(resizeDebounceDouble);
  }
  resizeDebounceDouble = setTimeout(function () {
    updateDoublePages();
  }, 100);
});