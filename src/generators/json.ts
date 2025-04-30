import { ContentItem } from "../types.ts";
import { FAIR_METADATA } from "../config.ts";

export async function generateJsonFeed(conteudos: ContentItem[], outputPath: string) {
  const generationDate = new Date();
  
  const jsonData = {
    "@context": ["https://schema.org", "https://www.w3.org/ns/dcat"],
    "@type": "Dataset",
    name: FAIR_METADATA.title,
    description: FAIR_METADATA.description,
    identifier: FAIR_METADATA.identifier,
    url: FAIR_METADATA.source,
    license: FAIR_METADATA.license.url,
    dateCreated: generationDate.toISOString(),
    dateModified: generationDate.toISOString(),
    publisher: {
      "@type": "Organization",
      name: FAIR_METADATA.publisher.name,
      url: FAIR_METADATA.publisher.url
    },
    creator: {
      "@type": "Organization",
      name: FAIR_METADATA.creator,
      url: FAIR_METADATA.publisher.url
    },
    temporalCoverage: {
      startDate: conteudos[conteudos.length - 1]?.iso,
      endDate: conteudos[0]?.iso
    },
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: "./feed.json"
      }
    ],
    items: conteudos.map(item => ({
      "@type": item.type === "vídeo" ? "VideoObject" : item.type === "legislação" ? "Legislation" : "NewsArticle",
      name: item.title,
      url: item.link,
      datePublished: item.iso,
      description: item.description,
      ...(item.image && { image: item.image }),
      type: item.type // Adiciona o tipo no JSON
    }))
  };

  await Deno.writeTextFile(outputPath, JSON.stringify(jsonData, null, 2));
}