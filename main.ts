import { fetchNoticias } from './lib/fetchNoticias.ts';
import { fetchYoutube } from './lib/fetchYoutube.ts';
import { renderFormats } from './lib/renderFormats.ts';

async function main() {
  const noticias = await fetchNoticias();
  const youtubeVideos = await fetchYoutube();

  // Processa as notícias e vídeos aqui
  const json = renderFormats.toJSON(noticias, youtubeVideos);
  const html = renderFormats.toHTML(noticias, youtubeVideos);

  // Salva os arquivos
  await Deno.writeTextFile('./data/feed.json', JSON.stringify(json, null, 2));
  await Deno.writeTextFile('./data/index.html', html);
}

main();