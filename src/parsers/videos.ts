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
      // Capturar os metadados em variáveis intermediárias
      const date = video.published ? new Date(video.published) : new Date();
      const videoId = video["yt:videoId"];
      const title = video.title;
      const link = video.link?.["@_href"] || "#";
      const description = video["media:group"]?.["media:description"] || "";
      const thumbnailUrl = video["media:group"]?.["media:thumbnail"]?.["@_url"] || null;
      const contentUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      // Retornar o objeto final com os metadados
      return {
        title,
        link,
        date,
        description,
        image: thumbnailUrl,
        type: "vídeo",
        uploadDate: date.toISOString(),
        name: title,
        thumbnailUrl,
        contentUrl,
        embedUrl,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    return [];
  }
}