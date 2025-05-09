import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

export async function fetchLegislacaoPlone(): Promise<ContentItem[]> {
  try {
    // Executa o comando curl para capturar o HTML
    const process = Deno.run({
      cmd: [
        "curl",
        "-s",
        "-k", // Ignora erros de certificado SSL
        "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        "-H", "Accept: */*",
        "-H", "X-Requested-With: XMLHttpRequest",
        CONFIG.legislacaoPloneUrl,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const output = await process.output();
    const decoder = new TextDecoder();
    const html = decoder.decode(output);
    process.close();

    // Verifica se o HTML foi capturado
    if (!html) {
      throw new Error("Erro ao capturar o HTML da página.");
    }

    // Faz o parser do HTML usando RegEx
    const legislacoes: ContentItem[] = [];
    const matches = html.matchAll(/<div class="tileItem">.*?<h2 class="tileHeadline"><a href="(.*?)".*?>(.*?)<\/a>.*?<p><span class="description">(.*?)<\/span>/gs);

    for (const match of matches) {
      const link = match[1]?.trim() || "#";
      const title = match[2]?.trim() || "Sem título";
      const description = match[3]?.trim() || "Sem descrição";

      // Extração opcional da data do título
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
    }

    return legislacoes;
  } catch (error) {
    console.error("Erro ao buscar legislações do Plone:", error);
    return [];
  }
}