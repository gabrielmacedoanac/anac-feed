import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

// Variável para o User-Agent robusto
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
// Função auxiliar para criar um delay (Deno)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchLegislacaoPlone(): Promise<ContentItem[]> {
  try {
    // Executa o comando curl para capturar o HTML da página
    const process = Deno.run({
      cmd: [
        "curl",
        "-s",
        "-k",
        // 1. ALTERAÇÃO DE CONEXÃO: User-Agent robusto no CURL
        "-H", `User-Agent: ${USER_AGENT}`, 
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
    
    // ⚠️ REGEX ORIGINAL DO SEU CÓDIGO (mantido como solicitado)
    const matches = html.matchAll(
      /<div class="tileContent">.*?<a href="(.*?)" class="summary url">(.*?)<\/a>.*?<span class="description">(.*?)<\/span>/gs,
    );

    for (const match of matches) {
      const link = match[1]?.trim() || "#";
      const title = match[2]?.trim() || "Sem título";
      const description = match[3]?.trim() || "Sem descrição";

      // Extrai a data do título
      const dateMatch = title.match(/(\d{2}\/\d{2}\/\d{4})/);
      const date = dateMatch ? dateMatch[1].split("/").reverse().join("-") : null;

      let publishedDate = null;
      let modifiedDate = null;

      // Se a data não for encontrada no título, acessa o link para capturar as datas
      if (!date && link !== "#") {
        
        // 2. ALTERAÇÃO DE CONEXÃO: Adiciona atraso de 500ms para mitigar o rate limiting
        await delay(500);
        
        // 3. ALTERAÇÃO DE CONEXÃO: Usa User-Agent robusto no fetch secundário
        const pageRes = await fetch(link, {
          headers: { "User-Agent": USER_AGENT }, 
        });
        const pageHtml = await pageRes.text();

        // Limpa o HTML da página acessada
        const cleanedPageHtml = pageHtml.replace(/\s+/g, " ").trim();

        // Extrai a data de publicação
        const publishedMatch = cleanedPageHtml.match(
          /<span class="documentPublished">.*?<span>publicado<\/span>\s*(\d{2}\/\d{2}\/\d{4}\s*\d{2}h\d{2})/,
        );
        publishedDate = publishedMatch ? publishedMatch[1] : null;

        // Extrai a data da última modificação
        const modifiedMatch = cleanedPageHtml.match(
          /<span class="documentModified">.*?<span>última modificação<\/span>\s*(\d{2}\/\d{2}\/\d{4}\s*\d{2}h\d{2})/,
        );
        modifiedDate = modifiedMatch ? modifiedMatch[1] : null;
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
