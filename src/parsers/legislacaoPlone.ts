import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { chromium } from "playwright";
import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

/**
 * Função principal para buscar legislações do Plone.
 * Tenta várias abordagens em sequência até obter sucesso.
 */
export async function fetchLegislacaoPlone(): Promise<ContentItem[]> {
  try {
    return await fetchLegislacaoPloneWithFetch();
  } catch (error) {
    console.error("Erro ao buscar legislações do Plone com fetch:", error);
    try {
      return await fetchLegislacaoPloneWithPlaywright();
    } catch (error) {
      console.error("Erro ao buscar legislações do Plone com Playwright:", error);
      try {
        return await fetchLegislacaoPloneWithRawHttp();
      } catch (error) {
        console.error("Erro ao buscar legislações do Plone com Raw HTTP:", error);
        return [];
      }
    }
  }
}

/**
 * Estratégia 1: Usar `fetch` com DOMParser.
 */
async function fetchLegislacaoPloneWithFetch(): Promise<ContentItem[]> {
  const res = await fetch(CONFIG.legislacaoPloneUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache"
    }
  });

  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  if (!doc) throw new Error("Falha ao parsear HTML");

  const legislacoes: ContentItem[] = [];
  const articles = doc.querySelectorAll("#faceted-results div.tileItem");

  articles.forEach((el) => {
    try {
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
        type: "legislação"
      });
    } catch (e) {
      console.warn("Erro ao processar item:", e);
    }
  });

  return legislacoes;
}

/**
 * Estratégia 2: Usar Playwright para simular um navegador.
 */
async function fetchLegislacaoPloneWithPlaywright(): Promise<ContentItem[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(CONFIG.legislacaoPloneUrl, { waitUntil: "networkidle" });

    const legislacoes = await page.evaluate(() => {
      const items: ContentItem[] = [];
      const articles = document.querySelectorAll("#faceted-results div.tileItem");

      articles.forEach((el) => {
        const titleElement = el.querySelector("h2.tileHeadline a");
        const descriptionElement = el.querySelector("p span.description");

        const title = titleElement?.textContent?.trim() || "Sem título";
        const link = titleElement?.getAttribute("href") || "#";
        const description = descriptionElement?.textContent?.trim() || "Sem descrição";

        const dateMatch = title.match(/(\d{2}\/\d{2}\/\d{4})/);
        const date = dateMatch ? dateMatch[1].split("/").reverse().join("-") : "ND";

        items.push({
          title,
          link,
          date,
          description,
          image: null,
          type: "legislação"
        });
      });

      return items;
    });

    return legislacoes;
  } finally {
    await browser.close();
  }
}

/**
 * Estratégia 3: Usar uma requisição HTTP bruta com cabeçalhos personalizados.
 */
async function fetchLegislacaoPloneWithRawHttp(): Promise<ContentItem[]> {
  const res = await fetch(CONFIG.legislacaoPloneUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache"
    }
  });

  const html = await res.text();
  const matches = html.match(/<div class="tileItem">.*?<\/div>/gs);

  if (!matches) throw new Error("Nenhum item encontrado");

  const legislacoes: ContentItem[] = matches.map((match) => {
    const titleMatch = match.match(/<h2 class="tileHeadline"><a.*?>(.*?)<\/a><\/h2>/);
    const linkMatch = match.match(/<h2 class="tileHeadline"><a href="(.*?)"/);
    const descriptionMatch = match.match(/<p><span class="description">(.*?)<\/span><\/p>/);

    const title = titleMatch ? titleMatch[1].trim() : "Sem título";
    const link = linkMatch ? linkMatch[1] : "#";
    const description = descriptionMatch ? descriptionMatch[1].trim() : "Sem descrição";

    return {
      title,
      link,
      date: "ND",
      description,
      image: null,
      type: "legislação"
    };
  });

  return legislacoes;
}