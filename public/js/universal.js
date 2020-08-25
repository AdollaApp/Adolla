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
document.querySelectorAll(".chapterLink, a.chapter:not(.no-badge)").forEach(link => {
	link.addEventListener("click", () => {
		document.querySelectorAll("a.chapter").forEach(a => a.classList.remove("badge-background"));
		link.classList.add("clicked", "badge-background");
	});
});

// Service workers
const sw = true;
if (sw && navigator.onLine) {

	if ('serviceWorker' in navigator) {

		window.addEventListener('load', function () {
			navigator.serviceWorker.register("/sw.js").then(reg => {

			}, err => {
				console.log(err)
			});
		});

	}
} else if (!sw && navigator.onLine) {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.getRegistrations().then(function (registrations) {
			for (var registration of registrations) {
				registration.unregister();
			}
		});
	}
}