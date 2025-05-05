import { ContentItem } from "../types.ts";
import { FAIR_METADATA } from "../config.ts";
import { escapeXml } from "../utils.ts";
import { sanitize } from "https://deno.land/x/ammonia@0.3.0/mod.ts";

export async function generateSimpleHtml(conteudos: ContentItem[], outputPath: string) {
  const htmlContent = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Notícias ANAC</title>
  <style>
    .filters { text-align: center; margin-bottom: 1rem; }
    .filters a { margin: 0 0.5rem; text-decoration: none; color: blue; }
    .filters a:hover { text-decoration: underline; }
    .feed-item { margin-bottom: 1rem; }
    .feed-item-description { margin-top: 0.5rem; font-size: 0.9rem; color: #222; } /* Estilo para a descrição */
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
    ${conteudos.map(item => 
      `<div class="feed-item" data-type="${item.type}">
        <a href="${escapeXml(item.link)}" target="_blank">${escapeXml(item.title)}</a> (${item.display}) - ${item.type}
        <div class="feed-item-description">${sanitize(item.description)}</div>
      </div>`
    ).join('\n')}
  </div>
  <script>
    function filterByType(type) {
      const items = document.querySelectorAll('.feed-item');
      items.forEach(item => {
        if (type === 'all' || item.dataset.type === type) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    }
  </script>
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
  
  <!-- FontAwesome para ícones -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

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
    .filter-buttons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .filter-buttons button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--border-radius);
      background-color: var(--primary);
      color: white;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .filter-buttons button:hover {
      background-color: var(--secondary);
    }
    .filter-buttons button.active {
      background-color: var(--success);
      color: white;
    }
    .filter-buttons button i {
      margin-right: 0.5rem; /* Espaço entre o ícone e o texto */
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
      cursor: pointer;
    }
    .type-notícia {
      background-color: rgb(236, 248, 254);
      color: var(--primary);
    }
    .type-vídeo {
      background-color: #fff0f0;
      color: var(--danger);
    }
    .type-legislação {
      background-color: #f0fff4;
      color: var(--success);
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
    .feed-links {
      margin-top: 1rem;
      text-align: center;
    }
    .feed-links a {
      color: var(--primary);
      text-decoration: none;
      margin: 0 0.5rem;
    }
    .feed-links a:hover {
      text-decoration: underline;
    }
    @media (max-width: 768px) {
      .filter-buttons button {
        flex: 1 1 100%;
      }
      .feed-container {
        grid-template-columns: 1fr;
      }
      h1 {
        font-size: 1.8rem;
      }
    }
  </style>
  <script>
    function filterByType(type) {
      const articles = document.querySelectorAll('.feed-container article');
      const buttons = document.querySelectorAll('.filter-buttons button');
      
      articles.forEach(article => {
        if (type === 'all' || article.dataset.type === type) {
          article.style.display = 'block';
        } else {
          article.style.display = 'none';
        }
      });

      buttons.forEach(button => {
        if (button.getAttribute('data-type') === type) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    }
  </script>
</head>
<body>
  <header typeof="WPHeader">
    <div class="container">
      <h1 property="name">${escapeXml(FAIR_METADATA.title)}</h1>
      <p property="description">${escapeXml(FAIR_METADATA.description)}</p>
    </div>
  </header>

  <main class="container">
    <div class="filter-buttons">
      <button data-type="all" onclick="filterByType('all')" class="active">
        <i class="fas fa-list"></i> Todos
      </button>
      <button data-type="notícia" onclick="filterByType('notícia')">
        <i class="fas fa-newspaper"></i> Notícias
      </button>
      <button data-type="vídeo" onclick="filterByType('vídeo')">
        <i class="fas fa-video"></i> Vídeos
      </button>
      <button data-type="legislação" onclick="filterByType('legislação')">
        <i class="fas fa-gavel"></i> Legislações
      </button>
    </div>
    <div class="feed-container">
      ${conteudos.map(item => `
      <article data-type="${item.type}" typeof="${item.type === 'vídeo' ? 'VideoObject' : item.type === 'legislação' ? 'Legislation' : 'NewsArticle'}">
        ${item.image ? `
        <img class="article-image" property="image" src="${escapeXml(item.image)}" alt="${escapeXml(item.title)}">
        ` : ''}
        <div class="article-content">
          <div class="article-meta">
            <time property="datePublished" datetime="${item.iso}">${item.display}</time>
            <span class="article-type ${item.type === 'vídeo' ? 'type-vídeo' : item.type === 'legislação' ? 'type-legislação' : 'type-notícia'}" onclick="filterByType('${item.type}')">
              ${item.type}
            </span>
          </div>
          <h2 property="headline"><a property="url" href="${escapeXml(item.link)}">${escapeXml(item.title)}</a></h2>
          <p class="article-description" property="description">${(item.description)}</p>
        </div>
      </article>
      `).join('\n')}
    </div>
  </main>

  <footer typeof="WPFooter">
    <div class="container">
      <p><small>${FAIR_METADATA.rights} • Atualizado em: <time datetime="${generationDate.toISOString()}">${generationDate.toISOString()} (GMT)</time></small></p>
      <div class="feed-links">
        <a href="data/rss.xml" target="_blank">RSS Feed</a>
        <a href="data/feed.json" target="_blank">JSON Feed</a>
        <a href="data/atom.xml" target="_blank">ATOM Feed</a>
      </div>
    </div>
  </footer>
</body>
</html>`;

  await Deno.writeTextFile(outputPath, htmlContent);
}