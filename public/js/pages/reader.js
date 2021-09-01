// This JS file is only for the reader.
// If this is run, it's fair to assume
// that this is the reader page

// Load state
let loaded = false;

document.querySelector(".manga-reader .loading").scrollIntoView({
	inline: "start",
	block: "start",
});

// This is a debounce effect for the page update
let scrollDebounce;
function updateScrollDebounce() {
	if (scrollDebounce) {
		clearTimeout(scrollDebounce);
		delete scrollDebounce;
	}
	scrollDebounce = setTimeout(() => {
		if (!loaded) return;
		// Send POST request to update "reading" state
		let [currentPage, pageCount] = getPageProgress();

		let pathname = location.pathname;
		if (!pathname.endsWith("/")) pathname += "/";

		fetch(pathname + "set-progress", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				current: currentPage,
				total: pageCount,
			}),
		});
	}, 500);
}

// Find html and pages so that we can add scroll listeners for both
document.addEventListener("scroll", updateScrollDebounce);
document
	.querySelector(".pages")
	.addEventListener("scroll", updateScrollDebounce);
setInterval(updatePages, 500);

function updatePages() {
	let [currentPage, pageCount] = getPageProgress();

	if (loaded) document.body.setAttribute("data-to-page", currentPage);

	let toPage = Number(document.body.getAttribute("data-to-page")) || 0;
	let pageCountDom =
		Number(document.body.getAttribute("data-page-count")) || toPage + 1;
	document.querySelectorAll(".current-page").forEach((span) => {
		span.innerText = `${
			loaded ? currentPage : toPage !== "false" ? toPage : 0
		} of ${
			pageCount ? pageCount : pageCountDom !== "false" ? pageCountDom : 0
		}`;
	});
}
updatePages();

// Get page progress
function getPageProgress() {
	let pageCount = document.querySelectorAll(".pageImg").length;

	// Check if the reader is horizontal or not
	let isHorizontal = readerIsHorizontal();

	// Get offset for pages
	let direction = isHorizontal ? "left" : "bottom";
	let wrapperOffset = isHorizontal
		? document.querySelector(".pages").getBoundingClientRect()[direction]
		: window.innerHeight;
	let elementOffsets = [...document.querySelectorAll(".pageImg")]
		.map((d) => ({
			offset: Math.abs(d.getBoundingClientRect()[direction] - wrapperOffset),
			el: d,
		}))
		.sort((a, b) => a.offset - b.offset);

	let closestPage = elementOffsets[0]?.el;

	let currentPage = closestPage
		? [...document.querySelectorAll(".pageImg")].indexOf(closestPage) + 1
		: 1;
	return [currentPage, pageCount];
}

function readerIsHorizontal() {
	// Returns if the images are vertical or not
	return getSettings()["reader-direction"] === "horizontal";
}

// Scroll to page
function scrollToPage() {
	let page = Number(document.body.dataset.toPage) || 1;
	console.info("Scroll to page", page);
	if (page) {
		// Get relevant element and scroll to it
		let pageEl = document.querySelectorAll(".pageImg")[page - 1];
		if (!pageEl) return null;
		scrollReader(pageEl);
	}
}
function scrollReader(pageEl) {
	let topOffset = document.querySelector(".mobile-nav").scrollHeight;

	pageEl.scrollIntoView({
		inline: "start",
		block: "start",
	});
	if (!readerIsHorizontal()) {
		window.scrollBy(0, -topOffset);
		// Deal with iOS padding
	}
}

// Add click event to floating button
document.querySelectorAll(".floating-button").forEach((button) => {
	button.addEventListener("click", () => {
		button.classList.add("clicked", "badge-background");
	});
});

// Keyboard controls
document.addEventListener("keydown", (evt) => {
	if (
		!evt.key.startsWith("Arrow") ||
		getSettings()["enable-keyboard-controls"] === "no"
	)
		return;
	evt.preventDefault();

	let isHorizontal = readerIsHorizontal();

	function nextPage() {
		let [currentPage, pageCount] = getPageProgress();
		let pageEl = document.querySelectorAll(".pageImg")[currentPage];
		if (pageEl) scrollReader(pageEl);
	}
	function previousPage() {
		let [currentPage, pageCount] = getPageProgress();
		let pageEl = document.querySelectorAll(".pageImg")[currentPage - 2];
		if (pageEl) scrollReader(pageEl);
	}
	function nextChapter() {
		document.querySelector(".next .chapterLink").click();
	}
	function previousChapter() {
		document.querySelector(".previous .chapterLink").click();
	}

	switch (evt.key) {
		case "ArrowLeft":
			isHorizontal ? previousPage() : previousChapter();
			break;
		case "ArrowRight":
			isHorizontal ? nextPage() : nextChapter();
			break;
		case "ArrowUp":
			isHorizontal ? previousChapter() : previousPage();
			break;
		case "ArrowDown":
			isHorizontal ? nextChapter() : nextPage();
			break;
		default:
			alert("Unknown");
	}
});

// "Tap to toggle" elements
document.querySelectorAll(".pages, .loading").forEach((el) => {
	el.addEventListener("click", (evt) => {
		// Get all classes for each element in the path
		let classes = [...evt.composedPath()]
			.reverse()
			.map((v) => Object.values(v.classList ?? {}).join("."))
			.map((v) => (v.length > 0 ? "." + v : v))
			.join(" ")
			.trim();

		// If no button was pressed, toggle each relevant class
		if (!classes.includes(".secondary-button"))
			document
				.querySelectorAll(".toggle-on-tap, .toggle-class-on-tap")
				.forEach((toggle) => toggle.classList.toggle("tapped"));
	});
});

// Generate error for failed images
let failedImages = [];
let errorDebounce;
document.querySelectorAll(".pageImg").forEach((img) => {
	img.addEventListener("error", (evt) => {
		failedImages.push(img.getAttribute("alt"));
		img.classList.add("hidden");

		if (errorDebounce) {
			clearTimeout(errorDebounce);
			delete errorDebounce;
		}
		errorDebounce = setTimeout(() => {
			// alert(`The images for ${failedImages.sort((a,b) => a.split(" ").pop() - b.split(" ").pop()).join(", ")} ${failedImages.length === 1 ? "has" : "have"} failed to load.`);
			alert(
				`The images for ${failedImages.length} ${
					failedImages.length === 1 ? "page has" : "pages have"
				} failed to load.`
			);
			failedImages = [];
		}, 600);
	});
});

async function initImages() {
	// Function to set innerHTML
	function setLoadingText(text) {
		document.querySelectorAll(".current-loading-progress").forEach((el) => {
			el.innerText = text;
		});
	}

	try {
		// Fetch array of URLs
		let imageUrls = await getImageUrls(location.href);

		// Add elements to DOM
		let wrapper = document.querySelector(".pages");
		for (let [i, url] of Object.entries(imageUrls.reverse())) {
			// Generate node
			let img = document.createElement("img");
			img.classList.add("pageImg");
			img.setAttribute("alt", `Page ${Number(i) + 1}`);
			img.setAttribute("data-i", i);

			// Set source
			img.src = `/proxy-image?url=${encodeURIComponent(url)}&referer=${
				location.href.includes("mangasee")
					? "mangasee"
					: location.href.includes("manganelo")
					? "manganelo"
					: "null"
			}`;

			// Add to DOM
			wrapper.insertBefore(img, wrapper.querySelector("*"));
		}

		// Wait for all images to load
		let loadedCount = 0;
		let toLoadImages = [...wrapper.querySelectorAll(".pageImg")];

		// Load for each one
		await Promise.all(
			toLoadImages.map((img) => {
				return new Promise((resolve, reject) => {
					img.addEventListener("load", () => {
						loadedCount++;
						let percentageText =
							Math.round((loadedCount / toLoadImages.length) * 100)
								.toString()
								.padStart(2, "0") + "%";
						setLoadingText(percentageText);
						resolve();
					});
					img.addEventListener("error", reject);
				});
			})
		);

		// Update doublePages
		updateDoublePages();

		// Remove loading text
		setLoadingText("");

		// Update loading section in DOM
		document.querySelector(".manga-reader").classList.add("loaded");

		// Check whether to scroll to page yet, or not
		let img = document.querySelector(".pageImg");
		let checkInterval = setInterval(() => {
			if (img.scrollHeight > 0) {
				clearInterval(checkInterval);
				scrollToPage();
				loaded = true;
			}
		}, 50);
	} catch (err) {
		console.error(err);
		loaded = true;
		document.querySelector(".manga-reader").classList.add("loaded");
		setLoadingText("Error");
	}

	// Pre-load other image urls
	const curChapterAnchor = document.querySelector(".current-chapter");
	const children = [...curChapterAnchor.parentNode.children];
	const chapIndex = children.indexOf(curChapterAnchor);
	const preloadableChapters = children.slice(chapIndex, chapIndex + 5);
	for (let anchor of preloadableChapters) {
		getImageUrls(anchor.href);
	}
}
initImages();

async function getImageUrls(loc = location.href) {
	// Prepare storage
	let key = "image-cache";
	if (!localStorage.getItem(key)) localStorage.setItem(key, "{}");
	let cache = JSON.parse(localStorage.getItem(key));

	// Generate URL endpoint
	if (!loc.endsWith("/")) loc += "/";
	let url = `${loc.split(location.host)[1]}get-images/`;

	// Remove old items
	for (let url of Object.keys(cache)) {
		if (cache[url] && cache[url].at < Date.now() - 1e3 * 60 * 60) {
			delete cache[url];
		}
	}

	// Check cache
	if (cache[url]) return cache[url].images;

	// Get data
	let urls = await (await fetch(url)).json();

	// Store in cache
	cache = JSON.parse(localStorage.getItem(key));
	cache[url] = {
		at: Date.now(),
		images: urls,
	};

	// It might overflow
	try {
		localStorage.setItem(key, JSON.stringify(cache));
	} catch (err) {
		// Nothing at all. Lol.
	}

	// Return data
	return urls;
}

// Camera mode
let cameraInterval;
let onScreenImages = [];
document.querySelectorAll(".is-camera-button").forEach((btn) => {
	btn.addEventListener("click", () => {
		document.body.classList.add("is-camera-mode");

		if (cameraInterval) {
			clearInterval(cameraInterval);
		}

		onScreenImages = [];
		cameraInterval = setInterval(() => {
			let images = document.querySelectorAll(".pageImg");
			for (let image of images) {
				if (isOnScreen(image) && !onScreenImages.includes(image)) {
					onScreenImages.push(image);
				}
			}
		}, 500);

		setTimeout(() => {
			let f = (evt) => {
				evt.currentTarget.removeEventListener("click", f);

				document.body.classList.remove("is-camera-mode");
				clearInterval(cameraInterval);

				// Get image URLs for every image that was on screen
				let imgs = [
					...onScreenImages[0].closest(".pages").querySelectorAll("img"),
				];
				let images = onScreenImages.sort(
					(a, b) => imgs.indexOf(a) - imgs.indexOf(b)
				);
				showBigImage(images);
			};
			document.body.addEventListener("click", f);
		}, 1e3);
	});
});

let fileToShare;

/**
 * Get base64 URL for really big image
 * Images is an array of image element
 */
async function showBigImage(images) {
	let canvas = document.createElement("canvas");
	let ctx = canvas.getContext("2d");
	canvas.width = images[0].naturalWidth;

	let heightSum = images.reduce((acc, img) => acc + img.naturalHeight, 0);
	canvas.height = heightSum;

	let imgs = await Promise.all(
		images.map((img) => {
			return new Promise(async (resolve) => {
				let newImage;
				if (!img.src.startsWith("data:image")) {
					newImage = new Image();

					let blob = await fetch(img.src)
						.then((r) => r.blob())
						.then((blob) => URL.createObjectURL(blob));
					newImage.src = blob;
					setTimeout(() => {
						resolve(newImage);
					}, 1e3);
				} else {
					resolve(img);
				}
			});
		})
	);

	let y = 0;
	for (let img of imgs) {
		ctx.drawImage(img, 0, y);
		y += img.naturalHeight;
	}

	let url = canvas.toDataURL();

	let div = document.createElement("div");
	div.classList.add("img-share");

	let a = document.createElement("a");
	a.href = url;
	a.setAttribute("download", "screenshot.png");
	a.innerHTML = `<img class="to-share" src="${url}">`;

	div.appendChild(a);

	div.addEventListener("click", () => {
		div.remove();
	});

	document.body.appendChild(div);
}
function isOnScreen(el) {
	// See if element is visible on screen
	const rect = el.getBoundingClientRect();
	const viewHeight = Math.max(
		document.documentElement.clientHeight,
		window.innerHeight
	);
	const viewWidth = Math.max(
		document.documentElement.clientWidth,
		window.innerWidth
	);
	return !(
		rect.bottom < 0 ||
		rect.top - viewHeight >= 0 ||
		rect.right < 0 ||
		rect.left - viewWidth >= 0
	);
}

function updateDoublePages() {
	const wrapper = document.querySelector(".pages");

	// Get all images
	const allImages = [...document.querySelectorAll(".pageImg")].sort((a, b) => {
		return b.getAttribute("data-i") - a.getAttribute("data-i");
	});

	// Remove left-overs
	document.querySelectorAll(".page-container").forEach((div) => div.remove());

	// Iniate some other variables
	const newImageSequences = [];
	const settings = getSettings();
	const doDouble =
		settings["double-pages"] === "yes" &&
		settings["reader-direction"] === "horizontal" &&
		window.innerWidth > window.innerHeight;

	if (doDouble) {
		newImageSequences.unshift([null]);
	}

	// Sort all images into the sequence
	for (const img of allImages) {
		if (img.naturalHeight > img.naturalWidth && doDouble) {
			// Vertical images...
			if (newImageSequences[0].length < 2) {
				newImageSequences[0].unshift(img);
			} else {
				newImageSequences.unshift([img]);
			}
		} else {
			newImageSequences.unshift([img, null]);
		}
		img.remove();
	}

	// Add all sequences to the DOM
	for (const seq of newImageSequences) {
		const div = document.createElement("div");
		div.classList.add("page-container");

		for (let imgEl of seq) {
			if (imgEl) div.appendChild(imgEl);
		}

		// Add to DOM
		wrapper.insertBefore(div, wrapper.querySelector("*"));
	}
}

let resizeDebounceDouble = null;

window.addEventListener("resize", () => {
	if (resizeDebounceDouble) {
		clearTimeout(resizeDebounceDouble);
	}
	resizeDebounceDouble = setTimeout(() => {
		updateDoublePages();
	}, 100);
});
