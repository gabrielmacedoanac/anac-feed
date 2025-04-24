# ANAC Notícias + Vídeos Feed

Este projeto coleta automaticamente as últimas notícias do site da ANAC e os vídeos mais recentes do canal oficial da ANAC no YouTube. Os dados são agregados e expostos em múltiplos formatos: HTML, JSON, RSS e ATOM.

## Funcionalidades

- Coleta notícias do site oficial da ANAC
- Coleta vídeos do canal da ANAC no YouTube
- Geração de arquivos nos formatos:
  - `index.html` (lista de links)
  - `feed.json` (estrutura JSON completa)
  - `rss.xml` (padrão RSS 2.0)
  - `atom.xml` (padrão ATOM)

## Executar localmente

### Pré-requisitos
- [Deno instalado](https://deno.land/manual@v1.40.0/getting_started/installation)

### Clonar o projeto
```bash
git clone https://github.com/seuusuario/anac-feed.git
cd anac-feed
