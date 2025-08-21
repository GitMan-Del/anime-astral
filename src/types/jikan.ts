// types/jikan.ts
export interface JikanImage {
    image_url?: string;
    small_image_url?: string;
    large_image_url?: string;
  }
  export interface JikanImageSet {
    jpg?: JikanImage;
    webp?: JikanImage;
  }
  
  export interface JikanNamed {
    mal_id: number;
    type?: string | null;
    name: string;
    url: string;
  }
  
  export interface JikanTrailer {
    youtube_id?: string | null;
    url?: string | null;
    embed_url?: string | null;
  }
  
  export interface JikanAnimeFull {
    mal_id: number;
    url: string;
    images?: JikanImageSet;
    trailer?: JikanTrailer | null;
    titles?: { type: string; title: string }[];
    title: string;
    title_english?: string | null;
    title_japanese?: string | null;
    title_synonyms?: string[];
    type?: string | null;
    source?: string | null;
    episodes?: number | null;
    status?: string | null;
    airing?: boolean | null;
    duration?: string | null;
    rating?: string | null;
    score?: number | null;
    scored_by?: number | null;
    rank?: number | null;
    popularity?: number | null;
    members?: number | null;
    favorites?: number | null;
    synopsis?: string | null;
    background?: string | null;
    season?: string | null;
    year?: number | null;
    producers?: JikanNamed[];
    licensors?: JikanNamed[];
    studios?: JikanNamed[];
    genres?: JikanNamed[];
    explicit_genres?: JikanNamed[];
    themes?: JikanNamed[];
    demographics?: JikanNamed[];
    relations?: { relation: string; entry: JikanNamed[] }[];
    external?: { name: string; url: string }[];
    streaming?: { name: string; url: string }[];
  }
  
  export interface JikanFullResponse {
    data: JikanAnimeFull;
  }
  