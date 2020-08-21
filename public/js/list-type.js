
let listTypes = localStorage.getItem("list-types") ? JSON.parse(localStorage.getItem("list-types")) : {};

function updateListTypes() {

	// Set default value for each one
	document.querySelectorAll("[data-list-id]").forEach(section => {
		
		// Default value
		if(!listTypes[section.dataset.listId]) listTypes[section.dataset.listId] = "grid"; // "list" or "grid"
		
		// Update attribute
		section.setAttribute("data-list-type", listTypes[section.dataset.listId]);

	});

	localStorage.setItem("list-types", JSON.stringify(listTypes));
}

function initListTypes() {

	document.querySelectorAll("[data-list-id]").forEach(section => {
		let listId = section.dataset.listId;
		console.log(section);
		section.querySelector(".set-list-list").addEventListener("click", evt => {
			evt.preventDefault();
			listTypes[listId] = "list";
			updateListTypes();
		});
		section.querySelector(".set-list-grid").addEventListener("click", evt => {
			evt.preventDefault();
			listTypes[listId] = "grid";
			updateListTypes();
		});
	});

	updateListTypes();
}
initListTypes();