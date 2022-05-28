"use strict";

if (window.history) {
  document.querySelector(".not-found .anchor").addEventListener("click", function () {
    history.back();
  });
} else {
  document.querySelector(".not-found .anchor").remove();
}