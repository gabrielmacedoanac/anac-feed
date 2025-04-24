import { ContentItem } from "../types.ts";
import { FAIR_METADATA } from "../config.ts";
import { escapeXml } from "../utils.ts";

function formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

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

export function generateSemanticHtml(feed: Feed, options: HtmlOptions = {}): string {
    const { title, description, link, items } = feed;
    const { lang = 'pt-BR', meta = true } = options;

    const filterStyles = `
        <style>
            .feed-filters {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                margin: 2rem 0;
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .search-bar {
                flex-grow: 1;
                min-width: 300px;
            }
            
            .search-bar input {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                font-size: 1rem;
                transition: border-color 0.3s;
            }
            
            .search-bar input:focus {
                outline: none;
                border-color: #4dabf7;
                box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.2);
            }
            
            .type-filters {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
            }
            
            .type-filters legend {
                font-weight: 600;
                margin-right: 0.5rem;
            }
            
            .type-filters label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                padding: 0.5rem 1rem;
                background: #fff;
                border-radius: 20px;
                border: 1px solid #dee2e6;
                transition: all 0.2s;
            }
            
            .type-filters label:hover {
                background: #f1f3f5;
            }
            
            .type-filters input[type="checkbox"] {
                margin: 0;
            }
            
            .feed-items {
                display: grid;
                gap: 2rem;
                margin-top: 2rem;
            }
            
            .feed-item {
                padding: 1.5rem;
                border-radius: 8px;
                background: #fff;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .feed-item.hidden {
                display: none;
            }
            
            .feed-item h3 {
                margin: 0 0 0.5rem;
                color: #212529;
            }
            
            .feed-item time {
                display: block;
                font-size: 0.875rem;
                color: #6c757d;
                margin-bottom: 0.75rem;
            }
            
            .feed-item p {
                margin: 0.75rem 0;
                color: #495057;
                line-height: 1.6;
            }
            
            .feed-item a[href]:not([aria-label]) {
                display: inline-block;
                margin-top: 0.5rem;
                color: #1971c2;
                text-decoration: none;
                font-weight: 500;
            }
            
            .feed-item a[href]:hover {
                text-decoration: underline;
            }
            
            .no-results {
                text-align: center;
                padding: 2rem;
                color: #6c757d;
                display: none;
            }
            
            .no-results.show {
                display: block;
            }
            
            @media (max-width: 768px) {
                .feed-filters {
                    flex-direction: column;
                }
                
                .search-bar {
                    width: 100%;
                }
                
                .type-filters {
                    justify-content: flex-start;
                }
            }
        </style>
    `;

    const filterScript = `
        <script>
            function setupFilters() {
                const searchInput = document.querySelector('.search-bar input');
                const typeCheckboxes = document.querySelectorAll('.type-filters input[type="checkbox"]');
                const feedItems = document.querySelectorAll('.feed-item');
                const noResultsMessage = document.querySelector('.no-results');
                
                function updateResultsCount(visibleCount) {
                    if (visibleCount === 0) {
                        noResultsMessage.classList.add('show');
                    } else {
                        noResultsMessage.classList.remove('show');
                    }
                }
                
                function filterItems() {
                    const searchTerm = searchInput.value.toLowerCase();
                    const activeTypes = Array.from(typeCheckboxes)
                        .filter(checkbox => checkbox.checked)
                        .map(checkbox => checkbox.value);
                    
                    let visibleCount = 0;
                    
                    feedItems.forEach(item => {
                        const itemTitle = item.querySelector('h3').textContent.toLowerCase();
                        const itemDate = item.querySelector('time')?.textContent.toLowerCase() || '';
                        const itemDesc = item.querySelector('p')?.textContent.toLowerCase() || '';
                        const itemType = item.getAttribute('data-type') || 'texto';
                        
                        const matchesSearch = searchTerm === '' || 
                            itemTitle.includes(searchTerm) || 
                            itemDate.includes(searchTerm) ||
                            itemDesc.includes(searchTerm);
                        
                        const matchesType = activeTypes.length === 0 || activeTypes.includes(itemType);
                        
                        if (matchesSearch && matchesType) {
                            item.classList.remove('hidden');
                            visibleCount++;
                        } else {
                            item.classList.add('hidden');
                        }
                    });
                    
                    updateResultsCount(visibleCount);
                    updateURLParams();
                }
                
                function updateURLParams() {
                    const searchTerm = searchInput.value.trim();
                    const activeTypes = Array.from(typeCheckboxes)
                        .filter(checkbox => checkbox.checked)
                        .map(checkbox => checkbox.value);
                    
                    const urlParams = new URLSearchParams();
                    
                    if (searchTerm) {
                        urlParams.set('search', searchTerm);
                    }
                    
                    if (activeTypes.length > 0 && activeTypes.length < typeCheckboxes.length) {
                        urlParams.set('type', activeTypes.join(','));
                    }
                    
                    const newUrl = urlParams.toString() ? 
                        window.location.pathname + '?' + urlParams.toString() : 
                        window.location.pathname;
                    
                    window.history.replaceState(null, '', newUrl);
                }
                
                function initFromURL() {
                    const urlParams = new URLSearchParams(window.location.search);
                    const typeParam = urlParams.get('type');
                    const searchParam = urlParams.get('search');
                    
                    if (typeParam) {
                        const types = typeParam.split(',');
                        typeCheckboxes.forEach(checkbox => {
                            checkbox.checked = types.includes(checkbox.value);
                        });
                    }
                    
                    if (searchParam) {
                        searchInput.value = searchParam;
                    }
                    
                    filterItems();
                }
                
                searchInput.addEventListener('input', filterItems);
                typeCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', filterItems);
                });
                
                initFromURL();
            }
            
            document.addEventListener('DOMContentLoaded', setupFilters);
        </script>
    `;

    const filterControls = `
        <div class="feed-filters" aria-labelledby="filter-heading">
            <h2 id="filter-heading" class="visually-hidden">Filtros do Feed</h2>
            <div class="search-bar">
                <input type="text" placeholder="Buscar por título, descrição ou data..." 
                       aria-label="Buscar no feed">
            </div>
            <fieldset class="type-filters">
                <legend>Filtrar por tipo:</legend>
                <label><input type="checkbox" value="texto" checked> Texto</label>
                <label><input type="checkbox" value="vídeo" checked> Vídeo</label>
                <label><input type="checkbox" value="imagem" checked> Imagem</label>
                <label><input type="checkbox" value="podcast" checked> Podcast</label>
            </fieldset>
        </div>
    `;

    const itemsHtml = items.map(item => {
        let itemType = 'texto';
        const itemLink = item.link || '';
        
        if (/youtube\.com|vimeo\.com|youtu\.be|\.mp4|\.webm/i.test(itemLink)) {
            itemType = 'vídeo';
        } else if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(itemLink)) {
            itemType = 'imagem';
        } else if (/spotify\.com|soundcloud\.com|\.mp3|\.wav|\.ogg/i.test(itemLink)) {
            itemType = 'podcast';
        }
        
        return `
            <article class="feed-item" data-type="${itemType}">
                <h3><a href="${itemLink}">${item.title}</a></h3>
                ${item.pubDate ? `<time datetime="${new Date(item.pubDate).toISOString()}">${formatDate(item.pubDate)}</time>` : ''}
                ${item.description ? `<p>${item.description}</p>` : ''}
                ${itemLink ? `<a href="${itemLink}" aria-label="Leia mais sobre ${item.title}">Leia mais</a>` : ''}
            </article>
        `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html lang="${lang}">
        <head>
            ${meta ? `<meta charset="UTF-8">` : ''}
            ${meta ? `<meta name="viewport" content="width=device-width, initial-scale=1.0">` : ''}
            ${meta ? `<meta name="description" content="${description || 'Feed de conteúdo'}">` : ''}
            <title>${title}</title>
            ${filterStyles}
        </head>
        <body>
            <header>
                <h1>${title}</h1>
                ${description ? `<p>${description}</p>` : ''}
                ${link ? `<a href="${link}" rel="noopener noreferrer">Visite o site</a>` : ''}
            </header>
            
            <main>
                ${filterControls}
                
                <div class="feed-items">
                    ${itemsHtml}
                    <div class="no-results">
                        <p>Nenhum resultado encontrado. Tente ajustar os filtros.</p>
                    </div>
                </div>
            </main>
            
            ${filterScript}
        </body>
        </html>
    `;
};

  await Deno.writeTextFile(outputPath, htmlContent);
}

