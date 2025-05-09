import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

export async function fetchLegislacaoPlone(): Promise<ContentItem[]> {
  try {
    const res = await fetch(CONFIG.legislacaoPloneUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://www.anac.gov.br/assuntos/legislacao/busca-legislacao",
      },
    });

    if (!res.ok) {
      throw new Error(`Erro ao acessar a API: ${res.statusText}`);
    }

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) {
      throw new Error("Erro ao parsear o HTML retornado pela API.");
    }

    const legislacoes: ContentItem[] = [];
    const articles = doc.querySelectorAll("#faceted-results div.tileItem");

    articles.forEach((el) => {
      const titleElement = el.querySelector("h2.tileHeadline a");
      const descriptionElement = el.querySelector("p span.description");

      const title = titleElement?.textContent?.trim() || "Sem título";
      const link = titleElement?.getAttribute("href") || "#";
      const description = descriptionElement?.textContent?.trim() || "Sem descrição";

      const dateMatch = title.match(/(\d{2}\/\d{2}\/\d{4})/);
      const date = dateMatch ? dateMatch[1].split("/").reverse().join("-") : "ND";

      legislacoes.push({
        title,
        link,
        date,
        description,
        image: null,
        type: "legislação",
      });
    });

    return legislacoes;
  } catch (error) {
    console.error("Erro ao buscar legislações do Plone:", error);
    return [];
  }
}