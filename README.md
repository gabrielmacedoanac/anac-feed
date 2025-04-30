# Anac Feed

Este repositório é dedicado ao desenvolvimento de agregadores de conteúdo (feed) e uma aplicação web de página única para as publicações da Agência Nacional de Aviação Civil (Anac).

## 📁 Estrutura do Projeto

- **`.github/workflows/`**: Contém configurações de integração contínua e automações via GitHub Actions.
- **`data/`**: Armazena conjuntos de dados em formatos RSS, ATOM, JSON e HTML derivados de notícias e vídeos da ANAC.
- **`src/`**: Inclui o código-fonte da aplicação, desenvolvido em TypeScript e  Deno.
- **`index.html`**: Aplicação web de página única que exibe os conteúdos agregados no feed.

## 🔍 Funcionalidades

- **Visualização de Publicações da Anac**: Apresenta informações sobre legislação, notícias e vídeos de forma interativa e acessível, para humanos e máquinas.
- **Atualizações Automatizadas**: Utiliza GitHub Actions para manter os dados sempre atualizados, garantindo informações recentes para os usuários.
- **Interface Responsiva**: Design adaptável a diferentes dispositivos, proporcionando uma experiência consistente em desktops, tablets e smartphones.

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS, TypeScript e Deno para construção da interface do usuário.
- **Automação**: GitHub Actions para integração contínua e atualização automática dos dados.
- **Dados**: Deno para construção dos feeds em formatos padronizados e abertos, usando metados FAIR, facilitando o consumo por humanos e máquinas.

## 📊 Exemplos

O repositório inclui feeds derivados de fontes oficiais da Anac:

- **Legislação**: Publicações de Atos Normativos e Legislações da Anac.
- **Notícias**: Atualizações institucionais, informativos e comunicados públicos pelo site da Anac.
- **Vídeos**: Conteúdos audiovisuais do canal oficial da Anac no YouTube.

Esses dados são formatados para fácil integração em sites, aplicativos e leitores de feed, promovendo transparência e reutilização.

## 📄 Licença

Este projeto está licenciado sob a [GNU General Public License v3.0](LICENSE), permitindo uso, modificação e distribuição conforme os termos estabelecidos.
