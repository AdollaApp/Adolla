let listTypes = localStorage.getItem("list-types")
	? JSON.parse(localStorage.getItem("list-types"))
	: {};

function updateListTypes() {
	// Set default value for each one
	document.querySelectorAll("[data-list-id]").forEach((section) => {
		// Default value
		if (!listTypes[section.dataset.listId])
			listTypes[section.dataset.listId] = "list"; // "list" or "grid"

		// Update attribute
		section.setAttribute("data-list-type", listTypes[section.dataset.listId]);
	});

	localStorage.setItem("list-types", JSON.stringify(listTypes));
}

function initListTypes() {
	document.querySelectorAll("[data-list-id]").forEach((section) => {
		let listId = section.dataset.listId;

		section.querySelector(".set-list-list").addEventListener("click", (evt) => {
			evt.preventDefault();
			listTypes[listId] = "list";
			updateListTypes();
		});
		section.querySelector(".set-list-grid").addEventListener("click", (evt) => {
			evt.preventDefault();
			listTypes[listId] = "grid";
			updateListTypes();
		});
	});

	// Toggle "show on home"
	document.querySelectorAll(".toggle-home").forEach((homeButton) => {
		homeButton.addEventListener("click", (evt) => {
			evt.preventDefault();

			let listId = homeButton.closest("[id]").id;
			homeButton.classList.toggle("is-selected");
			let showOnHome = homeButton.classList.contains("is-selected");

			let url = location.href;
			if (!url.endsWith("/")) url += "/";

			fetch(`${url}set-home`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					listId,
					value: showOnHome,
				}),
			});
		});
	});

	updateListTypes();
}
initListTypes();
