
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
	document.querySelectorAll(".chapter").forEach(chapter => {

		let select = chapter.querySelector(".select");

		chapter.addEventListener("click", evt => {
			if(evt.composedPath().includes(select)) {
				evt.preventDefault();
				
				select.querySelector("svg").classList.toggle("is-selected");
				select.querySelector("svg").classList.toggle("badge-background");
			}
		});
	});
}
initSelection();
