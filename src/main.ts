import { fetchNoticias } from "./parsers/news.ts";
import { fetchVideos } from "./parsers/videos.ts";
import { fetchLegislacao } from "./parsers/legislacao.ts";
import { generateSimpleHtml } from "./generators/html.ts";
import { generateSemanticHtml } from "./generators/html.ts";
import { generateJsonFeed } from "./generators/json.ts";
import { generateRssFeed } from "./generators/rss.ts";
import { generateAtomFeed } from "./generators/atom.ts";
import { parseCustomDate } from "./utils.ts";
import { ContentItem } from "./types.ts";
import { CONFIG } from "./config.ts";

async function main() {
  console.log("⏳ Iniciando coleta de dados...");
  
  const [noticias, videos, legislacao] = await Promise.all([
    fetchNoticias(),
    fetchVideos(),
    fetchLegislacao()
  ]);

  console.log(`✅ ${noticias.length} notícias, ${videos.length} vídeos e ${legislacoes.length} legislações coletados`);

  // Processa todos os itens garantindo datas válidas
  const conteudos: ContentItem[] = [...noticias, ...videos, ...legislacoes].map(item => {
    const dateInfo = parseCustomDate(item.date);
    return {
      ...item,
      display: dateInfo.display,
      iso: dateInfo.iso,
      dateObj: dateInfo.obj
    };
  });
  

  // Ordena por data (mais recente primeiro)
  conteudos.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  console.log("⏳ Gerando arquivos...");
  await Deno.mkdir(CONFIG.outputDir, { recursive: true });

  // Gera todos os arquivos
  await Promise.all([
    generateSemanticHtml(conteudos, "index.html"),
    generateSimpleHtml(conteudos, `${CONFIG.outputDir}/index.html`),
    generateJsonFeed(conteudos, `${CONFIG.outputDir}/feed.json`),
    generateRssFeed(conteudos, `${CONFIG.outputDir}/rss.xml`),
    generateAtomFeed(conteudos, `${CONFIG.outputDir}/atom.xml`)
  ]);

  console.log("✅ Todos os arquivos foram gerados com sucesso!");
}

await main();
