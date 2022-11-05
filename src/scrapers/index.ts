import Monoschinos2 from "./Monoschinos2";
import AnimeFLV from "./AnimesFLV";
import { pool } from "../db";
import Jikan from "jikan4.js"
import {finalAnimeT,animePlayerT,databaseAnimeT,animeT,animeinfT,episodeT, scraperToImage, scraperToDescription, scraperToUrl, scraperToGenres, scraperToStatus} from "../types/animeTypes"
import { clearPopularAnimesTable } from "../db";

const jikan = new Jikan.Client();
let scrapers = [AnimeFLV, Monoschinos2];

class ScraperResolver{

    async updatePopularAnimes():Promise<Array<finalAnimeT>> {
        clearPopularAnimesTable();

        let filter = <Partial<Jikan.TopAnimeFilter>>{
            filter: "bypopularity"
        }
        let popularAnimes = await jikan.top.listAnime(filter,1,50).then((res) => {return res})
        let animes = await Promise.all(popularAnimes.map(async (anime) => {
            let finalAnime = {
                title: anime.title.default,
                malid: anime.id,
                image: new Array<scraperToImage>({scraper: "Myanimelist", image: anime.image.jpg.default.toString()}),
                description: new Array<scraperToDescription>,
                url: new Array<scraperToUrl>,
                genres: new Array<scraperToGenres>({scraper: "Myanimelist", genres: anime.genres.map((genre) => {return genre.name})}),
                status: new Array<scraperToStatus>,
            };
            let animeInDatabase = await this.verifyAnimeinDatabase(finalAnime.malid);

            if(animeInDatabase != null){
                pool.query("INSERT INTO popularAnimes(animeObject) VALUES(?)",JSON.stringify(animeInDatabase.animeObject),) 
                return animeInDatabase.animeObject;
                
              }
              for (let scraper of scrapers)  {
                let animeSlug = null
                    
                
                for(let animeTitle in anime.title){
                    if(animeTitle == "synonyms"){
                        for(let animeSynonym of anime.title.synonyms){
                            animeSlug = await scraper.getSlugByTitle(animeSynonym)
                            if(animeSlug != null){
                              break;
                            }
                          }
                    }else{                      
                        animeSlug = await scraper.getSlugByTitle(anime.title[animeTitle])
                        if(animeSlug != null){
                          break;
                        }
                    }
                }
                
        
                let animeInfo = null;
                if(animeSlug != null){
                    animeInfo = await scraper.getAnimeInfobySlug(animeSlug);
                }
                    
                
                    
                if(animeInfo != null && animeInfo != undefined){
                    finalAnime.image.push({
                        scraper: scraper.getName(),
                        image: animeInfo.image,
                    });
                    finalAnime.description.push({
                        scraper: scraper.getName(),
                        description: animeInfo.description,
                    });
                    finalAnime.url.push({
                        scraper: scraper.getName(),
                        url: animeInfo.url,
                    });
                    finalAnime.genres.push({
                        scraper: scraper.getName(),
                        genres: animeInfo.genres,
                    });
                    finalAnime.status.push({
                        scraper: scraper.getName(),
                        status: animeInfo.status,
                    });
                }};

                pool.query("INSERT INTO popularAnimes(animeObject) VALUES(?)",JSON.stringify(finalAnime), )
                pool.query("INSERT INTO animesStored(animeObject) VALUES(?)",JSON.stringify(finalAnime), ) 

                return finalAnime;
        }))

        return animes;

    }

    public async verifyAnimeinDatabase(malid:Number): Promise<databaseAnimeT> {
        //verificar si el anime ya esta en la base de datos sql, en caso de existir, retornar el anime de la base de datos
          return await pool.query("SELECT id,animeObject FROM animesStored WHERE animeObject->'$.malid' = ?", malid).then((res) => {
            if(res[0]){
              return res[0][0]
            }else{
              return null;
            }
          })
      }

    async getAnimeBymalid(malid:number): Promise<finalAnimeT> {
        let animeInDatabase = await this.verifyAnimeinDatabase(malid);
        if(animeInDatabase != null){
            return animeInDatabase.animeObject;
        }
        let anime = await jikan.anime.get(malid).then((res) => {return res})

        let finalAnime = {
            title: anime.title.default,
            malid: anime.id,
            image: new Array<scraperToImage>({scraper: "Myanimelist", image: anime.image.jpg.default.toString()}),
            description: new Array<scraperToDescription>,
            url: new Array<scraperToUrl>,
            genres: new Array<scraperToGenres>({scraper: "Myanimelist", genres: anime.genres.map((genre) => {return genre.name})}),
            status: new Array<scraperToStatus>,
        };

        for (let scraper of scrapers)  {
            let animeSlug = null
                
            
            for(let animeTitle in anime.title){
                if(animeTitle == "synonyms"){
                    for(let animeSynonym of anime.title.synonyms){
                        animeSlug = await scraper.getSlugByTitle(animeSynonym)??null
                        if(animeSlug != null){
                          break;
                        }
                      }
                }else{                      
                    animeSlug = await scraper.getSlugByTitle(anime.title[animeTitle])??null
                    if(animeSlug != null){
                      break;
                    }
                }
            }

            let animeInfo = null;
            if(animeSlug != null){
                animeInfo = await scraper.getAnimeInfobySlug(animeSlug);
            }
                          
            if(animeInfo != null && animeInfo != undefined){
                finalAnime.image.push({
                    scraper: scraper.getName(),
                    image: animeInfo.image,
                });
                finalAnime.description.push({
                    scraper: scraper.getName(),
                    description: animeInfo.description,
                });
                finalAnime.url.push({
                    scraper: scraper.getName(),
                    url: animeInfo.url,
                });
                finalAnime.genres.push({
                    scraper: scraper.getName(),
                    genres: animeInfo.genres,
                });
                finalAnime.status.push({
                    scraper: scraper.getName(),
                    status: animeInfo.status,
                });
            }};

            pool.query("INSERT INTO animesStored(animeObject) VALUES(?)",JSON.stringify(finalAnime), ) 
            return finalAnime;
    }

}

export default new ScraperResolver() as ScraperResolver;

