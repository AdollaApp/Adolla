"use strict";

document.querySelectorAll(".backup button").forEach(function (btn) {
  btn.addEventListener("click", function (evt) {
    var file = btn.closest(".backup").dataset.backup;
    var label = btn.closest(".backup").querySelector("span").innerText;
    if (confirm("Restore backup from ".concat(label, "? This will merge with your current progress."))) {
      var loc = location.href;
      if (!loc.endsWith("/")) loc += "/";
      fetch("".concat(loc, "restore-backup/").concat(file)).then(function (d) {
        return d.json();
      }).then(function () {
        location.reload();
      });
    }
  });
});