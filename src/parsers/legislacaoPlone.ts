   
import { ContentItem } from "../types.ts";
import { parseCustomDate } from "../utils.ts"; // Importe a função parseCustomDate
import { CONFIG } from "../config.ts";
    
export async function fetchLegislacaoPlone(): Promise<ContentItem[]> {
  try {
    // ... (código para buscar o HTML da página)
    const process = Deno.run({
      cmd: [
        "curl",
        "-s",
        "-k",
        "-H",
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        CONFIG.legislacaoPloneUrl,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const output = await process.output();
    const decoder = new TextDecoder();
    const html = decoder.decode(output);
    process.close();

    if (!html) {
      throw new Error("Erro ao capturar o HTML da página.");
    }

    const legislacoes: ContentItem[] = [];
    const matches = html.matchAll(
      /<div class="tileContent">.*?<a href="(.*?)" class="summary url">(.*?)<\/a>.*?<span class="description">(.*?)<\/span>/gs,
    );

    for (const match of matches) {
      const link = match[1]?.trim() || "#";
      const title = match[2]?.trim() || "Sem título";
      const description = match[3]?.trim() || "Sem descrição";

      // Extrai a data do título
      const dateMatch = title.match(/(\d{2}\/\d{2}\/\d{4})/);
      const dateString = dateMatch ? dateMatch[1] : null;
      const dateInfo = dateString ? parseCustomDate(dateString) : null;
      const date = dateInfo ? dateInfo.display : null;

      let publishedDate: string | null = null;
      let modifiedDate: string | null = null;

      // Se a data não for encontrada no título, acessa o link para capturar as datas
      if (!date && link !== "#") {
        const pageRes = await fetch(link, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        const pageHtml = await pageRes.text();

        // Limpa o HTML da página acessada
        const cleanedPageHtml = pageHtml.replace(/\s+/g, " ").trim();

        // Extrai a data de publicação
        const publishedMatch = cleanedPageHtml.match(
          /<span class="documentPublished">.*?<span>publicado<\/span>\s*(\d{2}\/\d{2}\/\d{4}\s*\d{2}h\d{2})/,
        );
        publishedDate = publishedMatch
          ? parseCustomDate(publishedMatch[1]).display
          : null;

        // Extrai a data da última modificação
        const modifiedMatch = cleanedPageHtml.match(
          /<span class="documentModified">.*?<span>última modificação<\/span>\s*(\d{2}\/\d{2}\/\d{4}\s*\d{2}h\d{2})/,
        );
        modifiedDate = modifiedMatch
          ? parseCustomDate(modifiedMatch[1]).display
          : null;
      }

      legislacoes.push({
        title,
        link,
        date: date || modifiedDate || publishedDate || "ND",
        description,
        image: null,
        type: "legislação",
        publishedDate: publishedDate || "ND",
        modifiedDate: modifiedDate || "ND",
      });
    }

    return legislacoes;
  } catch (error) {
    console.error("Erro ao buscar legislações do Plone:", error);
    return [];
  }
}
