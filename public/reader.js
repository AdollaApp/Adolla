// This JS file is only for the reader.
// If this is run, it's fair to assume
// that this is the reader page

// This is a debounce effect for the page update
let scrollDebounce;
function updateScrollDebounce() {
	if(scrollDebounce) {
		clearTimeout(scrollDebounce);
		delete scrollDebounce;
	}
	scrollDebounce = setTimeout(() => {
		// Send POST request to update "reading" state
		// TODO
		let [currentPage, pageCount] = getPageProgress();
		location.replace(`#${currentPage}`);

		let pathname = location.pathname;
		if(!pathname.endsWith("/")) pathname += "/";
		
		fetch(pathname + "set-progress", {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify({
				current: currentPage,
				total: pageCount
			})
		});
	}, 1e3);
}

// Find html and pages so that we can add scroll listeners for both
document.addEventListener("scroll", updateScrollDebounce);
document.querySelector(".pages").addEventListener("scroll", updateScrollDebounce);
setInterval(updatePages, 500);


function updatePages() {
	
	let [currentPage, pageCount] = getPageProgress();

	document.querySelector(".chapter-navigation span.current").innerText = `${currentPage} of ${pageCount}`;
}
updatePages();

// Get page progress
function getPageProgress() {
	let pageCount = document.querySelectorAll(".pageImg").length;

	// Check if the reader is horizontal or not
	let isHorizontal = readerIsHorizontal();
	
	// Get offset for pages
	let direction = isHorizontal ? "left" : "bottom";
	let wrapperOffset = isHorizontal ? document.querySelector(".pages").getBoundingClientRect()[direction] : window.innerHeight;
	let elementOffsets = [...document.querySelectorAll(".pageImg")].map(d => ({
		offset: Math.abs(d.getBoundingClientRect()[direction] - wrapperOffset),
		el: d
	})).sort((a, b) => a.offset - b.offset);
	
	let closestPage = elementOffsets[0]?.el;
	
	let currentPage = closestPage ? [...document.querySelectorAll(".pageImg")].indexOf(closestPage) + 1 : 1;
	return [currentPage, pageCount];
}

function readerIsHorizontal() {
	// Returns if the images are vertical or not
	let leftPositions = [...document.querySelectorAll(".pageImg")].map(d => d.getBoundingClientRect().left);
	return [...new Set(leftPositions)].length !== 1;
}

// Settings
const defaultSettings = {
	"reader-direction": "horizontal",
	"fit-to-screen": "yes"
};

// Get current settings
function getSettings() {
	// Verify stored settings
	if(!localStorage.getItem("settings")) localStorage.setItem("settings", JSON.stringify(defaultSettings));

	// Add defaultSettings as default values in case LS is missing some
	let settings = {
		...defaultSettings,
		...JSON.parse(localStorage.getItem("settings"))
	};
	return settings;
}

// Update settings
function initSettings() {

	let settings = getSettings();

	// Add event listeners for settings (boxes specifically)
	document.querySelectorAll(".setting-box").forEach(box => {
		box.addEventListener("click", () => {
			let setting = box.closest("[data-setting]").dataset.setting;
			let value = box.dataset.value;
			setSetting(setting, value).then(settings => {
				updateSettings();
			});
		});
	});

	updateSettings();

}

function updateSettings() {
	let settings = getSettings();
	updateSettingBoxes(settings);
	applySettings();
}

// Apply settings to DOM so CSS can be adjusted
function applySettings() {
	let settings = getSettings();
	for(let key of Object.keys(settings)) {
		document.querySelectorAll(".pages").forEach(pages => {
			pages.setAttribute(`data-${key}`, settings[key]);
		});
	}
}

// Update setting boxes in sidebar
function updateSettingBoxes(settings) {
	
	// Clean selected classes
	document.querySelectorAll(".setting-box.selected").forEach(box => box.classList.remove("selected"));

	// Find every key and add selected class
	for(let settingKey of Object.keys(settings)) {
		document.querySelectorAll(`.setting-wrapper[data-setting="${settingKey}"] .setting-box[data-value="${settings[settingKey]}"]`).forEach(el => {
			el.classList.add("selected");
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

// Scroll to page
function scrollToPage() {
	let page = Number(location.hash.slice(1)) || 1;
	console.info("Scroll to page", page);
	if(page) {
		let pageEl = document.querySelectorAll(".pageImg")[page - 1];
		if(!pageEl) return null;
		scrollReader(pageEl);
	}
}
function scrollReader(pageEl) {
	pageEl.scrollIntoView(true);
}

window.addEventListener("load", () => {
	setTimeout(() => {
		scrollToPage();
	}, 100);
});