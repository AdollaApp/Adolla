
let selectionMode = false;
let disableNextClick = true;

/**
 * THIS IS THE SORTING SECTION
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

	// initChapterTouch();

}
updateSorting();

/**
 * THIS IS THE "MARK AS" SECTION
 */

function initChapterTouch() {
	document.querySelectorAll(".chapter").forEach(chapter => {
		
		// Basic touch events (for holding)

		  // Start of that
		chapter.addEventListener("touchstart", chapterTouchStart);
		chapter.addEventListener("mousedown", chapterTouchStart);
		  // End of that
		chapter.addEventListener("touchend", chapterTouchEnd);
		chapter.addEventListener("mouseup", chapterTouchEnd);
	
		// Prevent clicks if selection mode is enabled
		chapter.addEventListener("click", evt => {
			
			if(!selectionMode) return;

			evt.preventDefault();

			if(disableNextClick) {
				disableNextClick = false;
				return;	
			}
			toggleSelection(chapter);

		});
		
	});
}
initChapterTouch();

let touchTimeout = null;

function chapterTouchStart(evt) {
	touchTimeout = setTimeout(() => {
		let el = evt.target.closest(".chapter");
		enableSelection(el, true);
	}, 800);
}
function chapterTouchEnd() {
	console.log("Cleared");
	clearTimeout(touchTimeout);
	touchTimeout = null;
}

/**
 * Start selection mode
 * When this is enabled, tapping a chapter makes it so it's selected, not opened
 * This mode should also add the "mark as" header.
 */
function enableSelection(el, setDisableNext = false) {
	selectionMode = true;
	disableNextClick = setDisableNext;
	toggleSelection(el);

	// Add class to body for relevant styles
	document.body.classList.add("is-selection-mode");
}

function toggleSelection(el) {
	el.classList.toggle("mark-selected");
	if(!document.querySelector(".mark-selected")) {
		// There are no selected chapters remaining. 
		// This means we should disable selection mode
		disableSelection();
	}
	clearSelection();
}

function disableSelection() {
	setTimeout(() => {
		selectionMode = false;
	}, 300);
	document.body.classList.remove("is-selection-mode");
}



function clearSelection() {
	if (window.getSelection) {
		window.getSelection().removeAllRanges();
	} else if (document.selection) {
		document.selection.empty();
	}
}