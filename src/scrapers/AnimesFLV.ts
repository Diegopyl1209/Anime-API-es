import { load } from "cheerio";
import { animeT, animeinfT, episodeT, animePlayerT} from "../types/animeTypes";
import Jikan from 'jikan4.js'

import levenshtein = require('fast-levenshtein');

const jikanClient = new Jikan.Client()
const Axios = require('axios')


class AnimeFLV  {
    baseUrl = "https://www3.animeflv.net/";

    public getName(): string {
        return "AnimeFLV"
    }

    public  async getRecentAnimes(page: Number = 1): Promise<Array<animeT>> {
        let recentUrl = this.baseUrl + "browse?page=" + page;
        let body = await Axios.get(recentUrl).then((res:any) => res.data);
        let $ = load(body);

        let animes = $("ul.ListAnimes li")
        .map((i, el) => {
          let title = $(el).find("a h3").text();
  
          let url = this.baseUrl + $(el).find("a").attr("href");
          let slug = url.substring(url.lastIndexOf("/") + 1);
          let image = $(el).find("img").attr("src")!!;
          let description = $(el).find("div.Description p").last().text();
            
          return <animeT>{ slug, title, url, image, description };
        })
        .get();

        return animes
    }

    public  async getAnimeInfobySlug(slug: String,returnMalid:boolean = true): Promise<animeinfT> {
        let animeUrl = this.baseUrl + "anime/" + slug;
        let body = null;
        try{
          body = await Axios.get(animeUrl).then((res) => res.data);
        }catch{
          return null
        }
        let $ = load(body);

        let title = $("div.Container h1.Title").text();
        let malid = null
        if(returnMalid){
            malid = await jikanClient.anime.search(title).then((res) => {
                return res[0].id
            }).catch(()=>{return null})
        }
        let image = this.baseUrl + $("div.Image img").attr("src");
        let description = $("div.Description p").last().text();
        let genres = []
        let status = $("p.AnmStts span.fa-tv").text();

        let episodes = $("script").map((i, el) => {
          let text = $(el).html();
          if (text.includes("var episodes = [")) {
            //this is a shit, i know
            let episodesScript = text.split("var episodes = [")[1].split("];")[0]
              .split("],[")
              .map((el) => {
                return el.replace("]", "").replace("[", "").split(",")[0] });
            return episodesScript.map((episode) => {
              let url = this.baseUrl + "ver/" + slug + "-" + episode;
              let number = episode as unknown as number;
              let title = episode;

              return { url, number, title };
            });
          }
        }).get();

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

    public async getEpisodesByAnimeSlug(slug: string): Promise<episodeT[]> {
        let animeUrl = this.baseUrl + "anime/" + slug;
        let body = await Axios.get(animeUrl).then((res) => res.data);
        let $ = load(body);

        let episodes = $("script")
        .map((i, el) => {
        let text = $(el).html();
        if (text.includes("var episodes = [")) {
          //this is a shit, i know
          let episodes = text
            .split("var episodes = [")[1]
            .split("];")[0]
            .split("],[")
            .map((el) => {
              return el.replace("]", "").replace("[", "").split(",")[0];
            });

          return episodes.map((episode) => {
            let url = this.baseUrl + "ver/" + slug + "-" + episode;
            let number = episode as unknown as number;
            let title = episode;

            return { url, number, title };
          });
        }}).get();

        return episodes;
  }

    public  async getPlayersByEpisodeUrl(url: string): Promise<animePlayerT[]> {
        let body = await Axios.get(url).then((res) => res.data);
        let $ = load(body);

        let players = $("script")
        .map((i, el) => {
        let text = $(el).html();
        if (text.includes("var videos =")) {
          let playersText = text
            .substring(text.indexOf("var videos = {"))
            .split("// var videos = [];")[0]
            .replace("var videos =", "")
            .replace(";", "");
          let players = JSON.parse(playersText)["SUB"];
          let playersArray = [];

          for (let i in players) {
            let player = players[i];
            let url = player["code"];
            let title = player["title"];
            playersArray.push({ url, title });
          }

          return playersArray;
        }
      }).get();

    return players;
  }

  async getSlugByTitle(title: string): Promise<string> {
    let searchUrl = this.baseUrl + "browse?q=" + title;

    let body = null;
    try{
      body = await Axios.get(searchUrl).then((res) => res.data);
    }catch(e){
      return null
    }
    let $ = load(body);

    try{
    let results = $("ul.ListAnimes li a").map((i, el) => {
      let url = $(el).attr("href");
      let slug = url.substring(url.lastIndexOf("/") + 1);
      let animetitle = $(el).find("h3.Title").text();

      if(levenshtein.get(animetitle, title,{ useCollator: true}) <= 5){
        let distance = levenshtein.get(animetitle, title,{ useCollator: true})
        return { slug, distance}
      }
    })
    .get();
    return results.sort((a,b)=>a.distance-b.distance)[0]?.slug??null
  }catch{
    return null
  }

  }

  async searchAnime(title: string): Promise<Array<animeT>> {
    let searchUrl = this.baseUrl + "browse?q=" + title;
    let body = await Axios.get(searchUrl).then((res) => res.data);

    let $ = load(body);
    let animes = $("ul.ListAnimes li")
      .map((i, el) => {
        let title = $(el).find("h3.Title").text();
        let url = this.baseUrl + $(el).find("a").attr("href");
        let slug = url.substring(url.lastIndexOf("/") + 1);
        let image = $(el).find("img").attr("src")!!;
        let description = $(el).find("div.Description p").last().text();

        return { slug, title, url, image, description };
      })
      .get();

    return animes;
  }


}


export default new AnimeFLV() as AnimeFLV;  