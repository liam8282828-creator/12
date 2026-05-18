declare module "yt-search" {
  interface VideoResult {
    title: string; url: string; videoId: string;
    duration: { timestamp: string; seconds: number };
    views: number; thumbnail: string;
    author: { name: string; url: string };
    description: string;
  }
  interface SearchResult { videos: VideoResult[]; playlists: unknown[]; accounts: unknown[]; lists: unknown[]; }
  function ytSearch(query: string): Promise<SearchResult>;
  export = ytSearch;
}
