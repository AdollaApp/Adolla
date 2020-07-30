// Search
document.querySelector("#search").addEventListener("change", event => {
	let query = event.currentTarget.value.trim();
	if(query && query.length > 0) {
		location.href = `/search/?q=${encodeURIComponent(query)}`;
	}
});