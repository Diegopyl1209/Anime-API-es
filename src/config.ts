import {config} from "dotenv";

config();

const PORT = process.env.PORT || 3000;
const MYSQL_HOST = process.env.MYSQL_HOST || "localhost";
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "";
const MYSQL_PORT = process.env.MYSQL_PORT as unknown as number || 3306;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "animes";

export {MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_PORT, PORT, MYSQL_DATABASE};