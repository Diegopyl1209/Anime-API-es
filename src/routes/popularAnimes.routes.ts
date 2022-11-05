import ScraperResolver from '../scrapers/index';
import { Router } from 'express';
import { pool } from "../db";

const router = Router();

router.get('/popularAnimes', async (req, res) => {
    let response = await pool.query("SELECT id,animeObject FROM popularAnimes")
    res.send(response[0])
});

export default router;