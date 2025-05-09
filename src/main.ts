async function main() {
  console.log("⏳ Iniciando coleta de dados...");
  
  const [noticias, videos, legislacao, legislacaoPlone] = await Promise.all([
    fetchNoticias(),
    fetchVideos(),
    fetchLegislacao(),
    fetchLegislacaoPlone()
  ]);

  console.log(`✅ ${noticias.length} notícias, ${videos.length} vídeos, ${legislacao.length} legislações e ${legislacaoPlone.length} legislações (Plone) coletadas`);

  // Processa todos os itens garantindo datas válidas
  const conteudos: ContentItem[] = [
    ...noticias.map(item => processarItem(item)),
    ...videos.map(item => processarItem(item)),
    ...legislacao.map(item => processarItem(item)),
    ...legislacaoPlone.map(item => processarItem(item))
  ];

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