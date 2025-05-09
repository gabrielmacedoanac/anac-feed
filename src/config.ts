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
    legislacaoPloneUrl: "https://www.anac.gov.br/assuntos/legislacao/busca-legislacao#b_start=0&c6=CT&c6=Decis%C3%A3o&c6=Decreto&c6=Decreto-Lei&c6=IAC&c6=IS&c6=Instru%C3%A7%C3%A3o+Normativa&c6=Lei&c6=Lei+Complementar&c6=Medida+Provis%C3%B3ria&c6=PNAVSEC&c6=PNIAVSEC&c6=PROFAL&c6=PSO+-+BR&c6=PSOE+-+ANAC&c6=Portaria+Conjunta&c6=RBAC&c6=RBAC-E&c6=RBHA&c6=Resolu%C3%A7%C3%A3o&c6=SELO+ANAC&c6=TP&c6=iBR2020",
    maxLegislacaoPlone: 20, // Quantidade máxima para legislacaoPlone
    outputDir: "data"
};
