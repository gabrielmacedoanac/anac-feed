import { ContentItem } from "../types.ts";
import { FAIR_METADATA, CONFIG } from "../config.ts";
import { escapeXml } from "../utils.ts";

export async function generateRssFeed(conteudos: ContentItem[], outputPath: string) {
  const generationDate = new Date();
  
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(FAIR_METADATA.title)}</title>
    <link>${escapeXml(CONFIG.noticiaUrl)}</link>
    <description>${escapeXml(FAIR_METADATA.description)}</description>
    <language>${FAIR_METADATA.language}</language>
    <pubDate>${generationDate.toUTCString()}</pubDate>
    <lastBuildDate>${generationDate.toUTCString()}</lastBuildDate>
    <generator>Deno Feed Generator</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    
    ${conteudos.map(item => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${new Date(item.iso).toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
      <dc:creator>${escapeXml(FAIR_METADATA.creator)}</dc:creator>
      <dc:date>${item.iso}</dc:date>
      ${item.image ? `<enclosure url="${escapeXml(item.image)}" type="image/jpeg"/>` : ''}
      <category>${escapeXml(item.type)}</category> <!-- Adiciona o tipo como categoria -->
      <content:encoded><![CDATA[
        <p>${item.description}</p>
        ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ''}
      ]]></content:encoded>
    </item>
    `).join('\n    ')}
  </channel>
</rss>`;

  await Deno.writeTextFile(outputPath, rssXml);
}