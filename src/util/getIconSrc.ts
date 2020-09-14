
import db from "../db";

export const iconNames = {
	"main-on-white": "White",
	"white-on-blue": "Ocean",
	"white-on-dark": "Night",
	"white-on-green": "Forest",
	"white-on-red": "Crimson"
}
// @ts-ignore TS still doesn't have FromEntires :/
export const iconNamesReversed = Object.fromEntries(Object.entries(iconNames).map(v => v.reverse()));

export default function getIconSrc() {
	let selectedName = db.get("settings.icon");
	return `/icons/${iconNamesReversed[selectedName] || "main-on-white"}.png`
}