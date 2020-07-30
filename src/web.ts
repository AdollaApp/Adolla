import express from "express";
import handlebars from "express-handlebars"
import routers from "./routers"

const app = express();

// Set up view engine
app.engine("handlebars", handlebars({
	helpers: {
		stringify: v => JSON.stringify(v)
	}
}));
app.set("view engine", "handlebars");
app.set("view options", {
	layout: "main"
});

// Routers
app.use("/", routers.home);
app.use("/search", routers.search);

// Static assets
app.use(express.static("public"));

// More routers
app.use("/", routers.mangaPage);


export default app;