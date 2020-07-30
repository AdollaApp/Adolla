import express from "express";
import handlebars from "express-handlebars"
import routers from "./routers"

const app = express();

// Set up view engine
app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");
app.set("view options", {
	layout: "main"
});

// Routers
app.use("/", routers.home);

// Static assets
app.use(express.static("public"));

export default app;