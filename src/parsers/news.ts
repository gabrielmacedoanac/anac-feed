import {
  DOMParser,
  Element,
} from "jsr:@b-fuze/deno-dom";

import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

const BASE_URL = "https://www.gov.br";

const NOTICIA_PATH_REGEX =
  /^\/anac\/pt-br\/noticias\/\d{4}\/[^/]+\/?$/;

interface ParsedDate {
  display: string;
  iso?: string;
  obj?: Date;
}

function normalizeText(
  value: string | null | undefined,
): string {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function toAbsoluteUrl(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, BASE_URL).href;
  } catch {
    return null;
  }
}

function isNoticiaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return (
      parsed.hostname === "www.gov.br" &&
      NOTICIA_PATH_REGEX.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

function parsePublishedDate(
  text: string,
): ParsedDate {
  const match = text.match(
    /publicado\s+(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2})h(\d{2})/i,
  );

  if (!match) {
    return {
      display: "ND",
    };
  }

  const [
    ,
    day,
    month,
    year,
    hour,
    minute,
  ] = match;

  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");
  const paddedHour = hour.padStart(2, "0");
  const paddedMinute = minute.padStart(2, "0");

  const display =
    `${paddedDay}/${paddedMonth}/${year} ` +
    `${paddedHour}h${paddedMinute}`;

  const date = new Date(
    `${year}-${paddedMonth}-${paddedDay}` +
      `T${paddedHour}:${paddedMinute}:00-03:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return {
      display,
    };
  }

  return {
    display,
    iso: date.toISOString(),
    obj: date,
  };
}

function findArticleContainer(
  anchor: Element,
): Element {
  let current: Element | null = anchor;

  while (current) {
    const text = normalizeText(
      current.textContent,
    );

    const hasPublishedDate =
      /publicado\s+\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}h\d{2}/i
        .test(text);

    if (hasPublishedDate) {
      return current;
    }

    current = current.parentElement;
  }

  return anchor;
}

function extractDescription(
  container: Element,
  title: string,
): string {
  const paragraphs = Array.from(
    container.querySelectorAll("p"),
  );

  for (const paragraph of paragraphs) {
    const text = normalizeText(
      paragraph.textContent,
    );

    if (
      text &&
      text !== title &&
      !/^tags?:/i.test(text) &&
      !/^publicado\b/i.test(text) &&
      !/^notícia$/i.test(text)
    ) {
      return text;
    }
  }

  let text = normalizeText(
    container.textContent,
  );

  if (text.startsWith(title)) {
    text = text
      .slice(title.length)
      .trim();
  }

  const tagsIndex = text.search(
    /\btags?:/i,
  );

  if (tagsIndex >= 0) {
    text = text
      .slice(0, tagsIndex)
      .trim();
  }

  const publishedIndex = text.search(
    /\bpublicado\s+\d{1,2}\/\d{1,2}\/\d{4}/i,
  );

  if (publishedIndex >= 0) {
    text = text
      .slice(0, publishedIndex)
      .trim();
  }

  return normalizeText(text) ||
    "Sem descrição";
}

function extractImage(
  container: Element,
): string | null {
  const image =
    container.querySelector("img");

  if (!image) {
    return null;
  }

  const candidates = [
    image.getAttribute("src"),
    image.getAttribute("data-src"),
    image.getAttribute("data-lazy-src"),
  ];

  for (const candidate of candidates) {
    const url =
      toAbsoluteUrl(candidate);

    if (url) {
      return url;
    }
  }

  return null;
}

function createContentItem(
  title: string,
  link: string,
  container: Element,
): ContentItem {
  const publishedText =
    normalizeText(container.textContent);

  const dateInfo =
    parsePublishedDate(publishedText);

  const description =
    extractDescription(
      container,
      title,
    );

  const image =
    extractImage(container);

  const item: ContentItem = {
    title,
    link,
    date:
      dateInfo.obj ??
      dateInfo.display,
    description,
    image,
    type: "notícia",
    display: dateInfo.display,
  };

  if (dateInfo.iso) {
    item.iso = dateInfo.iso;
  }

  if (dateInfo.obj) {
    item.dateObj = dateInfo.obj;
  }

  return item;
}

export async function fetchNoticias(): Promise<
  ContentItem[]
> {
  try {
    console.log(
      `Buscando notícias em: ${CONFIG.noticiaUrl}`,
    );

    const response = await fetch(
      CONFIG.noticiaUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36",
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language":
            "pt-BR,pt;q=0.9,en;q=0.8",
          "Cache-Control":
            "no-cache",
        },
        redirect: "follow",
      },
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    const html =
      await response.text();

    if (!html.trim()) {
      throw new Error(
        "A página de notícias retornou HTML vazio.",
      );
    }

    console.log(
      `HTML recebido: ${html.length} caracteres.`,
    );

    const doc =
      new DOMParser().parseFromString(
        html,
        "text/html",
      );

    if (!doc) {
      throw new Error(
        "Falha ao interpretar o HTML da página de notícias.",
      );
    }

    const 
