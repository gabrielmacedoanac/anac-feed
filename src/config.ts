export const FAIR_METADATA = {
    title: "Notícias ANAC",
    description: "Feed de notícias e vídeos da Agência Nacional de Aviação Civil (ANAC)",
    identifier: "urn:uuid:anac-feed-" + crypto.randomUUID(),
    publisher: {
      name: "Agência Nacional de Aviação Civil (ANAC)",
      url: "https://www.gov.br/anac"
    },
    creator: "Assessoria de Comunicação Social (ASCOM) - ANAC",
    source: "https://www.gov.br/anac/pt-br/noticias",
    license: {
      name: "Licença Creative Commons Atribuição 4.0",
      url: "https://creativecommons.org/licenses/by/4.0/"
    },
    rights: "Dados abertos para uso público",
    keywords: ["aviação", "ANAC", "Brasil", "notícias", "regulação de transporte aéreo"],
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
