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
	link.addEventListener("click", evt => {
		
		// Clean up
		document.querySelectorAll("a.chapter.badge-background").forEach(a => a.classList.remove("badge-background"));
		
		// Add class
		let select = link.querySelector(".select");
		if(!evt.composedPath().includes(select) && !document.querySelector(".chapter .select .is-selected")) {
			link.classList.add("clicked", "badge-background");
		}
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

// Add event listener for click
// document.querySelectorAll(".quick-select .settings-toggle").forEach(settings => {
	
// 	settings.addEventListener("click", () => {
// 		// See if details is open or not
// 		let isOpen = settings.getAttribute("open") === null;
		
// 		// Remove or add class to wrapper based on that
// 		let classFunction = isOpen ? "add" : "remove";
// 		settings.closest(".quick-select").classList[classFunction]("settings-is-open");
// 	});

// });