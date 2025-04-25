export const FAIR_METADATA = {
    title: "Anac Feed",
    description: "Feed com notícias e vídeos coletados das publicações da Agência Nacional de Aviação Civil (Anac)",
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
    maxNoticias: 25,
    maxVideos: 25,
    youtubeChannelId: "UC5ynmbMZXolM-jo2hGR31qg",
    baseUrl: "https://www.gov.br/anac/pt-br/noticias",
    outputDir: "data"
  };
