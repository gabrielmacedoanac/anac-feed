import { chromium } from "playwright";
import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

export async function fetchLegislacaoPlone(): Promise<ContentItem[]> {
  try {
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
  } catch (error) {
    console.error("Erro ao buscar legislações do Plone com fetch:", error);
    return await fetchLegislacaoPloneWithPlaywright();
  }
}

export async function fetchLegislacaoPloneWithPlaywright(): Promise<ContentItem[]> {
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
  } catch (error) {
    console.error("Erro ao buscar legislações do Plone com Playwright:", error);
    return [];
  } finally {
    await browser.close();
  }
}