export const FAIR_METADATA = {
    title: "Anac Feed",
    description: "Feed com notícias, vídeos e legislações (atos normativos) coletados das publicações da Agência Nacional de Aviação Civil (Anac)",
    identifier: "urn:uuid:anac-feed-" + crypto.randomUUID(),
    publisher: {
      name: "Agência Nacional de Aviação Civil (Anac)",
      url: "https://www.gov.br/anac"
    },
    creator: "Assessoria de Comunicação Social (ASCOM) - Anac",
    source: "https://www.gov.br/anac/pt-br/noticias",
    license: {
      name: "Licença Creative Commons Atribuição 4.0",
      url: "https://creativecommons.org/licenses/by/4.0/"
    },
    rights: "Dados abertos para uso público",
    keywords: ["aviação","aviação civil", "Anac", "Brasil", "notícias", "vídeos ", "transporte aéreo", "regulação"],
    language: "pt-BR",
    coverage: "Brasil"
  };
  
export const CONFIG = {
    noticiaUrl: "https://www.gov.br/anac/pt-br/noticias",
    maxNoticias: 25,
    youtubeChannelId: "UC5ynmbMZXolM-jo2hGR31qg",
    maxVideos: 25,
    legislacaoUrl: "https://www.anac.gov.br/assuntos/legislacao/ultimos-atos-publicados",
    maxLegislacao: 20, // Quantidade máxima para legislacao
    legislacaoPloneUrl: "https://www.anac.gov.br/assuntos/legislacao/busca-legislacao/@@faceted_query?b_start%5B%5D=0&c6%5B%5D=CT&c6%5B%5D=Decis%C3%A3o&c6%5B%5D=Decreto&c6%5B%5D=Decreto-Lei&c6%5B%5D=IAC&c6%5B%5D=IS&c6%5B%5D=Instru%C3%A7%C3%A3o+Normativa&c6%5B%5D=Lei&c6%5B%5D=Lei+Complementar&c6%5B%5D=Medida+Provis%C3%B3ria&c6%5B%5D=PNAVSEC&c6%5B%5D=PNIAVSEC&c6%5B%5D=PROFAL&c6%5B%5D=PSO+-+BR&c6%5B%5D=PSOE+-+ANAC&c6%5B%5D=Portaria+Conjunta&c6%5B%5D=RBAC&c6%5B%5D=RBAC-E&c6%5B%5D=RBHA&c6%5B%5D=Resolu%C3%A7%C3%A3o&c6%5B%5D=SELO+ANAC&c6%5B%5D=TP&c6%5B%5D=iBR2020",
    maxLegislacaoPlone: 20, // Quantidade máxima para legislacaoPlone
    outputDir: "data"
};

console.log("HTML capturado:", html);

const matches = html.matchAll(/<div class="tileItem">.*?<h2 class="tileHeadline">\s*<a href="(.*?)".*?>(.*?)<\/a>.*?<span class="description">(.*?)<\/span>/gs);
for (const match of matches) {
  console.log("Match encontrado:", match);
  const link = match[1];
  const pageHtml = await fetch(link).then(response => response.text());
  console.log("Acessando link:", link);
  console.log("HTML da página acessada:", pageHtml);
}
