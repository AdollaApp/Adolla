let listsCollapsed = localStorage.getItem("lists-collapsed")
	? JSON.parse(localStorage.getItem("lists-collapsed"))
	: {};

function storeCollapsed() {
	localStorage.setItem("lists-collapsed", JSON.stringify(listsCollapsed));
}

document.querySelectorAll("details.lists").forEach((detail) => {
	detail.addEventListener("toggle", () => {
		listsCollapsed[detail.id] = detail.getAttribute("open") === null;
		storeCollapsed();
	});
});

function setCollapsedElements() {
	// Get IDs of closed lists
	let closedLists = Object.entries(listsCollapsed)
		.filter((v) => v[1])
		.map((v) => v[0]);

	// Close elements
	for (let slug of closedLists) {
		let el = document.querySelector(`[id="${slug}"]`);
		if (el) el.removeAttribute("open");
	}
}

setCollapsedElements();
