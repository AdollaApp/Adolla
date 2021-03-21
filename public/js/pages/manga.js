let hasAppliedFooterEvents = false;

/***********
 * SORTING PART
 */

document
	.querySelector("select.sorting")
	.addEventListener("change", updateSorting);

function updateSorting() {
	let divs = [...document.querySelectorAll(".chapters .chapter")].map((el) =>
		document.importNode(el, true)
	);

	divs = divs.sort(
		(a, b) => Number(a.dataset.combined) - Number(b.dataset.combined)
	);

	let sortMode = document.querySelector(".sorting").value;
	switch (sortMode) {
		case "chapter":
			divs = divs.sort((a, b) => b.dataset.combined - a.dataset.combined);
			break;
		case "chapter-reversed":
			divs = divs.sort((a, b) => a.dataset.combined - b.dataset.combined);
			break;
		case "read":
			divs = divs.sort(
				(a, b) =>
					(Number(b.dataset.lastRead) || -1) -
					(Number(a.dataset.lastRead) || -1)
			);
			break;
	}

	document.querySelector(".chapters").innerHTML = "";
	for (let div of divs) {
		document.querySelector(".chapters").appendChild(div);
	}

	initSelection();
}
updateSorting();

/**************
 * SELECTION PART
 */

function initSelection() {
	// Toggle classes for "selected" states
	document.querySelectorAll(".chapter").forEach((chapter) => {
		let select = chapter.querySelector(".select");

		chapter.addEventListener("click", (evt) => {
			if (evt.composedPath().includes(select)) {
				evt.preventDefault();

				select.querySelector("svg").classList.toggle("is-selected");
				select.querySelector("svg").classList.toggle("badge-background");

				updateSelectionStatus();
			} else if (document.querySelector(".chapter .select .is-selected")) {
				// Don't allow people to click links when they're selecting stuff
				// That just leads to sadness for everyone
				evt.preventDefault();
			}
		});
	});

	// Add event listener to the "mark as read" button
	if (!hasAppliedFooterEvents) {
		// Add event listener to "select all" buttons
		document
			.querySelectorAll(".secondary-button.select-all-chapters")
			.forEach((btn) => {
				btn.addEventListener("click", () => {
					for (let el of document.querySelectorAll(".chapter .select svg")) {
						el.classList.add("is-selected", "badge-background");
					}
					updateSelectionStatus();
				});
			});

		// Add event listener to "deselect all" buttons
		document
			.querySelectorAll(".secondary-button.deselect-all-chapters")
			.forEach((btn) => {
				btn.addEventListener("click", () => {
					for (let el of document.querySelectorAll(
						".chapter .select svg.is-selected"
					)) {
						el.classList.remove("is-selected", "badge-background");
					}
					updateSelectionStatus();
				});
			});

		// Add event listener to "mark as read" and "remove read status" buttons (in footer and in sidebar)
		document
			.querySelectorAll(".selection-actions .action-button")
			.forEach((button) => {
				let action = button.dataset.action;

				button.addEventListener("click", async (evt) => {
					if (
						action === "remove-read-status" &&
						!confirm(
							"Do you really want to remove the 'read status' for all these chapters?"
						)
					) {
						return;
					}

					// Add background class to button
					evt.currentTarget.classList.add("badge-background");

					// Get all "chapter" elements for each selected chapter
					let selectedChapterEls = [
						...document.querySelectorAll(".chapter .select .is-selected"),
					]
						.map((selectButton) => selectButton.closest(".chapter"))
						.reverse();
					let selectedChaptersCombinedValues = selectedChapterEls.map(
						(chapter) => getChapterSeason(chapter)
					); // This generates an array with the `combined` value for each selected chapter

					/**
					 * Get season and chapter from chapter element
					 * @param {Element} chapterEl Chapter element
					 */
					function getChapterSeason(chapterEl) {
						return chapterEl.dataset.hrefString;
					}

					// Generate URL
					let url = location.href;
					if (!url.endsWith("/")) url += "/";
					let endpoint = `${url}mark-chapters-as/`;

					let res = await fetch(endpoint, {
						method: "POST",
						headers: {
							"content-type": "application/json",
						},
						body: JSON.stringify({
							values: selectedChaptersCombinedValues,
							action,
						}),
					});
					let body = await res.json();
					if (res.status !== 200) {
						alert(body.error);
					} else {
						// Reload page so the updated percentages are shown
						// And the badge bg is gone from the button
						location.reload();
					}
				});
			});
		hasAppliedFooterEvents = true;
	}
}

function updateSelectionStatus() {
	let selectedExists = !!document.querySelector(
		".chapter .select svg.is-selected"
	);

	if (selectedExists) {
		document.body.classList.add("is-selection-mode");
	} else {
		document.body.classList.remove("is-selection-mode");
	}
}

document.querySelectorAll(".hide-from-reading").forEach((el) => {
	el.addEventListener("click", () => {
		if (
			confirm(
				"Really hide this series from read? It won't show up until you read more of this."
			)
		) {
			let url = location.href;
			if (!url.endsWith("/")) url += "/";

			fetch(`${url}hide-series/`, {
				method: "POST",
			});
		}
	});
});

/**
 * IOS STATUS BAR
 */

window.addEventListener("scroll", (evt) => {
	const scrollTop =
		(window.pageYOffset || document.scrollTop) - (document.clientTop || 0) || 0;

	if (scrollTop <= 0) {
		document
			.querySelector(".banner-wrapper")
			.setAttribute("style", `--banner-extra: ${Math.abs(scrollTop)}px;`);
	}

	const elBox = document.querySelector(".banner-wrapper").scrollHeight;
	const elPos = elBox - scrollTop;
	if (elPos > 100) {
		document.querySelector(".top-content").classList.remove("show-status");
	} else {
		document.querySelector(".top-content").classList.add("show-status");
	}
});
