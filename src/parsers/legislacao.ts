import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

// 1. Variável para o User-Agent robusto
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
// 2. Função auxiliar para criar um delay (Deno)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchLegislacao(): Promise<ContentItem[]> {
  try {
    
    // 3. Adiciona um atraso antes da requisição principal para mitigar rate limiting
    await delay(2000); 
    
    // 4. Usa o User-Agent robusto
    const res = await fetch(CONFIG.legislacaoUrl, {
      headers: { "User-Agent": USER_AGENT }
    });
    
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) throw new Error("Falha ao parsear HTML");

    const legislacoes: ContentItem[] = [];
    const articles = doc.querySelectorAll("div#content-core article.tileItem");

    for (const el of Array.from(articles)) {
      try {
        const title = el.querySelector("h2.tileHeadline a")?.textContent?.trim() || "Sem título";
        const link = el.querySelector("h2.tileHeadline a")?.getAttribute("href") || "#";

        // Ignora feeds cujo link contenha "portaria-de-pessoal"
        if (link.includes("portaria-de-pessoal")) {
          continue;
        }

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

        // Para a coleta quando atingir o número máximo de legislações
        if (legislacoes.length >= CONFIG.maxLegislacao) {
          break;
        }
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
