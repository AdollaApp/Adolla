import db from "./db";

db.set("reading.test.a", 1);

let x = db.get("reading.test.a");
console.log(x);