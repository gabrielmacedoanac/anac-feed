import { ContentItem } from "../types.ts";
import { FAIR_METADATA, CONFIG } from "../config.ts";
import { escapeXml } from "../utils.ts";

export async function generateAtomFeed(conteudos: ContentItem[], outputPath: string) {
  const generationDate = new Date();
  
  const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <title>${escapeXml(FAIR_METADATA.title)}</title>
  <subtitle>${escapeXml(FAIR_METADATA.description)}</subtitle>
  <link href="${escapeXml(CONFIG.baseUrl)}" rel="alternate"/>
  <link href="./atom.xml" rel="self"/>
  <id>${FAIR_METADATA.identifier}</id>
  <updated>${conteudos[0]?.iso || generationDate.toISOString()}</updated>
  <author>
    <name>${escapeXml(FAIR_METADATA.creator)}</name>
    <uri>${escapeXml(FAIR_METADATA.publisher.url)}</uri>
  </author>
  <rights>${escapeXml(FAIR_METADATA.rights)}</rights>
  
  ${conteudos.map(item => `
  <entry>
    <title type="html">${escapeXml(item.title)}</title>
    <link href="${escapeXml(item.link)}" rel="alternate"/>
    <id>${escapeXml(item.link)}</id>
    <published>${item.iso}</published>
    <updated>${item.iso}</updated>
    <author>
      <name>${escapeXml(FAIR_METADATA.creator)}</name>
    </author>
    <summary type="html">${escapeXml(item.description)}</summary>
    <content type="html"><![CDATA[
      <p>${item.description}</p>
      ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ''}
    ]]></content>
    <dc:publisher>${escapeXml(FAIR_METADATA.publisher.name)}</dc:publisher>
    <category term="${escapeXml(item.type)}"/> <!-- Adiciona o tipo como categoria -->
  </entry>
  `).join('\n  ')}
</feed>`;

  await Deno.writeTextFile(outputPath, atomXml);
}