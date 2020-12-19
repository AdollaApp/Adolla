// Import used modules
import fs from "fs";

// Import and export data
const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));
fs.writeFileSync("data-formatted.json", JSON.stringify(data, null, "\t"));

// OK lol
console.info("OK");
