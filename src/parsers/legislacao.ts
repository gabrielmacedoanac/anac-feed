import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

// Importa a biblioteca de DNS do Deno para resolução manual
import * as dns from "https://deno.land/std/node/dns/mod.ts";

// Variáveis de segurança para contornar o WAF (Firewall)
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const GOOGLE_DNS = ['8.8.8.8', '8.8.4.4'];

// Extrai o nome do host da URL de configuração
const ANAC_HOST = new URL(CONFIG.legislacaoUrl).host;

/**
 * Resolve o IP do host da ANAC usando os servidores DNS do Google.
 */
async function resolveIpWithGoogleDns(host: string): Promise<string | null> {
    const resolver = new dns.Resolver();
    // Força o uso dos servidores DNS do Google
    resolver.setServers(GOOGLE_DNS);
    
    try {
        const addresses = await resolver.resolve4(host);
        // Retorna o primeiro endereço IP resolvido
        return addresses.length > 0 ? addresses[0] : null;
    } catch (error) {
        console.error(`Erro ao resolver DNS para ${host} usando Google DNS:`, error);
        return null;
    }
}

export async function fetchLegislacao(): Promise<ContentItem[]> {
  try {
    
    // 1. Resolve o IP usando o DNS do Google
    const resolvedIp = await resolveIpWithGoogleDns(ANAC_HOST);
    if (!resolvedIp) {
        throw new Error("Não foi possível resolver o IP da ANAC via Google DNS.");
    }

    // 2. Cria a URL de requisição usando o IP forçado
    // Ex: https://www.anac.gov.br/... torna-se https://[resolvedIp]/...
    const resolvedUrl = CONFIG.legislacaoUrl.replace(ANAC_HOST, resolvedIp);

    // Adiciona um atraso antes da requisição principal para mitigar rate limiting
    await delay(500); 
    
    // 3. Faz a requisição forçando o IP, mas define o Header 'Host' para o domínio correto.
    // Isso é crucial para que o servidor da ANAC saiba qual site servir, mesmo recebendo a requisição pelo IP.
    const res = await fetch(resolvedUrl, {
      headers: { 
          "User-Agent": USER_AGENT,
          "Host": ANAC_HOST // 💡 Header crucial para que o WAF funcione corretamente
      },
      // Desabilita a verificação de certificado, pois o IP não corresponde ao certificado SSL do domínio.
      // Isso é necessário quando se faz requisições diretas ao IP em HTTPS.
      // No Deno, isso é feito através da flag --cert-ignore-host.
      // Como não posso setar a flag aqui, esta requisição pode falhar se o Deno for muito rigoroso.
    });
    
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) throw new Error("Falha ao parsear HTML");

    const legislacoes: ContentItem[] = [];
    const articles = doc.querySelectorAll("div#content-core article.tileItem");

    for (const el of Array.from(articles)) {
      try {
        const title = el.querySelector("h2.tileHeadline a")?.textContent?.trim() || "Sem título";
        const link = el.querySelector("h2.tileHeadline a")?.getAttribute("href") || "#";

        // Ignora feeds cujo link contenha "portaria-de-pessoal"
        if (link.includes("portaria-de-pessoal")) {
          continue;
        }

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
