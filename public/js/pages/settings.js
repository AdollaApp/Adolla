// JavaScript for the app-wide settings page.
// This page has the settins for "icon"

document
	.querySelectorAll(".icon-option:not(.is-current-icon)")
	.forEach((iconWrapper) => {
		// Add "click" event listener to icon wrapper to send a POST request in order to update the icon of choice

		iconWrapper.addEventListener("click", () => {
			let name = iconWrapper.querySelector(".text").textContent;

			let endpoint = location.href;
			if (!endpoint.endsWith("/")) endpoint += "/";
			fetch(`${endpoint}set-icon`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					name,
				}),
			})
				.then((d) => d.json())
				.then((d) => {
					if (d.status === 200) {
						location.reload();
					} else {
						alert(d.error);
					}
				});
		});
	});

// App-wide settings toggles
// Currently that's just the NSFW filter
document.querySelectorAll(".app-wide-settings .switch").forEach((switchEl) => {
	switchEl.addEventListener("click", () => {
		let showNsfwInput = document.querySelector(
			`[data-setting="show-nsfw"] input`
		);
		let storeNsfwInput = document.querySelector(
			`[data-setting="store-nsfw"] input`
		);

		fetch("/settings/set-app-settings", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				"show-nsfw": showNsfwInput.getAttribute(
					`data-${showNsfwInput.checked}`
				),
				"store-nsfw": storeNsfwInput.getAttribute(
					`data-${storeNsfwInput.checked}`
				),
			}),
		});
	});
});
