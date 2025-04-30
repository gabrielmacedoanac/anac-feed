import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

export async function fetchLegislacao(): Promise<ContentItem[]> {
  try {
    const res = await fetch(CONFIG.legislacaoUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) throw new Error("Falha ao parsear HTML");

    const legislacoes: ContentItem[] = [];
    const articles = doc.querySelectorAll("div#content-core article.tileItem");

    for (const el of Array.from(articles).slice(0, CONFIG.maxLegislacao)) {
      try {
        const title = el.querySelector("h2.tileHeadline a")?.textContent?.trim() || "Sem título";
        const link = el.querySelector("h2.tileHeadline a")?.getAttribute("href") || "#";
        const description = el.querySelector("p.tileBody span.description")?.textContent?.trim() || "Sem descrição";

        // Extraindo a data do título, que está no formato "PORTARIA Nº XXXX, DD/MM/YYYY"
        const dateMatch = title.match(/(\d{2}\/\d{2}\/\d{4})/);
        const date = dateMatch ? dateMatch[1] : "ND";

        // Converte a data para o formato ISO (YYYY-MM-DD) se possível
        const isoDate = date !== "ND" ? date.split("/").reverse().join("-") : "ND";

        legislacoes.push({
          title,
          link,
          date: isoDate, // Usa a data no formato ISO
          description,
          image: null,
          type: "legislação"
        });
      } catch (e) {
        console.warn("Erro ao processar legislação:", e);
      }
    }

    return legislacoes;
  } catch (error) {
    console.error("Erro ao buscar legislações:", error);
    return [];
  }
}