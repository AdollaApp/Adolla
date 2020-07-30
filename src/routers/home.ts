
import express from "express";
const router = express.Router();

import db from "../db";

router.get("/", (req, res) => {
	res.render("home");
});

export default router;