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
			document.querySelector(".quick-select-wrapper").classList.toggle("visible");
			document.querySelector(".quick-select-wrapper .scroll .current-chapter").scrollIntoView({
				block: "center"
			});
		};
	})
});

// Add class to chapterlink when clicked
document.querySelectorAll(".chapterLink, a.chapter").forEach(link => {
	link.addEventListener("click", () => {
		link.classList.add("clicked", "badge-background");
	});
});