const clean = (str) =>
	str
		.replace(/[\W_]+/g, " ")
		.trim()
		.toLowerCase()
		.replace(/ /g, "-");
let suggestions = [];

function updateLists() {
	const wrapper = document.querySelector(".display-lists");
	wrapper.innerHTML = "";

	for (let list of lists) {
		// Create node
		let span = document.createElement("span");

		// Add classes
		span.classList.add("secondary-badge");

		// Set content
		span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-square"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>`;
		span.innerHTML += list.name;

		// Add "remove from list" functionality
		span.querySelector("svg").addEventListener("click", () => {
			lists = lists.filter((l) => l.slug !== list.slug);
			updateLists();
			setLists();
		});

		// Add to list
		wrapper.appendChild(span);
	}

	updateSuggestions();
}

function initLists() {
	document
		.querySelector(".lists-wrapper input")
		.addEventListener("keyup", (evt) => {
			if (
				evt.key === "Enter" &&
				evt.currentTarget.value.length > 0 &&
				clean(evt.currentTarget.value).length > 0
			) {
				// Add this to the lists
				addList(evt.currentTarget.value);

				// Reset input
				evt.currentTarget.value = "";
			}

			updateSuggestions();
		});

	let input = document.querySelector(".lists-wrapper input");
	input.addEventListener("focus", (evt) => {
		input.classList.add("show-suggestions");
	});
	input.addEventListener("blur", (evt) => {
		setTimeout(() => {
			input.classList.remove("show-suggestions");
		}, 100);
	});

	updateLists();
}
initLists();

async function setLists() {
	let url = location.href;
	if (!url.endsWith("/")) url += "/";
	fetch(`${url}set-lists`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({ lists }),
	});
}

// Add list
function addList(input) {
	// Get current value
	let slug = clean(input);

	// Prevent duplicates
	let current = lists.find((v) => v.slug === slug);
	if (current) {
		let input = evt.currentTarget;
		input.classList.add("shake");
		setTimeout(() => {
			input.classList.remove("shake");
		}, 300);
		return;
	}

	// Add to list
	lists.push({
		name: input,
		slug,
	});

	// Now store the updated list
	setLists();

	// Render updated list
	updateLists();

	// Update suggestions
	updateSuggestions();
}

// Update suggestions in DOM
function updateSuggestions() {
	// Get all lists the manga isn't already in
	suggestions = allLists.filter((v) => !lists.find((e) => e.slug === v.slug));

	// Sort by current matches compared to input
	let currentValue = clean(
		document.querySelector(".lists-wrapper .input-div input").value
	);
	suggestions = suggestions.filter((suggestionList) =>
		suggestionList.slug.includes(currentValue)
	);

	// Add nodes
	let wrapper = document.querySelector(".suggestions");
	wrapper.innerHTML = "";

	// Add each suggestion
	for (let list of suggestions) {
		// Create node
		let node = document.createElement("div");

		// Add classes
		node.classList.add("suggestion");
		node.setAttribute("data-list-slug", list.slug);

		// Set name and ID
		node.innerText = list.name;

		// Add to "suggestions" div
		wrapper.appendChild(node);

		// Add "add" functionality
		node.addEventListener("click", () => {
			addList(list.name);
		});
	}
}
