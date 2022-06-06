function doCheck() {
	document.querySelectorAll(".show-all-wrapper").forEach((wrapper) => {
		// Check row count in element. If there's more than 3 rows, hide everything after every row after the third row.

		// Get all manga children
		let kids = [...wrapper.children].filter((el) => el.nodeName !== "BUTTON");

		// Clean up
		for (let div of kids) {
			div.classList.remove("do-hide");
		}

		// Get offsets with elements
		let offsets = kids.map((el) => ({
			el,
			top: el.getBoundingClientRect().top,
		}));

		let rowOffsets = [...new Set(offsets.map((v) => v.top))];

		// Get array of elements per row. Don't ask.
		let rows = [];
		for (let offsetWrapper of offsets) {
			if (!rows[rowOffsets.indexOf(offsetWrapper.top)])
				rows[rowOffsets.indexOf(offsetWrapper.top)] = [];
			rows[rowOffsets.indexOf(offsetWrapper.top)].push(offsetWrapper.el);
		}

		// Hide children after third row
		let toHide = rows.slice(3).flat();

		if (toHide.length > 0) {
			wrapper.classList.remove("do-show-all");
		} else {
			wrapper.classList.add("do-show-all");
		}

		for (let el of toHide) {
			el.classList.add("do-hide");
		}

		wrapper
			.querySelectorAll(".more-count")
			.forEach((el) => (el.innerText = toHide.length));
	});
}

// Add event listener for "read more"
document.querySelectorAll("button.show-all").forEach((btn) => {
	btn.addEventListener("click", () => {
		btn.closest(".show-all-wrapper").classList.add("force-show");
	});
});

// Run main row check
doCheck();

let resizeDebounce;
window.addEventListener("resize", () => {
	if (resizeDebounce) {
		clearTimeout(resizeDebounce);
		resizeDebounce = null;
	}
	resizeDebounce = setTimeout(doCheck, 1e3 / 60);
});

document.querySelectorAll(".list-type-option").forEach((el) => {
	el.addEventListener("click", () => {
		requestAnimationFrame(doCheck);
	});
});

document.querySelectorAll(".remove-announcement").forEach((button) => {
	button.addEventListener("click", () => {
		fetch("/dismiss-announcement", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				id: Number(button.closest("[data-id]").getAttribute("data-id")),
			}),
		})
			.then((d) => d.json())
			.then((d) => {
				if (d.status !== 200) {
					alert(d.error);
				} else {
					location.reload();
				}
			});
	});
});
