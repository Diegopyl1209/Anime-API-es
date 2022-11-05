type scraperToUrl = {scraper:String, url:String}
type scraperToImage = {scraper:String, image:String}
type scraperToDescription = {scraper:String, description:String}
type scraperToTitle = {scraper:String, title:String}
type scraperToSlug = {scraper:String, slug:String}
type scraperToAnilistId = {scraper:String, anilistid:Number}
type scraperToEpisodes = {scraper:String, episodes:Array<episodeT>}
type scraperToGenres = {scraper:String, genres:Array<String>}
type scraperToStatus = {scraper:String, status:String}
type scraperToAvailable = {scraper:String, available:boolean}


type episodeT = {url:String, number:Number, title:String}

type animeT = {malid?:Number,slug:String, title:String, url:String, image:String, description:String}
type animeinfT = {
    malid?:Number,
      slug:String,
    title:String,
    image:String,
    description:String,
    episodes:Array<episodeT>,
    genres:Array<String>,
    status:String,
    url:String
  }

type databaseAnimeT = {id:Number,animeObject:finalAnimeT}
type finalAnimeT = {malid:Number,url:Array<scraperToUrl> , title:String, description:Array<scraperToDescription>, image:Array<scraperToImage>, genres:Array<scraperToGenres>, status:Array<scraperToStatus>}

type animePlayerT = {url:String, title:String}

export { finalAnimeT, databaseAnimeT, animeT, animeinfT, episodeT, scraperToUrl, scraperToImage, scraperToDescription, scraperToTitle, scraperToSlug, scraperToAnilistId, scraperToEpisodes, scraperToGenres, scraperToStatus, scraperToAvailable, animePlayerT };
