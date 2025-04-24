README.md

# 1. Inicia o repositório git (caso ainda não tenha sido iniciado)
git init

# 2. Configura o repositório remoto (substitua com sua URL do GitHub)
git remote add origin https://github.com/seuusuario/seurepositorio.git

# 3. Cria o diretório .github/workflows para o fluxo de CI/CD
mkdir -p .github/workflows

# 4. Cria o arquivo de GitHub Actions (deploy.yml)
echo "
name: Deploy Deno App

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Deno
        uses: denolib/setup-deno@v1
        with:
          deno-version: v1.40.0

      - name: Cache dependencies
        uses: actions/cache@v2
        with:
          path: ~/.cache/deno
          key: \${{ runner.os }}-deno-\${{ hashFiles('**/import_map.json') }}
          restore-keys: |
            \${{ runner.os }}-deno-

      - name: Run Deno script
        run: |
          deno task start

      - name: Commit and push updated files
        run: |
          git config --global user.name \"GitHub Actions\"
          git config --global user.email \"actions@github.com\"
          git add data/* index.html
          git commit -m \"Atualizar arquivos gerados automaticamente\"
          git push
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
" > .github/workflows/deploy.yml

# 5. Cria o arquivo README.md com instruções de uso
echo "# ANAC Notícias + Vídeos Feed\n\nEste projeto coleta automaticamente as últimas notícias do site da ANAC e os vídeos mais recentes do canal oficial da ANAC no YouTube. Os dados são agregados e expostos em múltiplos formatos: HTML, JSON, RSS e ATOM.\n\n## Funcionalidades\n\n- Coleta notícias do site oficial da ANAC\n- Coleta vídeos do canal da ANAC no YouTube\n- Geração de arquivos nos formatos:\n  - \`index.html\` (lista de links)\n  - \`feed.json\` (estrutura JSON completa)\n  - \`rss.xml\` (padrão RSS 2.0)\n  - \`atom.xml\` (padrão ATOM)\n\n## Executar localmente\n\n### Pré-requisitos\n- [Deno instalado](https://deno.land/manual@v1.40.0/getting_started/installation)\n\n### Clonar o projeto\n\`\`\`bash\ngit clone https://github.com/seuusuario/seuprojeto.git\ncd seuprojeto\n\`\`\`\n\n### Rodar o projeto\n\`\`\`bash\ndeno task start\n\`\`\`\n\nIsso iniciará a coleta e criará os arquivos na pasta \`data/\` e \`index.html\` na raiz.\n\n## Deploy com Deno Deploy\n\n1. Acesse [Deno Deploy](https://dash.deno.com/)\n2. Crie um novo projeto\n3. Faça upload de todos os arquivos (inclusive \`main.ts\`, \`import_map.json\`, \`deno.json\`)\n4. Configure o entrypoint como \`main.ts\`\n5. Clique em **Deploy**\n\n## Estrutura\n\n\`\`\`txt\n├── deno.json\n├── import_map.json\n├── main.ts\n├── lib\n│   ├── fetchNoticias.ts\n│   ├── fetchYoutube.ts\n│   ├── formatDate.ts\n│   └── renderFormats.ts\n└── data\n    ├── feed.json\n    ├── index.html\n    ├── rss.xml\n    └── atom.xml\n\`\`\`\n\n## Licença\n[MIT](LICENSE)" > README.md

# 6. Cria o arquivo deno.json
echo "{
  \"tasks\": {
    \"start\": \"deno run --import-map=import_map.json --allow-net --allow-write main.ts\"
  },
  \"importMap\": \"import_map.json\"
}" > deno.json

# 7. Cria o arquivo import_map.json
echo "{
  \"imports\": {
    \"deno-dom-wasm\": \"https://deno.land/x/deno_dom/deno-dom-wasm.ts\",
    \"deno-fast-xml-parser\": \"https://denopkg.com/ThauEx/deno-fast-xml-parser/mod.ts\"
  }
}" > import_map.json

# 8. Adiciona todos os arquivos e faz o primeiro commit
git add .
git commit -m "Configuração inicial do projeto com GitHub Actions e arquivos necessários"

# 9. Envia os arquivos para o repositório remoto no GitHub
git push -u origin main
