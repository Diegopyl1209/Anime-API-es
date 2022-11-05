import { createPool } from "mysql2/promise";
import { MYSQL_HOST, MYSQL_PORT, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_USER } from "./config";

export const pool = createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    port: MYSQL_PORT,
    database: MYSQL_DATABASE,
});

export async function clearPopularAnimesTable() {
    await pool.query("DELETE FROM popularAnimes");
}