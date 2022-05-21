import db from "../db";

export const iconNames = {
	"main-on-white": "White",
	"white-on-gold": "Gold",
	"white-on-blue": "Ocean",
	"white-on-dark": "Night",
	"white-on-green": "Forest",
	"white-on-red": "Crimson",
	"white-on-black": "Black",
	"rainbow-on-dark": "Dark rainbow",
	"rainbow-on-white": "Light rainbow",
};
export const iconNamesReversed = Object.fromEntries(
	Object.entries(iconNames).map((v) => v.reverse())
);

/**
 * Get source for app icon
 */
export default function getIconSrc(): string {
	const selectedName = db.get("settings.icon");
	return `/icons/${iconNamesReversed[selectedName] || "main-on-white"}.png`;
}
