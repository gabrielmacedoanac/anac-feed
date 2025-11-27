import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

export async function fetchLegislacaoPlone(): Promise<ContentItem[]> {
  try {
    // ... [O código para capturar o HTML com curl permanece o mesmo] ...

    const process = Deno.run({
      // ...
    });
    // ...
    const output = await process.output();
    const decoder = new TextDecoder();
    const html = decoder.decode(output);
    process.close();

    if (!html) {
      throw new Error("Erro ao capturar o HTML da página.");
    }

    const legislacoes: ContentItem[] = [];
    
    // 🎯 NOVO REGEX CORRIGIDO:
    // Captura o link (1), o título (2) e a descrição (3), respeitando a nova estrutura HTML:
    // tileContent -> subtitle -> h2.tileHeadline -> a.summary.url -> /h2 -> p -> span.description
    const matches = html.matchAll(
      /<div class="tileContent">.*?<h2 class="tileHeadline">\s*<a href="(.*?)" class="summary url">(.*?)<\/a>.*?<span class="description">(.*?)<\/span>/gs,
    );

    for (const match of matches) {
      // Capturas de grupo: [1]=link, [2]=title, [3]=description
      const link = match[1]?.trim() || "#";
      const title = match[2]?.trim() || "Sem título";
      const description = match[3]?.trim() || "Sem descrição";

      // Extrai a data do título (essa lógica funciona e não precisa ser alterada)
      const dateMatch = title.match(/(\d{2}\/\d{2}\/\d{4})/);
      const date = dateMatch ? dateMatch[1].split("/").reverse().join("-") : null;

      let publishedDate = null;
      let modifiedDate = null;

      // ... [O código para buscar datas na página do link permanece o mesmo] ...
      if (!date && link !== "#") {
        // ... (Código de fetch/parse da página interna) ...
        // As expressões regulares internas (documentPublished, documentModified) 
        // devem ser verificadas se o site interno também mudou.
        
        // ... (resto do código do if) ...
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
