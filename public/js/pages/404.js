if (window.history) {
	document.querySelector(".not-found .anchor").addEventListener("click", () => {
		history.back();
	});
} else {
	document.querySelector(".not-found .anchor").remove();
}
