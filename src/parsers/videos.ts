import { parse } from "@std/xml";
import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

type XmlNode = {
  name?: {
    local?: string;
    prefix?: string;
  };
  attributes?: Array<{
    name?: {
      local?: string;
      prefix?: string;
    };
    value?: string;
  }>;
  children?: XmlNode[];
  value?: string;
};

function elementName(node: XmlNode): string {
  const local = node.name?.local ?? "";
  const prefix = node.name?.prefix;

  return prefix ? `${prefix}:${local}` : local;
}

function findChild(
  node: XmlNode | undefined,
  name: string,
): XmlNode | undefined {
  return node?.children?.find((child) => elementName(child) === name);
}

function findChildren(
  node: XmlNode | undefined,
  name: string,
): XmlNode[] {
  return node?.children?.filter((child) => elementName(child) === name) ?? [];
}

function textContent(node: XmlNode | undefined): string {
  if (!node) {
    return "";
  }

  if (typeof node.value === "string") {
    return node.value;
  }

  return (node.children ?? [])
    .map((child) => textContent(child))
    .join("");
}

function getAttribute(
  node: XmlNode | undefined,
  name: string,
): string | undefined {
  const attribute = node?.attributes?.find((attr) => {
    const local = attr.name?.local ?? "";
    const prefix = attr.name?.prefix;
    const fullName = prefix ? `${prefix}:${local}` : local;

    return fullName === name || local === name;
  });

  return attribute?.value;
}

export async function fetchVideos(): Promise<ContentItem[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${CONFIG.youtubeChannelId}`,
    );

    if (!res.ok) {
      throw new Error(
        `Erro ao buscar feed do YouTube: ${res.status} ${res.statusText}`,
      );
    }

    const xml = await res.text();
    const parsed = parse(xml) as unknown as XmlNode;

    const feed =
      findChild(parsed, "feed") ??
      findChild(parsed, "atom:feed");

    if (!feed) {
      throw new Error("Elemento <feed> não encontrado no XML do YouTube.");
    }

    const entries = [
      ...findChildren(feed, "entry"),
      ...findChildren(feed, "atom:entry"),
    ];

    return entries
      .slice(0, CONFIG.maxVideos)
      .map((video): ContentItem => {
        const publishedText = textContent(
          findChild(video, "published") ??
            findChild(video, "atom:published"),
        );

        const parsedDate = publishedText
          ? new Date(publishedText)
          : new Date();

        const date = Number.isNaN(parsedDate.getTime())
          ? new Date()
          : parsedDate;

        const videoId = textContent(
          findChild(video, "yt:videoId"),
        ).trim();

        const title = textContent(
          findChild(video, "title") ??
            findChild(video, "atom:title"),
        ).trim();

        const linkNodes = [
          ...findChildren(video, "link"),
          ...findChildren(video, "atom:link"),
        ];

        const alternateLink =
          linkNodes.find(
            (node) => getAttribute(node, "rel") === "alternate",
          ) ?? linkNodes[0];

        const link = getAttribute(alternateLink, "href") ??
          (videoId
            ? `https://www.youtube.com/watch?v=${videoId}`
            : "#");

        const mediaGroup = findChild(video, "media:group");

        const description = textContent(
          findChild(mediaGroup, "media:description"),
        ).trim();

        const thumbnail = findChild(
          mediaGroup,
          "media:thumbnail",
        );

        const thumbnailUrl =
          getAttribute(thumbnail, "url") ?? null;

        const contentUrl = videoId
          ? `https://www.youtube.com/watch?v=${videoId}`
          : link;

        const embedUrl = videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : "";

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
