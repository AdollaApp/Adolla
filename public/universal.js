// Search
document.querySelector("#search").addEventListener("change", event => {
	let query = event.currentTarget.value.trim();
	if(query && query.length > 0) {
		location.href = `/search/?q=${encodeURIComponent(query)}`;
	}
});

// Chapter quick select
document.querySelectorAll(".toggle-quick-select").forEach(div => {
	div.addEventListener("click", evt => {
		if(!evt.composedPath().includes(document.querySelector(".quick-select"))) {
			document.querySelector("html").classList.toggle("overlay-visible")
			document.querySelector(".quick-select-wrapper").classList.toggle("visible")
		};
	})
});

// Add class to chapterlink when clicked
document.querySelectorAll(".chapterLink").forEach(link => {
	link.addEventListener("click", () => {
		link.classList.add("clicked", "badge-background");
	});
});


// Chapter quick select scroll
// document.querySelectorAll(".scroll").forEach(wrapper => {
// 	updateScroll(wrapper);
// 	wrapper.addEventListener("scroll", () => {
// 		updateScroll(wrapper);
// 	});
// });

// function updateScroll(wrapper) {
// 	let wrapperTop = wrapper.getBoundingClientRect().top;
// 	wrapper.querySelectorAll(".chapter").forEach(div => {
// 		let top = (div.getBoundingClientRect().top - wrapperTop);
// 		let middleOffset = (top - wrapper.offsetHeight / 2) + (div.scrollHeight /2);
// 		div.style.opacity = 1 - Math.abs(middleOffset / 160);
// 	});
// }