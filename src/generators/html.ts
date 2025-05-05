import { ContentItem } from "../types.ts";
import { FAIR_METADATA } from "../config.ts";
import { escapeXml } from "../utils.ts";

/**
 * Função para transformar URLs em links clicáveis diretamente com regex.
 */
function parseAndGenerateLinks(description: string): string {
  return description.replace(
    /(https?:\/\/[^\s]+)/g, // Detecta URLs que começam com http:// ou https://
    '<a href="$1" target="_blank">$1</a>' // Transforma em links clicáveis
  );
}

/**
 * Gera o HTML simples para os conteúdos fornecidos.
 */
export async function generateSimpleHtml(conteudos: ContentItem[], outputPath: string) {
  const htmlContent = buildSimpleHtml(conteudos);
  await Deno.writeTextFile(outputPath, htmlContent);
}

/**
 * Constrói o HTML simples.
 */
function buildSimpleHtml(conteudos: ContentItem[]): string {
  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Notícias ANAC</title>
  <style>
    .filters { text-align: center; margin-bottom: 1rem; }
    .filters a { margin: 0 0.5rem; text-decoration: none; color: blue; }
    .filters a:hover { text-decoration: underline; }
    .feed-item { margin-bottom: 1rem; }
    .feed-item-description { margin-top: 0.5rem; font-size: 0.9rem; color: #222; }
  </style>
</head>
<body>
  <div class="filters">
    <a href="#" onclick="filterByType('all')">[Todos]</a>
    <a href="#" onclick="filterByType('notícia')">[Notícias]</a>
    <a href="#" onclick="filterByType('vídeo')">[Vídeos]</a>
    <a href="#" onclick="filterByType('legislação')">[Legislações]</a>
  </div>
  <div id="content">
    ${conteudos.map(item => buildFeedItem(item)).join('\n')}
  </div>
  <script>
    function filterByType(type) {
      const items = document.querySelectorAll('.feed-item');
      items.forEach(item => {
        item.style.display = (type === 'all' || item.dataset.type === type) ? 'block' : 'none';
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Constrói um item do feed.
 */
function buildFeedItem(item: ContentItem): string {
  const parseUrlDescription = parseAndGenerateLinks(item.description);
  return `
    <div class="feed-item" data-type="${item.type}">
      <a href="${escapeXml(item.link)}" target="_blank">${escapeXml(item.title)}</a> (${item.display}) - ${item.type}
      <div class="feed-item-description">${parseUrlDescription}</div>
    </div>`;
}

/**
 * Gera o HTML semântico para os conteúdos fornecidos.
 */
export async function generateSemanticHtml(conteudos: ContentItem[], outputPath: string) {
  const htmlContent = buildSemanticHtml(conteudos);
  await Deno.writeTextFile(outputPath, htmlContent);
}

/**
 * Constrói o HTML semântico.
 */
function buildSemanticHtml(conteudos: ContentItem[]): string {
  const generationDate = new Date();
  return `<!DOCTYPE html>
<html lang="pt-BR" vocab="https://schema.org/">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(FAIR_METADATA.title)}</title>
  <meta name="description" content="${escapeXml(FAIR_METADATA.description)}">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f4f4f9;
      color: #333;
    }
    header {
      background: #0073e6;
      color: #fff;
      padding: 1rem 0;
      text-align: center;
    }
    .container {
      width: 90%;
      margin: auto;
      overflow: hidden;
    }
    .feed-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    article {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 1rem;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    article img {
      max-width: 100%;
      border-radius: 5px;
    }
    article h2 {
      font-size: 1.2rem;
      margin: 0.5rem 0;
    }
    article p {
      font-size: 0.9rem;
      color: #555;
    }
    footer {
      background: #333;
      color: #fff;
      text-align: center;
      padding: 1rem 0;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <header typeof="WPHeader">
    <div class="container">
      <h1 property="name">${escapeXml(FAIR_METADATA.title)}</h1>
      <p property="description">${escapeXml(FAIR_METADATA.description)}</p>
    </div>
  </header>
  <main class="container">
    <div class="feed-container">
      ${conteudos.map(item => buildSemanticFeedItem(item)).join('\n')}
    </div>
  </main>
  <footer typeof="WPFooter">
    <div class="container">
      <p><small>${FAIR_METADATA.rights} • Atualizado em: <time datetime="${generationDate.toISOString()}">${generationDate.toISOString()} (GMT)</time></small></p>
    </div>
  </footer>
</body>
</html>`;
}

/**
 * Constrói um item semântico do feed.
 */
function buildSemanticFeedItem(item: ContentItem): string {
  const parseUrlDescription = parseAndGenerateLinks(item.description);
  return `
    <article data-type="${item.type}" typeof="${getSchemaType(item.type)}">
      ${item.image ? `<img class="article-image" property="image" src="${escapeXml(item.image)}" alt="${escapeXml(item.title)}">` : ''}
      <div class="article-content">
        <div class="article-meta">
          <time property="datePublished" datetime="${item.iso}">${item.display}</time>
          <span class="article-type">${item.type}</span>
        </div>
        <h2 property="headline"><a property="url" href="${escapeXml(item.link)}">${escapeXml(item.title)}</a></h2>
        <p class="article-description" property="description">${parseUrlDescription}</p>
      </div>
    </article>`;
}

/**
 * Retorna o tipo de schema.org baseado no tipo do item.
 */
function getSchemaType(type: string): string {
  switch (type) {
    case 'vídeo': return 'VideoObject';
    case 'legislação': return 'Legislation';
    default: return 'NewsArticle';
  }
}