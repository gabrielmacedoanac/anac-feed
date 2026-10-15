import { chromium } from "npm:playwright@1.64.1";
import { ContentItem } from "../types.ts";
import { CONFIG } from "../config.ts";

interface RawNewsItem {
  title: string;
  link: string;
  dateText: string;
  description: string;
  image: string | null;
}

interface ParsedDate {
  display: string;
  iso?: string;
  dateObj?: Date;
}

function normalizeText(
  value: string | null | undefined,
): string {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePublishedDate(
  value: string,
): ParsedDate {
  const match = value.match(
    /publicado\s+(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2})h(\d{2}))?/i,
  );

  if (!match) {
    return {
      display: "ND",
    };
  }

  const [, day, month, year, hour = "00", minute = "00"] = match;

  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");
  const paddedHour = hour.padStart(2, "0");
  const paddedMinute = minute.padStart(2, "0");

  const display =
    `${paddedDay}/${paddedMonth}/${year} ${paddedHour}h${paddedMinute}`;

  const dateObj = new Date(
    `${year}-${paddedMonth}-${paddedDay}` +
      `T${paddedHour}:${paddedMinute}:00-03:00`,
  );

  if (Number.isNaN(dateObj.getTime())) {
    return {
      display,
    };
  }

  return {
    display,
    iso: dateObj.toISOString(),
    dateObj,
  };
}

function convertToContentItem(
  raw: RawNewsItem,
): ContentItem {
  const dateInfo = parsePublishedDate(
    raw.dateText,
  );

  const item: ContentItem = {
    title: normalizeText(raw.title) || "Sem título",
    link: raw.link,
    date: dateInfo.dateObj ?? dateInfo.display,
    description:
      normalizeText(raw.description) || "Sem descrição",
    image: raw.image || null,
    type: "notícia",
    display: dateInfo.display,
  };

  if (dateInfo.iso) {
    item.iso = dateInfo.iso;
  }

  if (dateInfo.dateObj) {
    item.dateObj = dateInfo.dateObj;
  }

  return item;
}

export async function fetchNoticias(): Promise<ContentItem[]> {
  let browser;

  try {
    console.log(
      `Buscando notícias com Playwright em: ${CONFIG.noticiaUrl}`,
    );

    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-background-networking",
        "--disable-default-apps",
        "--disable-extensions",
        "--disable-sync",
        "--no-first-run",
      ],
    });

    const context = await browser.newContext({
      locale: "pt-BR",
      timezoneId: "America/Sao_Paulo",
      viewport: {
        width: 1440,
        height: 1000,
      },
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/140.0.0.0 Safari/537.36",
      extraHTTPHeaders: {
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });

    const page = await context.newPage();

    page.setDefaultTimeout(90_000);
    page.setDefaultNavigationTimeout(90_000);

    /*
     * Bloqueia apenas recursos desnecessários para a extração.
     * Imagens não são baixadas, mas seus endereços continuam
     * disponíveis no DOM.
     */
    await page.route("**/*", async (route) => {
      const request = route.request();
      const resourceType = request.resourceType();
      const requestUrl = request.url().toLowerCase();

      const blockedTypes = [
        "font",
        "media",
      ];

      const blockedDomains = [
        "google-analytics.com",
        "googletagmanager.com",
        "doubleclick.net",
        "facebook.net",
        "hotjar.com",
      ];

      if (
        blockedTypes.includes(resourceType) ||
        blockedDomains.some((domain) =>
          requestUrl.includes(domain)
        )
      ) {
        await route.abort();
        return;
      }

      await route.continue();
    });

    const response = await page.goto(
      CONFIG.noticiaUrl,
      {
        waitUntil: "domcontentloaded",
        timeout: 90_000,
      },
    );

    const status = response?.status();

    console.log(
      `Status HTTP da página de notícias: ${status ?? "desconhecido"}`,
    );

    if (!response) {
      throw new Error(
        "O navegador não recebeu resposta da página de notícias.",
      );
    }

    if (status === 429) {
      throw new Error(
        "O portal retornou HTTP 429: Too Many Requests.",
      );
    }

    if (!response.ok()) {
      throw new Error(
        `HTTP ${status}: ${response.statusText()}`,
      );
    }

    await page.waitForSelector(
      "a[href*='/anac/pt-br/noticias/20']",
      {
        timeout: 30_000,
      },
    );

    await page.waitForTimeout(3_000);

    const rawItems = await page.evaluate(
      (maxNoticias): RawNewsItem[] => {
        const newsUrlPattern =
          /^https:\/\/www\.gov\.br\/anac\/pt-br\/noticias\/\d{4}\/[^/?#]+\/?$/i;

        const publishedPattern =
          /publicado\s+\d{1,2}\/\d{1,2}\/\d{4}(?:\s+\d{1,2}h\d{2})?/i;

        const normalize = (
          value: string | null | undefined,
        ): string => {
          return (value ?? "")
            .replace(/\s+/g, " ")
            .trim();
        };

        const findContainer = (
          anchor: HTMLAnchorElement,
        ): HTMLElement => {
          let current: HTMLElement | null = anchor;

          for (
            let level = 0;
            current && level < 12;
            level++
          ) {
            const text = normalize(
              current.textContent,
            );

            if (publishedPattern.test(text)) {
              return current;
            }

            current = current.parentElement;
          }

          return anchor.parentElement ?? anchor;
        };

        const extractDescription = (
          container: HTMLElement,
          title: string,
        ): string => {
          const paragraphs = Array.from(
            container.querySelectorAll("p"),
          );

          for (const paragraph of paragraphs) {
            const text = normalize(
              paragraph.textContent,
            );

            if (
              text.length >= 10 &&
              text !== title &&
              !/^tags?\s*:/i.test(text) &&
              !/^publicado\b/i.test(text) &&
              !/^notícia$/i.test(text)
            ) {
              return text;
            }
          }

          let text = normalize(
            container.textContent,
          );

          const titlePosition =
            text.indexOf(title);

          if (titlePosition >= 0) {
            text = text
              .slice(
                titlePosition + title.length,
              )
              .trim();
          }

          text = text
            .split(/\btags?\s*:/i)[0]
            .split(
              /\bpublicado\s+\d{1,2}\/\d{1,2}\/\d{4}/i,
            )[0]
            .trim();

          return normalize(text) || "Sem descrição";
        };

        const extractImage = (
          container: HTMLElement,
        ): string | null => {
          const image =
            container.querySelector("img");

          if (!image) {
            return null;
          }

          const candidates = [
            image.getAttribute("src"),
            image.getAttribute("data-src"),
            image.getAttribute("data-lazy-src"),
            image.getAttribute("data-original"),
          ];

          for (const candidate of candidates) {
            if (!candidate) {
              continue;
            }

            try {
              const url = new URL(
                candidate,
                document.baseURI,
              ).href;

              if (!url.startsWith("data:")) {
                return url;
              }
            } catch {
              // Continua para o próximo candidato.
            }
          }

          return null;
        };

        const results: RawNewsItem[] = [];
        const processedLinks = new Set<string>();

        const anchors = Array.from(
          document.querySelectorAll<HTMLAnchorElement>(
            "a[href]",
          ),
        );

        for (const anchor of anchors) {
          let link: string;

          try {
            link = new URL(
              anchor.getAttribute("href") ?? "",
              document.baseURI,
            ).href;
          } catch {
            continue;
          }

          if (!newsUrlPattern.test(link)) {
            continue;
          }

          if (processedLinks.has(link)) {
            continue;
          }

          const title = normalize(
            anchor.textContent,
          );

          /*
           * A mesma matéria pode estar vinculada pela imagem
           * e pelo título. Links sem texto são ignorados.
           */
          if (title.length < 10) {
            continue;
          }

          const container =
            findContainer(anchor);

          const containerText =
            normalize(container.textContent);

          const dateMatch =
            containerText.match(
              publishedPattern,
            );

          results.push({
            title,
            link,
            dateText:
              dateMatch?.[0] ?? "",
            description:
              extractDescription(
                container,
                title,
              ),
            image:
              extractImage(container),
          });

          processedLinks.add(link);

          if (
            results.length >= maxNoticias
          ) {
            break;
          }
        }

        return results;
      },
      CONFIG.maxNoticias,
    );

    await context.close();

    const noticias = rawItems
      .map(convertToContentItem)
      .filter((item) =>
        item.title.length > 0 &&
        item.link.length > 0
      );

    console.log(
      `${noticias.length} notícia(s) coletada(s) com Playwright.`,
    );

    for (const noticia of noticias) {
      console.log(
        `- ${noticia.display ?? "ND"} | ${noticia.title}`,
      );
    }

    return noticias;
  } catch (error) {
    console.error(
      "Erro ao buscar notícias com Playwright:",
      error,
    );

    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
