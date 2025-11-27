import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

// Variáveis de segurança (Mantidas para contornar o bloqueio de rede)
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// O IP da ANAC. A URL que falha é: https://www.anac.gov.br/assuntos/legislacao/ultimos-atos-publicados
// O IP do servidor é geralmente estático (obtido via Google DNS ou ping).
// Vamos usar o IP que estava falhando nas requisições anteriores: 189.84.138.176
const ANAC_IP = "189.84.138.176";
const ANAC_HOST = new URL(CONFIG.legislacaoUrl).host; // Deve ser "www.anac.gov.br"

export async function fetchLegislacao(): Promise<ContentItem[]> {
	try {
		
		// Adiciona um atraso antes da requisição principal para mitigar rate limiting
		await delay(500);	

		// 🚀 LÓGICA DE CONEXÃO E BYPASS DE REDE MANTIDA
		const process = Deno.run({
			cmd: [
				"curl",
				"-s", // Silencioso
				"-k", // Permite conexões inseguras
				"-H", `User-Agent: ${USER_AGENT}`,
				// O --resolve força o DNS a usar o IP que você especificar
				"--resolve", `${ANAC_HOST}:443:${ANAC_IP}`,	
				CONFIG.legislacaoUrl,
			],
			stdout: "piped",
			stderr: "piped",
		});

		const output = await process.output();
		const decoder = new TextDecoder();
		const html = decoder.decode(output);
		process.close();

		if (!html) {
			throw new Error("Erro ao capturar o HTML da página.");
		}

		const doc = new DOMParser().parseFromString(html, "text/html");

		if (!doc) throw new Error("Falha ao parsear HTML");

		const legislacoes: ContentItem[] = [];
		
		// 🎯 CORREÇÃO CRÍTICA DO SELETOR DE ITENS:
		// Busca por <article class="tileItem"> dentro de #content-core
		const articles = doc.querySelectorAll("#content-core article.tileItem"); 

		for (const el of Array.from(articles)) {
			try {
				
				// 🎯 CORREÇÃO DO SELETOR DE TÍTULO/LINK: Adiciona as classes para precisão
				const titleElement = el.querySelector("h2.tileHeadline a.summary.url");
				const title = titleElement?.textContent?.trim() || "Sem título";
				const link = titleElement?.getAttribute("href") || "#";

				// Ignora feeds cujo link contenha "portaria-de-pessoal"
				if (link.includes("portaria-de-pessoal")) {
					continue;
				}

				// Seletor de Descrição: Mantido, pois estava correto
				const description = el.querySelector("p.tileBody span.description")?.textContent?.trim() || "Sem descrição";

				// Extraindo a data do título, que está no formato "PORTARIA Nº XXXX, DD/MM/YYYY"
				const dateMatch = title.match(/(\d{2}\/\d{2}\/\d{4})/);
				const date = dateMatch ? dateMatch[1] : "ND";

				// Converte a data para o formato ISO (YYYY-MM-DD) se possível
				const isoDate = date !== "ND" ? date.split("/").reverse().join("-") : "ND";

				legislacoes.push({
					title,
					link,
					date: isoDate, // Usa a data no formato ISO
					description,
					image: null,
					type: "legislação"
				});

				// Para a coleta quando atingir o número máximo de legislações
				if (legislacoes.length >= CONFIG.maxLegislacao) {
					break;
				}
			} catch (e) {
				console.warn("Erro ao processar legislação:", e);
			}
		}

		return legislacoes;
	} catch (error) {
		console.error("Erro ao buscar legislações:", error);
		return [];
	}
}
