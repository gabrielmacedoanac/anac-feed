import { ContentItem } from "../types.ts";
import { FAIR_METADATA } from "../config.ts";
import { escapeXml } from "../utils.ts";

export async function generateSimpleHtml(conteudos: ContentItem[], outputPath: string) {
  const htmlContent = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Notícias ANAC</title>
</head>
<body>
  ${conteudos.map(item => 
    `<a href="${escapeXml(item.link)}" target="_blank">${escapeXml(item.title)}</a> (${item.display}) - ${item.type}</br>`
  ).join('\n')}
</body>
</html>`;

  await Deno.writeTextFile(outputPath, htmlContent);
}

export async function generateSemanticHtml(conteudos: ContentItem[], outputPath: string) {
  const generationDate = new Date();
  
  const htmlContent = `<!DOCTYPE html>
<html lang="pt-br" vocab="https://schema.org/">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${FAIR_METADATA.title}</title>
  <meta name="description" content="${FAIR_METADATA.description}">
</head>
<body>
  <header>
    <h1>${FAIR_METADATA.title}</h1>
    <p>${FAIR_METADATA.description}</p>
  </header>

  <main>
    ${conteudos.map(item => `
    <article>
      <h2><a href="${escapeXml(item.link)}">${escapeXml(item.title)}</a></h2>
      <p><time datetime="${item.iso}">${item.display}</time> | ${item.type}</p>
      ${item.image ? `<img src="${escapeXml(item.image)}" alt="${escapeXml(item.title)}" width="300">` : ''}
      <p>${escapeXml(item.description)}</p>
    </article>
    `).join('\n    ')}
  </main>

  <footer>
    <p><small>${FAIR_METADATA.rights}</small></p>
  </footer>
</body>
</html>`;

  await Deno.writeTextFile(outputPath, htmlContent);
}