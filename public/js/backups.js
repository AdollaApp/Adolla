document.querySelectorAll(".backup button").forEach(btn => {
	btn.addEventListener("click", evt => {
		let file = btn.closest(".backup").dataset.backup;
		let label = btn.closest(".backup").querySelector("span").innerText;
		
		if(confirm(`Restore backup from ${label}? This will override your current progress.`)) {
			let loc = location.href;
			if(!loc.endsWith("/")) loc += "/";
			fetch(`${loc}restore/${file}`)
			  .then(d => d.json())
			  .then(() => {
				  location.reload();
			  });
		}
	});
});