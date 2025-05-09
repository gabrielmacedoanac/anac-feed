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

export async function fetchLegislacaoPlone(): Promise<ContentItem[]> {
  try {
    const res = await fetch(CONFIG.legislacaoPloneUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) throw new Error("Falha ao parsear HTML");

    const legislacoes: ContentItem[] = [];
    const articles = doc.querySelectorAll("div.eea-preview-items div.tileItem");

    for (const el of Array.from(articles)) {
      try {
        const title = el.querySelector("h2.tileHeadline a")?.textContent?.trim() || "Sem título";
        const link = el.querySelector("h2.tileHeadline a")?.getAttribute("href") || "#";
        const description = el.querySelector("p span.description")?.textContent?.trim() || "Sem descrição";

        // Acessa o link para capturar as datas de publicação e modificação
        const detailRes = await fetch(link, { headers: { "User-Agent": "Mozilla/5.0" } });
        const detailHtml = await detailRes.text();
        const detailDoc = new DOMParser().parseFromString(detailHtml, "text/html");

        if (!detailDoc) throw new Error("Falha ao parsear HTML do detalhe");

        const publishedDateMatch = detailDoc.querySelector("span.documentPublished")?.textContent?.match(/(\d{2}\/\d{2}\/\d{4})/);
        const modifiedDateMatch = detailDoc.querySelector("span.documentModified")?.textContent?.match(/(\d{2}\/\d{2}\/\d{4})/);

        const publishedDate = publishedDateMatch ? publishedDateMatch[1].split("/").reverse().join("-") : "ND";
        const modifiedDate = modifiedDateMatch ? modifiedDateMatch[1].split("/").reverse().join("-") : "ND";

        legislacoes.push({
          title,
          link,
          date: publishedDate, // Usa a data de publicação como a principal
          description,
          image: null,
          type: "legislação",
          metadata: {
            publishedDate,
            modifiedDate
          }
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
    console.error("Erro ao buscar legislações do Plone:", error);
    return [];
  }
}