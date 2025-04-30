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
    const rows = doc.querySelectorAll("table tbody tr");

    for (const el of Array.from(rows).slice(0, CONFIG.maxLegislacao)) {
      try {
        const title = el.querySelector("td:nth-child(2) a")?.textContent?.trim() || "Sem título";
        const link = el.querySelector("td:nth-child(2) a")?.getAttribute("href") || "#";
        const date = el.querySelector("td:nth-child(1)")?.textContent?.trim() || "ND";
        const description = el.querySelector("td:nth-child(3)")?.textContent?.trim() || "Sem descrição";

        legislacoes.push({
          title,
          link,
          date,
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