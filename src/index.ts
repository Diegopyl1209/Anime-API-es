import ScraperResolver from "./scrapers/index";
import app from "./app";
import { PORT } from "./config";


app.listen(PORT, () => {
    console.log("Server running on port " +  PORT);
});

ScraperResolver.updatePopularAnimes();
setInterval(async () => {
    await ScraperResolver.updatePopularAnimes();
}, 1000 * 60 * 60 * 24);
