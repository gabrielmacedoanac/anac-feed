export async function fetchLegislacaoPlone(): Promise<ContentItem[]> {
    try {
      const res = await fetch(CONFIG.legislacaoPloneUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
  
      if (!doc) throw new Error("Falha ao parsear HTML");
  
      const legislacoes: ContentItem[] = [];
      const articles = doc.querySelectorAll("#faceted-results div.tileItem");
  
      articles.forEach((el) => {
        try {
          const titleElement = el.querySelector("h2.tileHeadline a");
          const descriptionElement = el.querySelector("p span.description");
  
          const title = titleElement?.textContent?.trim() || "Sem título";
          const link = titleElement?.getAttribute("href") || "#";
          const description = descriptionElement?.textContent?.trim() || "Sem descrição";
  
          const dateMatch = title.match(/(\d{2}\/\d{2}\/\d{4})/);
          const date = dateMatch ? dateMatch[1].split("/").reverse().join("-") : "ND";
  
          legislacoes.push({
            title,
            link,
            date,
            description,
            image: null,
            type: "legislação"
          });
  
          // Limita a coleta ao máximo configurado
          if (legislacoes.length >= CONFIG.maxLegislacaoPlone) {
            return;
          }
        } catch (e) {
          console.warn("Erro ao processar item:", e);
        }
      });
  
      return legislacoes;
    } catch (error) {
      console.error("Erro ao buscar legislações do Plone:", error);
      return [];
    }
  }