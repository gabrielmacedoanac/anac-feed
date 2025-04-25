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
<html lang="pt-BR" vocab="https://schema.org/">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(FAIR_METADATA.title)}</title>
  <meta name="description" content="${escapeXml(FAIR_METADATA.description)}">
  
  <style>
    :root {
      --primary: #0066cc;
      --secondary: #004080;
      --light: #f8f9fa;
      --dark: #212529;
      --success: #28a745;
      --danger: #dc3545;
      --border-radius: 0.25rem;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: var(--dark);
      background-color: #f5f5f5;
      padding: 0;
      margin: 0;
    }
    
    header {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      padding: 2rem 1rem;
      text-align: center;
      margin-bottom: 2rem;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    h1 {
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .feed-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
      padding: 1rem;
    }
    
    article {
      background: white;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    article:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .article-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .article-content {
      padding: 1.5rem;
    }
    
    .article-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #6c757d;
    }
    
    .article-type {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius);
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .type-texto {
      background-color: #e6f7ff;
      color: var(--primary);
    }
    
    .type-vídeo {
      background-color: #fff0f0;
      color: var(--danger);
    }
    
    h2 {
      font-size: 1.4rem;
      margin-bottom: 1rem;
    }
    
    h2 a {
      color: var(--dark);
      text-decoration: none;
    }
    
    h2 a:hover {
      color: var(--primary);
      text-decoration: underline;
    }
    
    .article-description {
      color: #495057;
      margin-bottom: 1rem;
    }
    
    footer {
      background-color: var(--dark);
      color: white;
      text-align: center;
      padding: 1.5rem;
      margin-top: 2rem;
    }
    
    @media (max-width: 768px) {
      .feed-container {
        grid-template-columns: 1fr;
      }
      
      h1 {
        font-size: 1.8rem;
      }
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
      ${conteudos.map(item => `
      <article typeof="${item.type === 'vídeo' ? 'VideoObject' : 'NewsArticle'}">
        ${item.image ? `
        <img class="article-image" property="image" src="${escapeXml(item.image)}" alt="${escapeXml(item.title)}">
        ` : ''}
        <div class="article-content">
          <div class="article-meta">
            <time property="datePublished" datetime="${item.iso}">${item.display}</time>
            <span class="article-type ${item.type === 'vídeo' ? 'type-vídeo' : 'type-texto'}">
              ${item.type}
            </span>
          </div>
          <h2 property="headline"><a property="url" href="${escapeXml(item.link)}">${escapeXml(item.title)}</a></h2>
          <p class="article-description" property="description">${escapeXml(item.description)}</p>
        </div>
      </article>
      `).join('\n')}
    </div>
  </main>

  <footer typeof="WPFooter">
    <div class="container">
      <p><small>${FAIR_METADATA.rights} • Atualizado em: <time datetime="${generationDate.toISOString()}">${generationDate.toISOString()} (GMT)</time></small></p>
    </div>
  </footer>
</body>
</html>`;

  await Deno.writeTextFile(outputPath, htmlContent);
}
