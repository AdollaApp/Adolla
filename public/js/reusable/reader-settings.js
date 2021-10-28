// Settings
const defaultSettings = {
	"reader-direction": "horizontal",
	"vertical-image-size": "auto",
	"vertical-gap": "no",
	"back-location": "bottom-left",
	"do-toggle-alt": "no",
	"show-info-badge": "yes",
	"show-camera-button": "no",
	"enable-keyboard-controls": "no",
	"double-pages": "no",
	"image-scaling": "width",
	"tap-navigation": "yes",
};

// Get current settings
function getSettings() {
	// Verify stored settings
	if (!localStorage.getItem("settings"))
		localStorage.setItem("settings", JSON.stringify(defaultSettings));

	// Add defaultSettings as default values in case LS is missing some
	let settings = {
		...defaultSettings,
		...JSON.parse(localStorage.getItem("settings")),
	};
	return settings;
}

// Update settings
function initSettings() {
	// Add event listeners for settings (boxes specifically)
	document.querySelectorAll(".setting-box").forEach((box) => {
		box.addEventListener("click", () => {
			let setting = box.closest("[data-setting]").dataset.setting;
			let value = box.dataset.value;
			setSetting(setting, value).then(updateSettings);
		});
	});
	document
		.querySelectorAll(".setting-wrapper.toggle:not(.ignore)")
		.forEach((wrapper) => {
			let input = wrapper.querySelector(`input[type="checkbox"]`);
			input.addEventListener("change", () => {
				setSetting(wrapper.dataset.setting, input.dataset[input.checked]).then(
					updateSettings
				);
			});
		});

	updateSettings();
}

// Apply settings to DOM so CSS can be adjusted
function applySettings() {
	let settings = getSettings();
	for (let key of Object.keys(settings)) {
		document.querySelectorAll(".pages").forEach((pages) => {
			pages.setAttribute(`data-${key}`, settings[key]);
			document.body.setAttribute(`data-reader-${key}`, settings[key]);
		});
	}

	// Update "double pages" for the images
	if (typeof updateDoublePages !== "undefined") updateDoublePages();
}

// Update switches, boxes, etc.
function updateSettings() {
	let settings = getSettings();
	let currentPage;
	if (typeof getPageProgress !== "undefined") {
		currentPage = getPageProgress()[0];
	}

	updateSettingBoxes(settings);
	updateSettingToggles(settings);
	applySettings();

	if (currentPage) {
		const pageEl = document.querySelector(`[data-i="${currentPage}"]`);
		if (pageEl) pageEl.scrollIntoView();
	}
}

// Update setting boxes in sidebar
function updateSettingBoxes(settings) {
	// Clean selected classes
	document
		.querySelectorAll(".setting-box.selected")
		.forEach((box) => box.classList.remove("selected"));

	// Find every key and add selected class
	for (let settingKey of Object.keys(settings)) {
		document
			.querySelectorAll(
				`.setting-wrapper[data-setting="${settingKey}"] .setting-box[data-value="${settings[settingKey]}"]`
			)
			.forEach((el) => {
				el.classList.add("selected");
			});
	}
}

// Update setting toggles in sidebar
function updateSettingToggles(settings) {
	// Find every key and add selected class
	for (let settingKey of Object.keys(settings)) {
		document
			.querySelectorAll(
				`.setting-wrapper.toggle[data-setting="${settingKey}"]:not(.ignore) .switch`
			)
			.forEach((input) => {
				input.checked = input.dataset.true === settings[settingKey];
			});
	}
}

// Set setting
async function setSetting(key, value) {
	let settings = getSettings();
	settings[key] = value;
	localStorage.setItem("settings", JSON.stringify(settings));
}

initSettings();
