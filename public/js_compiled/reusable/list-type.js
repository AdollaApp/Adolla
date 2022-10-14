"use strict";

var listTypes = localStorage.getItem("list-types") ? JSON.parse(localStorage.getItem("list-types")) : {};
function updateListTypes() {
  // Set default value for each one
  document.querySelectorAll("[data-list-id]").forEach(function (section) {
    // Default value
    if (!listTypes[section.dataset.listId]) listTypes[section.dataset.listId] = "list"; // "list" or "grid"

    // Update attribute
    section.setAttribute("data-list-type", listTypes[section.dataset.listId]);
  });
  localStorage.setItem("list-types", JSON.stringify(listTypes));
}
function initListTypes() {
  document.querySelectorAll("[data-list-id]").forEach(function (section) {
    var listId = section.dataset.listId;
    section.querySelector(".set-list-list").addEventListener("click", function (evt) {
      evt.preventDefault();
      listTypes[listId] = "list";
      updateListTypes();
    });
    section.querySelector(".set-list-grid").addEventListener("click", function (evt) {
      evt.preventDefault();
      listTypes[listId] = "grid";
      updateListTypes();
    });
  });

  // Toggle "show on home"
  document.querySelectorAll(".toggle-home").forEach(function (homeButton) {
    homeButton.addEventListener("click", function (evt) {
      evt.preventDefault();
      var listId = homeButton.closest("[id]").id;
      homeButton.classList.toggle("is-selected");
      var showOnHome = homeButton.classList.contains("is-selected");
      var url = location.href;
      if (!url.endsWith("/")) url += "/";
      fetch("".concat(url, "set-home"), {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          listId: listId,
          value: showOnHome
        })
      });
    });
  });
  updateListTypes();
}
initListTypes();