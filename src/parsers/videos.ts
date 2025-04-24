import { parse } from "https://denopkg.com/ThauEx/deno-fast-xml-parser/mod.ts";
import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

export async function fetchVideos(): Promise<ContentItem[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${CONFIG.youtubeChannelId}`
    );
    const xml = await res.text();
    const parsed = parse(xml, { ignoreAttributes: false });

    const entries = Array.isArray(parsed.feed?.entry) 
      ? parsed.feed.entry 
      : [parsed.feed?.entry].filter(Boolean);

    return entries.slice(0, CONFIG.maxVideos).map((video: any) => {
      const date = video.published ? new Date(video.published) : new Date();
      return {
        title: video.title,
        link: video.link?.["@_href"] || "#",
        date: date,
        description: video["media:group"]?.["media:description"] || "",
        image: video["media:group"]?.["media:thumbnail"]?.["@_url"] || null,
        type: "vídeo"
      };
    });
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    return [];
  }
}