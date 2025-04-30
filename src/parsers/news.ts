import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

export async function fetchNoticias(): Promise<ContentItem[]> {
  try {
    const res = await fetch(CONFIG.baseUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) throw new Error("Falha ao parsear HTML");

    const noticias: ContentItem[] = [];
    const artigos = doc.querySelectorAll("article.tileItem");

    for (const el of Array.from(artigos).slice(0, CONFIG.maxNoticias)) {
      try {
        const title = el.querySelector("h2.tileHeadline a")?.textContent?.trim() || "Sem título";
        const link = el.querySelector("h2.tileHeadline a")?.getAttribute("href") || "#";
        
        const dateIcon = el.querySelector("span.summary-view-icon i.icon-day");
        const timeIcon = el.querySelector("span.summary-view-icon i.icon-hour");
        const date = dateIcon?.parentElement?.textContent?.trim().replace(/\s+/g, " ") || "ND";
        const time = timeIcon?.parentElement?.textContent?.trim().replace(/\s+/g, " ") || "ND";
        const dateTime = `${date} ${time}`.replace("ND ND", "").trim();

        const description = el.querySelector("p.tileBody span.description")?.textContent?.trim() || "Sem descrição";
        const image = el.querySelector("div.tileImage img")?.getAttribute("src") || null;

        noticias.push({ 
          title, 
          link, 
          date: dateTime, 
          description, 
          image, 
          type: "notícia" 
        });
      } catch (e) {
        console.warn("Erro ao processar notícia:", e);
      }
    }

    return noticias;
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return [];
  }
}