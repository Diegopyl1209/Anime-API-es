import express = require("express");
import popularAnimesRouter from "./routes/popularAnimes.routes";
import getAnimebymalidRouter from "./routes/getAnimebymalid.routes";


const app = express();
app.use(express.json());
app.use("/api/v1/",popularAnimesRouter);
app.use("/api/v1/",getAnimebymalidRouter);

export default app;