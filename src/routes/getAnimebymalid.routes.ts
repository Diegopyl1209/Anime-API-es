import { Router } from 'express';
import ScraperResolver from '../scrapers/index';


const router = Router();

router.post("/animebymalid/", async (req, res) => {
    try{
        let malid = req.body.malid;
        if(malid == null){
            res.status(400).send("malid is null");
        }else{
            let anime = await ScraperResolver.getAnimeBymalid(malid);
            res.json(anime);
        }
    }catch(err){
        res.status(500).send("Internal Server Error");
    }
    
});

export default router;