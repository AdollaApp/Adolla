import fs from "fs";

let data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
data.manga_cache = {}

fs.writeFileSync("data.json", JSON.stringify(data, null, "  "));

console.log("Cleared");