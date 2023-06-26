import db from "../db";

export const iconNames = {
	"adolla-dark": "Adolla dark",
	"adolla-gold": "Adolla Gold",
	"adolla-blue": "Adolla blue",
	"adolla-pride": "Pride 🏳️‍🌈",
	"adolla-trans": "Trans 🏳️‍⚧️",
	"adolla-primary": "Adolla green",
	"adolla-white": "Adolla no bg",
	"adolla-forest": "Adolla forest",
};
export const iconNamesReversed = Object.fromEntries(
	Object.entries(iconNames).map((v) => v.reverse())
);

/**
 * Get source for app icon
 */
export default function getIconSrc(): string {
	const selectedName = db.get("settings.icon");
	return `/icons/${iconNamesReversed[selectedName] || "adolla-primary"}.png`;
}
