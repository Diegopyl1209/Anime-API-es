import { load } from "cheerio";
import { animeT, animeinfT, episodeT, animePlayerT} from "../types/animeTypes";
import Jikan from 'jikan4.js'
import levenshtein = require('fast-levenshtein');

const jikanClient = new Jikan.Client()
const Axios = require('axios')

class Monoschinos2{
    baseUrl = "https://monoschinos2.com/";

    public getName(): string {
        return "Monoschinos2"
    }

    public async getRecentAnimes(page: Number = 1): Promise<Array<animeT>> {
        let recentUrl = this.baseUrl + "animes?p=" + page;
        let body = await Axios.get(recentUrl).then((res:any) => res.data);
        let $ = load(body);

        let animes = $("div.row div.col-md-4").map((i, el) => {
          let title = $(el).find("h3").text();
          let url = $(el).find("a").attr("href");
          let image = $(el).find("img").attr("data-src");
          let description = "";
          let slug = url
            .substring(url.lastIndexOf("/") + 1)
            .replace("-sub-espanol", "");
  
          return <animeT>{ slug, title, url, image, description };
        }).get();
  
      return animes;
    }

    public async getAnimeInfobySlug(slug: String,returnMalid:boolean = true): Promise<animeinfT> {
        let animeUrl = this.baseUrl + "anime/" + slug;
        let body = await Axios.get(animeUrl).then((res) => res.data);
        let $ = load(body);

        let title = $("div.chapterdetails h1").text();
        let malid = null
        if(returnMalid){
            malid = await jikanClient.anime.search(title).then((res) => {
                return res[0].id
            }).catch(()=>{return null})
        }

        let image = $("div.chapterpic img").attr("src");
        let description = $("p.textComplete").text();
        let genres = $("ol.breadcrumb li.breadcrumb-item a")
          .toArray()
          .map((el) => $(el).text());
        let status = $("div.butns button#btninfo.btn1").text();
        let episodes = $("div.allanimes div.row.jpage.row-cols-md-6 div.col-item")
        .map((i, el) => {
          let url = $(el).find("a").attr("href");
          let number = $(el).attr("data-episode") as unknown as number;
          let title = $(el).find("p.animetitles").text();

          return { url, number, title };
        }).get();

        if(title == "" || image == "" || description == ""){
            return null;
          }

        return <animeinfT>{
            malid: malid,
            slug,
            title,
            image,
            description,
            episodes,
            genres,
            status,
            url:animeUrl
        };
        
    }

    public async getEpisodesByAnimeSlug(slug: string): Promise<Array<episodeT>> {
        let animeUrl = this.baseUrl + "anime/" + slug;
        let body = await Axios.get(animeUrl).then((res) => res.data);
        let $ = load(body);
    
        let episodes = $("div.allanimes div.row.jpage.row-cols-md-6 div.col-item").map((i, el) => {
            let url = $(el).find("a").attr("href");
            let number = $(el).attr("data-episode") as unknown as number;
            let title = $(el).find("p.animetitles").text();
    
            return <episodeT>{ url, number, title };
          }).get();
    
        return episodes;
      }

      public async getPlayersByEpisodeUrl(url: any): Promise<Array<animePlayerT>> {
        let body = await Axios.get(url).then((res) => res.data);
        let $ = load(body);
    
        let players = $("ul.dropcaps li#play-video a").map((i, el) => {
            let base64Url = $(el).attr("data-player");
            let url = Buffer.from(base64Url, "base64")
              .toString("ascii")
              .replace("https://monoschinos2.com/reproductor?url=", "");
            let name = $(el).text();
    
            return <animePlayerT>{ url, title: name };
          }).get();
    
        return players;
      }



    public async getSlugByTitle(title:string): Promise<string> {
        let browseUrl = this.baseUrl + "buscar?q=" + title;
        let body = await Axios.get(browseUrl).then((res) => res.data);
        let $ = load(body);
    try{
      let results = $("div.heromain div.row div.col-md-4.col-lg-2.col-6").map((i, el) => {
        let animeTitle = $(el).find("h3.seristitles").text();
        let url = $(el).find("a").attr("href")
        let slug = url.substring(url.lastIndexOf("/") + 1).replace("-sub-espanol", "");
  
        if (levenshtein.get(animeTitle, title,{ useCollator: true}) <= 5) {
          let distance = levenshtein.get(animeTitle, title,{ useCollator: true})
          return { slug, distance}
        } 
      }).get();

      return results.sort((a,b)=>a.distance-b.distance)[0]?.slug??null
    }catch(e){
      return null
    }
        
      }


    public async searchAnime(title:String): Promise<Array<animeT>> {
        let searchUrl = this.baseUrl + "buscar/" + title;
        let body = await Axios.get(searchUrl).then((res) => res.data);
        let $ = load(body);
    
        let animes = $("div.row div.col-md-4")
          .map((i, el) => {
            let title = $(el).find("h3").text();
            let url = $(el).find("a").attr("href");
            let image = $(el).find("img").attr("data-src");
            let description = "";
            let slug = url
              .substring(url.lastIndexOf("/") + 1)
              .replace("-sub-espanol", "");
    
            return { slug, title, url, image, description };
          })
          .get();
    
        return animes;
      }


}

export default new Monoschinos2() as Monoschinos2;