import express from "express";
const router = express.Router();

import getReading from "../util/getReading";

router.get("/", async (req, res) => {
	const reading = await getReading();

	let message =
		"This page could not be found. If this is an issue, do report it.";

	if (req.query.t === "captcha") {
		message =
			"This source is making Adolla take a captcha, but since it is a robot, it can't do that.";
	}

	res.render("not-found", {
		reading,
		message,
	});
});

export default router;
