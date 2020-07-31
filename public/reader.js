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
	}, 1e3);
}

// Find html and pages so that we can add scroll listeners for both
document.addEventListener("scroll", updateScrollDebounce);
document.querySelector(".pages").addEventListener("scroll", updateScrollDebounce);
setInterval(updatePages, 500);


function updatePages() {
	let pageCount = document.querySelectorAll(".pageImg").length;

	// Check if the reader is horizontal or not
	let isHorizontal = readerIsHorizontal();
	
	// Get offset for pages
	let direction = isHorizontal ? "left" : "top";
	let elementOffsets = [...document.querySelectorAll(".pageImg")].map(d => ({
		offset: d.getBoundingClientRect()[direction],
		el: d
	})).filter(v => v.offset < 0).sort((a, b) => a.offset - b.offset);
	
	let closestPage = elementOffsets.pop()?.el;
	
	let currentPage = closestPage ? [...document.querySelectorAll(".pageImg")].indexOf(closestPage) + 1 : 1;

	document.querySelector(".chapterNavigation span.current").innerText = `${currentPage} of ${pageCount}`;
}
updatePages();

function readerIsHorizontal() {
	// Returns if the images are vertical or not
	let leftPositions = [...document.querySelectorAll(".pageImg")].map(d => d.getBoundingClientRect().left);
	return [...new Set(leftPositions)].length !== 1;
}