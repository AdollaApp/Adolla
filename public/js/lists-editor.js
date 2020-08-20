function updateLists() {
	
	const wrapper = document.querySelector(".display-lists");
	wrapper.innerHTML = "";

	for(let list of lists) {

		// Create node
		let span = document.createElement("span");

		// Add classes
		span.classList.add("badge", "badge-background");

		// Set content
		span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-square"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>`;
		span.innerHTML += list.name;

		// Add "remove from list" functionality
		span.querySelector("svg").addEventListener("click", () => {
			console.log(lists[0].slug, list.slug);
			lists = lists.filter(l => l.slug !== list.slug);
			updateLists();
			setLists();
		});

		// Add to list
		wrapper.appendChild(span);
	}


}

function initLists() {

	document.querySelector(".lists-wrapper input").addEventListener("keyup", evt => {
		if(evt.key === "Enter" && evt.currentTarget.value.length > 0) { // Add this to the lists
			
			// Get current value
			let input = evt.currentTarget.value;
			let slug = input.replace(/[\W_]+/g," ").trim().toLowerCase().replace(/ /g, "-");

			// Prevent duplicates
			let current = lists.find(v => v.slug === slug);
			if(current) {
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
				slug
			});
			
			// Now store the updated list
			// TODO: ^ yep, that
			setLists();

			// Reset input
			evt.currentTarget.value = "";

			// Render updated list
			updateLists();
		}
	});

	updateLists();
}
initLists();

async function setLists() {
	let url = location.href;
	if(!url.endsWith("/")) url += "/";
	fetch(`${url}set-lists`, {
		method: "POST",
		headers: {
			"content-type": "application/json"
		},
		body: JSON.stringify({ lists })
	});
}