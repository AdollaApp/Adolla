
/***********
 * SORTING PART
 */

document.querySelector("select.sorting").addEventListener("change", updateSorting);

function updateSorting() {
	let divs = [...document.querySelectorAll(".chapters .chapter")].map(el => document.importNode(el, true));

	divs = divs.sort((a, b) => Number(a.dataset.combined) - Number(b.dataset.combined));

	let sortMode = document.querySelector(".sorting").value;
	switch(sortMode) {
		case "chapter": 
			divs = divs.sort((a, b) => b.dataset.combined - a.dataset.combined);
			break;
		case "chapter-reversed":
			divs = divs.sort((a, b) => a.dataset.combined - b.dataset.combined);
			break;
		case "read":
			divs = divs.sort((a, b) => (Number(b.dataset.lastRead) || -1) - (Number(a.dataset.lastRead) || -1));
			break;
	}

	document.querySelector(".chapters").innerHTML = "";
	for(let div of divs) {
		document.querySelector(".chapters").appendChild(div);
	}

}
updateSorting();



/**************
 * SELECTION PART
 */

function initSelection() {

	// Toggle classes for "selected" states
	document.querySelectorAll(".chapter").forEach(chapter => {

		let select = chapter.querySelector(".select");

		chapter.addEventListener("click", evt => {
			if(evt.composedPath().includes(select)) {
				evt.preventDefault();

				select.querySelector("svg").classList.toggle("is-selected");
				select.querySelector("svg").classList.toggle("badge-background");

				updateSelectionStatus();

			} else if(document.querySelector(".chapter .select .is-selected")) {
				// Don't allow people to click links when they're selecting stuff
				// That just leads to sadness for everyone
				evt.preventDefault();
			}
		});
	});

	// Add event listener to the "mark as read" button
	document.querySelector(".is-footer .mark-as-read").addEventListener("click", async evt => {
		
		// Add background class to button
		evt.currentTarget.classList.add("badge-background");

		// Get all "chapter" elements for each selected chapter
		let selectedChapterEls = [...document.querySelectorAll(".chapter .select .is-selected")].map(selectButton => selectButton.closest(".chapter")).reverse();
		let selectedChaptersCombinedValues = selectedChapterEls.map(chapter => getChapterSeason(chapter)); // This generates an array with the `combined` value for each selected chapter
		
		/**
		 * Get season and chapter from chapter element
		 * @param {Element} chapterEl Chapter element
		 */
		function getChapterSeason(chapterEl) {
			
			
			let href = chapterEl.href;
			let slug = href.split("/").filter(Boolean).pop();
			let [season, chapter] = slug.split("-");
			
			return { 
				season: Number(season), 
				chapter: Number(chapter)
			};
		}

		// Generate URL
		let url = location.href;
		if(!url.endsWith("/")) url.endsWith("/");
		let endpoint = `${url}mark-chapters-as/`;

		let res = await fetch(endpoint, {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify({
				values: selectedChaptersCombinedValues
			})
		});
		let body = await res.json();
		if(res.status !== 200) {
			alert(body.error);
		} else {
			// Reload page so the updated percentages are shown
			// And the badge bg is gone from the button
			location.reload();
		}

	});

}
initSelection();

function updateSelectionStatus() {
	let selectedExists = !!document.querySelector(".chapter .select svg.is-selected");

	if(selectedExists) {
		document.body.classList.add("is-selection-mode");
	} else {
		document.body.classList.remove("is-selection-mode");
	}

}
