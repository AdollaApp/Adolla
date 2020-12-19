// Add event listener to each search input on search page
// We want to keep the values the same for both

document.querySelectorAll(".search-input").forEach((input) => {
	input.addEventListener("input", () => {
		let v = input.value;
		for (let inp of document.querySelectorAll(".search-input")) {
			if (inp !== input) inp.value = v;
		}
	});
});
