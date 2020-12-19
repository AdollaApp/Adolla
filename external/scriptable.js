// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: portrait;

// Has to be a public URL, no trailing slash
const ROOT_URL = `https://adolla-instace-url.com`;

// Get `continue reading` items
let continueReading = await getReading();
let firstReading = continueReading[0];
log(continueReading);

// Widget config
let widget = await createWidget(firstReading);

if (!config.runsInWidget) {
	// await widget.presentMedium();
	Safari.open(ROOT_URL + firstReading.href);
}

Script.setWidget(widget);
Script.complete();

async function getReading() {
	// Fetch data
	let url = ROOT_URL;
	let req = new Request(url);
	let body = await req.loadString();

	// Extract data from HTML
	let entriesHTML = body.split(
		/<div class="manga-grid show-all-wrapper do-show-all">/
	)[1];
	entriesHTML = entriesHTML.split(
		/<button class="show-all">Show <span class="more-count"><\/span> more<\/button>/
	)[0];

	// Now get card data
	let cardsHTML = entriesHTML
		.split(/<div class="manga-card">/)
		.filter((s) => s.trim().length > 0);
	let cards = [];
	for (let cardHTML of cardsHTML) {
		// Get link to item
		let href = cardHTML.split(`href="`)[1].split(`"`)[0].trim();

		// Get poster URL
		let poster = cardHTML
			.split(`background-image: url\('`)[1]
			.split(`'`)[0]
			.trim();

		// Get title
		let title = cardHTML
			.split(`<h2 class="title-small">`)[1]
			.split("</h2>")[0]
			.trim();

		// Get "next" chapter title
		let chapterTitle = cardHTML
			.split(`<div class="poster-text">`)[1]
			.split("</div>")[0]
			.trim();

		// Get provider
		let provider = href.split("/").filter(Boolean)[0];
		provider = provider.slice(0, 1).toUpperCase() + provider.slice(1);

		cards.push({
			href,
			poster,
			title,
			chapterTitle,
			provider,
		});
	}

	return cards;
}

async function createWidget(item) {
	log(item);
	let widget = new ListWidget();

	// Poster
	log(item.poster);
	if (item.poster != null) {
		let imgReq = new Request(item.poster);
		let img = await imgReq.loadImage();
		widget.backgroundImage = img;
	}

	// Bg colors
	widget.backgroundColor = new Color("#4babce");
	let gradient = new LinearGradient();
	gradient.locations = [0, 1];
	gradient.colors = [new Color("#4babcec4"), new Color("#4babce88")];
	widget.backgroundGradient = gradient;

	// Content
	widget.addSpacer();

	// Provider subtitle
	let subtitleText = widget.addText(item.provider);
	subtitleText.font = Font.boldSystemFont(16);
	subtitleText.textColor = new Color("#c7f0ff");

	// Manga title
	let titleText = widget.addText(item.title);
	titleText.font = Font.boldSystemFont(24);
	titleText.textColor = Color.white();

	// Spacer
	widget.addSpacer(8);

	// Chapter title
	let chapterText = widget.addText(item.chapterTitle);
	chapterText.font = Font.boldSystemFont(14);
	chapterText.textColor = Color.white();

	// End of content
	widget.addSpacer();

	return widget;
}
