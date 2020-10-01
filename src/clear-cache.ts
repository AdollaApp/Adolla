import fs from "fs";

let data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
data.data_cache = {}

fs.writeFileSync("data.json", JSON.stringify(data, null, "  "));

console.info("Cleared");