import express from "express";
const router = express.Router();

import getReading from "../util/getReading";

router.get("/", async (req, res) => {
	const reading = await getReading();

	res.render("not-found", {
		reading,
	});
});

export default router;
